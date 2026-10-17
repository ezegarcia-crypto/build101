import { gateway } from "ai";

import { MEZCLA_DEMO } from "@/lib/ia/contenidos/formatos";
import { PASOS, type Paso } from "@/lib/ia/gastos";

// Junta lo que gastamos en IA para el panel /costos. Todo sale del Gateway de Vercel (que ya
// guarda el costo de cada llamada) y, si está la clave, del uso de ElevenLabs. No se guarda nada.

const DIAS = 30;

/** Cuántas piezas trae un feed del motor (un lote). Sirve para sacar el costo por pieza. */
export const PIEZAS_POR_FEED = Object.values(MEZCLA_DEMO).reduce((a, b) => a + b, 0);

export type FilaPaso = {
  paso: Paso;
  corridas: number;
  llamadas: number;
  total: number;
  promedio: number;
  minimo: number;
  maximo: number;
  /** Cuánto gastó cada modelo dentro de este paso, de mayor a menor. */
  modelos: { modelo: string; total: number; llamadas: number }[];
};

export type ReporteGastos = Awaited<ReturnType<typeof armarReporte>>;

function fecha(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function intentar<T>(que: string, leer: () => Promise<T>): Promise<T | null> {
  try {
    return await leer();
  } catch (error) {
    console.error(`[costos] no se pudo leer ${que}:`, error);
    return null;
  }
}

// ── ElevenLabs ─────────────────────────────────────────────────────────────────────────────────
// La suscripción es compartida con Gary: a BrandIA le toca la parte que gastó su agente de voz.
// La cuenta entera se lee del uso del mes; lo de BrandIA, de las conversaciones de su agente.

async function eleven<T>(ruta: string, clave: string): Promise<T> {
  const r = await fetch(`https://api.elevenlabs.io${ruta}`, { headers: { "xi-api-key": clave }, cache: "no-store" });
  if (!r.ok) throw new Error(`ElevenLabs respondió ${r.status} en ${ruta.split("?")[0]}`);
  return r.json() as Promise<T>;
}

type Conversacion = { conversation_id: string; call_duration_secs?: number };

async function usoElevenLabs(inicioMes: Date) {
  const clave = process.env.ELEVENLABS_API_KEY;
  const agente = process.env.ELEVENLABS_AGENT_ID;
  if (!clave) return { hayClave: false as const };

  const stats = await eleven<{ usage: Record<string, number[]> }>(
    `/v1/usage/character-stats?start_unix=${inicioMes.getTime()}&end_unix=${Date.now()}&aggregation_interval=cumulative`,
    clave,
  );
  const cuenta = Object.values(stats.usage).flat().reduce((a, b) => a + b, 0);

  // Las conversaciones del agente de BrandIA en el mes (hasta 300), con el costo de cada una.
  const desde = Math.floor(inicioMes.getTime() / 1000);
  const conversaciones: Conversacion[] = [];
  let cursor: string | null = null;
  if (agente) {
    for (let pagina = 0; pagina < 3; pagina++) {
      const r: { conversations: Conversacion[]; next_cursor: string | null; has_more: boolean } = await eleven(
        `/v1/convai/conversations?agent_id=${agente}&call_start_after_unix=${desde}&page_size=100${cursor ? `&cursor=${cursor}` : ""}`,
        clave,
      );
      conversaciones.push(...r.conversations);
      if (!r.has_more || !r.next_cursor) break;
      cursor = r.next_cursor;
    }
  }
  const costos = await Promise.all(
    conversaciones.map((c) =>
      eleven<{ metadata?: { cost?: number } }>(`/v1/convai/conversations/${c.conversation_id}`, clave)
        .then((d) => d.metadata?.cost ?? 0)
        .catch(() => 0),
    ),
  );
  const brandia = costos.reduce((a, b) => a + b, 0);
  const minutos = conversaciones.reduce((a, c) => a + (c.call_duration_secs ?? 0), 0) / 60;

  return {
    hayClave: true as const,
    hayAgente: Boolean(agente),
    cuenta,
    brandia,
    conversaciones: conversaciones.length,
    minutos,
    /** La parte de la suscripción que le toca a BrandIA este mes (0 a 1). */
    parte: cuenta > 0 ? Math.min(1, brandia / cuenta) : 0,
  };
}

export async function armarReporte() {
  const hoy = new Date();
  const rango = { startDate: fecha(new Date(hoy.getTime() - (DIAS - 1) * 86_400_000)), endDate: fecha(hoy) };
  const inicioMes = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1));

  const [creditos, porDia, porModelo, porEtiqueta, porCorrida, voz] = await Promise.all([
    intentar("el saldo", () => gateway.getCredits()),
    intentar("el gasto por día", () => gateway.getSpendReport({ ...rango, groupBy: "day" })),
    intentar("el gasto por modelo", () => gateway.getSpendReport({ ...rango, groupBy: "model" })),
    intentar("el gasto por paso", () => gateway.getSpendReport({ ...rango, groupBy: "tag" })),
    intentar("el gasto por corrida", () => gateway.getSpendReport({ ...rango, groupBy: "user" })),
    intentar("ElevenLabs", () => usoElevenLabs(inicioMes)),
  ]);

  // Cada corrida llega como "paso:id" en el campo user. Se agrupan por paso para sacar el promedio.
  const corridas = new Map<Paso, number[]>();
  for (const fila of porCorrida?.results ?? []) {
    const paso = fila.user?.split(":")[0] as Paso | undefined;
    if (!paso || !(paso in PASOS)) continue;
    corridas.set(paso, [...(corridas.get(paso) ?? []), fila.totalCost]);
  }

  const etiquetas = new Map((porEtiqueta?.results ?? []).map((f) => [f.tag ?? "", f]));
  const conDatos = (Object.keys(PASOS) as Paso[]).filter(
    (paso) => etiquetas.has(`paso:${paso}`) || corridas.has(paso),
  );

  // Qué modelos usó cada paso y cuánto gastó cada uno: un reporte del Gateway por paso.
  const modelosPorPaso = new Map(
    await Promise.all(
      conDatos.map(
        async (paso) =>
          [
            paso,
            (
              await intentar(`los modelos de ${paso}`, () =>
                gateway.getSpendReport({ ...rango, groupBy: "model", tags: [`paso:${paso}`] }),
              )
            )?.results ?? [],
          ] as const,
      ),
    ),
  );

  const pasos: FilaPaso[] = conDatos.map((paso) => {
    const costos = corridas.get(paso) ?? [];
    const fila = etiquetas.get(`paso:${paso}`);
    const total = fila?.totalCost ?? costos.reduce((a, b) => a + b, 0);
    return {
      paso,
      corridas: costos.length,
      llamadas: fila?.requestCount ?? 0,
      total,
      promedio: costos.length ? total / costos.length : 0,
      minimo: costos.length ? Math.min(...costos) : 0,
      maximo: costos.length ? Math.max(...costos) : 0,
      modelos: (modelosPorPaso.get(paso) ?? [])
        .map((m) => ({ modelo: m.model ?? "otro", total: m.totalCost, llamadas: m.requestCount ?? 0 }))
        .sort((a, b) => b.total - a.total),
    };
  });

  // Lo que no tiene etiqueta: lo que se generó antes de que existiera el panel y las rutas nuevas
  // que todavía no usan etiquetar().
  const totalPeriodo = (porDia?.results ?? []).reduce((a, f) => a + f.totalCost, 0);
  const etiquetado = pasos.reduce((a, f) => a + f.total, 0);
  const sinEtiqueta = Math.max(0, totalPeriodo - etiquetado);

  const promedio = (p: Paso) => pasos.find((f) => f.paso === p && f.corridas)?.promedio ?? null;
  const entrevista = promedio("entrevista") ?? promedio("voz-ficha");
  const sumar = (partes: (number | null)[]) =>
    partes.every((x) => x !== null) ? partes.reduce<number>((a, b) => a + (b ?? 0), 0) : null;
  // Los nombres solo se piden si la marca no tenía nombre: suman si hay datos, pero no son obligatorios.
  const nombres = promedio("nombres") ?? 0;
  const marcaCompleta = sumar([entrevista, promedio("direcciones"), promedio("identidad"), promedio("logo")]);
  const feed = promedio("contenidos-lote");

  const diaHoy = (porDia?.results ?? []).find((f) => f.day === fecha(hoy));

  return {
    desde: rango.startDate,
    hasta: rango.endDate,
    leidoEl: hoy,
    saldo: creditos ? Number(creditos.balance) : null,
    gastadoTotal: creditos ? Number(creditos.totalUsed) : null,
    hoy: diaHoy ? { total: diaHoy.totalCost, llamadas: diaHoy.requestCount ?? 0 } : { total: 0, llamadas: 0 },
    totalPeriodo,
    pasos,
    sinEtiqueta,
    estimados: {
      /** Entrevista + direcciones + identidad + logos (+ nombres si los hubo), en promedio. */
      marcaCompleta: marcaCompleta === null ? null : marcaCompleta + nombres,
      /** Lo que cuesta mostrarle a alguien que todavía no pagó: entrevista, nombres y direcciones. */
      vistaPrevia: sumar([entrevista, promedio("direcciones")]) === null ? null : (entrevista ?? 0) + nombres + (promedio("direcciones") ?? 0),
      feed,
      pieza: feed === null ? null : feed / PIEZAS_POR_FEED,
    },
    modelos: [...(porModelo?.results ?? [])].sort((a, b) => b.totalCost - a.totalCost),
    dias: [...(porDia?.results ?? [])].sort((a, b) => (b.day ?? "").localeCompare(a.day ?? "")),
    voz,
    errores: [
      !creditos && "el saldo",
      !porDia && "el gasto por día",
      !porModelo && "el gasto por modelo",
      (!porEtiqueta || !porCorrida) && "el gasto por paso",
    ].filter(Boolean) as string[],
  };
}
