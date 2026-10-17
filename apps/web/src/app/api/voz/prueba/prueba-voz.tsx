"use client";

import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useRef, useState } from "react";

import type { Brief } from "@/lib/ia/brief";

type Linea = { rol: "usuario" | "agente"; texto: string };
type Conexion = "websocket" | "webrtc";

export default function PruebaVoz() {
  return (
    <ConversationProvider>
      <Llamada />
    </ConversationProvider>
  );
}

function Llamada() {
  const [conexion, setConexion] = useState<Conexion>("websocket");
  const [transcripcion, setTranscripcion] = useState<Linea[]>([]);
  const [ficha, setFicha] = useState<Brief | null>(null);
  const [armando, setArmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Copias en ref: los avisos de ElevenLabs llegan fuera del ciclo de React.
  const lineas = useRef<Linea[]>([]);
  const fichaPedida = useRef(false);

  async function armarFicha() {
    if (fichaPedida.current) return;
    if (!lineas.current.some((l) => l.rol === "usuario")) return;
    fichaPedida.current = true;
    setArmando(true);
    try {
      const res = await fetch("/api/voz/ficha", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcripcion: lineas.current }),
      });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error ?? `Error ${res.status}`);
      setFicha(datos.ficha);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      fichaPedida.current = false;
    } finally {
      setArmando(false);
    }
  }

  const { startSession, endSession, status, isSpeaking } = useConversation({
    onMessage: ({ role, message }) => {
      const linea: Linea = { rol: role === "user" ? "usuario" : "agente", texto: message };
      lineas.current = [...lineas.current, linea];
      setTranscripcion(lineas.current);
    },
    // Cuando el agente corta (después de la despedida) o cortamos nosotros, se arma la ficha.
    onDisconnect: () => void armarFicha(),
    onError: (mensaje) => setError(mensaje),
  });

  async function empezar() {
    setError(null);
    setFicha(null);
    setTranscripcion([]);
    lineas.current = [];
    fichaPedida.current = false;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
        throw new Error("Necesito permiso para usar el micrófono. Habilitalo en el navegador y probá de nuevo.");
      });
      const res = await fetch(`/api/voz?conexion=${conexion}`);
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error ?? `Error ${res.status}`);
      startSession(
        conexion === "webrtc"
          ? { conversationToken: datos.conversationToken, connectionType: "webrtc" }
          : { signedUrl: datos.signedUrl, connectionType: "websocket" },
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function terminar() {
    endSession();
    void armarFicha();
  }

  const enLlamada = status === "connected" || status === "connecting";

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 overflow-y-auto px-4 py-8">
      <header className="space-y-1">
        <p className="label">Solo para desarrollo</p>
        <h1 className="text-3xl">Prueba de la entrevista por voz</h1>
        <p className="text-muted-foreground">
          Hablá con el agente, contale un negocio inventado y, al final, mirá la ficha de la marca.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        {enLlamada ? (
          <button type="button" onClick={terminar} className="rounded-full bg-primary px-5 py-2.5 text-primary-foreground">
            Terminar y armar la ficha
          </button>
        ) : (
          <button type="button" onClick={empezar} className="rounded-full bg-primary px-5 py-2.5 text-primary-foreground">
            Empezar a hablar →
          </button>
        )}
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Conexión
          <select
            value={conexion}
            onChange={(e) => setConexion(e.target.value as Conexion)}
            disabled={enLlamada}
            className="rounded border bg-background px-2 py-1"
          >
            <option value="websocket">WebSocket (anda en cualquier red)</option>
            <option value="webrtc">WebRTC (mejor audio)</option>
          </select>
        </label>
      </div>

      <p className="text-sm">
        Estado: <strong>{status}</strong>
        {status === "connected" && (isSpeaking ? " · BrandIA está hablando" : " · te está escuchando")}
        {armando && " · armando la ficha…"}
      </p>
      {error && <p className="rounded border border-accent-text p-3 text-sm text-accent-text">{error}</p>}

      {transcripcion.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl">Transcripción</h2>
          {transcripcion.map((l, i) => (
            <p key={i} className="text-sm">
              <strong>{l.rol === "usuario" ? "Vos" : "BrandIA"}:</strong> {l.texto}
            </p>
          ))}
        </section>
      )}

      {ficha && (
        <section className="space-y-2">
          <h2 className="text-xl">Ficha de la marca</h2>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-[14px] bg-muted p-4 text-xs">
            {JSON.stringify(ficha, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}
