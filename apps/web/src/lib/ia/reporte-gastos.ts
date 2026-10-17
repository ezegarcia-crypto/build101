import { gateway } from "ai";

import { PASOS, type Paso } from "@/lib/ia/gastos";

// Junta lo que gastamos en IA para el panel /costos. Todo sale del Gateway de Vercel (que ya
// guarda el costo de cada llamada) y, si está la clave, del uso de ElevenLabs. No se guarda nada.

const DIAS = 30;

export type FilaPaso = {
  paso: Paso;
  corridas: number;
  llamadas: number;
  total: number;
  promedio: number;
  minimo: number;
  maximo: number;
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

async function usoElevenLabs() {
  const clave = process.env.ELEVENLABS_API_KEY;
  if (!clave) return { hayClave: false as const };
  const r = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
    headers: { "xi-api-key": clave },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`ElevenLabs respondió ${r.status}`);
  const s: {
    tier: string;
    character_count: number;
    character_limit: number;
    next_character_count_reset_unix?: number;
  } = await r.json();
  return {
    hayClave: true as const,
    plan: s.tier,
    usados: s.character_count,
    limite: s.character_limit,
    renueva: s.next_character_count_reset_unix ? new Date(s.next_character_count_reset_unix * 1000) : null,
  };
}

export async function armarReporte() {
  const hoy = new Date();
  const rango = { startDate: fecha(new Date(hoy.getTime() - (DIAS - 1) * 86_400_000)), endDate: fecha(hoy) };

  const [creditos, porDia, porModelo, porEtiqueta, porCorrida, voz] = await Promise.all([
    intentar("el saldo", () => gateway.getCredits()),
    intentar("el gasto por día", () => gateway.getSpendReport({ ...rango, groupBy: "day" })),
    intentar("el gasto por modelo", () => gateway.getSpendReport({ ...rango, groupBy: "model" })),
    intentar("el gasto por paso", () => gateway.getSpendReport({ ...rango, groupBy: "tag" })),
    intentar("el gasto por corrida", () => gateway.getSpendReport({ ...rango, groupBy: "user" })),
    intentar("ElevenLabs", usoElevenLabs),
  ]);

  // Cada corrida llega como "paso:id" en el campo user. Se agrupan por paso para sacar el promedio.
  const corridas = new Map<Paso, number[]>();
  for (const fila of porCorrida?.results ?? []) {
    const paso = fila.user?.split(":")[0] as Paso | undefined;
    if (!paso || !(paso in PASOS)) continue;
    corridas.set(paso, [...(corridas.get(paso) ?? []), fila.totalCost]);
  }

  const etiquetas = new Map((porEtiqueta?.results ?? []).map((f) => [f.tag ?? "", f]));
  const pasos: FilaPaso[] = (Object.keys(PASOS) as Paso[]).flatMap((paso) => {
    const costos = corridas.get(paso) ?? [];
    const fila = etiquetas.get(`paso:${paso}`);
    if (!fila && !costos.length) return [];
    const total = fila?.totalCost ?? costos.reduce((a, b) => a + b, 0);
    return [
      {
        paso,
        corridas: costos.length,
        llamadas: fila?.requestCount ?? 0,
        total,
        promedio: costos.length ? total / costos.length : 0,
        minimo: costos.length ? Math.min(...costos) : 0,
        maximo: costos.length ? Math.max(...costos) : 0,
      },
    ];
  });

  // Lo que no tiene etiqueta: lo que se generó antes de que existiera el panel y las rutas nuevas
  // que todavía no usan etiquetar().
  const totalPeriodo = (porDia?.results ?? []).reduce((a, f) => a + f.totalCost, 0);
  const etiquetado = pasos.reduce((a, f) => a + f.total, 0);
  const sinEtiqueta = Math.max(0, totalPeriodo - etiquetado);

  const promedio = (p: Paso) => pasos.find((f) => f.paso === p && f.corridas)?.promedio ?? null;
  const entrevista = promedio("entrevista") ?? promedio("voz-ficha");
  const partesMarca = [entrevista, promedio("direcciones"), promedio("identidad"), promedio("logo")];
  const marcaCompleta = partesMarca.every((x) => x !== null)
    ? partesMarca.reduce<number>((a, b) => a + (b ?? 0), 0)
    : null;

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
    estimados: { marcaCompleta, feed: promedio("contenidos-lote") },
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
