"use client";

import { Button } from "@build101/ui/components/button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

import { Ejemplo } from "../_piezas/piezas";

// Catálogo inicial de BranderIA (equipo/design-system.md § 6). Sin precios hasta que los socios los cierren.
const PRODUCTOS = [
  ["Tarjetas", "Papel grueso"],
  ["Folletos", "Tríptico"],
  ["Carpetas", "Con bolsillo"],
  ["Lapiceras", "Grabadas"],
  ["Gorros", "Bordados"],
  ["Remeras", "Algodón"],
  ["Tote bags", "Algodón crudo"],
  ["Vasos térmicos", "Con tapa"],
  ["Termos para mate", "Acero, pico cebador"],
  ["Mates", "Con bombilla"],
  ["Tazas de café", "Cerámica"],
  ["Soportes de celular", "Para videollamadas"],
] as const;

const CANTIDADES = [0, 25, 50, 100, 250, 500];

export function Kit() {
  const ref = useRef<HTMLDivElement>(null);
  const [nivel, setNivel] = useState<number[]>(() => PRODUCTOS.map(() => 0));
  const [pedido, setPedido] = useState(false);

  const elegidos = nivel.filter((n) => n > 0).length;
  const unidades = nivel.reduce((t, n) => t + (CANTIDADES[n] ?? 0), 0);

  // "El logo cae sobre el producto": el lugar del logo cae y se acomoda (back.out(1.6)).
  useEffect(() => {
    const raiz = ref.current;
    if (!raiz || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-logo]").forEach((el, i) => {
        gsap.from(el, {
          y: -56,
          opacity: 0,
          scale: 1.25,
          duration: 0.5,
          ease: "back.out(1.6)",
          delay: (i % 4) * 0.08,
          scrollTrigger: { trigger: el, start: "top 95%", once: true },
        });
      });
    }, raiz);
    return () => ctx.revert();
  }, []);

  function cambiar(i: number, paso: number) {
    setPedido(false);
    setNivel((prev) => prev.map((n, j) => (j === i ? Math.min(Math.max(n + paso, 0), CANTIDADES.length - 1) : n)));
  }

  return (
    <div ref={ref} data-entra className="flex flex-col gap-3 rounded-[22px] bg-cemento/60 p-3 sm:p-5 dark:bg-muted">
      <div className="flex flex-wrap items-center gap-3 rounded-[16px] bg-card p-3 pl-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Tu kit</span>
          <span aria-live="polite" className="font-semibold">
            {elegidos
              ? `${elegidos} producto${elegidos > 1 ? "s" : ""} · ${unidades} unidades`
              : "Elegí productos y cantidades"}
          </span>
        </div>
        <Button className="ml-auto" disabled={!elegidos} onClick={() => setPedido(true)}>
          Pedir <span aria-hidden>→</span>
        </Button>
      </div>

      {pedido && (
        <div role="status" className="flex flex-col gap-2 rounded-[14px] bg-primary p-4 text-primary-foreground sm:p-5">
          <p className="font-semibold">Así va a funcionar.</p>
          <p className="text-[0.9375rem] opacity-85">
            BrandIA produce cada producto con tu marca, controla que salga bien y te lo manda a tu puerta.
            Esto está en construcción: no se hizo ningún pedido ni se cobró nada.
          </p>
        </div>
      )}

      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {PRODUCTOS.map(([nombre, detalle], i) => {
          const n = nivel[i] ?? 0;
          return (
            <li
              key={nombre}
              className="flex flex-col gap-2.5 rounded-lg bg-card p-3 transition-[transform,box-shadow] duration-500 ease-brandia hover:-translate-y-1.5 hover:shadow-[0_24px_40px_-24px_rgba(30,30,28,.35)]"
            >
              <div className="relative grid aspect-square place-items-center rounded-[10px] border border-dashed border-foreground/20 bg-muted p-2 text-center text-[0.6875rem] leading-snug text-muted-foreground">
                <span
                  data-logo
                  aria-hidden
                  className="absolute top-3 left-1/2 grid size-9 -translate-x-1/2 place-items-center rounded-full border border-dashed border-foreground/35 bg-card text-[0.5625rem] font-semibold"
                >
                  tu logo
                </span>
                <span className="mt-8">La IA genera la foto con tu marca</span>
              </div>
              <div className="leading-tight">
                <p className="text-[0.9375rem] font-semibold">{nombre}</p>
                <p className="text-xs text-muted-foreground">{detalle}</p>
              </div>
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  aria-label={`Menos ${nombre}`}
                  disabled={n === 0}
                  onClick={() => cambiar(i, -1)}
                  className="grid size-8 place-items-center rounded-full border text-base transition-colors duration-300 ease-brandia hover:bg-muted disabled:opacity-35"
                >
                  −
                </button>
                <span className="text-sm tabular-nums">{CANTIDADES[n] ? `${CANTIDADES[n]} u.` : "—"}</span>
                <button
                  type="button"
                  aria-label={`Más ${nombre}`}
                  disabled={n === CANTIDADES.length - 1}
                  onClick={() => cambiar(i, 1)}
                  className="grid size-8 place-items-center rounded-full border text-base transition-colors duration-300 ease-brandia hover:bg-muted disabled:opacity-35"
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <Ejemplo className="self-start" texto="Catálogo de muestra · sin precios ni pedidos reales" />
    </div>
  );
}
