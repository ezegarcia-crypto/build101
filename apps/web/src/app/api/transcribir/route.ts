// El audio de la persona pasa a texto con ElevenLabs Scribe, para mandarlo a la entrevista por chat.
// BrandIA no habla: la persona cuenta su negocio con un audio y la entrevista sigue por escrito.
// La clave (ELEVENLABS_API_KEY, con el permiso "De voz a texto") se queda en el servidor.
//
// POST /api/transcribir  (form-data, campo "audio")  →  { texto }
// El audio y su texto quedan guardados con el resto de la prueba (lib/pruebas.ts).

import { conGrabacion } from "@/lib/pruebas";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const API = "https://api.elevenlabs.io/v1/speech-to-text";
const MODELO = "scribe_v2";

// Frenos de gasto: cada audio cobra créditos de ElevenLabs (no del Gateway, por eso no pasa por medir()).
// 5 MB alcanzan para unos 5 minutos de audio del navegador; la pantalla corta la grabación a los 3.
const MAXIMO_BYTES = 5 * 1024 * 1024;
const AUDIOS_POR_MINUTO = 20; // por servidor, como en lib/ia/gastos.ts: varios jurados a la vez
let recientes: number[] = [];

export const POST = conGrabacion("transcribir", async (req: Request) => {
  const clave = process.env.ELEVENLABS_API_KEY;
  if (!clave) {
    return Response.json({ error: "Falta ELEVENLABS_API_KEY en las variables de entorno." }, { status: 503 });
  }

  const ahora = Date.now();
  recientes = recientes.filter((t) => ahora - t < 60_000);
  if (recientes.length >= AUDIOS_POR_MINUTO) {
    console.warn(`[gastos] frenado: más de ${AUDIOS_POR_MINUTO} audios por minuto`);
    return Response.json(
      {
        error: "Recibimos muchos audios seguidos. Esperá un minuto y probá de nuevo.",
      },
      { status: 429 },
    );
  }

  const audio = (await req.formData().catch(() => null))?.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) {
    return Response.json({ error: "No llegó el audio." }, { status: 400 });
  }
  if (audio.size > MAXIMO_BYTES) {
    return Response.json({ error: "El audio es muy largo. Probá con uno de hasta 3 minutos." }, { status: 413 });
  }
  recientes.push(ahora);

  const pedido = new FormData();
  pedido.set("model_id", MODELO);
  pedido.set("language_code", "spa");
  pedido.set("tag_audio_events", "false"); // sin "(risas)" ni "(ruido)" en el texto
  pedido.set("file", audio, "audio");

  const res = await fetch(API, {
    method: "POST",
    headers: { "xi-api-key": clave },
    body: pedido,
    signal: req.signal,
  });
  if (!res.ok) {
    console.error("ElevenLabs respondió", res.status, await res.text());
    return Response.json({ error: "No pudimos entender el audio. Probá de nuevo o escribilo." }, { status: 502 });
  }

  const { text } = (await res.json()) as { text?: string };
  const texto = text?.trim() ?? "";
  if (!texto) {
    return Response.json(
      {
        error: "No se escuchó nada en el audio. Probá de nuevo más cerca del micrófono.",
      },
      { status: 422 },
    );
  }
  return Response.json({ texto });
});
