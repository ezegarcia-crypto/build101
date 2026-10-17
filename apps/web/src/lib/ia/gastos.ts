import { AsyncLocalStorage } from "node:async_hooks";

import type { generateText } from "ai";
import { after } from "next/server";

import { clienteValido, HEADER_CLIENTE } from "@/lib/cliente";
import { grabarPrueba, hayDondeGuardar } from "@/lib/pruebas";

// Cuánto cuesta cada generación. Cada pedido a la IA sale etiquetado con su paso y su módulo,
// y con un número de corrida (un pedido de la pantalla = una corrida; en la entrevista por chat,
// la conversación entera). Si el navegador manda su id de cliente (lib/cliente.ts), también sale
// etiquetado con ese cliente, para ver cuánto costó cada uno de punta a punta. El Gateway de Vercel
// guarda el costo de cada llamada con esas etiquetas y el panel /costos las suma. No hace falta base de datos.
// Aparte, medir() guarda cada pedido con su respuesta en Supabase (lib/pruebas.ts), para el panel /pruebas.
//
// En una ruta nueva: `export const POST = medir("mi-paso", async (req: Request) => { ... })`
// y en cada llamada a la IA: `providerOptions: etiquetar()` (o `etiquetar(lasQueYaTenía)`).

export const PASOS = {
  entrevista: { modulo: "A", nombre: "Entrevista por chat", unidad: "conversación" },
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
  "web-foto": { modulo: "B", nombre: "Una foto de la web", unidad: "foto" },
  "web-publicar": { modulo: "B", nombre: "Web publicada (sin IA)", unidad: "publicación" },
  branderia: { modulo: "C", nombre: "Foto de un producto con la marca", unidad: "foto" },
} as const;

export type Paso = keyof typeof PASOS;

export const MODULOS = {
  A: "Generá tu marca",
  B: "Generá tus contenidos",
  C: "BranderIA",
} as const;

const corridaActual = new AsyncLocalStorage<{ paso: Paso; corrida: string; cliente?: string; senal?: AbortSignal }>();

// Freno de gasto: cuántos pedidos por minuto acepta cada paso en un mismo servidor. Alcanza de sobra
// para una persona usando la app (y para la demo), y corta un loop de recargas antes de que se coma
// el crédito: el 17/10 una página que se recargaba sola pidió más de 1.000 veces las direcciones.
// Los topes son por servidor, no por persona: tienen que alcanzar para varios jurados probando a la vez.
const POR_MINUTO: Record<Paso, number> = {
  entrevista: 90,
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
  "web-foto": 30,
  "web-publicar": 20, // no usa IA: el tope es solo para cortar abusos
  // 12 fotos por marca: alcanza para 4 personas entrando a la vez
  branderia: 48,
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
    const pedido = args[0] instanceof Request ? args[0] : undefined;
    const cliente = clienteValido(pedido?.headers.get(HEADER_CLIENTE));
    const actual = { paso, corrida: crypto.randomUUID().slice(0, 8), cliente, senal: pedido?.signal };
    const inicio = Date.now();
    // Una copia del pedido para guardar la prueba entera (lib/pruebas.ts), antes de que la ruta lo lea
    const entrada = pedido && hayDondeGuardar() ? pedido.clone() : undefined;
    return corridaActual.run(actual, async () => {
      const respuesta = await ruta(...args);
      if (entrada && respuesta instanceof Response) {
        const salida = respuesta.clone();
        // Se guarda cuando ya terminó de responder: no demora a la persona
        after(() => grabarPrueba({ paso, corrida: actual.corrida, cliente, inicio, entrada, salida }));
      }
      return respuesta;
    });
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
    ? {
        tags: [
          `paso:${actual.paso}`,
          `modulo:${PASOS[actual.paso].modulo}`,
          ...(actual.cliente ? [`cliente:${actual.cliente}`] : []),
        ],
        user: `${actual.paso}:${actual.corrida}`,
      }
    : { tags: ["paso:sin-paso"] };
  return { ...opciones, gateway: { ...opciones?.gateway, ...gateway } };
}
