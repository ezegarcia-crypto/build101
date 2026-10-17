import { gateway } from "ai";

import { inicioDelCliente } from "@/lib/cliente";
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

export type FilaCliente = {
  id: string;
  /** Cuándo empezó (sale del id). */
  inicio: Date | null;
  total: number;
  llamadas: number;
  /** Lo que gastó en cada paso, en el orden del recorrido. */
  pasos: { paso: Paso; total: number; llamadas: number }[];
  /** Hizo la entrevista, las direcciones, la identidad y los logos. */
  completo: boolean;
};

/** Cuántos clientes se miran en detalle: uno por pedido al Gateway, así que no muchos. */
const CLIENTES_EN_DETALLE = 20;

function estadisticas(valores: number[]) {
  if (!valores.length) return null;
  const total = valores.reduce((a, b) => a + b, 0);
  return { cantidad: valores.length, promedio: total / valores.length, minimo: Math.min(...valores), maximo: Math.max(...valores) };
}

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
// La suscripción es compartida con Gary. A BrandIA le toca la voz a texto (los audios que la persona
// manda desde el chat de /crear, con Scribe) sobre el total de la cuenta. Gary no usa voz a texto.
// También cuenta el agente de voz viejo ("Conversational AI"), que se usó hasta el 17/10: era el único
// agente de la cuenta y era de BrandIA. Se lee del uso por producto, que la clave ya deja ver.

async function eleven<T>(ruta: string, clave: string): Promise<T> {
  const r = await fetch(`https://api.elevenlabs.io${ruta}`, { headers: { "xi-api-key": clave }, cache: "no-store" });
  if (!r.ok) throw new Error(`ElevenLabs respondió ${r.status} en ${ruta.split("?")[0]}`);
  return r.json() as Promise<T>;
}

/** El uso del período por producto ("STT", "TTS", "Conversational AI"…). Llega acumulado día a día: vale el último. */
async function usoPorProducto(clave: string, inicio: Date, fin: Date, metrica: "credits" | "minutes_used") {
  const { usage } = await eleven<{ usage: Record<string, (number | null)[]> }>(
    `/v1/usage/character-stats?start_unix=${inicio.getTime()}&end_unix=${fin.getTime()}&aggregation_interval=cumulative&breakdown_type=product_type&metric=${metrica}`,
    clave,
  );
  return new Map(Object.entries(usage).map(([producto, serie]) => [producto, serie.at(-1) ?? 0]));
}

export async function usoElevenLabs(inicioMes: Date, finMes = new Date()) {
  const clave = process.env.ELEVENLABS_API_KEY;
  if (!clave) return { hayClave: false as const };

  const [creditos, minutos] = await Promise.all([
    usoPorProducto(clave, inicioMes, finMes, "credits"),
    usoPorProducto(clave, inicioMes, finMes, "minutes_used"),
  ]);
  const cuenta = [...creditos.values()].reduce((a, b) => a + b, 0);
  const audios = creditos.get("STT") ?? 0;
  const agenteViejo = [...creditos].filter(([p]) => p.startsWith("Conversational AI")).reduce((a, [, c]) => a + c, 0);
  const brandia = audios + agenteViejo;

  return {
    hayClave: true as const,
    cuenta,
    brandia,
    /** Los créditos y los minutos de los audios pasados a texto. */
    audios,
    minutosAudios: minutos.get("STT") ?? 0,
    agenteViejo,
    /** La parte de la suscripción que le toca a BrandIA este mes (0 a 1). */
    parte: cuenta > 0 ? Math.min(1, brandia / cuenta) : 0,
  };
}

/** La parte de la voz que le toca a BrandIA en cada mes pedido ("2026-10" → 0 a 1). */
export async function partesDeVozPorMes(meses: string[]) {
  const ahora = new Date();
  const pares = await Promise.all(
    [...new Set(meses)].map(async (mes) => {
      const [anio, m] = mes.split("-").map(Number);
      const inicio = new Date(Date.UTC(anio, m - 1, 1));
      const fin = new Date(Math.min(Date.UTC(anio, m, 1), ahora.getTime()));
      const uso = await intentar(`ElevenLabs de ${mes}`, () => usoElevenLabs(inicio, fin));
      return [mes, uso?.hayClave ? uso.parte : 0] as const;
    }),
  );
  return new Map(pares);
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
  const entrevista = promedio("entrevista");
  const sumar = (partes: (number | null)[]) =>
    partes.every((x) => x !== null) ? partes.reduce<number>((a, b) => a + (b ?? 0), 0) : null;
  // Los nombres solo se piden si la marca no tenía nombre: suman si hay datos, pero no son obligatorios.
  const nombres = promedio("nombres") ?? 0;
  const marcaCompleta = sumar([entrevista, promedio("direcciones"), promedio("identidad"), promedio("logo")]);
  const feed = promedio("contenidos-lote");

  // Cada cliente (un navegador que empezó el recorrido) llega como etiqueta "cliente:id". Para los más
  // nuevos se pide su desglose por paso: todo lo que lleva su etiqueta, agrupado por las otras etiquetas.
  const ordenPasos = Object.keys(PASOS) as Paso[];
  const recientes = (porEtiqueta?.results ?? [])
    .filter((f) => f.tag?.startsWith("cliente:"))
    .map((f) => ({ id: (f.tag ?? "").slice("cliente:".length), total: f.totalCost, llamadas: f.requestCount ?? 0 }))
    .map((c) => ({ ...c, inicio: inicioDelCliente(c.id) }))
    .sort((a, b) => (b.inicio?.getTime() ?? 0) - (a.inicio?.getTime() ?? 0))
    .slice(0, CLIENTES_EN_DETALLE);
  const clientes: FilaCliente[] = await Promise.all(
    recientes.map(async (c) => {
      const desglose = await intentar(`el detalle del cliente ${c.id}`, () =>
        gateway.getSpendReport({ ...rango, groupBy: "tag", tags: [`cliente:${c.id}`] }),
      );
      const pasosCliente = (desglose?.results ?? [])
        .filter((f) => f.tag?.startsWith("paso:") && f.tag.slice(5) in PASOS)
        .map((f) => ({ paso: f.tag!.slice(5) as Paso, total: f.totalCost, llamadas: f.requestCount ?? 0 }))
        .sort((a, b) => ordenPasos.indexOf(a.paso) - ordenPasos.indexOf(b.paso));
      const hizo = (p: Paso) => pasosCliente.some((f) => f.paso === p);
      return {
        ...c,
        pasos: pasosCliente,
        completo: (hizo("entrevista") || hizo("voz-ficha")) && hizo("direcciones") && hizo("identidad") && hizo("logo"),
      };
    }),
  );
  const completos = clientes.filter((c) => c.completo);
  // La vista previa de cada cliente que llegó a ver las direcciones: entrevista, nombres y direcciones.
  const PREVIA: Paso[] = ["entrevista", "voz-ficha", "nombres", "direcciones"];
  const previas = clientes
    .filter((c) => c.pasos.some((f) => f.paso === "direcciones"))
    .map((c) => c.pasos.filter((f) => PREVIA.includes(f.paso)).reduce((a, f) => a + f.total, 0));

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
    clientes,
    porCliente: {
      /** Todos los clientes que se miraron, hayan llegado hasta donde hayan llegado. */
      todos: estadisticas(clientes.map((c) => c.total)),
      /** Solo los que llegaron a la marca completa (entrevista, direcciones, identidad y logos). */
      completos: estadisticas(completos.map((c) => c.total)),
      /** Lo que costó la vista previa (entrevista, nombres y direcciones) de cada uno. */
      vistaPrevia: estadisticas(previas),
      enDetalle: CLIENTES_EN_DETALLE,
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
