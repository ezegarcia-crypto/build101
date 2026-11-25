import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { linkParaLaApp, nuevaSemilla, revisarCodigo } from "@/lib/admin/totp";

// La lista cerrada de administradores (tabla `admins`, ver apps/web/supabase/admins.sql) y las dos puertas:
// el alta (cada uno elige su contraseña y escanea el QR una sola vez) y el ingreso (mail + contraseña + código).
// Solo la usa el servidor, con la clave de servicio, por la API REST de Supabase como lib/pagos.ts.

const scryptAsync = promisify(scrypt) as (clave: string, sal: Buffer, largo: number) => Promise<Buffer>;

const MAX_INTENTOS = 5;
const MINUTOS_FRENADO = 15;
export const CLAVE_MINIMA = 10;

type Admin = {
  mail: string;
  nombre: string;
  clave_hash: string | null;
  totp_secreto: string | null;
  totp_activo: boolean;
  ultimo_paso: number;
  intentos: number;
  bloqueado_hasta: string | null;
};

function conexion() {
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) return null;
  return {
    url: `${url.replace(/\/$/, "")}/rest/v1/admins`,
    headers: { apikey: clave, Authorization: `Bearer ${clave}`, "content-type": "application/json" },
  };
}

async function pedir(metodo: string, consulta: string, cuerpo?: unknown) {
  const c = conexion();
  if (!c) throw new Error("Falta conectar la base de datos (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).");
  const r = await fetch(`${c.url}${consulta}`, {
    method: metodo,
    headers: { ...c.headers, Prefer: "return=representation" },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Supabase respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

async function buscar(mail: string): Promise<Admin | null> {
  const filas: Admin[] = await pedir("GET", `?mail=eq.${encodeURIComponent(mail)}&select=*`);
  return filas[0] ? { ...filas[0], ultimo_paso: Number(filas[0].ultimo_paso) } : null;
}

const cambiar = (mail: string, datos: Partial<Admin> & { ultimo_ingreso?: string }) =>
  pedir("PATCH", `?mail=eq.${encodeURIComponent(mail)}`, datos);

export const normalizarMail = (mail: unknown) => String(mail ?? "").trim().toLowerCase().slice(0, 120);

async function huella(clave: string) {
  const sal = randomBytes(16);
  const hash = await scryptAsync(clave, sal, 64);
  return `scrypt:${sal.toString("base64")}:${hash.toString("base64")}`;
}

async function claveCorrecta(clave: string, guardada: string | null) {
  // Sin contraseña guardada se calcula igual, para que la respuesta tarde lo mismo y no delate qué mails existen
  const [, sal, hash] = (guardada ?? "scrypt:AAAAAAAAAAAAAAAAAAAAAA==:").split(":");
  const esperado = Buffer.from(hash ?? "", "base64");
  const calculado = await scryptAsync(clave, Buffer.from(sal ?? "", "base64"), 64);
  return guardada !== null && esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}

function frenado(a: Admin) {
  return a.bloqueado_hasta !== null && new Date(a.bloqueado_hasta).getTime() > Date.now();
}

async function anotarFallo(a: Admin) {
  const intentos = a.intentos + 1;
  const frenar = intentos >= MAX_INTENTOS;
  await cambiar(a.mail, {
    intentos: frenar ? 0 : intentos,
    bloqueado_hasta: frenar ? new Date(Date.now() + MINUTOS_FRENADO * 60_000).toISOString() : a.bloqueado_hasta,
  });
}

export type Resultado<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const NO_COINCIDE = "El mail, la contraseña o el código no coinciden.";
const FRENADO = `Demasiados intentos. Esperá ${MINUTOS_FRENADO} minutos y probá de nuevo.`;

/** Paso 1 del alta: un admin de la lista elige su contraseña y recibe la semilla para escanear con el QR. */
export async function iniciarAlta(mail: string, clave: string): Promise<Resultado<{ semilla: string; link: string }>> {
  if (clave.length < CLAVE_MINIMA) return { ok: false, error: `La contraseña tiene que tener ${CLAVE_MINIMA} caracteres o más.` };
  const a = await buscar(mail);
  if (!a) return { ok: false, error: "Ese mail no está en la lista de administradores." };
  if (a.totp_activo) return { ok: false, error: "Esa cuenta ya está activada. Entrá desde /admin." };
  if (frenado(a)) return { ok: false, error: FRENADO };
  const semilla = nuevaSemilla();
  await cambiar(mail, { clave_hash: await huella(clave), totp_secreto: semilla, totp_activo: false });
  return { ok: true, semilla, link: linkParaLaApp(semilla, mail) };
}

/** Paso 2 del alta: con el primer código de Google Authenticator se confirma que el celular quedó vinculado. */
export async function confirmarAlta(mail: string, clave: string, codigo: string): Promise<Resultado<{ nombre: string }>> {
  const a = await buscar(mail);
  if (!a || a.totp_activo || !a.totp_secreto) return { ok: false, error: "Empezá el alta de nuevo." };
  if (frenado(a)) return { ok: false, error: FRENADO };
  const paso = (await claveCorrecta(clave, a.clave_hash)) ? await revisarCodigo(a.totp_secreto, codigo, 0) : null;
  if (paso === null) {
    await anotarFallo(a);
    return { ok: false, error: "El código no coincide. Fijate que sea el de BrandIA y que no haya cambiado." };
  }
  await cambiar(mail, {
    totp_activo: true,
    ultimo_paso: paso,
    intentos: 0,
    bloqueado_hasta: null,
    ultimo_ingreso: new Date().toISOString(),
  });
  return { ok: true, nombre: a.nombre };
}

/** El ingreso de todos los días: mail, contraseña y el código de 6 números. */
export async function entrar(mail: string, clave: string, codigo: string): Promise<Resultado<{ nombre: string }>> {
  const a = await buscar(mail);
  if (!a || !a.totp_activo || !a.totp_secreto) {
    await claveCorrecta(clave, null);
    return { ok: false, error: NO_COINCIDE };
  }
  if (frenado(a)) return { ok: false, error: FRENADO };
  const paso = (await claveCorrecta(clave, a.clave_hash))
    ? await revisarCodigo(a.totp_secreto, codigo, a.ultimo_paso)
    : null;
  if (paso === null) {
    await anotarFallo(a);
    return { ok: false, error: NO_COINCIDE };
  }
  await cambiar(mail, {
    ultimo_paso: paso,
    intentos: 0,
    bloqueado_hasta: null,
    ultimo_ingreso: new Date().toISOString(),
  });
  return { ok: true, nombre: a.nombre };
}
