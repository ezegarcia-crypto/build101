import { z } from "zod";

import type { Brief } from "@/lib/ia/brief";

// BranderIA (módulo C), productos sugeridos: con la ficha, la IA elige los productos con la marca que más le
// sirven a ESE negocio (una panadería no necesita lo mismo que una contadora: bolsas de papel, delantales,
// cajas de torta…). La pantalla les saca la foto realista apenas llegan, con el mismo pedido que el catálogo.

export const MODELO_SUGERIR = "anthropic/claude-sonnet-5.5";

/** Cuántos productos sugiere la IA por marca (cada uno es una foto más) */
export const PRODUCTOS_SUGERIDOS = 5;

export const productoSugeridoSchema = z.object({
  nombre: z.string().describe("El producto en plural y corto, como en un catálogo: «Bolsas de papel», «Delantales»"),
  detalle: z.string().describe("El material o la variante en dos o tres palabras: «Papel kraft», «Gabardina»"),
  por_que: z
    .string()
    .describe("Para qué le sirve a este negocio, en una frase que cite algo concreto de la ficha"),
  escena: z
    .string()
    .describe(
      "Cómo se ve en la foto de catálogo, concreta: el objeto, su posición y lo que tiene alrededor. Por ejemplo «una bolsa de papel kraft con manijas, parada de frente sobre un mostrador de madera»",
    ),
  estampa: z
    .enum(["logo", "logo-nombre", "nombre", "frase", "logo-frase"])
    .describe("Qué lleva impreso, como haría una marca real con ese producto"),
  tecnica: z.string().describe("Cómo se marca ese material: «sello», «bordado», «impreso», «grabado láser», «etiqueta tejida»…"),
  color: z.enum(["claro", "marca"]).describe("claro: blanco, crudo o natural · marca: del color principal de la marca"),
});

export const sugeridosSchema = z.object({
  productos: z
    .array(productoSugeridoSchema)
    .min(1)
    .max(PRODUCTOS_SUGERIDOS + 1)
    .describe(`Exactamente ${PRODUCTOS_SUGERIDOS} productos, bien distintos entre sí`),
});

export type ProductoSugerido = z.infer<typeof productoSugeridoSchema>;

/** Los productos del catálogo fijo: la IA no los repite, porque ya se muestran */
export const CATALOGO_FIJO = [
  "remeras",
  "tazas de café",
  "tote bags",
  "tarjetas personales",
  "termos para mate",
  "mates",
  "vasos térmicos",
  "gorros",
  "folletos",
  "carpetas",
  "lapiceras",
  "soportes de celular",
];

export const PROMPT_SUGERIR = `Sos el especialista en productos de BranderIA, el servicio de BrandIA que produce los productos con la marca del cliente y se los manda. Con la ficha de un negocio, elegís los ${PRODUCTOS_SUGERIDOS} productos con su marca que más le sirven para trabajar, vender o hacerse conocer.

Reglas:
- Pensá en el día a día de ESE rubro: lo que usa con sus clientes (packaging, bolsas, etiquetas, cajas), lo que usa su equipo (uniformes, delantales), lo que regala o deja en el local (stickers, imanes, señalética) y lo que vende con su marca.
- Nada genérico ni repetido: si sirviera igual para cualquier negocio, no va. No repitas los del catálogo fijo que te paso.
- Productos reales que se fabrican con marca en Uruguay y la región, sin marcas comerciales ajenas (es «vaso térmico», no la marca).
- Si la ficha dice dónde se ve primero la marca (aplicaciones_prioritarias), empezá por eso.
- Nada de precios, proveedores ni cantidades.
- Español rioplatense, simple.`;

export function pedidoSugerir(brief: Brief, marca: { nombre: string; eslogan: string }, ya: string[] = []) {
  return [
    `Marca: «${marca.nombre}»${marca.eslogan ? `, eslogan «${marca.eslogan}»` : ""}`,
    `Catálogo fijo (no los repitas): ${CATALOGO_FIJO.join(", ")}`,
    ya.length ? `Ya le sugeriste estos (no los repitas, buscá otros distintos): ${ya.join(", ")}` : "",
    `Ficha del negocio:\n${JSON.stringify(brief, null, 1)}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
