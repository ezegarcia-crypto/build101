import { generateText, Output } from "ai";
import { z } from "zod";

import { briefSchema } from "@/lib/ia/brief";
import { etiquetar, medir, senalDelPedido } from "@/lib/ia/gastos";
import { MODELO_NOMBRES, nombresSchema, PROMPT_NOMBRES, pedidoNombres } from "@/lib/ia/nombres";
import { conReintento } from "@/lib/ia/reintentar";

// Módulo A, nombres: con la ficha, cinco nombres con su trasfondo. Se puede pedir otra vuelta.
// Entra: { brief, descartados?, gustan?, pedido? }. Sale: { nombres }.

export const maxDuration = 60;

const iteracionSchema = z.object({
  descartados: z.array(z.string()).max(60).optional(),
  gustan: z.array(z.string()).max(20).optional(),
  pedido: z.string().max(500).optional(),
});

export const POST = medir("nombres", async (req: Request) => {
  const cuerpo = await req.json();
  const ficha = briefSchema.safeParse(cuerpo.brief);
  const iteracion = iteracionSchema.safeParse(cuerpo);
  if (!ficha.success || !iteracion.success) {
    return Response.json({ error: "Falta la ficha de la marca o está incompleta" }, { status: 400 });
  }

  const { output } = await conReintento(() =>
    generateText({
      model: MODELO_NOMBRES,
      abortSignal: senalDelPedido(),
      providerOptions: etiquetar(),
      instructions: PROMPT_NOMBRES,
      output: Output.object({ schema: nombresSchema }),
      prompt: pedidoNombres(ficha.data, iteracion.data),
    }),
  );

  // Por si la IA repite alguno descartado, se filtra igual
  const fuera = new Set((iteracion.data.descartados ?? []).map((n) => n.trim().toLowerCase()));
  const nombres = output.nombres.filter((n) => !fuera.has(n.nombre.trim().toLowerCase()));

  return Response.json({ nombres });
});
