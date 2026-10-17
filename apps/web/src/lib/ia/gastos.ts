import { AsyncLocalStorage } from "node:async_hooks";

import type { generateText } from "ai";

// Cuánto cuesta cada generación. Cada pedido a la IA sale etiquetado con su paso y su módulo,
// y con un número de corrida (un pedido de la pantalla = una corrida; en la entrevista por chat,
// la conversación entera). El Gateway de Vercel guarda el costo de cada llamada con esas
// etiquetas y el panel /costos las suma. No hace falta base de datos.
//
// En una ruta nueva: `export const POST = medir("mi-paso", async (req: Request) => { ... })`
// y en cada llamada a la IA: `providerOptions: etiquetar()` (o `etiquetar(lasQueYaTenía)`).

export const PASOS = {
  entrevista: { modulo: "A", nombre: "Entrevista por chat", unidad: "conversación" },
  "voz-ficha": { modulo: "A", nombre: "Ficha de la entrevista por voz", unidad: "llamada" },
  direcciones: { modulo: "A", nombre: "Tres direcciones visuales", unidad: "pedido" },
  identidad: { modulo: "A", nombre: "Identidad y brandbook", unidad: "pedido" },
  logo: { modulo: "A", nombre: "Tres logos", unidad: "pedido" },
  "contenidos-lote": { modulo: "B", nombre: "Feed completo (motor)", unidad: "feed" },
  "contenidos-plan": { modulo: "B", nombre: "Plan del mes", unidad: "pedido" },
  "contenidos-pieza": { modulo: "B", nombre: "Una pieza del feed", unidad: "pieza" },
  "contenidos-imagen": { modulo: "B", nombre: "Una imagen del feed", unidad: "imagen" },
  "contenidos-simple": { modulo: "B", nombre: "Feed simple (se retira)", unidad: "feed" },
} as const;

export type Paso = keyof typeof PASOS;

export const MODULOS = {
  A: "Generá tu marca",
  B: "Generá tus contenidos",
  C: "BranderIA",
} as const;

const corridaActual = new AsyncLocalStorage<{ paso: Paso; corrida: string }>();

/** Envuelve una ruta: todo lo que la IA genere adentro queda anotado a ese paso, como una corrida. */
export function medir<A extends unknown[], R>(paso: Paso, ruta: (...args: A) => Promise<R>) {
  return (...args: A) => corridaActual.run({ paso, corrida: crypto.randomUUID().slice(0, 8) }, () => ruta(...args));
}

/** Para agrupar varios pedidos en una sola corrida (por ejemplo, todos los mensajes de una conversación). */
export function fijarCorrida(id: string | undefined) {
  const actual = corridaActual.getStore();
  if (actual && id) actual.corrida = id.slice(0, 40);
}

type OpcionesProveedor = NonNullable<Parameters<typeof generateText>[0]["providerOptions"]>;

/** Las opciones del Gateway con las etiquetas de gasto, sumadas a las que ya tenía la llamada. */
export function etiquetar(opciones?: OpcionesProveedor): OpcionesProveedor {
  const actual = corridaActual.getStore();
  const gateway = actual
    ? { tags: [`paso:${actual.paso}`, `modulo:${PASOS[actual.paso].modulo}`], user: `${actual.paso}:${actual.corrida}` }
    : { tags: ["paso:sin-paso"] };
  return { ...opciones, gateway: { ...opciones?.gateway, ...gateway } };
}
