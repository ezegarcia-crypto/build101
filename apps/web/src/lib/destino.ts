/** A dónde volver después de entrar: solo direcciones de la propia app, que nadie use el link para mandar a otro sitio. */
export function destinoSeguro(volver: string | null | undefined) {
  return volver && volver.startsWith("/") && !volver.startsWith("//") && !volver.startsWith("/\\") ? volver : "/crear/cuenta";
}
