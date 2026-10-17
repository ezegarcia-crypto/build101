import type { Metadata } from "next";

import { GenerarMarca } from "@/components/brandbook/generar-marca";

export const metadata: Metadata = {
  title: "Tu marca · BrandIA",
};

export default function Marca() {
  return <GenerarMarca />;
}
