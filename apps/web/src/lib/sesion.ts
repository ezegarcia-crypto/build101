import { cookies } from "next/headers";

// La cuenta de cada persona en BrandIA, con Supabase Auth: entra con un código de 6 números que le llega por
// correo, sin contraseña. Si es la primera vez, Supabase le crea la cuenta sola (create_user).
// Igual que lib/webs.ts y lib/pagos.ts, habla con Supabase directo, desde el servidor y con la clave de servicio.
// La sesión queda en dos cookies que la pantalla no puede leer (httpOnly): la de acceso, que dura una hora,
// y la de renovar, que sirve para pedir otra de acceso cuando vence. usuarioActual() dice quién entró.
// Para que el correo traiga el código y no un link, las plantillas de Supabase tienen que usar {{ .Token }}
// (ver equipo/paginas.md, fila de /ingresar).

const COOKIE_ACCESO = "brandia_sesion";
const COOKIE_RENOVAR = "brandia_sesion_renovar";
const UN_ANIO = 60 * 60 * 24 * 365;
const OPCIONES = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" } as const;

export type Usuario = { id: string; correo: string };
type Resultado = { ok: true } | { ok: false; error: string };
type Sesion = { access_token: string; refresh_token: string; expires_in: number; user: { id: string; email?: string } };

function conexion() {
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) return null;
  return { base: `${url.replace(/\/$/, "")}/auth/v1`, clave };
}

async function pedir(ruta: string, cuerpo: unknown) {
  const c = conexion();
  if (!c) return null;
  return fetch(`${c.base}${ruta}`, {
    method: "POST",
    headers: { apikey: c.clave, Authorization: `Bearer ${c.clave}`, "content-type": "application/json" },
    body: JSON.stringify(cuerpo),
    cache: "no-store",
  });
}

/** Lo que Supabase explica cuando dice que no, para dejarlo en el registro del servidor */
async function motivo(r: Response) {
  return `${r.status} ${(await r.text()).slice(0, 200)}`;
}

/** Manda el código al correo. Si la persona no tenía cuenta, se la crea. */
export async function mandarCodigo(correo: string): Promise<Resultado> {
  const r = await pedir("/otp", { email: correo, create_user: true });
  if (!r) return { ok: false, error: "El ingreso todavía no está conectado." };
  if (r.ok) return { ok: true };
  console.error("Supabase no mandó el código:", await motivo(r));
  if (r.status === 429) {
    return { ok: false, error: "Ya te mandamos un código hace un ratito. Esperá un minuto y pedí otro." };
  }
  return { ok: false, error: "No pudimos mandarte el código. Probá de nuevo en un rato." };
}

/** Valida el código y, si está bien, abre la sesión en este navegador. */
export async function validarCodigo(correo: string, codigo: string): Promise<Resultado> {
  const r = await pedir("/verify", { type: "email", email: correo, token: codigo });
  if (!r) return { ok: false, error: "El ingreso todavía no está conectado." };
  if (!r.ok) {
    console.error("Supabase no aceptó el código:", await motivo(r));
    if (r.status === 429) return { ok: false, error: "Probaste muchas veces seguidas. Esperá un minuto." };
    return { ok: false, error: "El código no es correcto o ya venció. Revisalo o pedí otro." };
  }
  await guardarSesion((await r.json()) as Sesion);
  return { ok: true };
}

async function guardarSesion(sesion: Sesion) {
  const galletas = await cookies();
  galletas.set(COOKIE_ACCESO, sesion.access_token, { ...OPCIONES, maxAge: sesion.expires_in });
  galletas.set(COOKIE_RENOVAR, sesion.refresh_token, { ...OPCIONES, maxAge: UN_ANIO });
}

async function leerUsuario(acceso: string): Promise<Usuario | null> {
  const c = conexion();
  if (!c) return null;
  const r = await fetch(`${c.base}/user`, {
    headers: { apikey: c.clave, Authorization: `Bearer ${acceso}` },
    cache: "no-store",
  });
  if (!r.ok) return null;
  const u = (await r.json()) as { id: string; email?: string };
  return { id: u.id, correo: u.email ?? "" };
}

/**
 * Quién entró en este navegador, o null. Si la cookie de acceso venció, pide otra con la de renovar.
 * Ojo: renovar solo funciona desde una acción o una ruta de la API, donde se pueden guardar cookies. La de
 * renovar se usa una sola vez (Supabase la cambia por otra), así que si no se puede guardar la nueva, no se renueva.
 * Si un día lo usa una página, conviene renovar en proxy.ts, que corre antes de cada página.
 */
export async function usuarioActual(): Promise<Usuario | null> {
  const galletas = await cookies();
  const acceso = galletas.get(COOKIE_ACCESO)?.value;
  if (acceso) {
    const usuario = await leerUsuario(acceso);
    if (usuario) return usuario;
  }
  const renovar = galletas.get(COOKIE_RENOVAR)?.value;
  if (!renovar) return null;
  try {
    // Prueba si acá se pueden guardar cookies (desde una página no): se vuelve a guardar la misma
    galletas.set(COOKIE_RENOVAR, renovar, { ...OPCIONES, maxAge: UN_ANIO });
  } catch {
    return null;
  }
  const r = await pedir("/token?grant_type=refresh_token", { refresh_token: renovar });
  if (!r?.ok) return null;
  const sesion = (await r.json()) as Sesion;
  await guardarSesion(sesion);
  return { id: sesion.user.id, correo: sesion.user.email ?? "" };
}
