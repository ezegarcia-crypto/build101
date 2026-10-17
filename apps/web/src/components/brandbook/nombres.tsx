"use client";

import { Button } from "@build101/ui/components/button";
import { Check, Plus, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Armando } from "@/components/entrevista/armando";
import { MENSAJE_FRENO, puedoArrancarSolo } from "@/lib/freno";
import type { Brief } from "@/lib/ia/brief";
import { ESTRATEGIAS, type NombrePropuesto } from "@/lib/ia/nombres";

import s from "../entrevista/entrevista.module.css";

// El nombre de la marca: la IA propone cinco con su trasfondo (POST /api/nombres) y la persona elige uno.
// Si no le gustan, pide otros (con o sin un pedido en palabras): se suman a los anteriores (nada se borra),
// no se repiten y el elegido marca la línea que busca. También puede escribir el suyo después de leer las propuestas, y pedir variantes
// del que eligió (suyo o de la IA). Si el negocio ya tiene nombre, quedarse con ese es la primera opción.

export const CLAVE_NOMBRES = "brandia:nombres";

type Guardado = {
  ficha: string;
  nombres: NombrePropuesto[];
  vistos: string[];
  elegido: string | null;
  /** Los que escribió la persona */
  propios?: string[];
};

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
  const [propios, setPropios] = useState<string[]>([]);
  const [suyo, setSuyo] = useState("");
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
    (nombre: string | null, suyos = propios) => {
      setElegido(nombre);
      avisar.current(nombre);
      guardar({ nombres, vistos, elegido: nombre, propios: suyos });
    },
    [nombres, vistos, propios, guardar],
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
        // Cada vuelta suma opciones: las nuevas arriba y las de antes siguen a la vista para poder volver
        const lista = [...nuevos, ...nombres.filter((n) => !nuevos.some((x) => x.nombre === n.nombre))];
        const todosVistos = [...new Set([...vistos, ...nuevos.map((n) => n.nombre)])];
        // Sin nombre propio, arranca elegido el primero para que los caminos ya lo muestren
        const siguiente = opciones.actual ?? (propio ? null : (lista[0]?.nombre ?? null));
        setNombres(lista);
        setVistos(todosVistos);
        setElegido(siguiente);
        avisar.current(siguiente);
        guardar({ nombres: lista, vistos: todosVistos, elegido: siguiente, propios });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setPidiendo(false);
      }
    },
    [brief, nombres, vistos, propio, propios, guardar],
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
      setPropios(g.propios ?? []);
      avisar.current(g.elegido);
      return;
    }
    avisar.current(propio);
    if (!puedoArrancarSolo("nombres")) return setError(MENSAJE_FRENO); // "Otros nombres" los pide a mano
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

  /** El nombre que escribió la persona: se suma a las opciones y queda elegido */
  function usarSuyo(e: React.FormEvent) {
    e.preventDefault();
    const nombre = suyo.trim().replace(/\s+/g, " ");
    if (!nombre) return;
    const suyos = propios.includes(nombre) ? propios : [...propios, nombre];
    setPropios(suyos);
    setSuyo("");
    elegir(nombre, suyos);
  }

  /** Otra vuelta en la línea del elegido: variantes que conservan su idea */
  function variantes() {
    if (pidiendo || !elegido) return;
    pedir({
      descartados: vistos.filter((n) => n !== elegido),
      gustan: [elegido],
      pedido: `Variantes de «${elegido}»: conservá su idea y su sonido, y probá otras palabras, combinaciones o grafías.${pedido.trim() ? ` Además: ${pedido.trim()}` : ""}`,
      actual: elegido,
    });
    setPedido("");
  }

  const opciones: (NombrePropuesto | { propio: string; suyo?: boolean })[] = [
    ...(propio ? [{ propio }] : []),
    ...propios.filter((n) => n !== propio).map((n) => ({ propio: n, suyo: true })),
    ...nombres,
  ];

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
                    <span className="label">
                      {"propio" in o ? (o.suyo ? "Tu idea" : "Tu nombre de hoy") : ESTRATEGIAS[o.estrategia]}
                    </span>
                    {activo && (
                      <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">Elegido</span>
                      </span>
                    )}
                  </span>
                  <span className="font-display text-[1.75rem] leading-[1.05]">{nombre}</span>
                  {"propio" in o ? (
                    <span className="text-[15px] text-muted-foreground">
                      {o.suyo
                        ? "El nombre que propusiste vos. Pedí variantes para explorar alrededor de esta idea."
                        : "Seguir con el nombre que ya conocen tus clientes."}
                    </span>
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
      {elegido && !pidiendo && (
        <Button variant="ghost" size="sm" onClick={variantes} className="mt-2 text-foreground">
          <Sparkles data-icon="inline-start" />
          Variantes de «{elegido}»
        </Button>
      )}

      <form onSubmit={usarSuyo} className="mt-6 flex flex-col gap-2 border-t pt-5 sm:flex-row sm:items-center">
        <label htmlFor="nombre-propio" className="text-sm font-semibold sm:mr-2 sm:whitespace-nowrap">
          ¿Se te ocurrió otro?
        </label>
        <input
          id="nombre-propio"
          value={suyo}
          onChange={(e) => setSuyo(e.target.value)}
          maxLength={40}
          placeholder="Escribí tu nombre"
          className="h-11 w-full min-w-0 rounded-full border border-input bg-card px-5 text-[15px] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 sm:max-w-xs"
        />
        <Button type="submit" variant="outline" size="lg" disabled={!suyo.trim()} className="self-start sm:self-auto">
          <Plus data-icon="inline-start" />
          Usar este nombre
        </Button>
      </form>
      <p className="mt-3 text-xs text-muted-foreground">
        Antes de usarlo, chequeá que esté libre: Instagram, dominio web y registro de marca.
      </p>
    </section>
  );
}
