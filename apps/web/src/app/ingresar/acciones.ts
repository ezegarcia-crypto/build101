"use server";

import { mandarCodigo, validarCodigo } from "@/lib/sesion";

// El ingreso a BrandIA: con un código de 6 números que llega por correo, sin contraseña.
// Lo resuelve Supabase Auth (lib/sesion.ts): pedirCodigo manda el correo y verificarCodigo abre la sesión.
// La pantalla (formulario.tsx) muestra los errores y, si sale bien, lleva a /crear.
// Si alguna vez hay que volver a mostrar el aviso "En construcción", pedirCodigo devuelve `enConstruccion: true`.

export type Respuesta = { ok: true; enConstruccion?: boolean } | { ok: false; error: string };

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const limpiar = (correo: string) => correo.trim().toLowerCase();

export async function pedirCodigo(correo: string): Promise<Respuesta> {
  if (!CORREO.test(correo.trim())) return { ok: false, error: "Revisá el correo: parece que le falta algo." };
  return mandarCodigo(limpiar(correo));
}

export async function verificarCodigo(correo: string, codigo: string): Promise<Respuesta> {
  if (!CORREO.test(correo.trim())) return { ok: false, error: "Revisá el correo: parece que le falta algo." };
  if (!/^\d{6}$/.test(codigo)) return { ok: false, error: "El código tiene 6 números." };
  return validarCodigo(limpiar(correo), codigo);
}
