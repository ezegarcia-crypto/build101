import { entradaContenidosSchema, generarFeed } from "@/lib/ia/contenidos";
import { medir } from "@/lib/ia/gastos";

// El feed de la marca (módulo B). Recibe { brief, identidad } y devuelve posteos e historias
// con sus imágenes ya generadas (en `imagen.url`, lista para un <img>). Tarda de 30 a 60 segundos.

export const maxDuration = 120;

export const POST = medir("contenidos-simple", async (req: Request) => {
  const entrada = entradaContenidosSchema.safeParse(await req.json().catch(() => null));
  if (!entrada.success) {
    return Response.json(
      { error: "Faltan datos: se espera { brief, identidad }", detalle: entrada.error.issues },
      { status: 400 },
    );
  }

  try {
    return Response.json(await generarFeed(entrada.data));
  } catch (error) {
    console.error("[contenidos]", error);
    return Response.json({ error: "No se pudo generar el feed. Probá de nuevo." }, { status: 500 });
  }
});
