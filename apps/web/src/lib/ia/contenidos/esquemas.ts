import { z } from "zod";

import { FORMATOS } from "@/lib/ia/contenidos/formatos";

// Los formatos de datos del módulo B. La IA llena estas ranuras y nada más: la forma (colores,
// tipografías, logo, medidas) la pone el compositor, sin IA. Así la marca se cumple siempre.
//
// Marcado mínimo en los textos que van en la imagen: *palabra* = color de acento.
// Las cantidades (láminas, escenas, ganchos) van en las descripciones y no como mínimos o máximos
// del esquema: si la IA se pasa por uno, la pieza no se pierde; la corrige el control de calidad.

const L = FORMATOS;

// ── 1. El plan del mes (lo arma el planificador) ────────────────────────────────────────────

export const planSchema = z.object({
  objetivo: z.string().describe("Qué tiene que lograr este lote para el negocio, en una frase"),
  pilares: z
    .array(
      z.object({
        nombre: z.string().describe("Dos o tres palabras"),
        para_que: z.string().describe("Qué aporta a la marca este tipo de contenido"),
      }),
    )
    .describe("Entre 3 y 4 pilares"),
  piezas: z.array(
    z.object({
      id: z.string().describe("p1, p2, p3…"),
      formato: z.enum(["post", "carrusel", "historia", "reel"]),
      pilar: z.string().describe("El nombre de uno de los pilares"),
      objetivo: z.enum(["conocer", "confiar", "vender", "comunidad"]),
      idea: z.string().describe("Qué dice la pieza, en una frase concreta y propia de este negocio"),
      dia: z.enum(["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]),
      hora: z.string().describe("Hora sugerida de publicación, HH:MM"),
    }),
  ),
});

export type Plan = z.infer<typeof planSchema>;
export type ItemPlan = Plan["piezas"][number];

// ── 2. Las piezas (las escribe el redactor, una por llamada) ─────────────────────────────────

const visual = z.object({
  tipo: z.enum(["foto", "tipografica"]).describe("foto: lleva una imagen · tipografica: solo texto y color"),
  escena: z
    .string()
    .nullable()
    .describe(
      "Si es foto: qué se ve, concreto (sujeto, lugar, acción, luz). Sin texto ni logos en la escena. Si es tipográfica, null",
    ),
  alt: z.string().describe("Descripción corta de la pieza para lectores de pantalla"),
});

const datosAConfirmar = z
  .array(z.string())
  .describe("Datos duros que la pieza necesita y el negocio no dio (precio, horario, fecha). Nunca se inventan");

const caption = z.string().describe(`Texto que acompaña la publicación. Máximo ${L.post.limites.caption_caracteres} caracteres`);
const hashtags = z.array(z.string()).describe(`Máximo ${L.post.limites.hashtags}, sin el #`);

export const postSchema = z.object({
  titular: z.string().describe(`Máximo ${L.post.limites.titular} palabras, con UNA palabra entre *asteriscos*`),
  bajada: z.string().nullable().describe(`Máximo ${L.post.limites.bajada} palabras, o null`),
  cta: z.string().nullable().describe(`Botón en la imagen, máximo ${L.post.limites.cta} palabras, o null`),
  caption,
  hashtags,
  visual,
  datos_a_confirmar: datosAConfirmar,
});

export const carruselSchema = z.object({
  laminas: z
    .array(
      z.object({
        titular: z.string().describe(`Máximo ${L.carrusel.limites.titular} palabras, con UNA palabra entre *asteriscos*`),
        texto: z.string().nullable().describe(`Máximo ${L.carrusel.limites.texto} palabras. En la portada puede ser null`),
      }),
    )
    .describe(`Entre ${L.carrusel.limites.laminas_min} y ${L.carrusel.limites.laminas_max} láminas`),
  caption,
  hashtags,
  visual: visual.describe("La imagen de la portada"),
  datos_a_confirmar: datosAConfirmar,
});

export const historiaSchema = z.object({
  pantallas: z
    .array(
      z.object({
        texto: z.string().describe(`Máximo ${L.historia.limites.texto} palabras, con UNA palabra entre *asteriscos*`),
        sticker: z.object({
          tipo: z.enum(["encuesta", "pregunta", "cuenta_regresiva", "link", "ninguno"]),
          texto: z.string().nullable().describe(`Máximo ${L.historia.limites.sticker} palabras`),
          opciones: z.array(z.string()).describe("Solo en encuesta: las dos opciones"),
        }),
        visual,
      }),
    )
    .describe(`Entre ${L.historia.limites.pantallas_min} y ${L.historia.limites.pantallas_max} pantallas`),
  datos_a_confirmar: datosAConfirmar,
});

export const reelSchema = z.object({
  ganchos: z
    .array(
      z.object({
        formula: z.enum(["dato", "curiosidad", "dolor", "aspiracional", "detras_de_escena", "contraste"]),
        texto: z.string().describe(`Lo que aparece en el primer segundo y medio. Máximo ${L.reel.limites.texto_en_pantalla} palabras`),
      }),
    )
.describe("Tres ganchos de fórmulas DISTINTAS. La primera escena usa el primero"),
  escenas: z
    .array(
      z.object({
        segundos: z.string().describe("Tramo, por ejemplo 0-2"),
        texto_en_pantalla: z.string().describe(`Máximo ${L.reel.limites.texto_en_pantalla} palabras, con UNA palabra entre *asteriscos*`),
        voz_en_off: z.string().nullable().describe(`Lo que se dice. Máximo ${L.reel.limites.voz_en_off} palabras`),
        toma: z.string().describe("Plan de cámara: qué se ve, plano y movimiento"),
        escena: z.string().describe("La imagen de esta escena, concreta. Sin texto ni logos"),
      }),
    )
    .describe(`Entre ${L.reel.limites.escenas_min} y ${L.reel.limites.escenas_max} escenas`),
  giro: z.string().describe("Qué pasa a la mitad para que la gente se quede"),
  musica: z.string().describe("Clima de la música, sin nombrar canciones ni artistas"),
  caption,
  hashtags,
  datos_a_confirmar: datosAConfirmar,
});

export const ESQUEMAS = {
  post: postSchema,
  carrusel: carruselSchema,
  historia: historiaSchema,
  reel: reelSchema,
} as const;

export type ContenidoPost = z.infer<typeof postSchema>;
export type ContenidoCarrusel = z.infer<typeof carruselSchema>;
export type ContenidoHistoria = z.infer<typeof historiaSchema>;
export type ContenidoReel = z.infer<typeof reelSchema>;

/** Un problema que encontró el control de calidad. blocker = no sale así · menor = sale con aviso. */
export type Observacion = { control: string; gravedad: "blocker" | "menor"; detalle: string };

/** Una imagen a generar: el compositor la pone donde va; `prompt` ya trae la marca aplicada. */
export type PedidoImagen = { clave: string; prompt: string; ancho: number; alto: number };

type Base = {
  id: string;
  plan: ItemPlan;
  estado: "aprobada" | "revisar";
  observaciones: Observacion[];
  imagenes: PedidoImagen[];
  intentos: number;
};

export type Pieza =
  | (Base & { formato: "post"; contenido: ContenidoPost })
  | (Base & { formato: "carrusel"; contenido: ContenidoCarrusel })
  | (Base & { formato: "historia"; contenido: ContenidoHistoria })
  | (Base & { formato: "reel"; contenido: ContenidoReel });
