import { generateText, Output, type ModelMessage } from "ai";

import type { Brief } from "@/lib/ia/brief";
import { controlarPieza } from "@/lib/ia/contenidos/control";
import {
  ESQUEMAS,
  planSchema,
  type ItemPlan,
  type PedidoImagen,
  type Pieza,
  type Plan,
} from "@/lib/ia/contenidos/esquemas";
import { FORMATOS, MEZCLA_DEMO, type IdFormato } from "@/lib/ia/contenidos/formatos";
import { generarImagen, promptImagen } from "@/lib/ia/contenidos/imagen";
import {
  type Gusto,
  MODELO_PLAN,
  MODELO_REDACCION,
  promptCorreccion,
  promptPlanificador,
  promptRedactor,
} from "@/lib/ia/contenidos/prompts";
import type { Kit } from "@/lib/ia/contenidos/kit";
import { etiquetar, senalDelPedido } from "@/lib/ia/gastos";

// El motor del módulo B. Encadena cuatro pasos, cada uno con su entrada y su salida fijas:
//
//   0. armarKit     identidad del módulo A → lo que los motores necesitan de la marca  sin IA
//   1. planificar   ficha + kit            → plan del mes (pilares y piezas)        IA
//   2. redactar     plan + una pieza        → el contenido de la pieza               IA
//   3. controlar    contenido               → observaciones; si hay blocker, vuelve
//                                             al redactor UNA vez con el problema    sin IA
//   4. imágenes     escenas de la pieza     → prompts con la marca → imágenes        IA (opcional)
//
// Dibujar la pieza (componer.ts) no está acá: lo hace la pantalla o el servidor, sin IA.

export type Uso = { entrada: number; salida: number; usd: number };

const uso0 = (): Uso => ({ entrada: 0, salida: 0, usd: 0 });

function sumarUso(acc: Uso, r: { usage: { inputTokens?: number; outputTokens?: number }; providerMetadata?: unknown }) {
  acc.entrada += r.usage.inputTokens ?? 0;
  acc.salida += r.usage.outputTokens ?? 0;
  const costo = Number((r.providerMetadata as { gateway?: { cost?: string | number } } | undefined)?.gateway?.cost ?? 0);
  if (Number.isFinite(costo)) acc.usd += costo;
}

// ── 1. Planificar ────────────────────────────────────────────────────────────────────────────

export async function planificar(o: {
  kit: Kit;
  brief: Brief;
  mezcla?: Record<IdFormato, number>;
  gustaron?: Gusto[];
}): Promise<{ plan: Plan; uso: Uso }> {
  const uso = uso0();
  const mezcla = o.mezcla ?? MEZCLA_DEMO;
  const r = await generateText({
    model: MODELO_PLAN,
    abortSignal: senalDelPedido(),
    providerOptions: etiquetar(),
    output: Output.object({ schema: planSchema }),
    prompt: promptPlanificador(o.kit, o.brief, mezcla, o.gustaron),
  });
  sumarUso(uso, r);
  return { plan: r.output, uso };
}

// ── 2 y 3. Redactar y controlar ──────────────────────────────────────────────────────────────

/** Las imágenes que necesita la pieza, con la marca ya aplicada al prompt. */
function pedidosDeImagen(formato: IdFormato, contenido: Pieza["contenido"], identidad: Kit): PedidoImagen[] {
  const { ancho, alto } = FORMATOS[formato];
  // En el estilo editorial la foto va recortada en una forma y el texto afuera: no hace falta zona libre
  const editorial = identidad.estilo === "editorial";
  const pedido = (clave: string, escena: string | null | undefined, zona: "abajo" | "centro") =>
    escena ? [{ clave, prompt: promptImagen(escena, identidad, ancho, alto, editorial ? "forma" : zona), ancho, alto }] : [];

  switch (formato) {
    case "post":
    case "carrusel": {
      const v = (contenido as Extract<Pieza, { formato: "post" }>["contenido"]).visual;
      return v.tipo === "foto" ? pedido("portada", v.escena, "abajo") : [];
    }
    case "historia":
      return (contenido as Extract<Pieza, { formato: "historia" }>["contenido"]).pantallas.flatMap((p, i) =>
        p.visual.tipo === "foto" ? pedido(`pantalla-${i + 1}`, p.visual.escena, "centro") : [],
      );
    case "reel": {
      const escenas = (contenido as Extract<Pieza, { formato: "reel" }>["contenido"]).escenas;
      // La última escena es el cierre con la marca: no lleva foto.
      return escenas.slice(0, -1).flatMap((e, i) => pedido(`escena-${i + 1}`, e.escena, "centro"));
    }
  }
}

export async function redactar(o: {
  kit: Kit;
  brief: Brief;
  plan: Plan;
  item: ItemPlan;
}): Promise<{ pieza: Pieza; uso: Uso }> {
  const uso = uso0();
  const formato = o.item.formato;
  const schema = ESQUEMAS[formato];
  const mensajes: ModelMessage[] = [{ role: "user", content: promptRedactor(o.kit, o.brief, o.plan, o.item) }];

  let contenido: Pieza["contenido"] | undefined;
  let observaciones: ReturnType<typeof controlarPieza> = [];
  let intentos = 0;

  // Generador + control: como mucho dos vueltas. La segunda solo corrige lo que el control marcó.
  while (intentos < 2) {
    intentos++;
    const r = await generateText({
      model: MODELO_REDACCION,
      abortSignal: senalDelPedido(),
      providerOptions: etiquetar(),
      output: Output.object({ schema: schema as typeof ESQUEMAS.post }),
      messages: mensajes,
    });
    sumarUso(uso, r);
    contenido = r.output as Pieza["contenido"];
    observaciones = controlarPieza(formato, contenido, o.kit, o.brief);
    const bloqueantes = observaciones.filter((x) => x.gravedad === "blocker");
    if (!bloqueantes.length) break;
    mensajes.push({ role: "assistant", content: JSON.stringify(contenido) }, { role: "user", content: promptCorreccion(bloqueantes) });
  }

  const pieza = {
    id: o.item.id,
    formato,
    plan: o.item,
    contenido,
    estado: observaciones.some((x) => x.gravedad === "blocker") ? "revisar" : "aprobada",
    observaciones,
    imagenes: pedidosDeImagen(formato, contenido!, o.kit),
    intentos,
  } as Pieza;
  return { pieza, uso };
}

// ── El lote completo, como una sucesión de eventos (para mostrar el progreso en pantalla) ─────

export type Evento =
  | { tipo: "progreso"; mensaje: string }
  | { tipo: "kit"; kit: Kit }
  | { tipo: "plan"; plan: Plan }
  | { tipo: "pieza"; pieza: Pieza }
  | { tipo: "imagen"; pieza: string; clave: string; url: string }
  | { tipo: "error"; donde: string; mensaje: string }
  | { tipo: "fin"; uso: Uso; imagenes: number; segundos: number };

/**
 * Genera el lote: plan, todas las piezas en paralelo y, si `imagenes` es true, sus imágenes.
 * Emite cada resultado apenas está listo. Un error en una pieza no frena a las demás.
 */
export async function* generarLote(o: {
  kit: Kit;
  brief: Brief;
  mezcla?: Record<IdFormato, number>;
  imagenes?: boolean;
  gustaron?: Gusto[];
}): AsyncGenerator<Evento> {
  const t0 = Date.now();
  const total = uso0();
  const sumar = (u: Uso) => {
    total.entrada += u.entrada;
    total.salida += u.salida;
    total.usd += u.usd;
  };

  yield { tipo: "kit", kit: o.kit };
  yield { tipo: "progreso", mensaje: "Pensando qué tiene que contar tu marca este mes" };
  const { plan, uso } = await planificar(o);
  sumar(uso);
  yield { tipo: "plan", plan };
  yield { tipo: "progreso", mensaje: `Escribiendo ${plan.piezas.length} piezas con tu voz` };

  // Cola de eventos: las piezas y sus imágenes terminan en cualquier orden.
  const cola: Evento[] = [];
  let avisar: (() => void) | null = null;
  const emitir = (e: Evento) => {
    cola.push(e);
    avisar?.();
  };
  let imagenes = 0;

  const trabajos = plan.piezas.map(async (item) => {
    try {
      const { pieza, uso: u } = await redactar({ ...o, plan, item });
      sumar(u);
      emitir({ tipo: "pieza", pieza });
      if (!o.imagenes) return;
      await Promise.all(
        pieza.imagenes.map(async (pedido) => {
          try {
            const img = await generarImagen(pedido);
            imagenes++;
            total.usd += img.usd;
            emitir({ tipo: "imagen", pieza: pieza.id, clave: img.clave, url: img.url });
          } catch (e) {
            emitir({ tipo: "error", donde: `${pieza.id}/${pedido.clave}`, mensaje: String((e as Error).message ?? e) });
          }
        }),
      );
    } catch (e) {
      emitir({ tipo: "error", donde: item.id, mensaje: String((e as Error).message ?? e) });
    }
  });

  let pendientes = trabajos.length;
  trabajos.forEach((t) => t.finally(() => (pendientes--, avisar?.())));

  while (pendientes > 0 || cola.length) {
    if (!cola.length) await new Promise<void>((r) => (avisar = r));
    avisar = null;
    while (cola.length) yield cola.shift()!;
  }

  yield { tipo: "fin", uso: total, imagenes, segundos: Math.round((Date.now() - t0) / 1000) };
}
