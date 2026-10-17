import { generateImage, generateText, Output } from "ai";
import { z } from "zod";

import { briefSchema } from "@/lib/ia/brief";

// Módulo B · el feed: con la ficha de la marca y su identidad, la IA arma posteos e historias.
// 1) Claude planifica el feed (textos, hashtags, idea visual y el pedido para cada imagen).
// 2) Un modelo de imágenes genera cada imagen con la paleta de la marca, todas en paralelo.
// Las imágenes van sin texto: la pantalla pone encima el `titular` con la tipografía de la marca.

export const MODELO_CONTENIDOS = "anthropic/claude-sonnet-5.5";
// Recraft acepta la paleta como dato (no solo en el texto del pedido): es lo que más "marca" se ve.
export const MODELO_IMAGENES = "recraft/recraft-v4.1";
// Si Recraft falla, la misma imagen se pide a GPT Image 2 (más lento, también respeta la paleta).
export const MODELO_IMAGENES_RESPALDO = "openai/gpt-image-2";

// La identidad mínima que necesita el feed. La identidad completa se hace en otra rama;
// cuando se conecten, alcanza con pasar estos cinco campos.
export const identidadSchema = z.object({
  nombre: z.string().min(1),
  paleta: z.array(z.string()).min(1).describe("Colores en hex, el principal primero: #1F4D3A"),
  tipografias: z.object({ titulos: z.string(), texto: z.string() }),
  voz: z.string().describe("Cómo habla la marca, en una o dos frases"),
});

export type Identidad = z.infer<typeof identidadSchema>;

export const entradaContenidosSchema = z.object({
  brief: briefSchema,
  identidad: identidadSchema,
});

export type EntradaContenidos = z.infer<typeof entradaContenidosSchema>;

// Lo que planifica Claude. Los pedidos de imagen van en inglés porque los modelos de imágenes rinden mejor.
const planSchema = z.object({
  direccion_de_arte: z
    .string()
    .describe(
      "En inglés. El estilo visual común a todas las imágenes del feed (tipo de imagen, luz, encuadre, materiales, textura) para que se vean de la misma marca",
    ),
  posteos: z
    .array(
      z.object({
        objetivo: z.string().describe("Para qué está este posteo en el feed, en pocas palabras: presentar, mostrar el producto, comunidad…"),
        titular: z.string().describe("Frase corta que va encima de la imagen, como mucho 7 palabras"),
        texto: z.string().describe("El texto del posteo (caption), con la voz de la marca"),
        hashtags: z.array(z.string()).describe("De 4 a 8, sin espacios, empezando con #"),
        idea_visual: z.string().describe("En español, qué se ve en la imagen, para mostrarle a la persona"),
        prompt_imagen: z.string().describe("En inglés, la escena concreta de la imagen"),
      }),
    )
    .min(3)
    .max(4),
  historias: z
    .array(
      z.object({
        objetivo: z.string(),
        texto: z.string().describe("El texto que va encima de la historia, corto"),
        interaccion: z
          .string()
          .nullable()
          .describe("Sticker de la historia si suma: una encuesta, una pregunta o un botón. Si no, null"),
        idea_visual: z.string().describe("En español, qué se ve en la imagen"),
        prompt_imagen: z.string().describe("En inglés, la escena concreta de la imagen, vertical"),
      }),
    )
    .min(2)
    .max(3),
});

type Plan = z.infer<typeof planSchema>;

const PROMPT_CONTENIDOS = `Sos el director creativo de BrandIA. Con la ficha de una marca y su identidad, armás su primer feed de Instagram: de 3 a 4 posteos y de 2 a 3 historias.

## Los textos
- Escribí con la voz de la marca y con el trato de la ficha (vos, tú o usted). En el idioma de la ficha.
- Cada posteo tiene un objetivo distinto (por ejemplo: presentar la marca, mostrar el producto o servicio, contar el diferencial, invitar a la comunidad). Que juntos cuenten quién es la marca.
- El titular es corto y se lee de un vistazo. El texto del posteo tiene gancho en la primera línea, es breve y termina con una invitación concreta.
- Hashtags del rubro y del lugar, que use la gente de verdad. Nada de #love o #instagood.
- Nunca inventes datos que no están en la ficha: ni precios, ni direcciones, ni horarios, ni teléfonos, ni usuarios de redes (@), ni promociones, ni premios. Si hace falta uno, usá un hueco entre corchetes, por ejemplo [dirección].
- Respetá lo que la marca nunca tiene que transmitir (palabras_no).

## Las imágenes
- La dirección de arte es una sola para todo el feed: así parece de una marca, no un collage.
- Cada imagen muestra algo específico de ESTE negocio: su producto, su lugar, su cliente, su ciudad. Lo concreto le gana a lo genérico.
- Nada de foto de banco: sin gente sonriendo a cámara, sin poses de oficina, sin manos dándose la mano, sin fondos blancos vacíos. Mejor escenas reales, cándidas, con textura y algo imperfecto.
- Los colores de la paleta tienen que aparecer en la escena: en objetos, paredes, ropa, packaging o luz.
- Las imágenes NO llevan texto, letras, logos ni carteles legibles: el texto lo pone la app encima.
- Escribí la dirección de arte y cada prompt_imagen en inglés.`;

export type Imagen = { url: string; modelo: string } | { url: null; error: string };

export type Posteo = Plan["posteos"][number] & { imagen: Imagen };
export type Historia = Plan["historias"][number] & { imagen: Imagen };

export type Feed = {
  marca: string;
  direccion_de_arte: string;
  posteos: Posteo[];
  historias: Historia[];
  medicion: { segundos: number; costo_usd: number };
};

// Medidas que acepta Recraft: posteo 4:5 (Instagram) e historia 9:16.
const MEDIDAS = {
  posteo: { recraft: "896x1152", respaldo: "1024x1536" },
  historia: { recraft: "768x1344", respaldo: "1024x1536" },
} as const;

function hexARgb(color: string): [number, number, number] | null {
  const hex = color.trim().replace(/^#/, "");
  const largo = /^[0-9a-f]{3}$/i.test(hex) ? hex.replace(/./g, "$&$&") : hex;
  if (!/^[0-9a-f]{6}$/i.test(largo)) return null;
  return [0, 2, 4].map((i) => Number.parseInt(largo.slice(i, i + 2), 16)) as [number, number, number];
}

// El costo real de cada llamada lo informa el Gateway en providerMetadata.gateway.cost (en dólares).
function costoDe(metadata: unknown): number {
  const costo = (metadata as { gateway?: { cost?: string } } | undefined)?.gateway?.cost;
  return costo ? Number(costo) : 0;
}

// Las imágenes llegan de 1 a 2 MB. Pasadas a JPG pesan ~10 veces menos: así el feed entero entra
// en una respuesta (Vercel corta las de más de 4,5 MB). sharp viene con Next; si no está, se mandan como llegan.
async function comprimir(bytes: Uint8Array, mediaType: string) {
  try {
    const { default: sharp } = await import("sharp");
    const jpg = await sharp(bytes).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    return { bytes: new Uint8Array(jpg), mediaType: "image/jpeg" };
  } catch {
    return { bytes, mediaType };
  }
}

type OpcionesImagen = Parameters<typeof generateImage>[0]["providerOptions"];

async function generarImagen(prompt: string, formato: keyof typeof MEDIDAS, paleta: string[]) {
  const colores = paleta.map(hexARgb).filter((rgb) => rgb !== null);
  const intentos: { modelo: string; size: `${number}x${number}`; providerOptions?: OpcionesImagen }[] = [
    {
      modelo: MODELO_IMAGENES,
      size: MEDIDAS[formato].recraft,
      providerOptions: colores.length ? { recraft: { controls: { colors: colores.map((rgb) => ({ rgb })) } } } : undefined,
    },
    { modelo: MODELO_IMAGENES_RESPALDO, size: MEDIDAS[formato].respaldo, providerOptions: { openai: { quality: "low" } } },
  ];

  let costo = 0;
  let ultimoError = "";
  for (const intento of intentos) {
    try {
      const resultado = await generateImage({
        model: intento.modelo,
        prompt,
        size: intento.size,
        providerOptions: intento.providerOptions,
        maxRetries: 1,
      });
      costo += costoDe(resultado.providerMetadata) || costoDe(resultado.calls[0]?.providerMetadata);
      const { bytes, mediaType } = await comprimir(resultado.image.uint8Array, resultado.image.mediaType);
      const url = `data:${mediaType};base64,${Buffer.from(bytes).toString("base64")}`;
      return { imagen: { url, modelo: intento.modelo } satisfies Imagen, costo };
    } catch (error) {
      ultimoError = error instanceof Error ? error.message : String(error);
    }
  }
  return { imagen: { url: null, error: ultimoError } satisfies Imagen, costo };
}

export async function generarFeed({ brief, identidad }: EntradaContenidos): Promise<Feed> {
  const inicio = Date.now();

  const { output: plan, providerMetadata } = await generateText({
    model: MODELO_CONTENIDOS,
    instructions: PROMPT_CONTENIDOS,
    prompt: `## La identidad\n${JSON.stringify(identidad, null, 2)}\n\n## La ficha de la marca\n${JSON.stringify(brief, null, 2)}`,
    output: Output.object({ schema: planSchema }),
  });
  if (!plan) throw new Error("La IA no devolvió el plan del feed");

  // El estilo común y la paleta van en todos los pedidos de imagen: es lo que hace que el feed se vea de una marca.
  const pedido = (escena: string) =>
    `${escena}\n\nArt direction for the whole brand feed: ${plan.direccion_de_arte}\nBrand color palette, use these colors prominently in the scene: ${identidad.paleta.join(", ")}.\nNo text, no letters, no logos, no readable signage. Authentic, specific and candid, not stock photography.`;

  const [imagenesPosteos, imagenesHistorias] = await Promise.all([
    Promise.all(plan.posteos.map((p) => generarImagen(pedido(p.prompt_imagen), "posteo", identidad.paleta))),
    Promise.all(plan.historias.map((h) => generarImagen(pedido(h.prompt_imagen), "historia", identidad.paleta))),
  ]);

  const costoImagenes = [...imagenesPosteos, ...imagenesHistorias].reduce((total, r) => total + r.costo, 0);

  return {
    marca: identidad.nombre,
    direccion_de_arte: plan.direccion_de_arte,
    posteos: plan.posteos.map((p, i) => ({ ...p, imagen: imagenesPosteos[i].imagen })),
    historias: plan.historias.map((h, i) => ({ ...h, imagen: imagenesHistorias[i].imagen })),
    medicion: {
      segundos: Math.round((Date.now() - inicio) / 100) / 10,
      costo_usd: Math.round((costoDe(providerMetadata) + costoImagenes) * 1000) / 1000,
    },
  };
}
