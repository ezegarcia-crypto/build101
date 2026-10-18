"use client";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ModeToggle } from "./mode-toggle";

// Los links de la barra en la app (/crear/...): lo que todavía no funciona y cuánto cuesta. Así quien prueba
// la app llega a las dos pantallas desde cualquier paso del recorrido.
const LINKS: { href: Route; texto: string }[] = [
  { href: "/crear/proximamente", texto: "Lo que viene" },
  { href: "/crear/planes", texto: "Planes" },
];

export default function Header() {
  // Las webs publicadas de los clientes (/w/...) son de su marca: ahí no va la barra de BrandIA
  const ruta = usePathname();
  if (ruta?.startsWith("/w/")) return null;
  const enLaApp = ruta?.startsWith("/crear");
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-3 px-4 py-3">
        <Link href="/" aria-label="BrandIA, inicio" className="shrink-0">
          {/* El logo nunca se recrea: se usan los SVG originales de brandia/marca/logo */}
          <img src="/marca/logo-horizontal.svg" alt="BrandIA" className="h-6 w-auto sm:h-7 dark:hidden" />
          <img
            src="/marca/logo-horizontal-sobre-grafito.svg"
            alt="BrandIA"
            className="hidden h-6 w-auto sm:h-7 dark:block"
          />
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          {enLaApp && (
            <nav aria-label="Más de BrandIA" className="flex items-center gap-0.5 sm:gap-2">
              {LINKS.map((l) => {
                const activo = ruta === l.href || ruta?.startsWith(`${l.href}/`);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={activo ? "page" : undefined}
                    className={`rounded-full px-2 py-1.5 text-sm font-semibold whitespace-nowrap no-underline transition-colors duration-300 ease-brandia sm:px-3 ${
                      activo ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l.texto}
                  </Link>
                );
              })}
            </nav>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
