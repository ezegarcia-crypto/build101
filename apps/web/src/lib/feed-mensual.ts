import type { Brief } from "@/lib/ia/brief";
import type { Pieza, Plan } from "@/lib/ia/contenidos/esquemas";
import type { IdEstilo } from "@/lib/ia/contenidos/estilos";
import type { IdentidadEntrada, Kit } from "@/lib/ia/contenidos/kit";
import type { Uso } from "@/lib/ia/contenidos/motor";
import type { Gusto } from "@/lib/ia/contenidos/prompts";

// El mes completo de un suscriptor, guardado en Supabase Storage para que sobreviva a cerrar la pestaña:
// el servidor lo va armando de a una semana (lib/ia/contenidos/mes.ts) y la pantalla lo lee cada pocos segundos.
// - El documento del mes (plan, piezas, fallas y en qué semana va) es un JSON en la carpeta privada `feeds-mensuales`.
//   Solo lo lee el servidor, con la clave de servicio, y lo entrega por GET /api/contenidos/mes.
// - Las fotos van a la carpeta pública `feeds-mensuales-fotos`, con nombres al azar (como las de `pruebas`).
// Las dos carpetas se crean solas la primera vez. No hace falta SQL. Cuando estén las cuentas, el mes se puede
// atar al usuario guardando su id acá.

const DATOS = "feeds-mensuales";
const FOTOS = "feeds-mensuales-fotos";

export type EstadoSemana = "pendiente" | "generando" | "lista" | "fallo";

export type Semana = {
  semana: number;
  estado: EstadoSemana;
  /** Cuántas veces se empezó (si un servidor se cae a la mitad, otro la retoma; hasta 3) */
  intentos: number;
  inicio?: string;
  fin?: string;
  usd: number;
};

export type Mes = {
  id: string;
  creado: string;
  /** La última vez que el servidor que lo arma dio señales (cada 20 s mientras trabaja) */
  actualizado: string;
  /** El lunes en que empieza el mes, AAAA-MM-DD (lo manda el navegador, en su hora) */
  inicio: string;
  cliente?: string;
  /** Lo que hace falta para seguir armándolo, tal cual vino de la pantalla */
  entrada: { brief: Brief; identidad: IdentidadEntrada; estilo?: IdEstilo; gustaron?: Gusto[] };
  kit: Kit;
  plan: Plan | null;
  piezas: Record<string, Pieza>;
  /** id de la pieza → clave → link público de la foto */
  imagenes: Record<string, Record<string, string>>;
  /** dónde falló (id de pieza, id/clave de imagen, o "plan") → mensaje e intentos */
  fallas: Record<string, { mensaje: string; intentos: number }>;
  semanas: Semana[];
  /** Quién lo está armando ahora: un solo servidor a la vez */
  trabajo: { dueno: string; que: "semana" | "reintento"; semana?: number; desde: string } | null;
  uso: Uso;
  fotos_hechas: number;
};

/** Sin señales del servidor por más de esto, se da por caído y otro puede retomarlo. */
export const CAIDO_MS = 3 * 60_000;

function supabase() {
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) return null;
  return { base: url.replace(/\/$/, ""), headers: { apikey: clave, Authorization: `Bearer ${clave}` } };
}

export function hayDondeGuardarMeses() {
  return supabase() !== null;
}

function conexion() {
  const s = supabase();
  if (!s) throw new Error("Falta conectar la base de datos (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).");
  return s;
}

const carpetasListas = new Set<string>();

async function crearCarpeta(id: string, publica: boolean) {
  const s = conexion();
  const r = await fetch(`${s.base}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...s.headers, "content-type": "application/json" },
    body: JSON.stringify({ id, name: id, public: publica }),
  });
  // Si ya existía, Supabase contesta con error "already exists": está bien
  if (!r.ok && !/already exists|Duplicate/i.test(await r.text())) throw new Error(`No se pudo crear la carpeta ${id} (${r.status})`);
  carpetasListas.add(id);
}

async function subir(carpeta: string, ruta: string, cuerpo: BodyInit, tipo: string, cache: string) {
  const s = conexion();
  const enviar = () =>
    fetch(`${s.base}/storage/v1/object/${carpeta}/${ruta}`, {
      method: "POST",
      headers: { ...s.headers, "content-type": tipo, "x-upsert": "true", "cache-control": cache },
      body: cuerpo,
      cache: "no-store",
    });
  let r = await enviar();
  if (!r.ok) {
    const texto = await r.text();
    if (carpetasListas.has(carpeta) || !/not found/i.test(texto)) throw new Error(`Supabase Storage respondió ${r.status}: ${texto.slice(0, 200)}`);
    await crearCarpeta(carpeta, carpeta === FOTOS);
    r = await enviar();
    if (!r.ok) throw new Error(`Supabase Storage respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
  }
}

export const idValido = (id: string) => /^[a-f0-9-]{36}$/.test(id);

export async function leerMes(id: string): Promise<Mes | null> {
  if (!idValido(id)) return null;
  const s = conexion();
  const r = await fetch(`${s.base}/storage/v1/object/${DATOS}/${id}.json?v=${Date.now()}`, { headers: s.headers, cache: "no-store" });
  if (r.status === 400 || r.status === 404) return null;
  if (!r.ok) throw new Error(`Supabase Storage respondió ${r.status}`);
  return (await r.json()) as Mes;
}

export async function guardarMes(mes: Mes) {
  mes.actualizado = new Date().toISOString();
  await subir(DATOS, `${mes.id}.json`, JSON.stringify(mes), "application/json", "no-cache");
}

/** Sube una foto (data URL) y devuelve su link público */
export async function subirFoto(mesId: string, nombre: string, dataUrl: string) {
  const tipo = /^data:([^;]+);base64,/.exec(dataUrl)?.[1] ?? "image/jpeg";
  const bytes = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
  const azar = crypto.randomUUID().slice(0, 8);
  const ruta = `${mesId}/${nombre.replace(/[^a-z0-9-]/gi, "-")}-${azar}.${tipo === "image/png" ? "png" : "jpg"}`;
  await subir(FOTOS, ruta, new Uint8Array(bytes), tipo, "max-age=31536000");
  return `${conexion().base}/storage/v1/object/public/${FOTOS}/${ruta}`;
}

/** Si el servidor que lo arma sigue vivo */
export function trabajando(mes: Mes, ahora = Date.now()) {
  return mes.trabajo !== null && ahora - Date.parse(mes.actualizado) < CAIDO_MS;
}

/** Lo que ve la pantalla: todo menos la entrada (la ficha y la identidad ya las tiene) */
export function paraLaPantalla(mes: Mes) {
  const { entrada: _entrada, ...resto } = mes;
  return resto;
}

export type MesEnPantalla = ReturnType<typeof paraLaPantalla>;
