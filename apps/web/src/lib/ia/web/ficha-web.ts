import { z } from "zod";

// Paso 1 de la web del cliente: la entrevista de la web (ver equipo/flujo-web-cliente.md).
// BrandIA ya tiene la ficha y la identidad de la marca, así que solo pregunta lo que la web necesita.
// Al final arma la "ficha de la web". Lo que la persona no contestó va a huecos: nunca se inventa un dato.

export const MODELO_WEB = "anthropic/claude-sonnet-5.5";

export const fichaWebSchema = z.object({
  objetivo: z.string().describe("Para qué le sirve la web, en palabras de la persona"),
  accion_principal: z
    .string()
    .describe("Lo único que más quiere que haga quien la visita: encargar por WhatsApp, reservar, llamar, venir al local…"),
  productos: z
    .array(z.object({ nombre: z.string(), detalle: z.string().nullable() }))
    .max(8)
    .describe("Productos o servicios a destacar, solo los que nombró la persona"),
  como_pedir: z.string().nullable().describe("Cómo se encarga, reserva o compra, y con cuánta anticipación"),
  contacto: z.object({
    direccion: z.string().nullable(),
    zona: z.string().nullable().describe("Barrio o ciudad"),
    horarios: z.string().nullable(),
    whatsapp: z.string().nullable().describe("Tal cual lo dijo la persona"),
    telefono: z.string().nullable(),
    email: z.string().nullable(),
    instagram: z.string().nullable().describe("El usuario, con @"),
    otras_redes: z.array(z.string()),
  }),
  fotos: z
    .enum(["propias", "instagram", "generar", "sin_definir"])
    .describe("propias: las sube · instagram: usar su Instagram de referencia · generar: que BrandIA las genere"),
  no_mostrar: z.array(z.string()).describe("Lo que no quiere en la web, por ejemplo precios"),
  huecos: z.array(z.string()).describe("Lo que hacía falta y la persona no contestó o no sabía"),
});

export type FichaWeb = z.infer<typeof fichaWebSchema>;

/** Lo que la pantalla le muestra a la persona antes de que escriba (la primera pregunta) */
export const primeraPregunta = (nombre: string) =>
  `¡Vamos con la web de ${nombre}! Ya tengo tu marca, así que te pregunto solo lo que falta. Primero: ¿para qué querés que te sirva la web? Por ejemplo, que te encuentren, mostrar lo que hacés, tomar pedidos o reservas por WhatsApp.`;

export function promptEntrevistaWeb(marca: string, nombre: string) {
  return `Sos BrandIA, una app que arma marcas con IA. Ahora vas a armar la web de una marca que ya tiene su identidad hecha.
Tu trabajo en esta charla es juntar SOLO lo que la web necesita y que todavía no sabés.

## Lo que ya sabés de la marca (no lo vuelvas a preguntar)
${marca}

## Cómo conversás
- Español rioplatense, con el trato de la marca. Cálido, directo, sin jerga. Mensajes cortos.
- La pantalla ya le hizo esta primera pregunta: «${primeraPregunta(nombre)}». El primer mensaje de la persona contesta eso.
- Cada mensaje tuyo: como mucho 3 preguntas, numeradas, fáciles de contestar.
- Tenés como máximo 3 tandas de preguntas. Después cerrás con lo que tengas.
- No propongas diseños ni textos de la web: tu trabajo es escuchar.
- Si algo no lo sabe o no lo quiere contestar, no insistas: va a huecos.

## Lo que tenés que saber (por orden de importancia)
1. Para qué sirve la web y qué es lo principal que tiene que hacer quien la visita.
2. Qué productos o servicios destacar, y cómo se pide, encarga o reserva (con cuánta anticipación, si aplica).
3. Dirección o zona, horarios y contacto: WhatsApp, teléfono, mail, redes. Si vende solo online, la dirección no hace falta.
4. Fotos: si tiene propias, si usamos su Instagram de referencia o si las genera BrandIA (quedan marcadas como ilustrativas).
5. Qué no quiere mostrar (por ejemplo, precios).

## Regla de oro
Nunca inventes un dato: ni un teléfono, ni un horario, ni una dirección, ni un producto. Los datos de contacto se copian tal cual los dijo la persona. Lo que no dijo va a huecos.

## Cierre
Cuando tengas lo suficiente, o después de la tercera tanda, mandá un resumen de 3 a 5 líneas y preguntá si está bien así.
Cuando la persona confirme, escribí una frase corta de cierre ("¡Listo! Armo tu web.") y llamá a la herramienta terminar_entrevista_web con la ficha de la web. No la llames antes de esa confirmación.`;
}
