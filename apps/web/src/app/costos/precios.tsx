"use client";

import { useState } from "react";

import { usd } from "./formato";

// Para pensar los precios con los costos reales. Los supuestos arrancan con los del documento
// brandia/producto/motor-costos-y-precios.md (06/10) y se cambian acá mismo; los costos de IA
// arrancan con lo medido en el panel y, si todavía no hay datos, con la estimación de ese documento.

/** Un costo medido; `fuente` dice de dónde sale (por ejemplo, el promedio real por cliente). */
type Medido = { valor: number | null; respaldo: number; fuente?: string };

function Campo({
  etiqueta,
  valor,
  onChange,
  paso = 1,
  sufijo,
  ayuda,
}: {
  etiqueta: string;
  valor: number;
  onChange: (n: number) => void;
  paso?: number;
  sufijo?: string;
  ayuda?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-[0.9375rem]">
      <span>{etiqueta}</span>
      <span className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          step={paso}
          value={Number.isFinite(valor) ? valor : 0}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-28 rounded-[4px] border bg-background px-2 py-1 font-semibold tabular-nums"
        />
        {sufijo && <span className="text-muted-foreground">{sufijo}</span>}
      </span>
      {ayuda && <span className="lead text-[0.8125rem]">{ayuda}</span>}
    </label>
  );
}

function origen(m: Medido) {
  if (m.valor === null) return "Todavía sin medir: estimación del documento de precios (06/10)";
  return m.fuente ? `Medido: ${m.fuente.charAt(0).toLowerCase()}${m.fuente.slice(1)}` : "Medido en este panel";
}

/** Lo que queda de cada venta después del IVA, la comisión de cobro y los costos. */
function cuentas(precio: number, iva: number, comision: number, costos: number) {
  const neto = precio / (1 + iva / 100);
  const cobro = precio * (comision / 100);
  const contribucion = neto - cobro - costos;
  return { neto, cobro, contribucion, margen: neto > 0 ? contribucion / neto : 0 };
}

function Resultado({ titulo, c, costos, fijos }: { titulo: string; c: ReturnType<typeof cuentas>; costos: number; fijos: number }) {
  const clientes = c.contribucion > 0 ? Math.ceil(fijos / c.contribucion) : null;
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border bg-background p-4 text-[0.9375rem]">
      <dt className="label col-span-2">{titulo}</dt>
      <dt className="text-muted-foreground">Neto sin IVA</dt>
      <dd className="text-right tabular-nums">{usd(c.neto)}</dd>
      <dt className="text-muted-foreground">Comisión de cobro</dt>
      <dd className="text-right tabular-nums">−{usd(c.cobro)}</dd>
      <dt className="text-muted-foreground">IA e infraestructura</dt>
      <dd className="text-right tabular-nums">−{usd(costos)}</dd>
      <dt className="font-semibold">Nos queda</dt>
      <dd className="text-right font-display text-2xl tabular-nums">
        {usd(c.contribucion)} <span className="text-base text-muted-foreground">({Math.round(c.margen * 100)} %)</span>
      </dd>
      <dt className="col-span-2 text-muted-foreground">
        {clientes === null
          ? "Con este precio perdemos plata en cada venta."
          : `Hacen falta ${clientes} por mes para cubrir los costos fijos.`}
      </dt>
    </dl>
  );
}

function Comparacion({ precios, calcular }: { precios: number[]; calcular: (p: number) => ReturnType<typeof cuentas> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-[0.9375rem]">
        <thead>
          <tr className="border-b">
            {["Precio", "Neto", "Nos queda", "% del neto"].map((c, i) => (
              <th key={c} className={`label px-3 py-2 font-semibold ${i ? "text-right" : ""}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:px-3 [&_td]:py-2 [&_td+td]:text-right [&_td+td]:tabular-nums [&_tr+tr]:border-t">
          {precios.map((p) => {
            const c = calcular(p);
            return (
              <tr key={p}>
                <td>{usd(p)}</td>
                <td>{usd(c.neto)}</td>
                <td className="font-semibold">{usd(c.contribucion)}</td>
                <td>{Math.round(c.margen * 100)} %</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Precios({ pieza, marca, vistaPrevia }: { pieza: Medido; marca: Medido; vistaPrevia: Medido }) {
  // Comunes
  const [iva, setIva] = useState(22);
  const [comision, setComision] = useState(4.87);
  const [fijos, setFijos] = useState(95);
  // Suscripción
  const [precioSus, setPrecioSus] = useState(29);
  const [piezas, setPiezas] = useState(30);
  const [costoPieza, setCostoPieza] = useState(pieza.valor ?? pieza.respaldo);
  const [extraSus, setExtraSus] = useState(50);
  const [infra, setInfra] = useState(0.5);
  // Identidad
  const [precioId, setPrecioId] = useState(49);
  const [costoMarca, setCostoMarca] = useState(marca.valor ?? marca.respaldo);
  const [extraId, setExtraId] = useState(150);
  const [costoVista, setCostoVista] = useState(vistaPrevia.valor ?? vistaPrevia.respaldo);
  const [conversion, setConversion] = useState(5);

  const iaSus = piezas * costoPieza * (1 + extraSus / 100);
  const costosSus = iaSus + infra;
  const calcularSus = (p: number) => cuentas(p, iva, comision, costosSus);

  const ajenas = conversion > 0 ? (100 - conversion) / conversion : 0;
  const costosId = costoMarca * (1 + extraId / 100) + costoVista * ajenas;
  const calcularId = (p: number) => cuentas(p, iva, comision, costosId);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border bg-card p-5">
        <h3 className="text-xl">Suscripción mensual (packs de contenidos)</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo etiqueta="Precio por mes, con IVA" valor={precioSus} onChange={setPrecioSus} sufijo="USD" />
          <Campo etiqueta="Piezas por mes" valor={piezas} onChange={setPiezas} ayuda="Posteos, historias, carruseles y reels." />
          <Campo etiqueta="Costo de IA por pieza" valor={costoPieza} onChange={setCostoPieza} paso={0.01} sufijo="USD" ayuda={origen(pieza)} />
          <Campo etiqueta="Extra por regeneraciones" valor={extraSus} onChange={setExtraSus} paso={10} sufijo="%" ayuda="Lo que se rehace hasta que le gusta." />
          <Campo etiqueta="Infraestructura por cliente" valor={infra} onChange={setInfra} paso={0.1} sufijo="USD" />
        </div>
        <p className="lead">
          IA por mes: <strong>{usd(iaSus)}</strong> por cliente ({piezas} piezas × {usd(costoPieza)} + {extraSus} %).
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <Resultado titulo={`A ${usd(precioSus)} por mes`} c={calcularSus(precioSus)} costos={costosSus} fijos={fijos} />
          <Comparacion precios={[19, 29, 39, 49]} calcular={calcularSus} />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border bg-card p-5">
        <h3 className="text-xl">Identidad de marca (pago único)</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo etiqueta="Precio, con IVA" valor={precioId} onChange={setPrecioId} sufijo="USD" />
          <Campo etiqueta="Costo de IA de una marca" valor={costoMarca} onChange={setCostoMarca} paso={0.01} sufijo="USD" ayuda={origen(marca)} />
          <Campo etiqueta="Extra por regeneraciones" valor={extraId} onChange={setExtraId} paso={10} sufijo="%" ayuda="El documento planifica USD 3 por marca: 150 % sobre 1,20." />
          <Campo etiqueta="Vista previa gratis" valor={costoVista} onChange={setCostoVista} paso={0.01} sufijo="USD" ayuda={`Entrevista, nombres y direcciones. ${origen(vistaPrevia)}`} />
          <Campo etiqueta="De cada 100 que prueban, compran" valor={conversion} onChange={setConversion} sufijo="%" ayuda="Las vistas previas de quien no compra las paga el que compra." />
        </div>
        <p className="lead">
          IA por venta: <strong>{usd(costosId)}</strong> (la marca con regeneraciones, más {ajenas.toFixed(0)} vistas previas
          de quienes no compran).
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <Resultado titulo={`A ${usd(precioId)}`} c={calcularId(precioId)} costos={costosId} fijos={fijos} />
          <Comparacion precios={[39, 49, 59, 79]} calcular={calcularId} />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border bg-card p-5">
        <h3 className="text-xl">Para los dos</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="IVA" valor={iva} onChange={setIva} sufijo="%" ayuda="A confirmar con el contador." />
          <Campo etiqueta="Comisión de cobro" valor={comision} onChange={setComision} paso={0.01} sufijo="%" />
          <Campo etiqueta="Costos fijos por mes" valor={fijos} onChange={setFijos} sufijo="USD" ayuda="Supabase, Vercel, Workspace, dominio, pruebas y demos." />
        </div>
        <p className="lead">No incluye ElevenLabs (la entrevista por voz), ni el video, ni nuestro tiempo.</p>
      </section>
    </div>
  );
}
