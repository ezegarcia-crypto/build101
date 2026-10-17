import type { Metadata } from "next";

import { GenerarFeed } from "@/components/feed/generar-feed";

export const metadata: Metadata = {
  title: "Tu contenido · BrandIA",
};

export default function Contenido() {
  return <GenerarFeed />;
}
