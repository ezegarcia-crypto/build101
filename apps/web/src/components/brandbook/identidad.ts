// Lo que devuelve la IA del módulo A (rama ia, de Eze; ver apps/web/src/lib/ia/README.md):
//   POST /api/direcciones { brief }            → { direcciones }  3 para elegir, ~30 s
//   POST /api/identidad   { brief, direccion } → { identidad }    ~30 s
//   POST /api/logo        { brief, direccion } → { propuestas }   3 logos completos, ~25 s
// Los tipos salen del código de Eze para que, si él cambia algo, la pantalla avise al compilar.
import type { Comprobacion } from "@/lib/ia/comprobaciones";
import type { Color, Direccion } from "@/lib/ia/direcciones";
import type { Textos } from "@/lib/ia/identidad";
import type { PropuestaLogo } from "@/lib/ia/logo";

export type { Color, Comprobacion, Direccion, PropuestaLogo };

export type DireccionConControl = Direccion & {
  comprobaciones?: Comprobacion[];
  /** Identifica el camino en la pantalla: la IA repite A, B y C en cada vuelta (A, A2, A-c1…) */
  clave?: string;
  /** De qué vuelta salió: "Nueva vuelta 2", "Otros colores" */
  etiqueta?: string;
  /** Si son otros colores para un camino: qué cambió y de dónde salen */
  explicacion?: string;
};

/** La clave de un camino (los de la primera vuelta no la traen: es su letra) */
export const claveDe = (d: DireccionConControl) => d.clave ?? d.id;

/** El camino tal como lo espera la IA, sin lo que agrega la pantalla */
export function direccionPura(d: DireccionConControl): Direccion {
  const { comprobaciones: _c, clave: _k, etiqueta: _e, explicacion: _x, ...pura } = d;
  return pura;
}

export type IdentidadIA = Textos & {
  direccion: Pick<Direccion, "id" | "nombre" | "idea" | "palabras" | "formas">;
  paleta: Color[];
  tipografias: { titulos: string; texto: string };
  fuentes_url: string;
  logo: { tipo: string; isotipo_svg: string; explicacion: string };
  comprobaciones: Comprobacion[];
};

export const CLAVE_DIRECCIONES = "brandia:direcciones";
export const CLAVE_IDENTIDAD = "brandia:identidad";

/**
 * El logo que eligió la persona: el número de una de las propuestas completas, "simbolo" (el isotipo solo) o
 * "simbolo-nombre" (el isotipo exacto con el nombre en la tipografía de títulos, como en el brandbook).
 * Queda guardado junto con la identidad: el feed, BranderIA y las descargas usan este, no el primero.
 */
export type LogoElegido = number | "simbolo" | "simbolo-nombre";

/** Si el elegido es el símbolo (solo o con el nombre): esos no son una imagen de la IA sino el SVG */
export const esSimbolo = (e: LogoElegido | undefined): e is "simbolo" | "simbolo-nombre" =>
  e === "simbolo" || e === "simbolo-nombre";

/** Lo que queda guardado en CLAVE_IDENTIDAD */
export type MarcaGuardada = {
  ficha: string;
  identidad: IdentidadIA;
  logos: PropuestaLogo[];
  elegido?: LogoElegido;
};

/** La propuesta elegida, o null si eligió el símbolo solo (o no hay propuestas): entonces va el isotipo */
export function logoDeMarca(logos: PropuestaLogo[], elegido: LogoElegido | undefined) {
  if (esSimbolo(elegido)) return null;
  return logos[elegido ?? 0] ?? logos[0] ?? null;
}

/** El isotipo con ancho y alto fijos, para dibujarlo en un lienzo o descargarlo (sin tamaño, el navegador lo hace de 300 × 150) */
export function svgConTamano(svg: string, lado: number) {
  return svgSeguro(svg)
    .replace(/<svg([^>]*?)\s(width|height)="[^"]*"/gi, "<svg$1")
    .replace(/<svg([^>]*?)\s(width|height)="[^"]*"/gi, "<svg$1")
    .replace(/<svg/i, `<svg width="${lado}" height="${lado}"`);
}

/**
 * Pasa los colores del isotipo de una paleta a otra: cada color de la paleta vieja se cambia por el del
 * mismo rol en la nueva (o el de la misma posición, si el rol no está). Así el símbolo sigue a la paleta.
 */
export function recolorearSvg(svg: string, vieja: Color[], nueva: Color[]) {
  const cambio = new Map<string, string>();
  vieja.forEach((c, i) => {
    const par = nueva.find((n) => n.rol === c.rol) ?? nueva[i];
    if (par && esHex(c.hex)) cambio.set(c.hex.toLowerCase(), par.hex);
  });
  return svg.replace(/#[0-9a-f]{6}\b/gi, (h) => cambio.get(h.toLowerCase()) ?? h);
}

// --- Colores -------------------------------------------------------------

function luminancia(hex: string) {
  const h = hex.replace("#", "");
  const completo = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(completo.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string) {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

const esHex = (v?: string) => !!v && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());

/** El color de la paleta que mejor se lee sobre `fondo` (si ninguno llega a 4,5:1, blanco o negro) */
export function textoSobre(fondo: string, paleta: Color[]) {
  const candidatos = paleta.map((c) => c.hex).filter((h) => esHex(h) && h !== fondo);
  const mejor = candidatos.sort((a, b) => contraste(fondo, b) - contraste(fondo, a))[0];
  if (mejor && contraste(fondo, mejor) >= 4.5) return mejor;
  return contraste(fondo, "#ffffff") > contraste(fondo, "#000000") ? "#ffffff" : "#000000";
}

/** Los colores clave del lienzo, según el rol que puso la IA (con respaldo si falta alguno) */
export function rolesDe(paleta: Color[]) {
  const validos = paleta.filter((c) => esHex(c.hex));
  const buscar = (rol: string) => validos.find((c) => c.rol === rol)?.hex;
  const claros = [...validos].sort((a, b) => luminancia(b.hex) - luminancia(a.hex));
  const fondo = buscar("fondo") ?? claros[0]?.hex ?? "#ffffff";
  const principal = buscar("principal") ?? validos.find((c) => c.hex !== fondo)?.hex ?? "#000000";
  const texto = buscar("texto") ?? textoSobre(fondo, validos);
  return {
    fondo,
    principal,
    acento: buscar("acento") ?? principal,
    texto: contraste(fondo, texto) >= 4.5 ? texto : textoSobre(fondo, validos),
  };
}

// --- Tipografías ---------------------------------------------------------

/** Espera a que esté lista una tipografía de la marca (para dibujarla en un lienzo, que no espera solo) */
export async function esperarFuente(href: string, familia: string) {
  if (typeof document === "undefined") return;
  cargarFuentes(href);
  const link = document.querySelector<HTMLLinkElement>(`link[data-fuente="${CSS.escape(href)}"]`);
  if (link && !link.sheet) {
    await new Promise((ok) => {
      link.addEventListener("load", ok, { once: true });
      link.addEventListener("error", ok, { once: true });
      setTimeout(ok, 4000);
    });
  }
  try {
    await document.fonts.load(`64px "${familia}"`);
  } catch {
    // Si no llega, se dibuja con la de respaldo
  }
}

/** Carga un link de Google Fonts una sola vez */
export function cargarFuentes(href: string) {
  if (typeof document === "undefined" || !href) return;
  if (document.querySelector(`link[data-fuente="${CSS.escape(href)}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.fuente = href;
  document.head.appendChild(link);
}

/** Una familia sola, sin pesos, para que no falle con fuentes de un solo peso (para las direcciones) */
export const urlFamilia = (familia: string) =>
  `https://fonts.googleapis.com/css2?family=${encodeURIComponent(familia).replace(/%20/g, "+")}&display=swap`;

export const fuente = (familia: string, respaldo: "serif" | "sans-serif") => `"${familia}", ${respaldo}`;

// --- Logo ----------------------------------------------------------------

/** El SVG ya viene limpio de la IA; esto saca además eventos escritos sin comillas (onload=…) */
export const svgSeguro = (svg: string) => svg.replace(/\son\w+\s*=\s*[^\s>]+/gi, "");

/**
 * Un color de la paleta (que no sea el fondo) donde el símbolo se vea: el que más contrasta con
 * los colores con que la IA dibujó el SVG. Si el SVG no trae colores, el principal.
 */
export function fondoParaSimbolo(svg: string, paleta: Color[], fondo: string, principal: string) {
  const delSvg = [...new Set((svg.match(/#[0-9a-f]{6}\b/gi) ?? []).map((h) => h.toLowerCase()))];
  if (!delSvg.length) return principal;
  const candidatos = paleta.map((c) => c.hex).filter((h) => esHex(h) && h.toLowerCase() !== fondo.toLowerCase());
  const puntaje = (h: string) => Math.min(...delSvg.map((s) => contraste(h, s)));
  return candidatos.sort((a, b) => puntaje(b) - puntaje(a))[0] ?? principal;
}
