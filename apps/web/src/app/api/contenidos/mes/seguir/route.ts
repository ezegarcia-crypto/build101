import { entradaSeguirMes, leer } from "@/app/api/contenidos/entrada";
import { leerMes } from "@/lib/feed-mensual";
import { fijarCorrida, medir } from "@/lib/ia/gastos";
import { tieneSuscripcion } from "@/lib/suscripcion";

import { correrDespues, hayParaReintentar, INTENTOS_SEMANA, proximaSemana, tomar } from "../trabajo";

// Sigue armando el mes del suscriptor: la semana que falta. Lo llama el propio servidor al terminar cada semana
// (con las cookies de la persona) y la pantalla, solo si el mes quedó trabado. Con `reintentar`, vuelve a pedir
// lo que no salió en las semanas ya armadas (un toque de la persona). Ver app/api/contenidos/mes/route.ts.
// POST { id, reintentar? } → 202 { ok: true }, o 409 con el motivo si no hay nada que hacer.

export const maxDuration = 300;

export const POST = medir("contenidos-mes", async (req: Request) => {
  if (!(await tieneSuscripcion())) {
    return Response.json({ error: "El mes completo es parte del plan Tu marca andando.", plan: "mensual" }, { status: 403 });
  }
  const entrada = await leer(req, entradaSeguirMes);
  if (entrada instanceof Response) return entrada;

  const mes = await leerMes(entrada.id).catch(() => null);
  if (!mes) return Response.json({ error: "No encontramos ese mes." }, { status: 404 });
  fijarCorrida(mes.id);

  const s = proximaSemana(mes);
  // Si falta una semana, eso va primero (aunque la persona haya tocado "reintentar")
  const que =
    s && s.intentos < INTENTOS_SEMANA
      ? ({ que: "semana", semana: s.semana } as const)
      : !s && entrada.reintentar && hayParaReintentar(mes)
        ? ({ que: "reintento" } as const)
        : null;
  if (!que) return Response.json({ error: s ? "Ya probamos varias veces armar esta semana." : "No queda nada por armar." }, { status: 409 });

  const tomado = await tomar(mes, que);
  if (typeof tomado === "string") return Response.json({ error: tomado }, { status: 409 });
  correrDespues(tomado, que, req);
  return Response.json({ ok: true }, { status: 202 });
});
