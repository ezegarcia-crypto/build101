import { generateText, Output } from "ai";

import { conReintento } from "@/lib/ia/reintentar";
import { fichaWebSchema, MODELO_WEB } from "@/lib/ia/web/ficha-web";
import { comprobarWeb, describirMarca, marcaWebSchema, PROMPT_ARMAR_WEB, webSchema } from "@/lib/ia/web/web";

// Web del cliente, paso 3: con la marca y la ficha de la web, la IA arma la web (estilo, secciones y textos).
// Entra: { marca: { brief, identidad }, ficha_web }. Sale: { web, comprobaciones }.

export const maxDuration = 120;

export async function POST(req: Request) {
  const cuerpo = await req.json();
  const marca = marcaWebSchema.safeParse(cuerpo.marca);
  const ficha = fichaWebSchema.safeParse(cuerpo.ficha_web);
  if (!marca.success || !ficha.success) {
    return Response.json({ error: "Faltan la marca o la ficha de la web" }, { status: 400 });
  }

  try {
    const { output: web } = await conReintento(() =>
      generateText({
        model: MODELO_WEB,
        instructions: PROMPT_ARMAR_WEB,
        output: Output.object({ schema: webSchema }),
        prompt: `Ficha de la marca e identidad:\n${describirMarca(marca.data)}\n\nFicha de la web:\n${JSON.stringify(ficha.data, null, 2)}`,
      }),
    );
    return Response.json({ web, comprobaciones: comprobarWeb(web, ficha.data) });
  } catch (error) {
    console.error("[api/web/armar]", error);
    return Response.json({ error: "No pudimos armar la web. Probá de nuevo." }, { status: 502 });
  }
}
