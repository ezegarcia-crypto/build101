import { z } from "zod";

import { colorSchema } from "@/lib/ia/direcciones";

// Las fotos de la web del cliente, cuando en la entrevista eligió que las genere BrandIA.
// La IA que arma la web describe cada foto en una frase (`seccion.foto`); acá se le suma la marca
// (estilo de foto, clima de color) y las reglas fijas: sin texto y sin logos. Se marcan como ilustrativas.

export { MODELO_IMAGEN as MODELO_FOTO_WEB } from "@/lib/ia/contenidos/imagen";

export const pedidoFotoSchema = z.object({
  descripcion: z.string().trim().min(3).max(300),
  marca: z.object({
    nombre: z.string().max(80),
    rubro: z.string().max(200).optional(),
    fotografia: z.string().max(800).optional(),
    uso_de_colores: z.string().max(800).optional(),
    paleta: z.array(colorSchema).max(8),
  }),
});

export type PedidoFoto = z.infer<typeof pedidoFotoSchema>;

/** Arma el prompt de la foto con la marca aplicada. Sin IA: siempre igual para la misma entrada. */
export function promptFotoWeb({ descripcion, marca }: PedidoFoto): string {
  const colores = marca.paleta.map((c) => `${c.nombre} ${c.hex}`).join(", ");
  return [
    `Fotografía realista para la web de «${marca.nombre}»${marca.rubro ? `, ${marca.rubro}` : ""}.`,
    `Escena: ${descripcion}`,
    marca.fotografia ? `Estilo de foto de la marca: ${marca.fotografia}` : "",
    `Clima de color: que dialogue con la paleta (${colores}) en objetos, materiales y luz, sin teñir la foto de un color. ${marca.uso_de_colores ?? ""}`,
    "Encuadre horizontal, con el motivo principal centrado: la web la recorta un poco en el celular.",
    "Natural y con imperfecciones reales: nada de simetría perfecta, piel de plástico ni aspecto de render.",
    "Sin ningún texto, letras, números, carteles legibles, logos, marcas de agua ni marcas comerciales reconocibles.",
  ]
    .filter(Boolean)
    .join("\n");
}
