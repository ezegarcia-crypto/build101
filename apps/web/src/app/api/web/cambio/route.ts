import { generateText, Output } from "ai";
import { z } from "zod";

import { conReintento } from "@/lib/ia/reintentar";
import { fichaWebSchema, MODELO_WEB } from "@/lib/ia/web/ficha-web";
import { comprobarWeb, describirMarca, marcaWebSchema, PROMPT_CAMBIAR_WEB, webSchema } from "@/lib/ia/web/web";

// Web del cliente, paso 4: cambios pedidos en palabras.
// Entra: { marca, ficha_web, web, pedido }. Sale: { respuesta, web, ficha_web, comprobaciones }.

export const maxDuration = 120;

const cambioSchema = z.object({
  respuesta: z.string().describe("Qué cambiaste, en una o dos frases para la persona"),
  web: webSchema,
  ficha_web: fichaWebSchema,
});

export async function POST(req: Request) {
  const cuerpo = await req.json();
  const marca = marcaWebSchema.safeParse(cuerpo.marca);
  const ficha = fichaWebSchema.safeParse(cuerpo.ficha_web);
  const web = webSchema.safeParse(cuerpo.web);
  const pedido = typeof cuerpo.pedido === "string" ? cuerpo.pedido.trim().slice(0, 1000) : "";
  if (!marca.success || !ficha.success || !web.success || !pedido) {
    return Response.json({ error: "Faltan la web o el pedido" }, { status: 400 });
  }

  try {
    const { output } = await conReintento(() =>
      generateText({
        model: MODELO_WEB,
        instructions: PROMPT_CAMBIAR_WEB,
        output: Output.object({ schema: cambioSchema }),
        prompt: `Ficha de la marca e identidad:\n${describirMarca(marca.data)}\n\nFicha de la web:\n${JSON.stringify(ficha.data, null, 2)}\n\nLa web actual:\n${JSON.stringify(web.data, null, 2)}\n\nEl pedido de la persona:\n«${pedido}»`,
      }),
    );
    return Response.json({ ...output, comprobaciones: comprobarWeb(output.web, output.ficha_web) });
  } catch (error) {
    console.error("[api/web/cambio]", error);
    return Response.json({ error: "No pudimos hacer el cambio. Probá de nuevo." }, { status: 502 });
  }
}
