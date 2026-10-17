// Simula entrevistas completas contra /api/entrevista: otra IA hace de cliente.
// Uso, con la web corriendo (npm run dev:web): node --env-file=.env.local scripts/probar-entrevista.mjs [archivo-de-salida.json]
import { generateText } from "ai";
import { writeFileSync } from "node:fs";

const URL = "http://localhost:3001/api/entrevista";

const PERSONAS = [
  {
    id: "panaderia",
    rol: "Sos Lucía, dueña de una panadería de masa madre en Pocitos, Montevideo, que se llama Miga. Abriste hace 6 meses, vendés en el local y por Instagram. Tu cliente: gente de 25 a 45 que valora lo natural. Te gusta Aesop y Le Pain Quotidien. Odiás el rosa chicle. Querés algo cálido, artesanal y honesto.",
    primero: "Hola! Tengo una panadería de masa madre en Pocitos, se llama Miga. Quiero una marca de verdad, hoy tengo un logo que hizo mi primo.",
  },
  {
    id: "abogada",
    rol: "Sos Valeria, abogada laboralista independiente en Córdoba, Argentina. No tenés nombre de marca, usás tu nombre. Atendés a trabajadores despedidos, cobrás accesible. Querés transmitir confianza y cercanía, no frialdad de estudio grande. No sabés de colores, respondés corto y a veces 'no sé'.",
    primero: "buenas, soy abogada laboral y necesito una imagen para redes, no tengo nada",
  },
  {
    id: "gym",
    rol: "Sos Martín, dueño de un gimnasio de crossfit en Maldonado llamado Hierro Box. Ya tenés marca hace 5 años (logo negro con una pesa) y la querés renovar porque se ve vieja. Te gusta Nike y Gymshark. Público: 20 a 35, competitivos. Querés energía, comunidad y nada de verde. Contestás con muchos datos de una.",
    primero: "Qué tal. Tengo Hierro Box, un box de crossfit en Maldonado hace 5 años. El logo es negro con una pesa y se ve re viejo, lo quiero renovar. Mi gente es de 20 a 35, muy competitiva, onda comunidad. Me encanta Nike.",
  },
];

async function turnoBrandIA(messages) {
  const t0 = Date.now();
  const res = await fetch(URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages }) });
  const raw = await res.text();
  let texto = "";
  let ficha = null;
  for (const linea of raw.split("\n")) {
    if (!linea.startsWith("data: ")) continue;
    const dato = linea.slice(6);
    if (dato === "[DONE]") continue;
    let ev;
    try { ev = JSON.parse(dato); } catch { continue; }
    if (ev.type === "text-delta") texto += ev.delta;
    if (ev.type === "tool-input-available" && ev.toolName === "terminar_entrevista") ficha = ev.input;
    if (ev.type === "error") texto += `\n[ERROR] ${ev.errorText}`;
  }
  return { texto, ficha, segundos: ((Date.now() - t0) / 1000).toFixed(1) };
}

async function simular(p) {
  const messages = [{ id: "u0", role: "user", parts: [{ type: "text", text: p.primero }] }];
  const log = [`### ${p.id}`, `CLIENTE: ${p.primero}`];
  for (let i = 0; i < 8; i++) {
    const r = await turnoBrandIA(messages);
    log.push(`BRANDIA (${r.segundos}s): ${r.texto}`);
    messages.push({ id: `a${i}`, role: "assistant", parts: [{ type: "text", text: r.texto }] });
    if (r.ficha) return { log, ficha: r.ficha, turnos: i + 1 };
    const charla = messages.map((m) => `${m.role === "user" ? "VOS" : "BRANDIA"}: ${m.parts[0].text}`).join("\n");
    const resp = await generateText({
      model: "anthropic/claude-haiku-5.5",
      instructions: `${p.rol}\nEstás chateando con BrandIA. Respondé como esta persona, corto y natural, en español rioplatense. Si te muestran un resumen y está bien, confirmalo.`,
      prompt: `${charla}\n\nTu respuesta:`,
    });
    log.push(`CLIENTE: ${resp.text}`);
    messages.push({ id: `u${i + 1}`, role: "user", parts: [{ type: "text", text: resp.text }] });
  }
  return { log, ficha: null, turnos: 8 };
}

const resultados = await Promise.all(PERSONAS.map(simular));
for (const r of resultados) {
  console.log(r.log.join("\n\n"));
  console.log(`\n>>> turnos: ${r.turnos} · ficha: ${r.ficha ? "SÍ" : "NO"}`);
  if (r.ficha) console.log(JSON.stringify(r.ficha, null, 1));
  console.log("\n==========================================\n");
}
writeFileSync(process.argv[2] ?? "resultado-entrevistas.json", JSON.stringify(resultados, null, 2));
