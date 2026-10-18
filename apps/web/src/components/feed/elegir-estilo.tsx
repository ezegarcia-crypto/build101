"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cargarFuentes } from "@/components/brandbook/identidad";
import { puedoArrancarSolo } from "@/lib/freno";
import type { Brief } from "@/lib/ia/brief";
import { componerPieza, type Lienzo, semilla } from "@/lib/ia/contenidos/componer";
import type { ItemPlan, Pieza } from "@/lib/ia/contenidos/esquemas";
import { ESTILOS, type IdEstilo, ID_ESTILOS } from "@/lib/ia/contenidos/estilos";
import type { Kit } from "@/lib/ia/contenidos/kit";

// Antes de generar el feed, la persona elige el estilo de diseño viendo cómo queda con SU marca:
// colores, letras y logo reales, compuestos en el momento por el mismo compositor del feed, sin IA.
// Los textos son de ejemplo (y lo dicen): no los escribió la IA. Las dos fotos sí son de la IA, de su
// rubro (POST /api/contenidos/muestra, ~USD 0,01 cada una, una sola vez por marca); mientras llegan,
// su lugar es una forma de color. Así ve el estilo de verdad antes de gastar en el feed entero.

const TRATO = {
  vos: { titular: "Así se ve *tu* titular", cta: "Escribinos" },
  tu: { titular: "Así se ve *tu* titular", cta: "Escríbenos" },
  usted: { titular: "Así se ve *su* titular", cta: "Escríbanos" },
} as const;

/** Un id cuya variante cae en el encuadre que queremos mostrar (el compositor varía por id e idea). */
function idCon(prefijo: string, cumple: (v: number) => boolean): string {
  for (let i = 1; i < 50; i++) if (cumple(semilla(`${prefijo}${i}ejemplo`))) return `${prefijo}${i}`;
  return `${prefijo}1`;
}

function item(id: string, formato: ItemPlan["formato"]): ItemPlan {
  return { id, formato, pilar: "Ejemplo", objetivo: "conocer", idea: "ejemplo", dia: "lunes", hora: "10:00" };
}

const base = { estado: "aprobada" as const, observaciones: [], imagenes: [], intentos: 1 };

type Fotos = { a?: string | null; b?: string | null };

/** Tres piezas de muestra: dos posteos con las fotos de su rubro (encuadres distintos) y uno tipográfico. */
function muestras(kit: Kit): Pieza[] {
  const t = TRATO[kit.voz.trato] ?? TRATO.vos;
  const fotoA = idCon("f", (v) => v % 6 === 0);
  const fotoB = idCon("g", (v) => v % 6 === 1);
  const tipografico = idCon("t", (v) => v % 2 === 1);
  const post = (id: string, titular: string, bajada: string | null, cta: string | null, tipo: "foto" | "tipografica"): Pieza => ({
    ...base,
    id,
    formato: "post",
    plan: item(id, "post"),
    contenido: { titular, bajada, cta, caption: "", hashtags: [], visual: { tipo, escena: null, alt: "Pieza de ejemplo" }, datos_a_confirmar: [] },
  });
  return [
    post(fotoA, t.titular, `Texto de ejemplo: el real lo escribe la IA con la voz de ${kit.nombre}.`, t.cta, "foto"),
    post(tipografico, "Una frase *corta* que se quede", null, null, "tipografica"),
    post(fotoB, "Otro *encuadre* de ejemplo", null, null, "foto"),
  ];
}

function lienzosDe(kit: Kit, fotos: Fotos): Lienzo[] {
  const [a, tipo, b] = muestras(kit);
  return [
    componerPieza(a, kit, fotos.a ? { portada: fotos.a } : {})[0],
    componerPieza(tipo, kit)[0],
    componerPieza(b, kit, fotos.b ? { portada: fotos.b } : {})[0],
  ];
}

// ── Las dos fotos de su rubro (POST /api/contenidos/muestra) ──────────────────────────────────
// Una sola vez por marca: se piden en paralelo, se achican y quedan guardadas en la sesión.
// Si una falla, no se reintenta sola: esa pieza queda con la forma de color. Si la página se recarga en
// bucle, el freno deja de pedirlas (lib/freno.ts) y la muestra queda con las formas de color.

const CLAVE_MUESTRA = "brandia:muestra-estilos";
const pedidos = new Map<string, Promise<string | null>>();

/** Achica la foto (llega de 1024×1536) para que la sesión no se llene: alcanza para la vista previa. */
function achicar(url: string): Promise<string> {
  return new Promise((listo) => {
    const img = new Image();
    img.onload = () => {
      const lienzo = document.createElement("canvas");
      lienzo.width = 540;
      lienzo.height = Math.round((img.height / img.width) * 540);
      lienzo.getContext("2d")?.drawImage(img, 0, 0, lienzo.width, lienzo.height);
      listo(lienzo.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => listo(url);
    img.src = url;
  });
}

function leerGuardadas(clave: string): Fotos {
  try {
    const g = JSON.parse(sessionStorage.getItem(CLAVE_MUESTRA) ?? "null");
    return g?.clave === clave ? g.fotos : {};
  } catch {
    return {};
  }
}

function useFotosDeMuestra(clave: string, cuerpo: { brief: Brief; identidad: unknown }): Fotos {
  const [fotos, setFotos] = useState<Fotos>({});
  useEffect(() => {
    const guardadas = leerGuardadas(clave);
    setFotos(guardadas);
    let vivo = true;
    const faltan = (["a", "b"] as const).filter((c) => !guardadas[c] && !pedidos.has(`${clave}|${c}`));
    if (faltan.length && !puedoArrancarSolo("contenidos-muestra")) return;
    for (const cual of ["a", "b"] as const) {
      if (guardadas[cual]) continue;
      const k = `${clave}|${cual}`;
      if (!pedidos.has(k)) {
        pedidos.set(
          k,
          fetch("/api/contenidos/muestra", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ...cuerpo, cual }),
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((d: { url?: string } | null) => (d?.url ? achicar(d.url) : null))
            .catch(() => null),
        );
      }
      pedidos.get(k)?.then((url) => {
        if (!vivo) return;
        setFotos((f) => {
          const nuevas = { ...f, [cual]: url };
          try {
            if (url) sessionStorage.setItem(CLAVE_MUESTRA, JSON.stringify({ clave, fotos: { ...leerGuardadas(clave), [cual]: url } }));
          } catch {}
          return nuevas;
        });
      });
    }
    return () => {
      vivo = false;
    };
    // El cuerpo cambia solo si cambia la marca, y eso ya lo dice la clave
    // biome-ignore lint/correctness/useExhaustiveDependencies: ver arriba
  }, [clave]);
  return fotos;
}

export function ElegirEstilo({
  kit,
  clave,
  brief,
  identidad,
  onElegir,
}: {
  kit: Kit;
  /** Identifica la marca: las fotos de muestra se piden una sola vez por marca */
  clave: string;
  brief: Brief;
  identidad: unknown;
  onElegir: (estilo: IdEstilo) => void;
}) {
  useEffect(() => {
    for (const u of kit.fuentes) cargarFuentes(u);
  }, [kit.fuentes]);

  const fotos = useFotosDeMuestra(clave, { brief, identidad });
  const sacando = fotos.a === undefined || fotos.b === undefined;

  const opciones = useMemo(
    () =>
      ID_ESTILOS.map((estilo) => {
        try {
          return { estilo, lienzos: lienzosDe({ ...kit, estilo }, fotos) };
        } catch {
          return { estilo, lienzos: [] };
        }
      }),
    [kit, fotos],
  );

  return (
    <>
      <p aria-live="polite" className="mb-4 flex min-h-5 items-center gap-2 text-sm text-muted-foreground">
        {sacando ? (
          <>
            <span className="size-2 animate-pulse rounded-full bg-foreground" aria-hidden="true" />
            La IA está sacando dos fotos de tu rubro para la muestra. Ya podés elegir si querés.
          </>
        ) : fotos.a || fotos.b ? (
          "Fotos de tu rubro hechas por la IA. Los textos son de ejemplo."
        ) : null}
      </p>
    <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
      {opciones.map(({ estilo, lienzos }) => (
        <button
          key={estilo}
          type="button"
          onClick={() => onElegir(estilo)}
          className="group flex flex-col rounded-[14px] border bg-card p-3 text-left transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(.22,.8,.24,1)] hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-4"
        >
          <div className="relative grid grid-cols-3 gap-1.5 sm:gap-2">
            {lienzos.map((l, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[4px] [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
                style={{ aspectRatio: `${l.ancho} / ${l.alto}` }}
                dangerouslySetInnerHTML={{ __html: l.svg }}
              />
            ))}
            <span className="label absolute top-1.5 left-1.5 rounded-full bg-background/90 px-2 py-0.5 text-[10px] text-foreground">
              Ejemplo
            </span>
          </div>
          <div className="mt-4 flex flex-1 flex-col gap-1 px-1">
            <h2 className="text-2xl">{ESTILOS[estilo].nombre}</h2>
            <p className="text-sm text-muted-foreground">{ESTILOS[estilo].descripcion}</p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Quiero este
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </button>
      ))}
    </div>
    </>
  );
}
