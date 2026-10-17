// Freno contra recargas en loop, del lado de la pantalla. Las pantallas que llaman a la IA solas al
// cargar (direcciones, nombres, feed) preguntan antes si pueden: si la misma pantalla ya arrancó sola
// 3 veces en los últimos 2 minutos, no vuelve a arrancar y muestra un botón para hacerlo a mano.
// Cada arranque cuesta plata: el 17/10 una página que se recargaba sola pidió más de 1.000 veces lo mismo.

const VECES = 3;
const VENTANA = 2 * 60_000;

export function puedoArrancarSolo(clave: string) {
  const id = `brandia:arranques:${clave}`;
  const ahora = Date.now();
  let lista: number[] = [];
  try {
    lista = (JSON.parse(sessionStorage.getItem(id) ?? "[]") as number[]).filter((t) => ahora - t < VENTANA);
  } catch {}
  if (lista.length >= VECES) return false;
  try {
    sessionStorage.setItem(id, JSON.stringify([...lista, ahora]));
  } catch {}
  return true;
}

export const MENSAJE_FRENO = "Frenamos para no repetir el mismo pedido muchas veces seguidas.";
