"use client";

import { Button, buttonVariants } from "@build101/ui/components/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Armando } from "@/components/entrevista/armando";
import { CLAVE_FICHA } from "@/components/entrevista/ficha";
import { Pasos } from "@/components/pasos";

import s from "../entrevista/entrevista.module.css";
import { Brandbook } from "./brandbook";
import { CLAVE_IDENTIDAD, type Identidad } from "./identidad";

// Paso 2 · Tu marca. Toma la ficha de la entrevista, le pide la identidad a la IA y muestra el brandbook.
// La identidad queda guardada junto con su ficha: si se recarga la página, no se vuelve a generar.

type Estado =
  | { tipo: "cargando" }
  | { tipo: "sin-ficha" }
  | { tipo: "generando" }
  | { tipo: "lista"; identidad: Identidad }
  | { tipo: "en-construccion" }
  | { tipo: "error" };

function leer(clave: string) {
  try {
    return sessionStorage.getItem(clave);
  } catch {
    return null;
  }
}

export function GenerarMarca() {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  const generar = useCallback(async (ficha: string, senal?: AbortSignal) => {
    setEstado({ tipo: "generando" });
    try {
      const res = await fetch("/api/identidad", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ficha: JSON.parse(ficha) }),
        signal: senal,
      });
      if (res.status === 404) return setEstado({ tipo: "en-construccion" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const identidad = (await res.json()) as Identidad;
      if (!identidad?.nombre || !identidad.paleta?.length || !identidad.tipografias) throw new Error("Identidad incompleta");
      sessionStorage.setItem(CLAVE_IDENTIDAD, JSON.stringify({ ficha, identidad }));
      setEstado({ tipo: "lista", identidad });
    } catch (e) {
      if ((e as Error).name !== "AbortError") setEstado({ tipo: "error" });
    }
  }, []);

  useEffect(() => {
    const ficha = leer(CLAVE_FICHA);
    if (!ficha) return setEstado({ tipo: "sin-ficha" });
    try {
      const guardada = JSON.parse(leer(CLAVE_IDENTIDAD) ?? "null");
      if (guardada?.ficha === ficha && guardada.identidad) return setEstado({ tipo: "lista", identidad: guardada.identidad });
    } catch {}
    const control = new AbortController();
    generar(ficha, control.signal);
    return () => control.abort();
  }, [generar]);

  const reintentar = () => {
    const ficha = leer(CLAVE_FICHA);
    if (ficha) generar(ficha);
  };

  const volver = (
    <Link href="/crear" className={`${buttonVariants({ variant: "ghost", size: "xs" })} text-foreground`}>
      <ArrowLeft data-icon="inline-start" />
      <span className="hidden sm:inline">Volver a la entrevista</span>
    </Link>
  );

  return (
    <main className="min-h-0 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1080px] px-4 pt-5 pb-16">
        <div className="flex items-center justify-between gap-3">
          <Pasos actual={1} />
          {volver}
        </div>

        {(estado.tipo === "cargando" || estado.tipo === "generando") && (
          <div className="flex min-h-[60svh] flex-col items-start justify-center">
            <h1 className={`${s.seCocina} display max-w-[16ch]`}>
              Estamos armando <span className={s.it}>tu</span> marca.
            </h1>
            <p className="lead mt-4 max-w-[34em] text-base">
              Con lo que nos contaste elegimos el nombre, la paleta, las tipografías y el logo. Puede tardar un minuto.
            </p>
            <div className="mt-8">{estado.tipo === "generando" && <Armando que="identidad" />}</div>
          </div>
        )}

        {estado.tipo === "sin-ficha" && (
          <div className={`${s.entra} flex min-h-[60svh] flex-col items-start justify-center`}>
            <h1 className="display max-w-[16ch]">
              Primero, contanos <span className={s.it}>tu</span> negocio.
            </h1>
            <p className="lead mt-4 max-w-[34em] text-base">Para armar tu marca necesitamos la entrevista.</p>
            <Link href="/crear" className={`${buttonVariants({ size: "lg" })} mt-8`}>
              Ir a la entrevista
              <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
        )}

        {estado.tipo === "en-construccion" && (
          <div className={`${s.entra} flex min-h-[60svh] flex-col items-start justify-center`}>
            <p className="label">En construcción</p>
            <h1 className="display mt-3 max-w-[16ch]">
              Tu brandbook está <span className={s.it}>en camino</span>.
            </h1>
            <p className="lead mt-4 max-w-[34em] text-base">
              Ya tenemos tu ficha. La parte que genera la identidad la estamos terminando: muy pronto, acá.
            </p>
          </div>
        )}

        {estado.tipo === "error" && (
          <div className={`${s.entra} flex min-h-[60svh] flex-col items-start justify-center`}>
            <h1 className="display max-w-[16ch]">Algo se trabó.</h1>
            <p className="lead mt-4 max-w-[34em] text-base">
              No pudimos armar tu marca esta vez. Tu ficha sigue guardada: probá de nuevo.
            </p>
            <Button size="lg" className="mt-8" onClick={reintentar}>
              Probar de nuevo
            </Button>
          </div>
        )}

        {estado.tipo === "lista" && (
          <>
            <div className={`${s.entra} mt-10 mb-8`}>
              <h1 className="display">
                Esta es <span className={s.it}>{estado.identidad.nombre}</span>.
              </h1>
              {estado.identidad.nombres_alternativos && estado.identidad.nombres_alternativos.length > 0 && (
                <p className="lead mt-3 text-base">
                  Otros nombres posibles: {estado.identidad.nombres_alternativos.join(" · ")}
                </p>
              )}
            </div>
            <Brandbook identidad={estado.identidad} />
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" disabled>
                Ver mis contenidos
                <ArrowRight data-icon="inline-end" />
              </Button>
              <span className="text-sm text-muted-foreground">Siguiente paso · en construcción</span>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
