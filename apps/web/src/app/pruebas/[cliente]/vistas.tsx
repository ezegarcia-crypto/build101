"use client";

import { Component, type ReactNode, useState } from "react";

import { Brandbook, Controles } from "@/components/brandbook/brandbook";
import { Direcciones } from "@/components/brandbook/direcciones";
import type { DireccionConControl, IdentidadIA, LogoElegido, PropuestaLogo } from "@/components/brandbook/identidad";
import { Feed, type Lote } from "@/components/feed/feed";
import { VistaWeb } from "@/components/web/vista-web";
import type { Plan } from "@/lib/ia/contenidos/esquemas";
import type { Kit } from "@/lib/ia/contenidos/kit";
import { ESTRATEGIAS } from "@/lib/ia/nombres";
import type { FichaWeb } from "@/lib/ia/web/ficha-web";
import type { Web } from "@/lib/ia/web/web";

// Lo que generó una prueba, dibujado con los mismos componentes de la app: se ve como lo vio la persona.
// Ninguno pide nada a la IA; solo muestran lo guardado. Los nombres van en tarjetas propias porque el
// componente de la app (Nombres) los pide solo al aparecer.

export type NombreGuardado = { nombre: string; estrategia?: string; de_donde_sale?: string; historia?: string };
export type Mensaje = { rol: "persona" | "brandia"; texto: string };

export type Resumen = {
  chat: Mensaje[];
  nombres: NombreGuardado[];
  direcciones: { lista: DireccionConControl[]; nombre: string | null } | null;
  marca: { identidad: IdentidadIA; logos: PropuestaLogo[] } | null;
  feeds: Lote[];
  productos: string[];
  web: { web: Web; ficha: FichaWeb; fotos: Record<string, string>; versiones: number } | null;
};

/** Si un paso viejo o fallido no se puede dibujar, se avisa y el resto del panel sigue */
class SiFalla extends Component<{ children: ReactNode }, { fallo: boolean }> {
  state = { fallo: false };
  static getDerivedStateFromError() {
    return { fallo: true };
  }
  render() {
    return this.state.fallo ? (
      <p className="rounded-lg border bg-card px-5 py-4 text-[0.9375rem]">
        Esto no se pudo dibujar. Está entero en el historial de abajo.
      </p>
    ) : (
      this.props.children
    );
  }
}

function Seccion({ titulo, detalle, children }: { titulo: string; detalle?: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl">{titulo}</h2>
        {detalle && <p className="lead">{detalle}</p>}
      </div>
      <SiFalla>{children}</SiFalla>
    </section>
  );
}

const veces = (n: number, una: string, varias: string) => `${n} ${n === 1 ? una : varias}`;

export function Vistas({ r }: { r: Resumen }) {
  const feed = r.feeds.at(-1);
  const hayAlgo =
    r.chat.length || r.nombres.length || r.direcciones || r.marca || feed || r.productos.length || r.web;
  if (!hayAlgo) return null;

  return (
    <div className="flex flex-col gap-14">
      {r.chat.length > 0 && (
        <Seccion titulo="La entrevista" detalle="La última versión de la conversación.">
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:p-6">
            {r.chat.map((m, i) => (
              <p
                // biome-ignore lint/suspicious/noArrayIndexKey: la conversación no cambia de orden
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[0.9375rem] ${
                  m.rol === "persona" ? "self-end bg-primary text-primary-foreground" : "self-start bg-muted"
                }`}
              >
                {m.texto}
              </p>
            ))}
          </div>
        </Seccion>
      )}

      {r.nombres.length > 0 && (
        <Seccion titulo="Los nombres" detalle={`${veces(r.nombres.length, "nombre propuesto", "nombres propuestos")}.`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {r.nombres.map((n) => (
              <div key={n.nombre} className="flex flex-col gap-2 rounded-lg border bg-card p-5">
                {n.estrategia && <span className="label">{ESTRATEGIAS[n.estrategia as keyof typeof ESTRATEGIAS] ?? n.estrategia}</span>}
                <span className="font-display text-2xl">{n.nombre}</span>
                {n.de_donde_sale && <p className="text-[0.9375rem]">{n.de_donde_sale}</p>}
                {n.historia && <p className="text-[0.875rem] text-muted-foreground">{n.historia}</p>}
              </div>
            ))}
          </div>
        </Seccion>
      )}

      {r.direcciones && (
        <Seccion
          titulo="Los tres caminos"
          detalle={
            r.marca?.identidad.direccion
              ? `Eligió el ${r.marca.identidad.direccion.id} · ${r.marca.identidad.direccion.nombre}. Acá los botones no hacen nada.`
              : "Acá los botones no hacen nada."
          }
        >
          <Direcciones direcciones={r.direcciones.lista} nombreMarca={r.direcciones.nombre} onElegir={() => {}} />
        </Seccion>
      )}

      {r.marca && (
        <Seccion titulo="La marca" detalle="El brandbook con sus logos, como lo vio la persona.">
          <BrandbookVisto identidad={r.marca.identidad} logos={r.marca.logos} />
          {r.marca.identidad.comprobaciones && <Controles comprobaciones={r.marca.identidad.comprobaciones} />}
        </Seccion>
      )}

      {feed?.kit && feed.plan && r.marca && (
        <Seccion
          titulo="El contenido para redes"
          detalle={
            r.feeds.length > 1
              ? `El último de ${veces(r.feeds.length, "feed", "feeds")} que se generaron (los otros están en el historial).`
              : "Posteos, carrusel, historias y reel, con la marca aplicada."
          }
        >
          <Feed
            lote={feed}
            kit={feed.kit as Kit}
            plan={feed.plan as Plan}
            identidad={r.marca.identidad}
            logo={r.marca.logos[0] ?? null}
            generando={false}
          />
        </Seccion>
      )}

      {r.productos.length > 0 && (
        <Seccion titulo="Los productos (BranderIA)" detalle={`${veces(r.productos.length, "foto", "fotos")} con la marca impresa.`}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {r.productos.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                <img src={url} alt="" loading="lazy" className="aspect-square w-full rounded-lg border object-cover" />
              </a>
            ))}
          </div>
        </Seccion>
      )}

      {r.web && r.marca && (
        <Seccion
          titulo="La web"
          detalle={
            r.web.versiones > 1
              ? `La última de ${r.web.versiones} versiones (la primera y cada cambio por chat están en el historial).`
              : undefined
          }
        >
          <div className="h-[70svh] overflow-y-auto overscroll-contain rounded-[14px] border">
            <VistaWeb web={r.web.web} ficha={r.web.ficha} identidad={r.marca.identidad} fotos={r.web.fotos} />
          </div>
        </Seccion>
      )}
    </div>
  );
}

/** El brandbook guardado: se pueden recorrer los logos como en la app, sin guardar nada */
function BrandbookVisto({ identidad, logos }: { identidad: IdentidadIA; logos: PropuestaLogo[] }) {
  const [elegido, setElegido] = useState<LogoElegido>(logos.length ? 0 : "simbolo");
  return <Brandbook identidad={identidad} logos={logos} elegido={elegido} onElegir={setElegido} />;
}
