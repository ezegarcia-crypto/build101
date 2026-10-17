import { z } from "zod";

import { briefSchema } from "@/lib/ia/brief";
import { planSchema } from "@/lib/ia/contenidos/esquemas";
import { armarKit, identidadEntradaSchema } from "@/lib/ia/contenidos/kit";

// Lo que reciben las rutas del módulo B: la ficha y la identidad tal cual las devolvieron
// /api/entrevista y /api/identidad. Se valida antes de gastar en la IA y se arma el kit.

const mezcla = z.object({
  post: z.number().int().min(0).max(6),
  carrusel: z.number().int().min(0).max(3),
  historia: z.number().int().min(0).max(6),
  reel: z.number().int().min(0).max(2),
});

export const entradaLote = z.object({
  brief: briefSchema,
  identidad: identidadEntradaSchema,
  mezcla: mezcla.optional(),
  imagenes: z.boolean().default(true),
});

export const entradaPieza = z.object({
  brief: briefSchema,
  identidad: identidadEntradaSchema,
  plan: planSchema,
  id: z.string().describe("El id de la pieza del plan a (re)generar"),
});

export const entradaImagen = z.object({
  clave: z.string(),
  prompt: z.string().max(4000),
  ancho: z.number(),
  alto: z.number(),
});

/** Lee y valida el cuerpo y, si trae ficha e identidad, le suma el kit de contenidos. */
export async function leerConKit<T extends typeof entradaLote | typeof entradaPieza>(req: Request, esquema: T) {
  const entrada = await leer(req, esquema);
  if (entrada instanceof Response) return entrada;
  const e = entrada as z.infer<T>;
  return { ...e, kit: armarKit(e.identidad, e.brief) };
}

/** Lee y valida el cuerpo; si no sirve, devuelve la respuesta 400 con el motivo. */
export async function leer<T extends z.ZodType>(req: Request, esquema: T): Promise<z.infer<T> | Response> {
  const r = esquema.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ error: "Datos de entrada inválidos", detalle: z.prettifyError(r.error) }, { status: 400 });
  return r.data;
}
