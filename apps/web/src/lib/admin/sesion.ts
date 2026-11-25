// La sesión de administrador: una cookie firmada que dice quién entró y hasta cuándo vale (12 horas).
// Nadie la puede inventar sin la clave de servicio de Supabase, que solo tiene el servidor. Usa WebCrypto, así
// la puede revisar también el proxy (proxy.ts) antes de mostrar /costos, /pruebas y /pedidos.

export const COOKIE_ADMIN = "brandia_admin";
export const DURACION_SESION = 60 * 60 * 12;

type Sesion = { mail: string; nombre: string; vence: number };

function enBase64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function deBase64Url(texto: string) {
  const b64 = texto.replaceAll("-", "+").replaceAll("_", "/");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function llave() {
  const secreto = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secreto) return null;
  const material = new TextEncoder().encode(`brandia-admin-sesion:${secreto}`);
  return crypto.subtle.importKey("raw", material, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

/** El valor de la cookie para quien acaba de entrar, o null si falta la clave de servicio. */
export async function firmarSesion(mail: string, nombre: string) {
  const k = await llave();
  if (!k) return null;
  const datos: Sesion = { mail, nombre, vence: Math.floor(Date.now() / 1000) + DURACION_SESION };
  const cuerpo = enBase64Url(new TextEncoder().encode(JSON.stringify(datos)));
  const firma = new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(cuerpo)));
  return `${cuerpo}.${enBase64Url(firma)}`;
}

/** Quién es el administrador de esta cookie, o null si no hay, está vencida o fue tocada. */
export async function leerSesion(valor: string | undefined): Promise<Sesion | null> {
  const k = await llave();
  if (!k || !valor) return null;
  const [cuerpo, firma] = valor.split(".");
  if (!cuerpo || !firma) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", k, deBase64Url(firma), new TextEncoder().encode(cuerpo));
    if (!ok) return null;
    const datos = JSON.parse(new TextDecoder().decode(deBase64Url(cuerpo))) as Sesion;
    return typeof datos.mail === "string" && datos.vence > Date.now() / 1000 ? datos : null;
  } catch {
    return null;
  }
}

/** En la compu (npm run dev) sin Supabase configurado, los paneles se abren sin login, como antes. */
export function panelesAbiertos() {
  return process.env.NODE_ENV === "development" && !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

/** Para las acciones de los paneles: Next.js deja llamarlas desde cualquier dirección, así que revisan de nuevo. */
export async function esAdmin() {
  if (panelesAbiertos()) return true;
  const { cookies } = await import("next/headers");
  return (await leerSesion((await cookies()).get(COOKIE_ADMIN)?.value)) !== null;
}
