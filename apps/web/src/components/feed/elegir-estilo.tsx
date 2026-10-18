"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useMemo } from "react";

import { cargarFuentes } from "@/components/brandbook/identidad";
import { componerPieza, type Lienzo, semilla } from "@/lib/ia/contenidos/componer";
import type { ItemPlan, Pieza } from "@/lib/ia/contenidos/esquemas";
import { ESTILOS, type IdEstilo, ID_ESTILOS } from "@/lib/ia/contenidos/estilos";
import type { Kit } from "@/lib/ia/contenidos/kit";

// Antes de generar el feed, la persona elige el estilo de diseño viendo cómo queda con SU marca:
// colores, letras y logo reales, compuestos en el momento por el mismo compositor del feed, sin IA.
// Los textos son de ejemplo (y lo dicen) y las fotos van como una forma de color: nada de esto
// puede parecer generado por la IA, porque no lo es. Así no se gasta en un estilo que no le gusta.

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

/** Tres piezas de muestra: un posteo con foto, uno tipográfico y una lámina de carrusel. */
function muestras(kit: Kit): Pieza[] {
  const t = TRATO[kit.voz.trato] ?? TRATO.vos;
  const conFoto = idCon("f", (v) => v % 6 === 0);
  const tipografico = idCon("t", (v) => v % 2 === 1);
  return [
    {
      ...base,
      id: conFoto,
      formato: "post",
      plan: item(conFoto, "post"),
      contenido: {
        titular: t.titular,
        bajada: `Texto de ejemplo: el real lo escribe la IA con la voz de ${kit.nombre}.`,
        cta: t.cta,
        caption: "",
        hashtags: [],
        visual: { tipo: "foto", escena: null, alt: "Ejemplo de posteo con foto" },
        datos_a_confirmar: [],
      },
    },
    {
      ...base,
      id: tipografico,
      formato: "post",
      plan: item(tipografico, "post"),
      contenido: {
        titular: "Una frase *corta* que se quede",
        bajada: null,
        cta: null,
        caption: "",
        hashtags: [],
        visual: { tipo: "tipografica", escena: null, alt: "Ejemplo de posteo tipográfico" },
        datos_a_confirmar: [],
      },
    },
    {
      ...base,
      id: "c1",
      formato: "carrusel",
      plan: item("c1", "carrusel"),
      contenido: {
        laminas: [
          { titular: "Portada de *ejemplo*", texto: null },
          { titular: "Un paso, *bien* claro", texto: "Texto de ejemplo para la lámina del carrusel." },
          { titular: "Cierre", texto: null },
        ],
        caption: "",
        hashtags: [],
        visual: { tipo: "tipografica", escena: null, alt: "Ejemplo de carrusel" },
        datos_a_confirmar: [],
      },
    },
  ];
}

function lienzosDe(kit: Kit): Lienzo[] {
  const [foto, tipo, carrusel] = muestras(kit);
  return [componerPieza(foto, kit)[0], componerPieza(tipo, kit)[0], componerPieza(carrusel, kit)[1]];
}

export function ElegirEstilo({ kit, onElegir }: { kit: Kit; onElegir: (estilo: IdEstilo) => void }) {
  useEffect(() => {
    for (const u of kit.fuentes) cargarFuentes(u);
  }, [kit.fuentes]);

  const opciones = useMemo(
    () =>
      ID_ESTILOS.map((estilo) => {
        try {
          return { estilo, lienzos: lienzosDe({ ...kit, estilo }) };
        } catch {
          return { estilo, lienzos: [] };
        }
      }),
    [kit],
  );

  return (
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
  );
}
