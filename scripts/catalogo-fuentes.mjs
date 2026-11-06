// Arma el catálogo de tipografías del motor de marca (issue #2): las fuentes de Google Fonts que la IA puede elegir,
// cada una con su estilo, su carácter y para qué sirve (títulos o texto). Así la IA elige con criterio entre fuentes
// reales y de licencia libre, en lugar de escribir un nombre de memoria.
//
// Fuentes de los datos (todas públicas):
//   - Fontsource (https://fontsource.org): categoría, pesos, cursiva, idiomas y licencia de cada familia.
//   - Etiquetas de Google Fonts (https://github.com/google/fonts, tags/all/families.csv): estilo (geométrica,
//     didona, manuscrita…), carácter (calma, vintage, juguetona…) y notas de calidad del dibujo y el espaciado.
//   - Metadatos de fonts.google.com: popularidad (para quedarnos con las probadas y marcar las muy vistas).
//
// Uso: node scripts/catalogo-fuentes.mjs
// Escribe apps/web/src/lib/ia/catalogos/fuentes.json. Volver a correrlo de vez en cuando para sumar fuentes nuevas.
import { writeFileSync } from "node:fs";

const SALIDA = new URL("../apps/web/src/lib/ia/catalogos/fuentes.json", import.meta.url);

// Cuántas fuentes entran por categoría, y cuántas como máximo de un mismo estilo, para que haya variedad
const CUPOS = { "sans-serif": 70, serif: 50, display: 50, handwriting: 30, monospace: 6 };
const MAXIMO_POR_ESTILO = 14;
// Calidad mínima: el promedio de las cuatro notas de Google (idea, dibujo, espaciado y espacio entre palabras).
// En 65 quedan afuera las flojas sin perder clásicas como Josefin Sans o Comfortaa.
const CALIDAD_MINIMA = 65;
// Las más populares de Google Fonts: se marcan como "muy vistas" para que la IA no las use por defecto
const MUY_VISTAS = 40;
const LICENCIAS = new Set(["OFL-1.1", "Apache-2.0"]);
// Pasan los filtros de texto pero no sirven para leer párrafos: angostas, muy anchas o solo mayúsculas
const SOLO_TITULOS = new Set(["Oswald", "Fjalla One", "Pathway Gothic One", "Teko", "Big Shoulders", "Rajdhani", "Cinzel", "Unbounded"]);
// Las fuentes hechas para otro alfabeto (japonés, hindi, tailandés…) suelen ser populares por ese alfabeto y no por
// cómo se ven en español. Quedan afuera, salvo estas, que se usan mucho con letras latinas y están bien dibujadas.
const DE_OTRO_ALFABETO_QUE_SI = new Set(["Poppins", "Baloo 2", "Kanit", "Heebo", "Rajdhani", "Teko", "Dela Gothic One"]);

const CATEGORIA = { "sans-serif": "sans", serif: "serif", display: "display", handwriting: "manuscrita", monospace: "mono" };

const ESTILO = {
  "/Sans/Geometric": "geométrica",
  "/Sans/Glyphic": "glífica",
  "/Sans/Grotesque": "grotesca",
  "/Sans/Humanist": "humanista",
  "/Sans/Neo Grotesque": "neo grotesca",
  "/Sans/Rounded": "redondeada",
  "/Sans/Superellipse": "cuadrada suave",
  "/Serif/Didone": "didona, de alto contraste",
  "/Serif/Fat Face": "fat face, muy gruesa",
  "/Serif/Humanist Venetian": "veneciana",
  "/Serif/Modern": "moderna",
  "/Serif/Old Style Garalde": "antigua (garalda)",
  "/Serif/Scotch": "escocesa",
  "/Serif/Transitional": "de transición",
  "/Slab/Clarendon": "slab clarendon",
  "/Slab/Geometric": "slab geométrica",
  "/Slab/Humanist": "slab humanista",
  "/Script/Formal": "caligráfica formal",
  "/Script/Handwritten": "escrita a mano",
  "/Script/Informal": "script informal",
  "/Script/Upright Script": "script vertical",
  "/Theme/Art Deco": "art déco",
  "/Theme/Art Nouveau": "art nouveau",
  "/Theme/Blackletter": "gótica",
  "/Theme/Blobby": "inflada",
  "/Theme/Brush": "de pincel",
  "/Theme/Distressed": "gastada",
  "/Theme/Inline": "con línea interior",
  "/Theme/Medieval": "medieval",
  "/Theme/Pixel": "pixel",
  "/Theme/Shaded": "sombreada",
  "/Theme/Stencil": "esténcil",
  "/Theme/Techno": "tecno",
  "/Theme/Tuscan": "toscana",
  "/Theme/Wacky": "estrafalaria",
  "/Theme/Woodtype": "tipo madera",
  "/Monospace/Monospace": "monoespaciada",
};

const CARACTER = {
  "/Expressive/Active": "enérgica",
  "/Expressive/Artistic": "artística",
  "/Expressive/Business": "de negocios",
  "/Expressive/Calm": "calma",
  "/Expressive/Childlike": "infantil",
  "/Expressive/Competent": "solvente",
  "/Expressive/Cute": "tierna",
  "/Expressive/Excited": "entusiasta",
  "/Expressive/Fancy": "ornamentada",
  "/Expressive/Futuristic": "futurista",
  "/Expressive/Happy": "alegre",
  "/Expressive/Innovative": "innovadora",
  "/Expressive/Loud": "llamativa",
  "/Expressive/Playful": "juguetona",
  "/Expressive/Rugged": "robusta",
  "/Expressive/Sincere": "sincera",
  "/Expressive/Sophisticated": "sofisticada",
  "/Expressive/Stiff": "rígida",
  "/Expressive/Vintage": "vintage",
};

async function bajar(url, tipo = "json") {
  const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (catalogo-fuentes de BrandIA)" } });
  if (!r.ok) throw new Error(`No se pudo bajar ${url}: ${r.status}`);
  return tipo === "json" ? r.json() : r.text();
}

const [fontsource, csv, metadatos] = await Promise.all([
  bajar("https://api.fontsource.org/v1/fonts"),
  bajar("https://raw.githubusercontent.com/google/fonts/main/tags/all/families.csv", "texto"),
  bajar("https://fonts.google.com/metadata/fonts"),
]);

// Etiquetas de Google: familia → { etiqueta: peso de 0 a 100 }. Las filas con una posición de eje (segunda
// columna) describen una variante de una fuente variable: se usan solo las de la fuente tal cual sale.
const etiquetas = new Map();
for (const linea of csv.split("\n")) {
  const [familia, eje, etiqueta, peso] = linea.split(",");
  if (!familia || eje || !etiqueta || peso === undefined) continue;
  if (!etiquetas.has(familia)) etiquetas.set(familia, {});
  etiquetas.get(familia)[etiqueta] = Number(peso);
}

const google = new Map(metadatos.familyMetadataList.map((f) => [f.family, f]));

function calidad(t) {
  const notas = ["Concept", "Drawing", "Spacing", "Wordspace"].map((k) => t[`/Quality/${k}`]);
  return notas.some((n) => n === undefined) ? null : notas.reduce((a, b) => a + b, 0) / notas.length;
}

const mejores = (t, nombres, minimo, cuantos) =>
  Object.entries(t)
    .filter(([k, v]) => nombres[k] && v >= minimo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, cuantos)
    .map(([k]) => nombres[k]);

const familias = new Set(fontsource.map((f) => f.family));
const candidatas = [];
for (const f of fontsource) {
  const g = google.get(f.family);
  const t = etiquetas.get(f.family);
  if (f.type !== "google" || !g || !t) continue;
  if (!LICENCIAS.has(f.license) || !CATEGORIA[f.category]) continue;
  // Tiene que traer las letras del español (el juego "latin" incluye tildes, ñ, ¿ y ¡)
  if (!f.subsets.includes("latin") || g.isNoto || g.isBrandFont) continue;
  if (g.primaryScript && !DE_OTRO_ALFABETO_QUE_SI.has(f.family)) continue;
  if (g.classifications.includes("Symbols") || /Math|Emoji|Icons/.test(f.family)) continue;
  // Afuera: usos especiales (códigos de barras, tachado) y las de aprender a escribir (una por país)
  if (Object.keys(t).some((k) => k.startsWith("/Special use/") || k === "/Purpose/Learn To Write")) continue;
  // Las versalitas ("… SC") quedan solo si no está la familia de siempre
  if (/ SC$/.test(f.family) && familias.has(f.family.slice(0, -3))) continue;
  const nota = calidad(t);
  if (nota === null || nota < CALIDAD_MINIMA) continue;

  const estilo = mejores(t, ESTILO, 50, 2);
  const caracter = mejores(t, CARACTER, 50, 3);
  // Para texto: sans o serif de verdad (no decorativa), con normal y negrita, buen espaciado y no angosta
  const paraTexto =
    ["sans-serif", "serif"].includes(f.category) &&
    g.classifications.length === 0 &&
    f.styles.includes("normal") &&
    f.weights.includes(400) &&
    f.weights.includes(700) &&
    t["/Quality/Spacing"] >= 70 &&
    t["/Quality/Wordspace"] >= 70 &&
    !Object.keys(t).some((k) => k.startsWith("/Theme/")) &&
    !/Condensed|Narrow|Compressed|Expanded|Extended|SC$|Display/.test(f.family) &&
    !SOLO_TITULOS.has(f.family);

  candidatas.push({
    familia: f.family,
    categoria: CATEGORIA[f.category],
    estilo,
    caracter,
    usos: paraTexto ? ["titulos", "texto"] : ["titulos"],
    pesos: f.weights,
    cursiva: f.styles.includes("italic"),
    variable: f.variable,
    popularidad: g.popularity,
    calidad: Math.round(nota),
    licencia: f.license,
    _grupo: f.category,
  });
}

// Por categoría, de la más usada a la menos, con un tope por estilo para que no sean todas iguales
candidatas.sort((a, b) => a.popularidad - b.popularidad);
const elegidas = [];
const porCategoria = {};
const porEstilo = {};
for (const c of candidatas) {
  const estilo = `${c._grupo}:${c.estilo[0] ?? "-"}`;
  if ((porCategoria[c._grupo] ?? 0) >= CUPOS[c._grupo]) continue;
  if ((porEstilo[estilo] ?? 0) >= MAXIMO_POR_ESTILO) continue;
  porCategoria[c._grupo] = (porCategoria[c._grupo] ?? 0) + 1;
  porEstilo[estilo] = (porEstilo[estilo] ?? 0) + 1;
  const { _grupo, ...fuente } = c;
  elegidas.push({ ...fuente, muy_vista: c.popularidad <= MUY_VISTAS });
}

elegidas.sort((a, b) => a.categoria.localeCompare(b.categoria) || a.familia.localeCompare(b.familia));
const catalogo = {
  actualizado: new Date().toISOString().slice(0, 10),
  fuentes_de_datos: [
    "https://api.fontsource.org/v1/fonts",
    "https://github.com/google/fonts/blob/main/tags/all/families.csv",
    "https://fonts.google.com/metadata/fonts",
  ],
  fuentes: elegidas,
};
writeFileSync(SALIDA, `${JSON.stringify(catalogo, null, 1)}\n`);

const texto = elegidas.filter((f) => f.usos.includes("texto")).length;
console.log(`Catálogo: ${elegidas.length} fuentes (${texto} sirven para texto) de ${candidatas.length} candidatas`);
console.log(Object.entries(porCategoria).map(([k, v]) => `${CATEGORIA[k]}: ${v}`).join(" · "));
