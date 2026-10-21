import { createHmac, timingSafeEqual } from "node:crypto";

import { supabaseServicio } from "@/lib/supabase/servicio";

// El cobro de los planes con Mercado Pago (Uruguay, en pesos). Solo en el servidor. Se habla con su API REST, sin
// instalar nada. Por qué Mercado Pago y no Stripe: equipo/cobros.md.
//
//   "Tu marca andando" (mensual) → una suscripción de Mercado Pago (preapproval): se cobra sola cada mes.
//   "Tu marca" (pago único)      → un pago de Checkout Pro (preference).
//
// En los dos casos se anota primero la fila en `suscripciones` (pendiente) y se manda a la persona a pagar. Cuando
// Mercado Pago avisa (webhook, /api/cobros/aviso) o la persona vuelve (/api/cobros/confirmar), se le pregunta a
// Mercado Pago cómo quedó y recién ahí se marca activa. Nunca se cree lo que dice el navegador.
//
// Variables (en apps/web/.env.local y en Vercel):
//   MERCADOPAGO_ACCESS_TOKEN       la clave de la aplicación (en modo prueba, la del vendedor de prueba)
//   MERCADOPAGO_WEBHOOK_SECRET     la "clave secreta" de Webhooks del panel de Mercado Pago (opcional, recomendada)
//   MERCADOPAGO_PRUEBA             "1" mientras se prueba: las filas quedan marcadas como prueba
//   MERCADOPAGO_COMPRADOR_PRUEBA   el mail del comprador de prueba (en modo prueba paga siempre ese)

const API = "https://api.mercadopago.com";

export type PlanCobrable = "marca" | "mensual";

export function hayCobro() {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

export const enModoPrueba = () => process.env.MERCADOPAGO_PRUEBA === "1";

async function mp<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  const clave = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!clave) throw new Error("Falta conectar Mercado Pago (MERCADOPAGO_ACCESS_TOKEN).");
  const r = await fetch(`${API}${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${clave}`,
      "content-type": "application/json",
      // Si el mismo pedido se repite (doble clic, reintento), Mercado Pago no crea dos
      ...(metodo === "POST" ? { "X-Idempotency-Key": crypto.randomUUID() } : {}),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    cache: "no-store",
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`Mercado Pago respondió ${r.status}: ${texto.slice(0, 300)}`);
  return JSON.parse(texto) as T;
}

function base() {
  const s = supabaseServicio();
  if (!s) throw new Error("Falta conectar la base de datos (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).");
  return s;
}

type Plan = { id: string; nombre: string; precio_uyu: number | null; activo: boolean };

async function leerPlan(id: PlanCobrable) {
  const { data, error } = await base().from("planes").select("id, nombre, precio_uyu, activo").eq("id", id).single();
  if (error || !data) throw new Error(`No está el plan ${id} en la base.`);
  const plan = data as Plan;
  if (!plan.activo || !plan.precio_uyu) throw new Error(`El plan ${id} no se puede pagar desde la app.`);
  return { ...plan, precio_uyu: Number(plan.precio_uyu) };
}

/** Los precios en pesos de los planes que se cobran, para mostrarlos en /crear/planes. */
export async function preciosEnPesos(): Promise<Partial<Record<PlanCobrable, number>>> {
  const s = supabaseServicio();
  if (!s) return {};
  const { data } = await s.from("planes").select("id, precio_uyu").in("id", ["marca", "mensual"]);
  return Object.fromEntries((data ?? []).filter((p) => p.precio_uyu).map((p) => [p.id, Number(p.precio_uyu)]));
}

/**
 * Arma el cobro de un plan para una persona y devuelve la dirección de Mercado Pago a la que hay que mandarla.
 * `origen` es la dirección de la app desde donde se pidió (app.brandiamos.com, el link de prueba o la compu).
 */
export async function empezarCobro(plan: PlanCobrable, usuario: { id: string; mail: string | null }, origen: string) {
  const datos = await leerPlan(plan);
  const prueba = enModoPrueba();
  const mail = prueba ? process.env.MERCADOPAGO_COMPRADOR_PRUEBA || usuario.mail : usuario.mail;
  if (!mail) throw new Error("Tu cuenta no tiene mail: no se puede cobrar.");

  // Si ya tiene el plan activo, no se cobra dos veces
  const { data: activa } = await base()
    .from("suscripciones")
    .select("id")
    .eq("usuario", usuario.id)
    .eq("plan", plan)
    .eq("estado", "activa")
    .limit(1);
  if (activa?.length) throw new Error("Ya tenés este plan activo.");

  const { data: fila, error } = await base()
    .from("suscripciones")
    .insert({ usuario: usuario.id, plan, estado: "pendiente", proveedor: "mercadopago", prueba })
    .select("id")
    .single();
  if (error || !fila) throw new Error(`No se pudo anotar la suscripción: ${error?.message}`);

  const vuelta = `${origen}/crear/cuenta?pago=${fila.id}`;
  // Mercado Pago no acepta volver a la compu (localhost): ahí vuelve a la web publicada y el aviso llega igual
  const vueltaValida = /^https:\/\//.test(origen) ? vuelta : `https://app.brandiamos.com/crear/cuenta?pago=${fila.id}`;
  const aviso = /^https:\/\//.test(origen) ? `${origen}/api/cobros/aviso` : undefined;

  let idMp: string;
  let url: string;
  if (plan === "mensual") {
    const r = await mp<{ id: string; init_point: string }>("POST", "/preapproval", {
      reason: `BrandIA · ${datos.nombre}`,
      external_reference: fila.id,
      payer_email: mail,
      back_url: vueltaValida,
      status: "pending",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: datos.precio_uyu,
        currency_id: "UYU",
      },
    });
    idMp = r.id;
    url = r.init_point;
  } else {
    const r = await mp<{ id: string; init_point: string }>("POST", "/checkout/preferences", {
      items: [
        { id: plan, title: `BrandIA · ${datos.nombre}`, quantity: 1, unit_price: datos.precio_uyu, currency_id: "UYU" },
      ],
      payer: { email: mail },
      external_reference: fila.id,
      back_urls: { success: vueltaValida, pending: vueltaValida, failure: vueltaValida },
      auto_return: "approved",
      ...(aviso ? { notification_url: aviso } : {}),
    });
    idMp = r.id;
    url = r.init_point;
  }

  await base().from("suscripciones").update({ proveedor_id: idMp }).eq("id", fila.id);
  return { url, suscripcion: fila.id as string };
}

// ─── Lo que avisa Mercado Pago ────────────────────────────────────────────────────────────────────────────────

/**
 * Comprueba la firma del aviso (x-signature) con la clave secreta de Webhooks. Si no hay clave configurada, deja
 * pasar: igual no se cree nada del aviso, se le pregunta a Mercado Pago (ver abajo).
 */
export function firmaValida(req: Request, idDelDato: string) {
  const secreto = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secreto) return true;
  const firma = req.headers.get("x-signature") ?? "";
  const pedido = req.headers.get("x-request-id") ?? "";
  const partes = Object.fromEntries(firma.split(",").map((p) => p.trim().split("=") as [string, string]));
  if (!partes.ts || !partes.v1) return false;
  const manifiesto = `id:${idDelDato.toLowerCase()};request-id:${pedido};ts:${partes.ts};`;
  const esperada = createHmac("sha256", secreto).update(manifiesto).digest("hex");
  const a = Buffer.from(esperada);
  const b = Buffer.from(partes.v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

type Preapproval = {
  id: string;
  status: "pending" | "authorized" | "paused" | "cancelled";
  external_reference?: string;
  next_payment_date?: string;
};

type Pago = {
  id: number;
  status: string;
  external_reference?: string;
  transaction_amount?: number;
  currency_id?: string;
  live_mode?: boolean;
  metadata?: { preapproval_id?: string };
  point_of_interaction?: { transaction_data?: { subscription_id?: string } };
};

const ESTADOS: Record<Preapproval["status"], string> = {
  pending: "pendiente",
  authorized: "activa",
  paused: "pausada",
  cancelled: "cancelada",
};

/** Le pregunta a Mercado Pago cómo está una suscripción mensual y la anota igual en la base. */
export async function actualizarSuscripcionMensual(idMp: string) {
  const p = await mp<Preapproval>("GET", `/preapproval/${encodeURIComponent(idMp)}`);
  await base()
    .from("suscripciones")
    .update({
      estado: ESTADOS[p.status] ?? "pendiente",
      // Si se canceló, Mercado Pago puede dejar de mandar la fecha: se conserva la última, hasta ahí está pago
      ...(p.next_payment_date ? { hasta: p.next_payment_date } : {}),
      actualizado: new Date().toISOString(),
    })
    .eq("proveedor_id", p.id);
  return p.status;
}

async function anotarCobro(pago: Pago, suscripcion: { id: string; usuario: string; prueba: boolean } | null) {
  await base()
    .from("cobros")
    .upsert(
      {
        proveedor: "mercadopago",
        proveedor_id: String(pago.id),
        estado: pago.status,
        monto: pago.transaction_amount ?? null,
        moneda: pago.currency_id ?? null,
        usuario: suscripcion?.usuario ?? null,
        suscripcion: suscripcion?.id ?? null,
        prueba: suscripcion?.prueba ?? pago.live_mode === false,
        datos: pago,
      },
      { onConflict: "proveedor_id" },
    );
}

/** Un pago avisado por Mercado Pago (el de "Tu marca" o el de cada mes de la suscripción). */
export async function actualizarPago(idPago: string) {
  const pago = await mp<Pago>("GET", `/v1/payments/${encodeURIComponent(idPago)}`);
  const idSuscripcionMp = pago.metadata?.preapproval_id ?? pago.point_of_interaction?.transaction_data?.subscription_id;
  const consulta = base().from("suscripciones").select("id, usuario, plan, prueba");
  const { data: fila } = idSuscripcionMp
    ? await consulta.eq("proveedor_id", idSuscripcionMp).maybeSingle()
    : pago.external_reference
      ? await consulta.eq("id", pago.external_reference).maybeSingle()
      : { data: null };
  await anotarCobro(pago, fila);
  if (!fila) return;
  if (fila.plan === "mensual" && idSuscripcionMp) {
    await actualizarSuscripcionMensual(idSuscripcionMp);
  } else if (fila.plan === "marca" && pago.status === "approved") {
    await base()
      .from("suscripciones")
      .update({ estado: "activa", actualizado: new Date().toISOString() })
      .eq("id", fila.id);
  } else if (fila.plan === "marca" && (pago.status === "refunded" || pago.status === "charged_back")) {
    await base()
      .from("suscripciones")
      .update({ estado: "cancelada", actualizado: new Date().toISOString() })
      .eq("id", fila.id);
  }
}

/** Un cobro mensual de una suscripción (aviso "subscription_authorized_payment"). */
export async function actualizarCobroMensual(idCobro: string) {
  const c = await mp<{ preapproval_id: string; payment?: { id: number } }>(
    "GET",
    `/authorized_payments/${encodeURIComponent(idCobro)}`,
  );
  if (c.payment?.id) await actualizarPago(String(c.payment.id));
  await actualizarSuscripcionMensual(c.preapproval_id);
}

/**
 * Cuando la persona vuelve de pagar: se mira en Mercado Pago cómo quedó su cobro, por si el aviso todavía no
 * llegó (o en la compu, donde Mercado Pago no puede avisar). Solo mira las filas de esa persona.
 */
export async function confirmarCobro(usuario: string, idSuscripcion: string) {
  const { data: fila } = await base()
    .from("suscripciones")
    .select("id, plan, estado, proveedor_id")
    .eq("id", idSuscripcion)
    .eq("usuario", usuario)
    .maybeSingle();
  if (!fila?.proveedor_id) return null;
  if (fila.plan === "mensual") {
    await actualizarSuscripcionMensual(fila.proveedor_id);
  } else if (fila.estado !== "activa") {
    // El pago único: se busca el pago con la referencia de esta fila
    const r = await mp<{ results: Pago[] }>(
      "GET",
      `/v1/payments/search?external_reference=${encodeURIComponent(fila.id)}&sort=date_created&criteria=desc`,
    );
    for (const p of r.results ?? []) await actualizarPago(String(p.id));
  }
  const { data: final } = await base().from("suscripciones").select("estado").eq("id", fila.id).single();
  return (final?.estado as string) ?? null;
}

/** Cancela la suscripción mensual de una persona en Mercado Pago (deja de cobrarse) y en la base. */
export async function cancelarSuscripcion(usuario: string) {
  const { data: filas } = await base()
    .from("suscripciones")
    .select("id, proveedor_id")
    .eq("usuario", usuario)
    .eq("plan", "mensual")
    .in("estado", ["activa", "pausada"]);
  for (const f of filas ?? []) {
    if (f.proveedor_id) await mp("PUT", `/preapproval/${encodeURIComponent(f.proveedor_id)}`, { status: "cancelled" });
    await base()
      .from("suscripciones")
      .update({ estado: "cancelada", actualizado: new Date().toISOString() })
      .eq("id", f.id);
  }
  return filas?.length ?? 0;
}
