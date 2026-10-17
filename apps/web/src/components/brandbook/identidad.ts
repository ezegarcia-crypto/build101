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

export type DireccionConControl = Direccion & { comprobaciones?: Comprobacion[] };

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
