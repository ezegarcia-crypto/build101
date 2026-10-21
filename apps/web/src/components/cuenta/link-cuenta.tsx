"use client";

import { UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSesion } from "@/components/cuenta/usar-sesion";

// El link a la cuenta en la barra de la app: "Entrar" si nadie entró, "Tu cuenta" si ya entró.
// Lleva de vuelta a la página donde estaba la persona después de entrar. En celular es un ícono: la barra no da
// para tres palabras más.
export function LinkCuenta({ className }: { className: (activo: boolean) => string }) {
  const ruta = usePathname();
  const { cargando, usuario } = useSesion();
  const activo = ruta === "/crear/cuenta";
  const volver = ruta && ruta !== "/crear/cuenta" ? `?volver=${encodeURIComponent(ruta)}` : "";
  return (
    <Link
      href={`/crear/cuenta${usuario ? "" : volver}` as "/crear/cuenta"}
      aria-current={activo ? "page" : undefined}
      className={`${className(activo)} inline-flex items-center ${cargando ? "invisible" : ""}`}
    >
      <UserRound aria-hidden className="size-4 sm:hidden" />
      <span className="sr-only sm:not-sr-only">{usuario ? "Tu cuenta" : "Entrar"}</span>
    </Link>
  );
}
