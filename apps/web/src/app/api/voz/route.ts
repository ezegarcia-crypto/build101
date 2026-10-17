// La llave para que la pantalla hable con el agente de voz de ElevenLabs.
// La clave (ELEVENLABS_API_KEY) se queda en el servidor: al navegador solo le llega un permiso
// de un solo uso que vence a los pocos minutos.
//
// GET /api/voz                 → { signedUrl }          conexión por WebSocket (anda en cualquier red)
// GET /api/voz?conexion=webrtc → { conversationToken }  conexión por WebRTC (mejor audio, pero algunas redes la bloquean)

export const dynamic = "force-dynamic";

const API = "https://api.elevenlabs.io/v1/convai/conversation";

// Freno de gasto: cada permiso abre una llamada que cobra créditos de ElevenLabs (no del Gateway,
// por eso no pasa por medir()). Tope por servidor, como en lib/ia/gastos.ts: alcanza para varios
// jurados a la vez y corta un loop que pida llamadas sin parar.
const LLAMADAS_POR_MINUTO = 10;
let recientes: number[] = [];

export async function GET(req: Request) {
  const ahora = Date.now();
  recientes = recientes.filter((t) => ahora - t < 60_000);
  if (recientes.length >= LLAMADAS_POR_MINUTO) {
    console.warn(`[gastos] frenado: más de ${LLAMADAS_POR_MINUTO} llamadas de voz por minuto`);
    return Response.json(
      { error: "Recibimos muchas llamadas seguidas. Esperá un minuto y probá de nuevo." },
      { status: 429 },
    );
  }
  recientes.push(ahora);

  const clave = process.env.ELEVENLABS_API_KEY;
  const agente = process.env.ELEVENLABS_AGENT_ID;
  if (!clave || !agente) {
    return Response.json(
      { error: "Falta ELEVENLABS_API_KEY o ELEVENLABS_AGENT_ID en las variables de entorno." },
      { status: 503 },
    );
  }

  const webrtc = new URL(req.url).searchParams.get("conexion") === "webrtc";
  const url = webrtc
    ? `${API}/token?agent_id=${encodeURIComponent(agente)}`
    : `${API}/get-signed-url?agent_id=${encodeURIComponent(agente)}`;

  const res = await fetch(url, { headers: { "xi-api-key": clave }, cache: "no-store" });
  if (!res.ok) {
    const detalle = await res.text();
    console.error("ElevenLabs respondió", res.status, detalle);
    return Response.json(
      { error: `ElevenLabs respondió ${res.status}. Revisá la clave y el ID del agente.` },
      { status: 502 },
    );
  }

  const datos = await res.json();
  return webrtc
    ? Response.json({ conversationToken: datos.token as string })
    : Response.json({ signedUrl: datos.signed_url as string });
}
