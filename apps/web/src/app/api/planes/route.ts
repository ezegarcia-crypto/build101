import { clienteValido, HEADER_CLIENTE } from "@/lib/cliente";
import { anotarInteresado, interesadoSchema } from "@/lib/planes";

// Planes: guarda a quien se anota para un plan (todavía no se cobra). No usa IA.
// Entra: { plan, nombre, contacto, marca?, sitio? }. Sale: { ok: true }.
// `sitio` es un campo escondido que una persona nunca completa: si viene lleno, es un robot y no se guarda.

const MAXIMO = 4_000; // bytes

export async function POST(req: Request) {
  const texto = await req.text();
  if (new TextEncoder().encode(texto).length > MAXIMO) {
    return Response.json({ error: "El pedido es demasiado grande." }, { status: 413 });
  }

  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    return Response.json({ error: "No entendimos el pedido." }, { status: 400 });
  }
  if (typeof cuerpo.sitio === "string" && cuerpo.sitio.trim()) return Response.json({ ok: true });

  const datos = interesadoSchema.safeParse(cuerpo);
  if (!datos.success) {
    return Response.json({ error: datos.error.issues[0]?.message ?? "Revisá los datos." }, { status: 400 });
  }

  try {
    await anotarInteresado(datos.data, clienteValido(req.headers.get(HEADER_CLIENTE)));
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[api/planes]", error);
    return Response.json({ error: "No pudimos anotarte. Probá de nuevo en un rato." }, { status: 502 });
  }
}
