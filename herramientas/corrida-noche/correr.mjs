// Corrida de noche: recorre BrandIA de punta a punta con cada caso de equipo/casos-demo.md
// y graba un video por caso. Otra IA hace de cliente (con la ficha del personaje) y elige en
// cada pantalla según "Qué elige en cada pantalla". Detalle y cómo correrlo en README.md.
//
//   node correr.mjs              → los tres casos, uno atrás del otro
//   node correr.mjs postrein     → solo los casos cuyo nombre contenga eso
//   node correr.mjs --ver        → con la ventana a la vista (sin esto, corre escondido)
//   node correr.mjs --sin-pedido → no manda el pedido de prueba de BranderIA

import { mkdirSync, readFileSync, renameSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const AQUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(AQUI, "..", "..");
const BASE = process.env.BASE ?? "https://app.brandiamos.com";
const MODELO = process.env.MODELO ?? "anthropic/claude-sonnet-5.5";
const ANCHO = 1440;
const ALTO = 900;

const args = process.argv.slice(2);
const VER = args.includes("--ver");
const SIN_PEDIDO = args.includes("--sin-pedido");
const filtro = args.find((a) => !a.startsWith("--"))?.toLowerCase();

// ---- La clave del AI Gateway: la misma de la app, en apps/web/.env.local (fuera de git) ----

function leerClave() {
  if (process.env.AI_GATEWAY_API_KEY) return process.env.AI_GATEWAY_API_KEY;
  try {
    const env = readFileSync(join(REPO, "apps/web/.env.local"), "utf8");
    const linea = env.split("\n").find((l) => l.startsWith("AI_GATEWAY_API_KEY="));
    if (linea) return linea.slice("AI_GATEWAY_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
  } catch {}
  throw new Error("Falta la clave del AI Gateway. Corré `vercel env pull` en apps/web.");
}
const CLAVE = leerClave();

// ---- Los casos, leídos de equipo/casos-demo.md (así hay un solo lugar donde cambiarlos) ----

function leerCasos() {
  const md = readFileSync(join(REPO, "equipo/casos-demo.md"), "utf8");
  const partes = md.split(/^## Caso \d+ · /m).slice(1);
  return partes.map((p) => {
    const texto = p.split(/^## /m)[0].trim();
    const quien = texto.match(/\*\*Quién:\*\* ([^,.]+)/)?.[1]?.trim() ?? "Caso";
    const mensajes = [...texto.matchAll(/^\d+\. > (.+)$/gm)].map((m) => m[1].trim());
    return { nombre: quien, texto, mensajes };
  });
}

// ---- El registro de la corrida ----

let archivoRegistro = null;
function anotar(...cosas) {
  const linea = `[${new Date().toLocaleTimeString("es-UY")}] ${cosas.join(" ")}`;
  console.log(linea);
  if (archivoRegistro) appendFileSync(archivoRegistro, linea + "\n");
}

// ---- La IA que hace de cliente ----

async function preguntarIA(sistema, usuario) {
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const r = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${CLAVE}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODELO,
          max_tokens: 800,
          messages: [
            { role: "system", content: sistema },
            { role: "user", content: usuario },
          ],
        }),
      });
      if (!r.ok) throw new Error(`AI Gateway ${r.status}: ${(await r.text()).slice(0, 200)}`);
      const j = await r.json();
      return j.choices[0].message.content.trim();
    } catch (e) {
      anotar(`  la IA del cliente falló (intento ${intento}):`, e.message);
      if (intento === 3) throw e;
      await esperar(5000 * intento);
    }
  }
}

function sistemaCliente(caso) {
  return `Hacés de cliente de BrandIA en una prueba automática. Este es tu caso, con tu ficha del personaje y lo que elegís en cada pantalla:

${caso.texto}

Reglas:
- Escribís como el personaje (su edad, su forma de hablar), en español rioplatense, como en un chat: sin listas ni títulos.
- Lo que querés contar está en los "Mensajes para pegar en el chat". Usalos en orden y adaptalos a lo que te pregunta BrandIA, sin repetir lo que ya dijiste.
- Si BrandIA pregunta algo que está en la ficha del personaje, contestalo con eso. Si no está, decí que todavía no lo sabés. Nunca inventes datos.
- Si BrandIA muestra un resumen y pregunta si está bien, confirmalo (corregí solo si algo contradice la ficha) y pedí seguir.
- Devolvé solo el texto del mensaje, nada más.`;
}

async function respuestaCliente(caso, conversacion, extra = "") {
  const charla = conversacion.map((m) => `${m.quien === "cliente" ? "VOS" : "BRANDIA"}: ${m.texto}`).join("\n\n");
  return preguntarIA(sistemaCliente(caso), `${extra}La conversación hasta ahora:\n\n${charla}\n\nEscribí tu próximo mensaje.`);
}

/** Le pide a la IA del cliente que elija una opción; devuelve el índice (0 si no se entiende). */
async function elegir(caso, pregunta, opciones) {
  if (opciones.length <= 1) return 0;
  const lista = opciones.map((o, i) => `${i + 1}. ${o.replace(/\s+/g, " ").slice(0, 700)}`).join("\n");
  const r = await preguntarIA(
    sistemaCliente(caso),
    `${pregunta}\n\nOpciones:\n${lista}\n\nSeguí lo que dice "Qué elige en cada pantalla" y tu ficha. Contestá solo con el número de la opción.`,
  );
  const n = Number.parseInt(r.match(/\d+/)?.[0] ?? "1", 10) - 1;
  return n >= 0 && n < opciones.length ? n : 0;
}

// ---- Esperas: la app pide cosas a /api/... y la pantalla queda lista cuando dejan de llegar ----

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function vigilarPedidos(page) {
  const enCurso = new Set();
  const estado = { ultimo: Date.now(), enCurso };
  const esApi = (r) => new URL(r.url()).pathname.startsWith("/api/");
  page.on("request", (r) => {
    if (!esApi(r)) return;
    enCurso.add(r);
    estado.ultimo = Date.now();
  });
  const fin = (r) => {
    if (!enCurso.delete(r)) return;
    estado.ultimo = Date.now();
  };
  page.on("requestfinished", fin);
  page.on("requestfailed", fin);
  return estado;
}

/** Espera a que no haya pedidos a la IA en curso durante `quieto` ms. */
async function esperarQuieto(vigia, { quieto = 12000, tope = 8 * 60_000, que = "" } = {}) {
  const inicio = Date.now();
  await esperar(1500);
  while (Date.now() - inicio < tope) {
    if (vigia.enCurso.size === 0 && Date.now() - vigia.ultimo > quieto) return;
    await esperar(1000);
  }
  anotar(`  ⚠ ${que || "la pantalla"} siguió pidiendo cosas más de ${Math.round(tope / 60000)} min; sigo igual`);
}

// ---- Movimientos para que el video se entienda ----

async function recorrer(page, pasos = 8, pausa = 900) {
  await page.mouse.move(ANCHO / 2, ALTO / 2);
  for (let i = 0; i < pasos; i++) {
    await page.mouse.wheel(0, 450);
    await esperar(pausa);
  }
}

async function arriba(page) {
  await page.evaluate(() => document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" }));
  await esperar(800);
}

async function foto(page, carpeta, nombre) {
  await page.screenshot({ path: join(carpeta, `${nombre}.png`) }).catch(() => {});
}

async function escribir(campo, texto) {
  await campo.click();
  await campo.pressSequentially(texto, { delay: 14 });
  await esperar(400);
  await campo.press("Enter");
}

// ---- Los chats (entrevista y web): las burbujas de BrandIA y del cliente ----

async function leerChat(page) {
  return page.$$eval("main div.rounded-2xl", (els) =>
    els
      .filter((e) => e.classList.contains("self-start") || e.classList.contains("self-end"))
      .map((e) => ({ quien: e.classList.contains("self-end") ? "cliente" : "brandia", texto: e.innerText.trim() })),
  );
}

async function reintentarSiSeCorto(page, vigia) {
  const boton = page.getByRole("button", { name: "Probar de nuevo" });
  if (await boton.isVisible().catch(() => false)) {
    anotar("  se cortó la conexión: Probar de nuevo");
    await boton.click();
    await esperarQuieto(vigia, { quieto: 2500, tope: 3 * 60_000, que: "el chat" });
  }
}

// ---- Los pasos del recorrido ----

async function pasoEntrevista(page, vigia, caso, carpeta) {
  anotar("Paso 1 · Entrevista");
  await page.goto(`${BASE}/crear`, { waitUntil: "networkidle" });
  await esperar(2500);
  const campo = page.locator("textarea#mensaje");
  const listo = page.getByRole("link", { name: "Armar mi marca" });

  for (let turno = 1; turno <= 10; turno++) {
    if (await listo.isVisible().catch(() => false)) break;
    const conversacion = await leerChat(page);
    const texto = turno === 1 ? caso.mensajes[0] : await respuestaCliente(caso, conversacion);
    anotar(`  turno ${turno}: ${texto.slice(0, 90).replace(/\n/g, " ")}…`);
    await campo.waitFor({ state: "visible", timeout: 60_000 });
    await escribir(campo, texto);
    await esperarQuieto(vigia, { quieto: 2500, tope: 4 * 60_000, que: "la entrevista" });
    await reintentarSiSeCorto(page, vigia);
  }
  await listo.waitFor({ state: "visible", timeout: 60_000 });
  await esperar(2000);
  await foto(page, carpeta, "1-ficha");
  await recorrer(page, 4);
  await esperar(1500);
  await listo.click();
}

async function pasoMarca(page, vigia, caso, carpeta) {
  anotar("Paso 2 · Marca");
  // El nombre: los tres casos conservan el suyo; se escribe en "¿Se te ocurrió otro?"
  const propio = page.locator("input#nombre-propio");
  await propio.waitFor({ state: "visible", timeout: 3 * 60_000 });
  await esperar(4000);
  await foto(page, carpeta, "2a-nombres");
  const nombre = await preguntarIA(
    sistemaCliente(caso),
    "¿Con qué nombre se queda tu marca? Contestá solo el nombre, tal cual se escribe.",
  );
  anotar(`  nombre: ${nombre}`);
  await propio.scrollIntoViewIfNeeded();
  await propio.click();
  await propio.pressSequentially(nombre, { delay: 40 });
  await page.getByRole("button", { name: "Usar este nombre" }).click();
  await esperar(1500);

  // Los caminos
  const botonCamino = page.getByRole("button", { name: "Elegir este camino" });
  await botonCamino.first().waitFor({ state: "visible", timeout: 4 * 60_000 });
  await esperarQuieto(vigia, { quieto: 4000, tope: 2 * 60_000, que: "los caminos" });
  const caminos = page.locator("article").filter({ has: botonCamino });
  const textos = await caminos.allInnerTexts();
  const i = await elegir(caso, "Estos son los caminos que te propone BrandIA. ¿Cuál elegís?", textos);
  anotar(`  camino ${i + 1} de ${textos.length}: ${textos[i].split("\n")[0]}`);
  await caminos.first().scrollIntoViewIfNeeded();
  await esperar(1500);
  await foto(page, carpeta, "2b-caminos");
  await caminos.nth(i).scrollIntoViewIfNeeded();
  await esperar(2500);
  await caminos.nth(i).getByRole("button", { name: "Elegir este camino" }).click();

  // El brandbook
  const seguir = page.getByRole("link", { name: "Ver mis contenidos" });
  await seguir.waitFor({ state: "visible", timeout: 5 * 60_000 });
  await esperarQuieto(vigia, { quieto: 8000, que: "el brandbook" });
  const logos = page.getByRole("button", { name: /^Elegir (la propuesta|el símbolo|solo el símbolo)/ });
  const etiquetas = [];
  for (const l of await logos.all()) etiquetas.push((await l.getAttribute("aria-label")) ?? "");
  if (etiquetas.length) {
    const j = await elegir(caso, "Estas son las opciones de logo. ¿Cuál elegís?", etiquetas);
    anotar(`  logo: ${etiquetas[j]}`);
    await logos.nth(j).scrollIntoViewIfNeeded();
    await esperar(1500);
    await logos.nth(j).click();
    await esperarQuieto(vigia, { quieto: 5000, tope: 3 * 60_000, que: "el logo elegido" });
  }
  await arriba(page);
  await foto(page, carpeta, "2c-marca");
  await recorrer(page, 18, 1100);
  await seguir.scrollIntoViewIfNeeded();
  await esperar(1500);
  await seguir.click();
}

async function pasoContenido(page, vigia, caso, carpeta) {
  anotar("Paso 3 · Contenido");
  const quiero = page.getByRole("button", { name: /Quiero este/ });
  const seguir = page.getByRole("link", { name: "Ver mis productos" });
  await Promise.race([
    quiero.first().waitFor({ state: "visible", timeout: 3 * 60_000 }),
    seguir.waitFor({ state: "visible", timeout: 3 * 60_000 }),
  ]);
  if (await quiero.first().isVisible().catch(() => false)) {
    await esperarQuieto(vigia, { quieto: 4000, tope: 2 * 60_000, que: "la muestra de estilos" });
    await foto(page, carpeta, "3a-estilos");
    const textos = await quiero.allInnerTexts();
    const i = await elegir(caso, "¿Qué estilo de diseño elegís para el feed?", textos);
    anotar(`  estilo: ${textos[i].split("\n")[0]}`);
    await esperar(2000);
    await quiero.nth(i).click();
  }
  await seguir.waitFor({ state: "visible", timeout: 10 * 60_000 });
  await esperarQuieto(vigia, { quieto: 15000, tope: 12 * 60_000, que: "el feed" });

  // "Antes de publicar": lo que la IA dejó a confirmar se marca "No va" (los casos no dan esos datos)
  const noVa = page.getByRole("button", { name: "No va", exact: true });
  const cuantos = await noVa.count();
  if (cuantos) {
    anotar(`  antes de publicar: ${cuantos} datos a confirmar → No va`);
    await noVa.first().scrollIntoViewIfNeeded();
    await esperar(1500);
    for (let k = 0; k < cuantos; k++) {
      await noVa.nth(k).click().catch(() => {});
      await esperar(500);
    }
    const aplicar = page.getByRole("button", { name: /^Aplicar/ });
    if (await aplicar.isEnabled().catch(() => false)) {
      await aplicar.click();
      await esperarQuieto(vigia, { quieto: 6000, tope: 5 * 60_000, que: "los datos a confirmar" });
    }
  }
  await arriba(page);
  await foto(page, carpeta, "3b-feed");
  await recorrer(page, 22, 1100);
  await seguir.scrollIntoViewIfNeeded();
  await esperar(1500);
  await seguir.click();
}

async function pasoBranderia(page, vigia, caso, carpeta) {
  anotar("Paso 4 · BranderIA");
  const mas = page.getByRole("button", { name: /^Más / });
  await mas.first().waitFor({ state: "visible", timeout: 10 * 60_000 });
  await esperarQuieto(vigia, { quieto: 10000, tope: 8 * 60_000, que: "las fotos de productos" });
  await foto(page, carpeta, "4a-productos");

  // "¿Te falta algo?": lo que el caso pide agregar, si no está
  let nombres = [...new Set((await mas.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")))).map((s) => s.slice(4)))];
  const falta = await preguntarIA(
    sistemaCliente(caso),
    `BrandIA te propone estos productos: ${nombres.join(", ")}.\nSegún "Qué elige en cada pantalla" (BranderIA), ¿te falta agregar algo que no está en la lista? Contestá solo el producto en pocas palabras, o NADA.`,
  );
  if (!/^nada/i.test(falta)) {
    anotar(`  agrega: ${falta}`);
    const pedido = page.locator("input#pedido-productos");
    if (await pedido.isVisible().catch(() => false)) {
      await pedido.scrollIntoViewIfNeeded();
      await pedido.click();
      await pedido.pressSequentially(falta, { delay: 40 });
      await page.getByRole("button", { name: "Agregar" }).click();
      await esperarQuieto(vigia, { quieto: 10000, tope: 6 * 60_000, que: "el producto agregado" });
      nombres = [...new Set((await mas.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")))).map((s) => s.slice(4)))];
    }
  }
  await arriba(page);
  await recorrer(page, 12, 1000);

  // El kit: los productos que pide el caso (el + suma la cantidad típica)
  const elegidos = await preguntarIA(
    sistemaCliente(caso),
    `Productos disponibles:\n${nombres.map((n, k) => `${k + 1}. ${n}`).join("\n")}\n\nSegún "Qué elige en cada pantalla" (BranderIA), ¿cuáles sumás al kit? Elegí entre 2 y 4. Contestá solo los números separados por coma.`,
  );
  const indices = [...new Set((elegidos.match(/\d+/g) ?? ["1", "2"]).map((n) => Number(n) - 1))].filter((n) => n >= 0 && n < nombres.length).slice(0, 4);
  for (const k of indices) {
    const boton = page.getByRole("button", { name: `Más ${nombres[k]}`, exact: true }).first();
    anotar(`  al kit: ${nombres[k]}`);
    await boton.scrollIntoViewIfNeeded();
    await esperar(1000);
    await boton.click();
    await esperar(800);
  }
  const kit = page.getByRole("complementary", { name: "Tu kit" }).or(page.locator('[aria-label="Tu kit"]')).first();
  await kit.scrollIntoViewIfNeeded().catch(() => {});
  await esperar(2000);
  await foto(page, carpeta, "4b-kit");

  if (SIN_PEDIDO) return;
  const pedir = page.getByRole("button", { name: /Pedir cotización/ });
  if (!(await pedir.isEnabled().catch(() => false))) return;
  await pedir.scrollIntoViewIfNeeded();
  await pedir.click();
  await esperar(1000);
  await page.locator('input[name="nombre"]').pressSequentially(`PRUEBA NOCHE · ${caso.nombre}`, { delay: 25 });
  await page.locator('input[name="contacto"]').pressSequentially("prueba@brandiamos.com", { delay: 25 });
  await page.locator('input[name="entrega"]').pressSequentially("Montevideo", { delay: 25 });
  await page.locator('textarea[name="nota"]').pressSequentially("No producir, es una prueba", { delay: 25 });
  await esperar(1000);
  // El WhatsApp se abre en otra pestaña: se cierra sin mandar nada (ver el context.on("page") de abajo)
  await page.getByRole("button", { name: /Enviar por WhatsApp/ }).click();
  await esperar(5000);
  anotar("  pedido de prueba guardado (WhatsApp cerrado sin enviar)");
  await foto(page, carpeta, "4c-pedido");
}

async function pasoWeb(page, vigia, caso, carpeta) {
  anotar("Paso 5 · Web");
  // Misma pestaña: la marca vive en sessionStorage y sigue ahí al navegar
  await page.goto(`${BASE}/crear/web`, { waitUntil: "networkidle" });
  await esperar(2500);
  const campo = page.locator('textarea[placeholder="Escribí tu respuesta"]');
  for (let turno = 1; turno <= 8; turno++) {
    if (!(await campo.isVisible().catch(() => false))) break;
    const conversacion = await leerChat(page);
    const texto = await respuestaCliente(
      caso,
      conversacion,
      "Ahora BrandIA te hace unas preguntas para armar tu sitio web (tu marca ya está hecha). Contestá con tu ficha; si no sabés algo, decilo.\n\n",
    );
    anotar(`  turno ${turno}: ${texto.slice(0, 90).replace(/\n/g, " ")}…`);
    await escribir(campo, texto);
    await esperarQuieto(vigia, { quieto: 2500, tope: 4 * 60_000, que: "la entrevista de la web" });
    await reintentarSiSeCorto(page, vigia);
  }
  const cambios = page.locator('textarea[placeholder="¿Qué le cambiamos?"]');
  await cambios.waitFor({ state: "visible", timeout: 8 * 60_000 });
  await esperarQuieto(vigia, { quieto: 10000, tope: 8 * 60_000, que: "la web" });
  await foto(page, carpeta, "5a-web");
  await recorrer(page, 10, 1100);

  const cambio = await preguntarIA(
    sistemaCliente(caso),
    `Tu web ya está armada. Según "Qué elige en cada pantalla" (Web), ¿qué cambio le pedís por chat? Contestá solo el pedido, como lo escribiría el personaje.`,
  );
  anotar(`  cambio: ${cambio}`);
  await cambios.scrollIntoViewIfNeeded();
  await escribir(cambios, cambio);
  await esperarQuieto(vigia, { quieto: 8000, tope: 6 * 60_000, que: "el cambio de la web" });
  await arriba(page);
  await foto(page, carpeta, "5b-web-cambiada");
  await recorrer(page, 10, 1100);
  await esperar(3000);
}

// ---- Un caso entero, con su video ----

async function correrCaso(browser, caso, raiz) {
  const slug = caso.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
  const carpeta = join(raiz, slug);
  mkdirSync(carpeta, { recursive: true });
  anotar(`=== ${caso.nombre} ===`);

  const context = await browser.newContext({
    viewport: { width: ANCHO, height: ALTO },
    recordVideo: { dir: carpeta, size: { width: ANCHO, height: ALTO } },
    locale: "es-UY",
  });
  const page = await context.newPage();
  // Cualquier otra pestaña (el WhatsApp del pedido) se cierra sin hacer nada
  context.on("page", (p) => {
    if (p !== page) p.close().catch(() => {});
  });
  const vigia = vigilarPedidos(page);
  const inicio = Date.now();
  let ok = true;
  try {
    await pasoEntrevista(page, vigia, caso, carpeta);
    await pasoMarca(page, vigia, caso, carpeta);
    await pasoContenido(page, vigia, caso, carpeta);
    await pasoBranderia(page, vigia, caso, carpeta);
    await pasoWeb(page, vigia, caso, carpeta);
  } catch (e) {
    ok = false;
    anotar(`  ✗ se trabó: ${e.message.split("\n")[0]}`);
    await foto(page, carpeta, "error");
  }
  const video = page.video();
  await context.close();
  if (video) {
    const destino = join(carpeta, `${slug}${ok ? "" : "-incompleto"}.webm`);
    renameSync(await video.path(), destino);
    anotar(`  video: ${destino}`);
  }
  anotar(`  ${ok ? "✓ terminado" : "✗ incompleto"} en ${Math.round((Date.now() - inicio) / 60000)} min`);
  return ok;
}

// ---- Arranque ----

const casos = leerCasos().filter((c) => !filtro || c.nombre.toLowerCase().includes(filtro));
if (!casos.length) {
  console.error("No hay casos que coincidan. Los casos están en equipo/casos-demo.md.");
  process.exit(1);
}
const sello = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const raiz = join(AQUI, "salida", sello);
mkdirSync(raiz, { recursive: true });
archivoRegistro = join(raiz, "registro.txt");
anotar(`Corrida en ${BASE} · ${casos.map((c) => c.nombre).join(", ")}`);

const browser = await chromium.launch({ headless: !VER });
const resultados = [];
for (const caso of casos) resultados.push([caso.nombre, await correrCaso(browser, caso, raiz)]);
await browser.close();
anotar("Resumen: " + resultados.map(([n, ok]) => `${n} ${ok ? "✓" : "✗"}`).join(" · "));
anotar(`Todo quedó en ${raiz}`);
