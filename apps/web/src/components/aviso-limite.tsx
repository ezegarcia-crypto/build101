"use client";

import { buttonVariants } from "@build101/ui/components/button";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { EVENTO_LIMITE, type TipoLimite } from "@/lib/prueba-gratis";

// El aviso cuando se termina la prueba gratis de este navegador o cuando BrandIA llegó al tope de gasto del día
// (lo dispara el fetch de lib/cliente.ts). Va en toda la app, abajo, con un botón a los planes.

const TEXTOS: Record<TipoLimite, { titulo: string; clave: string; texto: string }> = {
  prueba: {
    titulo: "Ya usaste tu",
    clave: "prueba gratis.",
    texto:
      "En la beta, cada persona arma una marca completa sin pagar. Lo que ya generaste sigue acá. Para seguir creando, mirá los planes.",
  },
  diario: {
    titulo: "BrandIA está a full",
    clave: "por hoy.",
    texto: "Llegamos al tope de pruebas del día. Volvé mañana o anotate en un plan y te escribimos.",
  },
};

export function AvisoLimite() {
  const [tipo, setTipo] = useState<TipoLimite | null>(null);

  useEffect(() => {
    const escuchar = (e: Event) => setTipo((e as CustomEvent<TipoLimite>).detail);
    window.addEventListener(EVENTO_LIMITE, escuchar);
    return () => window.removeEventListener(EVENTO_LIMITE, escuchar);
  }, []);

  if (!tipo) return null;
  const t = TEXTOS[tipo];
  return (
    <div
      role="alertdialog"
      aria-labelledby="aviso-limite-titulo"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))]"
    >
      <div className="relative w-full max-w-lg rounded-[14px] border bg-card p-6 text-card-foreground shadow-[0_30px_60px_-30px_rgba(30,30,28,.55)]">
        <button
          type="button"
          onClick={() => setTipo(null)}
          aria-label="Cerrar el aviso"
          className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-muted-foreground transition-colors duration-300 ease-brandia hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
        <h2 id="aviso-limite-titulo" className="pr-8 text-[1.6rem] leading-tight">
          {t.titulo} <span className="italic">{t.clave}</span>
        </h2>
        <p className="mt-2 text-[15px] text-muted-foreground">{t.texto}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link href="/crear/planes" onClick={() => setTipo(null)} className={buttonVariants({ size: "lg" })}>
            Ver los planes <ArrowRight data-icon="inline-end" />
          </Link>
          <button
            type="button"
            onClick={() => setTipo(null)}
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          >
            Seguir mirando
          </button>
        </div>
      </div>
    </div>
  );
}
