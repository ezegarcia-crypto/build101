import type { Metadata } from "next";

import { Entrada } from "@/app/crear/proximamente/_piezas/entrada";
import { Clave, EnConstruccion, Pasos } from "@/app/crear/proximamente/_piezas/piezas";
import { enModoPrueba, hayCobro, preciosEnPesos } from "@/lib/mercadopago";
import { PLANES } from "@/lib/planes";

import { Eleccion } from "./eleccion";

export const metadata: Metadata = {
  title: "Planes · BrandIA",
  description: "Cuánto cuesta BrandIA y qué incluye cada plan.",
};

// Los planes de BrandIA. Los precios y lo que incluye cada uno vienen de lib/planes.ts; lo que se cobra en pesos,
// de la tabla `planes` de Supabase. Con Mercado Pago conectado (lib/mercadopago.ts), "Tu marca" y "Tu marca andando"
// se pagan desde acá. Sin conectar, quien elige un plan deja sus datos y el equipo lo contacta.
export const dynamic = "force-dynamic";

export default async function Planes() {
  const cobro = hayCobro();
  const enPesos = cobro ? await preciosEnPesos().catch(() => ({})) : {};
  const prueba = cobro && enModoPrueba();
  return (
    <main className="mx-auto w-full max-w-[1080px] overflow-x-clip px-4 py-12 sm:py-16">
      <Entrada className="flex flex-col gap-14">
        <header className="flex flex-col gap-5">
          <div data-entra>
            <EnConstruccion
              texto={
                prueba
                  ? "Modo prueba: no se cobra de verdad"
                  : cobro
                    ? "Beta abierta: la primera marca es gratis"
                    : "Beta abierta: hoy lo probás gratis"
              }
            />
          </div>
          <p data-entra className="label">
            BrandIA · planes
          </p>
          <h1 data-entra className="display max-w-3xl text-balance">
            Elegí cómo <span className="pe-[0.14em]"><Clave>BrandIAr</Clave></span> tu marca.
          </h1>
          <p data-entra className="max-w-2xl text-lg text-muted-foreground">
            {cobro
              ? "Estos son los precios de lanzamiento. Durante la beta, cada persona arma una marca completa gratis. Elegí el plan que te sirve y pagalo acá, con Mercado Pago."
              : "Estos son los precios de lanzamiento. Durante la beta, cada persona arma una marca completa gratis. Elegí el plan que te sirve, dejanos tus datos y te escribimos apenas se pueda pagar desde acá."}
          </p>
        </header>

        <Eleccion planes={PLANES} cobro={cobro} enPesos={enPesos} />

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
