import { AsyncLocalStorage } from "node:async_hooks";

import type { generateText } from "ai";
import { after } from "next/server";

import { clienteValido, HEADER_CLIENTE } from "@/lib/cliente";
import { esDelEquipo } from "@/lib/equipo";
import { pasadoDelTope } from "@/lib/ia/tope-diario";
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
  "logo-simbolo": { modulo: "A", nombre: "Símbolo del logo elegido", unidad: "símbolo" },
  paleta: { modulo: "A", nombre: "Otra paleta de colores", unidad: "pedido" },
  "contenidos-lote": { modulo: "B", nombre: "Feed completo (motor)", unidad: "feed" },
  "contenidos-plan": { modulo: "B", nombre: "Plan del mes", unidad: "pedido" },
  "contenidos-pieza": { modulo: "B", nombre: "Una pieza del feed", unidad: "pieza" },
  "contenidos-imagen": { modulo: "B", nombre: "Una imagen del feed", unidad: "imagen" },
  "contenidos-destacadas": { modulo: "B", nombre: "Íconos de las historias destacadas", unidad: "pedido" },
  "contenidos-completar": { modulo: "B", nombre: "Datos a confirmar aplicados a las piezas", unidad: "pedido" },
  "contenidos-muestra": { modulo: "B", nombre: "Foto de muestra para elegir el estilo", unidad: "foto" },
  "contenidos-mes": { modulo: "B", nombre: "Mes completo del suscriptor", unidad: "mes" },
  "contenidos-simple": { modulo: "B", nombre: "Feed simple (retirado)", unidad: "feed" },
  "web-entrevista": { modulo: "B", nombre: "Entrevista de la web", unidad: "conversación" },
  "web-armar": { modulo: "B", nombre: "Web armada", unidad: "web" },
  "web-cambio": { modulo: "B", nombre: "Cambio de la web por chat", unidad: "cambio" },
  "web-foto": { modulo: "B", nombre: "Una foto de la web", unidad: "foto" },
  "web-publicar": { modulo: "B", nombre: "Web publicada (sin IA)", unidad: "publicación" },
  branderia: { modulo: "C", nombre: "Foto de un producto con la marca", unidad: "foto" },
  "branderia-sugerir": { modulo: "C", nombre: "Productos sugeridos para el rubro", unidad: "pedido" },
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
  "logo-simbolo": 20,
  paleta: 25,
  "contenidos-lote": 8,
  "contenidos-plan": 15,
  "contenidos-pieza": 60,
  "contenidos-imagen": 120,
  "contenidos-destacadas": 20,
  "contenidos-completar": 15,
  // 2 fotos por marca nueva, una sola vez (la pantalla las guarda)
  "contenidos-muestra": 30,
  // El mes del suscriptor: un pedido para empezarlo y uno por cada semana (lo encadena el servidor)
  "contenidos-mes": 20,
  "contenidos-simple": 8,
  "web-entrevista": 90,
  "web-armar": 15,
  "web-cambio": 40,
  "web-foto": 30,
  "web-publicar": 20, // no usa IA: el tope es solo para cortar abusos
  // 10 fotos por marca al entrar, más las que se pidan: alcanza para 4 personas entrando a la vez
  branderia: 60,
  "branderia-sugerir": 15,
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
 * Además frena los pedidos de más (ver POR_MINUTO), corta todo si hoy se pasó el tope diario de gasto
 * (lib/ia/tope-diario.ts; al equipo no lo frena) y guarda la señal del pedido: si la persona se va
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
    return topeDiario(paso, pedido).then((frenado) => (frenado ?? correr(paso, pedido, ruta, args)) as R) as R;
  };
}

/** Si hoy ya se pasó el tope de gasto (y el pedido no es del equipo), la respuesta que corta; si no, null. */
async function topeDiario(paso: Paso, pedido: Request | undefined) {
  if (paso === "web-publicar") return null; // no usa IA
  if (!(await pasadoDelTope()) || (await esDelEquipo(pedido))) return null;
  console.warn(`[gastos] tope diario: no se atiende ${paso}`);
  return Response.json(
    {
      error: "BrandIA está a full por hoy: llegamos al tope de pruebas del día. Volvé mañana o anotate en los planes.",
      limite: "diario",
    },
    { status: 503 },
  );
}

function correr<A extends unknown[], R>(paso: Paso, pedido: Request | undefined, ruta: (...args: A) => Promise<R>, args: A) {
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
}

/** La señal del pedido en curso, para pasarla como `abortSignal` a cada llamada a la IA. */
export function senalDelPedido() {
  return corridaActual.getStore()?.senal;
}

/**
 * Para seguir trabajando después de responder (con `after`): el trabajo queda anotado a la misma corrida,
 * pero sin la señal del pedido, así no se corta si la persona cierra la pestaña. Lo usa el mes del suscriptor.
 */
export function enSegundoPlano<T>(trabajo: () => Promise<T>) {
  const actual = corridaActual.getStore();
  const copia = actual ? { ...actual, senal: undefined } : undefined;
  return () => (copia ? corridaActual.run(copia, trabajo) : trabajo());
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
