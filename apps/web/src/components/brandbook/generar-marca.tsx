"use client";

import { Button, buttonVariants } from "@build101/ui/components/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Armando } from "@/components/entrevista/armando";
import { CLAVE_FICHA } from "@/components/entrevista/ficha";
import { Pasos } from "@/components/pasos";
import { MENSAJE_FRENO, puedoArrancarSolo } from "@/lib/freno";
import type { Brief } from "@/lib/ia/brief";

import s from "../entrevista/entrevista.module.css";
import { Brandbook, Controles } from "./brandbook";
import { Direcciones } from "./direcciones";
import { Nombres } from "./nombres";
import {
  CLAVE_DIRECCIONES,
  CLAVE_IDENTIDAD,
  type DireccionConControl,
  type IdentidadIA,
  type PropuestaLogo,
} from "./identidad";

// Paso 2 · Tu marca. Con la ficha de la entrevista:
//   0. la IA propone nombres con su trasfondo (en paralelo con las direcciones) y la persona elige uno;
//   1. la IA propone 3 direcciones visuales y la persona elige una;
//   2. con esa, la IA arma la identidad y dibuja 3 logos (en paralelo);
//   3. se muestra el brandbook.
// Todo queda guardado junto con su ficha: si se recarga la página, no se vuelve a generar.

type Ficha = { texto: string; brief: Brief };

type Estado =
  | { tipo: "cargando" }
  | { tipo: "sin-ficha" }
  | { tipo: "buscando" }
  | { tipo: "elegir"; direcciones: DireccionConControl[] }
  | { tipo: "armando"; direcciones: DireccionConControl[]; direccion: DireccionConControl }
  | { tipo: "lista"; direcciones: DireccionConControl[]; identidad: IdentidadIA; logos: PropuestaLogo[] }
  | { tipo: "error"; mensaje: string; reintentar: () => void };

function leer<T>(clave: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(clave) ?? "null");
  } catch {
    return null;
  }
}

function guardar(clave: string, valor: unknown) {
  try {
    sessionStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false; // sin lugar (los logos pesan): se sigue sin guardar
  }
}

async function pedir<T>(ruta: string, cuerpo: unknown, senal?: AbortSignal): Promise<T> {
  const res = await fetch(ruta, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(cuerpo),
    signal: senal,
  });
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(datos?.error || "No pudimos conectar con BrandIA.");
  return datos as T;
}

export function GenerarMarca() {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [nombreElegido, setNombreElegido] = useState<string | null>(null);

  const buscarDirecciones = useCallback(async (f: Ficha, senal?: AbortSignal) => {
    setEstado({ tipo: "buscando" });
    try {
      const { direcciones } = await pedir<{ direcciones: DireccionConControl[] }>(
        "/api/direcciones",
        { brief: f.brief },
        senal,
      );
      guardar(CLAVE_DIRECCIONES, { ficha: f.texto, direcciones });
      setEstado({ tipo: "elegir", direcciones });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setEstado({ tipo: "error", mensaje: (e as Error).message, reintentar: () => buscarDirecciones(f) });
    }
  }, []);

  const elegir = useCallback(
    async (f: Ficha, direcciones: DireccionConControl[], direccion: DireccionConControl, nombre: string | null) => {
      setEstado({ tipo: "armando", direcciones, direccion });
      document.querySelector("main")?.scrollTo({ top: 0 });
      // El nombre elegido pasa a ser el de la marca: lo usan los textos del brandbook y los logos
      const brief = nombre ? { ...f.brief, marca: { ...f.brief.marca, nombre } } : f.brief;
      const cuerpo = { brief, direccion };
      const [identidad, logos] = await Promise.allSettled([
        pedir<{ identidad: IdentidadIA }>("/api/identidad", cuerpo),
        pedir<{ propuestas: PropuestaLogo[] }>("/api/logo", cuerpo),
      ]);
      if (identidad.status === "rejected") {
        return setEstado({
          tipo: "error",
          mensaje: (identidad.reason as Error).message,
          reintentar: () => elegir(f, direcciones, direccion, nombre),
        });
      }
      // Si los logos completos fallan, el brandbook sigue con el símbolo de la identidad
      const propuestas = logos.status === "fulfilled" ? logos.value.propuestas : [];
      const lista = { ficha: f.texto, identidad: identidad.value.identidad, logos: propuestas };
      if (!guardar(CLAVE_IDENTIDAD, lista)) guardar(CLAVE_IDENTIDAD, { ...lista, logos: [] });
      setEstado({ tipo: "lista", direcciones, identidad: lista.identidad, logos: propuestas });
    },
    [],
  );

  useEffect(() => {
    const texto = sessionStorage.getItem(CLAVE_FICHA);
    const brief = leer<Brief>(CLAVE_FICHA);
    if (!texto || !brief) return setEstado({ tipo: "sin-ficha" });
    const f = { texto, brief };
    setFicha(f);

    const dirs = leer<{ ficha: string; direcciones: DireccionConControl[] }>(CLAVE_DIRECCIONES);
    const ident = leer<{ ficha: string; identidad: IdentidadIA; logos: PropuestaLogo[] }>(CLAVE_IDENTIDAD);
    if (dirs?.ficha === texto && ident?.ficha === texto) {
      return setEstado({ tipo: "lista", direcciones: dirs.direcciones, identidad: ident.identidad, logos: ident.logos });
    }
    if (dirs?.ficha === texto) return setEstado({ tipo: "elegir", direcciones: dirs.direcciones });

    // Si la página se recarga sola en loop, no se vuelve a pedir: queda el botón para hacerlo a mano
    if (!puedoArrancarSolo("direcciones")) {
      return setEstado({ tipo: "error", mensaje: MENSAJE_FRENO, reintentar: () => buscarDirecciones(f) });
    }
    const control = new AbortController();
    buscarDirecciones(f, control.signal);
    return () => control.abort();
  }, [buscarDirecciones]);

  function otroCamino(direcciones: DireccionConControl[]) {
    sessionStorage.removeItem(CLAVE_IDENTIDAD);
    setEstado({ tipo: "elegir", direcciones });
    document.querySelector("main")?.scrollTo({ top: 0 });
  }

  const nombreMarca = ficha?.brief.marca.nombre ?? null;

  return (
    <main className="min-h-0 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1080px] px-4 pt-5 pb-16">
        <div className="flex items-center justify-between gap-3">
          <Pasos actual={1} />
          <Link href="/crear" className={`${buttonVariants({ variant: "ghost", size: "xs" })} text-foreground`}>
            <ArrowLeft data-icon="inline-start" />
            <span className="hidden sm:inline">Volver a la entrevista</span>
          </Link>
        </div>

        {estado.tipo === "cargando" && (
          <div className="flex min-h-[60svh] flex-col items-start justify-center">
            <h1 className={`${s.seCocina} display max-w-[16ch]`}>
              Pensando <span className={s.it}>tu</span> marca.
            </h1>
          </div>
        )}

        {/* Un solo lugar para los nombres: siguen a la vista mientras se piensan los caminos y al elegir */}
        {ficha && (estado.tipo === "buscando" || estado.tipo === "elegir") && (
          <Nombres brief={ficha.brief} ficha={ficha.texto} onElegir={setNombreElegido} />
        )}

        {estado.tipo === "buscando" && (
          <div className="mt-16">
            <h2 className={`${s.seCocina} display max-w-[18ch] text-[clamp(2rem,1.4rem+2vw,3rem)]`}>
              Pensando <span className={s.it}>tres</span> caminos para tu marca.
            </h2>
            <p className="lead mt-3 max-w-[34em] text-base">
              Mientras elegís el nombre, armamos tres direcciones distintas: colores, letras y estilo. Vos elegís.
              Tarda unos 30 segundos.
            </p>
            <div className="mt-6">
              <Armando que="direcciones" />
            </div>
          </div>
        )}

        {estado.tipo === "elegir" && (
          <>
            <div className={`${s.entra} mt-16 mb-8`}>
              <h1 className="display max-w-[18ch] text-[clamp(2rem,1.4rem+2vw,3rem)]">
                Elegí <span className={s.it}>tu</span> camino.
              </h1>
              <p className="lead mt-3 max-w-[38em] text-base">
                Tres formas de contar tu marca. Tocá la que más se parezca a lo que imaginás.
              </p>
            </div>
            <Direcciones
              direcciones={estado.direcciones}
              nombreMarca={nombreElegido ?? nombreMarca}
              onElegir={(d) => ficha && elegir(ficha, estado.direcciones, d, nombreElegido)}
            />
          </>
        )}

        {estado.tipo === "armando" && (
          <div className="flex min-h-[60svh] flex-col items-start justify-center">
            <p className="label">Elegiste · {estado.direccion.nombre}</p>
            <h1 className={`${s.seCocina} display mt-3 max-w-[16ch]`}>
              Estamos armando <span className={s.it}>tu</span> marca.
            </h1>
            <p className="lead mt-4 max-w-[34em] text-base">
              La esencia, la voz, los logos y el brandbook completo. Tarda unos 30 segundos.
            </p>
            <div className="mt-8">
              <Armando que="identidad" />
            </div>
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

        {estado.tipo === "error" && (
          <div className={`${s.entra} flex min-h-[60svh] flex-col items-start justify-center`}>
            <h1 className="display max-w-[16ch]">Algo se trabó.</h1>
            <p className="lead mt-4 max-w-[34em] text-base">{estado.mensaje} Tu ficha sigue guardada.</p>
            <Button size="lg" className="mt-8" onClick={estado.reintentar}>
              Probar de nuevo
            </Button>
          </div>
        )}

        {estado.tipo === "lista" && (
          <>
            <div className={`${s.entra} mt-10 mb-8 flex flex-wrap items-end justify-between gap-4`}>
              <h1 className="display">
                Esta es <span className={s.it}>{estado.identidad.nombre}</span>.
              </h1>
              <Button variant="outline" size="sm" onClick={() => otroCamino(estado.direcciones)}>
                Probar otro camino
              </Button>
            </div>
            <Brandbook identidad={estado.identidad} logos={estado.logos} />
            <div className="mt-4">
              <Controles comprobaciones={estado.identidad.comprobaciones} />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/crear/contenido" className={buttonVariants({ size: "lg" })}>
                Ver mis contenidos
                <ArrowRight data-icon="inline-end" />
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
