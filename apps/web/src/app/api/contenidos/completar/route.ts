import { generateText, Output } from "ai";
import { z } from "zod";

import { leer } from "@/app/api/contenidos/entrada";
import { MODELO_COMPLETAR, pedidoCompletar, PROMPT_COMPLETAR, type Respuesta } from "@/lib/ia/completar";
import { ESQUEMAS, type Pieza } from "@/lib/ia/contenidos/esquemas";
import { etiquetar, medir, senalDelPedido } from "@/lib/ia/gastos";
import { conReintento } from "@/lib/ia/reintentar";

// Módulo B, completar los datos a confirmar (ver lib/ia/completar.ts).
// Entra: { kit: { nombre, voz }, piezas: [{ id, formato, idea, contenido }], respuestas: [{ dato, valor | null }] }
// (valor null: ese dato no va). Sale: { piezas: [{ id, contenido } | { id, error }] }, solo las que cambiaron.
// Cada pieza se reescribe por separado y a la vez; las imágenes no cambian.

export const maxDuration = 60;

const entrada = z.object({
  kit: z.object({
    nombre: z.string().max(120),
    voz: z.object({ trato: z.string().max(40), tono: z.array(z.string().max(80)).max(10), reglas: z.array(z.string().max(300)).max(12) }),
  }),
  piezas: z
    .array(z.object({ id: z.string().max(20), formato: z.enum(["post", "carrusel", "historia", "reel"]), idea: z.string().max(400), contenido: z.unknown() }))
    .min(1)
    .max(20),
  respuestas: z.array(z.object({ dato: z.string().max(400), valor: z.string().max(600).nullable() })).min(1).max(40),
});

/** Lo que no cambia aunque la IA lo toque: los visuales (de ahí salen las imágenes) y la cantidad de partes. */
function conservarVisuales(formato: Pieza["formato"], antes: Pieza["contenido"], despues: Pieza["contenido"]) {
  const a = antes as Record<string, unknown> & Partial<Record<"laminas" | "pantallas" | "escenas", Record<string, unknown>[]>>;
  const d = despues as typeof a;
  if (formato === "post" || formato === "carrusel") d.visual = a.visual;
  if (formato === "carrusel" && d.laminas?.length !== a.laminas?.length) return null;
  if (formato === "historia") {
    if (d.pantallas?.length !== a.pantallas?.length) return null;
    d.pantallas!.forEach((p, i) => (p.visual = a.pantallas![i]!.visual));
  }
  if (formato === "reel") {
    if (d.escenas?.length !== a.escenas?.length) return null;
    d.escenas!.forEach((e, i) => {
      e.escena = a.escenas![i]!.escena;
      e.toma = a.escenas![i]!.toma;
    });
  }
  return despues;
}

export const POST = medir("contenidos-completar", async (req: Request) => {
  const e = await leer(req, entrada);
  if (e instanceof Response) return e;

  const piezas = await Promise.all(
    e.piezas.map(async (p) => {
      const esquema = ESQUEMAS[p.formato];
      const antes = esquema.safeParse(p.contenido);
      if (!antes.success) return { id: p.id, error: "La pieza no tiene el formato esperado." };
      const pendientes = antes.data.datos_a_confirmar;
      const respuestas: Respuesta[] = e.respuestas.filter((r) => pendientes.includes(r.dato));
      if (!respuestas.length) return null;
      try {
        const { output } = await conReintento(() =>
          generateText({
            model: MODELO_COMPLETAR,
            abortSignal: senalDelPedido(),
            providerOptions: etiquetar(),
            instructions: PROMPT_COMPLETAR,
            output: Output.object({ schema: esquema as typeof ESQUEMAS.post }),
            prompt: pedidoCompletar({ kit: e.kit as never, idea: p.idea, contenido: antes.data, respuestas }),
          }),
        );
        const contenido = conservarVisuales(p.formato, antes.data as Pieza["contenido"], output as Pieza["contenido"]);
        if (!contenido) return { id: p.id, error: "La pieza cambió de forma: quedó como estaba." };
        // Siguen a confirmar solo los que no se respondieron, con su texto original
        contenido.datos_a_confirmar = pendientes.filter((d) => !respuestas.some((r) => r.dato === d));
        return { id: p.id, contenido };
      } catch (error) {
        console.error("[completar]", p.id, error);
        return { id: p.id, error: "No pudimos aplicar tus datos a esta pieza." };
      }
    }),
  );
  return Response.json({ piezas: piezas.filter(Boolean) });
});
