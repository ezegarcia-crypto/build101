import { generateImage } from "ai";

import type { PedidoImagen } from "@/lib/ia/contenidos/esquemas";
import type { Kit } from "@/lib/ia/contenidos/kit";
import { etiquetar } from "@/lib/ia/gastos";

// Las imágenes de las piezas. El redactor solo describe la escena; este motor le suma la marca
// (estilo de foto, clima de color, lo que nunca aparece) y las reglas fijas: sin texto y sin
// logos. El logo real lo pone el compositor encima, nunca lo dibuja una IA.

// Probado el 17/10 por el Gateway: gpt-image-2 tarda de 10 a 25 s por imagen y sale realista.
// No acepta relación de aspecto: se pide vertical 2:3 y el compositor recorta a 4:5 o 9:16.
// (gemini-3.1-flash-image no sirve acá: el Gateway lo trata como modelo de texto.)
export const MODELO_IMAGEN = "openai/gpt-image-2";

function relacion(ancho: number, alto: number): `${number}:${number}` {
  if (ancho * 16 === alto * 9) return "9:16";
  if (ancho * 5 === alto * 4) return "4:5";
  if (ancho === alto) return "1:1";
  return `${ancho}:${alto}` as `${number}:${number}`;
}

/** Arma el prompt de la imagen con la marca aplicada. Sin IA: siempre igual para la misma entrada. */
export function promptImagen(escena: string, identidad: Kit, ancho: number, alto: number, zona: "abajo" | "centro"): string {
  const colores = identidad.paleta.map((c) => `${c.nombre} ${c.hex}`).join(", ");
  const evitar = identidad.estilo_visual.evitar.join(", ");
  return [
    `Fotografía realista para una publicación de redes de la marca «${identidad.nombre}».`,
    `Escena: ${escena}`,
    `Estilo de foto de la marca: ${identidad.estilo_visual.fotografia}`,
    `Clima de color: que dialogue con la paleta (${colores}) en objetos, materiales y luz, sin teñir la foto de un color. ${identidad.estilo_visual.uso_de_colores}`,
    `Encuadre vertical ${relacion(ancho, alto)}. Dejá una zona tranquila y despejada ${zona === "abajo" ? "en el tercio de abajo" : "en el centro"}: ahí va texto encima.`,
    "Natural y con imperfecciones reales: nada de simetría perfecta, piel de plástico ni aspecto de render.",
    "Sin ningún texto, letras, números, carteles legibles, logos, marcas de agua ni marcas comerciales reconocibles.",
    evitar ? `Nunca: ${evitar}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generarImagen(pedido: PedidoImagen): Promise<{ clave: string; url: string; usd: number }> {
  const { image, providerMetadata } = await generateImage({
    model: MODELO_IMAGEN,
    prompt: pedido.prompt,
    size: "1024x1536",
    // jpeg: pesa ~0,4 MB contra ~3 MB del png, y viaja dentro de la respuesta.
    providerOptions: etiquetar({ openai: { outputFormat: "jpeg", outputCompression: 85 } }),
  });
  const usd = Number((providerMetadata as { gateway?: { cost?: string | number } } | undefined)?.gateway?.cost ?? 0);
  return { clave: pedido.clave, url: `data:${image.mediaType};base64,${image.base64}`, usd: Number.isFinite(usd) ? usd : 0 };
}
