// Prueba el módulo B de punta a punta, sin pantalla y sin servidor: llama directo al motor.
//
// Uso: npx tsx --tsconfig apps/web/tsconfig.json --env-file=.env.local scripts/probar-contenidos.ts <carpeta-de-salida> [--imagenes] [--solo=id]
//
// Recorre la app de punta a punta sin pantalla: otra IA inventa la ficha de cada negocio de prueba
// (como si saliera de la entrevista) y desde ahí corre lo real: /api/direcciones (se elige la A),
// /api/identidad y el lote de contenidos. Deja en la carpeta, por negocio, el JSON de todo, los
// SVG, index.html (piezas y textos) y galeria.html (solo las piezas).

import { generateText, Output } from "ai";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { POST as direccionesPOST } from "../apps/web/src/app/api/direcciones/route";
import { POST as identidadPOST } from "../apps/web/src/app/api/identidad/route";
import { briefSchema } from "../apps/web/src/lib/ia/brief";
import { componerPieza } from "../apps/web/src/lib/ia/contenidos/componer";
import type { Pieza } from "../apps/web/src/lib/ia/contenidos/esquemas";
import { armarKit, identidadEntradaSchema } from "../apps/web/src/lib/ia/contenidos/kit";
import { generarLote, type Evento } from "../apps/web/src/lib/ia/contenidos/motor";

const NEGOCIOS = [
  { id: "bicis", texto: "Taller de bicicletas y café en el Cordón, Montevideo, llamado Rayo. Arreglan bicis urbanas y venden café de especialidad mientras esperás. Público: gente de 25 a 40 que va en bici al trabajo. Marca joven, urbana y de barrio, sin nada de verde fluo. Habla de vos." },
  { id: "psicologa", texto: "Psicóloga clínica en Ciudad de México que atiende online a adultos con ansiedad. Su consultorio se llama Bahía. Quiere transmitir calma, cercanía y profesionalismo, nada de clichés de autoayuda ni cerebros. Habla de tú." },
  { id: "parrilla", texto: "Parrilla familiar en Salta, Argentina, se llama Don Ceferino, abierta hace 30 años, la renuevan los nietos. Carnes a la leña, empanadas salteñas, precios intermedios. Público: familias y turistas. Quieren algo tradicional pero no viejo. Habla de vos." },
];

const salida = process.argv[2];
if (!salida) throw new Error("Falta la carpeta de salida");
const conImagenes = process.argv.includes("--imagenes");
const solo = process.argv.find((a) => a.startsWith("--solo="))?.slice(7);

const llamar = async (ruta: (r: Request) => Promise<Response>, cuerpo: unknown) => {
  const r = await ruta(new Request("http://local", { method: "POST", body: JSON.stringify(cuerpo) }));
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
};

async function fixture(texto: string) {
  const { output: brief } = await generateText({
    model: "anthropic/claude-sonnet-5.5",
    output: Output.object({ schema: briefSchema }),
    prompt: `Inventá la ficha de marca de este negocio, como si saliera de una entrevista. tipo_proyecto "nueva", direccion_elegida null, version "0.2". Lo que no se dice, va a huecos.\n\n${texto}`,
  });
  const { direcciones } = await llamar(direccionesPOST, { brief });
  const { identidad } = await llamar(identidadPOST, { brief, direccion: direcciones[0] });
  return { brief, identidad: identidadEntradaSchema.parse(identidad), identidadCompleta: identidad };
}

for (const negocio of NEGOCIOS.filter((n) => !solo || n.id === solo)) {
  const dir = join(salida, negocio.id);
  mkdirSync(dir, { recursive: true });
  console.log(`\n━━ ${negocio.id} ━━`);
  const t0 = Date.now();
  const { brief, identidad, identidadCompleta } = await fixture(negocio.texto);
  const kit = armarKit(identidad, brief);
  console.log(`ficha, direcciones e identidad: ${Math.round((Date.now() - t0) / 1000)} s · ${kit.nombre} · ${kit.tipografias.titulos.familia} ${kit.tipografias.titulos.peso} + ${kit.tipografias.texto.familia}`);

  const eventos: Evento[] = [];
  const piezas: Pieza[] = [];
  const imagenes: Record<string, Record<string, string>> = {};
  for await (const e of generarLote({ brief, kit, imagenes: conImagenes })) {
    eventos.push(e);
    const t = Math.round((Date.now() - t0) / 1000);
    if (e.tipo === "progreso") console.log(`${t}s · ${e.mensaje}`);
    if (e.tipo === "plan") console.log(`${t}s · plan: ${e.plan.pilares.map((p) => p.nombre).join(" / ")}`);
    if (e.tipo === "pieza") {
      piezas.push(e.pieza);
      const obs = e.pieza.observaciones.map((o) => `${o.gravedad}:${o.control}`).join(", ");
      console.log(`${t}s · ${e.pieza.id} ${e.pieza.formato} → ${e.pieza.estado} (intentos ${e.pieza.intentos})${obs ? ` [${obs}]` : ""}`);
    }
    if (e.tipo === "imagen") {
      (imagenes[e.pieza] ??= {})[e.clave] = e.url;
      console.log(`${t}s · imagen ${e.pieza}/${e.clave}`);
    }
    if (e.tipo === "error") console.log(`${t}s · ERROR ${e.donde}: ${e.mensaje}`);
    if (e.tipo === "fin") console.log(`fin: ${e.segundos}s · ${e.imagenes} imágenes · tokens ${e.uso.entrada}/${e.uso.salida} · USD ${e.uso.usd.toFixed(3)}`);
  }

  const lienzos = piezas
    .sort((a, b) => a.id.localeCompare(b.id, "es", { numeric: true }))
    .map((p) => ({ p, ls: componerPieza(p, kit, imagenes[p.id]) }));
  for (const { p, ls } of lienzos) for (const l of ls) writeFileSync(join(dir, `${p.id}-${l.clave}.svg`), l.svg);

  const fuentes = kit.fuentes.map((u) => `<link rel="stylesheet" href="${u}">`).join("");
  const html = `<!doctype html><meta charset="utf-8"><title>${kit.nombre} · feed de prueba</title>${fuentes}
<style>body{font:14px system-ui;margin:24px;background:#eee}section{margin:0 0 40px}.fila{display:flex;gap:12px;overflow-x:auto}.fila svg{width:270px;height:auto;flex:none;border-radius:6px;box-shadow:0 1px 4px #0003}pre{white-space:pre-wrap;background:#fff;padding:10px;max-width:900px;font-size:12px}</style>
<h1>${kit.nombre}</h1><p>${kit.esencia}</p>
${lienzos.map(({ p, ls }) => `<section><h2>${p.id} · ${p.formato} · ${p.plan.dia} ${p.plan.hora} · ${p.estado}</h2><p>${p.plan.idea}</p><div class="fila">${ls.map((l) => l.svg).join("")}</div><pre>${JSON.stringify({ contenido: p.contenido, observaciones: p.observaciones }, null, 2).replace(/</g, "&lt;")}</pre></section>`).join("")}`;
  writeFileSync(join(dir, "index.html"), html);
  // Solo las piezas, chicas, para mirar el feed de un vistazo (o sacarle una captura).
  const galeria = `<!doctype html><meta charset="utf-8">${fuentes}<style>body{margin:16px;background:#ddd;font:12px system-ui}.f{display:flex;gap:8px;margin-bottom:10px;align-items:flex-start}.f svg{width:200px;height:auto;flex:none}</style>${lienzos.map(({ p, ls }) => `<div class="f"><b style="width:60px">${p.id}<br>${p.formato}</b>${ls.map((l) => l.svg).join("")}</div>`).join("")}`;
  writeFileSync(join(dir, "galeria.html"), galeria);
  writeFileSync(join(dir, "resultado.json"), JSON.stringify({ brief, identidad: identidadCompleta, kit, eventos: eventos.filter((e) => e.tipo !== "imagen") }, null, 2));
  console.log(`listo: ${join(dir, "index.html")}`);
}
