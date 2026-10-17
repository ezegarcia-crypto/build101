import { z } from "zod";

import { briefSchema } from "@/lib/ia/brief";
import { planSchema } from "@/lib/ia/contenidos/esquemas";
import { identidadSchema } from "@/lib/ia/identidad";

// Lo que reciben las rutas del módulo B. Se valida antes de gastar en la IA.

const mezcla = z.object({
  post: z.number().int().min(0).max(6),
  carrusel: z.number().int().min(0).max(3),
  historia: z.number().int().min(0).max(6),
  reel: z.number().int().min(0).max(2),
});

export const entradaLote = z.object({
  brief: briefSchema,
  identidad: identidadSchema,
  mezcla: mezcla.optional(),
  imagenes: z.boolean().default(true),
});

export const entradaPieza = z.object({
  brief: briefSchema,
  identidad: identidadSchema,
  plan: planSchema,
  id: z.string().describe("El id de la pieza del plan a (re)generar"),
});

export const entradaImagen = z.object({
  clave: z.string(),
  prompt: z.string().max(4000),
  ancho: z.number(),
  alto: z.number(),
});

/** Lee y valida el cuerpo; si no sirve, devuelve la respuesta 400 con el motivo. */
export async function leer<T extends z.ZodType>(req: Request, esquema: T): Promise<z.infer<T> | Response> {
  const r = esquema.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ error: "Datos de entrada inválidos", detalle: z.prettifyError(r.error) }, { status: 400 });
  return r.data;
}
