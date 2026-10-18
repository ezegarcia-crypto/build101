"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoBranderia } from "./logo-branderia";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  // Las webs publicadas de los clientes (/w/...) son de su marca: ahí no va la barra de BrandIA
  const ruta = usePathname();
  if (ruta?.startsWith("/w/")) return null;
  // En BranderIA (los productos) la barra lleva su nombre
  const branderia = ruta?.startsWith("/crear/branderia") || ruta?.startsWith("/crear/proximamente/branderia");
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-[1080px] items-center justify-between px-4 py-3">
        {branderia ? (
          <Link href="/" aria-label="BranderIA, de BrandIA: inicio" className="flex h-7 items-center">
            <LogoBranderia />
          </Link>
        ) : (
          <Link href="/" aria-label="BrandIA, inicio">
            {/* El logo nunca se recrea: se usan los SVG originales de brandia/marca/logo */}
            <img src="/marca/logo-horizontal.svg" alt="BrandIA" className="h-7 w-auto dark:hidden" />
            <img
              src="/marca/logo-horizontal-sobre-grafito.svg"
              alt="BrandIA"
              className="hidden h-7 w-auto dark:block"
            />
          </Link>
        )}
        <ModeToggle />
      </div>
    </header>
  );
}
