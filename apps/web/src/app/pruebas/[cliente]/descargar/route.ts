import { leerCliente } from "@/lib/pruebas";

// La prueba entera de un cliente en un archivo JSON, para guardarla o analizarla después.
// Pide la misma contraseña que el panel (proxy.ts).

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente } = await params;
  try {
    const pedidos = await leerCliente(cliente);
    return new Response(JSON.stringify({ cliente, pedidos }, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="prueba-${cliente.replace(/[^a-z0-9-]/g, "")}.json"`,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
