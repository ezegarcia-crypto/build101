import { type NextRequest, NextResponse } from "next/server";

import { destinoSeguro } from "@/lib/destino";
import { supabaseServidor } from "@/lib/supabase/servidor";

// La vuelta después de entrar con Google o con el enlace del mail: Supabase manda acá con un código de un solo uso,
// se cambia por la sesión (queda en cookies) y se lleva a la persona a donde estaba. No usa IA.

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const destino = new URL(destinoSeguro(url.searchParams.get("volver")), url.origin);
  const supabase = await supabaseServidor();
  if (!supabase) return NextResponse.redirect(new URL("/crear/cuenta?error=sin-cuentas", url.origin));

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" })
      : { error: new Error("Falta el código") };

  if (error) {
    console.error("[cuenta] no se pudo entrar:", error.message);
    return NextResponse.redirect(new URL("/crear/cuenta?error=enlace", url.origin));
  }
  return NextResponse.redirect(destino);
}
