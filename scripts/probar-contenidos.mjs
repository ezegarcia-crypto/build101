// Prueba el feed (módulo B) contra /api/contenidos con 3 negocios inventados bien distintos.
// Uso, con la web corriendo (npm run dev:web): node scripts/probar-contenidos.mjs [url]
// Guarda las imágenes, el JSON y una página para mirar el feed en tmp/contenidos/<fecha>/ (tmp/ está fuera de git).
// Las fichas y las identidades de acá son solo datos de prueba: en la app salen de la entrevista y de la identidad.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const URL = process.argv[2] ?? "http://localhost:3001/api/contenidos";

const base = {
  version: "0.2",
  tipo_proyecto: "nueva",
  referencias: [],
  marca_actual: null,
  direccion_elegida: null,
};

const NEGOCIOS = [
  {
    id: "bicicleteria",
    brief: {
      ...base,
      marca: { nombre: "Rayo", necesita_nombre: false, rubro: "Taller y venta de bicicletas urbanas", ubicacion: "Cordón, Montevideo", trato: "vos" },
      negocio: {
        que_hace: "Arreglamos bicis en el día y armamos bicis urbanas a medida con piezas recuperadas",
        diferencial: "Te explicamos qué tiene tu bici y no te cobramos lo que no hace falta",
        posicion_precio: "accesible",
        canales: ["taller en Cordón", "Instagram", "WhatsApp"],
      },
      publico: { descripcion: "Gente de 20 a 40 que va a trabajar o a estudiar en bici por la ciudad", edad_aprox: "20 a 40", que_busca: "Que la bici ande ya y a buen precio" },
      personalidad: { palabras_si: ["honesta", "de barrio", "práctica"], palabras_no: ["deportiva de élite", "cara"] },
      gustos: { marcas_admiradas: [{ nombre: "Patagonia", por_que: "Arreglan en vez de tirar" }], no_parecerse_a: ["tiendas de ciclismo de ruta"], colores_si: ["amarillo", "negro"], colores_no: ["rosa"] },
      aplicaciones_prioritarias: ["Instagram", "cartel del taller"],
      restricciones: { obligatorio: [], a_conservar: [] },
      huecos: ["horarios", "dirección exacta"],
    },
    identidad: {
      nombre: "Rayo",
      paleta: ["#F2C230", "#1C1C1C", "#E9E4D8", "#3A6EA5"],
      tipografias: { titulos: "Archivo Black", texto: "Inter" },
      voz: "Directa y de barrio, con humor seco. Habla como el mecánico de confianza: corto, claro y sin vender humo.",
    },
  },
  {
    id: "psicopedagoga",
    brief: {
      ...base,
      marca: { nombre: null, necesita_nombre: true, rubro: "Psicopedagogía infantil", ubicacion: "Rosario, Argentina, y online", trato: "usted" },
      negocio: {
        que_hace: "Acompaño a chicos de 6 a 12 años con dificultades de aprendizaje y oriento a sus familias",
        diferencial: "Trabajo con juegos y con la escuela, y les doy a los padres herramientas para la casa",
        posicion_precio: "intermedio",
        canales: ["consultorio", "sesiones online", "Instagram"],
      },
      publico: { descripcion: "Madres y padres de chicos en primaria, preocupados porque a su hijo le cuesta leer o concentrarse", edad_aprox: "30 a 45", que_busca: "Entender qué le pasa a su hijo y sentirse acompañados" },
      personalidad: { palabras_si: ["cálida", "profesional", "paciente"], palabras_no: ["clínica fría", "infantil exagerada"] },
      gustos: { marcas_admiradas: [], no_parecerse_a: ["consultorios con fotos de banco"], colores_si: ["verde suave", "durazno"], colores_no: ["rojo"] },
      aplicaciones_prioritarias: ["Instagram"],
      restricciones: { obligatorio: [], a_conservar: [] },
      huecos: ["nombre de la marca", "marcas que admira"],
    },
    identidad: {
      nombre: "Brújula",
      paleta: ["#7FA88B", "#F4B393", "#FBF6EE", "#2F4858"],
      tipografias: { titulos: "Fraunces", texto: "Nunito" },
      voz: "Cálida, serena y profesional. Explica sin tecnicismos, transmite calma y nunca culpa a las familias.",
    },
  },
  {
    id: "foodtruck",
    brief: {
      ...base,
      marca: { nombre: "Kimchi Bus", necesita_nombre: false, rubro: "Foodtruck de comida coreana callejera", ubicacion: "Punta del Este y ferias de Maldonado", trato: "vos" },
      negocio: {
        que_hace: "Vendemos tteokbokki, kimbap y pollo frito coreano desde un ómnibus viejo pintado",
        diferencial: "Recetas de la abuela coreana del dueño, picante de verdad",
        posicion_precio: "intermedio",
        canales: ["foodtruck", "ferias", "Instagram", "PedidosYa"],
      },
      publico: { descripcion: "Jóvenes de 18 a 30 fanáticos del k-pop y de la comida picante, y turistas en verano", edad_aprox: "18 a 30", que_busca: "Probar algo distinto y sacarle foto" },
      personalidad: { palabras_si: ["divertida", "intensa", "auténtica"], palabras_no: ["gourmet pretencioso", "aburrida"] },
      gustos: { marcas_admiradas: [{ nombre: "Shake Shack", por_que: "Callejera pero con onda" }], no_parecerse_a: [], colores_si: ["rojo", "verde menta"], colores_no: ["marrón"] },
      aplicaciones_prioritarias: ["Instagram", "el ómnibus", "packaging"],
      restricciones: { obligatorio: [], a_conservar: [] },
      huecos: ["dónde está cada día"],
    },
    identidad: {
      nombre: "Kimchi Bus",
      paleta: ["#E63946", "#7DE2D1", "#1D1A1F", "#FFF3E2"],
      tipografias: { titulos: "Bungee", texto: "DM Sans" },
      voz: "Intensa y juguetona, con energía de feria. Frases cortas, algún guiño en coreano y mucha onda.",
    },
  },
];

// Las identidades de prueba están escritas cortas (paleta como lista de hex y voz como texto).
// /api/contenidos recibe la identidad tal como sale de /api/identidad, así que se convierten a ese formato.
const ROLES = ["principal", "acento", "fondo", "texto", "apoyo"];
function comoIdentidadReal(i) {
  return {
    nombre: i.nombre,
    paleta: i.paleta.map((hex, n) => ({ hex, nombre: hex, rol: ROLES[n] ?? "apoyo" })),
    tipografias: i.tipografias,
    voz: { resumen: i.voz },
  };
}

async function probar(n) {
  const t0 = Date.now();
  const res = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ brief: n.brief, identidad: comoIdentidadReal(n.identidad) }),
  });
  const crudo = await res.text();
  const segundos = (Date.now() - t0) / 1000;
  if (!res.ok) return { n, error: `${res.status} ${crudo.slice(0, 500)}`, segundos };
  return { n, feed: JSON.parse(crudo), segundos, megas: crudo.length / 1e6 };
}

const carpeta = join("tmp", "contenidos", new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-"));
mkdirSync(carpeta, { recursive: true });

// Separa cada imagen del JSON en su archivo y deja en el JSON solo el nombre del archivo.
function guardarImagen(item, nombre) {
  if (!item.imagen.url) return { ...item, imagen: item.imagen };
  const [, tipo, b64] = item.imagen.url.match(/^data:image\/(\w+);base64,(.*)$/);
  const archivo = `${nombre}.${tipo === "jpeg" ? "jpg" : tipo}`;
  writeFileSync(join(carpeta, archivo), Buffer.from(b64, "base64"));
  return { ...item, imagen: { archivo, modelo: item.imagen.modelo } };
}

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function htmlDe(n, feed) {
  const { paleta, tipografias } = n.identidad;
  const fondo = (item) => (item.imagen.archivo ? `background-image:url('${item.imagen.archivo}')` : "background:#ccc");
  const posteos = feed.posteos
    .map((p) => `<article><div class="img post" style="${fondo(p)}"><h3>${esc(p.titular)}</h3></div><p>${esc(p.texto).replace(/\n/g, "<br>")}</p><p class="tags">${esc(p.hashtags.join(" "))}</p><p class="nota">${esc(p.objetivo)} · ${esc(p.idea_visual)}</p></article>`)
    .join("");
  const historias = feed.historias
    .map((h) => `<article><div class="img story" style="${fondo(h)}"><h3>${esc(h.texto)}</h3>${h.interaccion ? `<span>${esc(h.interaccion)}</span>` : ""}</div><p class="nota">${esc(h.objetivo)} · ${esc(h.idea_visual)}</p></article>`)
    .join("");
  return `<section style="--c1:${paleta[0]};--c2:${paleta[1] ?? paleta[0]};font-family:'${tipografias.texto}',sans-serif">
<h2 style="font-family:'${tipografias.titulos}'">${esc(feed.marca)} <small>${feed.medicion.segundos} s · USD ${feed.medicion.costo_usd}</small></h2>
<p class="nota">${esc(feed.direccion_de_arte)}</p><div class="fila">${posteos}</div><div class="fila">${historias}</div>
<style>section h3{font-family:'${tipografias.titulos}'}</style></section>`;
}

const resultados = await Promise.all(NEGOCIOS.map(probar));
const secciones = [];
const fuentes = new Set();
for (const r of resultados) {
  console.log(`\n### ${r.n.id} · ${r.segundos.toFixed(1)} s en total`);
  if (r.error) {
    console.log(`ERROR: ${r.error}`);
    continue;
  }
  const { feed } = r;
  const sinImagen = [...feed.posteos, ...feed.historias].filter((x) => !x.imagen.url);
  console.log(`según la ruta: ${feed.medicion.segundos} s · USD ${feed.medicion.costo_usd} · respuesta de ${r.megas.toFixed(1)} MB`);
  console.log(`${feed.posteos.length} posteos y ${feed.historias.length} historias · imágenes que fallaron: ${sinImagen.length}`);
  for (const x of sinImagen) console.log(`  sin imagen: ${x.imagen.error}`);
  for (const p of feed.posteos) console.log(`- [${p.imagen.modelo ?? "sin imagen"}] ${p.titular}\n  ${p.texto.split("\n")[0]}\n  ${p.hashtags.join(" ")}`);
  for (const h of feed.historias) console.log(`- historia: ${h.texto}${h.interaccion ? ` (${h.interaccion})` : ""}`);

  const liviano = {
    ...feed,
    posteos: feed.posteos.map((p, i) => guardarImagen(p, `${r.n.id}-posteo-${i + 1}`)),
    historias: feed.historias.map((h, i) => guardarImagen(h, `${r.n.id}-historia-${i + 1}`)),
  };
  writeFileSync(join(carpeta, `${r.n.id}.json`), JSON.stringify(liviano, null, 2));
  secciones.push(htmlDe(r.n, liviano));
  fuentes.add(r.n.identidad.tipografias.titulos).add(r.n.identidad.tipografias.texto);
}

const familias = [...fuentes].map((f) => `family=${f.replace(/ /g, "+")}`).join("&");
writeFileSync(
  join(carpeta, "feed.html"),
  `<!doctype html><meta charset="utf-8"><title>Feeds de prueba</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${familias}&display=swap">
<style>body{margin:24px;background:#f5f5f5;color:#222}section{margin-bottom:48px}h2 small{font:14px sans-serif;color:#777}.fila{display:flex;gap:16px;overflow-x:auto;margin:12px 0}
article{flex:0 0 260px;background:#fff;padding:8px;border-radius:8px;font-size:13px}.img{background-size:cover;background-position:center;border-radius:4px;display:flex;flex-direction:column;justify-content:flex-end;padding:12px;box-sizing:border-box}
.post{aspect-ratio:4/5}.story{aspect-ratio:9/16}.img h3{margin:0;color:#fff;font-size:22px;line-height:1.1;text-shadow:0 2px 8px rgba(0,0,0,.6)}.img span{margin-top:8px;align-self:flex-start;background:var(--c1);color:#fff;padding:4px 10px;border-radius:12px}
.tags{color:var(--c1)}.nota{color:#888;font-size:12px}</style>${secciones.join("\n")}`,
);
console.log(`\nResultado en ${carpeta}/ (abrí feed.html en el navegador)`);
