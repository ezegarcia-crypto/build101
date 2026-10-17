import { z } from "zod";

// Paso 2 del módulo A: con la ficha, la IA propone tres direcciones visuales distintas y la persona elige una.
// Adaptado de brandia/motor-ia/03-direcciones.md (sin imágenes de moodboard, para que sea rápido).

export const MODELO_DIRECCIONES = "anthropic/claude-sonnet-5.5";

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color en hex de 6 dígitos, por ejemplo #1E1E1C");

export const colorSchema = z.object({
  hex,
  nombre: z.string().describe("Nombre evocador del color, por ejemplo «Harina tostada»"),
  rol: z.enum(["principal", "acento", "fondo", "texto", "apoyo"]),
});

export const direccionSchema = z.object({
  id: z.enum(["A", "B", "C"]),
  nombre: z.string().describe("Dos o tres palabras evocadoras, por ejemplo «Horno de barrio»"),
  idea: z.string().describe("Una frase que explique la dirección a alguien que no sabe de diseño"),
  por_que: z.string().describe("Cómo responde a la ficha, citando palabras concretas de la persona"),
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
    titulos: z.object({ familia: z.string().describe("Nombre exacto en Google Fonts"), por_que: z.string() }),
    texto: z.object({ familia: z.string().describe("Nombre exacto en Google Fonts"), por_que: z.string() }),
  }),
  formas: z.string().describe("Lenguaje de formas en una línea: geométrico, orgánico, caligráfico, modular…"),
  logo_sugerido: z.object({
    tipo: z.enum(["monograma", "simbolo_y_logotipo", "sello", "solo_logotipo"]),
    por_que: z.string(),
  }),
  riesgo: z.string().describe("Qué podría salir mal con esta dirección, en una línea"),
});

export const direccionesSchema = z.object({
  direcciones: z.array(direccionSchema).min(1).max(3).describe("Exactamente tres direcciones: A, B y C"),
});

export type Color = z.infer<typeof colorSchema>;
export type Direccion = z.infer<typeof direccionSchema>;

export const PROMPT_DIRECCIONES = `Sos el director visual de BrandIA. Con la ficha de una marca, proponés tres direcciones visuales distintas. Cada una tiene que poder defenderse con la ficha; ninguna es relleno.

Cómo se arman las tres:
- A · la esperada: la que sale derecho de lo que pidió la persona.
- B · la vecina: comparte la esencia, pero cambia una variable fuerte (color, tono o forma).
- C · la que se anima: una lectura menos obvia de la misma ficha. Sigue respetando lo que la persona no quiere y sus restricciones.

Reglas:
- Ninguna dirección puede usar colores de colores_no, parecerse a no_parecerse_a ni romper las restricciones.
- Si la persona nombró colores que le gustan, al menos la dirección A los usa.
- Tipografías: solo de Google Fonts, con el nombre exacto de la familia (por ejemplo "Playfair Display", "DM Sans"). Una para títulos y otra para texto, que se lean bien en pantalla.
- Paleta de 4 a 6 colores: exactamente un color "fondo" y uno "texto", y el texto sobre el fondo tiene que leerse muy bien (contraste alto).
- Si la marca ya tiene logo o algo a conservar, las tres lo respetan.
- Si la ficha dice que necesita nombre, cada dirección propone uno distinto en nombre_marca, corto, fácil de decir en español rioplatense y que no sea una marca conocida.
- Español rioplatense, sin jerga de diseño: la persona tiene que entender cada dirección.`;
