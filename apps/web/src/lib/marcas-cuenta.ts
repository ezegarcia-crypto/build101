"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

// Las marcas guardadas en la cuenta. Lo que arma la persona vive en la pestaña (sessionStorage, claves "brandia:…":
// ficha, nombres, identidad, feed, web, branderia…). Cuando entró a su cuenta, cada parte se sube como un archivo
// aparte a su carpeta privada de Supabase Storage: marcas/<su id>/<id de la marca>/<parte>.json. Y en la tabla
// `marcas` queda el resumen para listarlas (nombre, colores, hasta dónde llegó). Ver apps/web/supabase/cuentas.sql.
//
// Por qué una parte por archivo: la web se arma en otra pestaña (components/boton-web.tsx copia la marca a la
// pestaña nueva). Cada pestaña sube solo lo que cambió en ella, así las dos no se pisan.
// Las imágenes van dentro (los logos y fotos están como data URL), por eso no pasa por nuestro servidor: Vercel
// corta los pedidos de más de 4,5 MB. El navegador sube directo a Supabase con la sesión de la persona.

const PREFIJO = "brandia:";
/** El id de la marca de la cuenta que se está armando en esta pestaña */
export const CLAVE_MARCA_CUENTA = "brandia:cuenta-marca";
/** La huella de lo último que se subió de cada parte, para subir solo lo que cambió */
const CLAVE_HUELLAS = "brandia:cuenta-huellas";
const CARPETA = "marcas";

/** Lo que no es de la marca: el id de la pestaña para /costos, el freno de recargas y lo de la cuenta misma. */
function esDeLaMarca(clave: string) {
  return (
    clave.startsWith(PREFIJO) &&
    clave !== "brandia:cliente" &&
    clave !== CLAVE_MARCA_CUENTA &&
    clave !== CLAVE_HUELLAS &&
    !clave.startsWith("brandia:arranques:")
  );
}

/** Las partes de la marca que hay en esta pestaña. */
export function partesDeLaPestana() {
  const partes: Record<string, string> = {};
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const clave = sessionStorage.key(i);
      if (clave && esDeLaMarca(clave)) partes[clave] = sessionStorage.getItem(clave) ?? "";
    }
  } catch {}
  return partes;
}

/** Si en esta pestaña ya hay una marca empezada (al menos terminó la entrevista). */
export function hayMarcaEnLaPestana() {
  try {
    return Boolean(sessionStorage.getItem("brandia:ficha"));
  } catch {
    return false;
  }
}

function leerJson<T>(texto: string | undefined): T | null {
  try {
    return texto ? (JSON.parse(texto) as T) : null;
  } catch {
    return null;
  }
}

/** Lo que se muestra de cada marca en la cuenta, sacado de sus partes. */
export function resumenDe(partes: Record<string, string>) {
  const ficha = leerJson<{ marca?: { nombre?: string | null; rubro?: string } }>(partes["brandia:ficha"]);
  const marca = leerJson<{ identidad?: { nombre?: string; paleta?: { hex?: string }[] } }>(partes["brandia:identidad"]);
  const nombre = marca?.identidad?.nombre || ficha?.marca?.nombre || null;
  const colores = (marca?.identidad?.paleta ?? [])
    .map((c) => c.hex)
    .filter((h): h is string => typeof h === "string" && /^#[0-9a-f]{6}$/i.test(h))
    .slice(0, 8);
  const pasos = [
    ["brandia:ficha", "ficha"],
    ["brandia:identidad", "marca"],
    ["brandia:feed", "contenido"],
    ["brandia:branderia", "productos"],
    ["brandia:web", "web"],
  ]
    .filter(([clave]) => partes[clave as string])
    .map(([, paso]) => paso as string);
  return {
    nombre: nombre?.slice(0, 80) ?? null,
    rubro: ficha?.marca?.rubro?.slice(0, 120) ?? null,
    colores,
    pasos,
  };
}

/** A qué pantalla llevar al abrir una marca: la última a la que llegó. */
export function pantallaDe(pasos: string[]) {
  if (pasos.includes("contenido")) return "/crear/contenido";
  if (pasos.includes("marca")) return "/crear/marca";
  return "/crear";
}

/** Nombre del archivo de cada parte: "brandia:web-publicada" → "web-publicada.json" */
const archivoDe = (clave: string) => `${clave.slice(PREFIJO.length).replace(/[^a-z0-9-]/gi, "_")}.json`;

// La última huella calculada de cada texto, para no volver a calcularla en cada vuelta si no cambió
const yaCalculadas = new Map<string, { valor: string; huella: string }>();

async function huella(texto: string, clave?: string) {
  const previa = clave ? yaCalculadas.get(clave) : undefined;
  if (previa && previa.valor === texto) return previa.huella;
  const datos = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  const resultado = [...new Uint8Array(datos)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
  if (clave) yaCalculadas.set(clave, { valor: texto, huella: resultado });
  return resultado;
}

function leerHuellas(): Record<string, string> {
  return leerJson<Record<string, string>>(sessionStorage.getItem(CLAVE_HUELLAS) ?? undefined) ?? {};
}

export type MarcaDeCuenta = {
  id: string;
  nombre: string | null;
  rubro: string | null;
  colores: string[];
  pasos: string[];
  tamano: number;
  actualizado: string;
};

export async function listarMarcas(supabase: SupabaseClient): Promise<MarcaDeCuenta[]> {
  const { data, error } = await supabase
    .from("marcas")
    .select("id, nombre, rubro, colores, pasos, tamano, actualizado")
    .order("actualizado", { ascending: false });
  if (error) throw new Error(error.message);
  return data as MarcaDeCuenta[];
}

/**
 * Sube a la cuenta lo que cambió en esta pestaña desde la última vez. Si la pestaña todavía no tenía una marca de
 * la cuenta, la crea. Devuelve cuántas partes subió (0 si no había nada nuevo).
 */
export async function guardarPestana(supabase: SupabaseClient, usuario: string) {
  if (!hayMarcaEnLaPestana()) return 0;
  const partes = partesDeLaPestana();
  const huellas = leerHuellas();
  const nuevas: Record<string, string> = {};
  const cambiadas: string[] = [];
  for (const [clave, valor] of Object.entries(partes)) {
    nuevas[clave] = await huella(valor, clave);
    if (nuevas[clave] !== huellas[clave]) cambiadas.push(clave);
  }
  // Lo que se borró en esta pestaña (por ejemplo, "Sumar otro feed" que limpia algo) se borra también en la cuenta
  const borradas = Object.keys(huellas).filter((c) => !(c in partes));
  if (cambiadas.length === 0 && borradas.length === 0) return 0;

  let id = sessionStorage.getItem(CLAVE_MARCA_CUENTA);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(CLAVE_MARCA_CUENTA, id);
  }
  const carpeta = `${usuario}/${id}`;

  const resumen = resumenDe(partes);
  const tamano = Object.values(partes).reduce((t, v) => t + v.length, 0);
  // Primero la fila (si no existe, la crea): sin ella la marca no aparece en la cuenta
  const { error: errorFila } = await supabase
    .from("marcas")
    .upsert({ id, usuario, ...resumen, tamano, actualizado: new Date().toISOString() });
  if (errorFila) throw new Error(errorFila.message);

  for (const clave of cambiadas) {
    const cuerpo = new Blob([JSON.stringify({ clave, valor: partes[clave] })], { type: "application/json" });
    const { error } = await supabase.storage
      .from(CARPETA)
      .upload(`${carpeta}/${archivoDe(clave)}`, cuerpo, { upsert: true, contentType: "application/json" });
    if (error) throw new Error(error.message);
    huellas[clave] = nuevas[clave] as string;
    // Se va anotando de a una: si se corta a la mitad, la próxima vuelta sube solo lo que faltó
    sessionStorage.setItem(CLAVE_HUELLAS, JSON.stringify(huellas));
  }
  if (borradas.length) {
    await supabase.storage.from(CARPETA).remove(borradas.map((c) => `${carpeta}/${archivoDe(c)}`));
    for (const c of borradas) delete huellas[c];
    sessionStorage.setItem(CLAVE_HUELLAS, JSON.stringify(huellas));
  }
  return cambiadas.length + borradas.length;
}

/**
 * Si en esta pestaña se empezó una marca nueva (la entrevista se reinició y la ficha se borró), la pestaña deja de
 * apuntar a la marca anterior de la cuenta: la próxima ficha arma otra. La anterior queda guardada como estaba.
 */
export function soltarSiSeReinicio() {
  try {
    if (sessionStorage.getItem(CLAVE_MARCA_CUENTA) && !hayMarcaEnLaPestana()) {
      sessionStorage.removeItem(CLAVE_MARCA_CUENTA);
      sessionStorage.removeItem(CLAVE_HUELLAS);
    }
  } catch {}
}

/** Baja una marca de la cuenta y la deja en esta pestaña, como si se hubiera armado acá. Devuelve sus pasos. */
export async function abrirMarca(supabase: SupabaseClient, usuario: string, marca: MarcaDeCuenta) {
  const carpeta = `${usuario}/${marca.id}`;
  const { data: archivos, error } = await supabase.storage.from(CARPETA).list(carpeta, { limit: 200 });
  if (error) throw new Error(error.message);
  const partes: Record<string, string> = {};
  await Promise.all(
    (archivos ?? []).map(async (a) => {
      const { data, error: e } = await supabase.storage.from(CARPETA).download(`${carpeta}/${a.name}`);
      if (e || !data) throw new Error(e?.message ?? "No se pudo bajar la marca.");
      const { clave, valor } = JSON.parse(await data.text()) as { clave: string; valor: string };
      if (esDeLaMarca(clave)) partes[clave] = valor;
    }),
  );
  if (!partes["brandia:ficha"]) throw new Error("Esta marca está vacía.");

  // Se saca de la pestaña la marca que hubiera (queda en la cuenta si estaba guardada) y se pone esta
  for (const clave of Object.keys(partesDeLaPestana())) sessionStorage.removeItem(clave);
  const huellas: Record<string, string> = {};
  for (const [clave, valor] of Object.entries(partes)) {
    sessionStorage.setItem(clave, valor);
    huellas[clave] = await huella(valor, clave);
  }
  sessionStorage.setItem(CLAVE_MARCA_CUENTA, marca.id);
  sessionStorage.setItem(CLAVE_HUELLAS, JSON.stringify(huellas));
  return pantallaDe(marca.pasos);
}

/** Borra una marca de la cuenta (sus archivos y su fila). Si estaba abierta en esta pestaña, la pestaña la suelta. */
export async function borrarMarca(supabase: SupabaseClient, usuario: string, id: string) {
  const carpeta = `${usuario}/${id}`;
  const { data: archivos } = await supabase.storage.from(CARPETA).list(carpeta, { limit: 200 });
  if (archivos?.length) await supabase.storage.from(CARPETA).remove(archivos.map((a) => `${carpeta}/${a.name}`));
  const { error } = await supabase.from("marcas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  try {
    if (sessionStorage.getItem(CLAVE_MARCA_CUENTA) === id) {
      sessionStorage.removeItem(CLAVE_MARCA_CUENTA);
      sessionStorage.removeItem(CLAVE_HUELLAS);
    }
  } catch {}
}
