"use client";

import { Heart } from "lucide-react";

// El "me gusta" de BrandIA: se usa en nombres, caminos, colores, logos, piezas del feed y productos.
// Lo marcado guía la próxima vuelta de la IA (qué conservar y por dónde seguir). Toma el color del texto
// de donde está (currentColor), así sirve en la ropa de BrandIA y en el lienzo de la marca del cliente.

export function MeGusta({
  activo,
  onClick,
  que,
  className = "",
  tam = "size-5",
}: {
  activo: boolean;
  onClick: () => void;
  /** Qué se marca, para leerlo en voz alta: "el nombre Horno Sur" */
  que: string;
  className?: string;
  tam?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-pressed={activo}
      aria-label={activo ? `Quitar el me gusta: ${que}` : `Me gusta: ${que}`}
      title={activo ? "Te gusta" : "Me gusta"}
      className={`grid place-items-center rounded-full transition-transform duration-300 ease-brandia hover:scale-110 active:scale-90 ${className}`}
    >
      <Heart
        className={`${tam} transition-[fill] duration-300 ease-brandia`}
        style={{ fill: activo ? "currentColor" : "transparent" }}
        aria-hidden="true"
      />
    </button>
  );
}

/** Suma o saca un valor de una lista de "me gusta" */
export const alternar = <T,>(lista: T[], valor: T) =>
  lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
