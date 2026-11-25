import type { Metadata } from "next";

import { SesionAdmin } from "@/app/admin/sesion-admin";
import {
  type Cobro,
  estadoCobro,
  type Factura,
  leerPanelCobros,
  PLANES,
  type Suscripcion,
} from "@/lib/admin/cobros";

// Panel de cobros del equipo (C6 del plan de la beta): cada pago, las suscripciones activas y dadas de baja, los
// cobros fallidos, las facturas emitidas y pendientes con sus reintentos, y lo que costó la IA de cada cliente.
// Solo para administradores (proxy.ts). Hoy muestra datos de ejemplo (lib/admin/cobros-ejemplo.ts) y lo avisa.

export const metadata: Metadata = {
  title: "Cobros · BrandIA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const fecha = new Intl.DateTimeFormat("es-UY", {
  day: "numeric",
  month: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Montevideo",
});
const dia = new Intl.DateTimeFormat("es-UY", { day: "numeric", month: "numeric", year: "2-digit", timeZone: "America/Montevideo" });

function plata(monto: number | null, moneda: string | null) {
  if (monto === null) return "—";
  const m = moneda ?? "UYU";
  return new Intl.NumberFormat("es-UY", { style: "currency", currency: m, maximumFractionDigits: 2 }).format(monto);
}
const usd = (n: number | undefined) =>
  n === undefined ? "—" : new Intl.NumberFormat("es-UY", { style: "currency", currency: "USD" }).format(n);

function Clave({ children }: { children: React.ReactNode }) {
  return <span className="font-normal italic [font-variation-settings:'opsz'_144,'SOFT'_100,'WONK'_1]">{children}</span>;
}

const ESTILO_ETIQUETA = {
  ok: "border-foreground/30",
  espera: "border-dashed border-foreground/30 text-muted-foreground",
  mal: "border-destructive/60 text-destructive",
  devuelto: "border-foreground/20 text-muted-foreground line-through decoration-1",
} as const;

function Etiqueta({ tipo, children }: { tipo: keyof typeof ESTILO_ETIQUETA; children: React.ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ESTILO_ETIQUETA[tipo]}`}>
      {children}
    </span>
  );
}

function EtiquetaFactura({ f, aprobado }: { f: Factura | undefined; aprobado: boolean }) {
  // Un pago devuelto que ya tenía factura la sigue mostrando (la devolución lleva su nota de crédito, a confirmar)
  if (!aprobado && f?.estado !== "emitida") return <span className="text-sm text-muted-foreground">No corresponde</span>;
  if (!f || f.estado === "pendiente") return <Etiqueta tipo="espera">Factura pendiente</Etiqueta>;
  if (f.estado === "fallo") return <Etiqueta tipo="mal">Factura con error · {f.intentos} intentos</Etiqueta>;
  return <Etiqueta tipo="ok">Factura {f.numero}</Etiqueta>;
}

function Numero({ titulo, valor, detalle }: { titulo: string; valor: string; detalle: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] border bg-card p-5">
      <p className="label">{titulo}</p>
      <p className="font-display text-3xl tabular-nums">{valor}</p>
      <p className="text-sm text-muted-foreground">{detalle}</p>
    </div>
  );
}

function Seccion({ titulo, bajada, children }: { titulo: React.ReactNode; bajada?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl">{titulo}</h2>
        {bajada && <p className="max-w-2xl text-muted-foreground">{bajada}</p>}
      </div>
      {children}
    </section>
  );
}

const Vacio = ({ texto }: { texto: string }) => (
  <p className="rounded-[14px] border border-dashed px-5 py-4 text-[0.9375rem] text-muted-foreground">{texto}</p>
);

const ESTADOS_SUSCRIPCION: { estado: Suscripcion["estado"]; titulo: string; tipo: keyof typeof ESTILO_ETIQUETA }[] = [
  { estado: "activa", titulo: "Activas", tipo: "ok" },
  { estado: "pausada", titulo: "Pausadas por cobro fallido", tipo: "mal" },
  { estado: "pendiente", titulo: "Fueron a pagar y no volvieron", tipo: "espera" },
  { estado: "cancelada", titulo: "Dadas de baja o devueltas", tipo: "devuelto" },
];

export default async function Cobros() {
  const panel = await leerPanelCobros();
  const { cobros, suscripciones, facturas, costoIA } = panel;

  const susPorId = new Map(suscripciones.map((x) => [x.id, x]));
  const facturaDe = new Map(facturas.map((f) => [f.cobro, f]));
  const planDe = (c: Cobro) => (c.suscripcion ? susPorId.get(c.suscripcion)?.plan : undefined);

  const reales = cobros.filter((c) => !c.prueba);
  const aprobados = reales.filter((c) => c.estado === "approved");
  const devueltos = reales.filter((c) => estadoCobro(c.estado).tipo === "devuelto");
  const fallidos = reales.filter((c) => estadoCobro(c.estado).tipo === "mal");
  const esperando = reales.filter((c) => estadoCobro(c.estado).tipo === "espera");
  const sinFactura = cobros.filter((c) => c.estado === "approved" && facturaDe.get(c.id)?.estado !== "emitida");
  const mensualesActivas = suscripciones.filter((x) => x.plan === "mensual" && x.estado === "activa" && !x.prueba);
  const pagas = mensualesActivas.filter((x) => x.proveedor === "mercadopago");

  const suma = (lista: Cobro[]) => lista.reduce((a, c) => a + (c.monto ?? 0), 0);
  const moneda = aprobados[0]?.moneda ?? "UYU";

  const ordenados = [...cobros].sort((a, b) => b.creado.localeCompare(a.creado));

  // Cada cliente: lo que pagó (aprobado y no devuelto) y lo que costó su IA
  const clientes = [...new Set(suscripciones.map((x) => x.usuario))].map((usuario) => {
    const suyas = suscripciones.filter((x) => x.usuario === usuario);
    const pagado = suma(aprobados.filter((c) => c.usuario === usuario));
    return {
      usuario,
      mail: suyas[0]?.mail ?? "Sin mail",
      planes: [...new Set(suyas.map((x) => PLANES[x.plan]))].join(" + "),
      piloto: suyas.some((x) => x.proveedor === "piloto"),
      prueba: suyas.every((x) => x.prueba),
      pagado,
      ia: costoIA[usuario],
    };
  });

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-[1080px] flex-col gap-12 px-4 py-12 sm:py-16">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="label">BrandIA · solo para el equipo</p>
          <SesionAdmin />
        </div>
        <h1 className="display max-w-3xl text-balance">
          Lo que <Clave>cobramos.</Clave>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Cada pago que avisa Mercado Pago, las suscripciones, las facturas y lo que costó la IA de cada cliente. Los
          cobros en modo prueba se ven, pero no se suman. <a href="/admin/cobros">Actualizar</a>
        </p>
        {panel.origen === "ejemplo" && (
          <p role="note" className="rounded-[14px] border border-dashed px-5 py-4 text-[0.9375rem]">
            <strong>Datos de ejemplo, inventados.</strong> Todavía no están conectadas las tablas de cobros. Las
            facturas, sus reintentos y el costo de IA por cliente están a confirmar con Eze.
          </p>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Numero
          titulo="Cobrado"
          valor={plata(suma(aprobados), moneda)}
          detalle={`${aprobados.length} pagos aprobados${devueltos.length ? ` · ${plata(suma(devueltos), moneda)} devuelto` : ""}`}
        />
        <Numero
          titulo="Suscripciones activas"
          valor={String(mensualesActivas.length)}
          detalle={`${pagas.length} paga${pagas.length === 1 ? "" : "s"} · ${mensualesActivas.length - pagas.length} piloto`}
        />
        <Numero
          titulo="Cobros fallidos"
          valor={String(fallidos.length)}
          detalle={`${esperando.length} pago${esperando.length === 1 ? "" : "s"} esperando confirmación`}
        />
        <Numero
          titulo="Facturas sin emitir"
          valor={String(sinFactura.length)}
          detalle={`${facturas.filter((f) => f.estado === "emitida").length} emitidas`}
        />
      </div>

      <Seccion titulo={<>Para <Clave>revisar</Clave></>} bajada="Cobros que fallaron y facturas que no salieron. Lo de acá se mira todos los días de la beta.">
        {fallidos.length + sinFactura.length === 0 ? (
          <Vacio texto="Nada para revisar." />
        ) : (
          <ul className="flex flex-col divide-y rounded-[14px] border bg-card">
            {fallidos.map((c) => {
              const sus = c.suscripcion ? susPorId.get(c.suscripcion) : undefined;
              return (
                <li key={`c${c.id}`} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold break-words">{c.mail ?? "Sin mail"}</p>
                    <p className="text-sm text-muted-foreground">
                      {estadoCobro(c.estado).texto} · {plata(c.monto, c.moneda)} · {fecha.format(new Date(c.creado))}
                      {sus?.plan === "mensual" &&
                        (sus.estado === "pausada"
                          ? " · la suscripción quedó pausada"
                          : " · Mercado Pago lo vuelve a intentar")}
                    </p>
                  </div>
                  <Etiqueta tipo="mal">Cobro fallido</Etiqueta>
                </li>
              );
            })}
            {sinFactura.map((c) => {
              const f = facturaDe.get(c.id);
              return (
                <li key={`f${c.id}`} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold break-words">{c.mail ?? "Sin mail"}</p>
                    <p className="text-sm text-muted-foreground">
                      Pago de {plata(c.monto, c.moneda)} del {fecha.format(new Date(c.creado))}
                      {f?.intentos ? ` · ${f.intentos} intentos, el último el ${fecha.format(new Date(f.ultimo_intento ?? c.creado))}` : " · todavía no se intentó"}
                      {f?.error ? ` · «${f.error}»` : ""}
                    </p>
                  </div>
                  <EtiquetaFactura f={f} aprobado />
                </li>
              );
            })}
          </ul>
        )}
      </Seccion>

      <Seccion titulo={<>Cada <Clave>pago</Clave></>} bajada="Del más nuevo al más viejo, tal cual lo avisa Mercado Pago.">
        {ordenados.length === 0 ? (
          <Vacio texto="Todavía no entró ningún pago." />
        ) : (
          <ul className="flex flex-col divide-y rounded-[14px] border bg-card">
            {ordenados.map((c) => {
              const plan = planDe(c);
              const e = estadoCobro(c.estado);
              return (
                <li key={c.id} className="grid gap-x-4 gap-y-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-semibold break-words">{c.mail ?? "Sin mail"}</span>
                      <span className="text-sm text-muted-foreground">{plan ? PLANES[plan] : "Sin plan"}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {fecha.format(new Date(c.creado))} · Mercado Pago {c.proveedor_id}
                      {c.usuario && costoIA[c.usuario] !== undefined && ` · IA de esta cuenta: ${usd(costoIA[c.usuario])}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className="me-1 font-semibold tabular-nums">{plata(c.monto, c.moneda)}</span>
                    <Etiqueta tipo={e.tipo}>{e.texto}</Etiqueta>
                    <EtiquetaFactura f={facturaDe.get(c.id)} aprobado={c.estado === "approved"} />
                    {c.prueba && <Etiqueta tipo="espera">Modo prueba</Etiqueta>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Seccion>

      <Seccion titulo={<><Clave>Suscripciones</Clave> y compras</>} bajada="La marca se paga una vez; Tu marca andando se cobra sola cada mes.">
        <div className="grid gap-4 md:grid-cols-2">
          {ESTADOS_SUSCRIPCION.map(({ estado, titulo, tipo }) => {
            const lista = suscripciones.filter((x) => x.estado === estado);
            return (
              <div key={estado} className="flex flex-col gap-3 rounded-[14px] border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg">{titulo}</h3>
                  <Etiqueta tipo={tipo}>{lista.length}</Etiqueta>
                </div>
                {lista.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ninguna.</p>
                ) : (
                  <ul className="flex flex-col gap-2 text-[0.9375rem]">
                    {lista.map((x) => (
                      <li key={x.id} className="flex flex-col">
                        <span className="break-words font-semibold">{x.mail ?? "Sin mail"}</span>
                        <span className="text-sm text-muted-foreground">
                          {PLANES[x.plan]}
                          {x.proveedor === "piloto" && " · piloto, gratis"}
                          {x.prueba && " · modo prueba"}
                          {x.hasta && ` · hasta el ${dia.format(new Date(x.hasta))}`}
                          {x.nota && ` · ${x.nota}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </Seccion>

      <Seccion
        titulo={<>Cada <Clave>cliente</Clave></>}
        bajada="Lo que pagó (sin lo devuelto) y lo que costó su IA. El cobro es en pesos y la IA se paga en dólares."
      >
        <ul className="flex flex-col divide-y rounded-[14px] border bg-card">
          {clientes.map((c) => (
            <li key={c.usuario} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4">
              <div className="min-w-0">
                <p className="break-words font-semibold">{c.mail}</p>
                <p className="text-sm text-muted-foreground">
                  {c.planes}
                  {c.piloto && " · piloto"}
                  {c.prueba && " · modo prueba"}
                </p>
              </div>
              <p className="text-sm tabular-nums">
                Pagó <strong>{plata(c.pagado, moneda)}</strong> · IA <strong>{usd(c.ia)}</strong>
              </p>
            </li>
          ))}
        </ul>
      </Seccion>
    </main>
  );
}
