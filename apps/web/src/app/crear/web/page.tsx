import type { Metadata } from "next";

import { WebCliente } from "@/components/web/web-cliente";

export const metadata: Metadata = {
  title: "Tu web · BrandIA",
};

export default function Web() {
  return <WebCliente />;
}
