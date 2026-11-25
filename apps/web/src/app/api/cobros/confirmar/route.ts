import { confirmarCobro, hayCobro } from "@/lib/mercadopago";
import { usuarioActual } from "@/lib/suscripcion-activa";

// Cobros: cuando la persona vuelve de Mercado Pago, la cuenta pregunta cómo quedó su pago. El servidor se lo
// pregunta a Mercado Pago (no al navegador) y actualiza la suscripción. No usa IA.
// Entra: { suscripcion } (el id que vuelve en ?pago=). Sale: { estado } (pendiente, activa, pausada, cancelada).

export async function POST(req: Request) {
  if (!hayCobro()) return Response.json({ error: "Todavía no se puede pagar desde la app." }, { status: 503 });
  const usuario = await usuarioActual();
  if (!usuario) return Response.json({ error: "Entrá a tu cuenta." }, { status: 401 });
  const { suscripcion } = (await req.json().catch(() => ({}))) as { suscripcion?: unknown };
  if (typeof suscripcion !== "string" || !/^[0-9a-f-]{36}$/.test(suscripcion)) {
    return Response.json({ error: "No entendimos el pedido." }, { status: 400 });
  }
  try {
    return Response.json({ estado: await confirmarCobro(usuario.id, suscripcion) });
  } catch (e) {
    console.error("[cobros] no se pudo confirmar:", e instanceof Error ? e.message : e);
    return Response.json({ error: "No pudimos confirmar el pago todavía." }, { status: 502 });
  }
}
