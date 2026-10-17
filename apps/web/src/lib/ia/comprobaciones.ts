import type { Color } from "./direcciones";

// Comprobaciones automáticas de lo que genera la IA. Se muestran en la app como prueba de calidad:
// contraste de colores (WCAG), tipografías que existen en Google Fonts y un logo SVG seguro.

export type Comprobacion = { que: string; ok: boolean; detalle: string };

// ---- Contraste (WCAG 2.1) ----

function luminancia(hex: string) {
  const canal = (i: number) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
}

export function contraste(a: string, b: string) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

function mezclar(hex: string, hacia: string, t: number) {
  const c = (h: string, i: number) => Number.parseInt(h.slice(i, i + 2), 16);
  const canal = (i: number) =>
    Math.round(c(hex, i) + (c(hacia, i) - c(hex, i)) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${canal(1)}${canal(3)}${canal(5)}`.toUpperCase();
}

// Si el texto no se lee sobre el fondo (AA: 4,5 a 1), lo oscurece o aclara de a poco hasta que se lea.
export function asegurarContraste(paleta: Color[]): { paleta: Color[]; comprobacion: Comprobacion } {
  const fondo = paleta.find((c) => c.rol === "fondo") ?? paleta[0];
  const texto = paleta.find((c) => c.rol === "texto") ?? paleta[paleta.length - 1];
  const inicial = contraste(texto.hex, fondo.hex);
  if (inicial >= 4.5) {
    return {
      paleta,
      comprobacion: { que: "Contraste del texto", ok: true, detalle: `${inicial.toFixed(1)} a 1 (mínimo AA: 4,5)` },
    };
  }
  const hacia = luminancia(fondo.hex) > 0.4 ? "#000000" : "#FFFFFF";
  let ajustado = texto.hex;
  for (let t = 0.1; t <= 1 && contraste(ajustado, fondo.hex) < 4.5; t += 0.1) ajustado = mezclar(texto.hex, hacia, t);
  const final = contraste(ajustado, fondo.hex);
  return {
    paleta: paleta.map((c) => (c === texto ? { ...c, hex: ajustado } : c)),
    comprobacion: {
      que: "Contraste del texto",
      ok: final >= 4.5,
      detalle: `Ajustado de ${inicial.toFixed(1)} a ${final.toFixed(1)} a 1 (mínimo AA: 4,5)`,
    },
  };
}

// El color principal sobre el fondo tiene que verse en títulos y formas grandes (WCAG: 3 a 1).
// Solo se informa: el principal es la identidad de la marca y no se cambia solo.
export function comprobarPrincipal(paleta: Color[]): Comprobacion {
  const fondo = paleta.find((c) => c.rol === "fondo") ?? paleta[0];
  const principal = paleta.find((c) => c.rol === "principal") ?? paleta[0];
  const valor = contraste(principal.hex, fondo.hex);
  return {
    que: "Color principal",
    ok: valor >= 3,
    detalle:
      valor >= 3
        ? `${valor.toFixed(1)} a 1 sobre el fondo: sirve para títulos y formas grandes`
        : `${valor.toFixed(1)} a 1 sobre el fondo: usarlo en bloques de color, no en textos sobre el fondo`,
  };
}

// ---- Tipografías ----

// Devuelve el parámetro para el link de Google Fonts ("family=Nombre:wght@400;700"),
// o null si la familia no existe. Prueba primero con regular y negrita, y si no, solo regular.
export async function parametroGoogleFonts(familia: string) {
  const nombre = encodeURIComponent(familia.trim()).replace(/%20/g, "+");
  for (const parametro of [`family=${nombre}:wght@400;700`, `family=${nombre}`]) {
    try {
      const r = await fetch(`https://fonts.googleapis.com/css2?${parametro}&display=swap`, {
        headers: { "user-agent": "Mozilla/5.0" },
      });
      if (r.ok) return parametro;
    } catch {
      // sin conexión con Google Fonts: se prueba la siguiente opción
    }
  }
  return null;
}

// ---- Logo SVG ----

const ETIQUETAS_PERMITIDAS = new Set(["svg", "g", "path", "circle", "rect", "ellipse", "polygon", "polyline", "line", "text", "tspan", "title"]);

// Deja solo las etiquetas de dibujo permitidas y saca atributos peligrosos (eventos, links, estilos externos).
export function limpiarSvg(svg: string): { svg: string; comprobacion: Comprobacion } {
  const inicio = svg.indexOf("<svg");
  const fin = svg.lastIndexOf("</svg>");
  if (inicio === -1 || fin === -1) {
    return { svg: "", comprobacion: { que: "Logo", ok: false, detalle: "La IA no devolvió un SVG" } };
  }
  let limpio = svg.slice(inicio, fin + 6);
  let sacadas = 0;
  limpio = limpio.replace(/<\/?([a-zA-Z][\w:-]*)[^>]*>/g, (etiqueta, nombre: string) => {
    if (ETIQUETAS_PERMITIDAS.has(nombre.toLowerCase())) return etiqueta;
    sacadas++;
    return "";
  });
  limpio = limpio
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/\s(xlink:)?href\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/\s(width|height)\s*=\s*("[^"]*"|'[^']*')/i, "");
  const tieneViewBox = /viewBox\s*=/.test(limpio);
  if (!tieneViewBox) limpio = limpio.replace("<svg", '<svg viewBox="0 0 100 100"');
  return {
    svg: limpio,
    comprobacion: {
      que: "Logo",
      ok: true,
      detalle: sacadas ? `SVG válido (se limpiaron ${sacadas} elementos no permitidos)` : "SVG válido y seguro",
    },
  };
}
