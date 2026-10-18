import type { Metadata } from "next";

import { hayDondeGuardar, listarClientes } from "@/lib/pruebas";

import { nombreDelPaso } from "./pasos";

// Panel interno del equipo: cada persona que probó la app y todo lo que la IA le generó (lib/pruebas.ts).
// Con la misma contraseña que /costos. No tiene links desde la app y los buscadores no lo indexan.

export const metadata: Metadata = {
  title: "Pruebas · BrandIA",
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

const ORIGEN: Record<string, string> = { production: "app.brandiamos.com", preview: "link de una rama", compu: "en la compu" };

async function leer() {
  if (!hayDondeGuardar()) return { error: "Falta conectar la base de datos (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY)." };
  try {
    return { clientes: await listarClientes() };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export default async function Pruebas() {
  const r = await leer();

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-[1080px] flex-col gap-10 px-4 py-12 sm:py-16">
      <header className="flex flex-col gap-4">
        <p className="label">BrandIA · solo para el equipo</p>
        <h1 className="display max-w-3xl text-balance">
          Todo lo que <span className="font-normal italic">generamos.</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Cada pestaña que probó la app es un cliente. Adentro está todo lo que se le pidió a la IA y lo que
          devolvió, en orden, incluso lo que después se descartó. <a href="/pruebas">Actualizar</a>
        </p>
      </header>

      {"error" in r ? (
        <p className="rounded-lg border bg-card px-5 py-4 text-[0.9375rem]">
          No se pudieron leer las pruebas: {r.error}
        </p>
      ) : r.clientes.length === 0 ? (
        <p className="rounded-lg border bg-card px-5 py-4 text-[0.9375rem]">Todavía no hay pruebas guardadas.</p>
      ) : (
        <section className="flex flex-col gap-3">
          <p className="lead">
            {r.clientes.length} {r.clientes.length === 1 ? "cliente" : "clientes"}, del más nuevo al más viejo
          </p>
          <ul className="flex flex-col gap-3">
            {r.clientes.map((c) => (
              <li key={c.cliente}>
                <a
                  href={`/pruebas/${c.cliente}`}
                  className="flex flex-col gap-2 rounded-lg border bg-card p-5 no-underline transition-colors hover:border-foreground/40"
                >
                  <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="font-display text-2xl">{c.marca ?? "Sin marca todavía"}</span>
                    <span className="lead">{fecha.format(new Date(c.hasta))}</span>
                  </span>
                  <span className="text-[0.9375rem] text-muted-foreground">
                    {[c.rubro, `${c.pedidos} ${c.pedidos === 1 ? "pedido" : "pedidos"} a la IA`, ORIGEN[c.origen] ?? c.origen]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  <span className="text-[0.875rem] text-muted-foreground">
                    {c.pasos.toReversed().map(nombreDelPaso).join(" → ")}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
