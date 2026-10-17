import { generateText, Output } from "ai";
import { z } from "zod";

import { briefSchema } from "@/lib/ia/brief";
import { MODELO_ENTREVISTA } from "@/lib/ia/entrevistador";
import { conReintento } from "@/lib/ia/reintentar";
import { PROMPT_FICHA_VOZ } from "@/lib/ia/voz";
import { etiquetar, medir, senalDelPedido } from "@/lib/ia/gastos";

// Cuando termina la llamada, la pantalla manda acá la transcripción y recibe la ficha de la marca,
// con el mismo formato (Brief) que devuelve la entrevista por chat.
//
// POST /api/voz/ficha  { transcripcion: [{ rol: "usuario" | "agente", texto }] }  →  { ficha }

export const maxDuration = 60;

// Topes: una llamada de 8 minutos (lo máximo que deja el agente) no llega ni cerca. Frenan un pedido
// armado a mano con una transcripción gigante, que se cobraría entera al Gateway.
const pedidoSchema = z.object({
  transcripcion: z
    .array(z.object({ rol: z.enum(["usuario", "agente"]), texto: z.string().max(4_000) }))
    .min(1)
    .max(300),
});

export const POST = medir("voz-ficha", async (req: Request) => {
  const pedido = pedidoSchema.safeParse(await req.json().catch(() => null));
  if (!pedido.success) {
    return Response.json({ error: "Falta la transcripción de la llamada." }, { status: 400 });
  }

  const { transcripcion } = pedido.data;
  if (!transcripcion.some((t) => t.rol === "usuario" && t.texto.trim())) {
    return Response.json({ error: "La persona no llegó a contar nada todavía." }, { status: 422 });
  }

  const charla = transcripcion
    .map((t) => `${t.rol === "usuario" ? "PERSONA" : "BRANDIA"}: ${t.texto.trim()}`)
    .join("\n");

  try {
    const { output } = await conReintento(() =>
      generateText({
        model: MODELO_ENTREVISTA,
        abortSignal: senalDelPedido(),
        providerOptions: etiquetar(),
        instructions: PROMPT_FICHA_VOZ,
        prompt: charla,
        output: Output.object({ schema: briefSchema, name: "ficha_de_la_marca" }),
      }),
    );
    return Response.json({ ficha: output });
  } catch (error) {
    console.error("No se pudo armar la ficha de la voz", error);
    return Response.json({ error: "No se pudo armar la ficha. Probá de nuevo." }, { status: 500 });
  }
});
