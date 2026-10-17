"use client";

import { ArrowRight } from "lucide-react";
import { useEffect } from "react";

import s from "../entrevista/entrevista.module.css";
import { cargarFuentes, type DireccionConControl, fuente, rolesDe, urlFamilia } from "./identidad";

// Las tres direcciones visuales que propone la IA. Cada tarjeta se pinta con su propia paleta y
// sus tipografías (retirada visual), así la persona compara cómo se vería su marca en cada una.

const QUE_ES: Record<string, string> = { A: "La esperada", B: "La vecina", C: "La que se anima" };
const TIPO_LOGO: Record<string, string> = {
  monograma: "Monograma",
  simbolo_y_logotipo: "Símbolo y nombre",
  sello: "Sello",
  solo_logotipo: "Solo el nombre",
};

export function Direcciones({
  direcciones,
  nombreMarca,
  onElegir,
}: {
  direcciones: DireccionConControl[];
  nombreMarca: string | null;
  onElegir: (d: DireccionConControl) => void;
}) {
  useEffect(() => {
    for (const d of direcciones) {
      cargarFuentes(urlFamilia(d.tipografias.titulos.familia));
      cargarFuentes(urlFamilia(d.tipografias.texto.familia));
    }
  }, [direcciones]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {direcciones.map((d, i) => {
        const c = rolesDe(d.paleta);
        const nombre = nombreMarca || d.nombre_marca || d.nombre;
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => onElegir(d)}
            className={`${s.entra} group flex flex-col rounded-lg p-6 text-left transition-transform duration-300 ease-brandia outline-none hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring`}
            style={{
              background: c.fondo,
              color: c.texto,
              fontFamily: fuente(d.tipografias.texto.familia, "sans-serif"),
              animationDelay: `${i * 120}ms`,
              boxShadow: `inset 0 0 0 1px ${c.texto}1f`,
            }}
          >
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-70">
              {d.id} · {QUE_ES[d.id]}
            </span>
            <span
              className="mt-6 block text-[clamp(2.2rem,1.6rem+1.6vw,3rem)] leading-[1.02]"
              style={{ fontFamily: fuente(d.tipografias.titulos.familia, "serif"), color: c.principal }}
            >
              {nombre}
            </span>
            {!nombreMarca && d.nombre_marca && <span className="mt-1 text-xs opacity-70">Nombre propuesto</span>}

            <span className="mt-6 block text-lg font-semibold">{d.nombre}</span>
            <span className="mt-1 block text-[15px] leading-relaxed opacity-85">{d.idea}</span>

            <span
              className="mt-5 flex h-10 overflow-hidden rounded-[6px]"
              style={{ outline: `1px solid ${c.texto}26`, outlineOffset: "-1px" }}
              aria-hidden="true"
            >
              {d.paleta.map((col) => (
                <span key={col.hex + col.rol} className="flex-1" style={{ background: col.hex }} />
              ))}
            </span>

            <span className="mt-5 grid gap-1 text-sm">
              <span>
                <span className="opacity-70">Letras: </span>
                {d.tipografias.titulos.familia} y {d.tipografias.texto.familia}
              </span>
              <span>
                <span className="opacity-70">Logo: </span>
                {TIPO_LOGO[d.logo_sugerido.tipo] ?? d.logo_sugerido.tipo}
              </span>
              <span>
                <span className="opacity-70">Se siente: </span>
                {d.palabras.join(", ")}
              </span>
            </span>

            <span className="mt-auto pt-6">
              <span
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform duration-300 ease-brandia group-hover:translate-x-1"
                style={{ background: c.texto, color: c.fondo }}
              >
                Elegir esta
                <ArrowRight className="size-4" />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
