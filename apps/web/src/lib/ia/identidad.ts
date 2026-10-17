import { z } from "zod";

// La identidad de la marca: lo que sale del módulo A (generá tu marca) y entra al módulo B
// (generá tus contenidos). Es el MÍNIMO que necesitan los motores de contenido; el motor de
// identidad puede devolver más cosas, pero estas tienen que estar siempre.
//
// Tres bloques: verbal (cómo habla), visual (cómo se ve) y el logo, que es un archivo y nunca se
// redibuja: los motores lo usan tal cual o, si todavía no hay, firman con el nombre.

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color en hexadecimal, por ejemplo #1E1E1C");

export const identidadSchema = z.object({
  version: z.literal("0.1"),
  nombre: z.string().describe("El nombre de la marca, como se escribe"),
  esencia: z.string().describe("Una frase: qué es la marca y para quién"),
  promesa: z.string().describe("Lo que la marca le asegura a su cliente, en una frase"),
  mensajes_clave: z
    .array(z.string())
    .describe("Las ideas que la marca repite siempre, cada una en una frase corta"),
  voz: z.object({
    trato: z.enum(["vos", "tu", "usted"]),
    tono: z.array(z.string()).describe("Tres o cuatro adjetivos: cálida, directa…"),
    reglas: z
      .array(z.string())
      .describe("Cómo escribe: «frases cortas», «el dato adelante», «sin signos de exclamación»…"),
    lexico_si: z.array(z.string()).describe("Palabras propias que la marca usa"),
    lexico_no: z.array(z.string()).describe("Palabras o giros que la marca nunca usa"),
    ejemplos: z
      .array(z.object({ si: z.string(), no: z.string() }))
      .describe("Pares de cómo sí y cómo no suena la marca"),
  }),
  paleta: z
    .array(
      z.object({
        nombre: z.string(),
        hex,
        rol: z.enum(["fondo", "texto", "principal", "acento", "apoyo"]),
      }),
    )
    .describe("Tiene que haber al menos un color de fondo y uno de texto"),
  tipografias: z.object({
    titulos: z.object({ familia: z.string().describe("Nombre exacto en Google Fonts"), peso: z.number() }),
    texto: z.object({ familia: z.string().describe("Nombre exacto en Google Fonts"), peso: z.number() }),
  }),
  estilo_visual: z.object({
    fotografia: z.string().describe("Cómo son las fotos de la marca: luz, encuadre, materiales, gente"),
    formas: z.string().describe("Formas y recursos gráficos: bordes, módulos, texturas"),
    evitar: z.array(z.string()).describe("Lo que nunca aparece en una imagen de la marca"),
  }),
  logo: z.object({
    svg: z.string().nullable().describe("El logo en SVG, para fondos claros"),
    svg_sobre_oscuro: z.string().nullable().describe("La versión para fondos oscuros, si existe"),
  }),
});

export type Identidad = z.infer<typeof identidadSchema>;

/**
 * Los links de Google Fonts de las dos tipografías, uno por familia: si una no tiene el peso
 * pedido, Google rechaza ese link y la otra igual carga. Con peso 400 se pide la familia sola.
 */
export function urlsGoogleFonts(identidad: Identidad): string[] {
  const urls = [identidad.tipografias.titulos, identidad.tipografias.texto].map((t) => {
    const familia = encodeURIComponent(t.familia).replace(/%20/g, "+");
    const peso = t.peso === 400 ? "" : `:wght@${t.peso}`;
    return `https://fonts.googleapis.com/css2?family=${familia}${peso}&display=swap`;
  });
  return [...new Set(urls)];
}
