const POR_DEFECTO = "/crear/cuenta";
// Solo para armar la dirección y comparar: cualquier dirección fija sirve, no tiene que ser la real
const BASE = "https://app.brandiamos.com";

/**
 * A dónde volver después de entrar: solo direcciones de la propia app, que nadie use el link para mandar a otro
 * sitio. No alcanza con mirar cómo empieza el texto: el navegador borra tabuladores y saltos de línea y da vuelta
 * las barras invertidas, así que "/<tab>/otro-sitio" termina en otro sitio. Por eso se arma la dirección completa,
 * se comprueba que siga siendo nuestra y se devuelve ya limpia.
 */
export function destinoSeguro(volver: string | null | undefined) {
  if (!volver || !volver.startsWith("/")) return POR_DEFECTO;
  try {
    const url = new URL(volver, BASE);
    if (url.origin !== BASE) return POR_DEFECTO;
    const limpio = `${url.pathname}${url.search}${url.hash}`;
    return limpio.startsWith("//") || limpio.startsWith("/\\") ? POR_DEFECTO : limpio;
  } catch {
    return POR_DEFECTO;
  }
}
