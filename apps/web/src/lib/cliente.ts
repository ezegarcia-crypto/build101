// Un número por cliente, para saber cuánto costó cada uno de punta a punta (entrevista, nombres,
// direcciones, identidad, logos, feed, web). Se genera en el navegador la primera vez que la persona
// le pide algo a la IA y viaja en un header en cada pedido a /api. medir() lo lee y etiquetar() lo
// suma como etiqueta `cliente:<id>` en el Gateway; el panel /costos junta lo de cada uno.
//
// El id empieza con la hora en que se creó (en base 36), así el panel puede ordenar los clientes
// del más nuevo al más viejo y mostrar la fecha sin pedirle nada más al Gateway.

import { agotado, avisarLimite, contar, MENSAJE_PRUEBA } from "@/lib/prueba-gratis";

export const HEADER_CLIENTE = "x-brandia-cliente";

const CLAVE = "brandia:cliente";
const FORMATO = /^[a-z0-9-]{4,40}$/;

/** El id que mandó el navegador, si tiene el formato esperado (si no, se ignora). */
export function clienteValido(valor: string | null | undefined) {
  const id = valor?.trim().toLowerCase();
  return id && FORMATO.test(id) ? id : undefined;
}

/** Cuándo empezó ese cliente, sacado del propio id. Null si el id no trae una fecha creíble. */
export function inicioDelCliente(id: string) {
  const ms = Number.parseInt(id.split("-")[0] ?? "", 36);
  const desde2026 = Date.UTC(2026, 0, 1);
  return Number.isFinite(ms) && ms > desde2026 && ms < Date.now() + 86_400_000 ? new Date(ms) : null;
}

function nuevoId() {
  // randomUUID solo existe en https o localhost; en el celular por la red local, un número al azar
  const azar = globalThis.crypto?.randomUUID?.().replaceAll("-", "") ?? Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}-${azar.slice(0, 8)}`;
}

let enMemoria: string | undefined;

/** El id de este cliente: el mismo durante toda la pestaña, aunque recargue la página. */
export function idDeCliente() {
  try {
    const guardado = clienteValido(sessionStorage.getItem(CLAVE));
    if (guardado) return guardado;
    const id = enMemoria ?? nuevoId();
    sessionStorage.setItem(CLAVE, id);
    return id;
  } catch {
    // Sin sessionStorage (navegación privada estricta): vale mientras no se recargue
    enMemoria ??= nuevoId();
    return enMemoria;
  }
}

/** La ruta de nuestra /api a la que va el pedido (por ejemplo "/api/nombres"), o null si es de afuera. */
function rutaDeLaApi(entrada: RequestInfo | URL) {
  try {
    const texto = typeof entrada === "string" ? entrada : entrada instanceof URL ? entrada.href : entrada.url;
    const url = new URL(texto, window.location.href);
    return url.origin === window.location.origin && url.pathname.startsWith("/api/") ? url.pathname : null;
  } catch {
    return null;
  }
}

/**
 * Suma el header del cliente a todos los pedidos a nuestra /api, sin tocar cada pantalla: así entran
 * también el chat de la entrevista (DefaultChatTransport usa este mismo fetch) y las rutas que se agreguen.
 * Acá también se cuida la prueba gratis (lib/prueba-gratis.ts): si una ruta llegó a su tope en este navegador,
 * el pedido no sale; y si el servidor avisa que se pasó el tope diario, aparece el aviso.
 */
export function instalarClienteEnPedidos() {
  if (typeof window === "undefined") return;
  const ventana = window as typeof window & { __brandiaCliente?: true };
  if (ventana.__brandiaCliente) return;
  ventana.__brandiaCliente = true;

  const original = window.fetch.bind(window);
  window.fetch = (entrada, opciones) => {
    const ruta = rutaDeLaApi(entrada);
    if (!ruta) return original(entrada, opciones);
    if (agotado(ruta)) {
      avisarLimite("prueba");
      return Promise.resolve(Response.json({ error: MENSAJE_PRUEBA, limite: "prueba" }, { status: 429 }));
    }
    const headers = new Headers(opciones?.headers ?? (entrada instanceof Request ? entrada.headers : undefined));
    if (!headers.has(HEADER_CLIENTE)) headers.set(HEADER_CLIENTE, idDeCliente());
    return original(entrada, { ...opciones, headers }).then((r) => {
      if (r.ok) contar(ruta);
      else if (r.status === 503) {
        r.clone()
          .json()
          .then((d: { limite?: string }) => d?.limite === "diario" && avisarLimite("diario"))
          .catch(() => {});
      }
      return r;
    });
  };
}
