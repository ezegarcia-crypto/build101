import type { Metadata } from "next";

import { FormAlta } from "../formularios";

// El alta de un administrador, una sola vez por persona: elige su contraseña y vincula Google Authenticator.
// Solo sirve para los mails de la lista cerrada (tabla `admins`) y pide la contraseña del equipo (COSTOS_CLAVE).

export const metadata: Metadata = {
  title: "Activar cuenta · BrandIA",
  robots: { index: false, follow: false },
};

function Clave({ children }: { children: React.ReactNode }) {
  return <span className="font-normal italic [font-variation-settings:'opsz'_144,'SOFT'_100,'WONK'_1]">{children}</span>;
}

export default function Alta() {
  return (
    <main className="mx-auto flex w-full max-w-[560px] flex-col gap-8 px-4 py-12 sm:py-16">
      <header className="flex flex-col gap-3">
        <p className="label">BrandIA · administradores</p>
        <h1 className="text-balance">
          Activá tu <Clave>cuenta</Clave>
        </h1>
        <p className="text-muted-foreground">
          Se hace una sola vez. Elegís tu contraseña y vinculás Google Authenticator: después, para entrar, te pide los
          dos.
        </p>
      </header>
      <section className="rounded-[14px] border bg-card p-6 sm:p-8">
        <FormAlta />
      </section>
    </main>
  );
}
