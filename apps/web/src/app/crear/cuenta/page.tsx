import type { Metadata } from "next";

import { Cuenta } from "./cuenta";

export const metadata: Metadata = {
  title: "Tu cuenta · BrandIA",
  description: "Entrá a tu cuenta: tus marcas guardadas y tu plan.",
};

// La cuenta: entrar (código por mail o Google) y, adentro, el plan y las marcas guardadas. Todo pasa en la
// pantalla (cuenta.tsx) con la sesión de la persona; lo que puede ver lo cuida la base (supabase/cuentas.sql).
export default function PaginaCuenta() {
  return (
    <main className="mx-auto w-full max-w-[1080px] overflow-x-clip px-4 py-12 sm:py-16">
      <Cuenta />
    </main>
  );
}
