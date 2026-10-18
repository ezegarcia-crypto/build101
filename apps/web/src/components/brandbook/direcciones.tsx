"use client";

import { ArrowRight, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { MeGusta } from "@/components/me-gusta";

import s from "../entrevista/entrevista.module.css";
import { cargarFuentes, claveDe, type DireccionConControl, fuente, rolesDe, textoSobre, urlFamilia } from "./identidad";

// Los caminos (direcciones visuales) que propone la IA. Cada tarjeta se pinta con su propia paleta y
// sus tipografías (retirada visual), así la persona compara cómo se vería su marca en cada una.
// Se puede marcar con ♥ un camino entero o colores sueltos, y pedir otros colores para un camino: la
// variante se suma al lado, nunca reemplaza. Lo marcado guía las próximas vueltas.

const QUE_ES: Record<string, string> = { A: "La esperada", B: "La vecina", C: "La que se anima" };
const TIPO_LOGO: Record<string, string> = {
  monograma: "Monograma",
  simbolo_y_logotipo: "Símbolo y nombre",
  sello: "Sello",
  solo_logotipo: "Solo el nombre",
};

/** Lo que la pantalla del paso 2 le pasa para iterar; sin esto (por ejemplo en /pruebas) solo se muestran */
export type IterarCaminos = {
  gustan: string[];
  onMeGusta: (clave: string) => void;
  colores: string[];
  onColor: (hex: string) => void;
  onOtrosColores: (d: DireccionConControl, pedido: string) => Promise<void>;
};

export function Direcciones({
  direcciones,
  nombreMarca,
  onElegir,
  iterar,
}: {
  direcciones: DireccionConControl[];
  nombreMarca: string | null;
  onElegir: (d: DireccionConControl) => void;
  iterar?: IterarCaminos;
}) {
  useEffect(() => {
    for (const d of direcciones) {
      cargarFuentes(urlFamilia(d.tipografias.titulos.familia));
      cargarFuentes(urlFamilia(d.tipografias.texto.familia));
    }
  }, [direcciones]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {direcciones.map((d, i) => (
        <Tarjeta
          key={claveDe(d)}
          d={d}
          i={i}
          nombre={nombreMarca || d.nombre_marca || d.nombre}
          nombrePropuesto={!nombreMarca && !!d.nombre_marca}
          onElegir={() => onElegir(d)}
          iterar={iterar}
        />
      ))}
    </div>
  );
}

function Tarjeta({
  d,
  i,
  nombre,
  nombrePropuesto,
  onElegir,
  iterar,
}: {
  d: DireccionConControl;
  i: number;
  nombre: string;
  nombrePropuesto: boolean;
  onElegir: () => void;
  iterar?: IterarCaminos;
}) {
  const c = rolesDe(d.paleta);
  const clave = claveDe(d);
  const [abierto, setAbierto] = useState(false);
  const [pedido, setPedido] = useState("");
  const [pidiendo, setPidiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const marcados = iterar ? d.paleta.filter((col) => iterar.colores.includes(col.hex.toLowerCase())).length : 0;

  async function otrosColores(e: React.FormEvent) {
    e.preventDefault();
    if (!iterar || pidiendo) return;
    setPidiendo(true);
    setError(null);
    try {
      await iterar.onOtrosColores(d, pedido);
      setPedido("");
      setAbierto(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPidiendo(false);
    }
  }

  return (
    <article
      className={`${s.entra} flex flex-col rounded-lg p-6`}
      style={{
        background: c.fondo,
        color: c.texto,
        fontFamily: fuente(d.tipografias.texto.familia, "sans-serif"),
        animationDelay: `${(i % 3) * 120}ms`,
        boxShadow: `inset 0 0 0 1px ${c.texto}1f`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-70">
          {d.id} · {QUE_ES[d.id]}
          {d.etiqueta ? ` · ${d.etiqueta}` : ""}
        </span>
        {iterar && (
          <MeGusta
            activo={iterar.gustan.includes(clave)}
            onClick={() => iterar.onMeGusta(clave)}
            que={`el camino ${d.nombre}`}
            className="-mt-1.5 -mr-1.5 size-9 shrink-0"
            tam="size-5"
          />
        )}
      </div>
      <span
        className="mt-5 block text-[clamp(2.2rem,1.6rem+1.6vw,3rem)] leading-[1.02]"
        style={{ fontFamily: fuente(d.tipografias.titulos.familia, "serif"), color: c.principal }}
      >
        {nombre}
      </span>
      {nombrePropuesto && <span className="mt-1 text-xs opacity-70">Nombre propuesto</span>}

      <span className="mt-6 block text-lg font-semibold">{d.nombre}</span>
      <span className="mt-1 block text-[15px] leading-relaxed opacity-85">{d.idea}</span>
      {d.explicacion && <span className="mt-2 block text-[14px] leading-relaxed italic opacity-80">{d.explicacion}</span>}

      {/* La paleta: con ♥ se marcan los colores que se quedan en las próximas vueltas */}
      <div className="mt-5 flex h-11 overflow-hidden rounded-[6px]" style={{ outline: `1px solid ${c.texto}26`, outlineOffset: "-1px" }}>
        {d.paleta.map((col) =>
          iterar ? (
            <span key={col.hex + col.rol} className="flex flex-1" style={{ background: col.hex, color: textoSobre(col.hex, d.paleta) }}>
              <MeGusta
                activo={iterar.colores.includes(col.hex.toLowerCase())}
                onClick={() => iterar.onColor(col.hex.toLowerCase())}
                que={`el color ${col.nombre}`}
                className={`size-full rounded-none ${iterar.colores.includes(col.hex.toLowerCase()) ? "" : "opacity-40 hover:opacity-90 focus-visible:opacity-90"}`}
                tam="size-4"
              />
            </span>
          ) : (
            <span key={col.hex + col.rol} className="flex-1" style={{ background: col.hex }} aria-hidden="true" />
          ),
        )}
      </div>
      {iterar && (
        <span className="mt-1.5 text-[12px] opacity-70">
          {marcados ? `${marcados === 1 ? "Un color marcado" : `${marcados} colores marcados`}: se quedan en las próximas vueltas` : "Tocá un color para marcarlo con ♥"}
        </span>
      )}

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

      {iterar && (
        <div className="mt-5">
          {!abierto && !pidiendo ? (
            <button
              type="button"
              onClick={() => setAbierto(true)}
              className="inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Probar otros colores
            </button>
          ) : (
            <form onSubmit={otrosColores} className="flex flex-col gap-2">
              <label htmlFor={`colores-${clave}`} className="text-sm font-semibold">
                ¿Qué colores buscás?
              </label>
              <input
                id={`colores-${clave}`}
                value={pedido}
                onChange={(e) => setPedido(e.target.value)}
                maxLength={300}
                autoFocus
                disabled={pidiendo}
                placeholder="Ej.: más cálidos, sin negro, algo de verde"
                className="h-10 w-full min-w-0 rounded-full bg-transparent px-4 text-[15px] outline-none placeholder:opacity-60"
                style={{ boxShadow: `inset 0 0 0 1px ${c.texto}55` }}
              />
              <span className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  disabled={pidiendo}
                  className="inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold disabled:opacity-60"
                  style={{ boxShadow: `inset 0 0 0 1.5px ${c.texto}` }}
                >
                  <RefreshCw className={`size-4 ${pidiendo ? "animate-spin" : ""}`} aria-hidden="true" />
                  {pidiendo ? "Mezclando colores…" : "Sumar otra paleta"}
                </button>
                {!pidiendo && (
                  <button type="button" onClick={() => setAbierto(false)} className="text-sm opacity-75 hover:underline">
                    Cancelar
                  </button>
                )}
              </span>
              <span className="text-[12px] opacity-70">Se suma como otro camino al lado: este no se borra.</span>
            </form>
          )}
          {error && (
            <p className="mt-2 text-sm font-semibold" role="alert">
              {error} Probá de nuevo.
            </p>
          )}
        </div>
      )}

      <span className="mt-auto pt-6">
        <button
          type="button"
          onClick={onElegir}
          className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ background: c.texto, color: c.fondo }}
        >
          Elegir este camino
          <ArrowRight className="size-4 transition-transform duration-300 ease-brandia group-hover:translate-x-1" />
        </button>
      </span>
    </article>
  );
}
