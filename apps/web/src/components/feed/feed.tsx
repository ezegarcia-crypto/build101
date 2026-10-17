"use client";

import { Clapperboard, ImageOff } from "lucide-react";
import { useEffect } from "react";

import {
  cargarFuentes,
  fuente,
  type IdentidadIA,
  type PropuestaLogo,
  rolesDe,
  svgSeguro,
  textoSobre,
} from "@/components/brandbook/identidad";
import type { Feed as FeedIA, Historia, Posteo } from "@/lib/ia/contenidos";

import s from "../entrevista/entrevista.module.css";

// El feed de la marca, como se vería su perfil de Instagram. El lienzo es del cliente
// (retirada visual): ni el naranja ni el logo de BrandIA. Las imágenes vienen sin texto
// y el titular se pone encima, en una placa del color de fondo con la tipografía de la marca.

type Colores = ReturnType<typeof rolesDe>;

function Avatar({ identidad, logo, c }: { identidad: IdentidadIA; logo: PropuestaLogo | null; c: Colores }) {
  if (logo) return <img src={logo.imagen} alt="" className="size-full rounded-full bg-white object-contain" />;
  return (
    <span className="grid size-full place-items-center rounded-full" style={{ background: c.fondo, color: c.principal }}>
      {identidad.logo.isotipo_svg ? (
        <span
          aria-hidden="true"
          className="size-3/5 [&>svg]:size-full"
          dangerouslySetInnerHTML={{ __html: svgSeguro(identidad.logo.isotipo_svg) }}
        />
      ) : (
        <span style={{ fontFamily: fuente(identidad.tipografias.titulos, "serif") }}>{identidad.nombre[0]}</span>
      )}
    </span>
  );
}

function Imagen({ imagen, alt, c }: { imagen: Posteo["imagen"]; alt: string; c: Colores }) {
  if (imagen.url) return <img src={imagen.url} alt={alt} className="absolute inset-0 size-full object-cover" />;
  return (
    <span
      className="absolute inset-0 grid place-items-center text-sm"
      style={{ background: c.principal, color: textoSobre(c.principal, []) }}
    >
      <span className="flex items-center gap-2 opacity-80">
        <ImageOff className="size-4" /> La imagen no salió
      </span>
    </span>
  );
}

function Placa({ texto, c, titulos, chica }: { texto: string; c: Colores; titulos: string; chica?: boolean }) {
  return (
    <span
      className={`inline-block max-w-[90%] rounded-[6px] px-3 py-2 leading-[1.08] ${chica ? "text-lg" : "text-[clamp(1.1rem,0.9rem+0.8vw,1.5rem)]"}`}
      style={{ background: c.fondo, color: c.texto, fontFamily: titulos }}
    >
      {texto}
    </span>
  );
}

function TarjetaPosteo({ p, c, titulos, nombre }: { p: Posteo; c: Colores; titulos: string; nombre: string }) {
  return (
    <article className={`${s.entra} flex flex-col overflow-hidden rounded-[10px]`} style={{ boxShadow: `0 0 0 1px ${c.texto}1f` }}>
      <div className="relative aspect-[4/5]">
        <Imagen imagen={p.imagen} alt={p.idea_visual} c={c} />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <Placa texto={p.titular} c={c} titulos={titulos} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 text-[14px] leading-relaxed">
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-60">{p.objetivo}</p>
        <p className="mt-2 whitespace-pre-line">
          <b className="font-semibold">{nombre.toLowerCase().replace(/\s+/g, "")}</b> {p.texto}
        </p>
        {p.hashtags.length > 0 && <p className="mt-2 opacity-70">{p.hashtags.join(" ")}</p>}
      </div>
    </article>
  );
}

function TarjetaHistoria({ h, c, titulos }: { h: Historia; c: Colores; titulos: string }) {
  return (
    <article
      className={`${s.entra} relative aspect-[9/16] w-[min(62vw,240px)] shrink-0 snap-start overflow-hidden rounded-[14px]`}
      style={{ boxShadow: `0 0 0 1px ${c.texto}1f` }}
    >
      <Imagen imagen={h.imagen} alt={h.idea_visual} c={c} />
      {/* Zona segura de las historias: el texto no va ni muy arriba ni muy abajo */}
      <div className="absolute inset-x-0 top-[14%] px-4">
        <Placa texto={h.texto} c={c} titulos={titulos} chica />
      </div>
      {h.interaccion && (
        <div className="absolute inset-x-0 bottom-[16%] flex justify-center px-4">
          <span
            className="rounded-[10px] px-4 py-2.5 text-center text-sm font-semibold shadow-lg"
            style={{ background: c.fondo, color: c.texto }}
          >
            {h.interaccion}
          </span>
        </div>
      )}
    </article>
  );
}

export function Feed({ feed, identidad, logos }: { feed: FeedIA; identidad: IdentidadIA; logos: PropuestaLogo[] }) {
  const c = rolesDe(identidad.paleta);
  const titulos = fuente(identidad.tipografias.titulos, "serif");
  const cuerpo = fuente(identidad.tipografias.texto, "sans-serif");
  const usuario = identidad.nombre.toLowerCase().replace(/\s+/g, "");

  useEffect(() => cargarFuentes(identidad.fuentes_url), [identidad.fuentes_url]);

  return (
    <div className="flex flex-col gap-4" style={{ fontFamily: cuerpo }}>
      {/* El perfil */}
      <section className={`${s.entra} rounded-lg p-6 sm:p-10`} style={{ background: c.fondo, color: c.texto }}>
        <div className="flex items-center gap-5">
          <div className="size-20 shrink-0 rounded-full p-[3px] sm:size-24" style={{ background: c.principal }}>
            <div className="size-full rounded-full p-[2px]" style={{ background: c.fondo }}>
              <Avatar identidad={identidad} logo={logos[0] ?? null} c={c} />
            </div>
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{usuario}</p>
            <p className="text-2xl leading-tight" style={{ fontFamily: titulos }}>
              {identidad.nombre}
            </p>
          </div>
        </div>
        <p className="mt-5 max-w-[34em] text-[15px] leading-relaxed whitespace-pre-line">
          {identidad.voz.ejemplos.bio_instagram}
        </p>
      </section>

      {/* Historias */}
      {feed.historias.length > 0 && (
        <section className={`${s.entra} rounded-lg p-6 sm:p-10`} style={{ background: c.fondo, color: c.texto }}>
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-70">Historias</p>
          <div className="-mx-6 mt-5 flex snap-x gap-3 overflow-x-auto px-6 pb-2 sm:-mx-10 sm:px-10">
            {feed.historias.map((h, i) => (
              <TarjetaHistoria key={i} h={h} c={c} titulos={titulos} />
            ))}
          </div>
        </section>
      )}

      {/* Posteos */}
      <section className={`${s.entra} rounded-lg p-6 sm:p-10`} style={{ background: c.fondo, color: c.texto }}>
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-70">Posteos</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {feed.posteos.map((p, i) => (
            <TarjetaPosteo key={i} p={p} c={c} titulos={titulos} nombre={identidad.nombre} />
          ))}
        </div>
      </section>

      {/* El reel todavía no lo genera la IA */}
      <section className={`${s.entra} flex flex-wrap items-center gap-4 rounded-lg border bg-card p-6`}>
        <Clapperboard className="size-6 text-muted-foreground" />
        <div>
          <p className="font-semibold">Reel · en construcción</p>
          <p className="text-sm text-muted-foreground">
            Muy pronto, un reel con tus imágenes, textos animados y voz en off.
          </p>
        </div>
      </section>
    </div>
  );
}
