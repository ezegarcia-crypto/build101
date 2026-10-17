import { z } from "zod";

import { colorSchema } from "@/lib/ia/direcciones";

// Módulo A, iterar la paleta: con la marca ya armada, la persona pide cambios en palabras ("más cálida",
// "sin verde", "que el principal sea más oscuro") y la IA propone otra paleta para la misma dirección.
// Los colores que la persona no menciona se cuidan: se cambia lo pedido, no todo.

export const MODELO_PALETA = "anthropic/claude-sonnet-5.5";

export const paletaSchema = z.object({
  paleta: z
    .array(colorSchema)
    .min(4)
    .max(6)
    .describe("La nueva paleta: exactamente un color con rol fondo y uno con rol texto, uno principal y uno acento"),
  explicacion: z
    .string()
    .describe("Qué cambió y por qué, en una o dos frases para la dueña o el dueño del negocio, sin jerga"),
  uso_de_colores: z
    .string()
    .describe("Cómo se combinan los colores de la NUEVA paleta, nombrándolos, en dos o tres frases (va en el brandbook)"),
});

export const PROMPT_PALETA = `Sos el director visual de BrandIA. La persona ya tiene su marca armada y quiere ajustar la paleta de colores. Proponés una nueva paleta para la misma dirección visual.

Reglas:
- El pedido de la persona manda: cambiá lo que pide. Si no pide nada concreto, proponé una variante distinta pero dentro de la misma idea de marca.
- Si pide algo puntual (un color, el fondo, más contraste), conservá el resto de la paleta lo más parecida posible.
- Respetá colores_no y lo que la marca nunca tiene que transmitir (palabras_no) de la ficha.
- De 4 a 6 colores: exactamente uno "fondo" y uno "texto" (que se lean muy bien juntos), uno "principal" y uno "acento"; el resto, "apoyo".
- El principal tiene que verse sobre el fondo en títulos y formas grandes.
- Cada color con un nombre evocador en español rioplatense (por ejemplo «Harina tostada»).
- No repitas ninguna de las paletas que la persona ya vio.`;

export function pedidoPaleta({
  brief,
  direccion,
  actual,
  vistas,
  pedido,
}: {
  brief: unknown;
  direccion: unknown;
  actual: z.infer<typeof colorSchema>[];
  vistas: z.infer<typeof colorSchema>[][];
  pedido?: string;
}) {
  return [
    `Ficha de la marca:\n${JSON.stringify(brief, null, 1)}`,
    `Dirección visual elegida:\n${JSON.stringify(direccion, null, 1)}`,
    `Paleta actual:\n${JSON.stringify(actual)}`,
    vistas.length ? `Paletas que ya vio y no quiere repetir:\n${vistas.map((p) => p.map((c) => c.hex).join(" ")).join("\n")}` : "",
    pedido?.trim() ? `Lo que pide la persona: ${pedido.trim()}` : "La persona no pidió nada concreto: proponé una variante.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
