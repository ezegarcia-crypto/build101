import { generarLogos, pedidoLogoSchema } from "@/lib/ia/logo";

// La generación del logo. Recibe { brief, paleta? } y devuelve { propuestas }: 3 logos
// (logotipo, isotipo y emblema), cada uno con su concepto y la imagen como data URL.

export const maxDuration = 120;

export async function POST(req: Request) {
  const pedido = pedidoLogoSchema.safeParse(await req.json().catch(() => null));
  if (!pedido.success) {
    return Response.json({ error: "Falta la ficha de la marca o viene mal armada." }, { status: 400 });
  }

  const t0 = Date.now();
  try {
    const propuestas = await generarLogos(pedido.data);
    if (propuestas.length === 0) {
      return Response.json({ error: "No se pudo dibujar ningún logo. Probá de nuevo." }, { status: 502 });
    }
    return Response.json({ propuestas, segundos: Math.round((Date.now() - t0) / 100) / 10 });
  } catch (error) {
    console.error("[logo]", error);
    return Response.json({ error: "No se pudieron pensar los logos. Probá de nuevo." }, { status: 502 });
  }
}
