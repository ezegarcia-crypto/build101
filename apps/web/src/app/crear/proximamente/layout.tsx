import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lo que viene · BrandIA",
  description: "Lo que BrandIA todavía está construyendo.",
};

export default function ProximamenteLayout({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-[1080px] overflow-x-clip px-4 py-12 sm:py-16">{children}</main>;
}
