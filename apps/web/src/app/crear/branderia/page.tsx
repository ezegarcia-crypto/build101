import type { Metadata } from "next";

import { Branderia } from "@/components/branderia/branderia";

export const metadata: Metadata = {
  title: "Tus productos · BranderIA",
};

export default function Productos() {
  return <Branderia />;
}
