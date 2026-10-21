"use server";

import { headers } from "next/headers";

import { destinoSeguro } from "@/lib/destino";
import { supabaseServidor } from "@/lib/supabase/servidor";

// El ingreso a BrandIA, sin contraseña, con Supabase Auth: se manda un correo para entrar y la sesión queda en
// cookies (la leen la pantalla y el servidor). El correo trae un enlace (la vuelta es /crear/cuenta/entrar) y,
// cuando Supabase tenga el servidor de correo propio con la plantilla de BrandIA, también el código (6 u 8 números).
// Corre en el servidor (server actions), en la misma pestaña: la marca que la persona armó ahí no se pierde.

export type Respuesta = { ok: true; enConstruccion?: boolean } | { ok: false; error: string };

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function pedirCodigo(correo: string, volver?: string | null): Promise<Respuesta> {
  if (!CORREO.test(correo.trim())) return { ok: false, error: "Revisá el correo: parece que le falta algo." };
  const supabase = await supabaseServidor();
  if (!supabase) return { ok: false, error: "El ingreso todavía no está conectado en esta versión de BrandIA." };
  const pedido = await headers();
  const origen = pedido.get("origin") ?? `https://${pedido.get("host") ?? "app.brandiamos.com"}`;
  const { error } = await supabase.auth.signInWithOtp({
    email: correo.trim(),
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origen}/crear/cuenta/entrar?volver=${encodeURIComponent(destinoSeguro(volver))}`,
    },
  });
  if (error) {
    console.error("[ingreso] no se pudo mandar el correo:", error.status, error.message);
    return {
      ok: false,
      error:
        error.status === 429
          ? "Pediste muchos códigos seguidos. Esperá unos minutos y probá de nuevo."
          : "No pudimos mandarte el correo. Probá de nuevo en un rato.",
    };
  }
  return { ok: true };
}

export async function verificarCodigo(correo: string, codigo: string): Promise<Respuesta> {
  // Supabase manda códigos de 6 u 8 números, según cómo esté configurado el proyecto
  if (!/^\d{6,8}$/.test(codigo)) return { ok: false, error: "Revisá el código: son solo números." };
  const supabase = await supabaseServidor();
  if (!supabase) return { ok: false, error: "El ingreso todavía no está conectado en esta versión de BrandIA." };
  const { error } = await supabase.auth.verifyOtp({ email: correo.trim(), token: codigo, type: "email" });
  if (error) return { ok: false, error: "Ese código no es o ya venció. Fijate el último correo que te mandamos." };
  return { ok: true };
}
