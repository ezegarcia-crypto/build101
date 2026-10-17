import { entradaLote, leerConKit } from "@/app/api/contenidos/entrada";
import { generarLote } from "@/lib/ia/contenidos/motor";

// El lote completo del módulo B: plan, piezas e imágenes, en una sola llamada.
// Responde una línea JSON por evento (NDJSON) apenas cada cosa está lista, para que la pantalla
// muestre el progreso y vaya armando el feed. Ver lib/ia/contenidos/README.md.

export const maxDuration = 300;

export async function POST(req: Request) {
  const entrada = await leerConKit(req, entradaLote);
  if (entrada instanceof Response) return entrada;

  const codificar = new TextEncoder();
  const cuerpo = new ReadableStream({
    async start(control) {
      try {
        for await (const evento of generarLote(entrada)) control.enqueue(codificar.encode(`${JSON.stringify(evento)}\n`));
      } catch (e) {
        control.enqueue(codificar.encode(`${JSON.stringify({ tipo: "error", donde: "lote", mensaje: String((e as Error).message ?? e) })}\n`));
      }
      control.close();
    },
  });

  return new Response(cuerpo, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}
