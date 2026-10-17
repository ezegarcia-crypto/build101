import { generateImage, generateText, Output } from "ai";
import { z } from "zod";

import { briefSchema, type Brief } from "@/lib/ia/brief";
import { direccionSchema, type Direccion } from "@/lib/ia/direcciones";
import { conReintento } from "@/lib/ia/reintentar";
import { etiquetar } from "@/lib/ia/gastos";

// El logo completo (símbolo + nombre) para el brandbook y el feed, a partir de la ficha y la dirección elegida.
// Claude piensa 3 propuestas (concepto + pedido al dibujante) y un modelo de imágenes las dibuja en paralelo.
// El isotipo vectorial lo dibuja aparte la identidad (identidad.ts). Probamos que Claude dibuje también el logo
// completo en SVG: tarda ~50 s y repite ideas; Recraft tarda ~5 s por logo, escribe bien el nombre y se ve más profesional.

export const MODELO_CONCEPTOS = "anthropic/claude-sonnet-5.5";
export const MODELO_IMAGEN = "recraft/recraft-v4.1";
export const MODELO_IMAGEN_RESPALDO = "openai/gpt-image-2";

// Los mismos tipos de logo que sugiere la dirección. La primera propuesta es la sugerida y las otras dos, las
// primeras de esta lista que no lo son.
type TipoLogo = Direccion["logo_sugerido"]["tipo"];
const TIPOS: TipoLogo[] = ["simbolo_y_logotipo", "solo_logotipo", "sello", "monograma"];

const COMO_ES: Record<TipoLogo, string> = {
  solo_logotipo: "solo el nombre, con un trabajo tipográfico propio (una ligadura, un corte, una letra modificada que cuente algo del negocio)",
  simbolo_y_logotipo: "un símbolo simple y memorable al lado o arriba del nombre",
  sello: "el nombre dentro de una forma contenedora (sello, escudo, círculo, etiqueta)",
  monograma: "las iniciales entrelazadas o dentro de una forma, con el nombre completo chico debajo",
};

export const PROMPT_LOGO = `Sos un diseñador de identidad senior. Con la ficha de una marca y la dirección visual que eligió la persona, proponés 3 logos completos bien distintos entre sí, uno por tipo y en el orden que se te indica.

Para cada logo:
- concepto: 2 frases como mucho, en español rioplatense y sin jerga, que le explican la idea a la dueña o al dueño del negocio (qué se ve y por qué tiene que ver con su marca).
- colores: de 1 a 3 colores de la paleta de la dirección, en hex.
- prompt: el pedido en inglés para un modelo de imágenes que dibuja el logo, de 800 caracteres como mucho. Siempre: "Flat vector logo, centered on a plain white background, the whole logo fully inside the canvas with generous margin", el nombre exacto de la marca entre comillas y deletreado, el estilo de letra, los colores en hex, y al final "No mockup, no 3D, no gradients, no shadows, no extra text".

Reglas:
- Seguí la dirección: usá solo colores de su paleta (sobre todo el principal y el acento; nunca el de fondo para el logo), su lenguaje de formas y sus palabras. La letra del nombre va en el estilo de su tipografía de títulos: describila en el prompt (serif, sans geométrica, condensada, peso, terminaciones) y nombrala como referencia.
- Las tres ideas no repiten el mismo símbolo.
- Respetá la personalidad de la ficha (palabras_si y palabras_no), los colores que no le gustan y lo obligatorio de las restricciones.
- Si no hay nombre, no escribas ningún texto en el logo: los tres son símbolos solos, y en el prompt pedí "no text, no letters".
- Nada de clichés vacíos (bombita de luz, engranaje, hojita genérica) salvo que los reinterpretes con una idea.
- Lo que no está en la ficha no lo inventes: no agregues eslóganes ni años que no estén.`;

// Lo que recibe POST /api/logo: la ficha y la dirección elegida, tal como salen de /api/direcciones.
export const pedidoLogoSchema = z.object({
  brief: briefSchema,
  direccion: direccionSchema,
});

const conceptosSchema = z.object({
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
  tipo: TipoLogo;
  concepto: string;
  colores: string[];
  /** El pedido en inglés que Claude le escribió al modelo de imágenes, para ver de dónde sale el dibujo. */
  pedido: string;
  /** La imagen lista para usar en un <img src>: data URL (PNG o WebP), 1024 × 1024, fondo blanco. */
  imagen: string;
  modelo: string;
  segundos: number;
};

async function dibujar(prompt: string) {
  for (const modelo of [MODELO_IMAGEN, MODELO_IMAGEN_RESPALDO]) {
    try {
      const { image } = await generateImage({ model: modelo, prompt, size: "1024x1024", providerOptions: etiquetar() });
      return { imagen: `data:${image.mediaType ?? "image/png"};base64,${image.base64}`, modelo };
    } catch (error) {
      console.error(`[logo] ${modelo} falló:`, error);
    }
  }
  return null;
}

export async function generarLogos({ brief, direccion }: { brief: Brief; direccion: Direccion }) {
  const nombre = brief.marca.nombre ?? direccion.nombre_marca;
  const sugerido = direccion.logo_sugerido.tipo;
  const tipos = [sugerido, ...TIPOS.filter((t) => t !== sugerido).slice(0, 2)];

  const { output } = await conReintento(() =>
    generateText({
      model: MODELO_CONCEPTOS,
      providerOptions: etiquetar(),
      instructions: PROMPT_LOGO,
      output: Output.object({ schema: conceptosSchema }),
      prompt: [
        `Nombre de la marca: ${nombre ? `"${nombre}"` : "todavía no tiene (logos sin texto)"}`,
        `Tipos de logo, en este orden:\n${tipos.map((t, i) => `${i + 1}. ${COMO_ES[t]}`).join("\n")}`,
        `Dirección elegida:\n${JSON.stringify(
          {
            nombre: direccion.nombre,
            idea: direccion.idea,
            palabras: direccion.palabras,
            paleta: direccion.paleta,
            tipografia_titulos: direccion.tipografias.titulos.familia,
            formas: direccion.formas,
            logo_sugerido: direccion.logo_sugerido,
          },
          null,
          1,
        )}`,
        `Ficha de la marca:\n${JSON.stringify(brief, null, 1)}`,
      ].join("\n\n"),
    }),
  );

  const dibujos = await Promise.all(
    output.propuestas.map(async (p, i) => {
      const t0 = Date.now();
      const dibujo = await dibujar(p.prompt);
      if (!dibujo) return null;
      return {
        tipo: tipos[i],
        concepto: p.concepto,
        colores: p.colores,
        pedido: p.prompt,
        ...dibujo,
        segundos: Math.round((Date.now() - t0) / 100) / 10,
      } satisfies PropuestaLogo;
    }),
  );

  return dibujos.filter((d): d is PropuestaLogo => d !== null);
}
