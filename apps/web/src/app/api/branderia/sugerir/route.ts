import { generateText, Output } from "ai";
import { z } from "zod";

import { leer } from "@/app/api/contenidos/entrada";
import { MODELO_SUGERIR, PRODUCTOS_SUGERIDOS, PROMPT_SUGERIR, pedidoSugerir, sugeridosSchema } from "@/lib/ia/branderia";
import { briefSchema } from "@/lib/ia/brief";
import { etiquetar, medir, senalDelPedido } from "@/lib/ia/gastos";
import { conReintento } from "@/lib/ia/reintentar";

// BranderIA (módulo C): los productos con la marca que más le sirven a ese rubro.
// Entra: { brief, marca: { nombre, eslogan }, ya? }. Sale: { productos }. Las fotos las pide la pantalla
// a /api/branderia, una por producto, igual que las del catálogo.

export const maxDuration = 60;

const entrada = z.object({
  brief: briefSchema,
  marca: z.object({ nombre: z.string().max(80), eslogan: z.string().max(200).default("") }),
  /** Los que ya se sugirieron: otra vuelta suma productos nuevos, no los repite */
  ya: z.array(z.string().max(120)).max(60).default([]),
});

export const POST = medir("branderia-sugerir", async (req: Request) => {
  const e = await leer(req, entrada);
  if (e instanceof Response) return e;

  try {
    const { output } = await conReintento(() =>
      generateText({
        model: MODELO_SUGERIR,
        abortSignal: senalDelPedido(),
        providerOptions: etiquetar(),
        instructions: PROMPT_SUGERIR,
        output: Output.object({ schema: sugeridosSchema }),
        prompt: pedidoSugerir(e.brief, e.marca, e.ya),
      }),
    );
    return Response.json({ productos: output.productos.slice(0, PRODUCTOS_SUGERIDOS) });
  } catch (error) {
    console.error("[branderia/sugerir]", error);
    return Response.json({ error: "No pudimos pensar productos para tu rubro." }, { status: 502 });
  }
});
