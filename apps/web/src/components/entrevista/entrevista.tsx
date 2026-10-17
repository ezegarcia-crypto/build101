"use client";

import { useChat } from "@ai-sdk/react";
import { Button, buttonVariants } from "@build101/ui/components/button";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowRight, ArrowUp, Mic, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Pasos } from "@/components/pasos";

import { CLAVE_DIRECCIONES, CLAVE_IDENTIDAD } from "@/components/brandbook/identidad";

import { Armando } from "./armando";
import s from "./entrevista.module.css";
import { CLAVE_FICHA, Ficha, type FichaMarca } from "./ficha";
import { TextoIA } from "./texto-ia";

// Paso 1 · Contanos. La entrevista por chat contra /api/entrevista (la arma Eze en la rama ia).
// Cuando la persona confirma el resumen, la IA devuelve la ficha en una parte
// "tool-terminar_entrevista" (ver apps/web/src/lib/ia/README.md).

function buscarFicha(messages: UIMessage[]): FichaMarca | null {
  for (const m of messages) {
    if (m.role !== "assistant") continue;
    for (const p of m.parts) {
      if (
        p.type === "tool-terminar_entrevista" &&
        "state" in p &&
        (p.state === "input-available" || p.state === "output-available")
      ) {
        return p.input as FichaMarca;
      }
    }
  }
  return null;
}

function textoDe(m: UIMessage) {
  return m.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function CajaDeTexto({
  onEnviar,
  ocupado,
  grande,
}: {
  onEnviar: (texto: string) => void;
  ocupado: boolean;
  grande?: boolean;
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
      <label htmlFor="mensaje" className="sr-only">
        Tu mensaje
      </label>
      <textarea
        id="mensaje"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            enviar();
          }
        }}
        rows={1}
        autoFocus={grande}
        placeholder={grande ? "Tengo una… en… y le vendo a…" : "Escribí tu respuesta"}
        className={`field-sizing-content max-h-48 flex-1 resize-none bg-transparent py-2.5 text-base leading-snug outline-none placeholder:text-muted-foreground ${grande ? "min-h-20" : ""}`}
      />
      {/* El único punto naranja de la pantalla */}
      <Button type="submit" variant="secondary" size="icon" disabled={!listo} aria-label="Enviar">
        <ArrowUp className="size-5" strokeWidth={2.4} />
      </Button>
    </form>
  );
}

export function Entrevista() {
  const { messages, sendMessage, status, error, regenerate, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/entrevista" }),
  });
  const lista = useRef<HTMLDivElement>(null);
  const tarjeta = useRef<HTMLDivElement>(null);

  const ficha = buscarFicha(messages);
  const ocupado = status === "submitted" || status === "streaming";
  const ultimo = messages.at(-1);
  const armandoFicha =
    ultimo?.role === "assistant" &&
    ultimo.parts.some((p) => p.type === "tool-terminar_entrevista" && "state" in p && p.state === "input-streaming");
  // Se muestra la carga hasta que BrandIA empieza a escribir, o mientras arma la ficha
  const cargando =
    !ficha && (status === "submitted" || armandoFicha || (status === "streaming" && ultimo?.role === "assistant" && !textoDe(ultimo)));

  useEffect(() => {
    if (ficha) sessionStorage.setItem(CLAVE_FICHA, JSON.stringify(ficha));
  }, [ficha]);

  // Siempre se ve lo último; cuando llega la ficha, la pantalla baja hasta el comienzo de la tarjeta
  useEffect(() => {
    const caja = lista.current;
    if (!caja) return;
    const destino = ficha && tarjeta.current ? tarjeta.current.offsetTop - 16 : caja.scrollHeight;
    caja.scrollTo({ top: destino, behavior: "smooth" });
  }, [messages, cargando, ficha]);

  const enviar = (text: string) => sendMessage({ text });

  function empezarDeNuevo() {
    setMessages([]);
    sessionStorage.removeItem(CLAVE_FICHA);
    sessionStorage.removeItem(CLAVE_DIRECCIONES);
    sessionStorage.removeItem(CLAVE_IDENTIDAD);
  }

  // Antes del primer mensaje: la invitación a contar el negocio
  if (messages.length === 0) {
    return (
      <main className="mx-auto flex min-h-0 w-full max-w-[720px] flex-col justify-center overflow-y-auto px-4 py-12 sm:py-20">
        <Pasos actual={0} />
        <h1 className={`${s.seCocina} display mt-8`}>
          Contanos lo que <span className={s.it}>hacés</span>.
        </h1>
        <p className="lead mt-4 max-w-[34em] text-base">
          Contanos tu negocio como se lo contarías a un amigo: qué hacés, para quién y dónde vendés. Te hacemos
          unas pocas preguntas y armamos la ficha de tu marca.
        </p>
        <div className={`${s.entra} mt-8`}>
          <CajaDeTexto onEnviar={enviar} ocupado={ocupado} grande />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>¿Preferís hablar?</span>
          <Button variant="outline" size="sm" disabled>
            <Mic data-icon="inline-start" />
            Hablar con BrandIA · en construcción
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[720px] flex-col overflow-hidden px-4">
      <div className="flex items-center justify-between gap-3 pt-5 pb-3">
        <Pasos actual={0} />
        <Button variant="ghost" size="xs" onClick={empezarDeNuevo} disabled={ocupado} aria-label="Empezar de nuevo">
          <RotateCcw data-icon="inline-start" />
          <span className="hidden sm:inline">Empezar de nuevo</span>
        </Button>
      </div>

      <div ref={lista} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain py-4" aria-live="polite">
        <div className="flex flex-col gap-4">
          {messages.map((m) => {
            const texto = textoDe(m);
            if (!texto) return null;
            return m.role === "user" ? (
              <div
                key={m.id}
                className={`${s.entra} max-w-[86%] self-end rounded-2xl rounded-br-[4px] bg-primary px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-primary-foreground`}
              >
                {texto}
              </div>
            ) : (
              <div
                key={m.id}
                className={`${s.entra} max-w-[86%] self-start rounded-2xl rounded-bl-[4px] border bg-card px-4 py-3 text-[15px] leading-relaxed`}
              >
                <TextoIA texto={texto} />
              </div>
            );
          })}

          {cargando && (
            <div className={`${s.entra} self-start px-1 py-2`}>
              <Armando que={armandoFicha ? "ficha" : "pregunta"} />
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

          {ficha && (
            <div ref={tarjeta} className="mt-4 flex flex-col gap-4">
              <Ficha ficha={ficha} />
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/crear/marca" className={buttonVariants({ size: "lg" })}>
                  Armar mi marca
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {!ficha && (
        <div className="pt-2 pb-4 sm:pb-6">
          <CajaDeTexto onEnviar={enviar} ocupado={ocupado} />
        </div>
      )}
    </main>
  );
}
