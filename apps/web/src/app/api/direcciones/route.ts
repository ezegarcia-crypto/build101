import { generateText, Output } from "ai";

import { type Brief, briefSchema } from "@/lib/ia/brief";
import { asegurarContraste } from "@/lib/ia/comprobaciones";
import { direccionesSchema, MODELO_DIRECCIONES, PROMPT_DIRECCIONES } from "@/lib/ia/direcciones";
import { conReintento } from "@/lib/ia/reintentar";

// Módulo A, paso 2: con la ficha, tres direcciones visuales para elegir.
// Entra: { brief }. Sale: { direcciones }, con el contraste del texto ya comprobado en cada una.

export const maxDuration = 120;

export async function POST(req: Request) {
  const cuerpo = await req.json();
  const ficha = briefSchema.safeParse(cuerpo.brief);
  if (!ficha.success) {
    return Response.json({ error: "Falta la ficha de la marca o está incompleta" }, { status: 400 });
  }

  const { output } = await conReintento(() =>
    generateText({
      model: MODELO_DIRECCIONES,
      instructions: PROMPT_DIRECCIONES,
      output: Output.object({ schema: direccionesSchema }),
      prompt: `Ficha de la marca:\n${JSON.stringify(ficha.data satisfies Brief, null, 2)}`,
    }),
  );

  const direcciones = output.direcciones.map((d) => {
    const { paleta, comprobacion } = asegurarContraste(d.paleta);
    return { ...d, paleta, comprobaciones: [comprobacion] };
  });

  return Response.json({ direcciones });
}
