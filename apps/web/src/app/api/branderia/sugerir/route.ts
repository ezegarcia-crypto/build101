import { generateText, Output } from "ai";
import { z } from "zod";

import { leer } from "@/app/api/contenidos/entrada";
import { MODELO_SUGERIR, PRODUCTOS_SUGERIDOS, PROMPT_SUGERIR, pedidoSugerir, sugeridosSchema } from "@/lib/ia/branderia";
import { briefSchema } from "@/lib/ia/brief";
import { etiquetar, medir, senalDelPedido } from "@/lib/ia/gastos";
import { conReintento } from "@/lib/ia/reintentar";

// BranderIA (módulo C): los productos con la marca que más le sirven a ese rubro.
// Entra: { brief, marca: { nombre, eslogan }, ya?, gustan?, pedido?, cantidad? }. Sale: { productos }. Las fotos las pide la pantalla
// a /api/branderia, una por producto, igual que las del catálogo.

export const maxDuration = 60;

const entrada = z.object({
  brief: briefSchema,
  marca: z.object({ nombre: z.string().max(80), eslogan: z.string().max(200).default("") }),
  /** Los que ya vio: otra vuelta suma productos nuevos, no los repite */
  ya: z.array(z.string().max(120)).max(80).default([]),
  /** Los que marcó con "me gusta": la próxima vuelta va en esa línea */
  gustan: z.array(z.string().max(120)).max(40).default([]),
  /** Lo que pide en palabras ("stickers para cerrar las cajas") */
  pedido: z.string().max(300).optional(),
  cantidad: z.number().int().min(1).max(PRODUCTOS_SUGERIDOS).default(PRODUCTOS_SUGERIDOS),
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
        prompt: pedidoSugerir(e.brief, e.marca, e),
      }),
    );
    // Por si la IA repite alguno que ya vio, se filtra igual
    const vistos = new Set(e.ya.map((n) => n.trim().toLowerCase()));
    const productos = output.productos.filter((p) => !vistos.has(p.nombre.trim().toLowerCase())).slice(0, e.cantidad);
    return Response.json({ productos });
  } catch (error) {
    console.error("[branderia/sugerir]", error);
    return Response.json({ error: "No pudimos pensar productos para tu rubro." }, { status: 502 });
  }
});
