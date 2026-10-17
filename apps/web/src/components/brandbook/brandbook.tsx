"use client";

import { useEffect } from "react";

import s from "../entrevista/entrevista.module.css";
import { cargarFuente, contraste, fuente, type Identidad, rolesDe, textoSobre } from "./identidad";

// El brandbook: el lienzo es de la marca del cliente (retirada visual, design-system punto 5).
// Ni el naranja ni el logo de BrandIA van acá. Todo sale de lo que generó la IA.

function Logo({ identidad, color, alto = "h-24" }: { identidad: Identidad; color: string; alto?: string }) {
  const { logo, nombre, tipografias } = identidad;
  // Como imagen, así el SVG que genera la IA no puede ejecutar nada en la página
  const src = logo?.svg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logo.svg)}`
    : logo?.imagen_url;
  if (src) return <img src={src} alt={`Logo de ${nombre}`} className={`${alto} w-auto max-w-full object-contain`} />;
  return (
    <span
      className="text-[clamp(2.4rem,1.6rem+3vw,4rem)] leading-none"
      style={{ fontFamily: fuente(tipografias.titulos.familia, "serif"), color }}
    >
      {nombre}
    </span>
  );
}

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

export function Brandbook({ identidad }: { identidad: Identidad }) {
  const { nombre, frase, idea, palabras, voz, paleta, tipografias, logo } = identidad;
  const c = rolesDe(paleta);
  const titulos = fuente(tipografias.titulos.familia, "serif");
  const cuerpo = fuente(tipografias.texto.familia, "sans-serif");
  const sobrePrincipal = textoSobre(c.principal, paleta);
  const hayLogo = !!(logo?.svg || logo?.imagen_url);

  useEffect(() => {
    cargarFuente(tipografias.titulos.familia);
    cargarFuente(tipografias.texto.familia);
  }, [tipografias.titulos.familia, tipografias.texto.familia]);

  return (
    <div className="flex flex-col gap-4" style={{ fontFamily: cuerpo }}>
      {/* Portada */}
      <section
        className={`${s.entra} flex min-h-[min(70svh,560px)] flex-col justify-between rounded-lg p-6 sm:p-10`}
        style={{ background: c.fondo, color: c.texto }}
      >
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-70">Brandbook · {nombre}</p>
        <div className="py-10">
          <Logo identidad={identidad} color={c.principal} />
          <h1
            className={`${s.seCocina} mt-8 max-w-[14ch] text-[clamp(2.6rem,1.6rem+4.5vw,5.5rem)] leading-[0.98] font-normal`}
            style={{ fontFamily: titulos, color: c.texto }}
          >
            {frase || nombre}
          </h1>
          {idea && <p className="mt-5 max-w-[36em] text-lg leading-relaxed opacity-85">{idea}</p>}
        </div>
        {palabras && palabras.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {palabras.map((p) => (
              <span key={p} className="rounded-full border px-3 py-1 text-sm" style={{ borderColor: c.texto }}>
                {p}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Paleta */}
      <Seccion titulo="Paleta" fondo={c.fondo} texto={c.texto}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {paleta.map((color) => {
            const tinta = textoSobre(color.hex, paleta);
            return (
              <div
                key={color.hex + color.nombre}
                className="flex aspect-[1.5] flex-col justify-end sm:aspect-[0.8] rounded-[10px] p-3 text-[13px] leading-snug"
                style={{
                  background: color.hex,
                  color: tinta,
                  boxShadow: contraste(color.hex, c.fondo) < 1.3 ? `inset 0 0 0 1px ${c.texto}33` : undefined,
                }}
              >
                <b className="font-semibold">{color.nombre}</b>
                <span className="uppercase opacity-80">{color.hex}</span>
                <span className="opacity-80">{color.rol}</span>
              </div>
            );
          })}
        </div>
      </Seccion>

      {/* Tipografías */}
      <Seccion titulo="Tipografías" fondo={c.fondo} texto={c.texto}>
        <div className="grid gap-8 sm:grid-cols-2">
          {(
            [
              ["Títulos", tipografias.titulos, titulos],
              ["Texto", tipografias.texto, cuerpo],
            ] as const
          ).map(([rol, tipo, familia]) => (
            <div key={rol}>
              <p className="text-[clamp(4rem,3rem+4vw,6.5rem)] leading-none" style={{ fontFamily: familia }}>
                Aa
              </p>
              <p className="mt-3 text-xl" style={{ fontFamily: familia }}>
                {tipo.familia}
              </p>
              <p className="text-sm opacity-70">{rol}</p>
              {tipo.por_que && <p className="mt-3 max-w-[30em] text-[15px] leading-relaxed opacity-85">{tipo.por_que}</p>}
            </div>
          ))}
        </div>
        <p
          className="mt-10 max-w-[18ch] text-[clamp(1.8rem,1.2rem+2.4vw,3rem)] leading-[1.05]"
          style={{ fontFamily: titulos }}
        >
          {frase || nombre}
        </p>
      </Seccion>

      {/* Logo sobre sus colores */}
      <Seccion titulo="Logo" fondo={c.fondo} texto={c.texto}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid aspect-[1.6] place-items-center rounded-[10px] border p-6" style={{ borderColor: `${c.texto}22` }}>
            <Logo identidad={identidad} color={c.principal} />
          </div>
          <div className="grid aspect-[1.6] place-items-center rounded-[10px] p-6" style={{ background: c.principal }}>
            <Logo identidad={identidad} color={sobrePrincipal} />
          </div>
        </div>
        {logo?.por_que && <p className="mt-5 max-w-[40em] text-[15px] leading-relaxed opacity-85">{logo.por_que}</p>}
        {!hayLogo && (
          <p className="mt-5 text-sm opacity-70">El símbolo del logo está en construcción. Por ahora, tu nombre con tu tipografía.</p>
        )}
      </Seccion>

      {/* Voz */}
      {voz && (voz.tono || voz.se_dice?.length || voz.no_se_dice?.length) && (
        <Seccion titulo="Voz" fondo={c.principal} texto={sobrePrincipal}>
          {voz.tono && (
            <p className="max-w-[24ch] text-[clamp(1.6rem,1.1rem+2vw,2.6rem)] leading-[1.1]" style={{ fontFamily: titulos }}>
              {voz.tono}
            </p>
          )}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {voz.se_dice && voz.se_dice.length > 0 && (
              <div>
                <p className="text-sm font-semibold">Así hablamos</p>
                <ul className="mt-2 space-y-2 text-[15px] leading-relaxed">
                  {voz.se_dice.map((f) => (
                    <li key={f}>«{f}»</li>
                  ))}
                </ul>
              </div>
            )}
            {voz.no_se_dice && voz.no_se_dice.length > 0 && (
              <div>
                <p className="text-sm font-semibold">Así no</p>
                <ul className="mt-2 space-y-2 text-[15px] leading-relaxed opacity-80">
                  {voz.no_se_dice.map((f) => (
                    <li key={f} className="line-through decoration-1">
                      «{f}»
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Seccion>
      )}
    </div>
  );
}
