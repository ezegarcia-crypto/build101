// La contraseña compartida del equipo (variable COSTOS_CLAVE). Ya no abre los paneles: ahora cada uno entra con su
// cuenta de administrador y Google Authenticator (lib/admin). Solo se pide para hacer el alta en /admin/alta, así
// alguien de afuera que adivine un mail de la lista no puede quedarse con esa cuenta antes que su dueño.

function iguales(a: string, b: string) {
  if (a.length !== b.length) return false;
  let distinto = 0;
  for (let i = 0; i < a.length; i++) distinto |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return distinto === 0;
}

/** Si lo escrito es la contraseña del equipo. Sin la variable configurada, nunca. */
export function esClaveDelEquipo(escrita: string) {
  const clave = process.env.COSTOS_CLAVE;
  return Boolean(clave) && iguales(escrita, clave as string);
}
