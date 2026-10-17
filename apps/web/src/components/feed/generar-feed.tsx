"use client";

import { Button, buttonVariants } from "@build101/ui/components/button";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { CLAVE_IDENTIDAD, type IdentidadIA, type PropuestaLogo } from "@/components/brandbook/identidad";
import { Armando } from "@/components/entrevista/armando";
import { CLAVE_FICHA } from "@/components/entrevista/ficha";
import { Pasos } from "@/components/pasos";
import type { Brief } from "@/lib/ia/brief";
import type { Evento } from "@/lib/ia/contenidos/motor";

import s from "../entrevista/entrevista.module.css";
import { Feed, type Lote } from "./feed";

// Paso 3 · Tu contenido. Con la ficha y la identidad, el motor de contenidos de Eze arma el lote:
// plan del mes, posteos, carrusel, historias y reel, con sus imágenes (POST /api/contenidos/lote,
// ver lib/ia/contenidos/README.md). La respuesta llega de a partes: cada pieza se muestra apenas
// sale y se vuelve a dibujar cuando llegan sus imágenes. Tarda ~70 s.
// El lote terminado queda guardado junto con su identidad: si se recarga, no se vuelve a generar.

export const CLAVE_FEED = "brandia:feed";

type Marca = { ficha: string; brief: Brief; identidad: IdentidadIA; logos: PropuestaLogo[] };

type Estado =
  | { tipo: "cargando" }
  | { tipo: "sin-marca" }
  | { tipo: "lote"; lote: Lote; generando: boolean }
  | { tipo: "error"; mensaje: string };

const LOTE_VACIO: Lote = { kit: null, plan: null, piezas: {}, imagenes: {}, fallas: {}, mensaje: "Arrancando…", fin: null };

function leer<T>(clave: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(clave) ?? "null");
  } catch {
    return null;
  }
}

// Para reconocer si el lote guardado es de esta misma marca
const huella = (m: Marca) => `${m.ficha}|${m.identidad.nombre}|${m.identidad.paleta.map((c) => c.hex).join()}`;

/** Suma un evento del motor al lote, sin tocar el anterior (así React sabe qué cambió). */
function aplicar(l: Lote, e: Evento): Lote {
  switch (e.tipo) {
    case "kit":
      return { ...l, kit: e.kit };
    case "progreso":
      return { ...l, mensaje: e.mensaje };
    case "plan":
      return { ...l, plan: e.plan };
    case "pieza":
      return { ...l, piezas: { ...l.piezas, [e.pieza.id]: e.pieza } };
    case "imagen":
      return { ...l, imagenes: { ...l.imagenes, [e.pieza]: { ...l.imagenes[e.pieza], [e.clave]: e.url } } };
    case "error":
      return { ...l, fallas: { ...l.fallas, [e.donde]: e.mensaje } };
    case "fin":
      return { ...l, fin: { segundos: e.segundos, imagenes: e.imagenes } };
  }
}

export function GenerarFeed() {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [marca, setMarca] = useState<Marca | null>(null);

  const generar = useCallback(async (m: Marca, senal?: AbortSignal) => {
    let lote = LOTE_VACIO;
    setEstado({ tipo: "lote", lote, generando: true });
    document.querySelector("main")?.scrollTo({ top: 0 });
    try {
      const res = await fetch("/api/contenidos/lote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief: m.brief, identidad: m.identidad, imagenes: true }),
        signal: senal,
      });
      if (!res.ok || !res.body) {
        const datos = await res.json().catch(() => ({}));
        throw new Error(datos?.error || "No pudimos conectar con BrandIA.");
      }

      // Una línea JSON por evento (NDJSON): se aplica cada una apenas llega
      const lector = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let resto = "";
      for (;;) {
        const { value, done } = await lector.read();
        if (done) break;
        const lineas = (resto + value).split("\n");
        resto = lineas.pop() ?? "";
        for (const linea of lineas) {
          if (!linea.trim()) continue;
          lote = aplicar(lote, JSON.parse(linea) as Evento);
          // Si se cae antes del plan, no hay nada que mostrar: es un error de todo el lote
          if (!lote.plan && lote.fallas.lote) throw new Error(lote.fallas.lote);
        }
        setEstado({ tipo: "lote", lote, generando: true });
      }

      if (!lote.plan || !lote.kit) throw new Error(lote.fallas.lote || "La respuesta llegó incompleta.");
      if (!lote.fin) lote = { ...lote, fin: { segundos: 0, imagenes: Object.values(lote.imagenes).flatMap(Object.keys).length } };
      setEstado({ tipo: "lote", lote, generando: false });
      try {
        sessionStorage.setItem(CLAVE_FEED, JSON.stringify({ huella: huella(m), lote }));
      } catch {
        // Las imágenes pesan: si no entran, el feed se ve igual, solo que no queda guardado
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setEstado({ tipo: "error", mensaje: (e as Error).message });
    }
  }, []);

  useEffect(() => {
    const ficha = sessionStorage.getItem(CLAVE_FICHA);
    const brief = leer<Brief>(CLAVE_FICHA);
    const guardada = leer<{ ficha: string; identidad: IdentidadIA; logos: PropuestaLogo[] }>(CLAVE_IDENTIDAD);
    if (!ficha || !brief || guardada?.ficha !== ficha) return setEstado({ tipo: "sin-marca" });
    const m = { ficha, brief, identidad: guardada.identidad, logos: guardada.logos ?? [] };
    setMarca(m);

    const previo = leer<{ huella: string; lote?: Lote }>(CLAVE_FEED);
    if (previo?.huella === huella(m) && previo.lote?.plan) {
      return setEstado({ tipo: "lote", lote: previo.lote, generando: false });
    }

    const control = new AbortController();
    generar(m, control.signal);
    return () => control.abort();
  }, [generar]);

  function otroFeed() {
    if (!marca) return;
    sessionStorage.removeItem(CLAVE_FEED);
    generar(marca);
  }

  const lote = estado.tipo === "lote" ? estado.lote : null;
  const generando = estado.tipo === "cargando" || (estado.tipo === "lote" && estado.generando);

  return (
    <main className="min-h-0 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1080px] px-4 pt-5 pb-16">
        <div className="flex items-center justify-between gap-3">
          <Pasos actual={2} />
          <Link href="/crear/marca" className={`${buttonVariants({ variant: "ghost", size: "xs" })} text-foreground`}>
            <ArrowLeft data-icon="inline-start" />
            <span className="hidden sm:inline">Volver a tu marca</span>
          </Link>
        </div>

        {/* Hasta que llega el plan, la pantalla de espera */}
        {(estado.tipo === "cargando" || (lote && !lote.plan)) && (
          <div className="flex min-h-[60svh] flex-col items-start justify-center">
            <h1 className={`${s.seCocina} display max-w-[16ch]`}>
              Armando <span className={s.it}>tu</span> primer feed.
            </h1>
            <p className="lead mt-4 max-w-[34em] text-base">
              Posteos, un carrusel, historias y un reel con la voz, los colores y las letras de{" "}
              {marca?.identidad.nombre ?? "tu marca"}. Tarda alrededor de un minuto, y cada pieza aparece apenas está.
            </p>
            <div className="mt-8">{lote && <Armando que="feed" mensaje={lote.mensaje} />}</div>
          </div>
        )}

        {estado.tipo === "sin-marca" && (
          <div className={`${s.entra} flex min-h-[60svh] flex-col items-start justify-center`}>
            <h1 className="display max-w-[16ch]">
              Primero, armemos <span className={s.it}>tu</span> marca.
            </h1>
            <p className="lead mt-4 max-w-[34em] text-base">El feed se hace con tu identidad: los colores, las letras y la voz.</p>
            <Link href="/crear" className={`${buttonVariants({ size: "lg" })} mt-8`}>
              Empezar por la entrevista
              <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
        )}

        {estado.tipo === "error" && (
          <div className={`${s.entra} flex min-h-[60svh] flex-col items-start justify-center`}>
            <h1 className="display max-w-[16ch]">Algo se trabó.</h1>
            <p className="lead mt-4 max-w-[34em] text-base">{estado.mensaje} Tu marca sigue guardada.</p>
            <Button size="lg" className="mt-8" onClick={() => marca && generar(marca)}>
              Probar de nuevo
            </Button>
          </div>
        )}

        {lote?.plan && lote.kit && marca && (
          <>
            <div className={`${s.entra} mt-10 mb-8 flex flex-wrap items-end justify-between gap-4`}>
              <h1 className="display max-w-[18ch]">
                El feed de <span className={s.it}>{marca.identidad.nombre}</span>.
              </h1>
              <Button variant="outline" size="sm" onClick={otroFeed} disabled={generando}>
                <RotateCcw data-icon="inline-start" />
                Generar otro
              </Button>
            </div>
            <Feed lote={lote} kit={lote.kit} plan={lote.plan} identidad={marca.identidad} logos={marca.logos} generando={generando} />
          </>
        )}
      </div>
    </main>
  );
}
