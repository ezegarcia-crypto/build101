import type { Metadata } from "next";

import { Entrevista } from "@/components/entrevista/entrevista";

export const metadata: Metadata = {
  title: "Contanos tu negocio · BrandIA",
};

export default function Crear() {
  return <Entrevista />;
}
