"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { Armando } from "@/components/entrevista/armando";

// Otros logos (POST /api/logo con lo que la persona ya opinó): se suman a los que había, en la línea de los
// marcados con ♥ y con lo que pida en palabras. Va dentro de la sección Logo del brandbook, con los colores de
// la marca (hereda el color del texto).

export function OtrosLogos({
  pedir,
  pidiendo,
  error,
  marcados,
}: {
  /** `iniciales`: una vuelta de logos con las iniciales (o la sigla) como protagonista */
  pedir: (pedido: string, iniciales: boolean) => Promise<void>;
  pidiendo: boolean;
  error?: string;
  /** Cuántos logos marcó con ♥ */
  marcados: number;
}) {
  const [pedido, setPedido] = useState("");
  const [iniciales, setIniciales] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (pidiendo) return;
    try {
      await pedir(pedido, iniciales);
      setPedido("");
    } catch {
      // El error lo muestra `error`
    }
  }

  const linea = "color-mix(in srgb, currentColor 35%, transparent)";
  return (
    <div className="mt-8 border-t pt-6" style={{ borderColor: "color-mix(in srgb, currentColor 15%, transparent)" }}>
      <p className="text-sm font-semibold">¿Querés ver otros logos?</p>
      <p className="mt-1 text-[13px] opacity-75">
        {marcados
          ? `Van a seguir la línea de ${marcados === 1 ? "el logo que marcaste" : `los ${marcados} logos que marcaste`} con ♥. Los de ahora no se borran.`
          : "Marcá con ♥ los que te gustan y los nuevos van por ahí. Los de ahora no se borran."}
      </p>
      <button
        type="button"
        aria-pressed={iniciales}
        onClick={() => setIniciales((v) => !v)}
        disabled={pidiendo}
        className="mt-3 inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-300 ease-brandia disabled:opacity-50"
        // Va sobre el lienzo con los colores de la marca: activo es el borde grueso y la marca ✓, sin rellenar
        style={{ boxShadow: iniciales ? "inset 0 0 0 2px currentColor" : `inset 0 0 0 1px ${linea}` }}
      >
        {iniciales ? "✓ " : ""}Con las iniciales
      </button>
      <form onSubmit={enviar} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="pedido-logos" className="sr-only">
          Qué buscás en el logo
        </label>
        <input
          id="pedido-logos"
          value={pedido}
          onChange={(e) => setPedido(e.target.value)}
          maxLength={300}
          disabled={pidiendo}
          placeholder="¿Qué buscás? Ej.: con el símbolo de arriba, más simple"
          className="h-10 w-full min-w-0 rounded-full bg-transparent px-5 text-[15px] outline-none placeholder:opacity-60 sm:max-w-md"
          style={{ boxShadow: `inset 0 0 0 1px ${linea}` }}
        />
        <button
          type="submit"
          disabled={pidiendo}
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full px-5 text-[15px] font-medium transition-opacity duration-300 ease-brandia hover:opacity-80 disabled:opacity-50 sm:self-auto"
          style={{ boxShadow: "inset 0 0 0 1.5px currentColor" }}
        >
          <RefreshCw className={`size-4 ${pidiendo ? "animate-spin" : ""}`} aria-hidden="true" />
          {pidiendo ? "Dibujando…" : iniciales ? "Logos con las iniciales" : "Otros logos"}
        </button>
      </form>
      {pidiendo && (
        <div className="mt-4 rounded-[10px] bg-background p-4 text-foreground">
          <Armando que="logos" />
        </div>
      )}
      {error && !pidiendo && (
        <p className="mt-3 text-sm font-semibold" role="alert">
          {error} Probá de nuevo.
        </p>
      )}
    </div>
  );
}
