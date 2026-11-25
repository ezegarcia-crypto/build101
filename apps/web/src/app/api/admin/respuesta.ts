import { NextResponse } from "next/server";

import { COOKIE_ADMIN, DURACION_SESION, firmarSesion } from "@/lib/admin/sesion";
import { COOKIE_EQUIPO, huellaDelEquipo } from "@/lib/equipo";

// La respuesta de un ingreso que salió bien: deja la sesión de administrador (12 horas) y, como antes, marca el
// navegador como del equipo (sin límite de pruebas ni tope diario, ver lib/equipo.ts).

export async function respuestaConSesion(mail: string, nombre: string) {
  const sesion = await firmarSesion(mail, nombre);
  if (!sesion) return NextResponse.json({ error: "Falta configurar la base de datos." }, { status: 503 });
  const r = NextResponse.json({ ok: true, nombre });
  const seguro = process.env.NODE_ENV !== "development";
  r.cookies.set(COOKIE_ADMIN, sesion, { httpOnly: true, secure: seguro, sameSite: "strict", path: "/", maxAge: DURACION_SESION });
  const huella = await huellaDelEquipo();
  if (huella) {
    r.cookies.set(COOKIE_EQUIPO, huella, { httpOnly: true, secure: seguro, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return r;
}

export const error = (mensaje: string, status = 400) => NextResponse.json({ error: mensaje }, { status });

/** Lee el cuerpo JSON sin romperse si viene mal. */
export async function cuerpo(req: Request): Promise<Record<string, unknown>> {
  try {
    const datos = await req.json();
    return datos && typeof datos === "object" ? datos : {};
  } catch {
    return {};
  }
}
