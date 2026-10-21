"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Supabase desde la pantalla, con la sesión de la persona (cuentas, sus marcas). Usa la clave pública: lo que puede
// ver cada uno lo decide la seguridad por fila de la base (apps/web/supabase/cuentas.sql), no esta clave.
// La sesión queda en cookies, así el servidor también sabe quién es (lib/supabase/servidor.ts).

let cliente: SupabaseClient | null | undefined;

/** El cliente de Supabase del navegador, o null si faltan las variables (la app sigue andando sin cuentas). */
export function supabaseNavegador() {
  if (cliente !== undefined) return cliente;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  cliente = url && clave ? createBrowserClient(url, clave) : null;
  return cliente;
}
