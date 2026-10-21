import { generateText, Output } from "ai";

import type { Brief } from "@/lib/ia/brief";
import { type ItemPlan, type Plan, planMesSchema } from "@/lib/ia/contenidos/esquemas";
import { MEZCLA_MES, SEMANAS_MES } from "@/lib/ia/contenidos/formatos";
import { generarImagen } from "@/lib/ia/contenidos/imagen";
import type { Kit } from "@/lib/ia/contenidos/kit";
import { redactar, type Uso } from "@/lib/ia/contenidos/motor";
import { type Gusto, MODELO_PLAN, promptPlanificador } from "@/lib/ia/contenidos/prompts";
import { etiquetar } from "@/lib/ia/gastos";
import { guardarMes, type Mes, subirFoto } from "@/lib/feed-mensual";

// El mes completo del suscriptor ("Tu marca andando"): el plan de cuatro semanas y todas sus piezas, con el
// mismo motor del lote (redactar + control de datos inventados + imágenes con la marca). Se arma de a una
// semana por pedido: la primera planifica el mes entero y cada semana termina encadenando la siguiente
// (app/api/contenidos/mes). Todo se va guardando en Supabase (lib/feed-mensual.ts) apenas está, así la
// pantalla lo muestra de a poco y nada se pierde si la persona cierra la pestaña.
//
// Sin loops: cada pieza y cada foto se intentan dos veces seguidas y, si no salen, quedan marcadas en `fallas`.
// "Reintentar lo que no salió" las vuelve a pedir (otras dos veces) por toque, hasta 6 intentos en total por cosa:
// o sea, dos toques como mucho. Lo que sigue sin salir queda marcado para siempre.

export const MAX_INTENTOS = 6;

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const mensaje = (e: unknown) => String((e as Error)?.message ?? e).slice(0, 300);

/** Dos intentos seguidos, con una pausa entre los dos (la IA a veces devuelve algo que no respeta el formato) */
async function dosVeces<T>(llamada: () => Promise<T>): Promise<T> {
  try {
    return await llamada();
  } catch {
    await esperar(2500);
    return llamada();
  }
}

const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"] as const;

/** Las fechas del mes en palabras, para el planificador ("lunes 26 de octubre") */
function fechasDelMes(inicio: string) {
  const [a, m, d] = inicio.split("-").map(Number);
  const desde = new Date(Date.UTC(a!, m! - 1, d!));
  const hasta = new Date(desde.getTime() + (SEMANAS_MES * 7 - 1) * 86_400_000);
  const texto = (f: Date) => f.toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  return { desde: texto(desde), hasta: texto(hasta) };
}

/** Deja el plan en orden: semanas de 1 a 4, ordenadas por día y hora, con ids p1, p2… sin repetir */
function ordenar(plan: Plan): Plan {
  const piezas = plan.piezas
    .map((p) => ({ ...p, semana: Math.min(SEMANAS_MES, Math.max(1, Math.round(Number(p.semana) || 1))) }))
    .sort((x, y) => x.semana - y.semana || DIAS.indexOf(x.dia) - DIAS.indexOf(y.dia) || x.hora.localeCompare(y.hora))
    .map((p, i) => ({ ...p, id: `p${i + 1}` }));
  return { ...plan, piezas };
}

export async function planificarMes(o: { kit: Kit; brief: Brief; gustaron?: Gusto[]; inicio: string }) {
  const r = await generateText({
    model: MODELO_PLAN,
    providerOptions: etiquetar(),
    output: Output.object({ schema: planMesSchema }),
    prompt: promptPlanificador(o.kit, o.brief, MEZCLA_MES, o.gustaron, { semanas: SEMANAS_MES, ...fechasDelMes(o.inicio) }),
  });
  const costo = Number((r.providerMetadata as { gateway?: { cost?: string | number } } | undefined)?.gateway?.cost ?? 0);
  const uso: Uso = { entrada: r.usage.inputTokens ?? 0, salida: r.usage.outputTokens ?? 0, usd: Number.isFinite(costo) ? costo : 0 };
  return { plan: ordenar(r.output), uso };
}

/**
 * Lleva los cambios del mes a Supabase sin pisarse: un guardado a la vez, como mucho cada 1,5 s, y una señal
 * de vida cada 20 s mientras trabaja (si se corta, otro servidor ve que está caído y lo retoma).
 */
export function guardador(mes: Mes) {
  let sucio = false;
  let enCurso: Promise<void> | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const escribir = async () => {
    timer = null;
    if (enCurso) await enCurso;
    if (!sucio) return;
    sucio = false;
    enCurso = guardarMes(mes)
      .catch((e) => console.warn("[mes] no se pudo guardar", mes.id, mensaje(e)))
      .finally(() => (enCurso = null));
    await enCurso;
  };

  const latido = setInterval(() => ((sucio = true), void escribir()), 20_000);

  return {
    cambio() {
      sucio = true;
      timer ??= setTimeout(escribir, 1500);
    },
    async cerrar() {
      clearInterval(latido);
      if (timer) clearTimeout(timer);
      sucio = true;
      await escribir();
    },
  };
}

function sumar(mes: Mes, semana: number | undefined, usd: number, uso?: Uso) {
  mes.uso.usd += usd;
  if (uso) {
    mes.uso.entrada += uso.entrada;
    mes.uso.salida += uso.salida;
  }
  const s = semana ? mes.semanas.find((x) => x.semana === semana) : undefined;
  if (s) s.usd += usd;
}

function fallar(mes: Mes, donde: string, e: unknown, intentos: number) {
  mes.fallas[donde] = { mensaje: mensaje(e), intentos: (mes.fallas[donde]?.intentos ?? 0) + intentos };
}

/** Las piezas que faltan de esta lista y las fotos que les faltan. Sigue aunque una falle. */
async function hacerPiezas(mes: Mes, items: ItemPlan[], cambio: () => void, semana?: number) {
  const plan = mes.plan!;
  const base = { kit: mes.kit, brief: mes.entrada.brief, plan };

  await Promise.all(
    items.map(async (item) => {
      let pieza = mes.piezas[item.id];
      if (!pieza) {
        if ((mes.fallas[item.id]?.intentos ?? 0) >= MAX_INTENTOS) return;
        try {
          const r = await dosVeces(() => redactar({ ...base, item }));
          pieza = r.pieza;
          mes.piezas[item.id] = pieza;
          delete mes.fallas[item.id];
          sumar(mes, semana, r.uso.usd, r.uso);
          cambio();
        } catch (e) {
          fallar(mes, item.id, e, 2);
          cambio();
          return;
        }
      }

      const hechas = mes.imagenes[item.id] ?? {};
      await Promise.all(
        pieza.imagenes
          .filter((p) => !hechas[p.clave] && (mes.fallas[`${item.id}/${p.clave}`]?.intentos ?? 0) < MAX_INTENTOS)
          .map(async (pedido) => {
            const donde = `${item.id}/${pedido.clave}`;
            try {
              const img = await dosVeces(() => generarImagen(pedido));
              const url = await subirFoto(mes.id, `${item.id}-${pedido.clave}`, img.url);
              mes.imagenes[item.id] = { ...mes.imagenes[item.id], [pedido.clave]: url };
              mes.fotos_hechas++;
              delete mes.fallas[donde];
              sumar(mes, semana, img.usd);
            } catch (e) {
              fallar(mes, donde, e, 2);
            }
            cambio();
          }),
      );
    }),
  );
}

/** Arma una semana del mes (la primera, además, planifica el mes entero). */
export async function armarSemana(mes: Mes, semana: number) {
  const g = guardador(mes);
  const s = mes.semanas.find((x) => x.semana === semana)!;
  try {
    if (!mes.plan) {
      try {
        const { plan, uso } = await dosVeces(() =>
          planificarMes({ kit: mes.kit, brief: mes.entrada.brief, gustaron: mes.entrada.gustaron, inicio: mes.inicio }),
        );
        mes.plan = plan;
        delete mes.fallas.plan;
        sumar(mes, semana, uso.usd, uso);
        g.cambio();
      } catch (e) {
        fallar(mes, "plan", e, 2);
        s.estado = "fallo";
        return;
      }
    }
    await hacerPiezas(mes, mes.plan.piezas.filter((p) => p.semana === semana), g.cambio, semana);
    s.estado = "lista";
  } finally {
    s.fin = new Date().toISOString();
    mes.trabajo = null;
    await g.cerrar();
  }
}

/** Vuelve a pedir, una vez, lo que no salió en las semanas ya armadas. */
export async function reintentarFallas(mes: Mes) {
  const g = guardador(mes);
  try {
    const listas = new Set(mes.semanas.filter((s) => s.estado === "lista").map((s) => s.semana));
    const items = (mes.plan?.piezas ?? []).filter((p) => listas.has(p.semana ?? 1));
    await hacerPiezas(mes, items, g.cambio);
  } finally {
    mes.trabajo = null;
    await g.cerrar();
  }
}
