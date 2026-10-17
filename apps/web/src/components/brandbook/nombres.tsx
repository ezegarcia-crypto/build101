"use client";

import { Button } from "@build101/ui/components/button";
import { Check, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Armando } from "@/components/entrevista/armando";
import type { Brief } from "@/lib/ia/brief";
import { ESTRATEGIAS, type NombrePropuesto } from "@/lib/ia/nombres";

import s from "../entrevista/entrevista.module.css";

// El nombre de la marca: la IA propone cinco con su trasfondo (POST /api/nombres) y la persona elige uno.
// Si no le gustan, pide otros (con o sin un pedido en palabras): los que ya vio no se repiten y el elegido
// marca la línea que busca. Si el negocio ya tiene nombre, quedarse con ese es la primera opción.

export const CLAVE_NOMBRES = "brandia:nombres";

type Guardado = { ficha: string; nombres: NombrePropuesto[]; vistos: string[]; elegido: string | null };

function leer(ficha: string): Guardado | null {
  try {
    const g = JSON.parse(sessionStorage.getItem(CLAVE_NOMBRES) ?? "null") as Guardado | null;
    return g?.ficha === ficha ? g : null;
  } catch {
    return null;
  }
}

export function Nombres({
  brief,
  ficha,
  onElegir,
}: {
  brief: Brief;
  /** El texto de la ficha: identifica la entrevista, para no mezclar nombres de otra marca */
  ficha: string;
  onElegir: (nombre: string | null) => void;
}) {
  const propio = brief.marca.nombre;
  const [nombres, setNombres] = useState<NombrePropuesto[]>([]);
  const [vistos, setVistos] = useState<string[]>([]);
  const [elegido, setElegido] = useState<string | null>(propio);
  const [pidiendo, setPidiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedido, setPedido] = useState("");
  const avisar = useRef(onElegir);
  avisar.current = onElegir;

  const guardar = useCallback(
    (g: Omit<Guardado, "ficha">) => {
      try {
        sessionStorage.setItem(CLAVE_NOMBRES, JSON.stringify({ ficha, ...g }));
      } catch {}
    },
    [ficha],
  );

  const elegir = useCallback(
    (nombre: string | null, lista = nombres, vistosHasta = vistos) => {
      setElegido(nombre);
      avisar.current(nombre);
      guardar({ nombres: lista, vistos: vistosHasta, elegido: nombre });
    },
    [nombres, vistos, guardar],
  );

  const pedir = useCallback(
    async (opciones: { descartados: string[]; gustan: string[]; pedido?: string; actual: string | null }) => {
      setPidiendo(true);
      setError(null);
      try {
        const res = await fetch("/api/nombres", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ brief, ...opciones }),
        });
        const datos = await res.json().catch(() => ({}));
        if (!res.ok || !Array.isArray(datos.nombres)) throw new Error(datos?.error || "No pudimos pensar nombres.");
        const nuevos = datos.nombres as NombrePropuesto[];
        // El elegido de antes queda a la vista, primero, para poder volver a él
        const anterior = nombres.find((n) => n.nombre === opciones.actual);
        const lista = anterior ? [anterior, ...nuevos.filter((n) => n.nombre !== anterior.nombre)] : nuevos;
        const todosVistos = [...new Set([...vistos, ...nuevos.map((n) => n.nombre)])];
        // Sin nombre propio, arranca elegido el primero para que los caminos ya lo muestren
        const siguiente = opciones.actual ?? (propio ? null : (lista[0]?.nombre ?? null));
        setNombres(lista);
        setVistos(todosVistos);
        setElegido(siguiente);
        avisar.current(siguiente);
        guardar({ nombres: lista, vistos: todosVistos, elegido: siguiente });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setPidiendo(false);
      }
    },
    [brief, nombres, vistos, propio, guardar],
  );

  // Al llegar: lo guardado de esta ficha o la primera vuelta
  const arranco = useRef(false);
  useEffect(() => {
    if (arranco.current) return;
    arranco.current = true;
    const g = leer(ficha);
    if (g) {
      setNombres(g.nombres);
      setVistos(g.vistos);
      setElegido(g.elegido);
      avisar.current(g.elegido);
      return;
    }
    avisar.current(propio);
    pedir({ descartados: [], gustan: [], actual: propio });
  }, [ficha, propio, pedir]);

  function otros(e: React.FormEvent) {
    e.preventDefault();
    if (pidiendo) return;
    const gustan = elegido && elegido !== propio ? [elegido] : [];
    pedir({
      descartados: vistos.filter((n) => n !== elegido),
      gustan,
      pedido: pedido.trim() || undefined,
      actual: elegido,
    });
    setPedido("");
  }

  const opciones: (NombrePropuesto | { propio: string })[] = propio ? [{ propio }, ...nombres] : nombres;

  return (
    <section className={`${s.entra} mt-10`} aria-labelledby="titulo-nombres">
      <h2 id="titulo-nombres" className="display max-w-[18ch] text-[clamp(2rem,1.4rem+2vw,3rem)]">
        Un nombre con <span className={s.it}>historia</span>.
      </h2>
      <p className="lead mt-3 max-w-[40em] text-base">
        {propio
          ? `Podés quedarte con ${propio} o explorar otros. Cada propuesta te cuenta de dónde sale y qué dice de tu negocio.`
          : "Cada propuesta te cuenta de dónde sale y qué dice de tu negocio. Elegí la que más te represente."}
      </p>

      {nombres.length === 0 && pidiendo && (
        <div className="mt-6">
          <Armando que="nombres" />
        </div>
      )}

      {opciones.length > 0 && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {opciones.map((o, i) => {
            const nombre = "propio" in o ? o.propio : o.nombre;
            const activo = elegido === nombre;
            return (
              <li key={nombre} className={s.entra} style={{ animationDelay: `${i * 80}ms` }}>
                <button
                  type="button"
                  aria-pressed={activo}
                  onClick={() => elegir(nombre)}
                  className={`flex h-full w-full flex-col gap-2 rounded-lg border bg-card p-5 text-left transition-[transform,box-shadow] duration-300 ease-brandia outline-none hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring ${activo ? "border-foreground ring-1 ring-foreground" : ""}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="label">{"propio" in o ? "Tu nombre de hoy" : ESTRATEGIAS[o.estrategia]}</span>
                    {activo && (
                      <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">Elegido</span>
                      </span>
                    )}
                  </span>
                  <span className="font-display text-[1.75rem] leading-[1.05]">{nombre}</span>
                  {"propio" in o ? (
                    <span className="text-[15px] text-muted-foreground">Seguir con el nombre que ya conocen tus clientes.</span>
                  ) : (
                    <>
                      <span className="text-[15px]">{o.de_donde_sale}</span>
                      <span className="text-[15px] text-muted-foreground">{o.historia}</span>
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error} Probá de nuevo.
        </p>
      )}

      <form onSubmit={otros} className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="pedido-nombres" className="sr-only">
          Qué buscás en el nombre
        </label>
        <input
          id="pedido-nombres"
          value={pedido}
          onChange={(e) => setPedido(e.target.value)}
          maxLength={300}
          placeholder="¿Qué buscás? Por ejemplo: más corto, que suene a barrio"
          className="h-11 w-full min-w-0 rounded-full border border-input bg-card px-5 text-[15px] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 sm:max-w-md"
        />
        <Button type="submit" variant="outline" size="lg" disabled={pidiendo} className="self-start sm:self-auto">
          <RefreshCw data-icon="inline-start" className={pidiendo ? "animate-spin" : ""} />
          {pidiendo && nombres.length ? "Pensando…" : "Otros nombres"}
        </Button>
      </form>
      {pidiendo && nombres.length > 0 && (
        <div className="mt-3">
          <Armando que="nombres" />
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Antes de usarlo, chequeá que esté libre: Instagram, dominio web y registro de marca.
      </p>
    </section>
  );
}
