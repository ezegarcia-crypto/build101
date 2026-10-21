import { empezarCobro, hayCobro } from "@/lib/mercadopago";
import { usuarioActual } from "@/lib/suscripcion-activa";

// Cobros: arma el pago de un plan en Mercado Pago y devuelve a dónde mandar a la persona. No usa IA.
// Entra: { plan: "marca" | "mensual" }. Sale: { url } (la página de pago de Mercado Pago).
// Hay que haber entrado a la cuenta: el pago queda a nombre de esa cuenta.

export async function POST(req: Request) {
  if (!hayCobro()) return Response.json({ error: "Todavía no se puede pagar desde la app." }, { status: 503 });
  const usuario = await usuarioActual();
  if (!usuario) return Response.json({ error: "Entrá a tu cuenta para suscribirte.", cuenta: true }, { status: 401 });

  const cuerpo = (await req.json().catch(() => ({}))) as { plan?: unknown };
  if (cuerpo.plan !== "marca" && cuerpo.plan !== "mensual") {
    return Response.json({ error: "Ese plan no se paga desde la app." }, { status: 400 });
  }
  try {
    const { url } = await empezarCobro(cuerpo.plan, usuario, new URL(req.url).origin);
    return Response.json({ url });
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : String(e);
    console.error("[cobros] no se pudo empezar el cobro:", mensaje);
    if (mensaje.startsWith("Ya tenés")) return Response.json({ error: mensaje }, { status: 409 });
    return Response.json({ error: "No pudimos abrir Mercado Pago. Probá de nuevo en un rato." }, { status: 502 });
  }
}
