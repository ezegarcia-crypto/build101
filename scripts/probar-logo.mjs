// Prueba el logo completo con 3 negocios inventados bien distintos (uno sin nombre): para cada uno pide las
// direcciones a /api/direcciones y los logos de dos direcciones distintas (A y C) a /api/logo, para ver que
// los logos cambian con la dirección. Los guarda en una carpeta temporal, fuera de git.
// Uso, con la web corriendo (npm run dev:web): node scripts/probar-logo.mjs [carpeta-de-salida]
// Al final abrí el index.html de esa carpeta en el navegador para ver los logos con sus conceptos.
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL = process.env.URL_WEB ?? "http://localhost:3001";
const SALIDA = process.argv[2] ?? join(tmpdir(), `brandia-logos-${Date.now()}`);

const ficha = (o) => ({
  version: "0.2",
  tipo_proyecto: "nueva",
  referencias: [],
  aplicaciones_prioritarias: ["Instagram"],
  restricciones: { obligatorio: [], a_conservar: [] },
  marca_actual: null,
  huecos: [],
  direccion_elegida: null,
  ...o,
});

const MARCAS = [
  {
    id: "ferreteria",
    brief: ficha({
      tipo_proyecto: "renovacion",
      marca: { nombre: "Ferretería Olivera", necesita_nombre: false, rubro: "ferretería de barrio", ubicacion: "Salto, Uruguay", trato: "usted" },
      negocio: { que_hace: "Ferretería familiar desde 1962, tercera generación, de todo para la casa y el campo", diferencial: "Te asesoran de verdad y tienen lo que no encontrás en otro lado", posicion_precio: "intermedio", canales: ["local", "WhatsApp"] },
      publico: { descripcion: "Vecinos, productores rurales y albañiles", edad_aprox: "30 a 70", que_busca: "Resolver rápido y que lo atiendan bien" },
      personalidad: { palabras_si: ["confiable", "de toda la vida", "práctica"], palabras_no: ["cara", "fría", "de shopping"] },
      gustos: { marcas_admiradas: [{ nombre: "Stanley", por_que: "robusta y clásica" }], no_parecerse_a: ["Sodimac"], colores_si: ["rojo", "amarillo"], colores_no: ["rosa"] },
      aplicaciones_prioritarias: ["cartel del local", "bolsas", "camionetas"],
      restricciones: { obligatorio: ["el apellido Olivera"], a_conservar: ["el año 1962"] },
      marca_actual: { logo: "letras rojas en cursiva", gusta: ["el rojo"], no_gusta: ["se ve vieja"] },
    }),
  },
  {
    id: "chispa",
    brief: ficha({
      marca: { nombre: "Chispa", necesita_nombre: false, rubro: "talleres de ciencia para niños", ubicacion: "Montevideo, Uruguay", trato: "vos" },
      negocio: { que_hace: "Talleres de ciencia y experimentos para chicos de 6 a 12 años, los sábados y en cumpleaños", diferencial: "Los chicos aprenden ensuciándose las manos, nada de pizarrón", posicion_precio: "intermedio", canales: ["Instagram", "colegios"] },
      publico: { descripcion: "Madres y padres curiosos que buscan algo distinto a la pantalla", edad_aprox: "30 a 45", que_busca: "Que sus hijos se diviertan aprendiendo" },
      personalidad: { palabras_si: ["curiosa", "divertida", "inteligente"], palabras_no: ["infantil de más", "escolar", "aburrida"] },
      gustos: { marcas_admiradas: [{ nombre: "LEGO", por_que: "juego creativo" }, { nombre: "Duolingo", por_que: "simpática" }], no_parecerse_a: [], colores_si: ["colores vivos"], colores_no: ["gris"] },
    }),
  },
  {
    // Sin nombre: el logo usa el que propone la dirección (direccion.nombre_marca).
    id: "cosmetica",
    brief: ficha({
      marca: { nombre: null, necesita_nombre: true, rubro: "cosmética natural de lujo", ubicacion: "José Ignacio, Uruguay", trato: "tu" },
      negocio: { que_hace: "Aceites y cremas faciales con algas y flores de la costa uruguaya, hechos en pequeños lotes", diferencial: "Ingredientes del océano Atlántico sur, cosechados a mano", posicion_precio: "premium", canales: ["web", "hoteles boutique"] },
      publico: { descripcion: "Mujeres que viajan, cuidan lo que se ponen y pagan por calidad", edad_aprox: "35 a 60", que_busca: "Rituales de cuidado con origen" },
      personalidad: { palabras_si: ["serena", "sofisticada", "natural"], palabras_no: ["hippie", "barata", "recargada"] },
      gustos: { marcas_admiradas: [{ nombre: "Aesop", por_que: "sobria y elegante" }, { nombre: "Le Labo", por_que: "artesanal y de lujo" }], no_parecerse_a: ["The Body Shop"], colores_si: ["arena", "verde agua"], colores_no: ["fucsia"] },
      aplicaciones_prioritarias: ["frascos de vidrio", "web"],
      huecos: ["nombre"],
    }),
  },
];

const post = async (ruta, cuerpo) => {
  const res = await fetch(`${URL}${ruta}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(cuerpo) });
  return { status: res.status, ...(await res.json()) };
};

async function probar(m) {
  const t0 = Date.now();
  const { direcciones, error } = await post("/api/direcciones", { brief: m.brief });
  if (!direcciones) return [{ ...m, error: `direcciones: ${error}` }];
  const segDirecciones = ((Date.now() - t0) / 1000).toFixed(1);
  const elegidas = [direcciones[0], direcciones.at(-1)];
  return Promise.all(
    elegidas.map(async (direccion) => {
      const t1 = Date.now();
      const r = await post("/api/logo", { brief: m.brief, direccion });
      return { ...m, ...r, direccion, segDirecciones, segundosTotal: ((Date.now() - t1) / 1000).toFixed(1) };
    }),
  );
}

mkdirSync(SALIDA, { recursive: true });
const resultados = (await Promise.all(MARCAS.map(probar))).flat();

let html = `<!doctype html><meta charset="utf-8"><title>Logos BrandIA</title><style>body{font-family:system-ui,sans-serif;background:#f4f1ea;margin:24px;color:#222}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:32px}.c{background:#fff;border-radius:12px;padding:12px}.c img{width:100%;aspect-ratio:1;object-fit:contain}.c p{font-size:13px;margin:6px 0}.chip{display:inline-block;width:14px;height:14px;border-radius:3px;margin-right:4px;vertical-align:middle;border:1px solid #0002}</style>`;
for (const r of resultados) {
  const d = r.direccion;
  const nombre = r.brief.marca.nombre ?? d?.nombre_marca ?? r.id;
  console.log(`\n### ${r.id} · dirección ${d?.id} «${d?.nombre}» · status ${r.status} · direcciones ${r.segDirecciones} s + logo ${r.segundosTotal} s`);
  if (r.error) console.log(`[ERROR] ${r.error}`);
  if (d) {
    console.log(`  nombre: ${nombre} · tipografía: ${d.tipografias.titulos.familia} · sugerido: ${d.logo_sugerido.tipo} · paleta: ${d.paleta.map((c) => c.hex).join(" ")}`);
    html += `<h2>${nombre} · dirección ${d.id} «${d.nombre}» <small>(logo en ${r.segundosTotal} s)</small></h2><p>${d.paleta.map((c) => `<span class="chip" style="background:${c.hex}"></span>`).join("")} ${d.tipografias.titulos.familia} · ${d.formas}</p><div class="g">`;
  }
  for (const p of r.propuestas ?? []) {
    const ext = p.imagen.slice(5, p.imagen.indexOf(";")).split("/")[1];
    const archivo = `${r.id}-${d.id}-${p.tipo}.${ext}`;
    writeFileSync(join(SALIDA, archivo), Buffer.from(p.imagen.split(",")[1], "base64"));
    console.log(`- ${p.tipo} (${p.modelo}, ${p.segundos} s) ${p.colores.join(" ")}\n  ${p.concepto}`);
    html += `<div class="c"><img src="${archivo}"><p><b>${p.tipo}</b> · ${p.colores.map((c) => `<span class="chip" style="background:${c}"></span>`).join("")}</p><p>${p.concepto}</p></div>`;
  }
  html += `</div>`;
}
writeFileSync(join(SALIDA, "index.html"), html);
console.log(`\nLogos guardados en ${SALIDA} (abrí index.html)`);
