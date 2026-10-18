// La contraseña del panel /costos (variable COSTOS_CLAVE). La usan el proxy, que la pide antes de
// mostrar la página, y las acciones del registro de pagos, que la vuelven a revisar porque Next.js
// deja llamar a una acción desde cualquier dirección del sitio.

function iguales(a: string, b: string) {
  if (a.length !== b.length) return false;
  let distinto = 0;
  for (let i = 0; i < a.length; i++) distinto |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return distinto === 0;
}

function claveEscrita(cabecera: string | null) {
  if (!cabecera?.startsWith("Basic ")) return null;
  try {
    const texto = atob(cabecera.slice(6));
    return texto.slice(texto.indexOf(":") + 1);
  } catch {
    return null;
  }
}

/** "abierto": no hay contraseña y estamos en la compu · "sin-configurar": falta en la web publicada. */
export function revisarClave(cabecera: string | null): "ok" | "abierto" | "sin-configurar" | "no" {
  const clave = process.env.COSTOS_CLAVE;
  if (!clave) return process.env.NODE_ENV === "development" ? "abierto" : "sin-configurar";
  const escrita = claveEscrita(cabecera);
  return escrita !== null && iguales(escrita, clave) ? "ok" : "no";
}
