import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { etiquetar, fijarCorrida, medir, senalDelPedido } from "@/lib/ia/gastos";
import { fichaWebSchema, MODELO_WEB, promptEntrevistaWeb } from "@/lib/ia/web/ficha-web";
import { describirMarca, marcaWebSchema } from "@/lib/ia/web/web";

// Web del cliente, paso 1: la entrevista de la web, por chat (useChat contra /api/web/entrevista).
// Entra: { messages, marca: { brief, identidad } }. Cuando la persona confirma el resumen, la IA llama a
// `terminar_entrevista_web`: en los mensajes aparece una parte "tool-terminar_entrevista_web" con la ficha.

export const maxDuration = 60;

export const POST = medir("web-entrevista", async (req: Request) => {
  const { messages, marca, id }: { messages: UIMessage[]; marca: unknown; id?: string } = await req.json();
  const datos = marcaWebSchema.safeParse(marca);
  if (!datos.success) return Response.json({ error: "Falta la marca: primero hay que armarla" }, { status: 400 });
  fijarCorrida(id); // toda la conversación cuenta como una sola corrida

  const result = streamText({
    model: MODELO_WEB,
    abortSignal: senalDelPedido(),
    providerOptions: etiquetar(),
    instructions: promptEntrevistaWeb(describirMarca(datos.data), datos.data.identidad.nombre),
    messages: await convertToModelMessages(messages),
    tools: {
      terminar_entrevista_web: {
        description: "Entrega la ficha de la web cuando la persona confirmó el resumen. Solo se llama una vez, al final.",
        inputSchema: fichaWebSchema,
        execute: async () => ({ ok: true }),
      },
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
});
