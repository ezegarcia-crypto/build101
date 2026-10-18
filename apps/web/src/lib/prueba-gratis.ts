// La prueba gratis de la beta abierta: cada navegador puede hacer el recorrido completo una vez, con algunas vueltas
// para iterar, y nada más. Se cuenta en el navegador (localStorage, así no se reinicia con otra pestaña) cada
// pedido a la IA que salió bien, por ruta. Al llegar al tope, el pedido no sale y aparece el aviso con los planes
// (components/aviso-limite.tsx). Se puede saltear con otro navegador o una ventana privada: es un freno para la
// mayoría, no una seguridad. La seguridad de verdad es el tope diario del servidor (lib/ia/tope-diario.ts).
// El equipo no tiene límite: entrar una vez a /costos con la contraseña marca el navegador (lib/equipo.ts).

/** Cuántos pedidos bien respondidos admite cada ruta. Alcanza para una marca completa con sus vueltas. */
export const LIMITES: Record<string, number> = {
  "/api/entrevista": 80, // cada mensaje del chat es un pedido
  "/api/transcribir": 60,
  "/api/nombres": 5, // la primera vuelta, otras tres y variantes
  "/api/direcciones": 4,
  "/api/paleta": 4,
  "/api/identidad": 3, // la marca y un cambio de nombre o de camino
  "/api/logo": 4,
  "/api/logo/simbolo": 4,
  "/api/contenidos/muestra": 2,
  "/api/contenidos/lote": 2, // el feed y uno más
  "/api/contenidos/plan": 2,
  "/api/contenidos/pieza": 20,
  "/api/contenidos/imagen": 30,
  "/api/contenidos/destacadas": 2,
  "/api/contenidos/completar": 15,
  "/api/branderia/sugerir": 3,
  "/api/branderia": 25, // una foto por pedido: las del rubro, otras opciones y fotos nuevas
  "/api/web/entrevista": 40,
  "/api/web/armar": 2,
  "/api/web/cambio": 8,
  "/api/web/foto": 12,
};

const CLAVE = "brandia:prueba-gratis";
export const CLAVE_EQUIPO = "brandia:equipo";
export const EVENTO_LIMITE = "brandia:limite";

export type TipoLimite = "prueba" | "diario";

function leer(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

export function esNavegadorDelEquipo() {
  try {
    return localStorage.getItem(CLAVE_EQUIPO) === "1";
  } catch {
    return false;
  }
}

/** Si esta ruta ya llegó a su tope en este navegador. */
export function agotado(ruta: string) {
  const tope = LIMITES[ruta];
  return tope !== undefined && !esNavegadorDelEquipo() && (leer()[ruta] ?? 0) >= tope;
}

/** Suma un pedido bien respondido a esta ruta. */
export function contar(ruta: string) {
  if (LIMITES[ruta] === undefined) return;
  const conteos = leer();
  conteos[ruta] = (conteos[ruta] ?? 0) + 1;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(conteos));
  } catch {}
}

/** Muestra el aviso de límite (lo escucha components/aviso-limite.tsx). */
export function avisarLimite(tipo: TipoLimite) {
  window.dispatchEvent(new CustomEvent<TipoLimite>(EVENTO_LIMITE, { detail: tipo }));
}

export const MENSAJE_PRUEBA =
  "Ya usaste tu prueba gratis: en la beta, cada persona arma una marca completa. Mirá los planes para seguir.";
