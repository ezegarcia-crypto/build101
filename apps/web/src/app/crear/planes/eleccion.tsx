"use client";

import { Button, buttonVariants } from "@build101/ui/components/button";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CLAVE_IDENTIDAD } from "@/components/brandbook/identidad";
import type { Plan } from "@/lib/planes";

// Las tarjetas de los planes y el formulario para anotarse. El formulario guarda de verdad (POST /api/planes),
// pero no cobra: el equipo contacta a la persona.

const campo =
  "h-11 w-full rounded-[4px] border bg-background px-3 text-[0.9375rem] text-foreground outline-none transition-shadow duration-300 ease-brandia focus-visible:ring-2 focus-visible:ring-ring/50";

/** El nombre de la marca que armó en esta pestaña, si ya llegó al brandbook. */
function marcaDeLaPestana() {
  try {
    const guardada = JSON.parse(sessionStorage.getItem(CLAVE_IDENTIDAD) ?? "null");
    return typeof guardada?.nombre === "string" ? guardada.nombre.slice(0, 80) : "";
  } catch {
    return "";
  }
}

export function Eleccion({ planes }: { planes: Plan[] }) {
  const [elegido, setElegido] = useState<Plan["id"]>("mensual");
  const [marca, setMarca] = useState("");
  const [estado, setEstado] = useState<"listo" | "enviando" | "anotado">("listo");
  const [error, setError] = useState("");
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => setMarca(marcaDeLaPestana()), []);

  function elegir(id: Plan["id"]) {
    setElegido(id);
    setEstado("listo");
    formulario.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Que el foco quede en el primer campo, así se escribe sin buscarlo
    window.setTimeout(() => formulario.current?.querySelector<HTMLInputElement>("input[name=nombre]")?.focus(), 400);
  }

  async function anotar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.currentTarget));
    setEstado("enviando");
    setError("");
    try {
      const r = await fetch("/api/planes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...datos, plan: elegido }),
      });
      const respuesta = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(respuesta.error ?? "No pudimos anotarte. Probá de nuevo en un rato.");
      setEstado("anotado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos anotarte. Probá de nuevo en un rato.");
      setEstado("listo");
    }
  }

  const plan = planes.find((p) => p.id === elegido) ?? planes[0];

  return (
    <div className="flex flex-col gap-14">
      <ul className="grid gap-3 lg:grid-cols-3">
        {planes.map((p) => (
          <li
            data-entra
            key={p.id}
            className={`flex flex-col gap-5 rounded-[14px] border p-6 transition-transform duration-500 ease-brandia hover:-translate-y-1 ${
              p.destacado ? "border-transparent bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            <div className="flex flex-col gap-2">
              {/* En compu las tres tarjetas quedan alineadas: las que no son la recomendada guardan el lugar */}
              {p.destacado ? (
                <span className="self-start rounded-full border border-current/30 px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase">
                  Recomendado
                </span>
              ) : (
                <span aria-hidden className="hidden h-[1.375rem] lg:block" />
              )}
              <h2 className="text-2xl">{p.nombre}</h2>
              <p className={p.destacado ? "text-primary-foreground/75" : "text-muted-foreground"}>{p.resumen}</p>
            </div>

            <p className="flex items-baseline gap-2">
              <span className="font-display text-4xl">{p.precio}</span>
              <span className={`text-sm ${p.destacado ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                {p.periodo}
              </span>
            </p>

            <ul className="flex flex-1 flex-col gap-2.5 text-[0.9375rem]">
              {p.incluye.map((i) => (
                <li key={i} className="flex gap-2.5">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0" />
                  {i}
                </li>
              ))}
              {p.pronto && (
                <li className={`mt-2 flex flex-col gap-1.5 ${p.destacado ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                  <Link href="/crear/proximamente" className="label text-current no-underline hover:underline">
                    Pronto, en lo que viene →
                  </Link>
                  {p.pronto.map((i) => (
                    <span key={i}>{i}</span>
                  ))}
                </li>
              )}
            </ul>

            <Button
              size="lg"
              variant={p.destacado ? "outline" : "default"}
              className={p.destacado ? "border-transparent bg-primary-foreground text-primary hover:bg-primary-foreground/90" : ""}
              onClick={() => elegir(p.id)}
            >
              Quiero este plan <ArrowRight data-icon="inline-end" />
            </Button>
          </li>
        ))}
      </ul>

      <p data-entra className="-mt-10 text-sm text-muted-foreground">
        Precios de lanzamiento, en dólares. Todavía se pueden ajustar antes de empezar a cobrar.
      </p>

      <section data-entra className="flex scroll-mt-24 flex-col gap-5 rounded-[14px] border bg-card p-6 sm:p-8">
        {estado === "anotado" ? (
          <div className="flex flex-col items-start gap-4" role="status">
            <h2>
              Listo, <span className="italic">te anotamos.</span>
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Elegiste «{plan.nombre}». Te escribimos apenas se pueda pagar desde la app. Mientras tanto, seguí armando tu
              marca.
            </p>
            <Link href="/crear" className={buttonVariants({ size: "lg" })}>
              Seguir con mi marca <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
        ) : (
          <form ref={formulario} onSubmit={anotar} className="flex scroll-mt-24 flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h2>Anotate para tu plan</h2>
              <p className="text-muted-foreground">Todavía no se cobra nada. Te contactamos para empezar.</p>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="label mb-2">Tu plan</legend>
              <div className="flex flex-wrap gap-2">
                {planes.map((p) => (
                  <label
                    key={p.id}
                    className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-300 ease-brandia has-focus-visible:ring-2 has-focus-visible:ring-ring/50 ${
                      p.id === elegido ? "border-foreground bg-foreground text-background" : "hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="eleccion"
                      value={p.id}
                      checked={p.id === elegido}
                      onChange={() => setElegido(p.id)}
                      className="sr-only"
                    />
                    {p.nombre} · {p.precio}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                Tu nombre
                <input name="nombre" required maxLength={80} autoComplete="name" className={campo} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                Tu mail o WhatsApp
                <input name="contacto" required maxLength={120} autoComplete="email" className={campo} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">
                <span>
                  El nombre de tu marca <span className="font-normal text-muted-foreground">(si ya la tenés)</span>
                </span>
                <input
                  name="marca"
                  maxLength={80}
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className={campo}
                />
              </label>
              {/* Para robots: una persona no lo ve ni lo completa */}
              <input name="sitio" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
            </div>

            {error && (
              <p role="alert" className="text-sm font-semibold text-destructive">
                {error}
              </p>
            )}

            <div>
              <Button type="submit" size="lg" disabled={estado === "enviando"}>
                {estado === "enviando" ? "Anotando…" : "Anotarme"} <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
