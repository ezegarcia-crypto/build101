// Los archivos finales de la marca, armados en el navegador (sin IA y sin servidor): el logo elegido en sus
// 4 versiones (versiones.ts), la paleta, las tipografías y el brandbook en HTML listo para guardar en PDF.
// Todo sale de lo que ya generó la IA para esta marca. El .zip se arma acá mismo (sin comprimir).

import { contraste, esperarFuente, type IdentidadIA, rolesDe, svgConTamano, textoSobre } from "./identidad";
import { coloresNegativo, type Versiones } from "./versiones";

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

/**
 * El símbolo exacto con el nombre al lado en la tipografía de títulos (el logo "símbolo con tu nombre"),
 * como lo muestra el brandbook. Fondo transparente, o del color que se pida.
 */
export async function simboloConNombre(identidad: IdentidadIA, alto: number, fondo?: string) {
  const { titulos } = identidad.tipografias;
  await esperarFuente(identidad.fuentes_url, titulos);
  const url = URL.createObjectURL(new Blob([svgConTamano(identidad.logo.isotipo_svg, alto)], { type: "image/svg+xml" }));
  try {
    const simbolo = await cargar(url);
    const margen = Math.round(alto * 0.25);
    const separacion = Math.round(alto * 0.28);
    const letra = `${Math.round(alto * 0.62)}px "${titulos}", Georgia, serif`;
    const medir = document.createElement("canvas").getContext("2d");
    if (!medir) throw new Error("Sin lienzo");
    medir.font = letra;
    const ancho = Math.ceil(margen * 2 + alto + separacion + medir.measureText(identidad.nombre).width);
    const lienzo = document.createElement("canvas");
    lienzo.width = ancho;
    lienzo.height = alto + margen * 2;
    const c = lienzo.getContext("2d");
    if (!c) throw new Error("Sin lienzo");
    if (fondo) {
      c.fillStyle = fondo;
      c.fillRect(0, 0, lienzo.width, lienzo.height);
    }
    c.drawImage(simbolo, margen, margen, alto, alto);
    c.font = letra;
    c.fillStyle = rolesDe(identidad.paleta).principal;
    c.textBaseline = "middle";
    c.fillText(identidad.nombre, margen + alto + separacion, margen + alto / 2);
    return lienzo;
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

function leeme(identidad: IdentidadIA, versiones: Versiones) {
  return [
    `Los archivos de ${identidad.nombre}, hechos con BrandIA`,
    "",
    "Solo lo que elegiste: las pruebas que fuiste viendo no vienen.",
    "",
    "logo/1-logo-completo.png · el logo completo: símbolo y nombre (fondo transparente)",
    "logo/2-solo-nombre.png · solo el nombre, en tu tipografía de títulos (fondo transparente)",
    versiones.lista.some((v) => v.clave === "simbolo")
      ? "logo/3-solo-simbolo.png · solo el símbolo: para el perfil de tus redes, el ícono de la web o un sello (fondo transparente)"
      : null,
    "logo/4-negativo.png · el logo en claro sobre el color oscuro de tu marca, para fondos oscuros",
    versiones.simboloSvg ? "logo/simbolo.svg · el símbolo en vector: se agranda sin perder calidad (imprenta, cartelería, bordado)" : null,
    "paleta.png y colores.txt · tus colores, con su código HEX y RGB",
    "tipografias.txt · tus dos tipografías y dónde bajarlas",
    "brandbook.html · tu manual de marca: abrilo en el navegador y guardalo como PDF (Imprimir → Guardar como PDF)",
    "",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

// ---- El brandbook en HTML ----

const esc = (t: string | null | undefined) =>
  (t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Mezcla dos colores hex (t = cuánto del segundo) */
function mezclar(a: string, b: string, t: number) {
  const canal = (h: string, i: number) => Number.parseInt(h.replace("#", "").slice(i, i + 2), 16);
  const v = [0, 2, 4].map((i) => Math.round(canal(a, i) * (1 - t) + canal(b, i) * t));
  return `#${v.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * El manual de marca con los colores y las letras del cliente: portada en su color principal y un bloque de
 * color por sección, siempre con el texto que mejor se lee encima. Se imprime en A4 (Guardar como PDF):
 * cada sección arranca en una hoja nueva y nada se corta entre hojas (tarjetas, colores y logos enteros).
 */
export function brandbookHtml(identidad: IdentidadIA, versiones: Versiones) {
  const { nombre, eslogan, esencia, voz, estilo, brandbook: bb, paleta, tipografias: t } = identidad;
  const c = rolesDe(paleta);
  const neg = coloresNegativo(paleta);
  const hex = (h: string) => /^#[0-9a-f]{6}$/i.test(h);
  const completo = versiones.lista.find((v) => v.clave === "completo")!;

  // Los bloques: el color de fondo de cada página y el texto que mejor se lee sobre él
  const bloque = (fondo: string) => ({ fondo, texto: contraste(fondo, c.texto) >= 4.5 ? c.texto : textoSobre(fondo, paleta) });
  const claro = bloque(c.fondo);
  const tinte = bloque(mezclar(c.fondo, c.principal, 0.1));
  const tinteAcento = bloque(hex(c.acento) ? mezclar(c.fondo, c.acento, 0.18) : tinte.fondo);
  const oscuro = { fondo: neg.oscuro, texto: neg.claro };
  // Un detalle de color en cada bloque (la raya del título), que se lea sobre su fondo
  const detalle = (fondo: string) =>
    [c.acento, c.principal, c.texto].find((x) => hex(x) && contraste(x, fondo) >= 2.2) ?? textoSobre(fondo, paleta);
  // Las portadillas van cada una en un color de la paleta (menos el fondo), en orden y dando la vuelta
  const coloresCapitulo = [c.principal, ...paleta.map((x) => x.hex)].filter(
    (h, i, todos) => hex(h) && contraste(h, c.fondo) >= 1.5 && todos.indexOf(h) === i,
  );

  const par = (titulo: string, valor?: string | null) =>
    valor ? `<div class="par"><h3>${esc(titulo)}</h3><p>${esc(valor)}</p></div>` : "";
  const lista = (items: string[], marca = "·") =>
    `<ul>${items.map((i) => `<li><span>${marca}</span>${esc(i)}</li>`).join("")}</ul>`;

  let capitulo = 0;
  let tituloCapitulo = "";
  // La marca de agua: el símbolo en blanco sobre los fondos oscuros y en negro sobre los claros, muy transparente
  const aguaPara = (fondo: string) => (contraste(fondo, "#ffffff") > contraste(fondo, "#000000") ? "var(--agua-claro)" : "var(--agua-oscuro)");
  /** La portadilla de un capítulo: a sangre en un color de la marca, con el símbolo gigante tono sobre tono */
  const portadilla = (titulo: string) => {
    capitulo += 1;
    tituloCapitulo = titulo;
    const fondo = coloresCapitulo[(capitulo - 1) % Math.max(1, coloresCapitulo.length)] ?? c.principal;
    const texto = textoSobre(fondo, paleta);
    return `<section class="portadilla" style="--fondo:${fondo};--texto:${texto};--agua:${aguaPara(fondo)}">
  <div class="agua" aria-hidden="true"></div>
  <p class="rotulo">${esc(nombre)} · Brandbook</p>
  <div><p class="num">${String(capitulo).padStart(2, "0")}</p><p class="cap">${esc(titulo)}</p></div>
</section>`;
  };
  /** Una página de contenido, con su título y su color de bloque */
  const seccion = (b: { fondo: string; texto: string }, titulo: string, cuerpo: string) =>
    `<section class="pagina" style="--fondo:${b.fondo};--texto:${b.texto};--detalle:${detalle(b.fondo)}">
  <header><p class="rotulo">${String(capitulo).padStart(2, "0")} · ${esc(tituloCapitulo)}</p><h2>${esc(titulo)}</h2></header>
  <div class="cuerpo">${cuerpo}</div>
</section>`;

  const versionesHtml = versiones.lista
    .map(
      (v) =>
        `<figure class="version"><div class="lamina" style="${v.fondo ? `background:${v.fondo}` : ""}"><img src="${v.imagen}" alt="${esc(v.titulo)}"></div><figcaption>${esc(v.titulo)}</figcaption></figure>`,
    )
    .join("");

  // El logo sobre cada color de la paleta, en el color que mejor se lee (con la silueta del logo completo)
  const sobreColores = paleta
    .filter((x) => hex(x.hex))
    .map(
      (x) =>
        `<figure class="version"><div class="lamina cuadrada" style="background:${x.hex};${contraste(x.hex, c.fondo) < 1.3 ? `box-shadow:inset 0 0 0 1px ${c.texto}22` : ""}"><div class="silueta logo-sil" style="background:${textoSobre(x.hex, paleta)}"></div></div><figcaption>${esc(x.nombre)}</figcaption></figure>`,
    )
    .join("");

  const ejemplos = (
    [
      ["Bio de Instagram", voz.ejemplos.bio_instagram],
      ["Un posteo", voz.ejemplos.posteo],
      ["Respuesta a un cliente", voz.ejemplos.respuesta_cliente],
      ["Un cartel", voz.ejemplos.cartel],
    ] as const
  )
    .map(([titulo, v]) => `<div class="caja ejemplo"><p class="mini">${titulo}</p><p>${esc(v)}</p></div>`)
    .join("");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Brandbook · ${esc(nombre)}</title>
<link rel="stylesheet" href="${esc(identidad.fuentes_url)}">
<style>
  @page { size: A4; margin: 0; }
  :root { --logo: url("${completo.imagen}"); --agua-claro: url("${versiones.agua.claro}"); --agua-oscuro: url("${versiones.agua.oscuro}"); }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; background: ${claro.fondo}; }
  body { color: ${claro.texto}; font: 16px/1.6 "${t.texto}", system-ui, sans-serif; }
  section { position: relative; background: var(--fondo); color: var(--texto); padding: 64px 8vw; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
  .pagina { display: flex; flex-direction: column; }
  .cuerpo { flex: 1; }
  header { margin-bottom: 36px; break-after: avoid; page-break-after: avoid; }
  header h2 { padding-top: 18px; border-top: 3px solid var(--detalle); max-width: 18ch; }
  .rotulo, .mini { font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; opacity: .75; margin: 0 0 14px; }
  h1, h2, .grande { font-family: "${t.titulos}", Georgia, serif; font-weight: 400; line-height: 1.05; margin: 0; }
  h1 { font-size: clamp(40px, 7vw, 76px); max-width: 15ch; }
  h2 { font-size: clamp(30px, 4.2vw, 46px); }
  h3 { font-size: 14px; margin: 0 0 6px; break-after: avoid; }
  p { margin: 0; max-width: 42em; }
  .intro { font-size: 18px; margin-bottom: 28px; }
  .grilla { display: grid; gap: 22px 28px; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); margin-top: 28px; }
  .caja { border-radius: 12px; padding: 20px 22px; background: color-mix(in srgb, var(--texto) 6%, var(--fondo)); }
  .caja .grande { font-size: 24px; }
  .par, .caja, .version, .color, li, .aa-caja, .bloque { break-inside: avoid; page-break-inside: avoid; }
  ul { list-style: none; padding: 0; margin: 8px 0 0; }
  li { display: flex; gap: 8px; }
  .pie { font-size: 12px; opacity: .7; }

  /* Tapa: el color principal entero, con el logo en claro */
  .tapa { min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; gap: 48px; overflow: hidden; }
  .tapa .logo { max-width: min(360px, 70vw); max-height: 200px; object-fit: contain; display: block; margin-bottom: 40px; }
  .tapa .idea { font-size: 19px; margin-top: 20px; max-width: 34em; }
  .franja { display: flex; height: 14px; border-radius: 999px; overflow: hidden; max-width: 420px; }
  .franja span { flex: 1; }

  /* Portadillas de capítulo: el símbolo gigante, tono sobre tono, de marca de agua */
  .portadilla { min-height: 70vh; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
  .portadilla > * { position: relative; }
  .agua { position: absolute !important; background: var(--agua) center / contain no-repeat; opacity: .12; }
  .agua { width: min(95vw, 900px); aspect-ratio: 1; right: -22%; bottom: -18%; }
  .num { font-family: "${t.titulos}", Georgia, serif; font-size: clamp(110px, 22vw, 220px); line-height: .9; }
  .cap { font-size: 15px; font-weight: 600; letter-spacing: .32em; text-transform: uppercase; margin-top: 18px; }

  /* Logo: versiones y usos */
  .versiones { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
  .versiones.chicas { grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); }
  .version { margin: 0; }
  .lamina { position: relative; aspect-ratio: 4 / 3; border-radius: 12px; background: ${c.fondo}; box-shadow: inset 0 0 0 1px ${c.texto}1f; overflow: hidden; }
  .lamina img, .silueta { position: absolute; inset: 14%; width: 72%; height: 72%; object-fit: contain; }
  .silueta { -webkit-mask: var(--logo) center / contain no-repeat; mask: var(--logo) center / contain no-repeat; }
  .lamina.cuadrada { aspect-ratio: 1; }
  figcaption { font-size: 13px; font-weight: 600; margin-top: 8px; }

  /* Paleta */
  .colores { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); }
  .color { aspect-ratio: .85; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; justify-content: flex-end; font-size: 13px; line-height: 1.35; }
  .aa { font-size: 96px; line-height: 1; margin: 0 0 8px; }
  .ejemplo { white-space: pre-line; }

  @media print {
    body { font-size: 13px; line-height: 1.5; }
    header { margin-bottom: 24px; }
    .grilla { gap: 16px 22px; margin-top: 20px; }
    .caja { padding: 14px 16px; }
    .aa { font-size: 80px; }
    section { padding: 18mm 17mm 12mm; min-height: 297mm; break-before: page; page-break-before: always; }
    section:first-of-type { break-before: auto; page-break-before: auto; }
    .tapa, .portadilla { height: 297mm; min-height: 0; overflow: hidden; }
    .agua { width: 190mm; }
    .grilla { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .versiones { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .versiones.chicas { grid-template-columns: repeat(5, minmax(0, 1fr)); }
    .colores { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  @media (max-width: 520px) { section { padding: 44px 20px; } .aa { font-size: 72px; } }
</style>
</head>
<body>
<section class="tapa" style="--fondo:${c.principal};--texto:${textoSobre(c.principal, paleta)}">
  <p class="rotulo">Brandbook · ${esc(nombre)}</p>
  <div>
    <img class="logo" src="${versiones.portada}" alt="Logo de ${esc(nombre)}">
    <h1>${esc(eslogan || nombre)}</h1>
    <p class="idea">${esc(esencia.idea)}</p>
  </div>
  <div>
    <div class="franja">${paleta.filter((x) => hex(x.hex)).map((x) => `<span style="background:${x.hex}"></span>`).join("")}</div>
    <p style="margin-top:24px">${esc(bb.introduccion)}</p>
  </div>
</section>
${portadilla("Esencia")}
${seccion(
  claro,
  "Quiénes somos",
  `${esencia.mision || esencia.vision ? `<div class="grilla">${par("Misión", esencia.mision)}${par("Visión", esencia.vision)}</div>` : ""}
  <div class="grilla">${par("Por qué existe", esencia.proposito)}${par("Lo que prometemos", esencia.promesa)}${par("Dónde nos paramos", esencia.posicionamiento)}${par("Para quién", esencia.publico)}</div>
  <div class="grilla">${esencia.valores.map((v) => `<div class="caja"><p class="grande">${esc(v.valor)}</p><p style="margin-top:8px">${esc(v.significa)}</p></div>`).join("")}</div>`,
)}
${portadilla("Logotipo")}
${seccion(
  tinte,
  "Tu logo",
  `<p class="intro">${esc(versiones.simboloSvg ? identidad.logo.explicacion : "Tu logo y sus cuatro versiones: completo, solo el nombre, solo el símbolo y en negativo, para fondos oscuros.")}</p>
  <div class="versiones">${versionesHtml}</div>
  <h3 style="margin-top:32px">Sobre cada color de la marca</h3>
  <div class="versiones chicas">${sobreColores}</div>
  <div class="grilla"><div class="par"><h3>Siempre</h3>${lista(bb.usos_correctos)}</div><div class="par"><h3>Nunca</h3>${lista(bb.usos_incorrectos, "×")}</div></div>`,
)}
${portadilla("Colores")}
${seccion(
  claro,
  "La paleta",
  `<div class="colores">${paleta
    .map(
      (col) =>
        `<div class="color" style="background:${col.hex};color:${textoSobre(col.hex, paleta)};${contraste(col.hex, c.fondo) < 1.3 ? `box-shadow:inset 0 0 0 1px ${c.texto}33` : ""}"><b>${esc(col.nombre)}</b><span>HEX ${col.hex.toUpperCase()}</span><span>RGB ${rgb(col.hex)}</span><span>${esc(col.rol)}</span></div>`,
    )
    .join("")}</div>
  <p style="margin-top:28px">${esc(estilo.uso_de_colores)}</p>`,
)}
${portadilla("Tipografía")}
${seccion(
  tinteAcento,
  "Las letras de la marca",
  `<div class="grilla">
    <div class="aa-caja"><p class="aa" style="font-family:'${esc(t.titulos)}',serif">Aa</p><p style="font-family:'${esc(t.titulos)}',serif;font-size:22px">${esc(t.titulos)}</p><p class="pie">Títulos</p></div>
    <div class="aa-caja"><p class="aa" style="font-family:'${esc(t.texto)}',sans-serif">Aa</p><p style="font-family:'${esc(t.texto)}',sans-serif;font-size:22px">${esc(t.texto)}</p><p class="pie">Texto</p></div>
  </div>
  <p class="grande" style="font-size:clamp(28px,4vw,44px);margin-top:48px;max-width:18ch">${esc(eslogan || nombre)}</p>
  <p style="margin-top:14px">${esc(esencia.promesa)}</p>`,
)}
${portadilla("Voz y tono")}
${seccion(
  oscuro,
  "Cómo habla la marca",
  `<p class="grande" style="font-size:clamp(24px,3vw,34px);max-width:26ch">${esc(voz.resumen)}</p>
  <div class="grilla">${voz.rasgos.map((r) => `<div class="caja"><h3 style="font-size:18px">${esc(r.rasgo)}</h3><p>Es · ${esc(r.es)}</p><p>No es · ${esc(r.no_es)}</p></div>`).join("")}</div>
  ${(voz.tono ?? []).length ? `<div class="grilla">${voz.tono.map((m) => `<div class="caja"><h3 style="font-size:18px">${esc(m.momento)}</h3><p>${esc(m.como)}</p><p style="margin-top:10px;font-style:italic">«${esc(m.ejemplo)}»</p></div>`).join("")}</div>` : ""}`,
)}
${seccion(
  tinte,
  "Así suena",
  `<div class="grilla"><div class="par"><h3>Palabras nuestras</h3>${lista(voz.palabras_si)}</div><div class="par"><h3>Nunca decimos</h3>${lista(voz.palabras_no, "×")}</div></div>
  <div class="grilla">${ejemplos}</div>`,
)}
${portadilla("Aplicaciones")}
${seccion(
  claro,
  "Cómo se usa",
  `<div class="grilla">${par("Fotografía", estilo.fotografia)}${par("Íconos e ilustración", estilo.iconos_e_ilustracion)}</div>
  <div class="grilla">${bb.aplicaciones.map((a) => `<div class="caja"><p class="grande" style="font-size:20px">${esc(a.donde)}</p><p style="margin-top:8px">${esc(a.como)}</p></div>`).join("")}</div>
  <p class="pie" style="margin-top:40px">Brandbook de ${esc(nombre)} · Hecho con BrandIA</p>`,
)}
</body>
</html>`;
}

// ---- Todos los archivos ----

/** Un data URL (las versiones del logo) como archivo */
export function deDataUrl(url: string) {
  const [cabeza, datos = ""] = url.split(",");
  const tipo = cabeza?.match(/data:([^;]+)/)?.[1] ?? "application/octet-stream";
  const binario = atob(datos);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return new Blob([bytes], { type: tipo });
}

const ARCHIVO_VERSION: Record<string, string> = {
  completo: "logo/1-logo-completo.png",
  nombre: "logo/2-solo-nombre.png",
  simbolo: "logo/3-solo-simbolo.png",
  negativo: "logo/4-negativo.png",
};

/** Solo lo final: el logo elegido en sus 4 versiones, la paleta y las tipografías que quedaron, y el brandbook */
export async function archivosDeMarca(identidad: IdentidadIA, versiones: Versiones) {
  const svg = identidad.logo.isotipo_svg;
  const archivos: Archivo[] = [];
  const sumar = async (nombre: string, armar: () => Promise<Uint8Array> | Uint8Array) => {
    try {
      archivos.push({ nombre, datos: await armar() });
    } catch (e) {
      console.error(`[descargas] ${nombre}:`, e); // si una imagen falla, el resto se descarga igual
    }
  };

  for (const v of versiones.lista) {
    await sumar(ARCHIVO_VERSION[v.clave] ?? `logo/${v.clave}.png`, async () => new Uint8Array(await deDataUrl(v.archivo).arrayBuffer()));
  }
  if (versiones.simboloSvg && svg) await sumar("logo/simbolo.svg", () => texto(svgConTamano(svg, 1024)));
  await sumar("paleta.png", () => paletaAPng(identidad));
  await sumar("colores.txt", () => texto(colores(identidad)));
  await sumar("tipografias.txt", () => texto(tipografias(identidad)));
  await sumar("brandbook.html", () => texto(brandbookHtml(identidad, versiones)));
  await sumar("LEEME.txt", () => texto(leeme(identidad, versiones)));
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
