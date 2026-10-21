import { cookies } from "next/headers";

import { COOKIE_EQUIPO, huellaDelEquipo } from "@/lib/equipo";

// Si la persona tiene el plan "Tu marca andando" (USD 29 por mes): con él, BrandIA le arma el mes completo de
// contenidos (POST /api/contenidos/mes). Todo lo del mes completo pregunta acá, y la pantalla también, por
// GET /api/suscripcion: para cambiar quién es suscriptor se toca solo este archivo.
//
// PROVISORIO: hasta que estén las cuentas y los cobros (los arma otra sesión, en lib/suscripcion-activa.ts),
// solo es suscriptor el navegador del equipo, el que entró una vez a /costos con la contraseña (lib/equipo.ts).
// Así se prueba sin cobrar. En la compu sin COSTOS_CLAVE configurada, todo navegador es del equipo.
// Al integrar: `export { tieneSuscripcion } from "./suscripcion-activa";` (y sumar el equipo si se quiere).

/** Solo en el servidor (rutas): lee las cookies del pedido en curso. */
export async function tieneSuscripcion(): Promise<boolean> {
  const huella = await huellaDelEquipo();
  if (!huella) return process.env.NODE_ENV === "development";
  return (await cookies()).get(COOKIE_EQUIPO)?.value === huella;
}
