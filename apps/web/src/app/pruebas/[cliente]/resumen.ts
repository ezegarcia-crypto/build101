import type { Lote } from "@/components/feed/feed";
import type { Evento } from "@/lib/ia/contenidos/motor";
import type { Prueba } from "@/lib/pruebas";

import type { Mensaje, NombreGuardado, Resumen } from "./vistas";

// Arma lo que se muestra de una prueba a partir de sus pedidos guardados: lo último de cada paso
// (la marca, el feed, la web) y lo que conviene ver junto (todos los nombres, todas las fotos).

// biome-ignore lint/suspicious/noExplicitAny: son filas guardadas, sin un esquema fijo
type Cualquiera = Record<string, any>;

const bien = (p: Prueba) => p.estado < 400 && p.salida && typeof p.salida === "object";
const ultimo = (pedidos: Prueba[], ...pasos: string[]) => pedidos.findLast((p) => pasos.includes(p.paso) && bien(p));

function chat(p: Prueba | undefined): Mensaje[] {
  if (!p) return [];
  const mensajes = ((p.entrada as Cualquiera)?.messages ?? []) as { role: string; parts?: { type: string; text?: string }[] }[];
  const lista: Mensaje[] = mensajes
    .map((m) => ({
      rol: m.role === "user" ? ("persona" as const) : ("brandia" as const),
      texto: (m.parts ?? []).filter((x) => x.type === "text").map((x) => x.text).join("\n").trim(),
    }))
    .filter((m) => m.texto);
  const respuesta = (p.salida as Cualquiera)?.respuesta?.trim();
  if (respuesta) lista.push({ rol: "brandia", texto: respuesta });
  return lista;
}

/** El feed armado con los eventos del motor, igual que lo arma la pantalla (components/feed/generar-feed.tsx) */
function lote(eventos: Evento[]): Lote {
  const l: Lote = { kit: null, plan: null, piezas: {}, imagenes: {}, fallas: {}, mensaje: "", fin: null };
  for (const e of eventos) {
    if (e.tipo === "kit") l.kit = e.kit;
    else if (e.tipo === "plan") l.plan = e.plan;
    else if (e.tipo === "pieza") l.piezas[e.pieza.id] = e.pieza;
    else if (e.tipo === "imagen") l.imagenes[e.pieza] = { ...l.imagenes[e.pieza], [e.clave]: e.url };
    else if (e.tipo === "error") l.fallas[e.donde] = e.mensaje;
    else if (e.tipo === "fin") l.fin = { segundos: e.segundos, imagenes: e.imagenes };
  }
  return l;
}

export function armarResumen(pedidos: Prueba[]): Resumen {
  const nombres = new Map<string, NombreGuardado>();
  for (const p of pedidos) {
    if (p.paso !== "nombres" || !bien(p)) continue;
    for (const n of ((p.salida as Cualquiera).nombres ?? []) as NombreGuardado[]) {
      if (n?.nombre && !nombres.has(n.nombre)) nombres.set(n.nombre, n);
    }
  }

  const direcciones = ultimo(pedidos, "direcciones");
  const identidad = ultimo(pedidos, "identidad");
  const logos = ultimo(pedidos, "logo");

  const feeds = pedidos
    .filter((p) => p.paso === "contenidos-lote" && Array.isArray(p.salida))
    .map((p) => lote(p.salida as Evento[]))
    .filter((l) => l.kit && l.plan);

  const productos = pedidos
    .filter((p) => p.paso === "branderia" && bien(p))
    .map((p) => (p.salida as Cualquiera).url as string)
    .filter((u) => typeof u === "string" && u.startsWith("http"));

  const webs = pedidos.filter((p) => ["web-armar", "web-cambio"].includes(p.paso) && bien(p) && (p.salida as Cualquiera).web);
  const ultimaWeb = webs.at(-1);
  const fotos: Record<string, string> = {};
  for (const p of pedidos) {
    const descripcion = (p.entrada as Cualquiera)?.descripcion;
    const url = (p.salida as Cualquiera)?.url;
    if (p.paso === "web-foto" && bien(p) && typeof descripcion === "string" && typeof url === "string") fotos[descripcion] = url;
  }

  return {
    chat: chat(ultimo(pedidos, "entrevista")),
    nombres: [...nombres.values()],
    direcciones: direcciones
      ? {
          lista: (direcciones.salida as Cualquiera).direcciones ?? [],
          nombre: (identidad?.salida as Cualquiera)?.identidad?.nombre ?? null,
        }
      : null,
    marca: identidad
      ? {
          identidad: (identidad.salida as Cualquiera).identidad,
          logos: (logos?.salida as Cualquiera)?.propuestas ?? [],
        }
      : null,
    feeds,
    productos,
    web: ultimaWeb
      ? {
          web: (ultimaWeb.salida as Cualquiera).web,
          ficha: (ultimaWeb.salida as Cualquiera).ficha_web ?? (ultimaWeb.entrada as Cualquiera)?.ficha_web,
          fotos,
          versiones: webs.length,
        }
      : null,
  };
}
