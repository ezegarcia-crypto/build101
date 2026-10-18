// Arma el video del pitch con la grabación de un caso de la corrida de noche, acelerando distinto según qué pasa
// en cada momento (lo anota correr.mjs en marcas.json): las esperas de la IA van muy rápido, lo que se escribe
// rápido, los scrolls apenas acelerados y los resultados a velocidad normal, para que se puedan ver. Si no entra
// en el tiempo, acelera más lo que no es resultado. El WhatsApp enviado va como una ventana sobre la app.
//
//   node editar.mjs salida/<fecha>/<caso>              → video.mp4 en esa carpeta (máximo 1:55)
//   node editar.mjs salida/<fecha>/<caso> --tope=110   → otro largo máximo, en segundos

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const carpeta = resolve(args.find((a) => !a.startsWith("--")) ?? "");
const TOPE = Number(args.find((a) => a.startsWith("--tope="))?.split("=")[1] ?? 115);
// El recorte del WhatsApp (x,y,ancho,alto en el video de WhatsApp) y desde cuándo, respecto del envío
const RECORTE_WA = args.find((a) => a.startsWith("--wa-recorte="))?.split("=")[1]?.split(",").map(Number);
const DESDE_WA = Number(args.find((a) => a.startsWith("--wa-desde="))?.split("=")[1] ?? -1.2);
const SALIDA_ANCHO = 1920;
const SALIDA_ALTO = 1080;

const video = readdirSync(carpeta).find((f) => f.endsWith(".webm") && f !== "whatsapp.webm");
if (!video) throw new Error(`No hay video en ${carpeta}`);
const { fin, lista } = JSON.parse(readFileSync(join(carpeta, "marcas.json"), "utf8"));

const ff = (...a) => execFileSync("ffmpeg", ["-v", "error", "-y", ...a], { stdio: "inherit" });
const duracion = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
const tamano = (f) =>
  execFileSync("ffprobe", ["-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height", "-of", "csv=p=0", f])
    .toString()
    .trim()
    .split(",")
    .map(Number);

const original = join(carpeta, video);
const [ANCHO, ALTO] = tamano(original);
// El video y el reloj no avanzan exactamente igual: se reparte la diferencia en forma pareja
const k = duracion(original) / (fin / 1000);

// ---- Los tramos: cada momento marcado, y lo que queda entre medio es "otro" ----

const PRIORIDAD = { resultado: 5, portada: 4, escribe: 3, scroll: 2, espera: 1 };
const marcas = lista.filter((m) => PRIORIDAD[m.tipo]).sort((a, b) => a.ini - b.ini);
const tramos = [];
let t = 0;
for (const m of marcas) {
  const ini = Math.max(m.ini / 1000, t);
  const fn = m.fin / 1000;
  if (fn <= ini) continue;
  if (ini > t) tramos.push({ tipo: "otro", ini: t, fin: ini });
  tramos.push({ tipo: m.tipo, ini, fin: fn, que: m.que });
  t = fn;
}
if (fin / 1000 > t) tramos.push({ tipo: "otro", ini: t, fin: fin / 1000 });
// Los tramos donde la imagen no se mueve (un scroll que no movió nada, una pantalla esperando) van como espera:
// ffmpeg marca los momentos quietos de más de 1,5 s en el video original
const quietos = [];
{
  // ffmpeg escribe lo que detecta en stderr
  const salida = spawnSync("ffmpeg", ["-hide_banner", "-i", original, "-vf", "freezedetect=n=0.02:d=1.5", "-map", "0:v", "-f", "null", "-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  }).stderr;
  let ini = null;
  for (const linea of salida.split("\n")) {
    const a = linea.match(/freeze_start: ([\d.]+)/);
    const b = linea.match(/freeze_end: ([\d.]+)/);
    if (a) ini = Number(a[1]) / k;
    if (b && ini !== null) { quietos.push([ini, Number(b[1]) / k]); ini = null; }
  }
  if (ini !== null) quietos.push([ini, fin / 1000]);
}
const quieto = (ini, fn) => quietos.reduce((s, [a, b]) => s + Math.max(0, Math.min(b, fn) - Math.max(a, ini)), 0) / Math.max(0.001, fn - ini);
for (const tr of tramos) if ((tr.tipo === "scroll" || tr.tipo === "otro") && tr.fin - tr.ini > 3 && quieto(tr.ini, tr.fin) > 0.6) tr.tipo = "espera";
console.log(`Momentos quietos: ${quietos.length}`);
// Los tramitos de menos de medio segundo se suman al anterior (en el video no se notan y son muchos cortes)
const limpios = [];
for (const tr of tramos) {
  const prev = limpios.at(-1);
  if (prev && tr.fin - tr.ini < 0.5) prev.fin = tr.fin;
  else limpios.push({ ...tr });
}

// ---- El WhatsApp: dónde va y cuánto dura ----

const aca = lista.find((m) => m.tipo === "whatsapp-aca");
const waVideo = join(carpeta, "whatsapp.webm");
const waDatos = existsSync(join(carpeta, "whatsapp.json")) ? JSON.parse(readFileSync(join(carpeta, "whatsapp.json"), "utf8")) : null;
const conWhatsApp = aca && existsSync(waVideo) && waDatos;
const WA_LARGO = conWhatsApp ? 7 : 0;

// ---- Las velocidades: lo que se ve va tranquilo; las esperas casi desaparecen ----
// Cada tramo dice cuánto del original se usa (src) y a qué velocidad (v). Los resultados se muestran 2,2 s quietos;
// los scrolls van al doble y, si son largos, se muestra su comienzo (hasta `maxScroll` s en el video); las esperas
// y los tiempos muertos ("otro" largo) van muy rápido. Si no entra en el tope, primero se aceleran las esperas,
// después se acortan los scrolls y por último se acelera la portada.

// En la web, el scroll mueve el panel de al lado y no la web armada: ahí los scrolls se muestran muy cortos
const inicioWeb = (lista.find((m) => m.tipo === "resultado" && m.que === "5a-web")?.ini ?? Infinity) / 1000;

function plan(tr, { f, maxScroll, vPortada }) {
  const largoTr = tr.fin - tr.ini;
  if (tr.tipo === "scroll" && tr.ini >= inicioWeb - 1) return { src: Math.min(largoTr, 3), v: 1.5 };
  switch (tr.tipo) {
    case "resultado":
      return { src: Math.min(largoTr, 2.2), v: 1 };
    case "portada":
      return { src: largoTr, v: vPortada };
    case "scroll":
      return { src: Math.min(largoTr, maxScroll * 2), v: 2 };
    case "escribe":
      return { src: largoTr, v: Math.min(15, 6 * f) };
    case "espera":
      return { src: largoTr, v: Math.min(150, 40 * f) };
    default:
      return largoTr < 2.5 ? { src: largoTr, v: 2 } : { src: largoTr, v: Math.min(120, 25 * f) };
  }
}
const largo = (o) => limpios.reduce((s, tr) => { const p = plan(tr, o); return s + p.src / p.v; }, 0) + WA_LARGO;
const opciones = { f: 1, maxScroll: 6, vPortada: 2.2 };
while (largo(opciones) > TOPE && opciones.f < 6) opciones.f *= 1.1;
while (largo(opciones) > TOPE && opciones.maxScroll > 3.5) opciones.maxScroll -= 0.25;
while (largo(opciones) > TOPE && opciones.vPortada < 3.2) opciones.vPortada += 0.1;
console.log(
  `Largo: ${largo(opciones).toFixed(1)} s · ${limpios.length} tramos · esperas ×${opciones.f.toFixed(2)} · scroll hasta ${opciones.maxScroll} s · portada ×${opciones.vPortada.toFixed(1)}`,
);

// ---- Cada tramo a su velocidad, en archivos sueltos, y después todo junto ----

const tmp = join(carpeta, "edicion");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp);
const cod = ["-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30"];
const escala = `scale=${SALIDA_ANCHO}:${SALIDA_ALTO}:flags=lanczos`;
const partes = [];
let n = 0;
const parte = () => join(tmp, `${String(n++).padStart(4, "0")}.mp4`);

function cortar(ini, fn, v) {
  const salida = parte();
  ff("-ss", (ini * k).toFixed(3), "-to", (fn * k).toFixed(3), "-i", original, "-vf", `setpts=(PTS-STARTPTS)/${v},fps=30,${escala}`, ...cod, salida);
  partes.push(salida);
}

function whatsapp(momento) {
  // La app de fondo, quieta y oscurecida, y encima la conversación de WhatsApp (sin la lista de chats ni el nombre)
  const fondo = join(tmp, "wa-fondo.png");
  ff("-ss", (momento * k).toFixed(3), "-i", original, "-frames:v", "1", "-vf", escala, fondo);
  const [wAncho, wAlto] = tamano(waVideo);
  const [x, y, ancho, alto] = RECORTE_WA ?? [Math.round(wAncho * 0.345), 64, wAncho - Math.round(wAncho * 0.345), wAlto - 128];
  const desde = Math.max(0, waDatos.enviado + DESDE_WA);
  const ventana = Math.round(SALIDA_ANCHO * 0.62);
  const salida = parte();
  ff(
    "-loop", "1", "-t", String(WA_LARGO), "-i", fondo,
    "-ss", desde.toFixed(2), "-t", String(WA_LARGO), "-i", waVideo,
    "-filter_complex",
    `[0]format=yuv420p,eq=brightness=-0.18:saturation=0.6,fps=30[f];` +
      `[1]crop=${ancho}:${alto}:${x}:${y},scale=${ventana}:-2,fps=30,` +
      `pad=iw+16:ih+16:8:8:color=white,format=yuva420p,fade=t=in:st=0:d=0.4:alpha=1,fade=t=out:st=${WA_LARGO - 0.5}:d=0.5:alpha=1[w];` +
      `[f][w]overlay=(W-w)/2:(H-h)/2:shortest=1,format=yuv420p`,
    ...cod, salida,
  );
  partes.push(salida);
}

const momentoWA = conWhatsApp ? aca.ini / 1000 : null;
let puesto = false;
for (const tr of limpios) {
  const { src, v } = plan(tr, opciones);
  const hasta = tr.ini + src;
  if (conWhatsApp && !puesto && momentoWA >= tr.ini && momentoWA < tr.fin) {
    if (momentoWA - tr.ini > 0.3) cortar(tr.ini, Math.min(momentoWA, hasta), v);
    whatsapp(momentoWA);
    puesto = true;
    if (hasta - momentoWA > 0.3) cortar(momentoWA, hasta, v);
  } else cortar(tr.ini, hasta, v);
}

writeFileSync(join(tmp, "lista.txt"), partes.map((p) => `file '${p}'`).join("\n"));
const unido = join(tmp, "unido.mp4");
ff("-f", "concat", "-safe", "0", "-i", join(tmp, "lista.txt"), "-c", "copy", unido);
const total = duracion(unido);
const destino = join(carpeta, "video.mp4");
ff(
  "-i", unido,
  "-vf", `fade=t=in:st=0:d=0.6,fade=t=out:st=${(total - 0.8).toFixed(2)}:d=0.8`,
  "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-profile:v", "high", "-level", "4.1",
  "-pix_fmt", "yuv420p", "-movflags", "+faststart", destino,
);
console.log(`Listo: ${destino} · ${duracion(destino).toFixed(1)} s`);
