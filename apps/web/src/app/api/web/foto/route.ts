import { generateImage } from "ai";

import { etiquetar, medir, senalDelPedido } from "@/lib/ia/gastos";
import { MODELO_FOTO_WEB, pedidoFotoSchema, promptFotoWeb } from "@/lib/ia/web/fotos";
import { subirFoto } from "@/lib/webs";

// Web del cliente: una foto de la web, generada con la marca y guardada en Supabase Storage.
// Entra: { descripcion, marca: { nombre, rubro?, fotografia?, uso_de_colores?, paleta } }. Sale: { url }.
// La pantalla pide una por foto, así van apareciendo a medida que están (gpt-image-2 tarda de 10 a 25 s).

export const maxDuration = 90;

export const POST = medir("web-foto", async (req: Request) => {
  const pedido = pedidoFotoSchema.safeParse(await req.json().catch(() => null));
  if (!pedido.success) return Response.json({ error: "Falta la descripción de la foto o la marca." }, { status: 400 });

  try {
    const { image } = await generateImage({
      model: MODELO_FOTO_WEB,
      prompt: promptFotoWeb(pedido.data),
      size: "1536x1024",
      abortSignal: senalDelPedido(),
      // jpeg comprimido: unos 300 KB, para que la web cargue rápido en el celular
      providerOptions: etiquetar({ openai: { outputFormat: "jpeg", outputCompression: 80 } }),
    });
    const url = await subirFoto(image.uint8Array, image.mediaType || "image/jpeg");
    return Response.json({ url });
  } catch (error) {
    console.error("[api/web/foto]", error);
    return Response.json({ error: "No pudimos generar la foto." }, { status: 502 });
  }
});
