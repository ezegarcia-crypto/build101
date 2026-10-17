"use client";
import Link from "next/link";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-[1080px] items-center justify-between px-4 py-3">
        <Link href="/" aria-label="BrandIA, inicio">
          {/* El logo nunca se recrea: se usan los SVG originales de brandia/marca/logo */}
          <img src="/marca/logo-horizontal.svg" alt="BrandIA" className="h-7 w-auto dark:hidden" />
          <img
            src="/marca/logo-horizontal-sobre-grafito.svg"
            alt="BrandIA"
            className="hidden h-7 w-auto dark:block"
          />
        </Link>
        <ModeToggle />
      </div>
    </header>
  );
}
