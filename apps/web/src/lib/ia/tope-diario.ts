import { gateway } from "ai";

// El tope diario de gasto en IA: si en el día ya se gastó más que esto en el Gateway de Vercel, la app deja de
// llamar a la IA y le avisa a la persona que vuelva mañana. Es la red de seguridad de la beta abierta: no depende
// de cada navegador. Al equipo no lo frena (lib/equipo.ts). El gasto se lee del Gateway como mucho una vez por
// minuto; si no se puede leer, se deja pasar (mejor no cortar la demo por un error al leer el gasto).

export const TOPE_DIARIO_USD = 30;

const CADA = 60_000;
let leido: { dia: string; total: number; cuando: number } | null = null;

const hoy = () => new Date().toISOString().slice(0, 10);

async function gastoDeHoy() {
  const dia = hoy();
  if (leido && leido.dia === dia && Date.now() - leido.cuando < CADA) return leido.total;
  try {
    const reporte = await gateway.getSpendReport({ startDate: dia, endDate: dia, groupBy: "day" });
    const total = (reporte.results ?? []).reduce((a, f) => a + (f.totalCost ?? 0), 0);
    leido = { dia, total, cuando: Date.now() };
    return total;
  } catch (error) {
    console.error("[tope-diario] no se pudo leer el gasto de hoy", error);
    return 0;
  }
}

/** Si hoy ya se pasó el tope. */
export async function pasadoDelTope() {
  return (await gastoDeHoy()) >= TOPE_DIARIO_USD;
}
