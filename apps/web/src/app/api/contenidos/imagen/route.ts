import { entradaImagen, leer } from "@/app/api/contenidos/entrada";
import { generarImagen } from "@/lib/ia/contenidos/imagen";

// Genera UNA imagen a partir de un pedido de la pieza (pieza.imagenes[n]): el prompt ya trae la marca.

export const maxDuration = 120;

export async function POST(req: Request) {
  const entrada = await leer(req, entradaImagen);
  if (entrada instanceof Response) return entrada;
  return Response.json(await generarImagen(entrada));
}
