import { generateText, Output } from "ai";
import { z } from "zod";

import { briefSchema } from "@/lib/ia/brief";
import { asegurarContraste, comprobarPrincipal } from "@/lib/ia/comprobaciones";
import { colorSchema, direccionSchema } from "@/lib/ia/direcciones";
import { etiquetar, medir, senalDelPedido } from "@/lib/ia/gastos";
import { MODELO_PALETA, paletaSchema, PROMPT_PALETA, pedidoPaleta } from "@/lib/ia/paleta";
import { conReintento } from "@/lib/ia/reintentar";

// Módulo A, iterar la paleta. Entra: { brief, direccion, paleta (la actual), vistas?, pedido? }.
// Sale: { paleta, explicacion, uso_de_colores, comprobaciones }, con el contraste ya asegurado como en /api/identidad.

export const maxDuration = 60;

const entrada = z.object({
  brief: briefSchema,
  direccion: direccionSchema,
  paleta: z.array(colorSchema).min(1).max(8),
  vistas: z.array(z.array(colorSchema).max(8)).max(20).default([]),
  pedido: z.string().max(400).optional(),
});

export const POST = medir("paleta", async (req: Request) => {
  const e = entrada.safeParse(await req.json().catch(() => null));
  if (!e.success) {
    return Response.json({ error: "Faltan la ficha, la dirección o la paleta actual" }, { status: 400 });
  }
  const { brief, direccion, paleta: actual, vistas, pedido } = e.data;

  try {
    const { output } = await conReintento(() =>
      generateText({
        model: MODELO_PALETA,
        abortSignal: senalDelPedido(),
        providerOptions: etiquetar(),
        instructions: PROMPT_PALETA,
        output: Output.object({ schema: paletaSchema }),
        prompt: pedidoPaleta({ brief, direccion, actual, vistas, pedido }),
      }),
    );
    const { paleta, comprobacion } = asegurarContraste(output.paleta);
    return Response.json({
      paleta,
      explicacion: output.explicacion,
      uso_de_colores: output.uso_de_colores,
      comprobaciones: [comprobacion, comprobarPrincipal(paleta)],
    });
  } catch (error) {
    console.error("[paleta]", error);
    return Response.json({ error: "No pudimos pensar otra paleta." }, { status: 502 });
  }
});
