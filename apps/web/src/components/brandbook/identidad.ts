// La identidad de la marca que genera la IA a partir de la ficha (la arma Eze, rama ia).
// PROPUESTA de formato para POST /api/identidad, basada en brandia/motor-ia/03-direcciones.md
// (una sola dirección, más nombre, frase y voz). Si Eze la cambia, se ajusta acá.
//
//   Pedido:    { ficha }   (la ficha de la entrevista)
//   Respuesta: Identidad   (JSON)
export type Color = { hex: string; nombre: string; rol: string };

export type Identidad = {
  nombre: string;
  nombres_alternativos?: string[];
  frase?: string; // la bajada o tagline
  idea?: string; // la idea de la marca en una frase, para alguien sin formación en diseño
  palabras?: string[];
  voz?: { tono?: string; se_dice?: string[]; no_se_dice?: string[] };
  paleta: Color[]; // 4 a 6, con rol: principal, acento, fondo, texto, apoyo
  tipografias: {
    titulos: { familia: string; por_que?: string };
    texto: { familia: string; por_que?: string };
  };
  logo?: { svg?: string; imagen_url?: string; tipo?: string; por_que?: string };
};

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
  const buscar = (rol: string) => validos.find((c) => c.rol?.toLowerCase().includes(rol))?.hex;
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

/** Carga una familia de Google Fonts una sola vez. Sin pesos, para que no falle con fuentes de un solo peso */
export function cargarFuente(familia: string) {
  if (typeof document === "undefined" || !familia) return;
  const id = `fuente-${familia.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(familia).replace(/%20/g, "+")}&display=swap`;
  document.head.appendChild(link);
}

export const fuente = (familia: string, respaldo: "serif" | "sans-serif") => `"${familia}", ${respaldo}`;
