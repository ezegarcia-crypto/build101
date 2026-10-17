import type { Route } from "next";
import Link from "next/link";

import { Entrada } from "./_piezas/entrada";
import { Clave, EnConstruccion } from "./_piezas/piezas";
import { GRUPOS } from "./secciones";

export default function LoQueViene() {
  return (
    <Entrada className="flex flex-col gap-14">
      <header className="flex flex-col gap-5">
        <div data-entra>
          <EnConstruccion />
        </div>
        <p data-entra className="label">
          BrandIA · lo que viene
        </p>
        <h1 data-entra className="display max-w-3xl text-balance">
          Tu marca, <Clave>en todos lados.</Clave>
        </h1>
        <p data-entra className="max-w-2xl text-lg text-muted-foreground">
          Esto todavía no funciona. En cada pantalla te mostramos cómo va a ser, paso por paso.
          Nada de lo que ves acá lo generó la IA.
        </p>
      </header>

      {GRUPOS.map((g) => (
        <section key={g.modulo} className="flex flex-col gap-5">
          <h2 data-entra>{g.modulo}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.secciones.map((s) => (
              <li data-entra key={s.ruta}>
                <Link
                  href={`/crear/proximamente/${s.ruta}` as Route}
                  className="group flex h-full flex-col gap-3 rounded-lg border bg-card p-5 text-foreground no-underline transition-[transform,box-shadow] duration-500 ease-brandia hover:-translate-y-1.5 hover:shadow-[0_24px_40px_-24px_rgba(30,30,28,.35)]"
                >
                  <span className="label">En construcción</span>
                  <h3 className="text-xl">{s.nombre}</h3>
                  <p className="flex-1 text-[0.9375rem] text-muted-foreground">{s.resumen}</p>
                  <span className="text-sm font-semibold">
                    Mirá cómo va a funcionar{" "}
                    <span
                      aria-hidden
                      className="inline-block transition-transform duration-300 ease-brandia group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Entrada>
  );
}
