import { type NextRequest, NextResponse } from "next/server";

import { revisarClave } from "@/lib/clave-costos";
import { COOKIE_EQUIPO, huellaDelEquipo } from "@/lib/equipo";

// Los paneles /costos, /pruebas y /pedidos son solo para el equipo: el navegador pide una contraseña antes de mostrarlos.
// La contraseña es la variable de entorno COSTOS_CLAVE (en Vercel y, si querés, en apps/web/.env.local).
// El usuario puede ser cualquiera. Sin la variable, en la web publicada el panel no se abre;
// en la compu de cada uno (npm run dev) se abre igual.

export const config = { matcher: ["/costos", "/pruebas", "/pruebas/:path*", "/pedidos"] };

export async function proxy(req: NextRequest) {
  const estado = revisarClave(req.headers.get("authorization"));
  if (estado === "ok" || estado === "abierto") {
    const respuesta = NextResponse.next();
    // Entrar a /costos con la contraseña deja este navegador como del equipo: sin límite de pruebas ni tope
    // diario (lib/equipo.ts). La cookie lleva una huella de la contraseña, no la contraseña.
    const huella = await huellaDelEquipo();
    if (huella && req.nextUrl.pathname === "/costos") {
      respuesta.cookies.set(COOKIE_EQUIPO, huella, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return respuesta;
  }
  if (estado === "sin-configurar") {
    return new NextResponse("El panel todavía no tiene contraseña configurada (COSTOS_CLAVE).", {
      status: 503,
    });
  }
  return new NextResponse("Este panel es solo para el equipo de BrandIA.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Costos BrandIA", charset="UTF-8"' },
  });
}
