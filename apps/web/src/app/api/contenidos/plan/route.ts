import { entradaLote, leer } from "@/app/api/contenidos/entrada";
import { planificar } from "@/lib/ia/contenidos/motor";

// Solo el plan del mes (pilares y piezas), sin escribirlas. Tarda unos segundos.

export const maxDuration = 60;

export async function POST(req: Request) {
  const entrada = await leer(req, entradaLote);
  if (entrada instanceof Response) return entrada;
  return Response.json(await planificar(entrada));
}
