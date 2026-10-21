import type { Metadata } from "next";

import { Entrada } from "@/app/crear/proximamente/_piezas/entrada";
import { Clave } from "@/app/crear/proximamente/_piezas/piezas";

import { Formulario } from "./formulario";

export const metadata: Metadata = {
  title: "Ingresar · BrandIA",
  description: "Entrá a tu marca con un código que te llega por correo.",
};

// El ingreso a BrandIA: a la izquierda, qué encontrás adentro; a la derecha, la tarjeta para entrar.
// El único punto naranja de la pantalla es el de la etiqueta de arriba a la izquierda.
export default function Ingresar() {
  return (
    <main className="mx-auto w-full max-w-[1080px] overflow-x-clip px-4 py-12 sm:py-16 lg:py-20">
      <Entrada className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <section className="flex flex-col gap-6">
          <p data-entra className="label flex items-center gap-2.5">
            <span aria-hidden className="size-2 rounded-full bg-naranja" />
            Tu marca, andando
          </p>
          <h1 data-entra className="display max-w-xl text-balance">
            Todo lo que BrandIAste, en un mismo <Clave>lugar</Clave>.
          </h1>
          <p data-entra className="max-w-lg text-lg text-muted-foreground">
            Tu marca, tus contenidos y tus productos quedan guardados en tu cuenta. Entrás desde cualquier lado y
            seguís donde lo dejaste.
          </p>
          <div data-entra className="mt-4 hidden max-w-lg flex-col gap-4 lg:flex">
            <hr className="border-border" />
            <p className="label">BrandIA / Montevideo</p>
          </div>
        </section>

        <section
          data-entra
          aria-label="Ingresar"
          className="rounded-[14px] border bg-card p-6 shadow-[0_1px_0_rgb(0_0_0/0.02),0_24px_60px_-30px_rgb(30_30_28/0.25)] sm:p-9"
        >
          <Formulario />
        </section>
      </Entrada>
    </main>
  );
}
