import { generateText, Output } from "ai";
import { z } from "zod";

import { briefSchema } from "@/lib/ia/brief";
import { asegurarContraste, comprobarPrincipal } from "@/lib/ia/comprobaciones";
import { colorSchema, direccionSchema } from "@/lib/ia/direcciones";
import { etiquetar, medir, senalDelPedido } from "@/lib/ia/gastos";
import { MODELO_PALETA, paletaSchema, PROMPT_PALETA, pedidoPaleta } from "@/lib/ia/paleta";
import { conReintento } from "@/lib/ia/reintentar";

// Módulo A, iterar la paleta. Entra: { brief, direccion, paleta (la actual), vistas?, pedido?, conservar? }.
// `conservar`: los colores que la persona marcó con "me gusta"; quedan iguales y se cambia el resto.
// Sale: { paleta, explicacion, uso_de_colores, comprobaciones }, con el contraste ya asegurado como en /api/identidad.

export const maxDuration = 60;

const entrada = z.object({
  brief: briefSchema,
  direccion: direccionSchema,
  paleta: z.array(colorSchema).min(1).max(8),
  vistas: z.array(z.array(colorSchema).max(8)).max(20).default([]),
  pedido: z.string().max(400).optional(),
  conservar: z.array(z.string().max(9)).max(8).default([]),
});

export const POST = medir("paleta", async (req: Request) => {
  const e = entrada.safeParse(await req.json().catch(() => null));
  if (!e.success) {
    return Response.json({ error: "Faltan la ficha, la dirección o la paleta actual" }, { status: 400 });
  }
  const { brief, direccion, paleta: actual, vistas, pedido, conservar } = e.data;

  try {
    const { output } = await conReintento(() =>
      generateText({
        model: MODELO_PALETA,
        abortSignal: senalDelPedido(),
        providerOptions: etiquetar(),
        instructions: PROMPT_PALETA,
        output: Output.object({ schema: paletaSchema }),
        prompt: pedidoPaleta({ brief, direccion, actual, vistas, pedido, conservar }),
      }),
    );
    // Los que marcó con "me gusta" quedan exactos aunque la IA los haya movido un poco
    // (cada uno ocupa el lugar de un color de su mismo rol; si no hay, se suma y sale un "apoyo" que no marcó)
    const fijos = actual.filter((c) => conservar.some((h) => h.toLowerCase() === c.hex.toLowerCase()));
    const usados = new Set<number>();
    const conFijos = output.paleta.map((c) => {
      const i = fijos.findIndex((f, k) => !usados.has(k) && f.rol === c.rol);
      if (i < 0) return c;
      usados.add(i);
      return fijos[i]!;
    });
    fijos.forEach((f, k) => !usados.has(k) && conFijos.push(f));
    while (conFijos.length > 6) {
      const i = conFijos.findLastIndex((c) => !fijos.includes(c) && c.rol === "apoyo");
      conFijos.splice(i >= 0 ? i : conFijos.findLastIndex((c) => !fijos.includes(c)), 1);
    }
    const { paleta, comprobacion } = asegurarContraste(conFijos);
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
