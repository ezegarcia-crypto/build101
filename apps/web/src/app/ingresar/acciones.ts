"use server";

// El ingreso a BrandIA: con un código de 6 números que llega por correo, sin contraseña.
// Esta es solo la pantalla: todavía no se manda ningún correo ni se crea la sesión.
// Quien conecte el ingreso (por ejemplo con Supabase Auth: signInWithOtp y verifyOtp) cambia solo estas
// dos funciones y saca `enConstruccion`. La pantalla (formulario.tsx) ya sabe mostrar errores y avanzar.

export type Respuesta = { ok: true; enConstruccion?: boolean } | { ok: false; error: string };

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function pedirCodigo(correo: string): Promise<Respuesta> {
  if (!CORREO.test(correo.trim())) return { ok: false, error: "Revisá el correo: parece que le falta algo." };
  return { ok: true, enConstruccion: true };
}

export async function verificarCodigo(_correo: string, codigo: string): Promise<Respuesta> {
  if (!/^\d{6}$/.test(codigo)) return { ok: false, error: "El código tiene 6 números." };
  return { ok: false, error: "El ingreso todavía se está conectando: por ahora no podemos validar el código." };
}
