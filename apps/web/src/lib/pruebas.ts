// Todo lo que genera cada prueba, guardado en Supabase (tabla `pruebas`, ver apps/web/supabase/pruebas.sql).
// Cada pedido a la IA que pasa por medir() (lib/ia/gastos.ts) queda como una fila: qué se le mandó, qué
// devolvió, cuánto tardó y de qué cliente era. Incluye lo que después se descarta (otro feed, otros
// nombres, cada cambio de la web), así queda la historia completa para aprender de ella más adelante.
// Las imágenes y los audios no van en la fila: se suben a la carpeta `pruebas` de Supabase Storage y en
// su lugar queda el link. Se guarda después de responder (after), así la persona no espera de más.
// Solo lo usa el servidor, con la clave de servicio, igual que lib/webs.ts y lib/pagos.ts.

import { after } from "next/server";

import { clienteValido, HEADER_CLIENTE } from "@/lib/cliente";

const CARPETA = "pruebas";
// Más que esto en una sola fila no se guarda entero (con las imágenes afuera, ninguna respuesta llega)
const MAXIMO_TEXTO = 1_500_000;
const MEDIO = /^data:((?:image|audio|video)\/[a-z0-9.+-]+);base64,/i;

export type Prueba = {
  id: number;
  cliente: string | null;
  paso: string;
  corrida: string;
  estado: number;
  segundos: number;
  origen: string;
  entrada: unknown;
  salida: unknown;
  creado: string;
};

function supabase() {
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) return null;
  return { base: url.replace(/\/$/, ""), headers: { apikey: clave, Authorization: `Bearer ${clave}` } };
}

export function hayDondeGuardar() {
  return supabase() !== null;
}

/** Dónde empiezan los links de los archivos guardados */
export function inicioArchivos() {
  const s = supabase();
  return s ? `${s.base}/storage/v1/object/public/${CARPETA}/` : null;
}

const EXTENSION: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "audio/webm": "webm",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/** Sube un archivo con su huella como nombre: si ya estaba (el mismo logo en varios pedidos), no se duplica */
async function subir(bytes: Uint8Array, tipoCompleto: string) {
  const tipo = tipoCompleto.split(";")[0]!.trim().toLowerCase(); // "audio/webm;codecs=opus" → "audio/webm"
  const s = supabase();
  if (!s) throw new Error("Falta conectar la base de datos.");
  const huella = Buffer.from(await crypto.subtle.digest("SHA-256", bytes as BufferSource)).toString("hex").slice(0, 32);
  const nombre = `${huella}.${EXTENSION[tipo] ?? "bin"}`;
  const r = await fetch(`${s.base}/storage/v1/object/${CARPETA}/${nombre}`, {
    method: "POST",
    headers: { ...s.headers, "content-type": tipo, "x-upsert": "true", "cache-control": "max-age=31536000" },
    body: bytes as BodyInit,
  });
  if (!r.ok) throw new Error(`Supabase Storage respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return `${inicioArchivos()}${nombre}`;
}

/** Cambia cada imagen o audio en base64 por su link en la carpeta. El SVG queda como texto: es liviano */
async function sacarArchivos(valor: unknown, subidos: Map<string, Promise<string>>): Promise<unknown> {
  if (typeof valor === "string") {
    const tipo = valor.length > 2000 ? MEDIO.exec(valor)?.[1]?.toLowerCase() : undefined;
    if (!tipo || tipo === "image/svg+xml") return valor;
    if (!subidos.has(valor)) {
      const bytes = Buffer.from(valor.slice(valor.indexOf(",") + 1), "base64");
      subidos.set(valor, subir(new Uint8Array(bytes), tipo));
    }
    return subidos.get(valor)!.catch((e: Error) => `[no se pudo guardar el archivo: ${e.message.slice(0, 80)}]`);
  }
  if (Array.isArray(valor)) return Promise.all(valor.map((v) => sacarArchivos(v, subidos)));
  if (valor && typeof valor === "object") {
    const pares = await Promise.all(
      Object.entries(valor).map(async ([k, v]) => [k, await sacarArchivos(v, subidos)] as const),
    );
    return Object.fromEntries(pares);
  }
  return valor;
}

/** Lee todo el cuerpo, aunque se corte a la mitad (si la persona se fue, queda lo que llegó) */
async function leerTexto(cuerpo: Request | Response) {
  if (!cuerpo.body) return "";
  const lector = cuerpo.body.pipeThrough(new TextDecoderStream()).getReader();
  let texto = "";
  try {
    for (;;) {
      const { value, done } = await lector.read();
      if (done) break;
      texto += value;
    }
  } catch {
    texto += "\n[cortado]";
  }
  return texto;
}

function json(texto: string) {
  try {
    return JSON.parse(texto) as unknown;
  } catch {
    return undefined;
  }
}

/**
 * La conversación por chat llega de a pedacitos (un evento por palabra). Se guarda armada: el texto
 * entero de la respuesta y, aparte, los eventos que no son texto (por ejemplo la ficha de la marca).
 */
function armarChat(texto: string) {
  let respuesta = "";
  let razonamiento = "";
  const eventos: unknown[] = [];
  const pedacitos = ["text-start", "text-end", "reasoning-start", "reasoning-end", "start-step", "finish-step", "tool-input-delta"];
  for (const linea of texto.split("\n")) {
    if (!linea.startsWith("data: ")) continue;
    const evento = json(linea.slice(6)) as { type?: string; delta?: string } | undefined;
    if (!evento) continue;
    if (evento.type === "text-delta") respuesta += evento.delta ?? "";
    else if (evento.type === "reasoning-delta") razonamiento += evento.delta ?? "";
    else if (!pedacitos.includes(evento.type ?? "")) eventos.push(evento);
  }
  return { respuesta, ...(razonamiento && { razonamiento }), eventos };
}

async function leer(cuerpo: Request | Response) {
  const tipo = cuerpo.headers.get("content-type") ?? "";
  if (tipo.includes("multipart/form-data")) {
    const datos = await cuerpo.formData();
    const campos: Record<string, unknown> = {};
    for (const [clave, valor] of datos) {
      campos[clave] =
        typeof valor === "string"
          ? valor
          : await subir(new Uint8Array(await valor.arrayBuffer()), valor.type || "application/octet-stream");
    }
    return campos;
  }
  const texto = await leerTexto(cuerpo);
  if (tipo.includes("text/event-stream")) return armarChat(texto);
  if (tipo.includes("ndjson")) return texto.split("\n").filter(Boolean).map((l) => json(l) ?? l);
  return json(texto) ?? (texto || null);
}

/** Si una fila igual quedaría enorme, se guarda un aviso en su lugar (nunca se pierde la fila entera) */
function recortar(valor: unknown) {
  const texto = JSON.stringify(valor ?? null);
  return texto.length <= MAXIMO_TEXTO ? valor : { recortado: true, inicio: texto.slice(0, 20_000) };
}

/**
 * Guarda un pedido a la IA con su respuesta. Nunca tira error: si algo falla, lo avisa en el registro
 * del servidor y la app sigue como si nada.
 */
export async function grabarPrueba(p: {
  paso: string;
  corrida: string;
  cliente?: string;
  inicio: number;
  entrada?: Request;
  salida: Response;
}) {
  const s = supabase();
  if (!s) return;
  try {
    const subidos = new Map<string, Promise<string>>();
    const [entrada, salida] = await Promise.all([
      p.entrada ? leer(p.entrada).then((v) => sacarArchivos(v, subidos)) : null,
      leer(p.salida).then((v) => sacarArchivos(v, subidos)),
    ]);
    const r = await fetch(`${s.base}/rest/v1/pruebas`, {
      method: "POST",
      headers: { ...s.headers, "content-type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        cliente: p.cliente ?? null,
        paso: p.paso,
        corrida: p.corrida,
        estado: p.salida.status,
        segundos: Math.round((Date.now() - p.inicio) / 100) / 10,
        origen: process.env.VERCEL_ENV ?? "compu",
        entrada: recortar(entrada),
        salida: recortar(salida),
      }),
      cache: "no-store",
    });
    if (!r.ok) console.warn(`[pruebas] Supabase respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
  } catch (error) {
    console.warn("[pruebas] no se pudo guardar", p.paso, error);
  }
}

/** Para las rutas que no pasan por medir() (los audios, que no usan el Gateway): las guarda igual */
export function conGrabacion(paso: string, ruta: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    const inicio = Date.now();
    const entrada = hayDondeGuardar() ? req.clone() : undefined;
    const respuesta = await ruta(req);
    if (entrada) {
      const salida = respuesta.clone();
      const cliente = clienteValido(req.headers.get(HEADER_CLIENTE));
      after(() => grabarPrueba({ paso, corrida: crypto.randomUUID().slice(0, 8), cliente, inicio, entrada, salida }));
    }
    return respuesta;
  };
}

async function pedir<T>(consulta: string): Promise<T> {
  const s = supabase();
  if (!s) throw new Error("Falta conectar la base de datos (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).");
  const r = await fetch(`${s.base}/rest/v1/pruebas${consulta}`, { headers: s.headers, cache: "no-store" });
  if (!r.ok) throw new Error(`Supabase respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json() as Promise<T>;
}

export type ResumenCliente = {
  cliente: string;
  desde: string;
  hasta: string;
  pedidos: number;
  pasos: string[];
  origen: string;
  marca: string | null;
  rubro: string | null;
};

/** Cada cliente que probó la app, del más nuevo al más viejo, con lo que hizo y el nombre de su marca */
export async function listarClientes(): Promise<ResumenCliente[]> {
  const [filas, marcas] = await Promise.all([
    pedir<{ cliente: string | null; paso: string; creado: string; origen: string }[]>(
      "?select=cliente,paso,creado,origen&order=creado.desc&limit=20000",
    ),
    pedir<{ cliente: string | null; marca: string | null; rubro: string | null }[]>(
      "?paso=eq.identidad&estado=eq.200&select=cliente,marca:salida->identidad->>nombre,rubro:entrada->brief->marca->>rubro&order=creado.desc",
    ),
  ]);
  const clientes = new Map<string, ResumenCliente>();
  for (const f of filas) {
    const id = f.cliente ?? "sin-cliente";
    const c = clientes.get(id) ?? {
      cliente: id,
      desde: f.creado,
      hasta: f.creado,
      pedidos: 0,
      pasos: [],
      origen: f.origen,
      marca: null,
      rubro: null,
    };
    c.pedidos++;
    c.desde = f.creado; // vienen del más nuevo al más viejo
    if (!c.pasos.includes(f.paso)) c.pasos.push(f.paso);
    clientes.set(id, c);
  }
  for (const m of marcas) {
    const c = clientes.get(m.cliente ?? "sin-cliente");
    if (c && !c.marca) Object.assign(c, { marca: m.marca, rubro: m.rubro });
  }
  return [...clientes.values()];
}

/** Todo lo de un cliente, en el orden en que pasó */
export function leerCliente(cliente: string) {
  const filtro = cliente === "sin-cliente" ? "is.null" : `eq.${encodeURIComponent(cliente)}`;
  return pedir<Prueba[]>(`?cliente=${filtro}&select=*&order=creado.asc&limit=2000`);
}
