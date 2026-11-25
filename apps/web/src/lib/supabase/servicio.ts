import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase con la clave de servicio: pasa por encima de la seguridad por fila. Solo en el servidor y solo para lo
// que la persona no puede escribir sola (el webhook del cobro marca la suscripción activa). Nunca va a la pantalla.

let cliente: SupabaseClient | null | undefined;

export function supabaseServicio() {
  if (cliente !== undefined) return cliente;
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cliente = url && clave ? createClient(url, clave, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return cliente;
}
