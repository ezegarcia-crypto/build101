// Las 4 versiones del logo elegido, la entrega base de cualquier logo:
//   1. completo (símbolo + nombre), 2. solo el nombre, 3. solo el símbolo, 4. en negativo (claro sobre el oscuro de la marca).
// Se arman en el navegador, con un lienzo, a partir de lo que se eligió arriba en el brandbook:
//   - si es una propuesta de Recraft (imagen): el completo es esa imagen sin el fondo blanco; el símbolo solo lo
//     separa la IA una vez (POST /api/logo/simbolo, lo pide generar-marca.tsx y queda guardado en la propuesta);
//     mientras tanto, o si falla, va el símbolo SVG de la identidad con un aviso;
//   - si es el símbolo SVG (solo o con el nombre): todo sale del SVG.
// El nombre solo va en la tipografía de títulos y el negativo se pinta del color claro de la paleta. Ningún color
// está escrito a mano para una marca: todo sale de la identidad. Lo usan el brandbook, las descargas y el PDF.

import { useEffect, useState } from "react";

import {
  contraste,
  esperarFuente,
  type IdentidadIA,
  type PropuestaLogo,
  rolesDe,
  svgConTamano,
  textoSobre,
} from "./identidad";

export type ClaveVersion = "completo" | "nombre" | "simbolo" | "negativo";

export type Version = {
  clave: ClaveVersion;
  titulo: string;
  /** La versión sin fondo (PNG transparente, data URL), para mostrarla sobre `fondo` */
  imagen: string;
  /** El fondo con que va (el oscuro de la marca, en el negativo); null = sin fondo */
  fondo: string | null;
  /** El PNG para descargar: con su fondo y su margen, si lleva */
  archivo: string;
};

export type Versiones = {
  lista: Version[];
  /** El logo completo pintado del color que se lee sobre el principal: para la portada del brandbook */
  portada: string;
  /** El símbolo es el SVG de la identidad (va también en vector en la descarga) */
  simboloSvg: boolean;
  /** Si el símbolo todavía se está separando, o no salió y va el de la identidad */
  aviso?: string;
};

export const TITULOS: Record<ClaveVersion, string> = {
  completo: "Logo completo",
  nombre: "Solo el nombre",
  simbolo: "Solo el símbolo",
  negativo: "En negativo",
};

// ---- Lienzos ----

/** El lado de los dibujos: los PNG que se descargan salen de este tamaño (más que 1024, para que no se pixelen) */
const LADO = 2048;

function lienzo(ancho: number, alto: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(ancho));
  c.height = Math.max(1, Math.round(alto));
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) throw new Error("Sin lienzo");
  return [c, x] as const;
}

async function cargar(src: string) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();
  return img;
}

/** Cuánta "tinta" tiene un pixel: lo que se aleja del blanco (0 = blanco, 255 = color pleno u oscuro) */
const tintaDe = (r: number, g: number, b: number) => Math.max(255 - r, 255 - g, 255 - b);

/**
 * La imagen sin el fondo blanco y recortada a lo que tiene dibujo, con un margen parejo. Lo casi blanco
 * (ruido de la compresión, detalles blancos dentro del símbolo) queda transparente; los bordes, suaves.
 */
async function sinFondo(src: string, lado = LADO) {
  const img = await cargar(src);
  // Se agranda (con suavizado) ANTES de sacar el fondo: así los bordes salen lisos en grande, no en escalones.
  // Los logos de la IA son de 1024; el resultado queda de 2048, que alcanza para imprenta chica y redes.
  const escala = lado / Math.max(img.naturalWidth, img.naturalHeight);
  const [w, h] = [Math.round(img.naturalWidth * escala) || lado, Math.round(img.naturalHeight * escala) || lado];
  const [c, x] = lienzo(w, h);
  x.fillStyle = "#ffffff";
  x.fillRect(0, 0, w, h);
  x.imageSmoothingEnabled = true;
  x.imageSmoothingQuality = "high";
  x.drawImage(img, 0, 0, w, h);
  const datos = x.getImageData(0, 0, w, h);
  const p = datos.data;
  let [x0, y0, x1, y1] = [w, h, -1, -1];
  for (let i = 0; i < p.length; i += 4) {
    const a = Math.min(1, Math.max(0, (tintaDe(p[i]!, p[i + 1]!, p[i + 2]!) - 8) / 48));
    p[i + 3] = Math.round(a * 255);
    if (a > 0.1) {
      const px = (i / 4) % w;
      const py = Math.floor(i / 4 / w);
      if (px < x0) x0 = px;
      if (px > x1) x1 = px;
      if (py < y0) y0 = py;
      if (py > y1) y1 = py;
    }
  }
  x.putImageData(datos, 0, 0);
  if (x1 < 0) return c; // vacía: se devuelve así y la valida quien la usa
  const margen = Math.round(Math.max(x1 - x0, y1 - y0) * 0.06);
  const [cw, ch] = [x1 - x0 + 1 + margen * 2, y1 - y0 + 1 + margen * 2];
  const [recorte, rx] = lienzo(cw, ch);
  rx.drawImage(c, x0 - margen, y0 - margen, cw, ch, 0, 0, cw, ch);
  return recorte;
}

/** Qué parte de la imagen tiene dibujo (0 a 1): para descartar un resultado vacío o que es todo fondo */
function cobertura(c: HTMLCanvasElement) {
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) return 0;
  const p = x.getImageData(0, 0, c.width, c.height).data;
  let llenos = 0;
  for (let i = 3; i < p.length; i += 4) if (p[i]! > 128) llenos++;
  return llenos / (c.width * c.height);
}

/** El mismo dibujo, todo de un color (respeta los bordes suaves y los huecos) */
function pintar(fuente: HTMLCanvasElement, color: string) {
  const [c, x] = lienzo(fuente.width, fuente.height);
  x.drawImage(fuente, 0, 0);
  x.globalCompositeOperation = "source-in";
  x.fillStyle = color;
  x.fillRect(0, 0, c.width, c.height);
  return c;
}

/** El dibujo sobre un fondo de color, con aire alrededor */
function conFondo(fuente: HTMLCanvasElement, fondo: string, aire = 0.18) {
  const margen = Math.round(Math.max(fuente.width, fuente.height) * aire);
  const [c, x] = lienzo(fuente.width + margen * 2, fuente.height + margen * 2);
  x.fillStyle = fondo;
  x.fillRect(0, 0, c.width, c.height);
  x.drawImage(fuente, margen, margen);
  return c;
}

/** El símbolo y el nombre lado a lado, centrados en altura */
function juntar(simbolo: HTMLCanvasElement, nombre: HTMLCanvasElement) {
  const alto = nombre.height * 1.5;
  const ancho = (simbolo.width / simbolo.height) * alto;
  const separacion = alto * 0.12;
  const [c, x] = lienzo(ancho + separacion + nombre.width, alto);
  x.drawImage(simbolo, 0, 0, ancho, alto);
  x.drawImage(nombre, ancho + separacion, (alto - nombre.height) / 2);
  return c;
}

/** El nombre de la marca en su tipografía de títulos, sin fondo */
async function soloNombre(identidad: IdentidadIA, color: string, tamano = 360) {
  const { titulos } = identidad.tipografias;
  await esperarFuente(identidad.fuentes_url, titulos);
  const letra = `${tamano}px "${titulos}", Georgia, serif`;
  const [, medir] = lienzo(1, 1);
  medir.font = letra;
  const m = medir.measureText(identidad.nombre);
  const arriba = Math.ceil(m.actualBoundingBoxAscent || tamano * 0.8);
  const abajo = Math.ceil(m.actualBoundingBoxDescent || tamano * 0.2);
  const margen = Math.round(tamano * 0.12);
  const izquierda = Math.ceil(m.actualBoundingBoxLeft || 0);
  const ancho = Math.ceil((m.actualBoundingBoxRight || m.width) + izquierda);
  const [c, x] = lienzo(ancho + margen * 2, arriba + abajo + margen * 2);
  x.font = letra;
  x.fillStyle = color;
  x.textBaseline = "alphabetic";
  x.fillText(identidad.nombre, margen + izquierda, margen + arriba);
  return c;
}

async function svgALienzo(svg: string) {
  const url = URL.createObjectURL(new Blob([svgConTamano(svg, LADO)], { type: "image/svg+xml" }));
  try {
    return await sinFondo(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const png = (c: HTMLCanvasElement) => c.toDataURL("image/png");

// ---- Colores ----

const esHex = (v?: string) => !!v && /^#[0-9a-f]{6}$/i.test(v.trim());

function luz(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** El negativo: el color más oscuro de la marca de fondo y, encima, el que mejor se lee (el claro) */
export function coloresNegativo(paleta: IdentidadIA["paleta"]) {
  const validos = paleta.map((c) => c.hex).filter(esHex);
  const oscuro = [...validos].sort((a, b) => luz(a) - luz(b))[0] ?? "#1e1e1c";
  // Si la paleta no tiene un oscuro de verdad, el negativo va sobre el texto (o casi negro) para que se lea
  const fondo = contraste(oscuro, "#ffffff") >= 4.5 ? oscuro : rolesDe(paleta).texto;
  const final = contraste(fondo, "#ffffff") >= 4.5 ? fondo : "#1e1e1c";
  return { oscuro: final, claro: textoSobre(final, paleta) };
}

// ---- El símbolo que separa la IA ----

/**
 * Limpia lo que devolvió la IA (sin fondo, recortado, más chico para que entre en el guardado del navegador).
 * Devuelve null si quedó vacío o todo lleno: entonces no sirve y se avisa.
 */
export async function limpiarSimbolo(imagen: string) {
  const c = await sinFondo(imagen);
  const cubre = cobertura(c);
  if (c.width < 24 || c.height < 24 || cubre < 0.03 || cubre > 0.97) return null;
  // 1024 de lado como mucho; en WebP donde se puede (Chrome), que pesa menos en el guardado del navegador
  const escala = Math.min(1, 1024 / Math.max(c.width, c.height));
  const [chico, x] = lienzo(c.width * escala, c.height * escala);
  x.imageSmoothingQuality = "high";
  x.drawImage(c, 0, 0, chico.width, chico.height);
  return chico.toDataURL("image/webp", 0.92);
}

/** El logo achicado para mandarlo a la IA (PNG de 768, liviano) */
export async function logoParaEnviar(imagen: string) {
  const img = await cargar(imagen);
  const [c, x] = lienzo(768, 768);
  x.fillStyle = "#ffffff";
  x.fillRect(0, 0, 768, 768);
  x.drawImage(img, 0, 0, 768, 768);
  return png(c);
}

// ---- Las 4 versiones ----

export async function armarVersiones(
  identidad: IdentidadIA,
  logo: PropuestaLogo | null,
  separando = false,
): Promise<Versiones | null> {
  const { paleta, logo: ident } = identidad;
  const c = rolesDe(paleta);
  const neg = coloresNegativo(paleta);
  const svg = ident.isotipo_svg;

  const nombre = await soloNombre(identidad, c.principal);
  const simboloSvg = svg ? await svgALienzo(svg).catch(() => null) : null;

  let completo: HTMLCanvasElement | null;
  let simbolo: HTMLCanvasElement | null = null;
  let aviso: string | undefined;
  let deSvg = false;
  if (logo) {
    completo = await sinFondo(logo.imagen);
    if (logo.simbolo) simbolo = await sinFondo(logo.simbolo).catch(() => null);
    if (!simbolo && separando) {
      aviso = "Estamos separando el símbolo de tu logo…"; // mientras tanto, la lámina espera (no va otro símbolo)
    } else if (!simbolo) {
      simbolo = simboloSvg;
      deSvg = !!simbolo;
      aviso = logo.simboloFallo
          ? simbolo
            ? "No pudimos separar el símbolo de este logo: por ahora va el símbolo de tu marca."
            : "No pudimos separar el símbolo de este logo."
          : simbolo
            ? "Por ahora va el símbolo de tu marca."
            : undefined;
    }
  } else {
    if (!simboloSvg) return null;
    simbolo = simboloSvg;
    deSvg = true;
    completo = juntar(simboloSvg, nombre);
  }

  const version = (clave: ClaveVersion, dibujo: HTMLCanvasElement, fondo: string | null = null): Version => ({
    clave,
    titulo: TITULOS[clave],
    imagen: png(dibujo),
    fondo,
    archivo: png(fondo ? conFondo(dibujo, fondo) : dibujo),
  });

  const lista: Version[] = [version("completo", completo), version("nombre", nombre)];
  if (simbolo) lista.push(version("simbolo", simbolo));
  lista.push(version("negativo", pintar(completo, neg.claro), neg.oscuro));

  return {
    lista,
    portada: png(pintar(completo, textoSobre(c.principal, paleta))),
    simboloSvg: deSvg,
    aviso,
  };
}

/**
 * Las versiones del logo elegido, que se rearman cuando cambia la paleta, el logo elegido o su símbolo.
 * `logo` null = el elegido es el símbolo SVG (solo o con el nombre). Sin IA: todo en el navegador.
 */
export function useVersiones(identidad: IdentidadIA | null, logo: PropuestaLogo | null, separando = false, activo = true) {
  const [versiones, setVersiones] = useState<Versiones | null>(null);
  const huella = [
    identidad?.nombre,
    identidad?.paleta.map((c) => c.hex).join(),
    identidad?.tipografias.titulos,
    identidad?.logo.isotipo_svg,
    logo?.imagen.slice(-80),
    logo?.simbolo?.slice(-80),
    logo?.simboloFallo,
    separando,
  ].join("|");

  // La huella resume todo lo que cambia el dibujo (identidad y logo son objetos nuevos en cada render)
  useEffect(() => {
    if (!activo || !identidad) return;
    let vigente = true;
    armarVersiones(identidad, logo, separando)
      .then((v) => vigente && setVersiones(v))
      .catch((e) => {
        console.error("[versiones]", e);
        if (vigente) setVersiones(null);
      });
    return () => {
      vigente = false;
    };
  }, [huella, activo]);

  return versiones;
}
