import { generateImage } from "ai";
import { z } from "zod";

import { leer } from "@/app/api/contenidos/entrada";
import { etiquetar, medir, senalDelPedido } from "@/lib/ia/gastos";
import { MODELO_IMAGEN_RESPALDO } from "@/lib/ia/logo";

// Solo el símbolo del logo elegido: la IA recibe el logo completo (el que dibujó Recraft) y le saca el texto,
// sin redibujar el símbolo. Es una de las 4 versiones del logo (completo, solo el nombre, solo el símbolo y
// negativo); las otras tres las arma la pantalla en código. La pantalla la pide UNA vez, cuando se elige el
// logo, y guarda el resultado. Si sale mal (o vacío), la pantalla avisa y usa el símbolo SVG de la identidad.
// Mismo modelo y misma forma que BranderIA (imagen de referencia + pedido): gpt-image-2, ~15 s.

export const maxDuration = 120;

const entrada = z.object({
  logo: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,/)
    .max(3_000_000)
    .describe("El logo elegido como data URL (1024 × 1024, fondo blanco)"),
  nombre: z.string().max(80),
  tipo: z.enum(["simbolo_y_logotipo", "solo_logotipo", "sello", "monograma"]).optional(),
});

const QUE_QUEDA: Record<string, string> = {
  monograma:
    "This logo is a monogram: keep the monogram (the initials as a graphic mark, with its shape) and remove only the full brand name and any other small text.",
  sello:
    "This logo is a seal or badge: keep the graphic emblem (the icon or drawing inside it, or the container shape if there is no icon) and remove all the words around and inside it.",
};

export const POST = medir("logo-simbolo", async (req: Request) => {
  const e = await leer(req, entrada);
  if (e instanceof Response) return e;

  const logo = Buffer.from(e.logo.slice(e.logo.indexOf(",") + 1), "base64");
  const prompt = [
    `Edit this logo. Remove ALL the text and lettering: the brand name "${e.nombre}" and any other words, letters or taglines.`,
    "Keep ONLY the graphic symbol, exactly as it is: same shape, same colors, same proportions, same line weight. Do not redraw it, do not add anything new.",
    QUE_QUEDA[e.tipo ?? ""] ?? "",
    "Center the symbol alone on a plain pure white background, with generous margin around it.",
    "Flat vector, no mockup, no 3D, no gradients, no shadows, no text.",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const { image } = await generateImage({
      model: MODELO_IMAGEN_RESPALDO, // gpt-image-2: edita a partir de una imagen; Recraft no
      prompt: { images: [logo], text: prompt },
      size: "1024x1024",
      abortSignal: senalDelPedido(),
      providerOptions: etiquetar({ openai: { outputFormat: "jpeg", outputCompression: 90 } }),
    });
    return Response.json({ imagen: `data:${image.mediaType};base64,${image.base64}` });
  } catch (error) {
    console.error("[logo-simbolo] falló:", error);
    return Response.json({ error: "No pudimos separar el símbolo del logo." }, { status: 502 });
  }
});
