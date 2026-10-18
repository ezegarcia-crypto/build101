// La llave del equipo: el navegador de alguien de BrandIA no tiene límite de pruebas ni tope diario de gasto.
// Se consigue entrando una vez a /costos con la contraseña (COSTOS_CLAVE): el proxy deja una cookie con una
// huella de esa contraseña, que el servidor puede comprobar (medir() en lib/ia/gastos.ts) y nadie puede inventar
// sin saber la clave. La pantalla, además, guarda una marca en el navegador para no frenarse a sí misma
// (lib/prueba-gratis.ts). En la compu (npm run dev) sin contraseña configurada, todo es del equipo.

export const COOKIE_EQUIPO = "brandia_equipo";

/** La huella de la contraseña del equipo, o null si no hay contraseña configurada. */
export async function huellaDelEquipo() {
  const clave = process.env.COSTOS_CLAVE;
  if (!clave) return null;
  const datos = new TextEncoder().encode(`brandia-equipo:${clave}`);
  const hash = await crypto.subtle.digest("SHA-256", datos);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Si el pedido viene de un navegador del equipo. */
export async function esDelEquipo(req: Request | undefined) {
  const huella = await huellaDelEquipo();
  if (!huella) return process.env.NODE_ENV === "development";
  const cookies = req?.headers.get("cookie") ?? "";
  const valor = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_EQUIPO}=`))
    ?.slice(COOKIE_EQUIPO.length + 1);
  return valor === huella;
}
