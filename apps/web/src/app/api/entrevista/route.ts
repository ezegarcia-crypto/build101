import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { briefSchema } from "@/lib/ia/brief";
import { MODELO_ENTREVISTA, PROMPT_ENTREVISTADOR } from "@/lib/ia/entrevistador";
import { etiquetar, fijarCorrida, medir } from "@/lib/ia/gastos";

// La entrevista por chat. La pantalla usa useChat de @ai-sdk/react contra /api/entrevista.
// Cuando la persona confirma el resumen, la IA llama a `terminar_entrevista`: en los mensajes
// aparece una parte de tipo "tool-terminar_entrevista" con la ficha de la marca en `input`.

export const maxDuration = 60;

export const POST = medir("entrevista", async (req: Request) => {
  const { messages, id }: { messages: UIMessage[]; id?: string } = await req.json();
  fijarCorrida(id); // toda la conversación cuenta como una sola corrida

  const result = streamText({
    model: MODELO_ENTREVISTA,
    providerOptions: etiquetar(),
    instructions: PROMPT_ENTREVISTADOR,
    messages: await convertToModelMessages(messages),
    tools: {
      terminar_entrevista: {
        description:
          "Entrega la ficha de la marca cuando la persona confirmó el resumen. Solo se llama una vez, al final.",
        inputSchema: briefSchema,
        execute: async () => ({ ok: true }),
      },
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
});
