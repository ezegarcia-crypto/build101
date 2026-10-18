import { generateText, Output } from "ai";
import { z } from "zod";

import { leer } from "@/app/api/contenidos/entrada";
import { destacadasSchema, MODELO_DESTACADAS, PROMPT_DESTACADAS, pedidoDestacadas } from "@/lib/ia/destacadas";
import { etiquetar, medir, senalDelPedido } from "@/lib/ia/gastos";
import { conReintento } from "@/lib/ia/reintentar";

// Módulo B, las historias destacadas del perfil de Instagram (components/feed/instagram.tsx).
// Entra: { marca, objetivo?, pilares } (los pilares del plan del mes). Sale: { destacadas: [{ pilar, nombre_corto, icono }] },
// una por pilar y en el mismo orden. Es una llamada chica, con el modelo barato.

export const maxDuration = 30;

const entrada = z.object({
  marca: z.string().min(1).max(120),
  objetivo: z.string().max(600).optional(),
  pilares: z.array(z.object({ nombre: z.string().max(120), para_que: z.string().max(600) })).min(1).max(8),
});

export const POST = medir("contenidos-destacadas", async (req: Request) => {
  const e = await leer(req, entrada);
  if (e instanceof Response) return e;

  try {
    const { output } = await conReintento(() =>
      generateText({
        model: MODELO_DESTACADAS,
        abortSignal: senalDelPedido(),
        providerOptions: etiquetar(),
        instructions: PROMPT_DESTACADAS,
        output: Output.object({ schema: destacadasSchema }),
        prompt: pedidoDestacadas(e),
      }),
    );
    // Una por pilar y en su orden, aunque la IA haya devuelto de más o cambiado el nombre del pilar
    const destacadas = e.pilares.map((p, i) => {
      const d = output.destacadas.find((x) => x.pilar.trim().toLowerCase() === p.nombre.trim().toLowerCase()) ?? output.destacadas[i];
      return d ? { pilar: p.nombre, nombre_corto: d.nombre_corto.trim().slice(0, 16), icono: d.icono } : null;
    });
    return Response.json({ destacadas });
  } catch (error) {
    console.error("[destacadas]", error);
    return Response.json({ error: "No pudimos elegir los íconos de las destacadas." }, { status: 502 });
  }
});
