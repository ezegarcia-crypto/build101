import { cn } from "@build101/ui/lib/utils";
import Link from "next/link";

// Piezas compartidas de las pantallas "en construcción".
// Regla: nada de lo que se ve acá lo generó la IA. Los textos de muestra van marcados como ejemplo
// y las piezas del cliente se dibujan en gris (sin marca), porque su marca la pone la IA cuando funcione.

/** El cartel "en construcción". Es el único punto naranja de cada pantalla (texto grafito sobre naranja). */
export function EnConstruccion({ texto = "En construcción" }: { texto?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1.5 text-[0.8125rem] font-semibold text-secondary-foreground">
      <span aria-hidden className="size-1.5 rounded-full bg-grafito" />
      {texto}
    </span>
  );
}

/** Etiqueta para todo texto o pieza de muestra. */
export function Ejemplo({ texto = "Ejemplo, no lo generó la IA", className }: { texto?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-dashed border-foreground/30 px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase",
        className,
      )}
    >
      {texto}
    </span>
  );
}

/** La palabra clave en Fraunces itálica, como "lo que *hacés*" en la web original. */
export function Clave({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-normal italic [font-variation-settings:'opsz'_144,'SOFT'_100,'WONK'_1]">{children}</span>
  );
}

export function Volver() {
  return (
    <Link
      href="/crear/proximamente"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground no-underline transition-colors duration-300 ease-brandia hover:text-foreground"
    >
      <span aria-hidden>←</span> Lo que viene
    </Link>
  );
}

/** Encabezado de cada pantalla: módulo, título con la palabra clave en itálica, bajada y el cartel. */
export function Encabezado({
  modulo,
  titulo,
  clave,
  bajada,
  cartel,
}: {
  modulo: string;
  titulo: string;
  clave: string;
  bajada: string;
  cartel?: string;
}) {
  return (
    <header className="flex flex-col gap-5">
      <div data-entra className="flex flex-wrap items-center justify-between gap-3">
        <Volver />
        <EnConstruccion texto={cartel} />
      </div>
      <p data-entra className="label">
        {modulo}
      </p>
      <h1 data-entra className="display max-w-3xl text-balance">
        {titulo} <Clave>{clave}</Clave>
      </h1>
      <p data-entra className="max-w-2xl text-lg text-muted-foreground">
        {bajada}
      </p>
    </header>
  );
}

export type Paso = { titulo: string; texto: string };

/** "Cómo va a funcionar", en pasos numerados. */
export function Pasos({ pasos, titulo = "Cómo va a funcionar" }: { pasos: Paso[]; titulo?: string }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 data-entra>{titulo}</h2>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {pasos.map((p, i) => (
          <li
            data-entra
            key={p.titulo}
            className="flex flex-col gap-2 rounded-lg border bg-card p-5 transition-transform duration-500 ease-brandia hover:-translate-y-1"
          >
            <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {i + 1}
            </span>
            <h3 className="mt-1">{p.titulo}</h3>
            <p className="text-[0.9375rem] text-muted-foreground">{p.texto}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Lienzo de una pieza del cliente: gris, sin marca, porque la marca la pone la IA. */
export function Lienzo({
  children,
  className,
  nota = "Acá va tu marca cuando funcione",
}: {
  children: React.ReactNode;
  className?: string;
  nota?: string;
}) {
  return (
    <div data-entra className={cn("flex flex-col gap-3 rounded-[22px] bg-cemento/60 p-3 sm:p-5 dark:bg-muted", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <Ejemplo texto="Vista de cómo se va a ver" />
        <span className="text-xs text-piedra dark:text-muted-foreground">{nota}</span>
      </div>
      {children}
    </div>
  );
}

/** Renglón gris en lugar de texto que todavía no existe. */
export function Renglon({ ancho = "100%", alto = "0.625rem", className }: { ancho?: string; alto?: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block rounded-sm bg-foreground/10", className)}
      style={{ width: ancho, height: alto }}
    />
  );
}

/** Lugar para el logo del cliente, sin inventarlo. */
export function LugarLogo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-foreground/30 text-[0.625rem] font-semibold text-muted-foreground",
        className,
      )}
    >
      logo
    </span>
  );
}

/** Lo técnico, sin IA, contado simple. */
export function DetrasDeEscena({ children }: { children: React.ReactNode }) {
  return (
    <aside data-entra className="rounded-lg border border-dashed p-5 text-[0.9375rem] text-muted-foreground">
      <p className="label mb-2">Detrás de escena</p>
      {children}
    </aside>
  );
}
