// Prueba el módulo A de punta a punta sin pantallas: ficha → 3 direcciones → identidad de la dirección A.
// Usa 3 fichas fijas bien distintas (sin nombre, renovación, otro país y otro trato) y, si se le pasa,
// las fichas que salieron de scripts/probar-entrevista.mjs.
// Uso, con la web corriendo (npm run dev:web):
//   node scripts/probar-identidad.mjs [salida.html] [resultado-entrevistas.json]
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const [salida = "identidades.html", entrevistas] = process.argv.slice(2);

const base = {
  version: "0.2",
  referencias: [],
  restricciones: { obligatorio: [], a_conservar: [] },
  marca_actual: null,
  direccion_elegida: null,
};

const FICHAS = [
  {
    ...base,
    tipo_proyecto: "nueva",
    marca: { nombre: null, necesita_nombre: true, rubro: "Veterinaria a domicilio", ubicacion: "Montevideo, Uruguay", trato: "vos" },
    negocio: {
      que_hace: "Voy a tu casa a atender a tu perro o gato, así no lo estresás llevándolo a la clínica",
      diferencial: "Atención sin apuro, en el lugar donde el animal está tranquilo",
      posicion_precio: "intermedio",
      canales: ["WhatsApp", "Instagram"],
    },
    publico: { descripcion: "Familias y personas mayores con mascotas que se ponen nerviosas en la veterinaria", edad_aprox: "30 a 70", que_busca: "Comodidad y confianza" },
    personalidad: { palabras_si: ["tranquila", "confiable", "cariñosa"], palabras_no: ["fría", "clínica", "infantil"] },
    gustos: { marcas_admiradas: [], no_parecerse_a: ["las veterinarias con huellitas por todos lados"], colores_si: ["verde"], colores_no: ["rojo"] },
    aplicaciones_prioritarias: ["Instagram", "WhatsApp", "Uniforme"],
    huecos: ["marcas que admira"],
  },
  {
    ...base,
    tipo_proyecto: "renovacion",
    marca: { nombre: "Ferretería Don Aldo", necesita_nombre: false, rubro: "Ferretería de barrio", ubicacion: "Rosario, Argentina", trato: "vos" },
    negocio: {
      que_hace: "Ferretería de barrio desde 1978, ahora la lleva el nieto y quiere vender también online",
      diferencial: "Te asesoran de verdad y tienen el tornillo raro que nadie tiene",
      posicion_precio: "accesible",
      canales: ["Local", "Mercado Libre", "Instagram"],
    },
    publico: { descripcion: "Vecinos que arreglan cosas en su casa y algunos plomeros y electricistas del barrio", edad_aprox: null, que_busca: "Que les resuelvan el problema" },
    personalidad: { palabras_si: ["honesta", "práctica", "con historia"], palabras_no: ["cara", "corporativa"] },
    gustos: { marcas_admiradas: [{ nombre: "Stanley", por_que: "Se ve fuerte y simple" }], no_parecerse_a: ["Easy", "Sodimac"], colores_si: ["amarillo"], colores_no: [] },
    restricciones: { obligatorio: [], a_conservar: ["el nombre Don Aldo", "el año 1978"] },
    marca_actual: { logo: "Letras rojas en un cartel de chapa", gusta: ["que es reconocible en el barrio"], no_gusta: ["se ve viejo", "no se lee en el celular"] },
    aplicaciones_prioritarias: ["Cartel del local", "Mercado Libre", "Bolsas"],
    huecos: ["edad del público"],
  },
  {
    ...base,
    tipo_proyecto: "nueva",
    marca: { nombre: "Raíz", necesita_nombre: false, rubro: "Cosmética natural hecha a mano", ubicacion: "Ciudad de México, México", trato: "tu" },
    negocio: {
      que_hace: "Jabones y aceites corporales con plantas mexicanas, hechos a mano en pequeños lotes",
      diferencial: "Ingredientes de productores locales y cero plástico",
      posicion_precio: "premium",
      canales: ["Tienda online", "Bazares"],
    },
    publico: { descripcion: "Mujeres que cuidan lo que se ponen en la piel y se fijan en el origen", edad_aprox: "28 a 45", que_busca: "Productos honestos y bonitos para regalar" },
    personalidad: { palabras_si: ["sensorial", "honesta", "mexicana"], palabras_no: ["hippie", "barata", "folclórica"] },
    gustos: { marcas_admiradas: [{ nombre: "Aesop", por_que: "Elegante sin gritar" }], no_parecerse_a: ["Lush"], colores_si: ["terracota", "verde oliva"], colores_no: ["rosa"] },
    aplicaciones_prioritarias: ["Packaging", "Instagram", "Tienda online"],
    huecos: [],
  },
];

const fichas = [
  ...FICHAS,
  ...(entrevistas && existsSync(entrevistas)
    ? JSON.parse(readFileSync(entrevistas, "utf8")).map((r) => r.ficha).filter(Boolean)
    : []),
];

async function post(ruta, cuerpo) {
  const t0 = Date.now();
  const r = await fetch(`${BASE}${ruta}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`${ruta}: ${r.status} ${texto.slice(0, 300)}`);
  return { datos: JSON.parse(texto), segundos: ((Date.now() - t0) / 1000).toFixed(1) };
}

async function probar(brief) {
  const dir = await post("/api/direcciones", { brief });
  const direccion = dir.datos.direcciones[0];
  const ide = await post("/api/identidad", { brief, direccion });
  return { brief, direcciones: dir.datos.direcciones, identidad: ide.datos.identidad, tiempos: { direcciones: dir.segundos, identidad: ide.segundos } };
}

const resultados = await Promise.all(fichas.map((f) => probar(f).catch((e) => ({ brief: f, error: String(e) }))));

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const enlaces = new Set();
const bloques = resultados.map((r) => {
  const titulo = `${esc(r.brief.marca.nombre ?? "(sin nombre)")} · ${esc(r.brief.marca.rubro)} · ${esc(r.brief.tipo_proyecto)}`;
  if (r.error) return `<section><h1>${titulo}</h1><pre>${esc(r.error)}</pre></section>`;
  const i = r.identidad;
  enlaces.add(i.fuentes_url);
  const fondo = i.paleta.find((c) => c.rol === "fondo")?.hex ?? "#fff";
  const texto = i.paleta.find((c) => c.rol === "texto")?.hex ?? "#000";
  const dirs = r.direcciones
    .map(
      (d) =>
        `<div class="dir"><b>${d.id} · ${esc(d.nombre)}</b>${d.nombre_marca ? ` <i>(${esc(d.nombre_marca)})</i>` : ""}<p>${esc(d.idea)}</p><div class="pal">${d.paleta.map((c) => `<span style="background:${c.hex}" title="${esc(c.nombre)} · ${c.rol}"></span>`).join("")}</div><small>${esc(d.tipografias.titulos.familia)} + ${esc(d.tipografias.texto.familia)} · logo: ${d.logo_sugerido.tipo}</small></div>`,
    )
    .join("");
  return `<section>
  <h1>${titulo}</h1>
  <p class="meta">Direcciones: ${r.tiempos.direcciones} s · Identidad: ${r.tiempos.identidad} s</p>
  <div class="dirs">${dirs}</div>
  <div class="marca" style="background:${fondo};color:${texto}">
    <div class="lockup"><div class="iso">${i.logo.isotipo_svg}</div><h2 style="font-family:'${esc(i.tipografias.titulos)}'">${esc(i.nombre)}</h2></div>
    <p class="eslogan" style="font-family:'${esc(i.tipografias.titulos)}'">${esc(i.eslogan)}</p>
    <div style="font-family:'${esc(i.tipografias.texto)}'">
      <p><b>Idea:</b> ${esc(i.esencia.idea)}</p>
      <p><b>Propósito:</b> ${esc(i.esencia.proposito)}</p>
      <p><b>Promesa:</b> ${esc(i.esencia.promesa)}</p>
      <p><b>Valores:</b> ${i.esencia.valores.map((v) => esc(v.valor)).join(" · ")}</p>
      <p><b>Voz:</b> ${esc(i.voz.resumen)}</p>
      <ul>${Object.values(i.voz.ejemplos).map((f) => `<li>«${esc(f)}»</li>`).join("")}</ul>
      <p><b>Logo:</b> ${esc(i.logo.explicacion)}</p>
      <div class="pal grande">${i.paleta.map((c) => `<span style="background:${c.hex}"><small>${esc(c.nombre)}<br>${c.hex}</small></span>`).join("")}</div>
    </div>
  </div>
  <ul class="checks">${i.comprobaciones.map((c) => `<li>${c.ok ? "✅" : "⚠️"} <b>${esc(c.que)}:</b> ${esc(c.detalle)}</li>`).join("")}</ul>
</section>`;
});

writeFileSync(
  salida,
  `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Prueba de identidades · BrandIA</title>
${[...enlaces].map((u) => `<link rel="stylesheet" href="${esc(u)}">`).join("\n")}
<style>body{font-family:system-ui;margin:0;padding:24px;background:#EDECE8;color:#1E1E1C}section{max-width:900px;margin:0 auto 56px}
h1{font-size:18px}.meta{font-size:12px;color:#5C5A54}.dirs{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:16px}
.dir{background:#fff;border-radius:14px;padding:12px;font-size:14px}.pal{display:flex;gap:4px;margin:8px 0}.pal span{flex:1;height:28px;border-radius:4px;border:1px solid #0001}
.pal.grande span{height:72px;display:flex;align-items:flex-end;padding:4px;font-size:10px;color:#fff;text-shadow:0 0 3px #000}
.marca{border-radius:14px;padding:32px}.lockup{display:flex;align-items:center;gap:16px;flex-wrap:wrap}.iso{width:88px;height:88px;flex:none}.iso svg{width:100%;height:100%}
.lockup h2{font-size:44px;margin:0}.eslogan{font-size:22px;margin:8px 0 20px}.checks{font-size:14px}</style></head>
<body>${bloques.join("")}</body></html>`,
);
console.log(`Listo: ${salida}`);
for (const r of resultados) {
  const quien = r.brief.marca.nombre ?? "(sin nombre)";
  console.log(
    r.error
      ? `ERROR ${quien}: ${r.error}`
      : `${quien} → ${r.identidad.nombre} · direcciones ${r.tiempos.direcciones}s · identidad ${r.tiempos.identidad}s · ${r.identidad.comprobaciones.map((c) => `${c.que}: ${c.ok ? "ok" : "AJUSTE"}`).join(" / ")}`,
  );
}
