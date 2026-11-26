import { z } from "zod";

import type { EstiloDireccion } from "@/lib/ia/catalogos/estilos";
import { catalogoEstilosParaPrompt } from "@/lib/ia/catalogos/estilos";
import { catalogoParaPrompt } from "@/lib/ia/catalogos/fuentes";

// Paso 2 del módulo A: con la ficha, la IA propone tres direcciones visuales distintas y la persona elige una.
// Adaptado de brandia/motor-ia/03-direcciones.md (sin imágenes de moodboard, para que sea rápido).
// Las tipografías y las familias de estilo salen de los catálogos de lib/ia/catalogos/ (van al final del prompt):
// cada una de las tres direcciones sale de una familia de estilo distinta (distinto mecanismo, no distinto adjetivo).

export const MODELO_DIRECCIONES = "anthropic/claude-sonnet-5.5";

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color en hex de 6 dígitos, por ejemplo #1E1E1C");

export const colorSchema = z.object({
  hex,
  nombre: z.string().describe("Nombre evocador del color, por ejemplo «Harina tostada»"),
  rol: z.enum(["principal", "acento", "fondo", "texto", "apoyo"]),
});

// La familia de estilo, tal como la pide la IA. La ruta la completa con el catálogo (mecanismo y descriptor en inglés)
const estiloPedidoSchema = z.object({
  familia: z.string().describe("Nombre exacto de la familia, tal cual figura en el catálogo de estilos, sin el número"),
  descriptor: z.number().int().describe("Número del descriptor de esa familia que mejor le queda a esta dirección"),
  por_que: z
    .string()
    .describe("Qué de la ficha (rubro, público, palabras de la persona) hace que esta familia le sirva, en una frase"),
});

// La familia de estilo ya resuelta con el catálogo, como la guarda la dirección (y la reciben identidad, paleta y logo).
// Es opcional porque las direcciones armadas antes del catálogo de estilos no la tienen.
const estiloSchema = z.object({
  familia: z.string(),
  numero: z.number().nullable(),
  mecanismo: z.string().nullable(),
  descriptor: z.string().nullable(),
  por_que: z.string(),
}) satisfies z.ZodType<EstiloDireccion>;

const direccionBase = z.object({
  id: z.enum(["A", "B", "C"]),
  nombre: z.string().describe("Dos o tres palabras evocadoras, por ejemplo «Horno de barrio»"),
  idea: z.string().describe("Una frase que explique la dirección a alguien que no sabe de diseño"),
  por_que: z
    .string()
    .describe(
      "Cómo responde a la ficha, citando palabras concretas de la persona, y de qué cosa del negocio salen sus colores (el producto, el material, el lugar, el oficio)",
    ),
  palabras: z.array(z.string()).min(1).max(3).describe("Tres adjetivos"),
  nombre_marca: z
    .string()
    .nullable()
    .describe("Solo si la ficha dice que necesita nombre: una propuesta de nombre para esta dirección. Si no, null"),
  paleta: z
    .array(colorSchema)
    .min(4)
    .max(6)
    .describe("Tiene que haber exactamente un color con rol fondo y uno con rol texto"),
  tipografias: z.object({
    titulos: z.object({
      familia: z.string().describe("Nombre exacto, tal cual figura en el catálogo de tipografías"),
      por_que: z.string(),
    }),
    texto: z.object({
      familia: z.string().describe("Nombre exacto, tal cual figura en el catálogo, de una marcada para «títulos y texto»"),
      por_que: z.string(),
    }),
  }),
  formas: z.string().describe("Lenguaje de formas en una línea: geométrico, orgánico, caligráfico, modular…"),
  logo_sugerido: z.object({
    tipo: z.enum(["monograma", "simbolo_y_logotipo", "sello", "solo_logotipo"]),
    por_que: z.string(),
  }),
  riesgo: z.string().describe("Qué podría salir mal con esta dirección, en una línea"),
});

/** Una dirección como la guarda la pantalla y la reciben identidad, paleta y logo */
export const direccionSchema = direccionBase.extend({ estilo: estiloSchema.optional() });

/** Lo que devuelve la IA: cada dirección dice primero de qué familia de estilo sale */
export const direccionesSchema = z.object({
  direcciones: z
    .array(direccionBase.extend({ estilo: estiloPedidoSchema }))
    .min(1)
    .max(3)
    .describe("Exactamente tres direcciones: A, B y C, cada una de una familia de estilo distinta"),
});

export type Color = z.infer<typeof colorSchema>;
export type Direccion = z.infer<typeof direccionSchema>;

export const PROMPT_DIRECCIONES = `Sos el director visual de BrandIA. Con la ficha de una marca, proponés tres direcciones visuales distintas. Cada una tiene que poder defenderse con la ficha; ninguna es relleno.

Primero, las familias de estilo:
- Cada dirección sale de una familia distinta del catálogo de estilos que va al final. Las familias se diferencian por su mecanismo (la decisión de diseño que manda: una retícula, el vacío, un personaje, la letra hecha a mano…), así las tres son ideas distintas y no la misma idea con otro adjetivo.
- Elegí las tres por la ficha: el rubro, el público, el tamaño del negocio y las palabras de la persona. Los rubros de cada familia orientan, no obligan: una familia de otro rubro vale si la ficha la justifica, y una del mismo rubro no vale si choca con lo que la persona no quiere.
- En estilo va el nombre exacto de la familia, el número del descriptor que mejor le queda y una frase con el porqué. La paleta, las tipografías, las formas y el logo de la dirección siguen el mecanismo de su familia.

Cómo se arman las tres:
- A · la esperada: la familia que sale derecho de lo que pidió la persona y de su rubro.
- B · la vecina: otra familia que también le queda natural al negocio, con otro mecanismo.
- C · la que se anima: una familia menos obvia para ese rubro que igual se puede defender con la ficha. Sigue respetando lo que la persona no quiere y sus restricciones.

Reglas:
- Ninguna dirección puede usar colores de colores_no, parecerse a no_parecerse_a ni romper las restricciones.
- Si la persona nombró colores que le gustan, al menos la dirección A los usa.
- Los colores salen del negocio, no de una paleta genérica: de lo que vende o hace, sus materiales, su lugar y su público (una pastelería: crema, frutilla, chocolate; un estudio contable: tinta, papel, sello). El nombre de cada color lo cuenta y por_que dice de dónde salen.
- Tipografías: las dos salen del catálogo que va al final, con el nombre escrito exactamente igual. La de texto tiene que estar marcada para «títulos y texto»; la de títulos puede ser cualquiera.
- Elegilas por su estilo y su carácter (los del catálogo): que respondan a la ficha (el rubro, el público, las palabras de la persona) y que el par combine, por ejemplo una con personalidad para títulos y una sobria para leer. En por_que contá qué de la ficha te llevó a cada una.
- Las tres direcciones usan pares de tipografías distintos. Las marcadas «muy vista» están en todos lados: usalas solo si la ficha pide algo neutro o muy clásico.
- Paleta de 4 a 6 colores: exactamente un color "fondo" y uno "texto", y el texto sobre el fondo tiene que leerse muy bien (contraste alto).
- Si la marca ya tiene logo o algo a conservar, las tres lo respetan (y la familia de cada una tiene que poder convivir con eso).
- Si la ficha dice que necesita nombre, cada dirección propone uno distinto en nombre_marca, corto, fácil de decir en español rioplatense y que no sea una marca conocida.
- Español rioplatense, sin jerga de diseño: la persona tiene que entender cada dirección.

Si te pasan lo que la persona ya opinó de otros caminos:
- Los que le gustaron muestran lo que busca: seguí esa línea con caminos nuevos, sin repetirlos.
- Los colores que marcó que le gustan se conservan en al menos dos de los tres caminos.
- No repitas ninguna paleta ni camino que ya vio. Si ya vio familias de estilo, probá otras, salvo la de un camino que le gustó.
- Si hay un pedido en palabras, manda sobre todo lo demás (salvo las reglas de la ficha).

## Catálogo de estilos

Quince familias. Cada una: su número y nombre, el mecanismo que la define, los rubros para los que suele servir y sus descriptores en inglés, numerados.

${catalogoEstilosParaPrompt()}

## Catálogo de tipografías

Todas de Google Fonts, con licencia libre. Cada línea: nombre, su estilo y su carácter, y entre corchetes si sirve para texto y si está muy vista.

${catalogoParaPrompt()}`;

/** Lo que la persona ya vio y opinó, para la próxima vuelta de caminos */
export type IteracionDirecciones = {
  gustan?: { nombre: string; idea: string; colores: string[]; estilo?: string }[];
  vistos?: { nombre: string; colores: string[]; estilo?: string }[];
  colores?: string[];
  pedido?: string;
};

export function pedidoDirecciones(brief: unknown, i: IteracionDirecciones = {}) {
  const partes = [`Ficha de la marca:\n${JSON.stringify(brief, null, 2)}`];
  const familia = (v: { estilo?: string }) => (v.estilo ? ` [familia: ${v.estilo}]` : "");
  if (i.vistos?.length)
    partes.push(`Caminos que ya vio:\n${i.vistos.map((v) => `- ${v.nombre}${familia(v)}: ${v.colores.join(" ")}`).join("\n")}`);
  if (i.gustan?.length)
    partes.push(
      `Caminos que le gustaron:\n${i.gustan.map((v) => `- ${v.nombre}${familia(v)} (${v.idea}): ${v.colores.join(" ")}`).join("\n")}`,
    );
  if (i.colores?.length) partes.push(`Colores que marcó que le gustan (conservalos): ${i.colores.join(" ")}`);
  if (i.pedido?.trim()) partes.push(`Lo que pide la persona: ${i.pedido.trim()}`);
  return partes.join("\n\n");
}
