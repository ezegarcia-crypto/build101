import { z } from "zod";

import { briefSchema } from "@/lib/ia/brief";
import type { Comprobacion } from "@/lib/ia/comprobaciones";

import type { FichaWeb } from "./ficha-web";

// Pasos 3 y 4 de la web del cliente: la IA arma la web y después la cambia con lo que se le pide en palabras.
// La IA no escribe HTML: devuelve las secciones con sus textos y la pantalla las dibuja con la identidad
// (colores, tipografías y logo). Los datos de contacto salen siempre de la ficha de la web, nunca de la IA.

// ---- Lo que entra: la marca ----

// De la identidad se usa solo lo que sirve para escribir (los colores y el logo los aplica la pantalla)
export const marcaWebSchema = z.object({
  brief: briefSchema,
  identidad: z.object({
    nombre: z.string(),
    eslogan: z.string(),
    esencia: z.object({ idea: z.string(), promesa: z.string(), publico: z.string() }).partial(),
    voz: z
      .object({
        resumen: z.string(),
        palabras_si: z.array(z.string()),
        palabras_no: z.array(z.string()),
        rasgos: z.array(z.object({ rasgo: z.string(), es: z.string(), no_es: z.string() })),
      })
      .partial(),
  }),
});

export type MarcaWeb = z.infer<typeof marcaWebSchema>;

export function describirMarca({ brief, identidad }: MarcaWeb) {
  return JSON.stringify(
    {
      nombre: identidad.nombre,
      eslogan: identidad.eslogan,
      rubro: brief.marca.rubro,
      ubicacion: brief.marca.ubicacion,
      trato: brief.marca.trato,
      que_hace: brief.negocio.que_hace,
      diferencial: brief.negocio.diferencial,
      canales: brief.negocio.canales,
      publico: brief.publico.descripcion,
      esencia: identidad.esencia,
      voz: identidad.voz,
      no_parecerse_a: brief.gustos.no_parecerse_a,
    },
    null,
    2,
  );
}

// ---- Lo que sale: la web ----

export const ACCIONES = ["whatsapp", "telefono", "email", "instagram", "mapa", "ninguna"] as const;

const botonSchema = z.object({
  texto: z.string().describe("Corto, con la voz de la marca"),
  accion: z.enum(ACCIONES).describe("Qué hace al tocarlo. El dato (número, mail, dirección) lo pone la app desde la ficha"),
  mensaje: z.string().nullable().describe("Solo para whatsapp: el mensaje ya escrito con el que arranca la charla"),
});

export const seccionSchema = z.object({
  id: z.string().describe("Corto, sin espacios ni tildes: inicio, productos, como-pedir…"),
  tipo: z
    .enum(["portada", "productos", "como_pedir", "sobre", "ubicacion", "destacado", "contacto"])
    .describe(
      "portada: la primera pantalla · productos: lo que ofrece · como_pedir: los pasos para encargar o reservar · sobre: la historia o quién está detrás · ubicacion: dirección, horario y mapa · destacado: una frase o propuesta fuerte · contacto: cierre con los botones",
    ),
  titulo: z.string(),
  texto: z.string().describe("Una a tres frases. Puede ser cadena vacía"),
  items: z
    .array(z.object({ titulo: z.string(), texto: z.string() }))
    .max(8)
    .describe(
      "Productos, pasos o puntos. Solo lo que está en la ficha: nunca productos inventados, ni detalles o promesas que la persona no contó",
    ),
  boton: botonSchema.nullable(),
  foto: z
    .string()
    .nullable()
    .describe("Si la sección lleva foto, qué foto iría, en una frase para la persona («Una torta de cumpleaños de cerca»)"),
});

export const webSchema = z.object({
  estilo: z
    .enum(["vidriera", "accion_primero", "cercana"])
    .describe(
      "vidriera: fotos grandes y poco texto · accion_primero: lo principal (encargar, reservar) bien arriba y visible · cercana: la historia, quién está detrás y el lugar",
    ),
  por_que_estilo: z.string().describe("Una frase para la persona: por qué este estilo le sirve, según lo que contó"),
  titulo_google: z.string().describe("El título que aparece en Google. Corto: unos 50 caracteres, nunca más de 60"),
  descripcion_google: z.string().describe("La descripción que aparece en Google. Una o dos frases cortas: unos 130 caracteres, nunca más de 155"),
  secciones: z.array(seccionSchema).min(3).max(7).describe("En el orden en que se ven. La primera es la portada"),
  pie: z.string().describe("Una frase corta para el pie de página"),
});

export type Web = z.infer<typeof webSchema>;
export type Seccion = z.infer<typeof seccionSchema>;

const REGLAS = `## Reglas
- Escribís todos los textos con la voz de la marca: su trato, sus palabras sí y nunca sus palabras no.
- Nunca inventes un dato: ni productos, ni precios, ni horarios, ni teléfonos, ni direcciones, ni premios, ni años de historia, ni reseñas. Usás solo lo que está en la ficha de la marca y en la ficha de la web.
- Tampoco inventes cómo trabaja el negocio: ni servicios extra, ni promesas, ni detalles de lo que hace por el cliente que la persona no contó (por ejemplo «te avisamos cuando toca la vacuna», «envíos en el día», «ingredientes orgánicos», «garantía»). La voz de la marca está en cómo lo decís, no en agregar cosas nuevas.
- El texto de cada producto o paso dice lo mismo que la ficha, con otras palabras. Si la ficha no tiene detalle de un producto, dejás el texto corto y general, o vacío.
- Nunca escribas números de teléfono, mails ni direcciones dentro de los textos: los pone la app en los botones y en la sección de ubicación, desde la ficha.
- Respetá lo que la persona no quiere mostrar (por ejemplo, precios).
- Si un dato hace falta y no está (por ejemplo, el horario), armá la web igual sin ese dato: la app avisa que falta.
- Un solo botón principal en la portada, con la acción principal de la ficha de la web. Si no hay dato para esa acción (por ejemplo, no hay WhatsApp), elegí la que sí tenga dato, o "ninguna".
- Textos cortos, para leer en el celular.
- No repitas: cada sección cuenta algo distinto (qué hay, cómo se pide, quién está detrás, dónde y cuándo). El diferencial de la marca va en la portada y, como mucho, una vez más; el eslogan, una sola vez. Ni el pie ni los títulos repiten frases de otras secciones.
- Cada foto describe una escena distinta y concreta del negocio (un producto, el lugar, las manos trabajando, un cliente usándolo), no la misma escena con otras palabras.`;

export const PROMPT_ARMAR_WEB = `Sos el diseñador web de BrandIA, una app que arma marcas con IA para emprendedores y PyMEs.
Con la ficha de la marca, su identidad y la ficha de la web, armás una web de una sola página: elegís el estilo, el orden de las secciones y escribís todos los textos, también el título y la descripción para Google.

## Cómo elegís
- El estilo y las secciones salen del objetivo de la web y de la acción principal: si lo principal es encargar, "como_pedir" va arriba; si es que vengan al local, "ubicacion" gana lugar.
- Entre 4 y 6 secciones. Siempre una portada al principio y un cierre con contacto.
- Si hay dirección u horarios en la ficha de la web, va una sección "ubicacion".

${REGLAS}`;

export const PROMPT_CAMBIAR_WEB = `Sos el diseñador web de BrandIA. La persona ya tiene su web armada y te pide un cambio en palabras.

## Cómo trabajás
- Cambiás solo lo que pidió y dejás todo lo demás exactamente igual (mismos ids, mismo orden, mismos textos).
- Si el pedido cambia un dato del negocio (horario, WhatsApp, un producto que ya no hace, un aviso como "el 25 cerramos"), lo actualizás en la ficha de la web, que es de donde la app saca los datos. Un aviso temporal va en una sección "destacado".
- Si el pedido no se puede hacer (por ejemplo, cambiar los colores: esos son de la marca), no cambiás nada y lo explicás.
- En "respuesta" le contás en una o dos frases, con la voz de BrandIA (rioplatense, de vos, cálido), qué cambiaste. Si algo quedó en duda, preguntás.

${REGLAS}`;

// ---- Comprobaciones automáticas ----

const soloDigitos = (s: string) => s.replace(/\D/g, "");

/** Revisa que la IA no haya escrito datos que la persona no dio, y que los botones tengan su dato */
export function comprobarWeb(web: Web, ficha: FichaWeb): Comprobacion[] {
  const c = ficha.contacto;
  const textos = [
    web.titulo_google,
    web.descripcion_google,
    web.pie,
    ...web.secciones.flatMap((s) => [s.titulo, s.texto, s.boton?.texto ?? "", s.boton?.mensaje ?? "", ...s.items.flatMap((i) => [i.titulo, i.texto])]),
  ].join(" \n ");

  // Números largos (teléfonos) o mails escritos por la IA que no están en la ficha
  const conocidos = [c.whatsapp, c.telefono, c.direccion, c.horarios].filter(Boolean).map((v) => soloDigitos(v!));
  const numeros = (textos.match(/\+?\d[\d\s-]{6,}\d/g) ?? []).filter((n) => !conocidos.some((k) => k.includes(soloDigitos(n))));
  const mails = (textos.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? []).filter((m) => m.toLowerCase() !== c.email?.toLowerCase());
  const inventados = [...numeros, ...mails];

  const datoDe: Record<string, string | null> = {
    whatsapp: c.whatsapp,
    telefono: c.telefono ?? c.whatsapp,
    email: c.email,
    instagram: c.instagram,
    mapa: c.direccion,
  };
  const sinDato = web.secciones
    .filter((s) => s.boton && s.boton.accion !== "ninguna" && !datoDe[s.boton.accion])
    .map((s) => `«${s.boton!.texto}» (${s.boton!.accion})`);

  return [
    {
      que: "Ningún dato inventado",
      ok: inventados.length === 0,
      detalle: inventados.length
        ? `Apareció un dato que no contaste: ${inventados.join(", ")}`
        : "Teléfonos, mails y direcciones salen solo de lo que contaste",
    },
    {
      que: "Botones con su dato",
      ok: sinDato.length === 0,
      detalle: sinDato.length ? `Falta el dato para ${sinDato.join(", ")}` : "Cada botón sabe adónde lleva",
    },
    {
      que: "Para Google",
      ok: web.titulo_google.length <= 60 && web.descripcion_google.length <= 155,
      detalle: `Título de ${web.titulo_google.length} caracteres (máx. 60) y descripción de ${web.descripcion_google.length} (máx. 155)`,
    },
  ];
}
