import { clienteValido, HEADER_CLIENTE } from "@/lib/cliente";
import { guardarPedido, pedidoSchema } from "@/lib/pedidos";

// BranderIA: guarda el pedido del kit (productos, cantidades y datos de la persona). No usa IA ni cobra.
// Entra: { nombre, contacto, entrega, nota?, marca, colores, items: [{ nombre, detalle, tecnica, estampa, cantidad }], sitio? }.
// Sale: { id, numero, creado }. `sitio` es un campo escondido que una persona nunca completa: si viene lleno, es un robot.

const MAXIMO = 30_000; // bytes

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
  if (typeof cuerpo.sitio === "string" && cuerpo.sitio.trim()) return Response.json({ error: "No entendimos el pedido." }, { status: 400 });

  const datos = pedidoSchema.safeParse(cuerpo);
  if (!datos.success) {
    return Response.json({ error: datos.error.issues[0]?.message ?? "Revisá los datos." }, { status: 400 });
  }

  try {
    const pedido = await guardarPedido(datos.data, clienteValido(req.headers.get(HEADER_CLIENTE)));
    return Response.json(pedido);
  } catch (error) {
    console.error("[api/branderia/pedido]", error);
    return Response.json({ error: "No pudimos guardar tu pedido. Probá de nuevo en un rato." }, { status: 502 });
  }
}
