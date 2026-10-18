import { entradaLote, leerConKit } from "@/app/api/contenidos/entrada";
import { planificar } from "@/lib/ia/contenidos/motor";
import { medir } from "@/lib/ia/gastos";

// Solo el plan del mes (pilares y piezas), sin escribirlas. Tarda unos segundos.

export const maxDuration = 60;

export const POST = medir("contenidos-plan", async (req: Request) => {
  const entrada = await leerConKit(req, entradaLote);
  if (entrada instanceof Response) return entrada;
  return Response.json(await planificar(entrada));
});
