"use client";

import { Check, CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import s from "../entrevista/entrevista.module.css";
import {
  cargarFuentes,
  contraste,
  fondoParaSimbolo,
  fuente,
  type IdentidadIA,
  type PropuestaLogo,
  rolesDe,
  svgSeguro,
  textoSobre,
} from "./identidad";

// El brandbook: el lienzo es de la marca del cliente (retirada visual, design-system punto 5).
// Ni el naranja ni el logo de BrandIA van acá. Todo sale de lo que generó la IA.

const TIPO_LOGO: Record<string, string> = {
  monograma: "Monograma",
  simbolo_y_logotipo: "Símbolo y nombre",
  sello: "Sello",
  solo_logotipo: "Solo el nombre",
};

type Colores = ReturnType<typeof rolesDe>;

function Seccion({
  titulo,
  fondo,
  texto,
  children,
}: {
  titulo: string;
  fondo: string;
  texto: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${s.entra} rounded-lg p-6 sm:p-10`} style={{ background: fondo, color: texto }}>
      <p className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-70">{titulo}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Subtitulo({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold">{children}</p>;
}

/** El isotipo (SVG) con el nombre compuesto al lado en la tipografía de títulos */
function Isotipo({ identidad, color, grande }: { identidad: IdentidadIA; color: string; grande?: boolean }) {
  const { logo, nombre, tipografias } = identidad;
  return (
    <span className="inline-flex items-center gap-4" style={{ color }}>
      {logo.isotipo_svg && (
        <span
          aria-hidden="true"
          className={`${grande ? "size-20 sm:size-24" : "size-14"} shrink-0 [&>svg]:size-full`}
          dangerouslySetInnerHTML={{ __html: svgSeguro(logo.isotipo_svg) }}
        />
      )}
      <span
        className={grande ? "text-[clamp(2.2rem,1.6rem+2.4vw,3.6rem)] leading-none" : "text-3xl leading-none"}
        style={{ fontFamily: fuente(tipografias.titulos, "serif") }}
      >
        {nombre}
      </span>
    </span>
  );
}

function LogoPrincipal({
  identidad,
  logo,
  c,
}: {
  identidad: IdentidadIA;
  logo: PropuestaLogo | null;
  c: Colores;
}) {
  if (logo)
    return (
      <img
        src={logo.imagen}
        alt={`Logo de ${identidad.nombre}`}
        className="aspect-square w-full max-w-[220px] rounded-[10px] bg-white object-contain"
      />
    );
  return <Isotipo identidad={identidad} color={c.principal} grande />;
}

function Lista({ items, tachada }: { items: string[]; tachada?: boolean }) {
  return (
    <ul className={`mt-2 space-y-2 text-[15px] leading-relaxed ${tachada ? "opacity-80" : ""}`}>
      {items.map((t) => (
        <li key={t} className="flex gap-2">
          <span aria-hidden="true">{tachada ? "×" : "·"}</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function Brandbook({ identidad, logos }: { identidad: IdentidadIA; logos: PropuestaLogo[] }) {
  const { nombre, eslogan, esencia, voz, estilo, brandbook, paleta, tipografias, logo } = identidad;
  const c = rolesDe(paleta);
  const titulos = fuente(tipografias.titulos, "serif");
  const cuerpo = fuente(tipografias.texto, "sans-serif");
  const sobrePrincipal = textoSobre(c.principal, paleta);
  const fondoSimbolo = fondoParaSimbolo(logo.isotipo_svg, paleta, c.fondo, c.principal);
  const [elegido, setElegido] = useState(0);
  const logoActual = logos[elegido] ?? null;

  useEffect(() => cargarFuentes(identidad.fuentes_url), [identidad.fuentes_url]);

  const ejemplos = [
    ["Bio de Instagram", voz.ejemplos.bio_instagram],
    ["Un posteo", voz.ejemplos.posteo],
    ["Respuesta a un cliente", voz.ejemplos.respuesta_cliente],
    ["Un cartel", voz.ejemplos.cartel],
  ] as const;

  return (
    <div className="flex flex-col gap-4" style={{ fontFamily: cuerpo }}>
      {/* Portada */}
      <section
        className={`${s.entra} flex min-h-[min(70svh,560px)] flex-col justify-between rounded-lg p-6 sm:p-10`}
        style={{ background: c.fondo, color: c.texto }}
      >
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-70">Brandbook · {nombre}</p>
        <div className="py-10">
          <LogoPrincipal identidad={identidad} logo={logoActual} c={c} />
          <h1
            className={`${s.seCocina} mt-8 max-w-[16ch] text-[clamp(2.6rem,1.6rem+4.5vw,5.5rem)] leading-[0.98] font-normal`}
            style={{ fontFamily: titulos }}
          >
            {eslogan || nombre}
          </h1>
          <p className="mt-5 max-w-[36em] text-lg leading-relaxed opacity-85">{esencia.idea}</p>
        </div>
        <p className="max-w-[40em] text-[15px] leading-relaxed opacity-85">{brandbook.introduccion}</p>
      </section>

      {/* Esencia */}
      <Seccion titulo="Esencia" fondo={c.fondo} texto={c.texto}>
        {/* Misión y visión: las marcas armadas antes del 17/10 no las tienen */}
        {(esencia.mision || esencia.vision) && (
          <div className="mb-10 grid gap-8 sm:grid-cols-2">
            {(
              [
                ["Misión", esencia.mision],
                ["Visión", esencia.vision],
              ] as const
            )
              .filter(([, v]) => v)
              .map(([t, v]) => (
                <div key={t}>
                  <Subtitulo>{t}</Subtitulo>
                  <p className="mt-2 text-[clamp(1.25rem,1rem+1vw,1.6rem)] leading-snug" style={{ fontFamily: titulos }}>
                    {v}
                  </p>
                </div>
              ))}
          </div>
        )}
        <div className="grid gap-8 sm:grid-cols-2">
          {(
            [
              ["Por qué existe", esencia.proposito],
              ["Lo que prometemos", esencia.promesa],
              ["Dónde nos paramos", esencia.posicionamiento],
              ["Para quién", esencia.publico],
            ] as const
          ).map(([t, v]) => (
            <div key={t}>
              <Subtitulo>{t}</Subtitulo>
              <p className="mt-2 text-[15px] leading-relaxed opacity-90">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {esencia.valores.map((v) => (
            <div key={v.valor} className="rounded-[10px] p-5" style={{ boxShadow: `inset 0 0 0 1px ${c.texto}26` }}>
              <p className="text-2xl leading-tight" style={{ fontFamily: titulos, color: c.principal }}>
                {v.valor}
              </p>
              <p className="mt-2 text-[15px] leading-relaxed opacity-85">{v.significa}</p>
            </div>
          ))}
        </div>
      </Seccion>

      {/* Logo */}
      <Seccion titulo="Logo" fondo={c.fondo} texto={c.texto}>
        {logos.length > 0 && (
          <>
            <div className="grid items-start gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <img
                src={logoActual?.imagen}
                alt={`Logo de ${nombre}`}
                className="aspect-square w-full rounded-[10px] bg-white object-contain"
              />
              <div>
                <p className="text-2xl leading-tight" style={{ fontFamily: titulos }}>
                  {TIPO_LOGO[logoActual?.tipo ?? ""] ?? logoActual?.tipo}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed opacity-85">{logoActual?.concepto}</p>
                {logos.length > 1 && (
                  <>
                    <p className="mt-8 text-sm font-semibold">Otras propuestas</p>
                    <div className="mt-3 flex gap-3">
                      {logos.map((l, i) => (
                        <button
                          key={`${i}-${l.tipo}`}
                          type="button"
                          onClick={() => setElegido(i)}
                          aria-label={`Ver la propuesta ${i + 1}: ${TIPO_LOGO[l.tipo] ?? l.tipo}`}
                          aria-pressed={i === elegido}
                          className="size-20 overflow-hidden rounded-[8px] bg-white transition-transform duration-300 ease-brandia hover:-translate-y-0.5"
                          style={{ boxShadow: i === elegido ? `0 0 0 2px ${c.texto}` : `0 0 0 1px ${c.texto}26` }}
                        >
                          <img src={l.imagen} alt="" className="size-full object-contain" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <hr className="my-10 border-0 border-t" style={{ borderColor: `${c.texto}26` }} />
          </>
        )}
        <Subtitulo>El símbolo, para aplicar en todos lados</Subtitulo>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div
            className="grid min-h-40 place-items-center rounded-[10px] p-6"
            style={{ boxShadow: `inset 0 0 0 1px ${c.texto}22` }}
          >
            <Isotipo identidad={identidad} color={c.principal} />
          </div>
          <div className="grid min-h-40 place-items-center rounded-[10px] p-6" style={{ background: fondoSimbolo }}>
            <Isotipo identidad={identidad} color={textoSobre(fondoSimbolo, paleta)} />
          </div>
        </div>
        {logo.explicacion && <p className="mt-5 max-w-[40em] text-[15px] leading-relaxed opacity-85">{logo.explicacion}</p>}
      </Seccion>

      {/* Paleta */}
      <Seccion titulo="Paleta" fondo={c.fondo} texto={c.texto}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {paleta.map((color) => (
            <div
              key={color.hex + color.rol}
              className="flex aspect-[1.5] flex-col justify-end rounded-[10px] p-3 text-[13px] leading-snug sm:aspect-[0.8]"
              style={{
                background: color.hex,
                color: textoSobre(color.hex, paleta),
                boxShadow: contraste(color.hex, c.fondo) < 1.3 ? `inset 0 0 0 1px ${c.texto}33` : undefined,
              }}
            >
              <b className="font-semibold">{color.nombre}</b>
              <span className="uppercase opacity-80">{color.hex}</span>
              <span className="opacity-80">{color.rol}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[40em] text-[15px] leading-relaxed opacity-85">{estilo.uso_de_colores}</p>
      </Seccion>

      {/* Tipografías */}
      <Seccion titulo="Tipografías" fondo={c.fondo} texto={c.texto}>
        <div className="grid gap-8 sm:grid-cols-2">
          {(
            [
              ["Títulos", tipografias.titulos, titulos],
              ["Texto", tipografias.texto, cuerpo],
            ] as const
          ).map(([rol, familia, css]) => (
            <div key={rol}>
              <p className="text-[clamp(4rem,3rem+4vw,6.5rem)] leading-none" style={{ fontFamily: css }}>
                Aa
              </p>
              <p className="mt-3 text-xl" style={{ fontFamily: css }}>
                {familia}
              </p>
              <p className="text-sm opacity-70">{rol}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-[18ch] text-[clamp(1.8rem,1.2rem+2.4vw,3rem)] leading-[1.05]" style={{ fontFamily: titulos }}>
          {eslogan || nombre}
        </p>
        <p className="mt-4 max-w-[36em] text-[15px] leading-relaxed opacity-85">{esencia.promesa}</p>
      </Seccion>

      {/* Voz */}
      <Seccion titulo="Voz y tono" fondo={c.principal} texto={sobrePrincipal}>
        <p className="max-w-[28ch] text-[clamp(1.6rem,1.1rem+2vw,2.6rem)] leading-[1.1]" style={{ fontFamily: titulos }}>
          {voz.resumen}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {voz.rasgos.map((r) => (
            <div key={r.rasgo} className="rounded-[10px] p-5" style={{ boxShadow: `inset 0 0 0 1px ${sobrePrincipal}40` }}>
              <p className="text-lg font-semibold">{r.rasgo}</p>
              <p className="mt-2 text-[15px] leading-relaxed">
                <span className="opacity-70">Es · </span>
                {r.es}
              </p>
              <p className="mt-1 text-[15px] leading-relaxed">
                <span className="opacity-70">No es · </span>
                {r.no_es}
              </p>
            </div>
          ))}
        </div>
        {(voz.tono ?? []).length > 0 && (
          <div className="mt-10">
            <Subtitulo>El tono según el momento</Subtitulo>
            <p className="mt-1 max-w-[40em] text-[15px] leading-relaxed opacity-80">
              La voz es siempre la misma; el tono se ajusta a cada situación.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {voz.tono.map((m) => (
                <div key={m.momento} className="rounded-[10px] p-5" style={{ boxShadow: `inset 0 0 0 1px ${sobrePrincipal}40` }}>
                  <p className="text-lg font-semibold">{m.momento}</p>
                  <p className="mt-2 text-[15px] leading-relaxed">{m.como}</p>
                  <p className="mt-3 text-[15px] leading-relaxed italic opacity-85">«{m.ejemplo}»</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <Subtitulo>Palabras nuestras</Subtitulo>
            <Lista items={voz.palabras_si} />
          </div>
          <div>
            <Subtitulo>Nunca decimos</Subtitulo>
            <Lista items={voz.palabras_no} tachada />
          </div>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {ejemplos.map(([t, v]) => (
            <div key={t} className="rounded-[10px] p-5" style={{ background: c.fondo, color: c.texto }}>
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-70">{t}</p>
              <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line">{v}</p>
            </div>
          ))}
        </div>
      </Seccion>

      {/* Estilo y reglas */}
      <Seccion titulo="Cómo se usa" fondo={c.fondo} texto={c.texto}>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <Subtitulo>Fotografía</Subtitulo>
            <p className="mt-2 text-[15px] leading-relaxed opacity-90">{estilo.fotografia}</p>
          </div>
          <div>
            <Subtitulo>Íconos e ilustración</Subtitulo>
            <p className="mt-2 text-[15px] leading-relaxed opacity-90">{estilo.iconos_e_ilustracion}</p>
          </div>
          <div>
            <Subtitulo>Siempre</Subtitulo>
            <Lista items={brandbook.usos_correctos} />
          </div>
          <div>
            <Subtitulo>Nunca</Subtitulo>
            <Lista items={brandbook.usos_incorrectos} tachada />
          </div>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {brandbook.aplicaciones.map((a) => (
            <div key={a.donde} className="rounded-[10px] p-5" style={{ boxShadow: `inset 0 0 0 1px ${c.texto}26` }}>
              <p className="text-xl leading-tight" style={{ fontFamily: titulos, color: c.principal }}>
                {a.donde}
              </p>
              <p className="mt-2 text-[15px] leading-relaxed opacity-85">{a.como}</p>
            </div>
          ))}
        </div>
      </Seccion>
    </div>
  );
}

/** Los controles de calidad que hizo la IA (contraste, tipografías, logo). Van con la ropa de BrandIA */
export function Controles({ comprobaciones }: { comprobaciones: IdentidadIA["comprobaciones"] }) {
  if (!comprobaciones.length) return null;
  return (
    <section className={`${s.entra} rounded-lg border bg-card p-6 sm:p-8`}>
      <p className="label">Controles de calidad</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {comprobaciones.map((c) => (
          <li key={c.que + c.detalle} className="flex gap-3 text-[15px] leading-relaxed">
            {c.ok ? (
              <Check className="mt-0.5 size-5 shrink-0" aria-label="Bien" />
            ) : (
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-accent-text" aria-label="Revisar" />
            )}
            <span>
              <b className="font-semibold">{c.que}.</b> <span className="text-muted-foreground">{c.detalle}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
