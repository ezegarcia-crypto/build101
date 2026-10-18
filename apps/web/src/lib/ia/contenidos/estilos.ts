// Los estilos de diseño del feed. La IA escribe igual en todos; lo que cambia es cómo el
// compositor dibuja las piezas (grilla, tratamiento de foto y de letra, ritmo de color) y, si hace
// falta, cómo se pide la foto. La persona elige el estilo antes de generar, viendo una vista previa
// con su marca, y el estilo viaja en el kit: queda guardado con el lote.
//
// Para sumar un estilo: agregarlo acá, dibujarlo en un componer-<estilo>.ts y despacharlo en
// componerPieza (componer.ts). Si no hay estilo, es "impacto", el de siempre.

export const ESTILOS = {
  impacto: {
    nombre: "Impacto",
    descripcion: "Foto a sangre, un panel de color con el titular fuerte y el botón bien visible.",
  },
  editorial: {
    nombre: "Editorial",
    descripcion: "Mucho aire, la foto recortada en formas y letras grandes, como una revista.",
  },
} as const;

export type IdEstilo = keyof typeof ESTILOS;

export const ID_ESTILOS = Object.keys(ESTILOS) as [IdEstilo, ...IdEstilo[]];

export const ESTILO_POR_DEFECTO: IdEstilo = "impacto";
