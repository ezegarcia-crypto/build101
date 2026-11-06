import { type Comprobacion, parametroGoogleFonts } from "@/lib/ia/comprobaciones";

import datos from "./fuentes.json";

// El catálogo de tipografías del motor de marca (issue #2): unas 200 familias de Google Fonts, de licencia libre
// (OFL o Apache), elegidas por calidad y variedad, cada una con su estilo, su carácter y para qué sirve.
// La IA elige de acá las tipografías de cada dirección, en lugar de escribir un nombre de memoria.
// El JSON lo arma scripts/catalogo-fuentes.mjs (README.md de esta carpeta): no se edita a mano.

export type UsoFuente = "titulos" | "texto";

export type Fuente = {
  familia: string;
  categoria: "sans" | "serif" | "display" | "manuscrita" | "mono";
  /** Estilo del dibujo, por ejemplo «geométrica» o «didona, de alto contraste» */
  estilo: string[];
  /** Carácter que transmite, por ejemplo «calma» o «vintage» (no todas lo tienen) */
  caracter: string[];
  /** Todas sirven para títulos; solo algunas para leer párrafos */
  usos: UsoFuente[];
  pesos: number[];
  cursiva: boolean;
  variable: boolean;
  /** Puesto en el ranking de uso de Google Fonts (1 = la más usada) */
  popularidad: number;
  calidad: number;
  licencia: string;
  /** Entre las más usadas de Google Fonts: está en todos lados */
  muy_vista: boolean;
};

export const FUENTES = datos.fuentes as Fuente[];

const clave = (nombre: string) =>
  nombre
    .normalize("NFD")
    .replace(/[̀-ͯ"'«»]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const POR_CLAVE = new Map(FUENTES.map((f) => [clave(f.familia), f]));

/** La familia del catálogo con ese nombre, sin importar mayúsculas, comillas ni espacios de más */
export function buscarFuente(nombre: string): Fuente | undefined {
  return POR_CLAVE.get(clave(nombre));
}

/** El parámetro para el link de Google Fonts ("family=Nombre:wght@400;700") con los pesos que la familia tiene */
export function parametroFuente(f: Fuente) {
  const nombre = encodeURIComponent(f.familia).replace(/%20/g, "+");
  const comunes = [400, 700].filter((p) => f.pesos.includes(p));
  // Si no tiene ni regular ni negrita (algunas de títulos), el peso más cercano a la regular
  const pesos = comunes.length
    ? comunes
    : [f.pesos.reduce((a, b) => (Math.abs(b - 400) < Math.abs(a - 400) ? b : a))];
  return `family=${nombre}:wght@${pesos.join(";")}`;
}

// Si la IA nombra una que no está (o una de títulos para el texto), va una segura del mismo tipo
const REEMPLAZO = {
  titulos: "DM Serif Display",
  texto: { serif: "Source Serif 4", otra: "DM Sans" },
} as const;

function reemplazo(uso: UsoFuente, parecida?: Fuente): Fuente {
  const nombre =
    uso === "titulos" ? REEMPLAZO.titulos : parecida?.categoria === "serif" ? REEMPLAZO.texto.serif : REEMPLAZO.texto.otra;
  const fuente = buscarFuente(nombre);
  if (!fuente) throw new Error(`La tipografía de reemplazo ${nombre} no está en el catálogo: volver a armarlo`);
  return fuente;
}

/**
 * Las dos tipografías de una dirección, del catálogo. La de texto tiene que servir para leer párrafos.
 * Lo que no cumple se reemplaza por una segura del mismo tipo, y la comprobación lo cuenta.
 */
export function fuentesDelCatalogo(pedidas: { titulos: string; texto: string }): {
  titulos: Fuente;
  texto: Fuente;
  comprobacion: Comprobacion;
} {
  const cambios: string[] = [];
  let titulos = buscarFuente(pedidas.titulos);
  if (!titulos) {
    titulos = reemplazo("titulos");
    cambios.push(`${pedidas.titulos} (no está en el catálogo) por ${titulos.familia}`);
  }
  const encontrada = buscarFuente(pedidas.texto);
  let texto = encontrada;
  if (!texto?.usos.includes("texto")) {
    texto = reemplazo("texto", encontrada);
    const motivo = encontrada ? "es para títulos, no para leer párrafos" : "no está en el catálogo";
    cambios.push(`${pedidas.texto} (${motivo}) por ${texto.familia}`);
  }
  return {
    titulos,
    texto,
    comprobacion: {
      que: "Tipografías",
      ok: cambios.length === 0,
      detalle: cambios.length
        ? `Se reemplazó ${cambios.join(" y ")}`
        : `${titulos.familia} y ${texto.familia}, del catálogo de BrandIA (Google Fonts, licencia libre)`,
    },
  };
}

/**
 * Para la identidad (paso 3): las dos tipografías de la dirección elegida y el link de Google Fonts para cargarlas.
 * Las del catálogo pasan directo, con sus pesos. Una dirección armada antes del catálogo puede traer otra: si existe
 * en Google Fonts se respeta (la persona ya la vio en su camino) y, si no, se reemplaza por una segura.
 */
export async function tipografiasDeLaIdentidad(pedidas: { titulos: string; texto: string }) {
  const resolver = async (nombre: string, uso: UsoFuente) => {
    const fuente = buscarFuente(nombre);
    if (fuente) return { familia: fuente.familia, parametro: parametroFuente(fuente), origen: "catalogo" as const };
    const parametro = await parametroGoogleFonts(nombre);
    if (parametro) return { familia: nombre.trim(), parametro, origen: "google" as const };
    const segura = reemplazo(uso);
    return { familia: segura.familia, parametro: parametroFuente(segura), origen: "reemplazo" as const, pedida: nombre };
  };
  const [titulos, texto] = await Promise.all([resolver(pedidas.titulos, "titulos"), resolver(pedidas.texto, "texto")]);
  const ambas = `${titulos.familia} y ${texto.familia}`;
  const reemplazos = [titulos, texto].flatMap((f) => (f.origen === "reemplazo" ? [`${f.pedida} por ${f.familia}`] : []));

  const comprobacion: Comprobacion = reemplazos.length
    ? { que: "Tipografías", ok: false, detalle: `Se reemplazó la que no existe en Google Fonts: ${reemplazos.join(" y ")}` }
    : titulos.origen === "catalogo" && texto.origen === "catalogo"
      ? { que: "Tipografías", ok: true, detalle: `${ambas}, del catálogo de BrandIA (Google Fonts, licencia libre)` }
      : { que: "Tipografías", ok: true, detalle: `${ambas} existen en Google Fonts` };

  return {
    tipografias: { titulos: titulos.familia, texto: texto.familia },
    fuentes_url: `https://fonts.googleapis.com/css2?${[...new Set([titulos.parametro, texto.parametro])].join("&")}&display=swap`,
    comprobacion,
  };
}

const CATEGORIAS: Record<Fuente["categoria"], string> = {
  sans: "Sin serifa (sans)",
  serif: "Con serifa (serif)",
  display: "Display: solo para títulos, con mucha personalidad",
  manuscrita: "Manuscritas y caligráficas: solo para títulos",
  mono: "Monoespaciadas: solo para títulos, para marcas técnicas",
};

/** El catálogo como texto para el prompt: una línea por familia, agrupadas por tipo */
export function catalogoParaPrompt() {
  const grupos = (Object.keys(CATEGORIAS) as Fuente["categoria"][]).map((categoria) => {
    const lineas = FUENTES.filter((f) => f.categoria === categoria).map((f) => {
      const rasgos = [...f.estilo, ...f.caracter].join(", ");
      const marcas = [f.usos.includes("texto") ? "títulos y texto" : null, f.muy_vista ? "muy vista" : null]
        .filter(Boolean)
        .join(" · ");
      return `- ${f.familia}${rasgos ? `: ${rasgos}` : ""}${marcas ? ` [${marcas}]` : ""}`;
    });
    return `### ${CATEGORIAS[categoria]}\n${lineas.join("\n")}`;
  });
  return grupos.join("\n\n");
}
