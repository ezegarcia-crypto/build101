import { z } from "zod";

import type { Brief } from "@/lib/ia/brief";

// Módulo A, nombres: con la ficha, cinco nombres con trasfondo. Ninguno es "porque sí": cada uno dice de
// dónde sale (significado, combinación con el nombre del negocio, palabras del rubro…) y cómo se conecta
// con la historia de la marca. Se puede iterar: nombres que no gustaron, nombres que sí y un pedido en palabras.
// La persona puede dejar una guía fija (vale para todas las vueltas) y pedir una vuelta de un solo estilo
// (por ejemplo, todas siglas).

export const MODELO_NOMBRES = "anthropic/claude-sonnet-5.5";

export const ESTRATEGIAS = {
  significado: "Por su significado",
  combinacion: "Combina tu nombre con lo que hacés",
  rubro: "Con palabras de tu rubro",
  evocativo: "Evoca una imagen o sensación",
  inventado: "Palabra nueva",
  sigla: "Sigla",
} as const;

export type Estrategia = keyof typeof ESTRATEGIAS;

export const nombreSchema = z.object({
  nombre: z.string().describe("El nombre, tal como se escribiría en el logo. De una a tres palabras"),
  estrategia: z.enum(Object.keys(ESTRATEGIAS) as [keyof typeof ESTRATEGIAS, ...(keyof typeof ESTRATEGIAS)[]]),
  de_donde_sale: z
    .string()
    .describe(
      "De dónde sale el nombre, en una frase: qué significa la palabra (y en qué idioma, si no es español), qué combina o qué imagen del rubro toma",
    ),
  historia: z
    .string()
    .describe(
      "Cómo se conecta con la historia del negocio, en una o dos frases, citando algo concreto que dijo la persona en la ficha",
    ),
});

export const nombresSchema = z.object({
  nombres: z.array(nombreSchema).min(1).max(6).describe("Exactamente cinco nombres, bien distintos entre sí"),
});

export type NombrePropuesto = z.infer<typeof nombreSchema>;

/** Lo que la persona ya opinó, para la próxima vuelta */
export type Iteracion = {
  descartados?: string[];
  gustan?: string[];
  pedido?: string;
  /** La guía que escribió la persona: vale para todas las vueltas */
  guia?: string;
  /** Una vuelta de un solo estilo (por ejemplo, todas siglas) */
  estilo?: Estrategia;
};

export const PROMPT_NOMBRES = `Sos el especialista en nombres de BrandIA. Con la ficha de un negocio, proponés cinco nombres de marca. Un nombre nunca es "porque sí": cada uno tiene un trasfondo que se puede contar y que alimenta la historia de la marca.

Cómo se arman los cinco (usá al menos cuatro estrategias distintas):
- significado: una palabra con un significado que conecta con el negocio. Puede ser de otro idioma (latín, guaraní, italiano, inglés…) si se entiende y se dice fácil; en ese caso explicá qué quiere decir.
- combinacion: combina el nombre del negocio o de la persona (si la ficha lo tiene) con lo que hace, o fusiona dos palabras clave del negocio en una.
- rubro: toma una palabra, un objeto, una herramienta o un gesto propio del rubro y lo usa con una vuelta.
- evocativo: nombra una imagen, un momento o una sensación que el cliente asocia con el negocio.
- inventado: una palabra nueva, corta y sonora, armada con partes que significan algo (y explicás cuáles).
- sigla: las iniciales de las palabras clave del negocio o del nombre de la persona, de 2 a 4 letras en mayúsculas (como «BMR» o «LUA»). Tiene que leerse fácil: que se pueda pronunciar como palabra o deletrear sin trabarse. Puede llevar una palabra corta al lado si ayuda a entender el rubro («BMR Taller»). En de_donde_sale decí qué palabra hay detrás de cada letra.

Reglas:
- Corto (una a tres palabras), fácil de decir y de escribir en español rioplatense, que se entienda dicho en voz alta.
- Nada genérico: si el nombre sirviera igual para cualquier otro negocio del mismo rubro, no sirve.
- Que no sea una marca conocida ni el nombre de una cadena grande.
- Respetá palabras_no, no_parecerse_a y las restricciones de la ficha.
- Si la ficha ya tiene nombre, al menos dos propuestas lo usan o lo combinan con lo que hace el negocio (por ejemplo, el apellido más el oficio).
- de_donde_sale explica el origen en una frase. historia cuenta cómo ese nombre ayuda a contar el negocio, citando algo concreto de la ficha (el barrio, el público, el diferencial, cómo empezó).
- Español rioplatense, simple, sin jerga de marketing.

Si te pasan lo que la persona ya opinó:
- Nunca repitas un nombre descartado ni uno muy parecido.
- Los que le gustaron muestran el estilo que busca: proponé nombres nuevos en esa línea, sin repetirlos.
- Si hay un pedido en palabras, manda sobre todo lo demás (salvo las reglas de la ficha).
- Si te pasan la guía de la persona, todas las propuestas la respetan.
- Si te piden un solo estilo, los cinco nombres son de esa estrategia, bien distintos entre sí (y no hace falta mezclar estrategias).`;

export function pedidoNombres(brief: Brief, iteracion: Iteracion = {}) {
  const partes = [`Ficha de la marca:\n${JSON.stringify(brief, null, 2)}`];
  if (iteracion.descartados?.length) partes.push(`Nombres que no le gustaron: ${iteracion.descartados.join(", ")}`);
  if (iteracion.gustan?.length) partes.push(`Nombres que le gustaron: ${iteracion.gustan.join(", ")}`);
  if (iteracion.guia?.trim()) partes.push(`Guía de la persona para el nombre (respetala en todas): ${iteracion.guia.trim()}`);
  if (iteracion.estilo) partes.push(`Esta vuelta, los cinco nombres son de la estrategia «${iteracion.estilo}» (${ESTRATEGIAS[iteracion.estilo]}).`);
  if (iteracion.pedido?.trim()) partes.push(`Lo que pide la persona: ${iteracion.pedido.trim()}`);
  return partes.join("\n\n");
}
