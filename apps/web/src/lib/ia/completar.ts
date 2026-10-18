import type { Kit } from "@/lib/ia/contenidos/kit";

// Módulo B, completar los datos a confirmar. El feed deja marcado «[a confirmar]» lo que el negocio
// no contó (un precio, un plazo, un testimonio). La persona responde cada dato en "Antes de publicar"
// (o dice que no va) y la IA reescribe solo las piezas que lo necesitaban: aplica el dato tal cual,
// o arma la frase sin él. Las imágenes no cambian: la estructura y los visuales quedan iguales.

export { MODELO_REDACCION as MODELO_COMPLETAR } from "@/lib/ia/contenidos/prompts";

export type Respuesta = { dato: string; valor: string | null };

export const PROMPT_COMPLETAR = `Sos el redactor de BrandIA. Te paso una pieza de redes ya escrita (en JSON) y las respuestas de la dueña o el dueño del negocio a los datos que le faltaban. Devolvé la misma pieza con esas respuestas aplicadas.

Reglas:
- Donde dice «[a confirmar]», o donde la pieza necesitaba ese dato, usá lo que respondió la persona tal cual: no lo cambies, no lo redondees ni lo adornes. Si es un testimonio, va entre comillas y textual.
- Si la persona dijo que un dato NO va, reescribí esa frase para que no lo necesite, sin dejar «[a confirmar]».
- No inventes ningún otro dato. Lo que no respondió queda igual, con su «[a confirmar]».
- Cambiá lo mínimo: misma estructura, la misma cantidad de láminas, pantallas o escenas, la misma voz y los mismos límites de palabras. Mantené UNA palabra entre *asteriscos* en cada titular o texto que la tenía.
- No toques "visual", "escena" ni "toma".
- En datos_a_confirmar dejá solo los que siguen sin respuesta, con el mismo texto.`;

export function pedidoCompletar({ kit, idea, contenido, respuestas }: { kit: Pick<Kit, "nombre" | "voz">; idea: string; contenido: unknown; respuestas: Respuesta[] }) {
  return [
    `Marca: ${kit.nombre}. Trato: ${kit.voz.trato}. Tono: ${kit.voz.tono.join(", ")}.`,
    kit.voz.reglas.length ? `Reglas de la voz:\n- ${kit.voz.reglas.join("\n- ")}` : "",
    `Idea de la pieza: ${idea}`,
    `La pieza:\n${JSON.stringify(contenido, null, 1)}`,
    `Respuestas de la persona:\n${respuestas
      .map((r) => (r.valor ? `- ${r.dato} → ${r.valor}` : `- ${r.dato} → NO VA: reescribí sin este dato`))
      .join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
