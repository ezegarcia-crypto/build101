import { supabaseServidor } from "@/lib/supabase/servidor";

// Quién es la persona del pedido y si tiene el plan mensual pago. Solo en el servidor (rutas de /api y páginas):
// lee la sesión de las cookies que deja el navegador al entrar en /crear/cuenta. Las suscripciones las escribe
// solo el webhook del cobro (tabla `suscripciones`, ver apps/web/supabase/cuentas.sql); la persona puede leer
// las suyas y nada más, así que acá se consultan con su propia sesión.

export type Usuario = { id: string; mail: string | null };

export type Suscripcion = {
  id: string;
  plan: "marca" | "mensual";
  estado: "activa";
  /** Hasta cuándo está pago (el próximo cobro). Null en una compra única: no vence */
  hasta: string | null;
  prueba: boolean;
};

/** La persona que hizo el pedido, o null si no entró a su cuenta. */
export async function usuarioActual(): Promise<Usuario | null> {
  const supabase = await supabaseServidor();
  if (!supabase) return null;
  // getUser (y no getSession) le pregunta a Supabase si la sesión es válida: una cookie inventada no pasa
  const { data } = await supabase.auth.getUser();
  return data.user ? { id: data.user.id, mail: data.user.email ?? null } : null;
}

// Días de gracia después del vencimiento: Mercado Pago a veces reintenta el cobro del mes un par de días después
const GRACIA_MS = 3 * 86_400_000;

async function activas(planes: Suscripcion["plan"][]) {
  const supabase = await supabaseServidor();
  if (!supabase) return [];
  const { data: usuario } = await supabase.auth.getUser();
  if (!usuario.user) return [];
  const { data, error } = await supabase
    .from("suscripciones")
    .select("id, plan, estado, hasta, prueba")
    .eq("usuario", usuario.user.id)
    .in("estado", ["activa", "cancelada"])
    .in("plan", planes)
    .order("creado", { ascending: false });
  if (error) {
    console.error("[suscripcion] no se pudo leer:", error.message);
    return [];
  }
  const ahora = Date.now();
  return (data as (Omit<Suscripcion, "estado"> & { estado: string })[])
    .filter((s) =>
      s.estado === "activa"
        ? !s.hasta || new Date(s.hasta).getTime() + GRACIA_MS > ahora
        : // Si la canceló, el plan sigue andando hasta el final del mes que ya pagó
          Boolean(s.hasta) && new Date(s.hasta as string).getTime() > ahora,
    )
    .map((s) => ({ ...s, estado: "activa" as const }));
}

/** La suscripción mensual ("Tu marca andando") activa de quien hizo el pedido, o null si no tiene. */
export async function suscripcionActiva(): Promise<Suscripcion | null> {
  return (await activas(["mensual"]))[0] ?? null;
}

/** Si quien hizo el pedido tiene el plan mensual activo. */
export async function tieneSuscripcion() {
  return (await suscripcionActiva()) !== null;
}

/** Si quien hizo el pedido compró su marca ("Tu marca", pago único) o la tiene incluida en el plan mensual. */
export async function comproLaMarca() {
  return (await activas(["marca", "mensual"])).length > 0;
}
