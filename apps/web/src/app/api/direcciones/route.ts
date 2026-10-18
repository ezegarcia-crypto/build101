import { generateText, Output } from "ai";
import { z } from "zod";

import { type Brief, briefSchema } from "@/lib/ia/brief";
import { asegurarContraste } from "@/lib/ia/comprobaciones";
import { direccionesSchema, MODELO_DIRECCIONES, pedidoDirecciones, PROMPT_DIRECCIONES } from "@/lib/ia/direcciones";
import { conReintento } from "@/lib/ia/reintentar";
import { etiquetar, medir, senalDelPedido } from "@/lib/ia/gastos";

// Módulo A, paso 2: con la ficha, tres direcciones visuales para elegir. Se puede pedir otra vuelta con lo que la
// persona ya opinó (caminos y colores que le gustaron, los que ya vio, un pedido en palabras): la pantalla las suma.
// Entra: { brief, gustan?, vistos?, colores?, pedido? }. Sale: { direcciones }, con el contraste ya comprobado.

export const maxDuration = 120;

const hexes = z.array(z.string().max(9)).max(8);
const iteracionSchema = z.object({
  gustan: z.array(z.object({ nombre: z.string().max(80), idea: z.string().max(400), colores: hexes })).max(20).optional(),
  vistos: z.array(z.object({ nombre: z.string().max(80), colores: hexes })).max(40).optional(),
  colores: z.array(z.string().max(9)).max(12).optional(),
  pedido: z.string().max(400).optional(),
});

export const POST = medir("direcciones", async (req: Request) => {
  const cuerpo = await req.json();
  const ficha = briefSchema.safeParse(cuerpo.brief);
  const iteracion = iteracionSchema.safeParse(cuerpo);
  if (!ficha.success || !iteracion.success) {
    return Response.json({ error: "Falta la ficha de la marca o está incompleta" }, { status: 400 });
  }

  const { output } = await conReintento(() =>
    generateText({
      model: MODELO_DIRECCIONES,
      abortSignal: senalDelPedido(),
      providerOptions: etiquetar(),
      instructions: PROMPT_DIRECCIONES,
      output: Output.object({ schema: direccionesSchema }),
      prompt: pedidoDirecciones(ficha.data satisfies Brief, iteracion.data),
    }),
  );

  const direcciones = output.direcciones.map((d) => {
    const { paleta, comprobacion } = asegurarContraste(d.paleta);
    return { ...d, paleta, comprobaciones: [comprobacion] };
  });

  return Response.json({ direcciones });
});
