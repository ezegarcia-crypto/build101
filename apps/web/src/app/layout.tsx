import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";

import "../index.css";
import { AvisoLimite } from "@/components/aviso-limite";
import { SincronizarMarca } from "@/components/cuenta/sincronizar-marca";
import Header from "@/components/header";
import Providers from "@/components/providers";

import { ClienteEnPedidos } from "./cliente-en-pedidos";

// Tipografías de BrandIA (manual v1.3): Fraunces para títulos, Instrument Sans para texto
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

// La imagen que se ve al compartir el link (WhatsApp, redes): public/compartir.png, 1200 × 630, con el logo oficial
const compartir = {
  url: "/compartir.png",
  width: 1200,
  height: 630,
  alt: "BrandIA · Que se vea tan bien como lo que hacés.",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://app.brandiamos.com"),
  title: "BrandIA",
  description: "Tu marca, andando.",
  openGraph: {
    type: "website",
    siteName: "BrandIA",
    locale: "es_UY",
    images: [compartir],
  },
  twitter: { card: "summary_large_image", images: [compartir.url] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${instrumentSans.variable} antialiased`}>
        <ClienteEnPedidos />
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">
            <Header />
            {children}
          </div>
          <AvisoLimite />
          <SincronizarMarca />
        </Providers>
      </body>
    </html>
  );
}
