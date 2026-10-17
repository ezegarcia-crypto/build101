// Dónde queda guardado el lote del feed. Con todas sus imágenes pesa más de 5 MB (cada una ~0,5 MB),
// y eso no entra en sessionStorage: el guardado fallaba en silencio y al volver se generaba (y se
// cobraba) todo de nuevo. IndexedDB, el depósito grande del navegador, guarda cientos de MB.
// Se guarda un solo lote, con la huella de su marca: si la marca cambia, no se usa.

const BASE = "brandia";
const CAJON = "feed";
const CLAVE = "lote";

function abrir(): Promise<IDBDatabase> {
  return new Promise((ok, mal) => {
    const pedido = indexedDB.open(BASE, 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(CAJON);
    pedido.onsuccess = () => ok(pedido.result);
    pedido.onerror = () => mal(pedido.error);
  });
}

async function usar<T>(modo: IDBTransactionMode, hacer: (cajon: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const base = await abrir();
  try {
    return await new Promise<T>((ok, mal) => {
      const tx = base.transaction(CAJON, modo);
      const pedido = hacer(tx.objectStore(CAJON));
      tx.oncomplete = () => ok(pedido.result);
      tx.onerror = tx.onabort = () => mal(tx.error);
    });
  } finally {
    base.close();
  }
}

export type Guardado<L> = { huella: string; lote: L };

/** El lote guardado, o null si no hay (o si el navegador no deja usar IndexedDB). */
export async function leerLote<L>(): Promise<Guardado<L> | null> {
  try {
    return (await usar("readonly", (c) => c.get(CLAVE))) ?? null;
  } catch {
    return null;
  }
}

/** Guarda el lote. Devuelve false si no se pudo (ej. ventana privada sin espacio). */
export async function guardarLote<L>(g: Guardado<L>): Promise<boolean> {
  try {
    await usar("readwrite", (c) => c.put(g, CLAVE));
    return true;
  } catch {
    return false;
  }
}

export async function borrarLote(): Promise<void> {
  try {
    await usar("readwrite", (c) => c.delete(CLAVE));
  } catch {
    // Si no se puede borrar, la huella igual evita mostrar un lote de otra marca
  }
}
