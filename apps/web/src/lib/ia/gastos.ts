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
  nombres: { modulo: "A", nombre: "Nombres con trasfondo", unidad: "pedido" },
  identidad: { modulo: "A", nombre: "Identidad y brandbook", unidad: "pedido" },
  logo: { modulo: "A", nombre: "Tres logos", unidad: "pedido" },
  "contenidos-lote": { modulo: "B", nombre: "Feed completo (motor)", unidad: "feed" },
  "contenidos-plan": { modulo: "B", nombre: "Plan del mes", unidad: "pedido" },
  "contenidos-pieza": { modulo: "B", nombre: "Una pieza del feed", unidad: "pieza" },
  "contenidos-imagen": { modulo: "B", nombre: "Una imagen del feed", unidad: "imagen" },
  "contenidos-simple": { modulo: "B", nombre: "Feed simple (retirado)", unidad: "feed" },
  "web-entrevista": { modulo: "B", nombre: "Entrevista de la web", unidad: "conversación" },
  "web-armar": { modulo: "B", nombre: "Web armada", unidad: "web" },
  "web-cambio": { modulo: "B", nombre: "Cambio de la web por chat", unidad: "cambio" },
} as const;

export type Paso = keyof typeof PASOS;

export const MODULOS = {
  A: "Generá tu marca",
  B: "Generá tus contenidos",
  C: "BranderIA",
} as const;

const corridaActual = new AsyncLocalStorage<{ paso: Paso; corrida: string; senal?: AbortSignal }>();

// Freno de gasto: cuántos pedidos por minuto acepta cada paso en un mismo servidor. Alcanza de sobra
// para una persona usando la app (y para la demo), y corta un loop de recargas antes de que se coma
// el crédito: el 17/10 una página que se recargaba sola pidió más de 1.000 veces las direcciones.
// Los topes son por servidor, no por persona: tienen que alcanzar para varios jurados probando a la vez.
const POR_MINUTO: Record<Paso, number> = {
  entrevista: 90,
  "voz-ficha": 15,
  direcciones: 15,
  nombres: 25,
  identidad: 15,
  logo: 15,
  "contenidos-lote": 8,
  "contenidos-plan": 15,
  "contenidos-pieza": 60,
  "contenidos-imagen": 120,
  "contenidos-simple": 8,
  "web-entrevista": 90,
  "web-armar": 15,
  "web-cambio": 40,
};
const recientes = new Map<Paso, number[]>();

function frenar(paso: Paso) {
  const ahora = Date.now();
  const lista = (recientes.get(paso) ?? []).filter((t) => ahora - t < 60_000);
  const pasado = lista.length >= POR_MINUTO[paso];
  if (!pasado) lista.push(ahora);
  recientes.set(paso, lista);
  return pasado;
}

/**
 * Envuelve una ruta: todo lo que la IA genere adentro queda anotado a ese paso, como una corrida.
 * Además frena los pedidos de más (ver POR_MINUTO) y guarda la señal del pedido: si la persona se va
 * de la página, la IA deja de generar (y de cobrar) en vez de terminar una respuesta que nadie va a ver.
 */
export function medir<A extends unknown[], R>(paso: Paso, ruta: (...args: A) => Promise<R>) {
  return (...args: A) => {
    if (frenar(paso)) {
      console.warn(`[gastos] frenado: más de ${POR_MINUTO[paso]} pedidos por minuto a ${paso}`);
      return Promise.resolve(
        Response.json(
          { error: "Recibimos muchos pedidos seguidos. Esperá un minuto y probá de nuevo." },
          { status: 429 },
        ) as R,
      );
    }
    const senal = args[0] instanceof Request ? args[0].signal : undefined;
    return corridaActual.run({ paso, corrida: crypto.randomUUID().slice(0, 8), senal }, () => ruta(...args));
  };
}

/** La señal del pedido en curso, para pasarla como `abortSignal` a cada llamada a la IA. */
export function senalDelPedido() {
  return corridaActual.getStore()?.senal;
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
