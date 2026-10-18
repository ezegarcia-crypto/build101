// Bajar el contenido para redes: cada lámina del feed (que es un SVG con las letras de la marca) pasa a PNG,
// listo para subir a Instagram, con su texto aparte para copiar y pegar. Sin IA y sin servidor.
// Una imagen SVG dibujada en un lienzo no puede ir a buscar fuentes a Google: por eso antes de dibujarla
// se le meten adentro las tipografías de la marca (solo el alfabeto latino, para que no pese de más).

import { type Archivo, slug } from "@/components/brandbook/archivos";
import type { Lienzo } from "@/lib/ia/contenidos/componer";
import type { ItemPlan, Pieza } from "@/lib/ia/contenidos/esquemas";
import { FORMATOS } from "@/lib/ia/contenidos/formatos";

const fuentes = new Map<string, Promise<string>>();

async function aDataUrl(url: string) {
  const blob = await (await fetch(url)).blob();
  return new Promise<string>((ok, mal) => {
    const lector = new FileReader();
    lector.onload = () => ok(String(lector.result));
    lector.onerror = mal;
    lector.readAsDataURL(blob);
  });
}

/** El CSS de Google Fonts con los archivos de las letras adentro (latín y latín extendido) */
function fuenteIncrustada(url: string) {
  let p = fuentes.get(url);
  if (!p) {
    p = (async () => {
      const css = await (await fetch(url)).text();
      const bloques = css.split(/(?=\/\*)/).filter((b) => /\/\*\s*latin(-ext)?\s*\*\//.test(b) || !b.startsWith("/*"));
      const partes = await Promise.all(
        bloques.map(async (b) => {
          const archivo = b.match(/url\(([^)]+)\)/)?.[1];
          return archivo ? b.replace(archivo, await aDataUrl(archivo)) : b;
        }),
      );
      return partes.join("\n");
    })().catch(() => "");
    fuentes.set(url, p);
  }
  return p;
}

async function svgConFuentes(svg: string) {
  const imports = [...svg.matchAll(/@import url\('([^']+)'\);/g)];
  let final = svg;
  for (const [entero, url] of imports) final = final.replace(entero, await fuenteIncrustada(url!));
  return final;
}

/** Una lámina del feed en PNG, al tamaño real de la red (1080 de ancho) */
export async function laminaAPng(l: Lienzo) {
  const svg = await svgConFuentes(l.svg);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const lienzo = document.createElement("canvas");
    lienzo.width = l.ancho;
    lienzo.height = l.alto;
    const c = lienzo.getContext("2d");
    if (!c) throw new Error("Sin lienzo");
    c.drawImage(img, 0, 0, l.ancho, l.alto);
    const blob = await new Promise<Blob | null>((ok) => lienzo.toBlob(ok, "image/png"));
    if (!blob) throw new Error("No se pudo armar la imagen");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** El texto que acompaña la pieza: el caption con sus hashtags y, en el reel, el guion */
export function textoDePieza(item: ItemPlan, pieza: Pieza) {
  const partes = [`${FORMATOS[item.formato].nombre} · ${item.pilar}`, `Publicar: ${item.dia} · ${item.hora}`, `Idea: ${item.idea}`, ""];
  const contenido = pieza.contenido as { caption?: string; hashtags?: string[]; datos_a_confirmar?: string[] };
  if (contenido.caption) partes.push(contenido.caption.replace(/\*/g, ""), "");
  if (contenido.hashtags?.length) partes.push(contenido.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" "), "");
  if (pieza.formato === "reel") {
    const r = pieza.contenido;
    partes.push("Ganchos para probar:", ...r.ganchos.map((g) => `- ${g.texto.replace(/\*/g, "")}`), "", "Guion del reel:");
    r.escenas.forEach((e, i) =>
      partes.push(
        `${i + 1}. (${e.segundos} s) ${e.texto_en_pantalla.replace(/\*/g, "")}${e.voz_en_off ? ` · Voz: "${e.voz_en_off}"` : ""} · Toma: ${e.toma}`,
      ),
    );
    partes.push("", `Giro: ${r.giro}`, `Música: ${r.musica}`, "");
  }
  if (pieza.formato === "historia") {
    partes.push(...pieza.contenido.pantallas.map((p, i) => `Pantalla ${i + 1}: ${p.texto.replace(/\*/g, "")}`), "");
  }
  if (contenido.datos_a_confirmar?.length) partes.push(`A confirmar antes de publicar: ${contenido.datos_a_confirmar.join(", ")}`);
  return partes.join("\n").trim() + "\n";
}

/** Los archivos de una pieza, en su carpeta: una imagen por lámina y el texto */
export async function archivosDePieza(n: number, item: ItemPlan, pieza: Pieza, lienzos: Lienzo[]): Promise<Archivo[]> {
  const carpeta = `${String(n).padStart(2, "0")}-${slug(FORMATOS[item.formato].nombre)}-${slug(item.idea).slice(0, 40)}`;
  const archivos: Archivo[] = [];
  for (const [i, l] of lienzos.entries()) {
    try {
      const png = await laminaAPng(l);
      archivos.push({ nombre: `${carpeta}/${lienzos.length > 1 ? `${i + 1}` : "imagen"}.png`, datos: new Uint8Array(await png.arrayBuffer()) });
    } catch (e) {
      console.error("[descargas] lámina", carpeta, i, e);
    }
  }
  archivos.push({ nombre: `${carpeta}/texto.txt`, datos: new TextEncoder().encode(textoDePieza(item, pieza)) });
  return archivos;
}
