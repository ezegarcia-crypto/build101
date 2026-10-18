import { z } from "zod";

// El registro de pagos del equipo, guardado en Supabase (tabla `pagos`, ver apps/web/supabase/pagos.sql).
// Solo lo usa el servidor, con la clave de servicio: la pantalla nunca la ve. Se habla con Supabase
// por su API REST, así no hace falta instalar nada.

export const SOCIOS = ["Eze", "Juan Pedro", "Rodrigo"] as const;

export const CATEGORIAS = {
  ia: "IA (Gateway de Vercel)",
  voz: "Voz (ElevenLabs)",
  hosting: "Hosting y base de datos",
  dominio: "Dominio",
  otro: "Otro",
} as const;

export const REPARTOS = {
  todo: "Todo es de BrandIA",
  uso_voz: "Compartido con Gary, según el uso de la voz",
  porcentaje: "Un porcentaje fijo es de BrandIA",
} as const;

export const pagoSchema = z.object({
  fecha: z.iso.date(),
  quien: z.enum(SOCIOS),
  concepto: z.string().trim().min(1, "Escribí qué se pagó").max(120),
  categoria: z.enum(Object.keys(CATEGORIAS) as [keyof typeof CATEGORIAS, ...(keyof typeof CATEGORIAS)[]]),
  monto_usd: z.coerce.number().positive("El monto tiene que ser mayor a cero").max(100_000),
  reparto: z.enum(Object.keys(REPARTOS) as [keyof typeof REPARTOS, ...(keyof typeof REPARTOS)[]]),
  porcentaje: z.coerce.number().min(0).max(100).nullable(),
  nota: z.string().trim().max(300).nullable(),
});

export type PagoNuevo = z.infer<typeof pagoSchema>;
export type Pago = PagoNuevo & { id: number; creado: string };

function conexion() {
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) return null;
  return {
    url: `${url.replace(/\/$/, "")}/rest/v1/pagos`,
    headers: { apikey: clave, Authorization: `Bearer ${clave}`, "content-type": "application/json" },
  };
}

export function hayBaseDeDatos() {
  return conexion() !== null;
}

async function pedir(metodo: string, consulta: string, cuerpo?: unknown) {
  const c = conexion();
  if (!c) throw new Error("Falta conectar la base de datos (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).");
  const r = await fetch(`${c.url}${consulta}`, {
    method: metodo,
    headers: { ...c.headers, Prefer: "return=representation" },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Supabase respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

export async function listarPagos(): Promise<Pago[]> {
  const filas: (Pago & { monto_usd: string | number; porcentaje: string | number | null })[] = await pedir(
    "GET",
    "?select=*&order=fecha.desc,id.desc",
  );
  // numeric llega como texto: se pasa a número
  return filas.map((f) => ({
    ...f,
    monto_usd: Number(f.monto_usd),
    porcentaje: f.porcentaje === null ? null : Number(f.porcentaje),
  }));
}

export async function anotarPago(pago: PagoNuevo) {
  await pedir("POST", "", { ...pago, porcentaje: pago.reparto === "porcentaje" ? pago.porcentaje : null });
}

export async function borrarPago(id: number) {
  await pedir("DELETE", `?id=eq.${id}`);
}

/** Qué parte de un pago es de BrandIA (0 a 1). `partesVoz` tiene la parte de la voz por mes ("2026-10"). */
export function parteDeBrandia(p: Pago, partesVoz: Map<string, number>) {
  if (p.reparto === "todo") return 1;
  if (p.reparto === "porcentaje") return (p.porcentaje ?? 0) / 100;
  return partesVoz.get(p.fecha.slice(0, 7)) ?? 0;
}

/** Cuánto puso cada socio para BrandIA y cuánto le deben (o debe), si el gasto se reparte en tres. */
export function saldos(pagos: Pago[], partesVoz: Map<string, number>) {
  const puso = new Map<string, number>(SOCIOS.map((s) => [s, 0]));
  for (const p of pagos) puso.set(p.quien, (puso.get(p.quien) ?? 0) + p.monto_usd * parteDeBrandia(p, partesVoz));
  const total = [...puso.values()].reduce((a, b) => a + b, 0);
  const cadaUno = total / SOCIOS.length;
  return {
    total,
    cadaUno,
    socios: SOCIOS.map((s) => ({ socio: s, puso: puso.get(s) ?? 0, saldo: (puso.get(s) ?? 0) - cadaUno })),
  };
}
