import { actualizarCobroMensual, actualizarPago, actualizarSuscripcionMensual, firmaValida } from "@/lib/mercadopago";

// Cobros: el aviso (webhook) de Mercado Pago cuando algo cambia: se pagó, se cobró el mes, se canceló. No usa IA.
// La dirección se carga en el panel de Mercado Pago (Tu aplicación → Webhooks): https://app.brandiamos.com/api/cobros/aviso
// con los eventos "Pagos", "Planes y suscripciones" (suscripciones y pagos recurrentes).
// No se cree lo que dice el aviso: solo se toma el id y se le pregunta a Mercado Pago cómo quedó (lib/mercadopago.ts).
// Contesta 200 rápido aunque no le interese el aviso; si falla algo de nuestro lado, 500 y Mercado Pago reintenta.

export async function POST(req: Request) {
  const url = new URL(req.url);
  const cuerpo = (await req.json().catch(() => ({}))) as { type?: string; topic?: string; data?: { id?: string | number } };
  const tipo = cuerpo.type ?? cuerpo.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic") ?? "";
  const id = String(cuerpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  if (!id) return Response.json({ ok: true });
  if (!firmaValida(req, url.searchParams.get("data.id") ?? id)) {
    return Response.json({ error: "Firma inválida." }, { status: 401 });
  }

  try {
    if (tipo === "payment") await actualizarPago(id);
    else if (tipo === "subscription_preapproval" || tipo === "preapproval") await actualizarSuscripcionMensual(id);
    else if (tipo === "subscription_authorized_payment" || tipo === "authorized_payment") await actualizarCobroMensual(id);
    return Response.json({ ok: true });
  } catch (e) {
    console.error(`[cobros] aviso ${tipo} ${id}:`, e instanceof Error ? e.message : e);
    return Response.json({ error: "No se pudo procesar el aviso." }, { status: 500 });
  }
}
