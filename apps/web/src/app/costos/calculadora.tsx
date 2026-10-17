"use client";

import { useState } from "react";

import { usd } from "./formato";

// Para pensar precios: cuánto cobraríamos si multiplicamos el costo de la IA por un margen.
export function Calculadora({ marca, feed }: { marca: number | null; feed: number | null }) {
  const [veces, setVeces] = useState(5);

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <label className="flex flex-wrap items-center gap-3 text-[0.9375rem]">
        Si cobramos
        <input
          type="number"
          min={1}
          max={100}
          step={0.5}
          value={veces}
          onChange={(e) => setVeces(Math.max(1, Number(e.target.value) || 1))}
          className="w-20 rounded-[4px] border bg-background px-2 py-1 text-center font-semibold"
        />
        veces lo que nos cuesta la IA:
      </label>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="label">Una marca completa</dt>
          <dd className="font-display text-2xl">{marca === null ? "Faltan datos" : usd(marca * veces)}</dd>
        </div>
        <div>
          <dt className="label">Un feed del mes</dt>
          <dd className="font-display text-2xl">{feed === null ? "Faltan datos" : usd(feed * veces)}</dd>
        </div>
      </dl>
      <p className="lead">Solo cuenta la IA. No incluye Vercel, ElevenLabs, dominios, producción ni nuestro tiempo.</p>
    </div>
  );
}
