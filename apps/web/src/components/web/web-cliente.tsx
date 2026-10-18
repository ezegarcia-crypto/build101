"use client";

import { useChat } from "@ai-sdk/react";
import { Button, buttonVariants } from "@build101/ui/components/button";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowRight, ArrowUp, Check, Laptop, RotateCcw, Smartphone, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { heredarDeLaQueAbrio } from "@/components/boton-web";
import {
  CLAVE_IDENTIDAD,
  type Comprobacion,
  type IdentidadIA,
  logoDeMarca,
  type MarcaGuardada,
} from "@/components/brandbook/identidad";
import { Armando } from "@/components/entrevista/armando";
import s from "@/components/entrevista/entrevista.module.css";
import { CLAVE_FICHA } from "@/components/entrevista/ficha";
import { TextoIA } from "@/components/entrevista/texto-ia";
import type { Brief } from "@/lib/ia/brief";
import { type FichaWeb, primeraPregunta } from "@/lib/ia/web/ficha-web";
import type { MarcaWeb, Web } from "@/lib/ia/web/web";

import { logoSinFondo } from "./logo-web";
import { Publicar } from "./publicar";
import { useFotosWeb } from "./usar-fotos";
import { VistaWeb } from "./vista-web";

// La web del cliente, pasos 1, 3 y 4 de equipo/flujo-web-cliente.md:
//   1. la entrevista de la web por chat (/api/web/entrevista), que termina en la ficha de la web;
//   3. la IA arma la web con la marca (/api/web/armar);
//   4. vista previa (celular o compu) y cambios pedidos en palabras (/api/web/cambio);
//   7 y 8. publicar en /w/[slug] y entregar el link y el QR (publicar.tsx, /api/web/publicar).
// Parte de la ficha y la identidad que dejaron /crear y /crear/marca. Todo queda guardado en la sesión.

const CLAVE_WEB = "brandia:web";

/** La identidad con el logo que eligió la persona, ya sin fondo (logo-web.ts). Sin imagen, la web usa el isotipo */
export type IdentidadConLogo = IdentidadIA & { logo: IdentidadIA["logo"] & { imagen?: string | null } };

type Guardada = {
  ficha: string;
  ficha_web: FichaWeb;
  web: Web;
  comprobaciones: Comprobacion[];
  charla: Mensaje[];
};
type Mensaje = { quien: "persona" | "brandia"; texto: string };

type Estado =
  | { tipo: "cargando" }
  | { tipo: "sin-marca" }
  | { tipo: "entrevista" }
  | { tipo: "armando"; fichaWeb: FichaWeb }
  | { tipo: "lista"; guardada: Guardada }
  | { tipo: "error"; mensaje: string; reintentar: () => void };

const FRASES_CAMBIO = ["Leyendo tu pedido…", "Cambiando solo eso…", "Revisando que no falte ningún dato…"];

const FRASES_WEB = [
  "Leyendo lo que contaste…",
  "Eligiendo el estilo para tu rubro…",
  "Ordenando las secciones…",
  "Escribiendo con la voz de tu marca…",
  "Revisando que no falte ningún dato…",
];

function leer<T>(clave: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(clave) ?? "null");
  } catch {
    return null;
  }
}

function guardar(valor: Guardada | null) {
  try {
    if (valor) sessionStorage.setItem(CLAVE_WEB, JSON.stringify(valor));
    else sessionStorage.removeItem(CLAVE_WEB);
  } catch {
    // sin lugar en la sesión: se sigue sin guardar
  }
}

async function pedir<T>(ruta: string, cuerpo: unknown): Promise<T> {
  const res = await fetch(ruta, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(datos?.error || "No pudimos conectar con BrandIA.");
  return datos as T;
}

function buscarFichaWeb(messages: UIMessage[]): FichaWeb | null {
  for (const m of messages) {
    if (m.role !== "assistant") continue;
    for (const p of m.parts) {
      if (
        p.type === "tool-terminar_entrevista_web" &&
        "state" in p &&
        (p.state === "input-available" || p.state === "output-available")
      ) {
        return p.input as FichaWeb;
      }
    }
  }
  return null;
}

const textoDe = (m: UIMessage) =>
  m.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");

/** Mientras la IA trabaja en la web: la B modular de Armando con frases propias de este paso */
function ArmandoWeb({ frases = FRASES_WEB }: { frases?: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % frases.length), 2400);
    return () => clearInterval(t);
  }, [frases]);
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status" aria-live="polite">
      <svg viewBox="0 0 62 76" className="h-7 w-auto shrink-0" aria-hidden="true">
        <g transform="translate(-10,-12)">
          <path className={s.piezaArriba} fill="var(--foreground)" d="M10,12 H38.5 A17.5,17.5 0 0 1 38.5,47 H36 V59 H20 V47 H10 Z" />
          <path className={s.piezaAbajo} fill="var(--naranja)" d="M10,53 H18 V61 H38 V53 H54.5 A17.5,17.5 0 0 1 54.5,88 H10 Z" />
        </g>
      </svg>
      <span key={i} className={s.progreso}>
        {frases[i]}
      </span>
    </div>
  );
}

function Caja({
  onEnviar,
  ocupado,
  placeholder,
  naranja,
}: {
  onEnviar: (texto: string) => void;
  ocupado: boolean;
  placeholder: string;
  naranja?: boolean;
}) {
  const [texto, setTexto] = useState("");
  const listo = texto.trim().length > 0 && !ocupado;
  function enviar() {
    if (!listo) return;
    onEnviar(texto.trim());
    setTexto("");
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        enviar();
      }}
      className="flex items-end gap-2 rounded-[26px] border bg-card p-2 pl-5 shadow-[0_30px_60px_-40px_rgba(30,30,28,.4)] transition-colors duration-300 ease-brandia focus-within:border-foreground/40"
    >
      <label className="sr-only" htmlFor="mensaje-web">
        Tu mensaje
      </label>
      <textarea
        id="mensaje-web"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            enviar();
          }
        }}
        rows={1}
        placeholder={placeholder}
        className="field-sizing-content max-h-40 flex-1 resize-none bg-transparent py-2.5 text-base leading-snug outline-none placeholder:text-muted-foreground"
      />
      <Button type="submit" variant={naranja ? "secondary" : "default"} size="icon" disabled={!listo} aria-label="Enviar">
        <ArrowUp className="size-5" strokeWidth={2.4} />
      </Button>
    </form>
  );
}

function Burbuja({ quien, children }: { quien: "persona" | "brandia"; children: React.ReactNode }) {
  return quien === "persona" ? (
    <div className={`${s.entra} max-w-[86%] self-end rounded-2xl rounded-br-[4px] bg-primary px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-primary-foreground`}>
      {children}
    </div>
  ) : (
    <div className={`${s.entra} max-w-[86%] self-start rounded-2xl rounded-bl-[4px] border bg-card px-4 py-3 text-[15px] leading-relaxed`}>
      {children}
    </div>
  );
}

function Encabezado({ onReiniciar, ocupado }: { onReiniciar?: () => void; ocupado?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="label">Módulo B · Tu web</p>
      {onReiniciar && (
        <Button variant="ghost" size="xs" onClick={onReiniciar} disabled={ocupado} aria-label="Empezar la web de nuevo">
          <RotateCcw data-icon="inline-start" />
          <span className="hidden sm:inline">Empezar de nuevo</span>
        </Button>
      )}
    </div>
  );
}

// ---- Paso 1 · La entrevista de la web ----

function EntrevistaWeb({ marca, onFicha, onReiniciar }: { marca: MarcaWeb; onFicha: (f: FichaWeb) => void; onReiniciar: () => void }) {
  const transporte = useMemo(() => new DefaultChatTransport({ api: "/api/web/entrevista", body: { marca } }), [marca]);
  const { messages, sendMessage, status, error, regenerate } = useChat({ transport: transporte });
  const lista = useRef<HTMLDivElement>(null);

  const ficha = buscarFichaWeb(messages);
  const ocupado = status === "submitted" || status === "streaming";
  const ultimo = messages.at(-1);
  const cerrando =
    ultimo?.role === "assistant" &&
    ultimo.parts.some((p) => p.type === "tool-terminar_entrevista_web" && "state" in p && p.state === "input-streaming");
  const cargando =
    !ficha && (status === "submitted" || cerrando || (status === "streaming" && ultimo?.role === "assistant" && !textoDe(ultimo)));

  useEffect(() => {
    if (ficha) onFicha(ficha);
  }, [ficha, onFicha]);

  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" });
  }, [messages, cargando]);

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[720px] flex-col overflow-hidden px-4">
      <div className="pt-5 pb-3">
        <Encabezado onReiniciar={messages.length ? onReiniciar : undefined} ocupado={ocupado} />
      </div>
      <div ref={lista} className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4" aria-live="polite">
        {messages.length === 0 && (
          <h1 className={`${s.seCocina} display mb-6 text-[clamp(2.2rem,7vw,3.4rem)]`}>
            Tu web, con <span className={s.it}>tu marca</span>.
          </h1>
        )}
        <div className="flex flex-col gap-4">
          <Burbuja quien="brandia">{primeraPregunta(marca.identidad.nombre)}</Burbuja>
          {messages.map((m) => {
            const texto = textoDe(m);
            if (!texto) return null;
            return (
              <Burbuja key={m.id} quien={m.role === "user" ? "persona" : "brandia"}>
                {m.role === "user" ? texto : <TextoIA texto={texto} />}
              </Burbuja>
            );
          })}
          {cargando && (
            <div className={`${s.entra} self-start px-1 py-2`}>
              <Armando que={cerrando ? "ficha" : "pregunta"} />
            </div>
          )}
          {error && !ocupado && (
            <div className={`${s.entra} flex flex-wrap items-center gap-3 self-start rounded-lg border px-4 py-3 text-sm`}>
              <span>Se cortó la conexión con BrandIA.</span>
              <Button variant="outline" size="xs" onClick={() => regenerate()}>
                Probar de nuevo
              </Button>
            </div>
          )}
        </div>
      </div>
      {!ficha && (
        <div className="pt-2 pb-4 sm:pb-6">
          <Caja onEnviar={(text) => sendMessage({ text })} ocupado={ocupado} placeholder="Escribí tu respuesta" naranja />
        </div>
      )}
    </main>
  );
}

// ---- Pasos 3 y 4 · La web armada, la vista previa y los cambios ----

function Comprobaciones({ lista }: { lista: Comprobacion[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {lista.map((c) => (
        <li key={c.que} className="flex gap-2.5 text-sm">
          {c.ok ? (
            <Check className="mt-0.5 size-4 shrink-0" aria-label="Bien" />
          ) : (
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-accent-text" aria-label="Revisar" />
          )}
          <span>
            <strong className="font-semibold">{c.que}.</strong> <span className="text-muted-foreground">{c.detalle}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function WebLista({
  marca,
  identidad,
  guardada,
  onCambio,
  onReiniciar,
}: {
  marca: MarcaWeb;
  identidad: IdentidadConLogo;
  guardada: Guardada;
  onCambio: (g: Guardada) => void;
  onReiniciar: () => void;
}) {
  const [celular, setCelular] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const charla = useRef<HTMLDivElement>(null);
  const { web, ficha_web } = guardada;
  const { fotos, generando } = useFotosWeb({
    ficha: guardada.ficha,
    web,
    fichaWeb: ficha_web,
    identidad,
    rubro: marca.brief.marca.rubro,
  });

  useEffect(() => {
    charla.current?.scrollTo({ top: charla.current.scrollHeight, behavior: "smooth" });
  }, [guardada.charla, ocupado]);

  async function cambiar(pedido: string) {
    const conPedido: Guardada = { ...guardada, charla: [...guardada.charla, { quien: "persona", texto: pedido }] };
    onCambio(conPedido);
    setOcupado(true);
    setError(null);
    try {
      const r = await pedir<{ respuesta: string; web: Web; ficha_web: FichaWeb; comprobaciones: Comprobacion[] }>(
        "/api/web/cambio",
        { marca, ficha_web, web, pedido },
      );
      onCambio({
        ...conPedido,
        web: r.web,
        ficha_web: r.ficha_web,
        comprobaciones: r.comprobaciones,
        charla: [...conPedido.charla, { quien: "brandia", texto: r.respuesta }],
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <main className="min-h-0 overflow-y-auto lg:overflow-hidden">
      <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 py-5 lg:h-full lg:grid-cols-[minmax(0,1fr)_380px] lg:py-6">
        {/* La vista previa */}
        <section className="flex min-h-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Encabezado />
            <div className="flex rounded-full border p-1" role="group" aria-label="Ver la web como">
              <Button variant={celular ? "default" : "ghost"} size="xs" onClick={() => setCelular(true)} aria-pressed={celular}>
                <Smartphone data-icon="inline-start" />
                Celular
              </Button>
              <Button variant={!celular ? "default" : "ghost"} size="xs" onClick={() => setCelular(false)} aria-pressed={!celular}>
                <Laptop data-icon="inline-start" />
                Compu
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 rounded-[14px] bg-cemento/40 p-3 sm:p-5">
            <div
              className={`mx-auto h-[70svh] overflow-y-auto overscroll-contain rounded-[14px] shadow-[0_30px_60px_-40px_rgba(30,30,28,.5)] transition-[max-width] duration-500 ease-brandia lg:h-full ${
                celular ? "max-w-[390px]" : "max-w-full"
              }`}
            >
              <VistaWeb web={web} ficha={ficha_web} identidad={identidad} fotos={fotos} generandoFotos={generando} />
            </div>
          </div>
        </section>

        {/* El panel: por qué, comprobaciones, cambios por chat y publicar */}
        <aside className="flex min-h-0 flex-col gap-5 lg:overflow-y-auto">
          <div className={s.entra}>
            <h1 className="text-[1.9rem] leading-tight">
              Tu web, <span className={s.it}>armada</span>.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{web.por_que_estilo}</p>
          </div>

          <div className="rounded-[14px] border bg-card p-4">
            <p className="label">Cómo aparece en Google</p>
            <p className="mt-2 text-[15px] font-semibold leading-snug">{web.titulo_google}</p>
            <p className="mt-1 text-sm text-muted-foreground">{web.descripcion_google}</p>
          </div>

          <div className="rounded-[14px] border bg-card p-4">
            <p className="label mb-3">Revisado automáticamente</p>
            <Comprobaciones lista={guardada.comprobaciones} />
            {ficha_web.huecos.length > 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                <strong className="font-semibold text-foreground">No lo contaste:</strong> {ficha_web.huecos.join(" · ")}
              </p>
            )}
          </div>

          <div className="flex min-h-[260px] flex-col rounded-[14px] border bg-card">
            <p className="label px-4 pt-4">Pedí cambios en palabras</p>
            <div ref={charla} className="flex max-h-[340px] min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4" aria-live="polite">
              {guardada.charla.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Por ejemplo: «cambiá el título de arriba», «sacá un producto que ya no hago» o «el lunes cierro».
                </p>
              )}
              {guardada.charla.map((m, i) => (
                <Burbuja key={i} quien={m.quien}>
                  {m.texto}
                </Burbuja>
              ))}
              {ocupado && (
                <div className="self-start px-1 py-1">
                  <ArmandoWeb frases={FRASES_CAMBIO} />
                </div>
              )}
              {error && !ocupado && <p className="text-sm text-accent-text">{error}</p>}
            </div>
            <div className="p-2 pt-0">
              <Caja onEnviar={cambiar} ocupado={ocupado} placeholder="¿Qué le cambiamos?" naranja />
            </div>
          </div>

          <div className="flex flex-col gap-3 pb-4">
            <Publicar
              ficha={guardada.ficha}
              web={web}
              fichaWeb={ficha_web}
              identidad={identidad}
              fotos={fotos}
              ocupado={ocupado || generando}
            />
            <Button variant="ghost" size="sm" onClick={onReiniciar} disabled={ocupado}>
              <RotateCcw data-icon="inline-start" />
              Empezar la web de nuevo
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}

// ---- El recorrido ----

export function WebCliente() {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [marca, setMarca] = useState<MarcaWeb | null>(null);
  const [identidad, setIdentidad] = useState<IdentidadIA | null>(null);
  const [logoImagen, setLogoImagen] = useState<string | null>(null);
  const [textoFicha, setTextoFicha] = useState("");
  const [vuelta, setVuelta] = useState(0); // para reiniciar la entrevista desde cero

  useEffect(() => {
    heredarDeLaQueAbrio();
    const texto = sessionStorage.getItem(CLAVE_FICHA);
    const brief = leer<Brief>(CLAVE_FICHA);
    const ident = leer<MarcaGuardada>(CLAVE_IDENTIDAD);
    if (!texto || !brief || !ident || ident.ficha !== texto) return setEstado({ tipo: "sin-marca" });
    // El logo que eligió en el brandbook (si eligió el símbolo, logoDeMarca da null y la web usa el isotipo)
    const logo = logoDeMarca(ident.logos ?? [], ident.elegido);
    if (logo?.imagen) logoSinFondo(logo.imagen).then(setLogoImagen);
    setTextoFicha(texto);
    setIdentidad(ident.identidad);
    setMarca({ brief, identidad: ident.identidad });
    const guardada = leer<Guardada>(CLAVE_WEB);
    setEstado(guardada?.ficha === texto ? { tipo: "lista", guardada } : { tipo: "entrevista" });
  }, []);

  const armar = useCallback(
    async (fichaWeb: FichaWeb) => {
      if (!marca) return;
      setEstado({ tipo: "armando", fichaWeb });
      try {
        const { web, comprobaciones } = await pedir<{ web: Web; comprobaciones: Comprobacion[] }>("/api/web/armar", {
          marca,
          ficha_web: fichaWeb,
        });
        const guardada: Guardada = { ficha: textoFicha, ficha_web: fichaWeb, web, comprobaciones, charla: [] };
        guardar(guardada);
        setEstado({ tipo: "lista", guardada });
      } catch (e) {
        setEstado({ tipo: "error", mensaje: (e as Error).message, reintentar: () => armar(fichaWeb) });
      }
    },
    [marca, textoFicha],
  );

  const reiniciar = useCallback(() => {
    guardar(null);
    setVuelta((n) => n + 1);
    setEstado({ tipo: "entrevista" });
  }, []);

  const identidadWeb = useMemo<IdentidadConLogo | null>(
    () => identidad && { ...identidad, logo: { ...identidad.logo, imagen: logoImagen } },
    [identidad, logoImagen],
  );

  if (estado.tipo === "cargando") return <main />;

  if (estado.tipo === "sin-marca") {
    return (
      <main className="mx-auto flex w-full max-w-[720px] flex-col justify-center px-4 py-12">
        <Encabezado />
        <h1 className="display mt-6 text-[clamp(2.2rem,7vw,3.4rem)]">
          Primero, <span className={s.it}>tu marca</span>.
        </h1>
        <p className="lead mt-4 max-w-[34em] text-base">
          La web se arma con tu marca: tus colores, tus tipografías, tu logo y tu forma de hablar. No armamos una web sin
          marca. Contanos tu negocio y en unos minutos la tenés.
        </p>
        <div className="mt-8">
          <Link href="/crear" className={buttonVariants({ size: "lg" })}>
            Armar mi marca
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
      </main>
    );
  }

  if (!marca || !identidad) return <main />;

  if (estado.tipo === "entrevista") {
    return <EntrevistaWeb key={vuelta} marca={marca} onFicha={armar} onReiniciar={reiniciar} />;
  }

  if (estado.tipo === "armando") {
    return (
      <main className="mx-auto flex w-full max-w-[720px] flex-col justify-center gap-6 px-4 py-12">
        <Encabezado />
        <h1 className={`${s.seCocina} display text-[clamp(2.2rem,7vw,3.4rem)]`}>
          Armando la web de <span className={s.it}>{identidad.nombre}</span>.
        </h1>
        <ArmandoWeb />
      </main>
    );
  }

  if (estado.tipo === "error") {
    return (
      <main className="mx-auto flex w-full max-w-[720px] flex-col justify-center gap-4 px-4 py-12">
        <Encabezado />
        <p className="text-lg">{estado.mensaje}</p>
        <div className="flex gap-3">
          <Button onClick={estado.reintentar}>Probar de nuevo</Button>
          <Button variant="ghost" onClick={reiniciar}>
            Empezar la web de nuevo
          </Button>
        </div>
      </main>
    );
  }

  return (
    <WebLista
      marca={marca}
      identidad={identidadWeb ?? identidad}
      guardada={estado.guardada}
      onCambio={(g) => {
        guardar(g);
        setEstado({ tipo: "lista", guardada: g });
      }}
      onReiniciar={reiniciar}
    />
  );
}
