import type { Pieza } from "@/lib/ia/contenidos/esquemas";
import { FORMATOS } from "@/lib/ia/contenidos/formatos";
import { componerEditorial } from "@/lib/ia/contenidos/componer-editorial";
import type { Kit } from "@/lib/ia/contenidos/kit";

// El compositor: dibuja cada pieza en SVG con la marca del cliente. Sin IA y sin dependencias de
// servidor, así que corre igual en la pantalla (para redibujar cuando llegan las imágenes) que en
// el servidor. Para la misma entrada da siempre lo mismo.
//
// Lo que garantiza:
// - Colores y tipografías salen de la identidad; si un par de colores no se lee, elige otro.
// - El texto se achica y se parte en líneas hasta entrar; nunca se corta.
// - El isotipo se usa tal cual (SVG del módulo A), con el nombre al lado. Nunca se redibuja.
// - Historias y reels respetan la zona segura de arriba y de abajo.
// - Mientras una imagen no llegó, su lugar se pinta con un color de la marca.

export type Imagenes = Record<string, string>;
export type Lienzo = { clave: string; svg: string; ancho: number; alto: number; segundos?: number };

// ── Color ────────────────────────────────────────────────────────────────────────────────────

function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

export const NEGRO = "#141414";
export const BLANCO = "#FAFAF7";

export function elMasLegible(sobre: string, candidatos: string[]): string {
  return [...candidatos, NEGRO, BLANCO].reduce((mejor, c) => (contraste(c, sobre) > contraste(mejor, sobre) ? c : mejor));
}

export type Colores = {
  fondo: string;
  texto: string;
  principal: string;
  sobrePrincipal: string;
  /** El acento cuando va como texto sobre el fondo. Si no se lee, es el color de texto. */
  acento: string;
  apoyo: string;
};

export function coloresDeMarca(identidad: Kit): Colores {
  const p = identidad.paleta;
  const rol = (r: string) => p.find((c) => c.rol === r)?.hex;
  const hexes = p.map((c) => c.hex);
  const fondo = rol("fondo") ?? hexes.reduce((a, b) => (luminancia(b) > luminancia(a) ? b : a));
  const textoPedido = rol("texto");
  const texto = textoPedido && contraste(textoPedido, fondo) >= 4.5 ? textoPedido : elMasLegible(fondo, hexes);
  const principal = rol("principal") ?? rol("acento") ?? texto;
  const acentoPedido = rol("acento") ?? principal;
  return {
    fondo,
    texto,
    principal,
    sobrePrincipal: elMasLegible(principal, hexes),
    acento: contraste(acentoPedido, fondo) >= 3 ? acentoPedido : texto,
    apoyo: rol("apoyo") ?? principal,
  };
}

// ── Texto ────────────────────────────────────────────────────────────────────────────────────

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** pegada: va sin espacio antes (la coma o los dos puntos que siguen a una palabra de acento). */
export type Palabra = { t: string; acento: boolean; pegada: boolean };

/** "Pan de *masa madre*" → palabras, con las marcadas como acento. */
export function palabras(texto: string): Palabra[] {
  return texto
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .flatMap((trozo) => {
      const acento = trozo.startsWith("*") && trozo.endsWith("*");
      const limpio = trozo.replace(/\*/g, "");
      const pegadaAlInicio = !/^\s/.test(limpio);
      return limpio
        .split(/\s+/)
        .filter(Boolean)
        .map((t, i) => ({ t, acento, pegada: i === 0 && pegadaAlInicio && /^[.,:;!?)…»]/.test(t) }));
    });
}

/** Une las palabras de una línea respetando la puntuación pegada. */
export function unir(linea: Palabra[], pintar: (p: Palabra) => string): string {
  return linea.map((p, i) => (i > 0 && !p.pegada ? " " : "") + pintar(p)).join("");
}

// Ancho medio de un carácter, en proporción al cuerpo. Conservador para que no se salga.
export const ANCHO_LETRA = 0.56;

function partir(ps: Palabra[], tamaño: number, anchoMax: number): Palabra[][] {
  const lineas: Palabra[][] = [];
  let actual: Palabra[] = [];
  let ancho = 0;
  for (const p of ps) {
    const w = (p.t.length + 1) * tamaño * ANCHO_LETRA;
    if (actual.length && ancho + w > anchoMax) {
      lineas.push(actual);
      actual = [];
      ancho = 0;
    }
    actual.push(p);
    ancho += w;
  }
  if (actual.length) lineas.push(actual);
  return lineas;
}

/** Busca el cuerpo más grande en el que el texto entra en `maxLineas` sin pasarse del ancho. */
export function ajustar(texto: string, o: { anchoMax: number; maxLineas: number; max: number; min: number }) {
  const ps = palabras(texto);
  for (let tamaño = o.max; tamaño > o.min; tamaño -= 2) {
    const lineas = partir(ps, tamaño, o.anchoMax);
    const masLarga = Math.max(...ps.map((p) => p.t.length * tamaño * ANCHO_LETRA));
    if (lineas.length <= o.maxLineas && masLarga <= o.anchoMax) return { lineas, tamaño };
  }
  return { lineas: partir(ps, o.min, o.anchoMax), tamaño: o.min };
}

export type Bloque = {
  texto: string;
  x: number;
  y: number;
  anchoMax: number;
  maxLineas: number;
  max: number;
  min: number;
  familia: string;
  peso: number;
  color: string;
  acento?: string;
  interlinea?: number;
  centrado?: boolean;
};

/** Dibuja un bloque de texto con su palabra de acento. Devuelve el SVG y dónde termina. */
export function bloque(b: Bloque): { svg: string; alto: number } {
  const { lineas, tamaño } = ajustar(b.texto, b);
  const paso = tamaño * (b.interlinea ?? 1.12);
  const ancla = b.centrado ? ` text-anchor="middle"` : "";
  const tspans = lineas
    .map((linea, i) => {
      const contenido = unir(linea, (p) => (p.acento && b.acento ? `<tspan fill="${b.acento}">${esc(p.t)}</tspan>` : esc(p.t)));
      return `<tspan x="${b.x}" y="${b.y + tamaño + i * paso}">${contenido}</tspan>`;
    })
    .join("");
  return {
    svg: `<text font-family="${esc(b.familia)}" font-size="${tamaño}" font-weight="${b.peso}" fill="${b.color}"${ancla}>${tspans}</text>`,
    alto: tamaño + (lineas.length - 1) * paso + tamaño * 0.3,
  };
}

// ── Piezas sueltas: firma, foto, botón ───────────────────────────────────────────────────────

const aBase64 = (s: string) =>
  typeof Buffer !== "undefined" ? Buffer.from(s, "utf8").toString("base64") : btoa(unescape(encodeURIComponent(s)));

/** Ancho de la firma: el isotipo (cuadrado) más el nombre al lado. */
export function anchoFirma(id: Kit, alto: number): number {
  return (id.isotipo_svg ? alto * 1.3 : 0) + id.nombre.length * alto * 0.8 * ANCHO_LETRA;
}

/**
 * La firma de la marca: el isotipo del módulo A tal cual (nunca se redibuja) y el nombre al lado
 * con la tipografía de títulos, como lo compone el brandbook. Sin isotipo, solo el nombre.
 */
export function firma(id: Kit, x: number, y: number, alto: number, sobre: string, ancla: "inicio" | "fin" | "centro" = "inicio"): string {
  const ancho = anchoFirma(id, alto);
  const x0 = ancla === "fin" ? x - ancho : ancla === "centro" ? x - ancho / 2 : x;
  const t = id.tipografias.titulos;
  const color = elMasLegible(sobre, id.paleta.map((c) => c.hex));
  const iso = id.isotipo_svg
    ? `<image href="data:image/svg+xml;base64,${aBase64(id.isotipo_svg)}" x="${x0}" y="${y}" width="${alto}" height="${alto}" preserveAspectRatio="xMidYMid meet"/>`
    : "";
  const xNombre = x0 + (id.isotipo_svg ? alto * 1.3 : 0);
  return `${iso}<text x="${xNombre}" y="${y + alto * 0.78}" font-family="${esc(t.familia)}" font-size="${alto * 0.8}" font-weight="${t.peso}" fill="${color}">${esc(id.nombre)}</text>`;
}

/** La firma sobre una foto va en una placa del color de fondo, para que se lea sobre cualquier imagen. */
function firmaSobreFoto(id: Kit, x: number, y: number, alto: number, c: Colores): string {
  const ancho = anchoFirma(id, alto);
  const pad = alto * 0.45;
  return `<rect x="${x - pad}" y="${y - pad}" width="${ancho + pad * 2}" height="${alto + pad * 2}" rx="${pad}" fill="${c.fondo}"/>${firma(id, x, y, alto, c.fondo)}`;
}

export function foto(url: string | undefined, x: number, y: number, ancho: number, alto: number, relleno: string): string {
  if (!url) return `<rect x="${x}" y="${y}" width="${ancho}" height="${alto}" fill="${relleno}" opacity="0.35"/>`;
  return `<image href="${esc(url)}" x="${x}" y="${y}" width="${ancho}" height="${alto}" preserveAspectRatio="xMidYMid slice"/>`;
}

function boton(texto: string, x: number, y: number, c: Colores, familia: string, tamaño = 34): string {
  const ancho = texto.length * tamaño * ANCHO_LETRA + tamaño * 2;
  const alto = tamaño * 2.1;
  return `<rect x="${x}" y="${y}" width="${ancho}" height="${alto}" rx="${alto / 2}" fill="${c.principal}"/><text x="${x + ancho / 2}" y="${y + alto / 2 + tamaño * 0.35}" text-anchor="middle" font-family="${esc(familia)}" font-size="${tamaño}" font-weight="600" fill="${c.sobrePrincipal}">${esc(texto)}</text>`;
}

export function lienzo(id: Kit, ancho: number, alto: number, fondo: string, cuerpo: string, alt: string): string {
  const fuentes = id.fuentes
    .map((u) => `@import url('${u}');`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}" role="img" aria-label="${esc(alt)}"><style>${fuentes}</style><rect width="${ancho}" height="${alto}" fill="${fondo}"/>${cuerpo}</svg>`;
}

/** Variación determinística: la misma pieza siempre sale igual, piezas distintas varían. */
export function semilla(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export const DESLIZA = { vos: "Deslizá →", tu: "Desliza →", usted: "Deslice →" } as const;
const ESCRIBI = { vos: "Escribí algo…", tu: "Escribe algo…", usted: "Escriba algo…" } as const;

// ── Composiciones ────────────────────────────────────────────────────────────────────────────

type Cuadro = {
  id: Kit;
  c: Colores;
  ancho: number;
  alto: number;
  margen: number;
  titular: string;
  bajada?: string | null;
  cta?: string | null;
  url?: string;
  conFoto: boolean;
  variante: number;
  arriba: number; // zona segura
  pie?: string; // "2/5", "Deslizá →"
};

/** Con foto: la imagen a sangre y un panel sólido de la marca con el texto. */
function cuadroConFoto(k: Cuadro): string {
  const { id, c, ancho, alto, margen } = k;
  const T = id.tipografias;
  const anchoTexto = ancho - margen * 2;
  // Primero se mide el texto para saber qué alto lleva el panel; después se dibuja en su lugar.
  const titulo = bloque({ texto: k.titular, x: margen, y: 0, anchoMax: anchoTexto, maxLineas: 3, max: 92, min: 52, familia: T.titulos.familia, peso: T.titulos.peso, color: c.texto, acento: c.acento });
  const baj = k.bajada
    ? bloque({ texto: k.bajada, x: margen, y: 0, anchoMax: anchoTexto, maxLineas: 3, max: 36, min: 28, familia: T.texto.familia, peso: T.texto.peso, color: c.texto, interlinea: 1.3 })
    : null;
  const altoBoton = k.cta ? 34 * 2.1 + 28 : 0;
  const altoPanel = margen * 0.8 + 60 + titulo.alto + (baj ? 20 + baj.alto : 0) + altoBoton + margen * 0.8 + (k.pie ? 40 : 0);
  const panelArriba = k.variante % 2 === 1 && !k.cta && k.arriba === 0;
  const yPanel = panelArriba ? 0 : alto - altoPanel - k.arriba;
  const y0 = yPanel + margen * 0.8;
  const t2 = bloque({ texto: k.titular, x: margen, y: y0 + 60, anchoMax: anchoTexto, maxLineas: 3, max: 92, min: 52, familia: T.titulos.familia, peso: T.titulos.peso, color: c.texto, acento: c.acento });
  const b2 = k.bajada
    ? bloque({ texto: k.bajada, x: margen, y: y0 + 60 + t2.alto + 20, anchoMax: anchoTexto, maxLineas: 3, max: 36, min: 28, familia: T.texto.familia, peso: T.texto.peso, color: c.texto, interlinea: 1.3 })
    : null;
  const yBoton = y0 + 60 + t2.alto + (b2 ? 20 + b2.alto : 0) + 20;
  return [
    foto(k.url, 0, 0, ancho, alto, c.apoyo),
    `<rect x="0" y="${yPanel}" width="${ancho}" height="${altoPanel + k.arriba}" fill="${c.fondo}"/>`,
    `<rect x="${margen}" y="${y0}" width="56" height="8" fill="${c.principal}"/>`,
    firma(id, ancho - margen, y0 - 8, 44, c.fondo, "fin"),
    t2.svg,
    b2?.svg ?? "",
    k.cta ? boton(k.cta, margen, yBoton, c, T.texto.familia) : "",
    k.pie ? `<text x="${ancho - margen}" y="${yPanel + altoPanel - margen * 0.5}" text-anchor="end" font-family="${esc(T.texto.familia)}" font-size="28" fill="${c.texto}" opacity="0.7">${esc(k.pie)}</text>` : "",
  ].join("");
}

/** Sin foto: el fondo de la marca, el titular grande y un módulo de color. */
function cuadroTipografico(k: Cuadro, invertido = false, maxLineas = 5): string {
  const { id, ancho, alto, margen } = k;
  const c = invertido
    ? { ...k.c, fondo: k.c.principal, texto: k.c.sobrePrincipal, acento: k.c.sobrePrincipal, principal: k.c.fondo, sobrePrincipal: k.c.texto }
    : k.c;
  const T = id.tipografias;
  const anchoTexto = ancho - margen * 2;
  const top = margen + k.arriba;
  const t = bloque({ texto: k.titular, x: margen, y: top + 140, anchoMax: anchoTexto, maxLineas, max: 128, min: 60, familia: T.titulos.familia, peso: T.titulos.peso, color: c.texto, acento: c.acento });
  const b = k.bajada
    ? bloque({ texto: k.bajada, x: margen, y: top + 140 + t.alto + 36, anchoMax: anchoTexto, maxLineas: 8, max: 40, min: 28, familia: T.texto.familia, peso: T.texto.peso, color: c.texto, interlinea: 1.35 })
    : null;
  const abajo = alto - margen - k.arriba;
  const lado = 120 + (k.variante % 3) * 30;
  return [
    `<rect x="0" y="0" width="${ancho}" height="${alto}" fill="${c.fondo}"/>`,
    `<rect x="${ancho - margen - lado}" y="${top}" width="${lado}" height="${lado}" fill="${c.principal}"${invertido ? ` opacity="0.25"` : ""}/>`,
    firma(id, margen, top, 48, c.fondo),
    t.svg,
    b?.svg ?? "",
    k.cta ? boton(k.cta, margen, abajo - 72, c as Colores, T.texto.familia) : "",
    k.pie ? `<text x="${ancho - margen}" y="${abajo}" text-anchor="end" font-family="${esc(T.texto.familia)}" font-size="30" fill="${c.texto}" opacity="0.7">${esc(k.pie)}</text>` : "",
  ].join("");
}

/** El sticker de la historia, dibujado como se va a ver (la red lo reemplaza por el real). */
export function sticker(s: { tipo: string; texto: string | null; opciones: string[] }, y: number, c: Colores, id: Kit, ancho: number): string {
  if (s.tipo === "ninguno") return "";
  const fam = esc(id.tipografias.texto.familia);
  const w = 760;
  const x = (ancho - w) / 2;
  const titulo = s.texto ? `<text x="${ancho / 2}" y="${y + 70}" text-anchor="middle" font-family="${fam}" font-size="38" font-weight="600" fill="${NEGRO}">${esc(s.texto)}</text>` : "";
  let cuerpo = "";
  let h = 200;
  if (s.tipo === "encuesta") {
    const ops = (s.opciones.length ? s.opciones : ["Sí", "No"]).slice(0, 2);
    cuerpo = ops
      .map((o, i) => `<rect x="${x + 40}" y="${y + 110 + i * 100}" width="${w - 80}" height="80" rx="40" fill="#EFEFEF"/><text x="${ancho / 2}" y="${y + 162 + i * 100}" text-anchor="middle" font-family="${fam}" font-size="34" fill="${NEGRO}">${esc(o)}</text>`)
      .join("");
    h = 340;
  } else if (s.tipo === "pregunta") {
    cuerpo = `<rect x="${x + 40}" y="${y + 110}" width="${w - 80}" height="90" rx="20" fill="#EFEFEF"/><text x="${ancho / 2}" y="${y + 166}" text-anchor="middle" font-family="${fam}" font-size="30" fill="#8A8A8A">${ESCRIBI[id.voz.trato]}</text>`;
    h = 240;
  } else if (s.tipo === "cuenta_regresiva") {
    cuerpo = `<text x="${ancho / 2}" y="${y + 180}" text-anchor="middle" font-family="${fam}" font-size="80" font-weight="700" fill="${c.principal}">00 : 00 : 00</text>`;
    h = 230;
  } else if (s.tipo === "link") {
    return `<rect x="${(ancho - 520) / 2}" y="${y}" width="520" height="96" rx="48" fill="#FFFFFF"/><text x="${ancho / 2}" y="${y + 60}" text-anchor="middle" font-family="${fam}" font-size="34" font-weight="600" fill="#2F6BFF">🔗 ${esc(s.texto ?? "Link")}</text>`;
  }
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36" fill="#FFFFFF"/>${titulo}${cuerpo}`;
}

/** El texto de una escena de reel: grande, sobre una caja de la marca para que se lea sobre cualquier foto. */
function textoEscena(texto: string, y: number, c: Colores, id: Kit, ancho: number): string {
  const T = id.tipografias.titulos;
  const { lineas, tamaño } = ajustar(texto, { anchoMax: ancho - 220, maxLineas: 3, max: 86, min: 52 });
  const paso = tamaño * 1.25;
  return lineas
    .map((l, i) => {
      const contenido = unir(l, (p) => (p.acento ? `<tspan fill="${c.principal === c.fondo ? c.texto : c.principal}">${esc(p.t)}</tspan>` : esc(p.t)));
      const w = unir(l, (p) => p.t).length * tamaño * ANCHO_LETRA + 48;
      const yy = y + i * paso;
      return `<rect x="${(ancho - w) / 2}" y="${yy}" width="${w}" height="${tamaño * 1.2}" rx="8" fill="${c.fondo}"/><text x="${ancho / 2}" y="${yy + tamaño * 0.92}" text-anchor="middle" font-family="${esc(T.familia)}" font-size="${tamaño}" font-weight="${T.peso}" fill="${c.texto}">${contenido}</text>`;
    })
    .join("");
}

// ── La función pública ───────────────────────────────────────────────────────────────────────

/**
 * Dibuja todos los lienzos de una pieza. `imagenes` es clave → URL (o data URL) de la imagen.
 * El estilo sale del kit (`kit.estilo`, ver estilos.ts): lo de abajo es "impacto", el de siempre.
 */
export function componerPieza(pieza: Pieza, identidad: Kit, imagenes: Imagenes = {}): Lienzo[] {
  if (identidad.estilo === "editorial") return componerEditorial(pieza, identidad, imagenes);
  const c = coloresDeMarca(identidad);
  const f = FORMATOS[pieza.formato];
  const { ancho, alto } = f;
  const margen = 84;
  const v = semilla(pieza.id + pieza.plan.idea);
  const base = { id: identidad, c, ancho, alto, margen, variante: v, arriba: f.zona_segura };

  switch (pieza.formato) {
    case "post": {
      const p = pieza.contenido;
      const k = { ...base, titular: p.titular, bajada: p.bajada, cta: p.cta, url: imagenes.portada, conFoto: p.visual.tipo === "foto" };
      const cuerpo = k.conFoto ? cuadroConFoto(k) : cuadroTipografico(k);
      return [{ clave: "post", ancho, alto, svg: lienzo(identidad, ancho, alto, c.fondo, cuerpo, p.visual.alt) }];
    }
    case "carrusel": {
      const k0 = pieza.contenido;
      const n = k0.laminas.length;
      return k0.laminas.map((l, i) => {
        const pie = i === 0 ? DESLIZA[identidad.voz.trato] : `${i + 1}/${n}`;
        const k = { ...base, titular: l.titular, bajada: l.texto, pie, conFoto: false, variante: v + i };
        let cuerpo: string;
        if (i === 0 && k0.visual.tipo === "foto") cuerpo = cuadroConFoto({ ...k, url: imagenes.portada, conFoto: true });
        else cuerpo = cuadroTipografico(k, i === n - 1);
        return { clave: `lamina-${i + 1}`, ancho, alto, svg: lienzo(identidad, ancho, alto, c.fondo, cuerpo, `${k0.visual.alt} · lámina ${i + 1} de ${n}`) };
      });
    }
    case "historia": {
      return pieza.contenido.pantallas.map((p, i) => {
        const k = { ...base, titular: p.texto, conFoto: p.visual.tipo === "foto", url: imagenes[`pantalla-${i + 1}`], variante: v + i };
        // El sticker va abajo, dentro de la zona segura; con sticker, el titular tiene menos líneas.
        const conSticker = p.sticker.tipo !== "ninguno";
        const yStk = alto - f.zona_segura - 380;
        const cuerpo = (k.conFoto
          ? [foto(k.url, 0, 0, ancho, alto, c.apoyo), firmaSobreFoto(identidad, margen, f.zona_segura, 44, c), textoEscena(p.texto, alto * (conSticker ? 0.34 : 0.42), c, identidad, ancho)].join("")
          : cuadroTipografico(k, false, conSticker ? 4 : 6)) + sticker(p.sticker, yStk, c, identidad, ancho);
        return { clave: `pantalla-${i + 1}`, ancho, alto, segundos: 5, svg: lienzo(identidad, ancho, alto, c.fondo, cuerpo, p.visual.alt) };
      });
    }
    case "reel": {
      const r = pieza.contenido;
      const n = r.escenas.length;
      return r.escenas.map((e, i) => {
        const [desde, hasta] = e.segundos.split("-").map((s) => parseFloat(s.replace(",", ".")));
        const segundos = Number.isFinite(desde) && Number.isFinite(hasta) && hasta > desde ? hasta - desde : 3;
        const ultima = i === n - 1;
        const cuerpo = ultima
          ? [
              `<rect width="${ancho}" height="${alto}" fill="${c.principal}"/>`,
              firma(identidad, ancho / 2, alto * 0.38, 96, c.principal, "centro"),
              bloque({ texto: e.texto_en_pantalla, x: ancho / 2, y: alto * 0.5, anchoMax: ancho - 200, maxLineas: 3, max: 72, min: 44, familia: identidad.tipografias.titulos.familia, peso: identidad.tipografias.titulos.peso, color: c.sobrePrincipal, centrado: true }).svg,
            ].join("")
          : [foto(imagenes[`escena-${i + 1}`], 0, 0, ancho, alto, c.apoyo), textoEscena(e.texto_en_pantalla, i === 0 ? alto * 0.3 : alto * 0.62, c, identidad, ancho)].join("");
        return { clave: `escena-${i + 1}`, ancho, alto, segundos, svg: lienzo(identidad, ancho, alto, c.fondo, cuerpo, e.toma) };
      });
    }
  }
}
