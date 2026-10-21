import { entradaMes, leer } from "@/app/api/contenidos/entrada";
import { clienteValido, HEADER_CLIENTE } from "@/lib/cliente";
import { hayDondeGuardarMeses, leerMes, type Mes, paraLaPantalla, trabajando } from "@/lib/feed-mensual";
import { SEMANAS_MES } from "@/lib/ia/contenidos/formatos";
import { armarKit } from "@/lib/ia/contenidos/kit";
import { fijarCorrida, medir } from "@/lib/ia/gastos";
import { tieneSuscripcion } from "@/lib/suscripcion";

import { correrDespues, hayParaReintentar, terminado, tomar, trabado } from "./trabajo";

// El mes completo del suscriptor ("Tu marca andando"): todas las piezas del plan de 4 semanas, con la marca, el
// estilo elegido y el control de datos inventados. Solo para quien tiene suscripción (lib/suscripcion.ts).
//
// POST { brief, identidad, estilo?, gustaron?, inicio } → { id }. Responde enseguida y el servidor lo arma de a
//   una semana (la primera planifica el mes), guardando todo en Supabase a medida que sale (lib/feed-mensual.ts).
// GET ?id= → { mes, vivo, trabado, terminado, reintentable }. La pantalla lo pide cada pocos segundos. No usa IA.
// Para seguir si se trabó, o reintentar lo que no salió: POST /api/contenidos/mes/seguir.
// Todo el mes queda anotado como una sola corrida del paso "contenidos-mes" en /costos.

export const maxDuration = 300;

const NO_SUSCRIPTO = {
  error: "El mes completo es parte del plan Tu marca andando.",
  plan: "mensual",
};

/** El inicio tiene que ser un lunes cercano: de hace 2 días a dentro de 10 */
function inicioValido(inicio: string) {
  const [a, m, d] = inicio.split("-").map(Number);
  const fecha = Date.UTC(a!, m! - 1, d!);
  const dias = (fecha - Date.now()) / 86_400_000;
  return new Date(fecha).getUTCDay() === 1 && dias > -3 && dias < 10;
}

export const POST = medir("contenidos-mes", async (req: Request) => {
  if (!(await tieneSuscripcion())) return Response.json(NO_SUSCRIPTO, { status: 403 });
  if (!hayDondeGuardarMeses()) return Response.json({ error: "Falta conectar dónde guardar el mes." }, { status: 503 });

  const entrada = await leer(req, entradaMes);
  if (entrada instanceof Response) return entrada;
  if (!inicioValido(entrada.inicio)) return Response.json({ error: "El mes tiene que empezar un lunes de estos días." }, { status: 400 });

  const id = crypto.randomUUID();
  fijarCorrida(id);
  const ahora = new Date().toISOString();
  const { inicio, ...resto } = entrada;
  const mes: Mes = {
    id,
    creado: ahora,
    actualizado: ahora,
    inicio,
    cliente: clienteValido(req.headers.get(HEADER_CLIENTE)),
    entrada: resto,
    kit: armarKit(entrada.identidad, entrada.brief, entrada.estilo),
    plan: null,
    piezas: {},
    imagenes: {},
    fallas: {},
    semanas: Array.from({ length: SEMANAS_MES }, (_, i) => ({ semana: i + 1, estado: "pendiente", intentos: 0, usd: 0 })),
    trabajo: null,
    uso: { entrada: 0, salida: 0, usd: 0 },
    fotos_hechas: 0,
  };

  const tomado = await tomar(mes, { que: "semana", semana: 1 });
  if (typeof tomado === "string") return Response.json({ error: tomado }, { status: 409 });
  correrDespues(tomado, { que: "semana", semana: 1 }, req);
  return Response.json({ id }, { status: 202 });
});

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!hayDondeGuardarMeses()) return Response.json({ error: "Falta conectar dónde guardar el mes." }, { status: 503 });
  const mes = await leerMes(id).catch(() => null);
  if (!mes) return Response.json({ error: "No encontramos ese mes." }, { status: 404 });
  return Response.json(
    {
      mes: paraLaPantalla(mes),
      vivo: trabajando(mes),
      trabado: trabado(mes),
      terminado: terminado(mes),
      reintentable: hayParaReintentar(mes),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
