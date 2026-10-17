// Crea (o actualiza) el agente de voz de BrandIA en ElevenLabs con el prompt de apps/web/src/lib/ia/voz.ts.
//
// Uso, desde la raíz del repo:
//   npx tsx --env-file=apps/web/.env.local scripts/crear-agente-voz.ts
//
// - Sin ELEVENLABS_AGENT_ID en apps/web/.env.local: crea el agente y muestra su ID para que lo copies ahí.
// - Con ELEVENLABS_AGENT_ID: actualiza ese agente (prompt, primer mensaje, idioma y modelo).
//   La voz elegida en el panel no se toca, salvo que pongas ELEVENLABS_VOICE_ID en apps/web/.env.local.
// - Con --ver: muestra lo que se mandaría, sin mandar nada.

import {
  LLM_VOZ,
  MODELO_TTS_VOZ,
  NOMBRE_AGENTE_VOZ,
  PRIMER_MENSAJE_VOZ,
  PROMPT_VOZ,
} from "../apps/web/src/lib/ia/voz.ts";

const API = "https://api.elevenlabs.io/v1/convai/agents";
const clave = process.env.ELEVENLABS_API_KEY;
const agente = process.env.ELEVENLABS_AGENT_ID;
const voz = process.env.ELEVENLABS_VOICE_ID;
const soloVer = process.argv.includes("--ver");

const configuracion = {
  name: NOMBRE_AGENTE_VOZ,
  conversation_config: {
    agent: {
      language: "es",
      first_message: PRIMER_MENSAJE_VOZ,
      prompt: {
        prompt: PROMPT_VOZ,
        llm: LLM_VOZ,
        // end_call: el agente corta la llamada solo, después de la despedida.
        built_in_tools: {
          end_call: { name: "end_call", description: "", params: { system_tool_type: "end_call" } },
        },
      },
    },
    // Al crear: modelo multilingüe y, si hay, la voz elegida. Al actualizar: solo la voz, si se pidió.
    ...(agente
      ? voz
        ? { tts: { voice_id: voz } }
        : {}
      : { tts: { model_id: MODELO_TTS_VOZ, ...(voz ? { voice_id: voz } : {}) } }),
  },
};

if (soloVer) {
  console.log(agente ? `Actualizaría el agente ${agente} con:` : "Crearía un agente nuevo con:");
  console.log(JSON.stringify(configuracion, null, 2));
  process.exit(0);
}

if (!clave) {
  console.error("Falta ELEVENLABS_API_KEY en apps/web/.env.local.");
  process.exit(1);
}

const res = await fetch(agente ? `${API}/${agente}` : `${API}/create`, {
  method: agente ? "PATCH" : "POST",
  headers: { "xi-api-key": clave, "content-type": "application/json" },
  body: JSON.stringify(configuracion),
});
const respuesta = await res.text();

if (!res.ok) {
  console.error(`ElevenLabs respondió ${res.status}:`);
  console.error(respuesta);
  process.exit(1);
}

if (agente) {
  console.log(`Listo: el agente ${agente} quedó actualizado.`);
} else {
  const { agent_id } = JSON.parse(respuesta) as { agent_id: string };
  console.log("Listo: agente creado.");
  console.log("Agregá esta línea a apps/web/.env.local:");
  console.log(`ELEVENLABS_AGENT_ID=${agent_id}`);
}
