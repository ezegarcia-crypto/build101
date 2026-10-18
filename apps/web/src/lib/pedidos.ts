import { z } from "zod";

// Los pedidos de BranderIA, guardados en Supabase (tabla `pedidos_branderia`, ver apps/web/supabase/pedidos-branderia.sql).
// Todavía no se cobra: la persona arma su kit y deja sus datos; el equipo ve el pedido en /pedidos, le pasa la
// cotización por WhatsApp y lo produce. Solo el servidor habla con Supabase, con la clave de servicio, como lib/pagos.ts.

/** Los estados de un pedido, en orden. El primero es el que tiene apenas llega. */
export const ESTADOS = {
  recibido: "Recibido",
  cotizado: "Cotizado",
  "en-produccion": "En producción",
  enviado: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
} as const;

export type Estado = keyof typeof ESTADOS;

const itemSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  detalle: z.string().trim().max(200).default(""),
  tecnica: z.string().trim().max(60).default(""),
  estampa: z.string().trim().max(30).default(""),
  cantidad: z.number().int().positive().max(10_000),
});

export const pedidoSchema = z.object({
  nombre: z.string().trim().min(1, "Contanos tu nombre").max(80),
  contacto: z
    .string()
    .trim()
    .min(6, "Dejanos un WhatsApp o un mail")
    .max(120)
    .refine((v) => /^\S+@\S+\.\S+$/.test(v) || /^\+?[\d\s()-]{6,}$/.test(v), "Dejanos un WhatsApp o un mail"),
  entrega: z.string().trim().min(2, "Decinos a dónde te lo mandamos").max(200),
  nota: z.string().trim().max(500).optional(),
  marca: z.string().trim().min(1).max(80),
  colores: z.array(z.string().regex(/^#[0-9a-f]{3,8}$/i)).max(10).default([]),
  items: z.array(itemSchema).min(1, "Tu kit está vacío").max(40),
});

export type PedidoNuevo = z.infer<typeof pedidoSchema>;
export type Pedido = PedidoNuevo & { id: number; creado: string; estado: Estado; unidades: number; cliente: string | null };

/** El número que ve la persona: BR-0012 */
export const numeroDe = (id: number) => `BR-${String(id).padStart(4, "0")}`;

function conexion() {
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) return null;
  return {
    url: `${url.replace(/\/$/, "")}/rest/v1/pedidos_branderia`,
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

/** Guarda el pedido y devuelve su número. */
export async function guardarPedido(datos: PedidoNuevo, cliente?: string) {
  const unidades = datos.items.reduce((t, i) => t + i.cantidad, 0);
  const [fila] = (await pedir("POST", "", {
    ...datos,
    nota: datos.nota || null,
    unidades,
    cliente: cliente ?? null,
  })) as { id: number; creado: string }[];
  return { id: fila.id, numero: numeroDe(fila.id), creado: fila.creado };
}

/** Los últimos pedidos, del más nuevo al más viejo. */
export async function listarPedidos(cuantos = 100): Promise<Pedido[]> {
  return pedir("GET", `?select=*&order=creado.desc&limit=${cuantos}`);
}

/** Cambia el estado de un pedido (lo usa el panel del equipo). */
export async function cambiarEstado(id: number, estado: Estado) {
  await pedir("PATCH", `?id=eq.${id}`, { estado });
}
