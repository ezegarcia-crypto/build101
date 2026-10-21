"use client";

import Link from "next/link";
import { useMemo } from "react";

import type { Colores } from "@/lib/ia/contenidos/componer";
import type { ItemPlan, Pieza, Plan } from "@/lib/ia/contenidos/esquemas";
import { FORMATOS } from "@/lib/ia/contenidos/formatos";

import { fechaLocal } from "./mes";

// El calendario del mes, armado con el plan que generó la IA: cada pieza cae en su día y su hora (sin IA nueva).
// Sin suscripción, la primera semana es la del lote que se acaba de generar, desde el próximo lunes, y las otras
// tres quedan para el plan mensual: se ven, pero vacías, con un link a los planes (o, si la persona es suscriptora,
// un botón para armar el mes completo). En el mes completo (las piezas traen `semana`), las cuatro semanas
// están llenas, desde el lunes que quedó guardado con el mes. Va en el lienzo del cliente, con sus colores.

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

export function Calendario({ plan, piezas, c, titulos, inicio: inicioMes, onMesCompleto }: {
  plan: Plan;
  piezas: Record<string, Pieza>;
  c: Colores;
  /** La familia de los títulos de la marca, para el CSS */
  titulos: string;
  /** Mes completo: el lunes en que empieza (AAAA-MM-DD). Sin él, es una semana suelta */
  inicio?: string;
  /** Suscriptor viendo una semana suelta: arma el mes completo */
  onMesCompleto?: () => void;
}) {
  const inicio = useMemo(() => (inicioMes ? fechaLocal(inicioMes) : proximoLunes()), [inicioMes]);
  const mesCompleto = Boolean(inicioMes);
  // "semana:día" → las piezas de ese día, por hora. Una semana suelta es la semana 1
  const porDia = useMemo(() => {
    const m = new Map<string, ItemPlan[]>();
    for (const p of plan.piezas) {
      const k = `${p.semana ?? 1}:${p.dia}`;
      m.set(k, [...(m.get(k) ?? []), p]);
    }
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
          {plan.piezas.length} piezas {mesCompleto ? `en ${SEMANAS} semanas` : "la primera semana"} · tocá una para verla
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
            const items = porDia.get(`${semana + 1}:${DIAS[i % 7]}`) ?? [];
            const primero = i === 0 || fecha.getDate() === 1;
            return (
              <li
                key={i}
                aria-label={fechaLarga(fecha)}
                className={`flex min-h-24 flex-col gap-1 rounded-[4px] p-1.5 ${semana > 0 && !mesCompleto ? "opacity-45" : ""}`}
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

      {/* Celular: como agenda, día por día (en el mes completo, las cuatro semanas) */}
      <ol className="mt-4 flex flex-col gap-2 sm:hidden">
        {Array.from({ length: (mesCompleto ? SEMANAS : 1) * 7 }, (_, i) => {
          const semana = Math.floor(i / 7) + 1;
          const items = porDia.get(`${semana}:${DIAS[i % 7]}`) ?? [];
          if (!items.length) return null;
          const primeroDeLaSemana = mesCompleto && !DIAS.slice(0, i % 7).some((d) => porDia.has(`${semana}:${d}`));
          return (
            <li key={i} className="flex flex-col gap-2">
              {primeroDeLaSemana && (
                <span className="pt-2 text-[11px] font-semibold tracking-[0.14em] uppercase opacity-60">Semana {semana}</span>
              )}
              <span className="flex gap-3 rounded-[4px] p-2.5" style={{ boxShadow: `inset 0 0 0 1px ${linea}` }}>
              <span className="w-20 shrink-0 text-[13px] leading-tight first-letter:uppercase" style={{ fontFamily: titulos }}>
                {fechaLarga(masDias(inicio, i)).replace(/ de [a-záéíóú]+$/, "")}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                {items.map((p) => (
                  <Chip key={p.id} item={p} lista={!!piezas[p.id]} c={c} />
                ))}
              </span>
              </span>
            </li>
          );
        })}
      </ol>

      {!mesCompleto && (
        <p className="mt-4 text-[13px] leading-relaxed opacity-75">
          Las otras semanas las arma BrandIA con tu plan mensual.{" "}
          {onMesCompleto ? (
            <button type="button" onClick={onMesCompleto} className="font-semibold underline underline-offset-2" style={{ color: c.texto }}>
              Armar mi mes completo
            </button>
          ) : (
            <Link href="/crear/planes" className="font-semibold underline underline-offset-2" style={{ color: c.texto }}>
              Ver los planes
            </Link>
          )}
        </p>
      )}
    </section>
  );
}
