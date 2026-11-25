import type { Metadata } from "next";

import { DIAS_PILOTO, hayBaseDeDatos, listarPilotos, type Piloto } from "@/lib/pilotos";

import { terminar } from "./acciones";
import { Formulario } from "./formulario";

// Panel interno del equipo: las cuentas piloto, gratis, para la gente que invitamos a probar BrandIA. Pide la misma
// contraseña que /costos (ver proxy.ts). Acá se da una cuenta con un correo y una cantidad de días, se ve hasta
// cuándo es gratis cada una y se la puede terminar antes. Cómo funciona por dentro: lib/pilotos.ts.

export const metadata: Metadata = {
  title: "Cuentas piloto · BrandIA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const fecha = new Intl.DateTimeFormat("es-UY", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Montevideo",
});

function Clave({ children }: { children: React.ReactNode }) {
  return <span className="font-normal italic [font-variation-settings:'opsz'_144,'SOFT'_100,'WONK'_1]">{children}</span>;
}

function vigente(p: Piloto, ahora: number) {
  return p.estado === "activa" && p.hasta !== null && new Date(p.hasta).getTime() > ahora;
}

function FilaPiloto({ p, ahora }: { p: Piloto; ahora: number }) {
  const activa = vigente(p, ahora);
  const dias = p.hasta ? Math.ceil((new Date(p.hasta).getTime() - ahora) / 86_400_000) : 0;
  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="break-all font-semibold">{p.mail ?? "Cuenta sin correo"}</p>
        <p className="text-sm text-muted-foreground">
          {activa
            ? `Gratis hasta el ${fecha.format(new Date(p.hasta as string))} (${dias === 1 ? "queda 1 día" : `quedan ${dias} días`})`
            : p.estado === "cancelada"
              ? `Terminada el ${fecha.format(new Date(p.hasta ?? p.creado))}`
              : `Venció el ${fecha.format(new Date(p.hasta ?? p.creado))}`}
          {" · desde el "}
          {fecha.format(new Date(p.creado))}
        </p>
        {p.nota && <p className="text-sm text-muted-foreground">{p.nota}</p>}
      </div>
      {activa && (
        <form action={terminar} className="shrink-0">
          <input type="hidden" name="id" value={p.id} />
          <button
            type="submit"
            className="h-9 rounded-full border px-4 text-sm font-semibold hover:bg-muted"
            aria-label={`Terminar la cuenta piloto de ${p.mail ?? "esta persona"}`}
          >
            Terminar hoy
          </button>
        </form>
      )}
    </li>
  );
}

export default async function Pilotos() {
  let pilotos: Piloto[] = [];
  let error: string | null = hayBaseDeDatos() ? null : "Falta conectar la base de datos.";
  if (!error) {
    try {
      pilotos = await listarPilotos();
    } catch (e) {
      console.error("[pilotos]", e);
      error = "No se pudieron leer las cuentas piloto. ¿Ya se corrió cuentas.sql en Supabase?";
    }
  }
  const ahora = Date.now();
  const activas = pilotos.filter((p) => vigente(p, ahora)).length;

  return (
    <main className="mx-auto w-full max-w-[1080px] px-4 py-12 sm:py-16">
      <header className="flex flex-col gap-4">
        <p className="label">Piloto · solo para el equipo</p>
        <h1 className="display max-w-3xl text-balance">
          Las cuentas <Clave>piloto.</Clave>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          BrandIA completo y gratis por un tiempo, para la gente que invitamos a probarlo. Poné su correo y avisale
          que entre en <span className="font-semibold text-foreground">app.brandiamos.com/ingresar</span> con ese
          mismo correo: le llega un código y listo.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-10">
        <Formulario diasPorDefecto={DIAS_PILOTO} />

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl">
            {activas === 1 ? "1 cuenta piloto activa" : `${activas} cuentas piloto activas`}
          </h2>
          {error ? (
            <p role="alert" className="rounded-[14px] border p-5 text-destructive">
              {error}
            </p>
          ) : pilotos.length ? (
            <ul className="flex flex-col divide-y rounded-[14px] border bg-card">
              {pilotos.map((p) => (
                <FilaPiloto key={p.id} p={p} ahora={ahora} />
              ))}
            </ul>
          ) : (
            <p className="rounded-[14px] border border-dashed p-5 text-muted-foreground">
              Todavía no hay cuentas piloto.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
