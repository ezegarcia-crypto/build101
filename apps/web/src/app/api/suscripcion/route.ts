import { tieneSuscripcion } from "@/lib/suscripcion";

// Si este navegador tiene el plan "Tu marca andando". Lo pregunta la pantalla del feed para saber si arma la
// semana de prueba o el mes completo. Sale de la misma función que frena al servidor (lib/suscripcion.ts). No usa IA.

export async function GET() {
  return Response.json({ activa: await tieneSuscripcion() }, { headers: { "cache-control": "no-store" } });
}
