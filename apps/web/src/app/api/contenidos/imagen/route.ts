import { entradaImagen, leer } from "@/app/api/contenidos/entrada";
import { generarImagen } from "@/lib/ia/contenidos/imagen";
import { medir } from "@/lib/ia/gastos";

// Genera UNA imagen a partir de un pedido de la pieza (pieza.imagenes[n]): el prompt ya trae la marca.

export const maxDuration = 120;

export const POST = medir("contenidos-imagen", async (req: Request) => {
  const entrada = await leer(req, entradaImagen);
  if (entrada instanceof Response) return entrada;
  return Response.json(await generarImagen(entrada));
});
