"use client";

import { useEffect, useState } from "react";

import s from "./entrevista.module.css";

// Mientras la IA trabaja, nunca una pantalla quieta: la B modular se arma y el texto va cambiando.

const FRASES = {
  pregunta: ["Leyendo lo que contaste…", "Pensando la próxima pregunta…", "Ordenando las ideas…"],
  ficha: ["Armando tu ficha…", "Juntando todo lo que contaste…", "Ya casi está…"],
  direcciones: [
    "Leyendo tu ficha…",
    "Pensando tres caminos distintos…",
    "Probando paletas…",
    "Combinando tipografías…",
    "Ya casi están…",
  ],
  identidad: [
    "Escribiendo la esencia de tu marca…",
    "Encontrando cómo habla…",
    "Dibujando tus logos…",
    "Revisando que todo se lea bien…",
    "Armando tu brandbook…",
  ],
};

export function Armando({ que = "pregunta" }: { que?: keyof typeof FRASES }) {
  const frases = FRASES[que];
  const [i, setI] = useState(0);

  useEffect(() => {
    setI(0);
    const t = setInterval(() => setI((n) => (n + 1) % frases.length), 2400);
    return () => clearInterval(t);
  }, [frases]);

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status" aria-live="polite">
      {/* Las dos piezas del isotipo oficial (public/marca/isotipo-C-b-modular.svg), sin redibujar */}
      <svg viewBox="0 0 62 76" className="h-7 w-auto shrink-0" aria-hidden="true">
        <g transform="translate(-10,-12)">
          <path
            className={s.piezaArriba}
            fill="currentColor"
            style={{ color: "var(--foreground)" }}
            d="M10,12 H38.5 A17.5,17.5 0 0 1 38.5,47 H36 V59 H20 V47 H10 Z"
          />
          <path
            className={s.piezaAbajo}
            fill="var(--naranja)"
            d="M10,53 H18 V61 H38 V53 H54.5 A17.5,17.5 0 0 1 54.5,88 H10 Z"
          />
        </g>
      </svg>
      <span key={`${que}-${i}`} className={s.progreso}>
        {frases[i]}
      </span>
    </div>
  );
}
