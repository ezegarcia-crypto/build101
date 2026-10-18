"use client";

import Link from "next/link";
import { useMemo } from "react";

import type { Colores } from "@/lib/ia/contenidos/componer";
import type { ItemPlan, Pieza, Plan } from "@/lib/ia/contenidos/esquemas";
import { FORMATOS } from "@/lib/ia/contenidos/formatos";

// El calendario del mes, armado con el plan que generó la IA: cada pieza cae en su día y su hora (sin IA nueva).
// La primera semana es la del lote que se acaba de generar, desde el próximo lunes. Las otras tres quedan para el
// plan mensual: se ven, pero vacías, con un link a los planes. Va en el lienzo del cliente, con sus colores.

const DIAS: ItemPlan["dia"][] = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const SEMANAS = 4;

/** El próximo lunes (hoy, si hoy es lunes), a la medianoche. */
function proximoLunes(hoy = new Date()) {
  const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const desdeLunes = (d.getDay() + 6) % 7; // lunes = 0
  if (desdeLunes) d.setDate(d.getDate() + 7 - desdeLunes);
  return d;
}

const masDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const fechaLarga = (d: Date) => d.toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" });
const mesDe = (d: Date) => d.toLocaleDateString("es-UY", { month: "long" });

function irA(id: string) {
  document.getElementById(`pieza-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Una pieza en el calendario: formato y hora. Si ya está escrita, lleva a su tarjeta del feed. */
function Chip({ item, lista, c, chico }: { item: ItemPlan; lista: boolean; c: Colores; chico?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => irA(item.id)}
      disabled={!lista}
      title={item.idea}
      className={`flex w-full min-w-0 items-center gap-1.5 rounded-[4px] text-left font-semibold transition-transform duration-300 ease-brandia enabled:hover:-translate-y-0.5 disabled:animate-pulse ${
        chico ? "px-1.5 py-1 text-[11px]" : "px-2.5 py-2 text-[13px]"
      }`}
      style={{ background: c.principal, color: c.sobrePrincipal }}
    >
      <span className="truncate">{FORMATOS[item.formato].nombre}</span>
      <span className="ml-auto shrink-0 font-normal opacity-80">{item.hora}</span>
    </button>
  );
}

export function Calendario({ plan, piezas, c, titulos }: {
  plan: Plan;
  piezas: Record<string, Pieza>;
  c: Colores;
  /** La familia de los títulos de la marca, para el CSS */
  titulos: string;
}) {
  const inicio = useMemo(() => proximoLunes(), []);
  const porDia = useMemo(() => {
    const m = new Map<ItemPlan["dia"], ItemPlan[]>();
    for (const p of plan.piezas) m.set(p.dia, [...(m.get(p.dia) ?? []), p]);
    for (const lista of m.values()) lista.sort((a, b) => a.hora.localeCompare(b.hora));
    return m;
  }, [plan.piezas]);

  const fin = masDias(inicio, SEMANAS * 7 - 1);
  const meses = mesDe(inicio) === mesDe(fin) ? mesDe(inicio) : `${mesDe(inicio)} y ${mesDe(fin)}`;
  const linea = `${c.texto}26`;

  return (
    <section aria-labelledby="calendario-titulo" className="mt-8 border-t pt-6" style={{ borderColor: linea }}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p id="calendario-titulo" className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-70">
          Tu calendario · {meses}
        </p>
        <p className="text-[13px] opacity-70">
          {plan.piezas.length} piezas la primera semana · tocá una para verla
        </p>
      </div>

      {/* Compu: el mes en grilla */}
      <div className="mt-4 hidden sm:block">
        <div className="grid grid-cols-7 gap-1.5 pb-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase opacity-60">
          {DIAS.map((d) => (
            <span key={d}>{d.slice(0, 3)}</span>
          ))}
        </div>
        <ol className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: SEMANAS * 7 }, (_, i) => {
            const fecha = masDias(inicio, i);
            const semana = Math.floor(i / 7);
            const items = semana === 0 ? (porDia.get(DIAS[i % 7]) ?? []) : [];
            const primero = i === 0 || fecha.getDate() === 1;
            return (
              <li
                key={i}
                aria-label={fechaLarga(fecha)}
                className={`flex min-h-24 flex-col gap-1 rounded-[4px] p-1.5 ${semana > 0 ? "opacity-45" : ""}`}
                style={{ boxShadow: `inset 0 0 0 1px ${linea}` }}
              >
                <span className="text-[13px] leading-none" style={{ fontFamily: titulos }}>
                  {fecha.getDate()}
                  {primero && <span className="ml-1 text-[11px] opacity-70">{fecha.toLocaleDateString("es-UY", { month: "short" })}</span>}
                </span>
                {items.map((p) => (
                  <Chip key={p.id} item={p} lista={!!piezas[p.id]} c={c} chico />
                ))}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Celular: la primera semana como agenda, día por día */}
      <ol className="mt-4 flex flex-col gap-2 sm:hidden">
        {DIAS.map((d, i) => {
          const items = porDia.get(d) ?? [];
          if (!items.length) return null;
          return (
            <li key={d} className="flex gap-3 rounded-[4px] p-2.5" style={{ boxShadow: `inset 0 0 0 1px ${linea}` }}>
              <span className="w-20 shrink-0 text-[13px] leading-tight first-letter:uppercase" style={{ fontFamily: titulos }}>
                {fechaLarga(masDias(inicio, i)).replace(/ de [a-záéíóú]+$/, "")}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                {items.map((p) => (
                  <Chip key={p.id} item={p} lista={!!piezas[p.id]} c={c} />
                ))}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-[13px] leading-relaxed opacity-75">
        Las otras semanas las arma BrandIA con tu plan mensual.{" "}
        <Link href="/crear/planes" className="font-semibold underline underline-offset-2" style={{ color: c.texto }}>
          Ver los planes
        </Link>
      </p>
    </section>
  );
}
