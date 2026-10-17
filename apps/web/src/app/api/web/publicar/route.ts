import { medir } from "@/lib/ia/gastos";
import { limpiarSvg } from "@/lib/ia/comprobaciones";
import { publicarWeb, webPublicadaSchema } from "@/lib/webs";

// Web del cliente, paso 7 (versión demo): publica la web en /w/[slug]. No usa IA.
// Entra: { web, ficha_web, identidad, anterior?: { slug, clave } }. Sale: { slug, clave, url }.
// Con `anterior` (lo que devolvió la publicación anterior), actualiza la misma dirección en vez de crear otra.

const MAXIMO = 200_000; // bytes: una web con su logo pesa bastante menos

export const POST = medir("web-publicar", async (req: Request) => {
  const texto = await req.text();
  if (new TextEncoder().encode(texto).length > MAXIMO) {
    return Response.json({ error: "La web es demasiado grande para publicarla." }, { status: 413 });
  }

  let cuerpo: { anterior?: unknown } & Record<string, unknown>;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    return Response.json({ error: "No entendimos el pedido." }, { status: 400 });
  }
  const datos = webPublicadaSchema.safeParse(cuerpo);
  if (!datos.success) return Response.json({ error: "Faltan la web, su ficha o la marca." }, { status: 400 });

  // El logo se guarda limpio: solo etiquetas de dibujo, sin scripts ni eventos
  const { svg } = limpiarSvg(datos.data.identidad.logo.isotipo_svg);
  datos.data.identidad.logo.isotipo_svg = svg;

  const a = cuerpo.anterior as { slug?: unknown; clave?: unknown } | undefined;
  const anterior =
    typeof a?.slug === "string" && typeof a?.clave === "string" ? { slug: a.slug, clave: a.clave } : undefined;

  try {
    const { slug, clave } = await publicarWeb(datos.data, anterior);
    return Response.json({ slug, clave, url: `${new URL(req.url).origin}/w/${slug}` });
  } catch (error) {
    console.error("[api/web/publicar]", error);
    return Response.json({ error: "No pudimos publicar la web. Probá de nuevo." }, { status: 502 });
  }
});
