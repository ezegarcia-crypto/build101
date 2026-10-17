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
import type { Feed as FeedIA } from "@/lib/ia/contenidos";

import s from "../entrevista/entrevista.module.css";
import { Feed } from "./feed";

// Paso 3 · Tu contenido. Con la ficha y la identidad, la IA arma el primer feed:
// posteos e historias con imágenes en la paleta de la marca (POST /api/contenidos, de Eze).
// Queda guardado junto con su identidad: si se recarga la página, no se vuelve a generar.

export const CLAVE_FEED = "brandia:feed";

type Marca = { ficha: string; brief: Brief; identidad: IdentidadIA; logos: PropuestaLogo[] };

type Estado =
  | { tipo: "cargando" }
  | { tipo: "sin-marca" }
  | { tipo: "generando" }
  | { tipo: "listo"; feed: FeedIA }
  | { tipo: "error"; mensaje: string };

function leer<T>(clave: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(clave) ?? "null");
  } catch {
    return null;
  }
}

// Para reconocer si el feed guardado es de esta misma marca
const huella = (m: Marca) => `${m.ficha}|${m.identidad.nombre}|${m.identidad.paleta.map((c) => c.hex).join()}`;

export function GenerarFeed() {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [marca, setMarca] = useState<Marca | null>(null);

  const generar = useCallback(async (m: Marca, senal?: AbortSignal) => {
    setEstado({ tipo: "generando" });
    document.querySelector("main")?.scrollTo({ top: 0 });
    try {
      const res = await fetch("/api/contenidos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief: m.brief, identidad: m.identidad }),
        signal: senal,
      });
      const datos = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(datos?.error || "No pudimos conectar con BrandIA.");
      const feed = datos as FeedIA;
      try {
        sessionStorage.setItem(CLAVE_FEED, JSON.stringify({ huella: huella(m), feed }));
      } catch {
        // Las imágenes pesan: si no entran, el feed se ve igual, solo que no queda guardado
      }
      setEstado({ tipo: "listo", feed });
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

    const feed = leer<{ huella: string; feed: FeedIA }>(CLAVE_FEED);
    if (feed?.huella === huella(m)) return setEstado({ tipo: "listo", feed: feed.feed });

    const control = new AbortController();
    generar(m, control.signal);
    return () => control.abort();
  }, [generar]);

  function otroFeed() {
    if (!marca) return;
    sessionStorage.removeItem(CLAVE_FEED);
    generar(marca);
  }

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

        {(estado.tipo === "cargando" || estado.tipo === "generando") && (
          <div className="flex min-h-[60svh] flex-col items-start justify-center">
            <h1 className={`${s.seCocina} display max-w-[16ch]`}>
              Armando <span className={s.it}>tu</span> primer feed.
            </h1>
            <p className="lead mt-4 max-w-[34em] text-base">
              Posteos e historias con la voz, los colores y las letras de {marca?.identidad.nombre ?? "tu marca"}. Tarda
              menos de un minuto.
            </p>
            <div className="mt-8">{estado.tipo === "generando" && <Armando que="feed" />}</div>
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

        {estado.tipo === "listo" && marca && (
          <>
            <div className={`${s.entra} mt-10 mb-8 flex flex-wrap items-end justify-between gap-4`}>
              <h1 className="display max-w-[18ch]">
                El feed de <span className={s.it}>{marca.identidad.nombre}</span>.
              </h1>
              <Button variant="outline" size="sm" onClick={otroFeed}>
                <RotateCcw data-icon="inline-start" />
                Generar otro
              </Button>
            </div>
            <Feed feed={estado.feed} identidad={marca.identidad} logos={marca.logos} />
          </>
        )}
      </div>
    </main>
  );
}
