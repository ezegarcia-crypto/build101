import {
  ANCHO_LETRA,
  bloque,
  type Colores,
  coloresDeMarca,
  contraste,
  DESLIZA,
  esc,
  firma,
  type Imagenes,
  type Lienzo,
  lienzo,
  semilla,
  sticker,
} from "@/lib/ia/contenidos/componer";
import type { Pieza } from "@/lib/ia/contenidos/esquemas";
import { FORMATOS } from "@/lib/ia/contenidos/formatos";
import type { Kit } from "@/lib/ia/contenidos/kit";

// Estilo 2 · Editorial. Mismas garantías que el estilo de siempre (componer.ts: colores y letras de
// la marca, contraste, el texto entra siempre, isotipo tal cual, zona segura), con otro concepto:
// - Papel: el fondo de la marca con mucho aire; la foto no va a sangre, va recortada en una forma
//   (arco, círculo, píldora) y el texto se apoya en el papel, nunca sobre la foto.
// - Letra: titulares más grandes y apretados, etiquetas chicas en mayúsculas espaciadas, filetes
//   finos, números de lámina calados y el llamado a la acción como link subrayado, sin botón.
// - Ritmo de color: las piezas tipográficas alternan papel y tinta (el color principal lleno).

type Forma = "arco" | "circulo" | "pildora" | "redondeado";

const MARGEN = 96;

/** Colores con el principal lleno de fondo: la "tinta" del ritmo de color. */
function tinta(c: Colores): Colores {
  return { ...c, fondo: c.principal, texto: c.sobrePrincipal, acento: c.sobrePrincipal, principal: c.sobrePrincipal, sobrePrincipal: c.principal };
}

/** El acento como trazo (filetes, números calados): si no se ve sobre el fondo, el color de texto. */
function trazo(c: Colores): string {
  return contraste(c.acento, c.fondo) >= 3 ? c.acento : c.texto;
}

/**
 * La foto recortada en una forma. Mientras no llega, la forma se pinta con un color de la marca.
 * El id del recorte sale de la geometría: dos lienzos en la misma página nunca se pisan con uno distinto.
 */
function recorte(url: string | undefined, forma: Forma, x: number, y: number, w: number, h: number, relleno: string): string {
  const id = `ed${semilla(`${forma}|${x}|${y}|${w}|${h}`).toString(36)}`;
  const r = w / 2;
  const figura =
    forma === "circulo"
      ? `<circle cx="${x + r}" cy="${y + h / 2}" r="${Math.min(r, h / 2)}"/>`
      : forma === "arco"
        ? `<path d="M${x} ${y + h} L${x} ${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} L${x + w} ${y + h} Z"/>`
        : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${forma === "pildora" ? r : 40}"/>`;
  const dentro = url
    ? `<image href="${esc(url)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${relleno}" opacity="0.3"/>`;
  return `<defs><clipPath id="${id}">${figura}</clipPath></defs><g clip-path="url(#${id})">${dentro}</g>`;
}

/** Etiqueta chica en mayúsculas espaciadas. Si no entra en el ancho, se achica (nunca se corta). */
function etiqueta(texto: string, x: number, y: number, color: string, familia: string, o: { ancho?: number; ancla?: "inicio" | "fin" | "centro" } = {}): string {
  const t = texto.toUpperCase();
  const espacio = 4;
  let tamaño = 26;
  const medir = (s: number) => t.length * (s * 0.68 + espacio);
  while (o.ancho && tamaño > 16 && medir(tamaño) > o.ancho) tamaño -= 1;
  const ancla = o.ancla === "fin" ? ` text-anchor="end"` : o.ancla === "centro" ? ` text-anchor="middle"` : "";
  return `<text x="${x}" y="${y + tamaño}" font-family="${esc(familia)}" font-size="${tamaño}" font-weight="600" letter-spacing="${espacio}" fill="${color}" opacity="0.8"${ancla}>${esc(t)}</text>`;
}

const filete = (x: number, y: number, w: number, color: string) => `<rect x="${x}" y="${y}" width="${w}" height="2" fill="${color}"/>`;

/** El llamado a la acción como link subrayado, sin botón. */
function link(texto: string, x: number, y: number, c: Colores, familia: string, ancla: "inicio" | "centro" = "inicio"): string {
  const tamaño = 34;
  const t = `${texto} →`;
  const w = t.length * tamaño * ANCHO_LETRA;
  const x0 = ancla === "centro" ? x - w / 2 : x;
  return `<text x="${x0}" y="${y + tamaño}" font-family="${esc(familia)}" font-size="${tamaño}" font-weight="600" fill="${c.texto}">${esc(t)}</text>${filete(x0, y + tamaño + 14, w, trazo(c))}`;
}

type Textos = { titular: string; bajada?: string | null; cta?: string | null };

/** Titular, bajada y link, uno debajo del otro. Devuelve el SVG y dónde termina. */
function columna(id: Kit, c: Colores, t: Textos, x: number, y: number, ancho: number, o: { max: number; min: number; maxLineas: number; centrado?: boolean }) {
  const T = id.tipografias;
  const xx = o.centrado ? x + ancho / 2 : x;
  const tit = bloque({ texto: t.titular, x: xx, y, anchoMax: ancho, maxLineas: o.maxLineas, max: o.max, min: o.min, familia: T.titulos.familia, peso: T.titulos.peso, color: c.texto, acento: trazo(c), interlinea: 1.02, centrado: o.centrado });
  let fin = y + tit.alto;
  const partes = [tit.svg];
  if (t.bajada) {
    const b = bloque({ texto: t.bajada, x: xx, y: fin + 28, anchoMax: ancho, maxLineas: 4, max: 34, min: 26, familia: T.texto.familia, peso: T.texto.peso, color: c.texto, interlinea: 1.35, centrado: o.centrado });
    partes.push(`<g opacity="0.82">${b.svg}</g>`);
    fin += 28 + b.alto;
  }
  if (t.cta) {
    partes.push(link(t.cta, xx, fin + 36, c, T.texto.familia, o.centrado ? "centro" : "inicio"));
    fin += 36 + 34 + 16;
  }
  return { svg: partes.join(""), fin };
}

/** Mide cuánto ocupa la columna sin dibujarla, para centrarla en un espacio. */
const altoColumna = (id: Kit, c: Colores, t: Textos, ancho: number, o: Parameters<typeof columna>[6]) => columna(id, c, t, 0, 0, ancho, o).fin;

// ── Cuadros 4:5 (post y carrusel) ─────────────────────────────────────────────────────────────

type Cuadro = Textos & { id: Kit; c: Colores; ancho: number; alto: number; etiqueta: string; url?: string; variante: number; pie?: string };

/** Con foto: papel, la foto recortada en una forma y el texto al costado o abajo. Tres encuadres. */
function cuadroConFoto(k: Cuadro): string {
  const { id, c, ancho, alto } = k;
  const M = MARGEN;
  const fam = id.tipografias.texto.familia;
  const util = ancho - M * 2;
  const pie = k.pie ? etiqueta(k.pie, ancho - M, alto - M - 26, c.texto, fam, { ancla: "fin" }) : "";
  const tipo = k.variante % 3;

  if (tipo === 1) {
    // Círculo centrado arriba y el texto centrado abajo
    const o = { max: 84, min: 48, maxLineas: 3, centrado: true };
    // El círculo se achica si el texto es largo: abajo siempre queda lugar para la firma
    const d = Math.min(600, alto - M - 70 - 140 - 60 - altoColumna(id, c, k, util, o));
    const col = columna(id, c, k, M, 140 + d + 60, util, o);
    return [
      etiqueta(k.etiqueta, ancho / 2, M - 20, c.texto, fam, { ancho: util, ancla: "centro" }),
      recorte(k.url, "circulo", (ancho - d) / 2, 140, d, d, c.apoyo),
      col.svg,
      k.pie ? pie : firma(id, ancho / 2, alto - M - 30, 36, c.fondo, "centro"),
    ].join("");
  }

  if (tipo === 2) {
    // Columna: la foto en una píldora a la izquierda y el texto en la columna de la derecha
    const w = 430;
    const xt = M + w + 60;
    const at = ancho - M - xt;
    const o = { max: 72, min: 40, maxLineas: 6 };
    const h = altoColumna(id, c, k, at, o);
    const y = Math.max(M + 120, (alto - h) / 2);
    return [
      recorte(k.url, "pildora", M, M, w, alto - M * 2, c.apoyo),
      etiqueta(k.etiqueta, xt, M, c.texto, fam, { ancho: at }),
      filete(xt, M + 52, 64, trazo(c)),
      columna(id, c, k, xt, y, at, o).svg,
      k.pie ? pie : firma(id, xt, alto - M - 36, 36, c.fondo),
    ].join("");
  }

  // Arco a la derecha, el aire a la izquierda y el texto abajo, a todo el ancho
  const wa = 560;
  const ya = 180;
  const o = { max: 88, min: 48, maxLineas: 3 };
  // El arco se acorta si el texto es largo: el texto entra siempre, con lugar para el pie
  const ha = Math.max(380, Math.min(660, alto - M - (k.pie ? 60 : 0) - ya - 56 - altoColumna(id, c, k, util, o)));
  return [
    etiqueta(k.etiqueta, M, M - 20, c.texto, fam, { ancho: ancho - M * 2 - wa - 40 }),
    firma(id, ancho - M, M - 28, 36, c.fondo, "fin"),
    recorte(k.url, "arco", ancho - M - wa, ya, wa, ha, c.apoyo),
    `<circle cx="${M + 14}" cy="${ya + ha - 14}" r="14" fill="${trazo(c)}"/>`,
    columna(id, c, k, M, ya + ha + 56, util, o).svg,
    pie,
  ].join("");
}

/** Sin foto: el titular enorme en el centro, filetes y un círculo calado que se escapa del cuadro. */
function cuadroTipografico(k: Cuadro, conTinta: boolean): string {
  const { id, ancho, alto } = k;
  const c = conTinta ? tinta(k.c) : k.c;
  const M = MARGEN;
  const fam = id.tipografias.texto.familia;
  const util = ancho - M * 2;
  const o = { max: 140, min: 60, maxLineas: 5 };
  const h = altoColumna(id, c, k, util, o);
  const arriba = M + 90;
  const abajo = alto - M - 110;
  const y = Math.max(arriba, arriba + (abajo - arriba - h) / 2);
  return [
    `<rect width="${ancho}" height="${alto}" fill="${c.fondo}"/>`,
    `<circle cx="${ancho - 40}" cy="${110 + (k.variante % 3) * 40}" r="230" fill="none" stroke="${trazo(c)}" stroke-width="2"/>`,
    etiqueta(k.etiqueta, M, M - 20, c.texto, fam, { ancho: util - 300 }),
    filete(M, M + 34, util, c.texto),
    columna(id, c, k, M, y, util, o).svg,
    filete(M, alto - M - 70, util, c.texto),
    firma(id, M, alto - M - 40, 36, c.fondo),
    k.pie ? etiqueta(k.pie, ancho - M, alto - M - 36, c.texto, fam, { ancla: "fin" }) : "",
  ].join("");
}

/** Lámina interior del carrusel: el número calado enorme, el titular y el texto, con aire. */
function laminaInterior(k: Cuadro, numero: number, conTinta: boolean): string {
  const { id, ancho, alto } = k;
  const c = conTinta ? tinta(k.c) : k.c;
  const M = MARGEN;
  const T = id.tipografias;
  const util = ancho - M * 2;
  const n = String(numero).padStart(2, "0");
  return [
    `<rect width="${ancho}" height="${alto}" fill="${c.fondo}"/>`,
    `<text x="${M - 8}" y="${M + 230}" font-family="${esc(T.titulos.familia)}" font-size="280" font-weight="${T.titulos.peso}" fill="none" stroke="${trazo(c)}" stroke-width="2.5">${n}</text>`,
    etiqueta(k.etiqueta, ancho - M, M, c.texto, T.texto.familia, { ancho: util - 420, ancla: "fin" }),
    columna(id, c, { titular: k.titular, bajada: k.bajada }, M, M + 340, util, { max: 84, min: 48, maxLineas: 4 }).svg,
    filete(M, alto - M - 70, util, c.texto),
    firma(id, M, alto - M - 40, 36, c.fondo),
    k.pie ? etiqueta(k.pie, ancho - M, alto - M - 36, c.texto, T.texto.familia, { ancla: "fin" }) : "",
  ].join("");
}

// ── Verticales 9:16 (historia y reel), con la zona segura de arriba y de abajo ─────────────────

function historiaConFoto(id: Kit, c: Colores, texto: string, url: string | undefined, conSticker: boolean, ancho: number, alto: number, seguro: number, variante: number): string {
  const M = MARGEN;
  const util = ancho - M * 2;
  const cabecera = firma(id, M, seguro + 10, 40, c.fondo);
  if (conSticker) {
    // El texto arriba, la foto en círculo en el medio y el sticker abajo (lo pone quien llama)
    const col = columna(id, c, { titular: texto }, M, seguro + 110, util, { max: 80, min: 48, maxLineas: 3, centrado: true });
    const d = Math.min(560, alto - seguro - 400 - col.fin - 40);
    return [cabecera, col.svg, recorte(url, "circulo", (ancho - d) / 2, col.fin + 30, d, d, c.apoyo)].join("");
  }
  // Sin sticker: la foto en arco grande y el texto abajo, sobre el papel
  const forma: Forma = variante % 2 ? "redondeado" : "arco";
  return [
    cabecera,
    recorte(url, forma, M + 40, seguro + 110, util - 80, 900, c.apoyo),
    columna(id, c, { titular: texto }, M, seguro + 110 + 900 + 60, util, { max: 80, min: 48, maxLineas: 3, centrado: true }).svg,
  ].join("");
}

function verticalTipografico(id: Kit, c0: Colores, texto: string, conTinta: boolean, conSticker: boolean, ancho: number, alto: number, seguro: number): string {
  const c = conTinta ? tinta(c0) : c0;
  const M = MARGEN;
  const util = ancho - M * 2;
  const o = { max: 128, min: 56, maxLineas: conSticker ? 4 : 6 };
  const h = altoColumna(id, c, { titular: texto }, util, o);
  const arriba = seguro + 140;
  const abajo = conSticker ? alto - seguro - 420 : alto - seguro - 120;
  const y = Math.max(arriba, arriba + (abajo - arriba - h) / 2);
  return [
    `<rect width="${ancho}" height="${alto}" fill="${c.fondo}"/>`,
    `<circle cx="${ancho - 60}" cy="${seguro + 160}" r="260" fill="none" stroke="${trazo(c)}" stroke-width="2"/>`,
    firma(id, M, seguro + 10, 40, c.fondo),
    filete(M, seguro + 90, util, c.texto),
    columna(id, c, { titular: texto }, M, y, util, o).svg,
  ].join("");
}

// ── La función del estilo ─────────────────────────────────────────────────────────────────────

export function componerEditorial(pieza: Pieza, identidad: Kit, imagenes: Imagenes = {}): Lienzo[] {
  const c = coloresDeMarca(identidad);
  const f = FORMATOS[pieza.formato];
  const { ancho, alto } = f;
  const seguro = f.zona_segura;
  const v = semilla(pieza.id + pieza.plan.idea);
  const marca = pieza.plan.pilar || identidad.nombre;
  const base = { id: identidad, c, ancho, alto, variante: v, etiqueta: marca };

  switch (pieza.formato) {
    case "post": {
      const p = pieza.contenido;
      const k: Cuadro = { ...base, titular: p.titular, bajada: p.bajada, cta: p.cta, url: imagenes.portada };
      const cuerpo = p.visual.tipo === "foto" ? cuadroConFoto(k) : cuadroTipografico(k, v % 2 === 1);
      return [{ clave: "post", ancho, alto, svg: lienzo(identidad, ancho, alto, c.fondo, cuerpo, p.visual.alt) }];
    }
    case "carrusel": {
      const k0 = pieza.contenido;
      const n = k0.laminas.length;
      return k0.laminas.map((l, i) => {
        const pie = i === 0 ? DESLIZA[identidad.voz.trato] : `${i + 1}/${n}`;
        const k: Cuadro = { ...base, titular: l.titular, bajada: l.texto, pie, variante: v + i };
        let cuerpo: string;
        if (i === 0) cuerpo = k0.visual.tipo === "foto" ? cuadroConFoto({ ...k, url: imagenes.portada }) : cuadroTipografico(k, true);
        else cuerpo = laminaInterior(k, i, i === n - 1);
        return { clave: `lamina-${i + 1}`, ancho, alto, svg: lienzo(identidad, ancho, alto, c.fondo, cuerpo, `${k0.visual.alt} · lámina ${i + 1} de ${n}`) };
      });
    }
    case "historia": {
      return pieza.contenido.pantallas.map((p, i) => {
        const conSticker = p.sticker.tipo !== "ninguno";
        const yStk = alto - seguro - 380;
        const cuerpo =
          (p.visual.tipo === "foto"
            ? historiaConFoto(identidad, c, p.texto, imagenes[`pantalla-${i + 1}`], conSticker, ancho, alto, seguro, v + i)
            : verticalTipografico(identidad, c, p.texto, (v + i) % 2 === 1, conSticker, ancho, alto, seguro)) + sticker(p.sticker, yStk, c, identidad, ancho);
        return { clave: `pantalla-${i + 1}`, ancho, alto, segundos: 5, svg: lienzo(identidad, ancho, alto, c.fondo, cuerpo, p.visual.alt) };
      });
    }
    case "reel": {
      const r = pieza.contenido;
      const n = r.escenas.length;
      const M = MARGEN;
      const util = ancho - M * 2;
      return r.escenas.map((e, i) => {
        const [desde, hasta] = e.segundos.split("-").map((s) => parseFloat(s.replace(",", ".")));
        const segundos = Number.isFinite(desde) && Number.isFinite(hasta) && hasta > desde ? hasta - desde : 3;
        const ultima = i === n - 1;
        const cuerpo = ultima
          ? [
              `<circle cx="${ancho / 2}" cy="${alto * 0.42}" r="340" fill="none" stroke="${trazo(c)}" stroke-width="2"/>`,
              firma(identidad, ancho / 2, alto * 0.42 - 120, 88, c.fondo, "centro"),
              columna(identidad, c, { titular: e.texto_en_pantalla }, M + 60, alto * 0.42 + 10, util - 120, { max: 64, min: 40, maxLineas: 3, centrado: true }).svg,
            ].join("")
          : [
              recorte(imagenes[`escena-${i + 1}`], i % 2 ? "redondeado" : "arco", M, seguro, util, 1080, c.apoyo),
              etiqueta(`${i + 1}/${n}`, ancho - M, seguro + 1080 + 40, c.texto, identidad.tipografias.texto.familia, { ancla: "fin" }),
              columna(identidad, c, { titular: e.texto_en_pantalla }, M, seguro + 1080 + 90, util - 120, { max: 76, min: 44, maxLineas: 3 }).svg,
            ].join("");
        return { clave: `escena-${i + 1}`, ancho, alto, segundos, svg: lienzo(identidad, ancho, alto, c.fondo, cuerpo, e.toma) };
      });
    }
  }
}
