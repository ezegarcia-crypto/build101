import { entradaPieza, leerConKit } from "@/app/api/contenidos/entrada";
import { redactar } from "@/lib/ia/contenidos/motor";

// Escribe (o vuelve a escribir) UNA pieza del plan: para el botón "otra versión" de cada pieza.

export const maxDuration = 60;

export async function POST(req: Request) {
  const entrada = await leerConKit(req, entradaPieza);
  if (entrada instanceof Response) return entrada;
  const item = entrada.plan.piezas.find((p) => p.id === entrada.id);
  if (!item) return Response.json({ error: `No hay una pieza ${entrada.id} en el plan` }, { status: 400 });
  return Response.json(await redactar({ ...entrada, item }));
}
