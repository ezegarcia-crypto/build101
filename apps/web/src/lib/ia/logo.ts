import { generateImage, generateText, Output } from "ai";
import { z } from "zod";

import { briefSchema, type Brief } from "@/lib/ia/brief";

// La generación del logo: a partir de la ficha de la marca, Claude piensa 3 direcciones bien distintas
// (concepto + pedido al dibujante) y un modelo de imágenes las dibuja en paralelo.
// Probamos también que Claude dibuje el SVG directo: sale vectorial, pero tarda ~50 s y repite ideas;
// Recraft tarda ~5 s por logo, escribe bien el nombre y se ve más profesional.

export const MODELO_DIRECCIONES = "anthropic/claude-sonnet-5.5";
export const MODELO_IMAGEN = "recraft/recraft-v4.1";
export const MODELO_IMAGEN_RESPALDO = "openai/gpt-image-2";

export const ENFOQUES = ["logotipo", "isotipo", "emblema"] as const;

export const PROMPT_LOGO = `Sos un diseñador de identidad senior. A partir de la ficha de una marca, proponés 3 direcciones de logo bien distintas entre sí, una por enfoque y en este orden:
1. logotipo: solo el nombre, con un trabajo tipográfico propio (una ligadura, un corte, una letra modificada que cuente algo del negocio).
2. isotipo: un símbolo simple y memorable al lado o arriba del nombre.
3. emblema: el nombre o sus iniciales dentro de una forma contenedora (sello, escudo, círculo, etiqueta).

Para cada dirección:
- concepto: 2 frases como mucho, en español rioplatense y sin jerga, que le explican la idea a la dueña o al dueño del negocio (qué se ve y por qué tiene que ver con su marca).
- colores: de 1 a 3 colores planos en hex.
- prompt: el pedido en inglés para un modelo de imágenes que dibuja el logo, de 800 caracteres como mucho. Siempre: "Flat vector logo, centered on a plain white background, the whole logo fully inside the canvas with generous margin", el nombre exacto de la marca entre comillas y deletreado, el estilo de letra, los colores en hex, y al final "No mockup, no 3D, no gradients, no shadows, no extra text".

Reglas:
- Las tres ideas no repiten el mismo símbolo ni la misma tipografía.
- Respetá la personalidad (palabras_si y palabras_no), los colores que le gustan y los que no, y lo obligatorio de las restricciones.
- Si viene una paleta, usá solo colores de esa paleta.
- Si la marca no tiene nombre (marca.nombre en null), no escribas ningún texto en el logo: los tres son símbolos solos, y en el prompt pedí "no text, no letters".
- Nada de clichés vacíos (bombita de luz, engranaje, hojita genérica) salvo que los reinterpretes con una idea.
- Lo que no está en la ficha no lo inventes: no agregues eslóganes ni años que no estén.`;

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

// Lo que recibe POST /api/logo. La paleta es opcional porque la identidad se genera aparte.
export const pedidoLogoSchema = z.object({
  brief: briefSchema,
  paleta: z.array(hex).max(6).optional().describe("Colores de la identidad, si ya están elegidos"),
});

const direccionesSchema = z.object({
  propuestas: z
    .array(
      z.object({
        concepto: z.string(),
        colores: z.array(z.string()).describe("De 1 a 3 colores en hex, como #1F2A5A"),
        prompt: z.string(),
      }),
    )
    .length(3),
});

export type PropuestaLogo = {
  enfoque: (typeof ENFOQUES)[number];
  concepto: string;
  colores: string[];
  /** La imagen lista para usar en un <img src>: data URL (PNG o WebP), 1024 × 1024, fondo blanco. */
  imagen: string;
  modelo: string;
  segundos: number;
};

async function dibujar(prompt: string) {
  for (const modelo of [MODELO_IMAGEN, MODELO_IMAGEN_RESPALDO]) {
    try {
      const { image } = await generateImage({ model: modelo, prompt, size: "1024x1024" });
      return { imagen: `data:${image.mediaType ?? "image/png"};base64,${image.base64}`, modelo };
    } catch (error) {
      console.error(`[logo] ${modelo} falló:`, error);
    }
  }
  return null;
}

export async function generarLogos({ brief, paleta }: { brief: Brief; paleta?: string[] }) {
  const { output } = await generateText({
    model: MODELO_DIRECCIONES,
    instructions: PROMPT_LOGO,
    output: Output.object({ schema: direccionesSchema }),
    prompt: `Ficha de la marca:\n${JSON.stringify(brief, null, 1)}${
      paleta?.length ? `\n\nPaleta de la identidad: ${paleta.join(" ")}` : ""
    }`,
  });

  const dibujos = await Promise.all(
    output.propuestas.map(async (p, i) => {
      const t0 = Date.now();
      const dibujo = await dibujar(p.prompt);
      if (!dibujo) return null;
      return {
        enfoque: ENFOQUES[i],
        concepto: p.concepto,
        colores: p.colores,
        ...dibujo,
        segundos: Math.round((Date.now() - t0) / 100) / 10,
      } satisfies PropuestaLogo;
    }),
  );

  return dibujos.filter((d): d is PropuestaLogo => d !== null);
}
