"use client";

import { Button, buttonVariants } from "@build101/ui/components/button";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { ArrowRight, MessageSquare, Mic, PhoneOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Brief } from "@/lib/ia/brief";

import { Armando } from "./armando";
import s from "./entrevista.module.css";
import { CLAVE_FICHA, Ficha, type FichaMarca } from "./ficha";
import v from "./voz.module.css";

// La entrevista por voz, con el agente de ElevenLabs que armó Eze (ver lib/ia/README.md, punto 5):
//   GET  /api/voz        → { signedUrl }  permiso de un solo uso; la clave queda en el servidor
//   POST /api/voz/ficha  { transcripcion } → { ficha }  la misma ficha que la entrevista por chat
// Cuando el agente se despide y corta (o la persona toca "Terminar"), se arma la ficha.

type Linea = { rol: "usuario" | "agente"; texto: string };

export function EntrevistaVoz({ onVolverAlChat }: { onVolverAlChat: () => void }) {
  return (
    <ConversationProvider>
      <Llamada onVolverAlChat={onVolverAlChat} />
    </ConversationProvider>
  );
}

function Llamada({ onVolverAlChat }: { onVolverAlChat: () => void }) {
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [ficha, setFicha] = useState<Brief | null>(null);
  const [armando, setArmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noDisponible, setNoDisponible] = useState(false);
  // Copias en ref: los avisos de ElevenLabs llegan fuera del ciclo de React
  const transcripcion = useRef<Linea[]>([]);
  const fichaPedida = useRef(false);
  const lista = useRef<HTMLDivElement>(null);

  async function armarFicha() {
    if (fichaPedida.current) return;
    if (!transcripcion.current.some((l) => l.rol === "usuario")) return;
    fichaPedida.current = true;
    setArmando(true);
    try {
      const res = await fetch("/api/voz/ficha", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcripcion: transcripcion.current }),
      });
      const datos = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(datos.error ?? "No pudimos armar la ficha.");
      sessionStorage.setItem(CLAVE_FICHA, JSON.stringify(datos.ficha));
      setFicha(datos.ficha);
    } catch (e) {
      setError((e as Error).message);
      fichaPedida.current = false;
    } finally {
      setArmando(false);
    }
  }

  const { startSession, endSession, status, isSpeaking } = useConversation({
    onMessage: ({ role, message }) => {
      transcripcion.current = [...transcripcion.current, { rol: role === "user" ? "usuario" : "agente", texto: message }];
      setLineas(transcripcion.current);
    },
    onDisconnect: () => void armarFicha(),
    onError: (mensaje) => setError(typeof mensaje === "string" ? mensaje : "Se cortó la llamada."),
  });

  const enLlamada = status === "connected" || status === "connecting";

  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" });
  }, [lineas, ficha, armando]);

  async function empezar() {
    setError(null);
    setFicha(null);
    setLineas([]);
    transcripcion.current = [];
    fichaPedida.current = false;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
        throw new Error("Necesitamos permiso para usar el micrófono. Habilitalo en el navegador y probá de nuevo.");
      });
      const res = await fetch("/api/voz");
      const datos = await res.json().catch(() => ({}));
      if (res.status === 503) return setNoDisponible(true);
      if (!res.ok) throw new Error(datos.error ?? "No pudimos conectar con BrandIA.");
      startSession({ signedUrl: datos.signedUrl, connectionType: "websocket" });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function terminar() {
    endSession();
    void armarFicha();
  }

  // Sin las claves de ElevenLabs, la voz todavía no anda: se ofrece el chat
  if (noDisponible) {
    return (
      <div className={`${s.entra} mt-8 rounded-lg border bg-card p-6`}>
        <p className="label">En construcción</p>
        <p className="mt-2 text-[15px] leading-relaxed">
          La entrevista por voz todavía no está disponible. Mientras tanto, contanos tu negocio por chat.
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onVolverAlChat}>
          <MessageSquare data-icon="inline-start" />
          Escribir por chat
        </Button>
      </div>
    );
  }

  const estado = armando
    ? "Armando tu ficha…"
    : status === "connecting"
      ? "Conectando…"
      : status === "connected"
        ? isSpeaking
          ? "BrandIA está hablando"
          : "Te escucho"
        : ficha
          ? "Listo"
          : "Tocá para empezar";

  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* La esfera: el estado de la llamada de un vistazo */}
      {!ficha && (
        <div className="flex flex-col items-center gap-5 py-4">
          <button
            type="button"
            onClick={enLlamada ? undefined : empezar}
            disabled={enLlamada || armando}
            aria-label={enLlamada ? estado : "Empezar a hablar con BrandIA"}
            className="relative grid size-36 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default sm:size-40"
          >
            {status === "connected" && isSpeaking && (
              <span className={`${v.onda} absolute inset-0 rounded-full bg-foreground`} aria-hidden="true" />
            )}
            <span
              className={`${status === "connected" ? (isSpeaking ? v.habla : v.respira) : ""} relative grid size-full place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 ease-brandia`}
            >
              <Mic className="size-10" strokeWidth={1.8} />
            </span>
          </button>
          <p className="label" role="status" aria-live="polite">
            {estado}
          </p>
          {enLlamada && (
            <Button variant="outline" size="sm" onClick={terminar}>
              <PhoneOff data-icon="inline-start" />
              Terminar y armar mi ficha
            </Button>
          )}
          {!enLlamada && !armando && (
            <button type="button" onClick={onVolverAlChat} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Prefiero escribir
            </button>
          )}
        </div>
      )}

      {/* La charla, escrita en vivo */}
      {lineas.length > 0 && (
        <div ref={lista} className="flex max-h-[40svh] flex-col gap-3 overflow-y-auto overscroll-contain py-1" aria-live="polite">
          {lineas.map((l, i) =>
            l.rol === "usuario" ? (
              <div
                key={i}
                className={`${s.entra} max-w-[86%] self-end rounded-2xl rounded-br-[4px] bg-primary px-4 py-3 text-[15px] leading-relaxed text-primary-foreground`}
              >
                {l.texto}
              </div>
            ) : (
              <div
                key={i}
                className={`${s.entra} max-w-[86%] self-start rounded-2xl rounded-bl-[4px] border bg-card px-4 py-3 text-[15px] leading-relaxed`}
              >
                {l.texto}
              </div>
            ),
          )}
        </div>
      )}

      {armando && <Armando que="ficha" />}

      {error && !enLlamada && (
        <div className={`${s.entra} flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 text-sm`}>
          <span>{error}</span>
          {fichaPedida.current === false && transcripcion.current.some((l) => l.rol === "usuario") ? (
            <Button variant="outline" size="xs" onClick={() => void armarFicha()}>
              Armar la ficha de nuevo
            </Button>
          ) : (
            <Button variant="outline" size="xs" onClick={empezar}>
              Probar de nuevo
            </Button>
          )}
        </div>
      )}

      {ficha && (
        <div className="flex flex-col gap-4">
          <Ficha ficha={ficha as FichaMarca} />
          <div>
            <Link href="/crear/marca" className={buttonVariants({ size: "lg" })}>
              Armar mi marca
              <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
