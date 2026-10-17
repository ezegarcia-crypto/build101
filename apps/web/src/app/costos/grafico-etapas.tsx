"use client";

import { useState } from "react";

import { usd } from "./formato";
import { ESTILOS_SERIES, FAMILIAS, familia, Muestra } from "./series";

// Dónde se va la plata: una barra por etapa, partida por modelo. El color sigue al modelo (no a su
// puesto en el ranking), así un modelo es siempre del mismo color. Paleta validada con la guía de
// visualización (sin naranja: en BrandIA el naranja es un solo punto por pantalla).

export type Etapa = { paso: string; nombre: string; total: number; modelos: { modelo: string; total: number; llamadas: number }[] };

export function GraficoEtapas({ etapas }: { etapas: Etapa[] }) {
  const [activo, setActivo] = useState<string | null>(null);
  const maximo = Math.max(...etapas.map((e) => e.total), 0.0001);
  const presentes = FAMILIAS.filter((f) => etapas.some((e) => e.modelos.some((m) => familia(m.modelo).clave === f.clave)));

  return (
    <figure className="viz-etapas flex flex-col gap-4 rounded-lg border bg-card p-5">
      <style>{ESTILOS_SERIES}</style>
      <figcaption className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {presentes.map((f) => (
          <span key={f.clave} className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block size-2.5 rounded-[2px]" style={{ background: f.color }} />
            {f.nombre}
          </span>
        ))}
      </figcaption>

      <ul className="flex flex-col gap-4">
        {etapas.map((e) => (
          <li key={e.paso} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-[0.9375rem]">
              <span>{e.nombre}</span>
              <span className="font-semibold tabular-nums">{usd(e.total)}</span>
            </div>
            <div className="relative h-3.5">
              <div className="flex h-full gap-[2px]" style={{ width: `${(e.total / maximo) * 100}%`, minWidth: 6 }}>
                {e.modelos.map((m, i) => {
                  const id = `${e.paso}|${m.modelo}`;
                  const parte = e.total ? m.total / e.total : 0;
                  return (
                    <button
                      key={m.modelo}
                      type="button"
                      aria-label={`${e.nombre}: ${m.modelo}, ${usd(m.total)}`}
                      onMouseEnter={() => setActivo(id)}
                      onMouseLeave={() => setActivo(null)}
                      onFocus={() => setActivo(id)}
                      onBlur={() => setActivo(null)}
                      onClick={() => setActivo(activo === id ? null : id)}
                      className={`h-full min-w-[3px] transition-opacity duration-300 ease-brandia ${i === e.modelos.length - 1 ? "rounded-r-[4px]" : ""} ${activo && activo !== id && activo.startsWith(`${e.paso}|`) ? "opacity-40" : ""}`}
                      style={{ flexGrow: parte, flexBasis: 0, background: familia(m.modelo).color }}
                    />
                  );
                })}
              </div>
              {e.modelos.map((m) =>
                activo === `${e.paso}|${m.modelo}` ? (
                  <div
                    key={m.modelo}
                    role="status"
                    className="absolute bottom-full left-0 z-10 mb-2 flex flex-col gap-0.5 rounded-[4px] border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md"
                  >
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                      <Muestra modelo={m.modelo} />
                      {m.modelo}
                    </span>
                    <span>
                      <strong>{usd(m.total)}</strong> · {Math.round((m.total / (e.total || 1)) * 100)} % de la etapa ·{" "}
                      {m.llamadas} llamadas
                    </span>
                  </div>
                ) : null,
              )}
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}
