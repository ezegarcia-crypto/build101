import { generateImage } from "ai";
import { z } from "zod";

import { leer } from "@/app/api/contenidos/entrada";
import { MODELO_IMAGEN } from "@/lib/ia/contenidos/imagen";

// BranderIA (módulo C): la foto de UN producto con la marca impresa. A diferencia del feed, acá la IA
// recibe el logo real del cliente como imagen de referencia y lo imprime en el producto, para que
// siga la curva, la textura y la luz del material. Probado el 17/10: gpt-image-2 lo copia fiel, ~15 s.
// El pedido (qué producto, qué va impreso, el estilo de la marca) lo arma la pantalla.

export const maxDuration = 120;

const entrada = z.object({
  prompt: z.string().max(4000),
  logo: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,/)
    .max(3_000_000)
    .describe("El logo del cliente como data URL, achicado por la pantalla"),
});

export async function POST(req: Request) {
  const e = await leer(req, entrada);
  if (e instanceof Response) return e;

  const logo = Buffer.from(e.logo.slice(e.logo.indexOf(",") + 1), "base64");
  try {
    const { image } = await generateImage({
      model: MODELO_IMAGEN,
      prompt: { images: [logo], text: e.prompt },
      size: "1024x1024",
      providerOptions: { openai: { outputFormat: "jpeg", outputCompression: 85 } },
    });
    return Response.json({ url: `data:${image.mediaType};base64,${image.base64}` });
  } catch (error) {
    console.error("[branderia] la foto falló:", error);
    return Response.json({ error: "No pudimos sacar la foto del producto." }, { status: 502 });
  }
}
