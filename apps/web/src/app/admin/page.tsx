import type { Metadata } from "next";

import { FormEntrar } from "./formularios";

// La puerta de los paneles del equipo (/costos, /pruebas y /pedidos): solo para la lista cerrada de administradores,
// con contraseña y el código de Google Authenticator. No tiene links desde la app y los buscadores no la indexan.

export const metadata: Metadata = {
  title: "Administradores · BrandIA",
  robots: { index: false, follow: false },
};

function Clave({ children }: { children: React.ReactNode }) {
  return <span className="font-normal italic [font-variation-settings:'opsz'_144,'SOFT'_100,'WONK'_1]">{children}</span>;
}

export default async function Admin({ searchParams }: { searchParams: Promise<{ volver?: string }> }) {
  const { volver } = await searchParams;
  return (
    <main className="mx-auto flex w-full max-w-[560px] flex-col gap-8 px-4 py-12 sm:py-16">
      <header className="flex flex-col gap-3">
        <p className="label">BrandIA · administradores</p>
        <h1 className="text-balance">
          Entrá a los <Clave>paneles</Clave>
        </h1>
        <p className="text-muted-foreground">Costos, pruebas y pedidos. Solo para el equipo de BrandIA.</p>
      </header>
      <section className="rounded-[14px] border bg-card p-6 sm:p-8">
        <FormEntrar volver={volver} />
      </section>
    </main>
  );
}
