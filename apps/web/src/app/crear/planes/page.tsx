import type { Metadata } from "next";

import { Entrada } from "@/app/crear/proximamente/_piezas/entrada";
import { Clave, EnConstruccion, Pasos } from "@/app/crear/proximamente/_piezas/piezas";
import { PLANES } from "@/lib/planes";

import { Eleccion } from "./eleccion";

export const metadata: Metadata = {
  title: "Planes · BrandIA",
  description: "Cuánto cuesta BrandIA y qué incluye cada plan.",
};

// Los planes de BrandIA. Los precios y lo que incluye cada uno vienen de lib/planes.ts. Todavía no se cobra:
// quien elige un plan deja sus datos (se guardan en Supabase) y el equipo lo contacta.
export default function Planes() {
  return (
    <main className="mx-auto w-full max-w-[1080px] overflow-x-clip px-4 py-12 sm:py-16">
      <Entrada className="flex flex-col gap-14">
        <header className="flex flex-col gap-5">
          <div data-entra>
            <EnConstruccion texto="El cobro está en construcción" />
          </div>
          <p data-entra className="label">
            BrandIA · planes
          </p>
          <h1 data-entra className="display max-w-3xl text-balance">
            Elegí cómo <span className="pe-[0.14em]"><Clave>BrandIAr</Clave></span> tu marca.
          </h1>
          <p data-entra className="max-w-2xl text-lg text-muted-foreground">
            Hoy probás todo sin pagar. Elegí el plan que te sirve, dejanos tus datos y te escribimos apenas se pueda pagar
            desde acá.
          </p>
        </header>

        <Eleccion planes={PLANES} />

        <Pasos
          titulo="Qué pasa cuando te suscribís"
          pasos={[
            { titulo: "Elegís tu plan", texto: "Tu marca sola, o tu marca con tus contenidos de cada mes." },
            {
              titulo: "Pagás desde acá",
              texto: "Con tarjeta o como prefieras, por Mercado Pago. El plan mensual se cobra solo cada mes.",
            },
            { titulo: "Tu marca queda guardada", texto: "En tu cuenta: la encontrás siempre, desde cualquier lado." },
            {
              titulo: "Cada mes, lo nuevo",
              texto: "BrandIA arma tu calendario y tus contenidos. Los aprobás o los cambiás pidiéndolo en palabras.",
            },
          ]}
        />
      </Entrada>
    </main>
  );
}
