import { z } from "zod";

import type { Brief } from "@/lib/ia/brief";

// BranderIA (módulo C), productos sugeridos: con la ficha, la IA elige los productos con la marca que más le
// sirven a ESE negocio (una pastelería: cajas de torta y bolsas; un estudio contable: tarjetas y carpetas).
// La pantalla les saca la foto realista y los muestra cuando están todas. Después se pueden pedir más (en la línea
// de los que le gustaron) o pedir en palabras los que faltan ("stickers para cerrar las cajas").

export const MODELO_SUGERIR = "anthropic/claude-sonnet-5.5";

/** Cuántos productos sugiere la IA al entrar (cada uno es una foto) */
export const PRODUCTOS_SUGERIDOS = 10;
/** Cuántos suma cada "Otras opciones" */
export const PRODUCTOS_MAS = 5;

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
  // La escala de cantidades del kit: un cartel se pide de a 1; las tarjetas, de a 50 o 100. La pantalla arma con
  // esto la barra de cada producto (y si falta, va de a 1: ver escala() en components/branderia/branderia.tsx).
  cantidad_minima: z
    .number()
    .int()
    .describe("La menor cantidad que tiene sentido pedir de este producto: 1 para un cartel, un banner o una bandera; 50 o 100 para tarjetas o stickers"),
  cantidad_paso: z
    .number()
    .int()
    .describe("De a cuánto se sube la cantidad: 1 para carteles o uniformes, 5 o 10 para tazas o remeras, 50 o 100 para tarjetas, stickers o bolsas"),
  cantidad_tipica: z
    .number()
    .int()
    .describe("Cuántas pediría ESTE negocio para arrancar, según su tamaño y su rubro (entre la mínima y unas miles)"),
});

export const sugeridosSchema = z.object({
  productos: z
    .array(productoSugeridoSchema)
    .min(1)
    .max(PRODUCTOS_SUGERIDOS + 2)
    .describe("La cantidad de productos que se pide, bien distintos entre sí"),
});

export type ProductoSugerido = z.infer<typeof productoSugeridoSchema>;

export const PROMPT_SUGERIR = `Sos el especialista en productos de BranderIA, el servicio de BrandIA que produce los productos con la marca del cliente y se los manda. Con la ficha de un negocio, elegís los productos con su marca que más le sirven para trabajar, vender o hacerse conocer.

Reglas:
- Pensá en el día a día de ESE rubro: lo que usa con sus clientes (packaging, cajas, bolsas, etiquetas), lo que usa su equipo (uniformes, delantales), lo que entrega o deja en el local (tarjetas, stickers, imanes, señalética) y lo que vende o regala con su marca. Una pastelería: cajas de torta, bolsas, stickers para cerrar; un estudio contable: tarjetas, carpetas, sobres.
- Empezá por lo más útil para este negocio. Si la ficha dice dónde se ve primero la marca (aplicaciones_prioritarias), eso va primero.
- Nada genérico: un producto va solo si este negocio lo usaría de verdad. Productos clásicos (tarjetas, tazas, remeras) solo si le sirven a este rubro.
- Productos reales que se fabrican con marca en Uruguay y la región, sin marcas comerciales ajenas (es «vaso térmico», no la marca).
- Nada de precios ni proveedores.
- Las cantidades (la mínima, de a cuánto sube y la típica) son las de un taller o una imprenta real para ese producto y para el tamaño de ESTE negocio: un cartel o un banner se pide de a 1; las tarjetas o los stickers, de a 50 o 100; un local chico no pide miles de bolsas.
- Español rioplatense, simple.

Si te pasan lo que la persona ya vio u opinó:
- Nunca repitas un producto que ya vio (ni uno casi igual).
- Los que le gustaron muestran lo que busca: seguí esa línea.
- Si pide algo en palabras, eso manda: devolvé justo lo que pidió (si pide un producto, ese producto y sus variantes útiles), aunque sea menos que la cantidad pedida.`;

export type IteracionProductos = { ya?: string[]; gustan?: string[]; pedido?: string; cantidad?: number };

export function pedidoSugerir(brief: Brief, marca: { nombre: string; eslogan: string }, i: IteracionProductos = {}) {
  const cantidad = i.cantidad ?? PRODUCTOS_SUGERIDOS;
  return [
    `Cantidad de productos: ${i.pedido?.trim() ? `entre 1 y ${cantidad}, lo que corresponda a lo que pide` : `exactamente ${cantidad}`}`,
    `Marca: «${marca.nombre}»${marca.eslogan ? `, eslogan «${marca.eslogan}»` : ""}`,
    i.ya?.length ? `Ya vio estos (no los repitas): ${i.ya.join(", ")}` : "",
    i.gustan?.length ? `Le gustaron: ${i.gustan.join(", ")}` : "",
    i.pedido?.trim() ? `Lo que pide la persona: ${i.pedido.trim()}` : "",
    `Ficha del negocio:\n${JSON.stringify(brief, null, 1)}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
