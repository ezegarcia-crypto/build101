// Los archivos finales de la marca, armados en el navegador (sin IA y sin servidor): el logo elegido,
// el símbolo en SVG y PNG, la paleta, las tipografías y el brandbook en HTML listo para guardar en PDF.
// Todo sale de lo que ya generó la IA para esta marca. El .zip se arma acá mismo (sin comprimir).

import {
  contraste,
  fondoParaSimbolo,
  type IdentidadIA,
  type LogoElegido,
  logoDeMarca,
  type PropuestaLogo,
  rolesDe,
  svgConTamano,
  svgSeguro,
  textoSobre,
} from "./identidad";

export type Archivo = { nombre: string; datos: Uint8Array };

const texto = (t: string) => new TextEncoder().encode(t);

export const slug = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "marca";

// ---- Imágenes ----

async function cargar(src: string) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

async function aPng(lienzo: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((ok) => lienzo.toBlob(ok, "image/png"));
  if (!blob) throw new Error("No se pudo armar la imagen");
  return new Uint8Array(await blob.arrayBuffer());
}

/** Una imagen (data URL o URL de objeto) pasada a PNG de `lado` × `lado`, con fondo si se pide */
async function imagenAPng(src: string, lado: number, fondo?: string) {
  const img = await cargar(src);
  const lienzo = document.createElement("canvas");
  lienzo.width = lienzo.height = lado;
  const c = lienzo.getContext("2d");
  if (!c) throw new Error("Sin lienzo");
  if (fondo) {
    c.fillStyle = fondo;
    c.fillRect(0, 0, lado, lado);
  }
  const escala = Math.min(lado / img.naturalWidth, lado / img.naturalHeight);
  const [w, h] = [img.naturalWidth * escala, img.naturalHeight * escala];
  c.drawImage(img, (lado - w) / 2, (lado - h) / 2, w, h);
  return aPng(lienzo);
}

/** El símbolo en PNG, con fondo transparente */
export async function simboloAPng(svg: string, lado: number) {
  const url = URL.createObjectURL(new Blob([svgConTamano(svg, lado)], { type: "image/svg+xml" }));
  try {
    return await imagenAPng(url, lado);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Las muestras de la paleta en una imagen, con su nombre y su código */
async function paletaAPng(identidad: IdentidadIA) {
  const { paleta } = identidad;
  const [ancho, alto] = [360, 480];
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho * paleta.length;
  lienzo.height = alto;
  const c = lienzo.getContext("2d");
  if (!c) throw new Error("Sin lienzo");
  paleta.forEach((color, i) => {
    c.fillStyle = color.hex;
    c.fillRect(i * ancho, 0, ancho, alto);
    c.fillStyle = textoSobre(color.hex, paleta);
    c.font = "600 30px system-ui, sans-serif";
    c.fillText(color.nombre, i * ancho + 28, alto - 92, ancho - 56);
    c.font = "26px system-ui, sans-serif";
    c.fillText(color.hex.toUpperCase(), i * ancho + 28, alto - 56);
    c.fillText(color.rol, i * ancho + 28, alto - 24);
  });
  return aPng(lienzo);
}

// ---- Textos ----

function rgb(hex: string) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16)).join(", ");
}

function colores(identidad: IdentidadIA) {
  return [
    `Paleta de ${identidad.nombre}`,
    "",
    ...identidad.paleta.map((c) => `${c.nombre} · ${c.rol}\n  HEX ${c.hex.toUpperCase()} · RGB ${rgb(c.hex)}`),
    "",
    identidad.estilo.uso_de_colores,
    "",
  ].join("\n");
}

function tipografias(identidad: IdentidadIA) {
  const link = (f: string) => `https://fonts.google.com/specimen/${f.replace(/ /g, "+")}`;
  return [
    `Tipografías de ${identidad.nombre} (gratis, de Google Fonts)`,
    "",
    `Títulos: ${identidad.tipografias.titulos}\n  ${link(identidad.tipografias.titulos)}`,
    `Texto: ${identidad.tipografias.texto}\n  ${link(identidad.tipografias.texto)}`,
    "",
  ].join("\n");
}

function leeme(identidad: IdentidadIA, logoEsSimbolo: boolean, propuestas: number) {
  return [
    `Los archivos de ${identidad.nombre}, hechos con BrandIA`,
    "",
    `logo.png · ${logoEsSimbolo ? "tu logo: el símbolo solo" : "el logo que elegiste"}, en alta (fondo ${logoEsSimbolo ? "transparente" : "blanco"})`,
    "simbolo.svg · el símbolo en vector: se agranda sin perder calidad (para imprenta, cartelería, bordado)",
    "simbolo.png · el símbolo con fondo transparente",
    propuestas ? `propuestas/ · las ${propuestas} propuestas de logo` : "",
    "paleta.png y colores.txt · tus colores, con su código HEX y RGB",
    "tipografias.txt · tus dos tipografías y dónde bajarlas",
    "brandbook.html · tu manual de marca: abrilo en el navegador y guardalo como PDF (Imprimir → Guardar como PDF)",
    "",
  ]
    .filter((l) => l !== "")
    .join("\n");
}

// ---- El brandbook en HTML ----

const esc = (t: string | null | undefined) =>
  (t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** El manual de marca en una sola página, con los colores y las letras del cliente. Se imprime en PDF. */
export function brandbookHtml(identidad: IdentidadIA, logo: PropuestaLogo | null) {
  const { nombre, eslogan, esencia, voz, estilo, brandbook: bb, paleta, tipografias: t, logo: simbolo } = identidad;
  const c = rolesDe(paleta);
  const sobrePrincipal = textoSobre(c.principal, paleta);
  const fondoSimbolo = fondoParaSimbolo(simbolo.isotipo_svg, paleta, c.fondo, c.principal);
  const svg = simbolo.isotipo_svg ? svgSeguro(simbolo.isotipo_svg) : "";
  const marcaLogo = logo
    ? `<img class="logo" src="${logo.imagen}" alt="Logo de ${esc(nombre)}">`
    : `<div class="simbolo">${svg}</div>`;
  const par = (titulo: string, valor?: string | null) =>
    valor ? `<div><h3>${esc(titulo)}</h3><p>${esc(valor)}</p></div>` : "";
  const lista = (items: string[], marca = "·") => `<ul>${items.map((i) => `<li><span>${marca}</span>${esc(i)}</li>`).join("")}</ul>`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Brandbook · ${esc(nombre)}</title>
<link rel="stylesheet" href="${esc(identidad.fuentes_url)}">
<style>
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; background: ${c.fondo}; color: ${c.texto}; font: 16px/1.6 "${t.texto}", system-ui, sans-serif; }
  section { padding: 56px 8vw; break-inside: avoid; page-break-inside: avoid; }
  section + section { border-top: 1px solid ${c.texto}22; }
  .portada { min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; }
  .rotulo { font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; opacity: .7; margin: 0 0 24px; }
  h1, h2, .grande { font-family: "${t.titulos}", Georgia, serif; font-weight: 400; line-height: 1.05; margin: 0; }
  h1 { font-size: clamp(40px, 7vw, 80px); max-width: 16ch; margin-top: 32px; }
  h2 { font-size: clamp(28px, 4vw, 44px); max-width: 24ch; }
  h3 { font-size: 14px; margin: 0 0 6px; }
  p { margin: 0; max-width: 40em; }
  .grilla { display: grid; gap: 28px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin-top: 28px; }
  .caja { border-radius: 10px; padding: 20px; box-shadow: inset 0 0 0 1px ${c.texto}26; }
  .logo { width: 220px; height: 220px; object-fit: contain; background: #fff; border-radius: 10px; }
  .simbolo { width: 140px; height: 140px; color: ${c.principal}; }
  .simbolo svg, .aplicado svg { width: 100%; height: 100%; }
  .aplicado { display: grid; place-items: center; min-height: 180px; border-radius: 10px; }
  .aplicado div { width: 96px; height: 96px; }
  .colores { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); margin-top: 28px; }
  .color { aspect-ratio: .9; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: flex-end; font-size: 13px; line-height: 1.35; }
  .aa { font-size: 88px; line-height: 1; }
  .voz { background: ${c.principal}; color: ${sobrePrincipal}; }
  .voz .caja { box-shadow: inset 0 0 0 1px ${sobrePrincipal}40; }
  ul { list-style: none; padding: 0; margin: 8px 0 0; }
  li { display: flex; gap: 8px; }
  .ejemplo { background: ${c.fondo}; color: ${c.texto}; border-radius: 10px; padding: 20px; white-space: pre-line; }
  .pie { font-size: 12px; opacity: .6; }
  @media print { section { padding: 36px 48px; } .portada { min-height: 90vh; } }
</style>
</head>
<body>
<section class="portada">
  <p class="rotulo">Brandbook · ${esc(nombre)}</p>
  <div>${marcaLogo}<h1>${esc(eslogan || nombre)}</h1><p style="margin-top:20px;font-size:18px">${esc(esencia.idea)}</p></div>
  <p style="margin-top:32px">${esc(bb.introduccion)}</p>
</section>
<section>
  <p class="rotulo">Esencia</p>
  <div class="grilla">${par("Misión", esencia.mision)}${par("Visión", esencia.vision)}</div>
  <div class="grilla">${par("Por qué existe", esencia.proposito)}${par("Lo que prometemos", esencia.promesa)}${par("Dónde nos paramos", esencia.posicionamiento)}${par("Para quién", esencia.publico)}</div>
  <div class="grilla">${esencia.valores.map((v) => `<div class="caja"><p class="grande" style="font-size:24px;color:${c.principal}">${esc(v.valor)}</p><p style="margin-top:8px">${esc(v.significa)}</p></div>`).join("")}</div>
</section>
<section>
  <p class="rotulo">Logo</p>
  ${logo ? `<div class="grilla"><img class="logo" src="${logo.imagen}" alt=""><p>${esc(logo.concepto)}</p></div>` : ""}
  ${
    svg
      ? `<div class="grilla"><div class="aplicado caja" style="color:${c.principal}"><div>${svg}</div></div><div class="aplicado" style="background:${fondoSimbolo}"><div>${svg}</div></div></div><p style="margin-top:20px">${esc(simbolo.explicacion)}</p>`
      : ""
  }
</section>
<section>
  <p class="rotulo">Paleta</p>
  <div class="colores">${paleta
    .map(
      (col) =>
        `<div class="color" style="background:${col.hex};color:${textoSobre(col.hex, paleta)};${contraste(col.hex, c.fondo) < 1.3 ? `box-shadow:inset 0 0 0 1px ${c.texto}33` : ""}"><b>${esc(col.nombre)}</b><span>${col.hex.toUpperCase()}</span><span>${esc(col.rol)}</span></div>`,
    )
    .join("")}</div>
  <p style="margin-top:24px">${esc(estilo.uso_de_colores)}</p>
</section>
<section>
  <p class="rotulo">Tipografías</p>
  <div class="grilla">
    <div><p class="aa" style="font-family:'${esc(t.titulos)}',serif">Aa</p><p style="font-family:'${esc(t.titulos)}',serif;font-size:20px">${esc(t.titulos)}</p><p class="pie">Títulos</p></div>
    <div><p class="aa" style="font-family:'${esc(t.texto)}',sans-serif">Aa</p><p style="font-family:'${esc(t.texto)}',sans-serif;font-size:20px">${esc(t.texto)}</p><p class="pie">Texto</p></div>
  </div>
</section>
<section class="voz">
  <p class="rotulo">Voz y tono</p>
  <h2>${esc(voz.resumen)}</h2>
  <div class="grilla">${voz.rasgos.map((r) => `<div class="caja"><h3 style="font-size:18px">${esc(r.rasgo)}</h3><p>Es · ${esc(r.es)}</p><p>No es · ${esc(r.no_es)}</p></div>`).join("")}</div>
  ${(voz.tono ?? []).length ? `<div class="grilla">${voz.tono.map((m) => `<div class="caja"><h3 style="font-size:18px">${esc(m.momento)}</h3><p>${esc(m.como)}</p><p style="margin-top:10px;font-style:italic">«${esc(m.ejemplo)}»</p></div>`).join("")}</div>` : ""}
  <div class="grilla"><div><h3>Palabras nuestras</h3>${lista(voz.palabras_si)}</div><div><h3>Nunca decimos</h3>${lista(voz.palabras_no, "×")}</div></div>
  <div class="grilla">${(
    [
      ["Bio de Instagram", voz.ejemplos.bio_instagram],
      ["Un posteo", voz.ejemplos.posteo],
      ["Respuesta a un cliente", voz.ejemplos.respuesta_cliente],
      ["Un cartel", voz.ejemplos.cartel],
    ] as const
  )
    .map(([titulo, v]) => `<div class="ejemplo"><p class="rotulo" style="margin-bottom:8px">${titulo}</p>${esc(v)}</div>`)
    .join("")}</div>
</section>
<section>
  <p class="rotulo">Cómo se usa</p>
  <div class="grilla">${par("Fotografía", estilo.fotografia)}${par("Íconos e ilustración", estilo.iconos_e_ilustracion)}<div><h3>Siempre</h3>${lista(bb.usos_correctos)}</div><div><h3>Nunca</h3>${lista(bb.usos_incorrectos, "×")}</div></div>
  <div class="grilla">${bb.aplicaciones.map((a) => `<div class="caja"><p class="grande" style="font-size:20px;color:${c.principal}">${esc(a.donde)}</p><p style="margin-top:8px">${esc(a.como)}</p></div>`).join("")}</div>
  <p class="pie" style="margin-top:40px">Hecho con BrandIA</p>
</section>
</body>
</html>`;
}

// ---- Todos los archivos ----

export async function archivosDeMarca(identidad: IdentidadIA, logos: PropuestaLogo[], elegido: LogoElegido | undefined) {
  const logo = logoDeMarca(logos, elegido);
  const svg = identidad.logo.isotipo_svg;
  const archivos: Archivo[] = [];
  const sumar = async (nombre: string, armar: () => Promise<Uint8Array> | Uint8Array) => {
    try {
      archivos.push({ nombre, datos: await armar() });
    } catch (e) {
      console.error(`[descargas] ${nombre}:`, e); // si una imagen falla, el resto se descarga igual
    }
  };

  if (logo) await sumar("logo.png", () => imagenAPng(logo.imagen, 1024, "#ffffff"));
  else if (svg) await sumar("logo.png", () => simboloAPng(svg, 1024));
  if (svg) {
    await sumar("simbolo.svg", () => texto(svgConTamano(svg, 1024)));
    await sumar("simbolo.png", () => simboloAPng(svg, 1024));
  }
  if (logos.length > 1) {
    for (const [i, l] of logos.entries()) await sumar(`propuestas/logo-${i + 1}.png`, () => imagenAPng(l.imagen, 1024, "#ffffff"));
  }
  await sumar("paleta.png", () => paletaAPng(identidad));
  await sumar("colores.txt", () => texto(colores(identidad)));
  await sumar("tipografias.txt", () => texto(tipografias(identidad)));
  await sumar("brandbook.html", () => texto(brandbookHtml(identidad, logo)));
  await sumar("LEEME.txt", () => texto(leeme(identidad, !logo, logos.length > 1 ? logos.length : 0)));
  return archivos;
}

// ---- El .zip (sin comprimir: los PNG ya vienen comprimidos) ----

const TABLA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(datos: Uint8Array) {
  let c = 0xffffffff;
  for (const b of datos) c = TABLA_CRC[(c ^ b) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function zip(archivos: Archivo[]) {
  const partes: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let desplazamiento = 0;
  const ahora = new Date();
  const hora = (ahora.getHours() << 11) | (ahora.getMinutes() << 5) | (ahora.getSeconds() >> 1);
  const dia = ((ahora.getFullYear() - 1980) << 9) | ((ahora.getMonth() + 1) << 5) | ahora.getDate();

  for (const a of archivos) {
    const nombre = texto(a.nombre);
    const crc = crc32(a.datos);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // nombres en UTF-8
    local.setUint16(10, hora, true);
    local.setUint16(12, dia, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, a.datos.length, true);
    local.setUint32(22, a.datos.length, true);
    local.setUint16(26, nombre.length, true);
    partes.push(new Uint8Array(local.buffer), nombre, a.datos);

    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true);
    cen.setUint16(4, 20, true);
    cen.setUint16(6, 20, true);
    cen.setUint16(8, 0x0800, true);
    cen.setUint16(12, hora, true);
    cen.setUint16(14, dia, true);
    cen.setUint32(16, crc, true);
    cen.setUint32(20, a.datos.length, true);
    cen.setUint32(24, a.datos.length, true);
    cen.setUint16(28, nombre.length, true);
    cen.setUint32(42, desplazamiento, true);
    central.push(new Uint8Array(cen.buffer), nombre);
    desplazamiento += 30 + nombre.length + a.datos.length;
  }

  const tamCentral = central.reduce((n, p) => n + p.length, 0);
  const fin = new DataView(new ArrayBuffer(22));
  fin.setUint32(0, 0x06054b50, true);
  fin.setUint16(8, archivos.length, true);
  fin.setUint16(10, archivos.length, true);
  fin.setUint32(12, tamCentral, true);
  fin.setUint32(16, desplazamiento, true);
  return new Blob([...partes, ...central, new Uint8Array(fin.buffer)] as BlobPart[], { type: "application/zip" });
}

/** Le da el archivo al navegador para que lo guarde */
export function bajar(datos: Blob, nombre: string) {
  const url = URL.createObjectURL(datos);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
