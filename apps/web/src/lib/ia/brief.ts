import { z } from "zod";

// La ficha de la marca ("brief"): lo que sale de la entrevista y entra a la generación de la identidad.
// Es el mismo formato que brandia/motor-ia/brief.schema.json, con todos los campos obligatorios
// (los que pueden faltar van en null o en `huecos`) para que la IA siempre devuelva la misma forma.

export const briefSchema = z.object({
  version: z.literal("0.2"),
  tipo_proyecto: z
    .enum(["nueva", "renovacion", "solo_productos"])
    .describe("nueva: marca de cero · renovacion: ya tiene y la quiere renovar · solo_productos: ya tiene marca y quiere productos"),
  marca: z.object({
    nombre: z.string().nullable().describe("El nombre del negocio, o null si todavía no tiene"),
    necesita_nombre: z.boolean(),
    rubro: z.string(),
    ubicacion: z.string().describe("Ciudad, país o alcance"),
    trato: z.enum(["vos", "tu", "usted"]).describe("Cómo le habla la marca a sus clientes"),
  }),
  negocio: z.object({
    que_hace: z.string().describe("La frase de ascensor, en palabras de la persona"),
    diferencial: z.string().describe("Por qué la eligen"),
    posicion_precio: z.enum(["accesible", "intermedio", "premium", "sin_dato"]),
    canales: z.array(z.string()).describe("Dónde vende: local, Instagram, web, ferias…"),
  }),
  publico: z.object({
    descripcion: z.string().describe("La persona concreta que describió"),
    edad_aprox: z.string().nullable(),
    que_busca: z.string().nullable(),
  }),
  personalidad: z.object({
    palabras_si: z.array(z.string()).max(5).describe("Cómo tiene que sentirse la marca"),
    palabras_no: z.array(z.string()).max(5).describe("Lo que nunca tiene que transmitir"),
  }),
  gustos: z.object({
    marcas_admiradas: z.array(z.object({ nombre: z.string(), por_que: z.string() })),
    no_parecerse_a: z.array(z.string()),
    colores_si: z.array(z.string()),
    colores_no: z.array(z.string()),
  }),
  referencias: z
    .array(
      z.object({
        tipo: z.enum(["imagen", "sitio", "pinterest", "marca", "otro"]),
        ubicacion: z.string().describe("URL o nombre del archivo"),
        nota: z.string().nullable(),
      }),
    )
    .describe("Lo que compartió la persona: fotos, sitios, Pinterest, marcas"),
  aplicaciones_prioritarias: z.array(z.string()).describe("Dónde se ve primero la marca"),
  restricciones: z.object({
    obligatorio: z.array(z.string()).describe("Lo que sí o sí tiene que estar"),
    a_conservar: z.array(z.string()).describe("En una renovación, qué se queda de la marca actual"),
  }),
  marca_actual: z
    .object({
      logo: z.string().nullable(),
      gusta: z.array(z.string()),
      no_gusta: z.array(z.string()),
    })
    .nullable()
    .describe("Solo en una renovación; si no, null"),
  huecos: z.array(z.string()).describe("Lo que no se respondió. Nunca se completa inventando"),
  direccion_elegida: z.string().nullable().describe("Se completa más adelante; en la entrevista va null"),
});

export type Brief = z.infer<typeof briefSchema>;
