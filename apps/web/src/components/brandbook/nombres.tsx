"use client";

import { Button } from "@build101/ui/components/button";
import { Check, Plus, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Armando } from "@/components/entrevista/armando";
import { alternar, MeGusta } from "@/components/me-gusta";
import { MENSAJE_FRENO, puedoArrancarSolo } from "@/lib/freno";
import type { Brief } from "@/lib/ia/brief";
import { type Estrategia, ESTRATEGIAS, type NombrePropuesto } from "@/lib/ia/nombres";

import s from "../entrevista/entrevista.module.css";

// El nombre de la marca: la IA propone cinco con su trasfondo (POST /api/nombres) y la persona elige uno.
// Si no le gustan, pide otros (con o sin un pedido en palabras): se suman a los anteriores (nada se borra),
// no se repiten y el elegido marca la línea que busca. También puede escribir el suyo después de leer las propuestas, y pedir variantes
// del que eligió (suyo o de la IA). Si el negocio ya tiene nombre, quedarse con ese es la primera opción.
// La guía de la persona ("que use mi apellido", "que suene en inglés") queda fija y va en todas las vueltas;
// el estilo pide una vuelta de un solo tipo (por ejemplo, todas siglas).

/** Los estilos que se pueden pedir para una vuelta, en el orden de los botones */
const ESTILOS: { id: Estrategia; texto: string }[] = [
  { id: "sigla", texto: "Por sigla" },
  { id: "combinacion", texto: "Con tu nombre" },
  { id: "significado", texto: "Por su significado" },
  { id: "rubro", texto: "Del rubro" },
  { id: "evocativo", texto: "Que evoque algo" },
  { id: "inventado", texto: "Palabra nueva" },
];

export const CLAVE_NOMBRES = "brandia:nombres";

type Guardado = {
  ficha: string;
  nombres: NombrePropuesto[];
  vistos: string[];
  elegido: string | null;
  /** Los que escribió la persona */
  propios?: string[];
  /** Los marcados con ♥: guían la próxima vuelta y no se descartan */
  gustan?: string[];
  /** La guía que escribió la persona: va en todas las vueltas */
  guia?: string;
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
  const [guia, setGuia] = useState("");
  const [estilo, setEstilo] = useState<Estrategia | null>(null);
  const [propios, setPropios] = useState<string[]>([]);
  const [suyo, setSuyo] = useState("");
  const [gustan, setGustan] = useState<string[]>([]);
  // Lo mismo, para guardar siempre lo último aunque se toquen varios ♥ seguidos
  const gustanRef = useRef<string[]>([]);
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
      guardar({ nombres, vistos, elegido: nombre, propios: suyos, gustan, guia });
    },
    [nombres, vistos, propios, gustan, guia, guardar],
  );

  const pedir = useCallback(
    async (opciones: {
      descartados: string[];
      gustan: string[];
      pedido?: string;
      guia?: string;
      estilo?: Estrategia;
      actual: string | null;
    }) => {
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
        guardar({ nombres: lista, vistos: todosVistos, elegido: siguiente, propios, gustan, guia: opciones.guia });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setPidiendo(false);
      }
    },
    [brief, nombres, vistos, propio, propios, gustan, guardar],
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
      setGuia(g.guia ?? "");
      gustanRef.current = g.gustan ?? [];
      setGustan(gustanRef.current);
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
    // Los marcados con ♥ (y el elegido) muestran la línea; el resto de lo que vio no se repite
    const enLinea = [...new Set([...gustan, ...(elegido && elegido !== propio ? [elegido] : [])])];
    pedir({
      descartados: vistos.filter((n) => !enLinea.includes(n) && n !== elegido),
      gustan: enLinea,
      guia: guia.trim() || undefined,
      estilo: estilo ?? undefined,
      actual: elegido,
    });
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
      descartados: vistos.filter((n) => n !== elegido && !gustan.includes(n)),
      gustan: [elegido],
      pedido: `Variantes de «${elegido}»: conservá su idea y su sonido, y probá otras palabras, combinaciones o grafías.`,
      guia: guia.trim() || undefined,
      actual: elegido,
    });
  }

  function meGusta(nombre: string) {
    gustanRef.current = alternar(gustanRef.current, nombre);
    setGustan(gustanRef.current);
    guardar({ nombres, vistos, elegido, propios, gustan: gustanRef.current, guia });
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
          : "Cada propuesta te cuenta de dónde sale y qué dice de tu negocio. Elegí la que más te represente."}{" "}
        Marcá con ♥ los que te gustan: los nuevos van por ahí y los de antes no se borran.
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
              <li key={nombre} className={`${s.entra} relative`} style={{ animationDelay: `${(i % 6) * 80}ms` }}>
                <button
                  type="button"
                  aria-pressed={activo}
                  onClick={() => elegir(nombre)}
                  className={`flex h-full w-full flex-col gap-2 rounded-lg border bg-card p-5 pb-12 text-left transition-[transform,box-shadow] duration-300 ease-brandia outline-none hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring ${activo ? "border-foreground ring-1 ring-foreground" : ""}`}
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
                <MeGusta
                  activo={gustan.includes(nombre)}
                  onClick={() => meGusta(nombre)}
                  que={`el nombre ${nombre}`}
                  className="absolute right-3 bottom-3 size-9 text-foreground"
                />
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

      <form onSubmit={otros} className="mt-5 flex flex-col gap-3 rounded-lg border bg-card p-4 sm:p-5">
        <label htmlFor="guia-nombres" className="text-sm font-semibold">
          Tu guía para el nombre <span className="font-normal text-muted-foreground">(opcional, vale para todas las vueltas)</span>
        </label>
        <textarea
          id="guia-nombres"
          value={guia}
          onChange={(e) => setGuia(e.target.value)}
          maxLength={400}
          rows={2}
          placeholder="Ej.: que use mi apellido, que suene a barrio, que tenga algo del mar"
          className="w-full min-w-0 resize-none rounded-[14px] border border-input bg-background px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
        />
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold">
            Estilo <span className="font-normal text-muted-foreground">(si querés una vuelta de un solo tipo)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {[{ id: null, texto: "Mezclados" } as const, ...ESTILOS].map((e) => {
              const activo = estilo === e.id;
              return (
                <button
                  key={e.texto}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => setEstilo(e.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors duration-300 ease-brandia ${
                    activo ? "border-foreground bg-foreground text-background" : "hover:bg-muted"
                  }`}
                >
                  {e.texto}
                </button>
              );
            })}
          </div>
        </fieldset>
        <Button type="submit" size="lg" disabled={pidiendo} className="self-start">
          <RefreshCw data-icon="inline-start" className={pidiendo ? "animate-spin" : ""} />
          {pidiendo && nombres.length ? "Pensando…" : estilo ? `Otros nombres: ${ESTILOS.find((e) => e.id === estilo)?.texto.toLowerCase()}` : "Otros nombres"}
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
