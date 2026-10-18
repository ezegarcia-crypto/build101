"use client";

import { useActionState, useState } from "react";

import { Button } from "@build101/ui/components/button";

import { CATEGORIAS, REPARTOS, SOCIOS } from "@/lib/pagos";

import { anotar, borrar, type EstadoForm } from "./acciones";
import { usd } from "./formato";

// El registro de pagos: qué pagó cada uno para BrandIA. Se anota acá y queda guardado en Supabase.

export type FilaPago = {
  id: number;
  fecha: string;
  quien: string;
  concepto: string;
  categoria: keyof typeof CATEGORIAS;
  monto_usd: number;
  reparto: keyof typeof REPARTOS;
  porcentaje: number | null;
  nota: string | null;
  /** Lo que de este pago le toca a BrandIA, en dólares. */
  brandia: number;
  parte: number;
};

const campo = "rounded-[4px] border bg-background px-2 py-1.5 text-[0.9375rem]";

function Formulario({ hoy }: { hoy: string }) {
  const [estado, enviar, enviando] = useActionState<EstadoForm, FormData>(anotar, { ok: false, mensaje: null });
  const [reparto, setReparto] = useState<keyof typeof REPARTOS>("todo");

  return (
    <form action={enviar} className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <h3 className="text-xl">Anotar un pago</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1 text-[0.9375rem]">
          Fecha
          <input type="date" name="fecha" defaultValue={hoy} required className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-[0.9375rem]">
          Quién pagó
          <select name="quien" required className={campo}>
            {SOCIOS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[0.9375rem]">
          Monto, en dólares
          <input type="number" name="monto_usd" min={0.01} step={0.01} required className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-[0.9375rem] sm:col-span-2 lg:col-span-1">
          Qué se pagó
          <input name="concepto" maxLength={120} required placeholder="Créditos del AI Gateway" className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-[0.9375rem]">
          Categoría
          <select name="categoria" className={campo}>
            {Object.entries(CATEGORIAS).map(([v, n]) => (
              <option key={v} value={v}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[0.9375rem]">
          Cuánto es de BrandIA
          <select
            name="reparto"
            value={reparto}
            onChange={(e) => setReparto(e.target.value as keyof typeof REPARTOS)}
            className={campo}
          >
            {Object.entries(REPARTOS).map(([v, n]) => (
              <option key={v} value={v}>
                {n}
              </option>
            ))}
          </select>
        </label>
        {reparto === "porcentaje" && (
          <label className="flex flex-col gap-1 text-[0.9375rem]">
            Porcentaje de BrandIA
            <input type="number" name="porcentaje" min={0} max={100} step={1} required className={campo} />
          </label>
        )}
        <label className="flex flex-col gap-1 text-[0.9375rem] sm:col-span-2">
          Nota (opcional)
          <input name="nota" maxLength={300} className={campo} />
        </label>
      </div>
      {reparto === "uso_voz" && (
        <p className="lead">
          A BrandIA le toca lo que gastaron sus audios pasados a texto ese mes sobre el total de la cuenta; el resto es de Gary.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={enviando}>
          {enviando ? "Anotando…" : "Anotar pago"}
        </Button>
        {estado.mensaje && (
          <span role="status" className={estado.ok ? "text-[0.9375rem]" : "text-[0.9375rem] text-destructive"}>
            {estado.mensaje}
          </span>
        )}
      </div>
    </form>
  );
}

export function Registro({
  pagos,
  socios,
  total,
  hoy,
}: {
  pagos: FilaPago[];
  socios: { socio: string; puso: number; saldo: number }[];
  total: number;
  hoy: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      <ul className="grid gap-3 sm:grid-cols-3">
        {socios.map((s) => (
          <li key={s.socio} className="flex flex-col gap-1 rounded-lg border bg-card p-5">
            <span className="label">{s.socio}</span>
            <span className="font-display text-3xl">{usd(s.puso)}</span>
            <span className="lead">
              {Math.abs(s.saldo) < 0.005
                ? "Está al día."
                : s.saldo > 0
                  ? `BrandIA le debe ${usd(s.saldo)}.`
                  : `Le falta poner ${usd(-s.saldo)}.`}
            </span>
          </li>
        ))}
      </ul>
      <p className="lead">
        Gasto de BrandIA hasta hoy: <strong>{usd(total)}</strong>. Repartido en tres, a cada uno le tocan{" "}
        {usd(total / 3)}.
      </p>

      <Formulario hoy={hoy} />

      {pagos.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full min-w-[640px] text-left text-[0.9375rem]">
            <thead>
              <tr className="border-b">
                {["Fecha", "Quién", "Qué", "Pagó", "De BrandIA", ""].map((c, i) => (
                  <th key={c || "borrar"} className={`label px-4 py-3 font-semibold ${i >= 3 ? "text-right" : ""}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_td]:px-4 [&_td]:py-3 [&_tr+tr]:border-t">
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td className="tabular-nums">{p.fecha.split("-").reverse().join("/")}</td>
                  <td>{p.quien}</td>
                  <td>
                    {p.concepto}
                    <span className="lead block">
                      {CATEGORIAS[p.categoria]}
                      {p.reparto !== "todo" && ` · ${Math.round(p.parte * 1000) / 10} % de BrandIA`}
                      {p.nota && ` · ${p.nota}`}
                    </span>
                  </td>
                  <td className="text-right tabular-nums">{usd(p.monto_usd)}</td>
                  <td className="text-right font-semibold tabular-nums">{usd(p.brandia)}</td>
                  <td className="text-right">
                    <form
                      action={borrar.bind(null, p.id)}
                      onSubmit={(e) => {
                        if (!confirm(`¿Borrar el pago "${p.concepto}" de ${p.quien}?`)) e.preventDefault();
                      }}
                    >
                      <button type="submit" className="text-sm text-muted-foreground underline-offset-2 hover:underline">
                        Borrar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
