import type { Metadata } from "next";

import { ESTADOS, hayBaseDeDatos, listarPedidos, numeroDe, type Pedido } from "@/lib/pedidos";

import { moverPedido } from "./acciones";

// Panel interno del equipo: los pedidos de BranderIA que llegan desde /crear/branderia. Pide la misma contraseña
// que /costos (ver proxy.ts). Acá se ve qué pidió cada uno, a dónde mandarlo y se cambia su estado.

export const metadata: Metadata = {
  title: "Pedidos de BranderIA · BrandIA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const fecha = new Intl.DateTimeFormat("es-UY", {
  weekday: "short",
  day: "numeric",
  month: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Montevideo",
});

function Clave({ children }: { children: React.ReactNode }) {
  return <span className="font-normal italic [font-variation-settings:'opsz'_144,'SOFT'_100,'WONK'_1]">{children}</span>;
}

/** El link para escribirle por WhatsApp, si dejó un número. */
function whatsapp(contacto: string) {
  const numero = contacto.replace(/\D/g, "");
  if (contacto.includes("@") || numero.length < 8) return null;
  // Un celular uruguayo sin código de país (09…) pasa a 5989…
  return `https://wa.me/${numero.startsWith("0") ? `598${numero.slice(1)}` : numero}`;
}

function TarjetaPedido({ p }: { p: Pedido }) {
  const wa = whatsapp(p.contacto);
  return (
    <li className="flex flex-col gap-4 rounded-[14px] border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-xl">
          {numeroDe(p.id)} · {p.marca}
        </h2>
        <p className="text-sm text-muted-foreground">{fecha.format(new Date(p.creado))}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <dl className="flex flex-col gap-1.5 text-[0.9375rem]">
          <div>
            <dt className="label">Quién</dt>
            <dd>{p.nombre}</dd>
          </div>
          <div>
            <dt className="label">Contacto</dt>
            <dd>
              {wa ? (
                <a href={wa} target="_blank" rel="noreferrer">
                  {p.contacto}
                </a>
              ) : p.contacto.includes("@") ? (
                <a href={`mailto:${p.contacto}`}>{p.contacto}</a>
              ) : (
                p.contacto
              )}
            </dd>
          </div>
          <div>
            <dt className="label">Entrega</dt>
            <dd>{p.entrega}</dd>
          </div>
          {p.nota && (
            <div>
              <dt className="label">Nota</dt>
              <dd className="text-muted-foreground">{p.nota}</dd>
            </div>
          )}
          {p.colores.length > 0 && (
            <div>
              <dt className="label">Colores de la marca</dt>
              <dd className="mt-1 flex gap-1.5">
                {p.colores.map((c) => (
                  <span key={c} title={c} className="size-6 rounded-[4px] border" style={{ background: c }} />
                ))}
              </dd>
            </div>
          )}
        </dl>

        <div className="flex flex-col gap-2">
          <p className="label">
            Kit · {p.unidades} unidades
          </p>
          <ul className="flex flex-col divide-y rounded-[4px] border text-[0.9375rem]">
            {p.items.map((i, n) => (
              <li key={n} className="flex items-start justify-between gap-3 px-3 py-2">
                <span className="min-w-0">
                  <span className="font-semibold">{i.nombre}</span>
                  {(i.tecnica || i.estampa) && (
                    <span className="block text-xs text-muted-foreground">
                      {[i.tecnica, i.estampa && `lleva ${i.estampa.replace("-", " y ")}`].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </span>
                <span className="shrink-0 tabular-nums">{i.cantidad} u.</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <form action={moverPedido} className="flex flex-wrap items-center gap-2 border-t pt-4">
        <input type="hidden" name="id" value={p.id} />
        <label htmlFor={`estado-${p.id}`} className="text-sm text-muted-foreground">
          Estado
        </label>
        <select
          id={`estado-${p.id}`}
          name="estado"
          defaultValue={p.estado}
          className="h-9 rounded-[4px] border bg-background px-2 text-[0.9375rem]"
        >
          {Object.entries(ESTADOS).map(([valor, texto]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </select>
        <button type="submit" className="h-9 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Guardar
        </button>
      </form>
    </li>
  );
}

export default async function Pedidos() {
  let pedidos: Pedido[] = [];
  let error: string | null = hayBaseDeDatos() ? null : "Falta conectar la base de datos.";
  if (!error) {
    try {
      pedidos = await listarPedidos();
    } catch (e) {
      console.error("[pedidos]", e);
      error = "No se pudieron leer los pedidos. ¿Ya se creó la tabla pedidos_branderia en Supabase?";
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1080px] px-4 py-12 sm:py-16">
      <header className="flex flex-col gap-4">
        <p className="label">BranderIA · solo para el equipo</p>
        <h1 className="display max-w-3xl text-balance">
          Los <Clave>pedidos.</Clave>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Cada kit que alguien pidió desde BranderIA. Todavía no se cobra nada: escribile, pasale la cotización y
          cambiá el estado a medida que avanza.
        </p>
      </header>

      {error ? (
        <p role="alert" className="mt-10 rounded-[14px] border p-5 text-destructive">
          {error}
        </p>
      ) : pedidos.length ? (
        <ul className="mt-10 flex flex-col gap-4">
          {pedidos.map((p) => (
            <TarjetaPedido key={p.id} p={p} />
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-[14px] border border-dashed p-5 text-muted-foreground">Todavía no llegó ningún pedido.</p>
      )}
    </main>
  );
}
