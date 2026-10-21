import { cancelarSuscripcion, hayCobro } from "@/lib/mercadopago";
import { usuarioActual } from "@/lib/suscripcion-activa";

// Cobros: la persona cancela su plan mensual desde su cuenta. Mercado Pago deja de cobrarle y el plan sigue
// andando hasta el final del mes que ya pagó. No usa IA. Sale: { canceladas }.

export async function POST() {
  if (!hayCobro()) return Response.json({ error: "Todavía no se puede pagar desde la app." }, { status: 503 });
  const usuario = await usuarioActual();
  if (!usuario) return Response.json({ error: "Entrá a tu cuenta." }, { status: 401 });
  try {
    return Response.json({ canceladas: await cancelarSuscripcion(usuario.id) });
  } catch (e) {
    console.error("[cobros] no se pudo cancelar:", e instanceof Error ? e.message : e);
    return Response.json({ error: "No pudimos cancelar. Probá de nuevo en un rato." }, { status: 502 });
  }
}
