import { notFound } from "next/navigation";

import PruebaVoz from "./prueba-voz";

// Página de prueba del agente de voz, solo para desarrollo: /api/voz/prueba
// Anda en la compu y en los links de prueba de cada rama; en la web publicada (producción) no existe.
// La pantalla de verdad la hace Juan Pedro en /crear.

export default function Page() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <PruebaVoz />;
}
