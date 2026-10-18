"use client";

import { useEffect, useRef, useState } from "react";

// Contar con audio: la persona graba en el navegador, el audio va a /api/transcribir (ElevenLabs Scribe)
// y el texto vuelve a la caja del chat para que lo revise y lo mande. BrandIA no habla: solo escucha.

export const MAXIMO_SEGUNDOS = 180; // la ruta acepta hasta unos 5 minutos; cortamos antes

type Estado = "quieto" | "grabando" | "transcribiendo";

// Chrome y Firefox graban en webm; Safari, en mp4. Scribe entiende los dos.
function formatoQueAnda() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((f) => MediaRecorder.isTypeSupported(f));
}

export function minutos(segundos: number) {
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;
}

export function useGrabadora(onTexto: (texto: string) => void) {
  const [estado, setEstado] = useState<Estado>("quieto");
  const [segundos, setSegundos] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [disponible, setDisponible] = useState(false);
  const grabadora = useRef<MediaRecorder | null>(null);
  const partes = useRef<Blob[]>([]);
  const descartar = useRef(false);

  // Solo se ofrece el micrófono si el navegador sabe grabar (se mira en el navegador, no en el servidor)
  useEffect(() => {
    setDisponible(typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia);
  }, []);

  // El reloj de la grabación, con corte automático
  useEffect(() => {
    if (estado !== "grabando") return;
    const t = setInterval(() => setSegundos((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [estado]);
  useEffect(() => {
    if (estado === "grabando" && segundos >= MAXIMO_SEGUNDOS) grabadora.current?.stop();
  }, [estado, segundos]);

  // Si la persona se va de la página grabando, se apaga el micrófono
  useEffect(() => () => grabadora.current?.stream.getTracks().forEach((t) => t.stop()), []);

  async function transcribir(audio: Blob) {
    setEstado("transcribiendo");
    try {
      const datos = new FormData();
      datos.set("audio", audio);
      const res = await fetch("/api/transcribir", {
        method: "POST",
        body: datos,
      });
      const respuesta = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(respuesta.error ?? "No pudimos entender el audio. Probá de nuevo o escribilo.");
      onTexto(respuesta.texto);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setEstado("quieto");
    }
  }

  async function empezar() {
    setError(null);
    let microfono: MediaStream;
    try {
      microfono = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Necesitamos permiso para usar el micrófono. Habilitalo en el navegador, o escribilo.");
      return;
    }
    const formato = formatoQueAnda();
    const g = new MediaRecorder(microfono, formato ? { mimeType: formato } : undefined);
    partes.current = [];
    descartar.current = false;
    g.ondataavailable = (e) => {
      if (e.data.size > 0) partes.current.push(e.data);
    };
    g.onstop = () => {
      microfono.getTracks().forEach((t) => t.stop());
      grabadora.current = null;
      if (descartar.current || partes.current.length === 0) {
        setEstado("quieto");
        return;
      }
      void transcribir(new Blob(partes.current, { type: g.mimeType }));
    };
    grabadora.current = g;
    g.start();
    setSegundos(0);
    setEstado("grabando");
  }

  function terminar() {
    grabadora.current?.stop();
  }

  function cancelar() {
    descartar.current = true;
    grabadora.current?.stop();
  }

  return { estado, segundos, error, disponible, empezar, terminar, cancelar };
}
