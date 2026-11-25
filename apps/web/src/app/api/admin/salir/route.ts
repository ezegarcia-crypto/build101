import { NextResponse } from "next/server";

import { COOKIE_ADMIN } from "@/lib/admin/sesion";

// POST /api/admin/salir · borra la sesión de administrador. El navegador sigue siendo del equipo (sin límite de pruebas).

export function POST() {
  const r = NextResponse.json({ ok: true });
  r.cookies.delete(COOKIE_ADMIN);
  return r;
}
