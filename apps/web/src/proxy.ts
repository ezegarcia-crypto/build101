import { type NextRequest, NextResponse } from "next/server";

import { COOKIE_ADMIN, leerSesion, panelesAbiertos } from "@/lib/admin/sesion";

// Los paneles /costos, /pruebas, /pedidos y /admin/cobros son solo para los administradores de BrandIA (la lista
// cerrada de la tabla `admins`): quien no entró con su mail, su contraseña y el código de Google Authenticator va a /admin.
// En la compu de cada uno (npm run dev) sin Supabase configurado, se abren igual.

export const config = { matcher: ["/costos", "/pruebas", "/pruebas/:path*", "/pedidos", "/admin/cobros"] };

export async function proxy(req: NextRequest) {
  if (panelesAbiertos()) return NextResponse.next();
  if (await leerSesion(req.cookies.get(COOKIE_ADMIN)?.value)) return NextResponse.next();
  const destino = new URL("/admin", req.url);
  destino.searchParams.set("volver", req.nextUrl.pathname);
  return NextResponse.redirect(destino);
}
