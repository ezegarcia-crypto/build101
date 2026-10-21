import type { Brief } from "@/lib/ia/brief";
import type { ItemPlan, Observacion, Plan } from "@/lib/ia/contenidos/esquemas";
import { FORMATOS, type IdFormato } from "@/lib/ia/contenidos/formatos";
import type { Kit } from "@/lib/ia/contenidos/kit";

// Los prompts del módulo B. Se arman con funciones porque cada uno inyecta la marca del cliente
// (su voz, sus reglas, sus palabras prohibidas) y las reglas del formato desde el registro.
// La IA nunca recibe colores, tipografías ni medidas para "diseñar": eso lo hace el compositor.

export const MODELO_PLAN = "anthropic/claude-sonnet-5.5";
export const MODELO_REDACCION = "anthropic/claude-sonnet-5.5";

const TRATO: Record<Kit["voz"]["trato"], string> = {
  vos: "de vos, en español rioplatense (tenés, querés, vení)",
  tu: "de tú (tienes, quieres, ven)",
  usted: "de usted (tiene, quiere, venga)",
};

/** Frases gastadas que hacen sonar a cualquier marca igual. Se suman a las prohibidas de la marca. */
export const CLICHES = [
  "calidad premium",
  "no te lo pierdas",
  "no te lo podés perder",
  "somos líderes",
  "los mejores del mercado",
  "increíble",
  "único en su tipo",
  "llevá tu negocio al siguiente nivel",
  "experiencia única",
  "te esperamos",
];

/** Lo que el negocio contó en la entrevista, en limpio, para que la IA lo use y no invente. */
function bloqueNegocio(brief: Brief): string {
  const b = brief;
  return [
    `Rubro: ${b.marca.rubro} · Dónde: ${b.marca.ubicacion}`,
    `Qué hace: ${b.negocio.que_hace}`,
    `Por qué lo eligen: ${b.negocio.diferencial}`,
    `Precio: ${b.negocio.posicion_precio} · Vende en: ${b.negocio.canales.join(", ") || "sin dato"}`,
    `Su cliente: ${b.publico.descripcion}${b.publico.edad_aprox ? ` (${b.publico.edad_aprox})` : ""}${b.publico.que_busca ? `. Busca: ${b.publico.que_busca}` : ""}`,
    b.restricciones.obligatorio.length ? `Tiene que estar sí o sí: ${b.restricciones.obligatorio.join("; ")}` : "",
    b.huecos.length ? `No sabemos (no lo inventes): ${b.huecos.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function bloqueVoz(identidad: Kit): string {
  const v = identidad.voz;
  const ejemplos = v.ejemplos.map((e) => `  «${e}»`).join("\n");
  return [
    `Marca: ${identidad.nombre}. ${identidad.esencia}`,
    `Promesa: ${identidad.promesa}`,
    `Mensajes que repite: ${identidad.mensajes_clave.join(" / ")}`,
    `Trato: ${TRATO[v.trato]}. Tono: ${v.tono.join(", ")}.`,
    v.reglas.length ? `Cómo escribe:\n${v.reglas.map((r) => `- ${r}`).join("\n")}` : "",
    v.lexico_si.length ? `Palabras suyas: ${v.lexico_si.join(", ")}.` : "",
    `Nunca usa: ${[...v.lexico_no, ...CLICHES].join(", ")}.`,
    ejemplos ? `Así suena:\n${ejemplos}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// ── Planificador ─────────────────────────────────────────────────────────────────────────────

/** Una pieza de un feed anterior que a la persona le gustó */
export type Gusto = { formato: string; pilar: string; idea: string };

/** El mes completo del suscriptor: cuántas semanas y entre qué fechas (por ejemplo "lunes 26 de octubre") */
export type MesPlan = { semanas: number; desde: string; hasta: string };

export function promptPlanificador(
  identidad: Kit,
  brief: Brief,
  mezcla: Record<IdFormato, number>,
  gustaron: Gusto[] = [],
  mes?: MesPlan,
): string {
  const total = Object.values(mezcla).reduce((a, b) => a + b, 0);
  const formatos = (Object.keys(mezcla) as IdFormato[])
    .filter((f) => mezcla[f] > 0)
    .map((f) => `- ${mezcla[f]} × ${f} (${FORMATOS[f].nombre}): ${FORMATOS[f].para_que}`)
    .join("\n");
  const porSemana = mes
    ? (Object.keys(mezcla) as IdFormato[])
        .filter((f) => mezcla[f] > 0)
        .map((f) => `${mezcla[f] / mes.semanas} ${FORMATOS[f].nombre.toLowerCase()}`)
        .join(", ")
    : "";

  return `Sos el estratega de contenidos de BrandIA. Armás el plan de redes de un negocio chico o mediano, con su marca ya definida.

## El negocio
${bloqueNegocio(brief)}

## La marca
${bloqueVoz(identidad)}

## Qué tenés que armar
1. Entre 3 y 4 pilares: los tipos de contenido que esta marca necesita para que la conozcan, le crean y le compren. Propios de ESTE negocio (en una panadería, "El horno por dentro"; nunca "Contenido de valor").
2. Exactamente ${total} piezas, con esta mezcla:
${formatos}
3. Para cada pieza: el pilar, el objetivo (conocer, confiar, vender o comunidad), la idea en una frase concreta, y el día y la hora en que conviene publicarla para su cliente.${
    mes
      ? `
4. Es el plan de un mes entero: ${mes.semanas} semanas, del ${mes.desde} al ${mes.hasta}. Cada pieza lleva su semana (1 a ${mes.semanas}) y cada semana tiene la misma mezcla: ${porSemana}.`
      : ""
  }

## Reglas
- Cada idea tiene que poder ser solo de este negocio: si sirve para cualquier otro del rubro, es demasiado genérica.
- Repartí los objetivos: no todo es vender. Como mucho un tercio de las piezas vende directo.
- Usá lo que el negocio contó. Si una idea necesita un dato que no dio (un precio, un horario, una fecha), igual podés proponerla: el redactor lo va a marcar para confirmar. Nunca lo inventes.
- Repartí las piezas en la semana, sin dos el mismo día salvo una historia.${
    mes
      ? `
- El mes cuenta una historia: que las semanas no se repitan. Variá los días, los ángulos y los pilares de una semana a otra, y no repitas ninguna idea en todo el mes.
- Si en esas fechas hay algo propio del rubro o de la zona, podés usarlo, pero solo si estás seguro de la fecha. Ante la duda, no.`
      : ""
  }
- Ids: p1, p2, p3… en el orden en que se publican.${
    gustaron.length
      ? `

## Lo que le gustó del feed anterior
La persona marcó con "me gusta" estas piezas. Seguí esa línea (los temas, los ángulos y los pilares que eligió), pero con ideas nuevas: no repitas ninguna.
${gustaron.map((g) => `- ${g.formato} · ${g.pilar}: ${g.idea}`).join("\n")}`
      : ""
  }`;
}

// ── Redactor ─────────────────────────────────────────────────────────────────────────────────

export function promptRedactor(identidad: Kit, brief: Brief, plan: Plan, item: ItemPlan): string {
  const f = FORMATOS[item.formato];
  const limites = Object.entries(f.limites)
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
    .join(" · ");
  const pilar = plan.pilares.find((p) => p.nombre === item.pilar);

  return `Sos el redactor de BrandIA. Escribís UNA pieza de redes para un negocio, con la voz exacta de su marca.

## El negocio
${bloqueNegocio(brief)}

## La voz de la marca (respetala al pie de la letra)
${bloqueVoz(identidad)}

## La pieza
Formato: ${f.nombre} (${f.redes}), ${f.ancho}×${f.alto}.
Pilar: ${item.pilar}${pilar ? ` — ${pilar.para_que}` : ""}.
Objetivo: ${item.objetivo}. Se publica el ${item.dia}${item.semana ? ` de la semana ${item.semana} del mes` : ""} a las ${item.hora}.
Idea: ${item.idea}

## Reglas del formato
${f.reglas.map((r) => `- ${r}`).join("\n")}
Límites (palabras, salvo que diga caracteres): ${limites}.

## Reglas de BrandIA
- Escribí ${TRATO[identidad.voz.trato]}, sin mezclar tratos.
- Nada de datos inventados: precios, horarios, fechas, porcentajes, direcciones o teléfonos solo si están en lo que contó el negocio. Si la pieza necesita uno que no está, escribí la frase sin el número o con «[a confirmar]» en ese lugar, y anotalo en datos_a_confirmar.
- Las imágenes las genera otra IA a partir de tu "escena": describí algo concreto y fotografiable de este negocio (quién, qué, dónde, con qué luz). Nunca pidas texto, carteles legibles ni logos dentro de la imagen.
- Usá foto cuando hay algo que mostrar (un producto, un lugar, una persona trabajando); tipográfica cuando la pieza es una frase, un dato o una pregunta.
- Hashtags: pocos y del rubro y la zona, nunca genéricos como #love o #instagood.${
    identidad.estilo === "editorial"
      ? `

## El estilo de diseño que eligió la persona: editorial
- La foto no va a sangre: va recortada en una forma (arco o círculo) sobre un fondo liso. En la "escena", pedí un sujeto claro y centrado, con aire alrededor y un fondo simple.
- El titular va muy grande y con mucho aire: que sea corto y con peso.`
      : ""
  }`;
}

/** La segunda vuelta: el control encontró problemas y el redactor corrige solo eso. */
export function promptCorreccion(observaciones: Observacion[]): string {
  return `El control de calidad encontró estos problemas en tu pieza:
${observaciones.map((o) => `- [${o.control}] ${o.detalle}`).join("\n")}

Devolvé la pieza completa otra vez, corrigiendo SOLO eso. Lo que estaba bien, dejalo igual.`;
}
