import { z } from "zod";

// Paso 3 del módulo A: con la ficha y la dirección elegida, la IA arma el contenido del brandbook
// (esencia, voz, estilo y reglas) y dibuja el símbolo del logo. Las dos llamadas corren en paralelo.
// Los colores y las tipografías ya vienen de la dirección elegida (paso 2).

export const MODELO_TEXTOS = "anthropic/claude-sonnet-5.5";
export const MODELO_LOGO = "anthropic/claude-opus-5.5";

export const textosSchema = z.object({
  nombre: z.string().describe("El nombre final de la marca: el de la ficha o, si no tenía, el propuesto en la dirección"),
  eslogan: z.string().describe("Corto, memorable, en el trato de la marca. Si la persona pidió no tener eslogan, cadena vacía"),
  esencia: z.object({
    idea: z.string().describe("La idea de la marca en una frase, para alguien sin formación en diseño"),
    proposito: z.string().describe("Por qué existe la marca, en una o dos frases"),
    promesa: z.string().describe("Lo que el cliente siempre puede esperar, en una frase"),
    posicionamiento: z.string().describe("Para quién es, qué ofrece y en qué se diferencia, en una frase"),
    publico: z.string().describe("Retrato corto del cliente ideal"),
    valores: z
      .array(z.object({ valor: z.string(), significa: z.string() }))
      .min(1)
      .max(4)
      .describe("Tres valores, cada uno con qué significa en la práctica"),
  }),
  voz: z.object({
    resumen: z.string().describe("Cómo habla la marca, en dos frases"),
    rasgos: z
      .array(z.object({ rasgo: z.string(), es: z.string(), no_es: z.string() }))
      .min(1)
      .max(4)
      .describe("Tres rasgos con su límite, por ejemplo «Cercana: es charlar de igual a igual · no es confianzuda»"),
    palabras_si: z.array(z.string()).min(1).max(6).describe("Cinco palabras o expresiones propias de la marca"),
    palabras_no: z.array(z.string()).min(1).max(6).describe("Cinco palabras o expresiones que la marca nunca usa"),
    ejemplos: z.object({
      bio_instagram: z.string().describe("Máximo 150 caracteres"),
      posteo: z.string().describe("Un posteo corto de presentación"),
      respuesta_cliente: z.string().describe("Respuesta por WhatsApp a un cliente que pregunta algo típico del rubro"),
      cartel: z.string().describe("Un texto para cartel, vidriera o packaging"),
    }),
  }),
  estilo: z.object({
    uso_de_colores: z.string().describe("Cómo se combinan los colores de la paleta, en dos o tres frases"),
    fotografia: z.string().describe("Cómo son las fotos de la marca: luz, encuadre, qué aparece"),
    iconos_e_ilustracion: z.string(),
  }),
  brandbook: z.object({
    introduccion: z.string().describe("Un párrafo que presenta la marca, para abrir el manual"),
    usos_correctos: z.array(z.string()).min(1).max(5).describe("Cuatro reglas cortas"),
    usos_incorrectos: z.array(z.string()).min(1).max(5).describe("Cuatro cosas que nunca hay que hacer con la marca"),
    aplicaciones: z
      .array(z.object({ donde: z.string(), como: z.string() }))
      .min(1)
      .max(4)
      .describe("Tres o cuatro, empezando por las aplicaciones prioritarias de la ficha"),
  }),
});

export const logoSchema = z.object({
  isotipo_svg: z
    .string()
    .describe('Un SVG completo: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">…</svg>'),
  explicacion: z.string().describe("Qué representa el símbolo y por qué, en una o dos frases para el cliente"),
});

export type Textos = z.infer<typeof textosSchema>;

export const PROMPT_TEXTOS = `Sos el director creativo de BrandIA, una app que arma identidades de marca con IA para emprendedores, profesionales independientes y PyMEs.
Con la ficha de la marca y la dirección visual que eligió la persona, escribís el contenido del manual de marca.

Reglas:
- Todo sale de la ficha y de la dirección elegida. Cada decisión se tiene que poder defender con algo que dijo la persona.
- Respetá siempre palabras_no, no_parecerse_a y las restricciones. Si es una renovación, conservá lo que pide a_conservar.
- No inventes datos del negocio (premios, años, cifras, servicios) que no estén en la ficha. Lo que está en huecos se decide con criterio, sin presentarlo como un dato.
- Nada genérico: si un texto sirviera igual para otro negocio del mismo rubro, no sirve.
- Español rioplatense, simple, sin jerga de diseño ni frases hechas de marketing. Los textos de la marca (eslogan, voz, ejemplos, brandbook) van con el trato de la ficha (vos, tú o usted).`;

export const PROMPT_LOGO = `Sos el diseñador de símbolos de BrandIA. Dibujás el isotipo (el símbolo del logo) en SVG, a mano, como un diseñador gráfico.

Reglas del SVG:
- Un solo <svg> con xmlns y viewBox="0 0 100 100". Sin width ni height.
- Solo formas: path, circle, rect, ellipse, polygon, line, g. Se permite <text> únicamente si el tipo de logo es monograma, con la tipografía de títulos de la dirección.
- Máximo dos colores, tomados de la paleta (en hex). Sin degradés, sin sombras, sin filtros, sin imágenes, sin scripts.
- Simple y fuerte: tiene que reconocerse a 32 píxeles. Pocas formas, bien pensadas, con margen alrededor.
- Que exprese la idea de la dirección y el lenguaje de formas indicado, y que tenga que ver con el rubro sin ser literal ni un ícono genérico.
- Sin el nombre de la marca escrito: el nombre se compone aparte con la tipografía.`;
