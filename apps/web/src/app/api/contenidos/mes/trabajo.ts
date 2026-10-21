import { after } from "next/server";

import { HEADER_CLIENTE } from "@/lib/cliente";
import { guardarMes, leerMes, type Mes, trabajando } from "@/lib/feed-mensual";
import { armarSemana, MAX_INTENTOS, reintentarFallas } from "@/lib/ia/contenidos/mes";
import { enSegundoPlano } from "@/lib/ia/gastos";
import { grabarPrueba } from "@/lib/pruebas";

// Quién arma el mes y cuándo. Un solo servidor a la vez por mes (`mes.trabajo`): toma el trabajo, responde
// enseguida y sigue con `after`, sin la señal del pedido (cerrar la pestaña no lo corta). Al terminar una semana,
// él mismo pide la siguiente con las cookies de la persona (las mismas que mira tieneSuscripcion()).
// Si un servidor se cae a la mitad, la pantalla lo nota (GET dice `trabado`) y pide seguir: se retoma lo que falta.
// Topes contra loops: cada semana se empieza como mucho 3 veces, y cada pieza o foto se pide como mucho 6.

export const INTENTOS_SEMANA = 3;

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** La semana que sigue: la primera que no está lista */
export const proximaSemana = (mes: Mes) => mes.semanas.find((s) => s.estado !== "lista");

/** Lo que todavía se puede reintentar en las semanas ya armadas */
export function hayParaReintentar(mes: Mes) {
  return Object.entries(mes.fallas).some(([k, f]) => k !== "plan" && f.intentos < MAX_INTENTOS);
}

/** Si el mes quedó a medias sin nadie que lo arme (se cayó el servidor o no se encadenó la semana siguiente) */
export function trabado(mes: Mes, ahora = Date.now()) {
  if (trabajando(mes, ahora)) return false;
  const s = proximaSemana(mes);
  if (!s || s.estado === "fallo" || s.intentos >= INTENTOS_SEMANA) return false;
  return mes.trabajo !== null || ahora - Date.parse(mes.actualizado) > 30_000;
}

/** Si ya no va a cambiar solo: nadie lo arma y no queda una semana que se pueda seguir (o están todas) */
export function terminado(mes: Mes, ahora = Date.now()) {
  if (trabajando(mes, ahora)) return false;
  const s = proximaSemana(mes);
  return !s || s.estado === "fallo" || s.intentos >= INTENTOS_SEMANA;
}

type Que = { que: "semana"; semana: number } | { que: "reintento" };

/**
 * Toma el trabajo del mes, o devuelve por qué no. Lo deja escrito, espera un poco y vuelve a leer:
 * si otro servidor lo tomó al mismo tiempo, gana el que quedó escrito y este no hace nada.
 */
export async function tomar(mes: Mes, que: Que): Promise<Mes | string> {
  if (trabajando(mes)) return "Tu mes ya se está armando.";
  const dueno = crypto.randomUUID();
  const desde = new Date().toISOString();
  mes.trabajo = { dueno, desde, ...que };
  if (que.que === "semana") {
    const s = mes.semanas.find((x) => x.semana === que.semana)!;
    if (s.intentos >= INTENTOS_SEMANA) return "Ya probamos varias veces armar esta semana.";
    s.estado = "generando";
    s.intentos++;
    s.inicio = desde;
    if (s.semana === 1 && !mes.plan) delete mes.fallas.plan;
  }
  await guardarMes(mes);
  await esperar(1200);
  const leido = await leerMes(mes.id);
  if (leido?.trabajo?.dueno !== dueno) return "Tu mes ya se está armando.";
  return mes;
}

/** Arma lo tomado después de responder y, si fue una semana, encadena la siguiente. */
export function correrDespues(mes: Mes, que: Que, req: Request) {
  const origen = new URL(req.url).origin;
  const cookie = req.headers.get("cookie");
  const cliente = req.headers.get(HEADER_CLIENTE);
  const inicio = Date.now();

  after(
    enSegundoPlano(async () => {
      try {
        if (que.que === "semana") await armarSemana(mes, que.semana);
        else await reintentarFallas(mes);
      } catch (e) {
        console.warn("[mes] se cortó", mes.id, e);
        mes.trabajo = null;
        await guardarMes(mes).catch(() => {});
        return;
      }

      // Para el panel /pruebas: lo que salió en esta vuelta (las fotos ya son links)
      const ids = new Set(
        (mes.plan?.piezas ?? []).filter((p) => que.que === "reintento" || p.semana === que.semana).map((p) => p.id),
      );
      await grabarPrueba({
        paso: "contenidos-mes",
        corrida: mes.id,
        cliente: mes.cliente,
        inicio,
        salida: Response.json({
          mes: mes.id,
          que,
          plan: que.que === "semana" && que.semana === 1 ? mes.plan : undefined,
          piezas: Object.values(mes.piezas).filter((p) => ids.has(p.id)),
          imagenes: Object.fromEntries(Object.entries(mes.imagenes).filter(([id]) => ids.has(id))),
          fallas: mes.fallas,
          semanas: mes.semanas,
          uso: mes.uso,
        }),
      });

      if (que.que !== "semana") return;
      const siguiente = proximaSemana(mes);
      if (!siguiente || siguiente.estado !== "pendiente" || siguiente.semana !== que.semana + 1) return;
      try {
        const r = await fetch(`${origen}/api/contenidos/mes/seguir`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(cookie ? { cookie } : {}),
            ...(cliente ? { [HEADER_CLIENTE]: cliente } : {}),
          },
          body: JSON.stringify({ id: mes.id }),
          signal: AbortSignal.timeout(30_000),
        });
        if (!r.ok) console.warn("[mes] no se encadenó la semana", siguiente.semana, r.status, (await r.text()).slice(0, 200));
      } catch (e) {
        // La pantalla lo va a ver trabado y lo pide ella
        console.warn("[mes] no se encadenó la semana", siguiente.semana, e);
      }
    }),
  );
}
