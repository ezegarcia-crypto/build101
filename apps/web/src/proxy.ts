import { type NextRequest, NextResponse } from "next/server";

// El panel /costos es solo para el equipo: el navegador pide una contraseña antes de mostrarlo.
// La contraseña es la variable de entorno COSTOS_CLAVE (en Vercel y, si querés, en .env.local).
// El usuario puede ser cualquiera. Sin la variable, en la web publicada el panel no se abre;
// en la compu de cada uno (npm run dev) se abre igual.

export const config = { matcher: ["/costos"] };

function iguales(a: string, b: string) {
  if (a.length !== b.length) return false;
  let distinto = 0;
  for (let i = 0; i < a.length; i++) distinto |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return distinto === 0;
}

function claveEscrita(req: NextRequest) {
  const cabecera = req.headers.get("authorization");
  if (!cabecera?.startsWith("Basic ")) return null;
  try {
    const texto = atob(cabecera.slice(6));
    return texto.slice(texto.indexOf(":") + 1);
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const clave = process.env.COSTOS_CLAVE;
  if (!clave) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return new NextResponse("El panel de costos todavía no tiene contraseña configurada (COSTOS_CLAVE).", {
      status: 503,
    });
  }

  const escrita = claveEscrita(req);
  if (escrita !== null && iguales(escrita, clave)) return NextResponse.next();

  return new NextResponse("Este panel es solo para el equipo de BrandIA.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Costos BrandIA", charset="UTF-8"' },
  });
}
