"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { Armando } from "@/components/entrevista/armando";

import type { Color, Comprobacion } from "./identidad";

// Iterar la paleta (POST /api/paleta): la persona dice qué cambiaría y la IA propone otra para la misma
// dirección. Cada paleta nueva se suma a las anteriores: quedan todas a la vista para comparar y volver a
// cualquiera. Va dentro de la sección Paleta del brandbook, con los colores de la marca (hereda el color del
// texto). Al cambiar la paleta, el símbolo la sigue; logos completos nuevos se dibujan si la persona quiere.

export type PaletaNueva = { paleta: Color[]; explicacion: string; uso_de_colores?: string; comprobaciones: Comprobacion[] };

/** Una de las paletas que se probaron, con el símbolo en esos colores y sus controles */
export type VersionPaleta = {
  paleta: Color[];
  isotipo_svg: string;
  comprobaciones: Comprobacion[];
  explicacion?: string;
  /** Cómo se combinan estos colores (el texto del brandbook) */
  uso_de_colores?: string;
};

const linea = "color-mix(in srgb, currentColor 35%, transparent)";

export function OtraPaleta({
  versiones,
  actual,
  onElegir,
  pedir,
  onNueva,
  logosViejos,
  onRedibujar,
  redibujando,
  marcados,
}: {
  versiones: VersionPaleta[];
  /** La que está aplicada ahora */
  actual: number;
  onElegir: (i: number) => void;
  pedir: (pedido: string) => Promise<PaletaNueva>;
  onNueva: (p: PaletaNueva) => void;
  /** Ningún logo completo está dibujado con la paleta aplicada */
  logosViejos: boolean;
  onRedibujar: () => void;
  redibujando: boolean;
  /** Cuántos colores de la paleta aplicada están marcados con ♥ (se quedan en la próxima) */
  marcados: number;
}) {
  const [pedido, setPedido] = useState("");
  const [pidiendo, setPidiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const explicacion = versiones[actual]?.explicacion;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (pidiendo) return;
    setPidiendo(true);
    setError(null);
    try {
      onNueva(await pedir(pedido));
      setPedido("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPidiendo(false);
    }
  }

  const boton =
    "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-[15px] font-medium transition-opacity duration-300 ease-brandia hover:opacity-80 disabled:opacity-50";

  return (
    <div className="mt-8 border-t pt-6" style={{ borderColor: "color-mix(in srgb, currentColor 15%, transparent)" }}>
      {versiones.length > 1 && (
        <div className="mb-6">
          <p className="text-sm font-semibold">Tus paletas</p>
          <ul className="mt-3 flex flex-wrap gap-3">
            {versiones.map((v, i) => (
              <li key={v.paleta.map((c) => c.hex).join()}>
                <button
                  type="button"
                  onClick={() => onElegir(i)}
                  aria-pressed={i === actual}
                  aria-label={`Usar la paleta ${i + 1}`}
                  className="flex flex-col gap-1.5 rounded-[10px] p-2 text-left text-[13px] transition-transform duration-300 ease-brandia hover:-translate-y-0.5"
                  style={{ boxShadow: i === actual ? "0 0 0 2px currentColor" : `0 0 0 1px ${linea}` }}
                >
                  <span className="flex overflow-hidden rounded-[4px]">
                    {v.paleta.map((c) => (
                      <span key={c.hex + c.rol} className="block h-8 w-6" style={{ background: c.hex }} />
                    ))}
                  </span>
                  <span className="opacity-80">{i === 0 ? "La primera" : `Paleta ${i + 1}`}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mb-3 text-[13px] opacity-75">
        {marcados
          ? `${marcados === 1 ? "Marcaste un color" : `Marcaste ${marcados} colores`} con ♥: en la próxima paleta se quedan y cambia el resto.`
          : "Tocá ♥ en los colores que te gustan: en la próxima paleta se quedan y cambia el resto."}
      </p>
      {explicacion && <p className="mb-4 max-w-[40em] text-[15px] leading-relaxed italic opacity-85">{explicacion}</p>}
      <form onSubmit={enviar} className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="pedido-paleta" className="text-sm font-semibold sm:sr-only">
          ¿Qué le cambiarías a la paleta?
        </label>
        <input
          id="pedido-paleta"
          value={pedido}
          onChange={(e) => setPedido(e.target.value)}
          maxLength={300}
          placeholder="¿Qué le cambiarías? Por ejemplo: más cálida, sin verde"
          className="h-10 w-full min-w-0 rounded-full bg-transparent px-5 text-[15px] outline-none placeholder:opacity-60 sm:max-w-md"
          style={{ boxShadow: `inset 0 0 0 1px ${linea}` }}
        />
        <button type="submit" disabled={pidiendo} className={`${boton} self-start sm:self-auto`} style={{ boxShadow: "inset 0 0 0 1.5px currentColor" }}>
          <RefreshCw className={`size-4 ${pidiendo ? "animate-spin" : ""}`} aria-hidden="true" />
          {pidiendo ? "Pensando…" : "Otra paleta"}
        </button>
      </form>
      {pidiendo && (
        <div className="mt-4 rounded-[10px] bg-background p-4 text-foreground">
          <Armando que="paleta" />
        </div>
      )}
      {error && (
        <p className="mt-3 text-sm font-semibold" role="alert">
          {error} Probá de nuevo.
        </p>
      )}
      {logosViejos && !pidiendo && (
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px]">
          <span className="opacity-85">Tus logos completos están dibujados con otra paleta.</span>
          <button
            type="button"
            onClick={onRedibujar}
            disabled={redibujando}
            className={boton}
            style={{ boxShadow: "inset 0 0 0 1.5px currentColor" }}
          >
            <RefreshCw className={`size-4 ${redibujando ? "animate-spin" : ""}`} aria-hidden="true" />
            {redibujando ? "Dibujando…" : "Sumar logos con esta paleta"}
          </button>
        </p>
      )}
    </div>
  );
}
