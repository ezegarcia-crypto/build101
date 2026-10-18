"use client";

import { createContext, type CSSProperties, Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";

import {
  cargarFuentes,
  contraste,
  fuente,
  type IdentidadIA,
  rolesDe,
  svgSeguro,
  textoSobre,
} from "@/components/brandbook/identidad";
import type { FichaWeb } from "@/lib/ia/web/ficha-web";
import type { Seccion, Web } from "@/lib/ia/web/web";

// La web del cliente dibujada con SU marca (design-system.md, punto 5: acá no va nada de BrandIA).
// La estructura y los textos los escribe la IA; los colores, las tipografías y el logo salen de la identidad;
// los datos de contacto salen de la ficha de la web, tal cual los dijo la persona.
//
// Se arma como el chasis web de Gary+ (design-system/formatos/web-interactivo.md): un chasis fijo que
// siempre sale bien (preloader con el isotipo, header que pasa a blur al bajar con barra de progreso,
// héroe a pantalla completa, título que se revela palabra por palabra, bloques que entran al aparecer)
// y un cuerpo flexible con las secciones que escribió la IA. Respeta "reducir movimiento" y, sin JS,
// se ve todo igual (sin animación).
// Usa consultas de contenedor (@container) para que la vista "celular" se vea como en un celular de verdad,
// y el scroll del contenedor donde vive (la vista previa o la web publicada), no el de la ventana.

type Boton = NonNullable<Seccion["boton"]>;

/** WhatsApp: si el número no trae país y empieza con 0, se asume Uruguay (+598) */
function linkWhatsapp(numero: string, mensaje?: string | null) {
  let d = numero.replace(/\D/g, "");
  if (!numero.trim().startsWith("+") && d.startsWith("0")) d = `598${d.slice(1)}`;
  return `https://wa.me/${d}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ""}`;
}

function destino(boton: Boton, ficha: FichaWeb): string | null {
  const c = ficha.contacto;
  switch (boton.accion) {
    case "whatsapp":
      return c.whatsapp ? linkWhatsapp(c.whatsapp, boton.mensaje) : null;
    case "telefono": {
      const tel = c.telefono ?? c.whatsapp;
      return tel ? `tel:${tel.replace(/[^\d+]/g, "")}` : null;
    }
    case "email":
      return c.email ? `mailto:${c.email}` : null;
    case "instagram":
      return c.instagram ? `https://instagram.com/${c.instagram.replace(/^@/, "")}` : null;
    case "mapa":
      return c.direccion
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([c.direccion, c.zona].filter(Boolean).join(", "))}`
        : null;
    default:
      return null;
  }
}

type Colores = ReturnType<typeof rolesDe> & {
  sobrePrincipal: string;
  titulos: string;
  texto2: string;
  /** El más oscuro y el más claro entre el fondo y el texto: para las bandas oscuras y el héroe */
  tinta: string;
  claro: string;
  /** El color de apoyo de la paleta (si no tiene, el acento): para las bandas suaves y los números */
  apoyo: string;
};

function BotonWeb({
  boton,
  ficha,
  colores,
  grande,
  sobreOscuro,
}: {
  boton: Boton;
  ficha: FichaWeb;
  colores: Colores;
  grande?: boolean;
  sobreOscuro?: boolean;
}) {
  if (boton.accion === "ninguna") return null;
  const href = destino(boton, ficha);
  const clase = `inline-flex items-center justify-center rounded-full font-semibold ${grande ? "px-7 py-4 text-base" : "px-5 py-2.5 text-sm"}`;
  if (!href) {
    // El botón existe pero la persona no dio el dato: se marca, no se inventa
    return (
      <span className={`${clase} border-2 border-dashed opacity-70`} style={{ borderColor: "currentColor" }}>
        {boton.texto} · falta tu {boton.accion === "mapa" ? "dirección" : boton.accion}
      </span>
    );
  }
  // Sobre una banda oscura, si el color principal casi no se distingue del fondo, el botón va en claro
  const invertir = sobreOscuro && contraste(colores.principal, colores.tinta) < 2;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`vw-boton ${clase}`}
      style={
        invertir
          ? { background: colores.claro, color: colores.tinta }
          : { background: colores.principal, color: colores.sobrePrincipal }
      }
    >
      {boton.texto}
    </a>
  );
}

/** Las fotos que generó la IA, por su descripción (la que escribió en `seccion.foto`), y si hay alguna en camino */
const FotosWeb = createContext<{ fotos: Record<string, string>; generando: boolean }>({ fotos: {}, generando: false });

/**
 * El lugar de la foto. Si la IA ya la generó, va la foto, marcada como ilustrativa (no es del negocio).
 * Si no, se dice qué foto va, sin hacerla pasar por real.
 */
function Foto({ texto, colores, alto, lento }: { texto: string; colores: Colores; alto?: boolean; lento?: boolean }) {
  const { fotos, generando } = useContext(FotosWeb);
  const url = fotos[texto];
  return (
    <figure
      className={`vw-rev vw-foto relative grid place-items-end overflow-hidden rounded-[16px] p-4 ${alto ? "aspect-[4/3]" : "aspect-[16/10] @2xl:aspect-[4/3]"} ${!url && generando ? "animate-pulse" : ""}`}
      // Un tono suave del color de apoyo: el acento es para detalles (muchos brandbooks prohíben llenar piezas con él)
      style={{ background: `${colores.apoyo}26`, color: colores.texto }}
    >
      {url ? (
        <>
          <img src={url} alt={texto} className={`absolute inset-0 size-full object-cover ${lento ? "vw-kb" : ""}`} loading="lazy" />
          <figcaption className="relative rounded-full bg-black/45 px-2.5 py-1 text-[11px] leading-none text-white">
            Foto ilustrativa
          </figcaption>
        </>
      ) : (
        <figcaption className="text-xs leading-snug opacity-80">
          {generando ? "Generando la foto…" : `Foto · ${texto}`}
        </figcaption>
      )}
    </figure>
  );
}

function Falta({ que }: { que: string }) {
  return (
    <span className="inline-block rounded-full border border-dashed px-3 py-1 text-xs opacity-70" style={{ borderColor: "currentColor" }}>
      Falta: {que}
    </span>
  );
}

/** El SVG del isotipo como imagen, para dibujarlo en el campo de partículas */
function isotipoComoImagen(svg: string) {
  const limpio = svgSeguro(svg);
  const conXmlns = /xmlns=/.test(limpio) ? limpio : limpio.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(conXmlns)}`;
}

/**
 * El logo de la marca, el que eligió la persona en el brandbook. Si eligió una propuesta completa, va esa imagen
 * (ya trae el nombre); si eligió el símbolo, o no hay propuesta, el isotipo con el nombre en la tipografía de títulos.
 * Sobre un fondo oscuro, la imagen va sobre una pastilla clara para que se lea (las propuestas se dibujan sobre blanco).
 */
function LogoMarca({
  imagen,
  svg,
  nombre,
  colores,
  sobreOscuro,
  tamano,
}: {
  imagen?: string | null;
  svg: string;
  nombre: string;
  colores: Colores;
  sobreOscuro?: boolean;
  tamano: "chico" | "medio" | "grande";
}) {
  if (imagen) {
    const alto = {
      chico: "h-7 max-w-[min(150px,100%)]",
      medio: "h-10 max-w-[min(190px,100%)]",
      grande: "h-20 max-w-[min(260px,100%)]",
    }[tamano];
    return (
      <span
        className={`inline-flex min-w-0 items-center ${sobreOscuro ? "rounded-[10px] px-2.5 py-1.5" : ""}`}
        style={sobreOscuro ? { background: colores.claro } : undefined}
      >
        <img src={imagen} alt={nombre} className={`block w-auto object-contain ${alto}`} />
      </span>
    );
  }
  const iso = { chico: "size-6", medio: "size-9", grande: "size-[68px]" }[tamano];
  const texto = { chico: "text-sm", medio: "text-xl", grande: "text-xl" }[tamano];
  return (
    <span className={`flex min-w-0 items-center gap-2.5 ${tamano === "grande" ? "flex-col gap-5" : ""}`}>
      {svg && (
        <span
          className={`block shrink-0 [&>svg]:size-full ${iso}`}
          aria-hidden="true"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: el SVG ya viene limpio de /api/identidad
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
      <span className={`truncate ${texto}`} style={{ fontFamily: colores.titulos }}>
        {nombre}
      </span>
    </span>
  );
}

/**
 * El héroe con vida cuando no hay foto: el isotipo de la marca flotando en partículas, como el campo
 * de partículas del "+" del chasis de Gary. Nada genérico: es siempre el símbolo del cliente.
 */
function CampoMarca({ svg, intensidad = 1 }: { svg: string; intensidad?: number }) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = lienzo.current;
    if (!c || !svg || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const x = c.getContext("2d");
    if (!x) return;
    const img = new Image();
    img.src = isotipoComoImagen(svg);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let cuadro = 0;
    const medir = () => {
      w = c.width = c.offsetWidth * dpr;
      h = c.height = c.offsetHeight * dpr;
    };
    medir();
    const puntos = Array.from({ length: 26 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      t: (14 + Math.random() * (i % 5 === 0 ? 70 : 34)) * dpr,
      a: (0.08 + Math.random() * (i % 5 === 0 ? 0.35 : 0.18)) * intensidad,
      vx: (Math.random() - 0.5) * 0.00018,
      vy: -0.00008 - Math.random() * 0.00022,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.004,
    }));
    const paso = () => {
      x.clearRect(0, 0, w, h);
      if (img.complete && img.naturalWidth !== 0) {
        for (const p of puntos) {
          p.x += p.vx;
          p.y += p.vy;
          p.r += p.vr;
          if (p.y < -0.1) p.y = 1.1;
          if (p.x < -0.1) p.x = 1.1;
          if (p.x > 1.1) p.x = -0.1;
          x.save();
          x.globalAlpha = p.a;
          x.translate(p.x * w, p.y * h);
          x.rotate(p.r);
          x.drawImage(img, -p.t / 2, -p.t / 2, p.t, p.t);
          x.restore();
        }
      }
      cuadro = requestAnimationFrame(paso);
    };
    paso();
    const ro = new ResizeObserver(medir);
    ro.observe(c);
    return () => {
      cancelAnimationFrame(cuadro);
      ro.disconnect();
    };
  }, [svg, intensidad]);
  return <canvas ref={lienzo} className="absolute inset-0 size-full" aria-hidden="true" />;
}

/** Un título que se revela palabra por palabra (cada palabra sube desde abajo de su renglón) */
function TituloRevelado({ texto, estilo, clase }: { texto: string; estilo: CSSProperties; clase: string }) {
  return (
    <h1 className={clase} style={estilo}>
      {texto.split(/\s+/).map((palabra, i) => (
        // El espacio va afuera de la palabra: adentro de un inline-block se pierde
        // biome-ignore lint/suspicious/noArrayIndexKey: las palabras se repiten y el orden no cambia
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="vw-palabra">
            <span style={{ transitionDelay: `${120 + i * 60}ms` }}>{palabra}</span>
          </span>
        </Fragment>
      ))}
    </h1>
  );
}

/** El héroe a pantalla completa, con la foto de fondo: solo para el estilo "vidriera" (fotos grandes, poco texto) */
function PortadaInmersiva({ s, ficha, colores, svg }: { s: Seccion; ficha: FichaWeb; colores: Colores; svg: string }) {
  const { fotos, generando } = useContext(FotosWeb);
  const url = s.foto ? fotos[s.foto] : undefined;
  const lugar = ficha.contacto.zona ?? "";
  return (
    <section
      id={s.id}
      className="vw-hero relative -mt-[68px] flex min-h-[600px] items-end overflow-hidden @2xl:min-h-[680px] @2xl:items-center"
      style={{ background: colores.tinta, color: colores.claro }}
    >
      {url ? (
        <img src={url} alt={s.foto ?? ""} className="vw-kb absolute inset-0 size-full object-cover" />
      ) : (
        <CampoMarca svg={svg} />
      )}
      {/* Velo para que el texto se lea sobre la foto, con la tinta de la marca */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: url
            ? `linear-gradient(0deg, ${colores.tinta}f2 0%, ${colores.tinta}99 38%, ${colores.tinta}26 75%), linear-gradient(90deg, ${colores.tinta}8c 0%, ${colores.tinta}00 60%)`
            : `radial-gradient(120% 120% at 80% 10%, ${colores.principal}33 0%, ${colores.tinta}00 55%)`,
        }}
      />
      <div className={`relative z-10 mx-auto w-full max-w-[1180px] px-5 pt-[120px] pb-16 @2xl:px-10`}>
        <p
          className={`vw-ceja vw-sube mb-6 inline-flex items-center gap-2.5 text-xs font-semibold tracking-[.2em] uppercase opacity-85`}
          style={{ transitionDelay: "60ms" }}
        >
          <NombreYLugar lugar={lugar} />
        </p>
        <TituloRevelado
          texto={s.titulo}
          estilo={{ fontFamily: colores.titulos }}
          clase={`text-[2.6rem] leading-[1] tracking-[-.02em] @md:text-[3.2rem] @2xl:text-[4.6rem] @5xl:text-[5.4rem] max-w-[15ch]`}
        />
        {s.texto && (
          <p
            className={`vw-sube mt-6 max-w-[34em] text-base leading-relaxed opacity-85 @2xl:text-xl`}
            style={{ transitionDelay: "520ms" }}
          >
            {s.texto}
          </p>
        )}
        {s.boton && (
          <div className="vw-sube mt-8" style={{ transitionDelay: "680ms" }}>
            <BotonWeb boton={s.boton} ficha={ficha} colores={colores} grande sobreOscuro />
          </div>
        )}
      </div>
      {url && (
        <span className="absolute right-4 bottom-4 z-10 rounded-full bg-black/45 px-2.5 py-1 text-[11px] leading-none text-white">
          Foto ilustrativa
        </span>
      )}
      {!url && s.foto && generando && (
        <span className="absolute right-4 bottom-4 z-10 animate-pulse rounded-full bg-black/35 px-2.5 py-1 text-[11px] leading-none text-white">
          Generando la foto…
        </span>
      )}
      <span className="vw-cue absolute bottom-6 left-5 z-10 hidden @2xl:left-10 @2xl:flex" aria-hidden="true">
        <i style={{ background: colores.acento }} />
      </span>
    </section>
  );
}

// El nombre de la marca no viaja en `web` ni en la ficha de la web: lo pone VistaWeb en este contexto
const NombreMarca = createContext("");

/** La ceja del héroe: el nombre de la marca y la zona, con el punto de color de la marca */
function NombreYLugar({ lugar }: { lugar: string }) {
  const nombre = useContext(NombreMarca);
  return (
    <>
      {nombre}
      {lugar && ` · ${lugar}`}
    </>
  );
}

/**
 * El héroe de siempre (fondo claro, el texto al lado de la foto, o centrado en el estilo "cercana"),
 * con lo que suma el chasis: la ceja, el título que se revela palabra por palabra, la foto con un zoom lento
 * y, si todavía no hay foto, el isotipo de la marca flotando suave de fondo.
 */
function Portada({ s, web, ficha, colores, svg }: { s: Seccion; web: Web; ficha: FichaWeb; colores: Colores; svg: string }) {
  const { fotos } = useContext(FotosWeb);
  if (web.estilo === "vidriera") return <PortadaInmersiva s={s} ficha={ficha} colores={colores} svg={svg} />;
  const url = s.foto ? fotos[s.foto] : undefined;
  const centrada = web.estilo === "cercana";
  return (
    <section id={s.id} className="vw-hero relative overflow-hidden">
      {!url && (
        <div className="absolute inset-0">
          <CampoMarca svg={svg} intensidad={0.45} />
        </div>
      )}
      <div
        className={`relative mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-12 @2xl:px-10 @2xl:py-20 ${s.foto && !centrada ? "@2xl:grid-cols-2 @2xl:items-center" : ""}`}
      >
        <div className={`flex flex-col gap-5 ${centrada ? "items-center text-center" : ""}`}>
          <p className="vw-ceja vw-sube inline-flex items-center gap-2.5 text-xs font-semibold tracking-[.2em] uppercase opacity-60">
            <NombreYLugar lugar={ficha.contacto.zona ?? ""} />
          </p>
          <TituloRevelado
            texto={s.titulo}
            estilo={{ fontFamily: colores.titulos }}
            clase="max-w-[15ch] text-[2.4rem] leading-[1.02] tracking-[-.02em] @2xl:text-[3.6rem] @5xl:text-[4.2rem]"
          />
          {s.texto && (
            <p className="vw-sube max-w-[32em] text-base leading-relaxed opacity-85 @2xl:text-lg" style={{ transitionDelay: "480ms" }}>
              {s.texto}
            </p>
          )}
          {s.boton && (
            <div className="vw-sube mt-2" style={{ transitionDelay: "620ms" }}>
              <BotonWeb boton={s.boton} ficha={ficha} colores={colores} grande />
            </div>
          )}
        </div>
        {s.foto && (
          <div className="vw-sube" style={{ transitionDelay: "300ms" }}>
            <Foto texto={s.foto} colores={colores} alto={centrada} lento />
          </div>
        )}
      </div>
    </section>
  );
}

/** La ceja de cada sección (como el epígrafe del chasis): un número con el punto de color de la marca */
function Ceja({ n, claro }: { n: number; claro?: boolean }) {
  return (
    <p className={`vw-ceja mb-4 inline-flex items-center gap-2.5 text-xs font-semibold tracking-[.2em] uppercase ${claro ? "opacity-80" : "opacity-60"}`}>
      {String(n).padStart(2, "0")}
    </p>
  );
}

function SeccionWeb({
  s,
  n,
  web,
  ficha,
  colores,
  svg,
}: {
  s: Seccion;
  n: number;
  web: Web;
  ficha: FichaWeb;
  colores: Colores;
  svg: string;
}) {
  const titulo = { fontFamily: colores.titulos };
  const c = ficha.contacto;
  const ancho = "mx-auto w-full max-w-[1180px] px-5 @2xl:px-10";

  if (s.tipo === "portada") return <Portada s={s} web={web} ficha={ficha} colores={colores} svg={svg} />;

  if (s.tipo === "destacado") {
    return (
      <section
        id={s.id}
        className="py-14 @2xl:py-20"
        style={{
          background: `radial-gradient(120% 140% at 15% 0%, ${colores.principal} 0%, ${colores.principal} 40%, ${colores.tinta}55 140%)`,
          color: colores.sobrePrincipal,
        }}
      >
        <div className={`vw-rev ${ancho}`}>
          <p className="max-w-[22ch] text-[1.9rem] leading-[1.08] @2xl:text-[3rem]" style={titulo}>
            {s.titulo}
          </p>
          {s.texto && <p className="mt-4 max-w-[40em] text-base opacity-90 @2xl:text-lg">{s.texto}</p>}
          {s.boton && (
            <div className="mt-6">
              <BotonWeb boton={s.boton} ficha={ficha} colores={{ ...colores, principal: colores.fondo, sobrePrincipal: colores.texto }} />
            </div>
          )}
        </div>
      </section>
    );
  }

  const encabezado = (
    <div className="vw-rev">
      <Ceja n={n} />
      <h2 className="max-w-[18ch] text-[2rem] leading-[1.02] tracking-[-.015em] @2xl:text-[3.1rem]" style={titulo}>
        {s.titulo}
      </h2>
      {s.texto && <p className="mt-4 max-w-[38em] text-[15.5px] leading-relaxed opacity-80 @2xl:text-lg">{s.texto}</p>}
    </div>
  );

  if (s.tipo === "ubicacion") {
    return (
      <section id={s.id} className="py-16 @2xl:py-24">
        <div className={`grid gap-8 @2xl:grid-cols-2 @2xl:items-center ${ancho}`}>
          <div>
            {encabezado}
            <dl
              className="vw-rev vw-card mt-8 flex flex-col gap-4 rounded-[16px] border p-6 text-[15px]"
              style={{ borderColor: `${colores.texto}1f`, background: `${colores.claro}66` }}
            >
              <div>
                <dt className="text-[11px] font-semibold tracking-[.14em] uppercase opacity-60">Dirección</dt>
                <dd className="mt-1">{c.direccion ? [c.direccion, c.zona].filter(Boolean).join(" · ") : <Falta que="la dirección" />}</dd>
              </div>
              <div className="border-t pt-4" style={{ borderColor: `${colores.texto}14` }}>
                <dt className="text-[11px] font-semibold tracking-[.14em] uppercase opacity-60">Horarios</dt>
                <dd className="mt-1">{c.horarios ?? <Falta que="el horario" />}</dd>
              </div>
              {s.boton && (
                <div className="pt-1">
                  <BotonWeb boton={s.boton} ficha={ficha} colores={colores} />
                </div>
              )}
            </dl>
          </div>
          {s.foto && <Foto texto={s.foto} colores={colores} />}
        </div>
      </section>
    );
  }

  if (s.tipo === "contacto") {
    const datos = [c.whatsapp && `WhatsApp ${c.whatsapp}`, c.telefono && `Tel. ${c.telefono}`, c.email, c.instagram].filter(Boolean);
    return (
      <section id={s.id} className="border-t py-20 @2xl:py-28" style={{ borderColor: `${colores.texto}14` }}>
        <div className={`vw-rev flex flex-col items-start gap-5 ${ancho}`}>
          <Ceja n={n} />
          <h2 className="max-w-[16ch] text-[2.3rem] leading-[1] tracking-[-.02em] @2xl:text-[3.8rem]" style={titulo}>
            {s.titulo}
          </h2>
          {s.texto && <p className="max-w-[36em] text-base leading-relaxed opacity-85 @2xl:text-lg">{s.texto}</p>}
          {datos.length > 0 && <p className="text-sm opacity-70">{datos.join(" · ")}</p>}
          {s.boton && (
            <div className="mt-2">
              <BotonWeb boton={s.boton} ficha={ficha} colores={colores} grande />
            </div>
          )}
        </div>
      </section>
    );
  }

  // productos, como_pedir y sobre
  const pasos = s.tipo === "como_pedir";
  return (
    <section id={s.id} className="py-16 @2xl:py-24" style={pasos ? { background: colores.texto2 } : undefined}>
      <div className={ancho}>
        <div className={s.foto && s.tipo === "sobre" ? "grid gap-8 @2xl:grid-cols-2 @2xl:items-center" : ""}>
          {encabezado}
          {s.foto && s.tipo === "sobre" && <Foto texto={s.foto} colores={colores} alto />}
        </div>
        {s.items.length > 0 && (
          <ol className={`mt-10 grid gap-4 ${s.items.length > 1 ? "@xl:grid-cols-2" : ""} ${s.items.length > 2 ? "@4xl:grid-cols-3" : ""}`}>
            {s.items.map((it, i) => (
              <li
                key={`${it.titulo}-${i}`}
                className="vw-rev vw-card flex gap-4 rounded-[16px] border p-6"
                style={{ borderColor: `${colores.texto}1f`, background: `${colores.claro}55`, transitionDelay: `${pasos ? i * 140 : (i % 3) * 80}ms` }}
              >
                <span className="num shrink-0 text-[1.9rem] leading-none opacity-70" style={{ ...titulo, color: colores.apoyo }}>
                  {pasos ? i + 1 : String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[1.2rem] leading-snug @2xl:text-[1.3rem]" style={titulo}>
                    {it.titulo}
                  </p>
                  {it.texto && <p className="mt-1.5 text-[14.5px] leading-relaxed opacity-75">{it.texto}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
        {s.foto && s.tipo !== "sobre" && (
          <div className="mt-10">
            <Foto texto={s.foto} colores={colores} />
          </div>
        )}
        {s.boton && (
          <div className="vw-rev mt-10">
            <BotonWeb boton={s.boton} ficha={ficha} colores={colores} />
          </div>
        )}
      </div>
    </section>
  );
}

/** El contenedor con scroll donde vive la vista (la vista previa o la página publicada), o la ventana */
function contenedorConScroll(el: HTMLElement | null): HTMLElement | null {
  let p = el?.parentElement ?? null;
  while (p) {
    const oy = getComputedStyle(p).overflowY;
    if (oy === "auto" || oy === "scroll") return p;
    p = p.parentElement;
  }
  return null;
}

// Los estilos del chasis (movimiento y estados), con las variables de la marca. Van acá y no en un .css
// porque son de la web del cliente, no de BrandIA.
const ESTILOS = `
.vw{--ease:cubic-bezier(.16,1,.3,1)}
.vw .vw-pre{position:absolute;inset-inline:0;top:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:var(--vw-tinta);color:var(--vw-claro);transition:transform .9s var(--ease);animation:vwPreFuera .9s var(--ease) 3s forwards}
.vw .vw-pre.fuera{transform:translateY(-101%)}
.vw .vw-pre .iso{display:block;width:68px;height:68px;opacity:0;animation:vwAparece .7s var(--ease) .1s forwards}
.vw .vw-pre .iso>svg{width:100%;height:100%}
.vw .vw-pre .nom{opacity:0;animation:vwAparece .7s var(--ease) .25s forwards}
.vw .vw-pre .barra{width:140px;height:2px;border-radius:2px;overflow:hidden;background:color-mix(in srgb,var(--vw-claro) 18%,transparent)}
.vw .vw-pre .barra i{display:block;height:100%;width:0;background:var(--vw-acento);animation:vwLlena 1s var(--ease) .15s forwards}
@keyframes vwPreFuera{to{transform:translateY(-101%)}}
@keyframes vwAparece{to{opacity:1}}
@keyframes vwLlena{to{width:100%}}
.vw .vw-ceja::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--vw-acento);flex:none}
.vw.vw-js .vw-rev{opacity:0;transform:translateY(26px);transition:opacity .8s var(--ease),transform .8s var(--ease)}
.vw.vw-js .vw-rev.in{opacity:1;transform:none}
.vw .vw-palabra{display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.1em;margin-bottom:-.1em}
.vw .vw-palabra>span{display:inline-block}
.vw.vw-js .vw-palabra>span{transform:translateY(112%);transition:transform 1s var(--ease)}
.vw.vw-js .vw-hero.arriba .vw-palabra>span{transform:none}
.vw.vw-js .vw-hero .vw-sube{opacity:0;transform:translateY(18px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
.vw.vw-js .vw-hero.arriba .vw-sube{opacity:1;transform:none}
.vw .vw-kb{animation:vwKb 10s var(--ease) forwards}
@keyframes vwKb{from{transform:scale(1.1)}to{transform:scale(1)}}
.vw .vw-cue{width:40px;height:2px;overflow:hidden;background:color-mix(in srgb,var(--vw-claro) 30%,transparent)}
.vw .vw-cue i{display:block;width:45%;height:100%;animation:vwCue 1.8s ease-in-out infinite}
@keyframes vwCue{from{transform:translateX(-100%)}to{transform:translateX(260%)}}
.vw .vw-card{transition:border-color .3s,box-shadow .35s,transform .35s var(--ease),opacity .8s var(--ease)}
.vw .vw-card:hover{border-color:color-mix(in srgb,var(--vw-principal) 55%,transparent)!important;transform:translateY(-2px);box-shadow:0 24px 50px -38px color-mix(in srgb,var(--vw-tinta) 70%,transparent)}
.vw .vw-card .num{transition:color .3s,opacity .3s}
.vw .vw-card:hover .num{color:var(--vw-principal);opacity:1}
.vw .vw-boton{transition:transform .3s var(--ease),box-shadow .3s}
.vw .vw-boton:hover{transform:translateY(-1px);box-shadow:0 16px 32px -18px color-mix(in srgb,var(--vw-tinta) 80%,transparent)}
.vw .vw-foto img{transition:transform 1.2s var(--ease)}
.vw .vw-foto:hover img{transform:scale(1.03)}
.vw .vw-nav a{position:relative;opacity:.8;transition:opacity .25s}
.vw .vw-nav a:hover{opacity:1}
.vw .vw-nav a::after{content:"";position:absolute;left:0;right:0;bottom:-4px;height:1.5px;background:var(--vw-acento);transform:scaleX(0);transform-origin:left;transition:transform .35s var(--ease)}
.vw .vw-nav a:hover::after{transform:scaleX(1)}
@media (prefers-reduced-motion:reduce){
  .vw .vw-pre{display:none}
  .vw.vw-js .vw-rev,.vw.vw-js .vw-palabra>span,.vw.vw-js .vw-hero .vw-sube{opacity:1;transform:none;transition:none}
  .vw .vw-kb,.vw .vw-cue i{animation:none}
}`;

/** Lo que la vista usa de la identidad (lo mismo que se guarda al publicar, ver lib/webs.ts) */
export type IdentidadVista = Pick<IdentidadIA, "nombre" | "paleta" | "tipografias" | "fuentes_url"> & {
  /** imagen: el logo elegido sin fondo (logo-web.ts); si no hay, va el isotipo con el nombre */
  logo: Pick<IdentidadIA["logo"], "isotipo_svg"> & { imagen?: string | null };
};

export function VistaWeb({
  web,
  ficha,
  identidad,
  fotos,
  generandoFotos = false,
}: {
  web: Web;
  ficha: FichaWeb;
  identidad: IdentidadVista;
  /** Las fotos generadas, por su descripción. Sin fotos, cada lugar dice qué foto va */
  fotos?: Record<string, string>;
  generandoFotos?: boolean;
}) {
  useEffect(() => cargarFuentes(identidad.fuentes_url), [identidad.fuentes_url]);
  const contextoFotos = useMemo(() => ({ fotos: fotos ?? {}, generando: generandoFotos }), [fotos, generandoFotos]);

  const raiz = useRef<HTMLDivElement>(null);
  const [js, setJs] = useState(false);
  const [contenedor, setContenedor] = useState<HTMLElement | null>(null);
  const [cargada, setCargada] = useState(false);
  const [bajo, setBajo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [altoVisible, setAltoVisible] = useState<number | null>(null);

  const roles = rolesDe(identidad.paleta);
  const apoyo = identidad.paleta.find((c) => c.rol === "apoyo" && /^#[0-9a-f]{6}$/i.test(c.hex))?.hex ?? roles.acento;
  const oscuroPrimero = contraste(roles.fondo, "#000000") < contraste(roles.texto, "#000000");
  const colores: Colores = {
    ...roles,
    sobrePrincipal: textoSobre(roles.principal, identidad.paleta),
    titulos: fuente(identidad.tipografias.titulos, "serif"),
    // Un fondo apenas distinto para separar secciones: el color de apoyo de la marca muy suave
    texto2: `${apoyo}1a`,
    tinta: oscuroPrimero ? roles.fondo : roles.texto,
    claro: oscuroPrimero ? roles.texto : roles.fondo,
    apoyo,
  };
  const ig = ficha.contacto.instagram;
  const svg = identidad.logo.isotipo_svg ? svgSeguro(identidad.logo.isotipo_svg) : "";
  // Solo imágenes PNG o WebP propias (las arma logo-web.ts): nunca un link de afuera
  const logoImagen = /^data:image\/(png|webp);base64,/.test(identidad.logo.imagen ?? "") ? identidad.logo.imagen : null;
  const conHeroe = web.secciones[0]?.tipo === "portada";
  // El header va en claro sobre el héroe solo cuando el héroe es a pantalla completa (estilo "vidriera")
  const sobreHeroe = conHeroe && web.estilo === "vidriera" && !bajo;
  const principal = web.secciones[0]?.boton ?? null;

  // El chasis arranca: dónde se scrollea, el alto visible (para el preloader) y la "ventanita de carga"
  useEffect(() => {
    setJs(true);
    const cont = contenedorConScroll(raiz.current);
    setContenedor(cont);
    setAltoVisible(cont ? cont.clientHeight : window.innerHeight);
    const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setCargada(true), reducido ? 0 : 1250);
    return () => clearTimeout(t);
  }, []);

  // Cuando sube la ventanita de carga, entra el héroe (la ceja, el título palabra por palabra, el texto y el botón).
  // Se vuelve a mirar si cambia la web, por si el héroe es otro.
  // biome-ignore lint/correctness/useExhaustiveDependencies: web cambia el héroe que hay que hacer entrar
  useEffect(() => {
    if (!cargada) return;
    const t = setTimeout(() => raiz.current?.querySelector(".vw-hero")?.classList.add("arriba"), 250);
    return () => clearTimeout(t);
  }, [cargada, web]);

  // Header con blur al bajar y barra de progreso, con el scroll del contenedor
  useEffect(() => {
    const blanco: HTMLElement | Window = contenedor ?? window;
    const leer = () => {
      const y = contenedor ? contenedor.scrollTop : window.scrollY;
      const total = contenedor ? contenedor.scrollHeight - contenedor.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
      setBajo(y > 40);
      setProgreso(total > 0 ? Math.min(1, y / total) : 0);
    };
    leer();
    blanco.addEventListener("scroll", leer, { passive: true });
    return () => blanco.removeEventListener("scroll", leer);
  }, [contenedor]);

  // Cada bloque entra al aparecer. Se vuelve a mirar cuando cambia la web (un cambio por chat) o llegan fotos
  // biome-ignore lint/correctness/useExhaustiveDependencies: web y fotos cambian los bloques a observar
  useEffect(() => {
    const r = raiz.current;
    if (!r || !js) return;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { root: contenedor, threshold: 0.12 },
    );
    for (const el of r.querySelectorAll(".vw-rev:not(.in)")) io.observe(el);
    return () => io.disconnect();
  }, [js, contenedor, web, fotos]);

  const variables = {
    "--vw-tinta": colores.tinta,
    "--vw-claro": colores.claro,
    "--vw-principal": colores.principal,
    "--vw-acento": colores.acento,
    background: colores.fondo,
    color: colores.texto,
    fontFamily: fuente(identidad.tipografias.texto, "sans-serif"),
  } as CSSProperties;

  return (
    <NombreMarca.Provider value={identidad.nombre}>
      <FotosWeb.Provider value={contextoFotos}>
        <div
          ref={raiz}
          // Los links toman el color de la marca, no el naranja de BrandIA (design-system.md, punto 5)
          className={`vw @container relative min-h-full [&_a]:[color:inherit] ${js ? "vw-js" : ""}`}
          style={variables}
        >
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: CSS fijo del chasis, sin datos de afuera */}
          <style dangerouslySetInnerHTML={{ __html: ESTILOS }} />

          {/* La ventanita de carga: el isotipo y el nombre, una barra que se llena, y sube para revelar la web */}
          <div className="pointer-events-none sticky top-0 z-[60] h-0" aria-hidden="true">
            <div className={`vw-pre ${cargada ? "fuera" : ""}`} style={{ height: altoVisible ?? "100svh" }}>
              {logoImagen ? (
                <span className="nom">
                  <LogoMarca imagen={logoImagen} svg={svg} nombre={identidad.nombre} colores={colores} sobreOscuro tamano="grande" />
                </span>
              ) : (
                <>
                  {svg && (
                    <span
                      className="iso"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: el SVG ya viene limpio de /api/identidad
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  )}
                  <span className="nom text-xl" style={{ fontFamily: colores.titulos }}>
                    {identidad.nombre}
                  </span>
                </>
              )}
              <span className="barra">
                <i />
              </span>
            </div>
          </div>

          <header
            className="sticky top-0 z-40 h-[68px] border-b transition-[background-color,border-color,color,backdrop-filter] duration-500"
            style={
              sobreHeroe
                ? { color: colores.claro, borderColor: "transparent" }
                : {
                    color: colores.texto,
                    background: `${colores.fondo}d9`,
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    borderColor: `${colores.texto}14`,
                  }
            }
          >
            <span
              className="absolute top-0 left-0 h-[3px] transition-[width] duration-100"
              style={{ width: `${progreso * 100}%`, background: colores.acento }}
              aria-hidden="true"
            />
            <div className="mx-auto flex h-full w-full max-w-[1180px] items-center justify-between gap-3 px-5 @2xl:px-10">
              <LogoMarca
                imagen={logoImagen}
                svg={svg}
                nombre={identidad.nombre}
                colores={colores}
                sobreOscuro={sobreHeroe || oscuroPrimero}
                tamano="medio"
              />
              <nav className="vw-nav hidden gap-6 text-sm @3xl:flex">
                {web.secciones
                  .filter((s) => s.tipo !== "portada")
                  .slice(0, 4)
                  .map((s) => (
                    <a key={s.id} href={`#${s.id}`}>
                      {s.titulo}
                    </a>
                  ))}
              </nav>
              {/* Al bajar, el botón principal queda a mano en el header (en el celular, donde no hay menú) */}
              {principal && bajo && destino(principal, ficha) && (
                <span className="shrink-0 @3xl:hidden">
                  <BotonWeb boton={principal} ficha={ficha} colores={colores} />
                </span>
              )}
            </div>
          </header>

          {web.secciones.map((s, i) => (
            <SeccionWeb key={`${s.id}-${i}`} s={s} n={i} web={web} ficha={ficha} colores={colores} svg={svg} />
          ))}

          <footer className="border-t py-8" style={{ borderColor: `${colores.texto}1f` }}>
            <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-5 text-sm @2xl:px-10">
              <span className="flex items-center gap-3">
                {logoImagen ? (
                  <LogoMarca imagen={logoImagen} svg={svg} nombre={identidad.nombre} colores={colores} sobreOscuro={oscuroPrimero} tamano="chico" />
                ) : (
                  svg && (
                    <span
                      className="block size-6 shrink-0 opacity-80 [&>svg]:size-full"
                      aria-hidden="true"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: el SVG ya viene limpio de /api/identidad
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  )
                )}
                <span className="opacity-80">{web.pie}</span>
              </span>
              {ig && <span className="opacity-70">{ig}</span>}
            </div>
          </footer>
        </div>
      </FotosWeb.Provider>
    </NombreMarca.Provider>
  );
}
