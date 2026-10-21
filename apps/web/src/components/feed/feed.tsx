"use client";

import { Button } from "@build101/ui/components/button";
import { ChevronLeft, ChevronRight, CircleAlert, Download, Heart, ImageOff, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { bajar, slug, zip } from "@/components/brandbook/archivos";
import { cargarFuentes, type IdentidadIA, type PropuestaLogo, svgSeguro } from "@/components/brandbook/identidad";
import { Armando } from "@/components/entrevista/armando";
import { type Colores, coloresDeMarca, componerPieza, type Imagenes, type Lienzo } from "@/lib/ia/contenidos/componer";
import type { ItemPlan, Pieza, Plan } from "@/lib/ia/contenidos/esquemas";
import { FORMATOS } from "@/lib/ia/contenidos/formatos";
import type { Kit } from "@/lib/ia/contenidos/kit";

import s from "../entrevista/entrevista.module.css";
import { Calendario } from "./calendario";
import { archivosDePieza } from "./descargar-feed";
import f from "./feed.module.css";
import { Instagram } from "./instagram";
import { fechaDePieza, fechaLocal, type InfoMes } from "./mes";

// El feed de la marca, como se vería su perfil. Cada pieza la dibuja el compositor del motor
// (componerPieza, sin IA) en SVG con los colores, las letras y el isotipo del cliente: el lienzo
// es del cliente (retirada visual), ni el naranja ni el logo de BrandIA. Lo que es de la app
// (avisos para revisar, datos a confirmar, el progreso) va con los colores de BrandIA.

/** El lote tal como se va armando con los eventos de POST /api/contenidos/lote. */
export type Lote = {
  kit: Kit | null;
  plan: Plan | null;
  piezas: Record<string, Pieza>;
  /** id de la pieza → clave → data URL */
  imagenes: Record<string, Imagenes>;
  /** dónde falló (id de pieza, o id/clave de imagen, o "lote") → mensaje */
  fallas: Record<string, string>;
  mensaje: string;
  fin: { segundos: number; imagenes: number } | null;
  /** Solo en el mes completo del suscriptor (lo arma el servidor de a una semana, ver mes.ts) */
  mes?: InfoMes;
};

const SIN_IMAGENES: Imagenes = {};
const OBJETIVO = { conocer: "Conocer", confiar: "Confiar", vender: "Vender", comunidad: "Comunidad" } as const;
const FORMULA = {
  dato: "Dato",
  curiosidad: "Curiosidad",
  dolor: "Dolor",
  aspiracional: "Aspiracional",
  detras_de_escena: "Detrás de escena",
  contraste: "Contraste",
} as const;

/** Los textos traen *palabra* para el color de acento: fuera del lienzo, solo el texto. */
const limpio = (t: string) => t.replace(/\*/g, "");
const usuarioDe = (nombre: string) => nombre.toLowerCase().replace(/\s+/g, "");

// ── Los lienzos ──────────────────────────────────────────────────────────────────────────────

function SVG({ l }: { l: Lienzo }) {
  // El SVG trae su ancho fijo (1080 px); con viewBox se adapta al ancho de la tarjeta
  return (
    <div
      className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
      style={{ aspectRatio: `${l.ancho} / ${l.alto}` }}
      dangerouslySetInnerHTML={{ __html: l.svg }}
    />
  );
}

/** Carrusel: las láminas se deslizan de a una, con puntos y flechas. */
function Carrusel({ lienzos, c }: { lienzos: Lienzo[]; c: Colores }) {
  const pista = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);

  const ir = (n: number) => {
    const el = pista.current;
    if (el) el.scrollTo({ left: el.clientWidth * Math.max(0, Math.min(lienzos.length - 1, n)), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={pista}
        className={`${f.desliza} flex snap-x snap-mandatory overflow-x-auto`}
        onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {lienzos.map((l) => (
          <div key={l.clave} className="w-full shrink-0 snap-center">
            <SVG l={l} />
          </div>
        ))}
      </div>
      {i > 0 && (
        <button type="button" aria-label="Lámina anterior" onClick={() => ir(i - 1)} className="absolute top-1/2 left-2 grid size-8 -translate-y-1/2 place-items-center rounded-full shadow" style={{ background: c.fondo, color: c.texto }}>
          <ChevronLeft className="size-4" />
        </button>
      )}
      {i < lienzos.length - 1 && (
        <button type="button" aria-label="Lámina siguiente" onClick={() => ir(i + 1)} className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full shadow" style={{ background: c.fondo, color: c.texto }}>
          <ChevronRight className="size-4" />
        </button>
      )}
      <div className="flex justify-center gap-1.5 py-3" aria-hidden="true">
        {lienzos.map((l, n) => (
          <span key={l.clave} className="size-1.5 rounded-full transition-opacity duration-300" style={{ background: c.texto, opacity: n === i ? 0.9 : 0.25 }} />
        ))}
      </div>
    </div>
  );
}

/** Historias y reel: los lienzos pasan solos, cada uno lo que dura, como en la red. */
function Secuencia({ lienzos, onCambio, etiqueta }: { lienzos: Lienzo[]; onCambio?: (i: number) => void; etiqueta: string }) {
  const [i, setI] = useState(0);
  const [andando, setAndando] = useState(true);
  const segundos = lienzos[i]?.segundos ?? 5;

  // Si la persona pidió menos movimiento, arranca quieta: pasa con las flechas
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAndando(false);
  }, []);

  useEffect(() => onCambio?.(i), [i, onCambio]);

  useEffect(() => {
    if (!andando) return;
    const t = setTimeout(() => setI((n) => (n + 1) % lienzos.length), segundos * 1000);
    return () => clearTimeout(t);
  }, [andando, i, segundos, lienzos.length]);

  const ir = (n: number) => setI((n + lienzos.length) % lienzos.length);

  return (
    <div className="relative overflow-hidden" role="group" aria-roledescription="secuencia" aria-label={etiqueta}>
      {/* Todos los lienzos apilados: se ve el actual, los demás se funden */}
      <div className="grid">
        {lienzos.map((l, n) => (
          <div key={l.clave} className={`${f.capa} [grid-area:1/1]`} style={{ opacity: n === i ? 1 : 0 }} aria-hidden={n !== i}>
            <SVG l={l} />
          </div>
        ))}
      </div>
      {/* Las barritas de arriba, como en las historias */}
      <div className="absolute inset-x-3 top-3 flex gap-1" aria-hidden="true">
        {lienzos.map((l, n) => (
          <span key={l.clave} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
            <span
              key={n === i ? `${i}-${andando}` : n}
              className={`block h-full origin-left bg-white ${n === i && andando ? f.llenar : ""}`}
              style={{
                transform: n < i || (n === i && !andando) ? "scaleX(1)" : n > i ? "scaleX(0)" : undefined,
                animationDuration: `${segundos}s`,
              }}
            />
          </span>
        ))}
      </div>
      {/* Tocar a la izquierda vuelve, a la derecha avanza */}
      <button type="button" aria-label="Anterior" onClick={() => ir(i - 1)} className="absolute inset-y-0 left-0 w-1/3" />
      <button type="button" aria-label="Siguiente" onClick={() => ir(i + 1)} className="absolute inset-y-0 right-0 w-2/3" />
      <button
        type="button"
        aria-label={andando ? "Pausar" : "Reproducir"}
        onClick={() => setAndando((a) => !a)}
        className="absolute top-7 right-3 grid size-8 place-items-center rounded-full bg-black/45 text-white"
      >
        {andando ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
      </button>
    </div>
  );
}

// ── Una pieza ────────────────────────────────────────────────────────────────────────────────

function Caption({ texto, hashtags, usuario }: { texto: string; hashtags: string[]; usuario: string }) {
  return (
    <div className="text-[14px] leading-relaxed">
      <p className="whitespace-pre-line">
        <b className="font-semibold">{usuario}</b> {texto}
      </p>
      {hashtags.length > 0 && <p className="mt-2 opacity-70">{hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ")}</p>}
    </div>
  );
}

function Guion({ r, actual }: { r: Extract<Pieza, { formato: "reel" }>["contenido"]; actual: number }) {
  return (
    <div className="flex flex-col gap-4 text-[14px] leading-relaxed">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-60">Tres ganchos para probar</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {r.ganchos.map((g, n) => (
            <li key={n}>
              <span className="opacity-60">{FORMULA[g.formula] ?? g.formula} · </span>
              {limpio(g.texto)}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-60">Guion</p>
        <ol className="mt-2 flex flex-col gap-2">
          {r.escenas.map((e, n) => (
            <li key={n} className="rounded-[4px] px-2 py-1.5 transition-opacity duration-300" style={{ opacity: n === actual ? 1 : 0.55 }}>
              <p>
                <span className="tabular-nums opacity-60">{e.segundos} s · </span>
                <b className="font-semibold">{limpio(e.texto_en_pantalla)}</b>
              </p>
              {e.voz_en_off && <p className="italic">“{e.voz_en_off}”</p>}
              <p className="opacity-60">{e.toma}</p>
            </li>
          ))}
        </ol>
      </div>
      <p>
        <span className="opacity-60">Giro: </span>
        {r.giro}
      </p>
      <p>
        <span className="opacity-60">Música: </span>
        {r.musica}
      </p>
    </div>
  );
}

/** Lo que la app le avisa a la persona sobre la pieza: con los colores de BrandIA, no del cliente. */
function Avisos({ pieza, fallasImagen }: { pieza: Pieza; fallasImagen: number }) {
  const revisar = pieza.estado === "revisar" ? [...pieza.observaciones].sort((a, b) => Number(b.gravedad === "blocker") - Number(a.gravedad === "blocker")) : [];
  const datos = pieza.contenido.datos_a_confirmar;
  if (!revisar.length && !datos.length && !fallasImagen) return null;
  return (
    <div className="flex flex-col gap-3 border-t bg-card p-4 text-[13px] leading-relaxed text-card-foreground">
      {revisar.length > 0 && (
        <div>
          <p className="flex items-center gap-1.5 font-semibold">
            <CircleAlert className="size-4" /> Revisá esto antes de publicar
          </p>
          <ul className="mt-1.5 list-disc pl-5 text-muted-foreground">
            {revisar.map((o, n) => (
              <li key={n}>{o.detalle}</li>
            ))}
          </ul>
        </div>
      )}
      {datos.length > 0 && (
        <div>
          <p className="font-semibold">A confirmar por vos</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {datos.map((d, n) => (
              <li key={n} className="rounded-[4px] border px-2.5 py-1 text-muted-foreground">
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}
      {fallasImagen > 0 && (
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <ImageOff className="size-4" />
          {fallasImagen === 1 ? "Una imagen no salió" : `${fallasImagen} imágenes no salieron`}: quedó el color de la marca.
        </p>
      )}
    </div>
  );
}

function Cabecera({ item, c, inicio }: { item: ItemPlan; c: Colores; inicio?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 pt-4 pb-3">
      <p className="text-[11px] font-semibold tracking-[0.14em] uppercase">
        {FORMATOS[item.formato].nombre} <span className="opacity-60">· {item.pilar}</span>
      </p>
      <p className="text-[12px] opacity-60" style={{ color: c.texto }}>
        {inicio ? fechaDePieza(inicio, item).toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "numeric" }) : item.dia} ·{" "}
        {item.hora}
      </p>
    </div>
  );
}

/** Me gusta y bajar la pieza: la fila de acciones abajo de la imagen, como en Instagram */
function Acciones({
  meGusta,
  onMeGusta,
  onBajar,
  c,
}: {
  meGusta: boolean;
  onMeGusta?: () => void;
  onBajar: () => Promise<void>;
  c: Colores;
}) {
  const [bajando, setBajando] = useState(false);
  return (
    <div className="flex items-center gap-1 px-2 pt-2">
      {onMeGusta && (
        <button
          type="button"
          onClick={onMeGusta}
          aria-pressed={meGusta}
          aria-label={meGusta ? "Sacar el me gusta" : "Me gusta"}
          className="grid size-10 place-items-center rounded-full transition-transform duration-300 ease-brandia active:scale-90"
        >
          <Heart
            className={`size-6 transition-[transform,fill] duration-300 ease-brandia ${meGusta ? "scale-110" : ""}`}
            style={{ color: meGusta ? c.principal : c.texto, fill: meGusta ? c.principal : "transparent" }}
            aria-hidden="true"
          />
        </button>
      )}
      <button
        type="button"
        disabled={bajando}
        onClick={async () => {
          setBajando(true);
          try {
            await onBajar();
          } finally {
            setBajando(false);
          }
        }}
        aria-label="Descargar esta pieza"
        className="grid size-10 place-items-center rounded-full disabled:opacity-50"
      >
        <Download className={`size-5 ${bajando ? "animate-bounce" : ""}`} style={{ color: c.texto }} aria-hidden="true" />
      </button>
      {meGusta && <span className="text-[13px] font-semibold">Te gusta</span>}
    </div>
  );
}

function TarjetaPieza({ item, pieza, kit, imagenes, fallas, usuario, n, meGusta, onMeGusta, inicio, generando }: {
  item: ItemPlan;
  /** En el mes completo: el lunes en que empieza, para mostrar la fecha exacta */
  inicio?: string;
  /** Si el mes todavía se está armando (una pieza que falta puede estar en camino) */
  generando?: boolean;
  pieza?: Pieza;
  kit: Kit;
  imagenes: Imagenes;
  fallas: Record<string, string>;
  usuario: string;
  /** El orden de la pieza en el plan (para nombrar la descarga) */
  n: number;
  meGusta: boolean;
  onMeGusta?: () => void;
}) {
  const c = useMemo(() => coloresDeMarca(kit), [kit]);
  // Se vuelve a dibujar solo cuando cambian la pieza o sus imágenes
  const lienzos = useMemo(() => (pieza ? componerPieza(pieza, kit, imagenes) : []), [pieza, kit, imagenes]);
  const [escena, setEscena] = useState(0);
  const alto = item.formato === "historia" || item.formato === "reel";
  const fallo = fallas[item.id];
  const fallasImagen = Object.keys(fallas).filter((k) => k.startsWith(`${item.id}/`)).length;

  return (
    <article
      id={`pieza-${item.id}`}
      className={`${s.entra} flex scroll-mt-6 flex-col overflow-hidden rounded-[14px]`}
      style={{ background: c.fondo, color: c.texto, boxShadow: `0 0 0 1px ${c.texto}1f` }}
    >
      <Cabecera item={item} c={c} inicio={inicio} />

      {!pieza ? (
        // Todavía no llegó: su lugar, con la idea del plan
        <div
          className={`flex flex-col justify-end gap-2 p-5 ${fallo || (inicio && !generando) ? "" : "animate-pulse"}`}
          style={{ aspectRatio: alto ? "9 / 16" : "4 / 5", background: c.apoyo, color: c.texto }}
        >
          <p className="text-[15px] leading-snug" style={{ fontFamily: `"${kit.tipografias.titulos.familia}", serif` }}>
            {item.idea}
          </p>
          <p className="text-[12px] opacity-70">
            {fallo
              ? inicio
                ? "Esta pieza no salió. Podés reintentarla arriba."
                : "Esta pieza no salió. Probá generar otro feed."
              : inicio && !generando
                ? "Esta pieza quedó sin armar."
                : inicio
                  ? "En camino: se arma con su semana."
                  : "Escribiendo…"}
          </p>
        </div>
      ) : (
        <>
          {pieza.formato === "post" && <SVG l={lienzos[0]} />}
          {pieza.formato === "carrusel" && <Carrusel lienzos={lienzos} c={c} />}
          {pieza.formato === "historia" && <Secuencia lienzos={lienzos} etiqueta={`Historia: ${item.idea}`} />}
          {pieza.formato === "reel" && <Secuencia lienzos={lienzos} onCambio={setEscena} etiqueta={`Reel: ${item.idea}`} />}

          <Acciones
            meGusta={meGusta}
            onMeGusta={onMeGusta}
            c={c}
            onBajar={async () => {
              const archivos = await archivosDePieza(n, item, pieza, lienzos);
              const carpeta = archivos[0]?.nombre.split("/")[0] ?? "pieza";
              bajar(zip(archivos), `${slug(kit.nombre)}-${carpeta}.zip`);
            }}
          />

          <div className="flex flex-1 flex-col gap-3 px-4 pt-2 pb-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-60">
              Para {OBJETIVO[item.objetivo].toLowerCase()}
            </p>
            {pieza.formato === "reel" && <Guion r={pieza.contenido} actual={escena} />}
            {pieza.formato !== "historia" && (
              <Caption texto={pieza.contenido.caption} hashtags={pieza.contenido.hashtags} usuario={usuario} />
            )}
            {pieza.formato === "historia" && <p className="text-[14px] leading-relaxed">{item.idea}</p>}
          </div>
          <Avisos pieza={pieza} fallasImagen={fallasImagen} />
        </>
      )}
    </article>
  );
}

// ── El feed completo ─────────────────────────────────────────────────────────────────────────

function Avatar({ kit, logo, c }: { kit: Kit; logo: PropuestaLogo | null; c: Colores }) {
  if (logo) return <img src={logo.imagen} alt="" className="size-full rounded-full bg-white object-contain" />;
  return (
    <span className="grid size-full place-items-center rounded-full" style={{ background: c.fondo, color: c.principal }}>
      {kit.isotipo_svg ? (
        <span aria-hidden="true" className="size-3/5 [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svgSeguro(kit.isotipo_svg) }} />
      ) : (
        <span style={{ fontFamily: `"${kit.tipografias.titulos.familia}", serif` }}>{kit.nombre[0]}</span>
      )}
    </span>
  );
}

/** Las cuatro semanas del mes y en qué está cada una */
function Semanas({ mes }: { mes: InfoMes }) {
  const texto = { pendiente: "en espera", generando: "armándose", lista: "lista", fallo: "no salió" } as const;
  return (
    <ol className="flex flex-wrap gap-1.5" aria-label="Las semanas del mes">
      {mes.semanas.map((s) => (
        <li
          key={s.semana}
          className={`rounded-full border px-3 py-1 text-xs ${s.estado === "lista" ? "bg-foreground text-background" : "text-muted-foreground"} ${s.estado === "generando" ? "animate-pulse" : ""}`}
        >
          Semana {s.semana} · {texto[s.estado]}
        </li>
      ))}
    </ol>
  );
}

/** El mes completo del suscriptor: cuánto va, que se puede cerrar la pestaña y reintentar lo que no salió */
function ProgresoMes({ lote, plan, mes, onReintentar }: { lote: Lote; plan: Plan; mes: InfoMes; onReintentar?: () => Promise<void> }) {
  const [reintentando, setReintentando] = useState(false);
  const total = plan.piezas.length;
  const listas = plan.piezas.filter((p) => lote.piezas[p.id]).length;
  const pedidas = Object.values(lote.piezas).reduce((n, p) => n + p.imagenes.length, 0);
  const llegaron = Object.values(lote.imagenes).reduce((n, i) => n + Object.keys(i).length, 0);
  const noSalieron = Object.keys(lote.fallas).filter((k) => k !== "plan").length;

  if (mes.terminado) {
    return (
      <div className={`${s.entra} flex flex-col gap-3`}>
        <Semanas mes={mes} />
        <p className="text-sm text-muted-foreground">
          Tu mes: {listas} de {total} piezas y {lote.fin?.imagenes ?? llegaron} imágenes
          {lote.fin?.segundos ? `, en ${Math.max(1, Math.round(lote.fin.segundos / 60))} minutos` : ""}. Todo con tu marca.
        </p>
        {noSalieron > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-[14px] border bg-card p-4 text-sm">
            <ImageOff className="size-4" aria-hidden="true" />
            <span className="text-muted-foreground">
              {noSalieron === 1 ? "Una pieza o imagen no salió." : `${noSalieron} piezas o imágenes no salieron.`}
            </span>
            {mes.reintentable && onReintentar ? (
              <Button
                size="sm"
                variant="outline"
                disabled={reintentando}
                onClick={async () => {
                  setReintentando(true);
                  try {
                    await onReintentar();
                  } finally {
                    setReintentando(false);
                  }
                }}
              >
                {reintentando ? "Pidiéndolas de nuevo…" : "Reintentar lo que no salió"}
              </Button>
            ) : (
              <span className="text-muted-foreground">Ya las probamos varias veces: quedó el color de la marca.</span>
            )}
          </div>
        )}
      </div>
    );
  }
  const avance = (listas / total) * 0.5 + (pedidas ? (llegaron / pedidas) * 0.5 : 0);
  return (
    <div className={`${s.entra} flex flex-col gap-3 rounded-[14px] border bg-card p-4`}>
      <Armando que="feed" mensaje={lote.mensaje} />
      <Semanas mes={mes} />
      <p className="text-sm text-muted-foreground tabular-nums">
        {listas} de {total} piezas · {llegaron} de {pedidas || "…"} imágenes
      </p>
      <div className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="h-full origin-left bg-foreground transition-transform duration-500" style={{ transform: `scaleX(${Math.max(0.04, avance)})` }} />
      </div>
      <p className="text-sm text-muted-foreground">
        Cada semana aparece apenas está. Podés recargar o cerrar la pestaña: BrandIA lo sigue armando.
      </p>
    </div>
  );
}

/** Mientras el motor trabaja: en qué está y cuánto falta. Con los colores de la app. */
function Progreso({ lote, plan, generando }: { lote: Lote; plan: Plan; generando: boolean }) {
  const total = plan.piezas.length;
  const listas = plan.piezas.filter((p) => lote.piezas[p.id] || lote.fallas[p.id]).length;
  const pedidas = Object.values(lote.piezas).reduce((n, p) => n + p.imagenes.length, 0);
  const llegaron = Object.values(lote.imagenes).reduce((n, i) => n + Object.keys(i).length, 0);
  const fallidas = Object.keys(lote.fallas).filter((k) => k.includes("/")).length;
  // Las piezas pesan la mitad y las imágenes la otra mitad (estimación para la barra)
  const avance = (listas / total) * 0.5 + (pedidas ? ((llegaron + fallidas) / pedidas) * 0.5 : 0);

  if (!generando) {
    return (
      <p className={`${s.entra} text-sm text-muted-foreground`}>
        {total} piezas y {lote.fin?.imagenes ?? llegaron} imágenes
        {lote.fin?.segundos ? `, en ${lote.fin.segundos} segundos` : ""}. Todo con tu marca.
      </p>
    );
  }
  return (
    <div className={`${s.entra} flex flex-col gap-3 rounded-[14px] border bg-card p-4`}>
      <Armando que="feed" mensaje={lote.mensaje} />
      <p className="text-sm text-muted-foreground tabular-nums">
        {listas} de {total} piezas · {llegaron} de {pedidas || "…"} imágenes
      </p>
      <div className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="h-full origin-left bg-foreground transition-transform duration-500" style={{ transform: `scaleX(${Math.max(0.04, avance)})` }} />
      </div>
    </div>
  );
}

/** Todo lo que la persona tiene que mirar antes de publicar, junto. Los datos a confirmar se
 * responden acá (o se marcan "No va") y la IA reescribe las piezas que los necesitaban. */
function Pendientes({ lote, plan, kit, onCorregidas }: {
  lote: Lote;
  plan: Plan;
  kit: Kit;
  onCorregidas: (contenidos: Record<string, Pieza["contenido"]>) => void;
}) {
  const piezas = plan.piezas.map((p) => lote.piezas[p.id]).filter(Boolean);
  const revisar = piezas.filter((p) => p.estado === "revisar");
  const datos = [...new Set(piezas.flatMap((p) => p.contenido.datos_a_confirmar))];
  // dato → lo que escribió la persona; null = "No va"
  const [respuestas, setRespuestas] = useState<Record<string, string | null>>({});
  const [aplicando, setAplicando] = useState(false);
  const [aviso, setAviso] = useState("");

  const listas = datos.filter((d) => d in respuestas && (respuestas[d] === null || respuestas[d]!.trim()));
  const responder = (d: string, valor: string | null) => setRespuestas((r) => ({ ...r, [d]: valor }));

  async function aplicar() {
    const enviar = listas.map((d) => ({ dato: d, valor: respuestas[d]?.trim() || null }));
    const afectadas = piezas.filter((p) => p.contenido.datos_a_confirmar.some((d) => listas.includes(d)));
    setAplicando(true);
    setAviso("");
    try {
      const r = await fetch("/api/contenidos/completar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kit: { nombre: kit.nombre, voz: { trato: kit.voz.trato, tono: kit.voz.tono, reglas: kit.voz.reglas } },
          piezas: afectadas.map((p) => ({ id: p.id, formato: p.formato, idea: p.plan.idea, contenido: p.contenido })),
          respuestas: enviar,
        }),
      });
      if (!r.ok) throw new Error();
      const { piezas: nuevas } = (await r.json()) as { piezas: ({ id: string; contenido: Pieza["contenido"] } | { id: string; error: string })[] };
      const bien = Object.fromEntries(nuevas.flatMap((n) => ("contenido" in n ? [[n.id, n.contenido]] : [])));
      const mal = nuevas.length - Object.keys(bien).length;
      onCorregidas(bien);
      setRespuestas((r) => Object.fromEntries(Object.entries(r).filter(([d]) => !listas.includes(d))));
      const n = Object.keys(bien).length;
      setAviso(
        `${n === 1 ? "Actualizamos una pieza" : `Actualizamos ${n} piezas`} con tus datos.${mal ? ` ${mal === 1 ? "Una no se pudo" : `${mal} no se pudieron`} cambiar: probá de nuevo.` : ""}`,
      );
    } catch {
      setAviso("No pudimos aplicar tus datos. Probá de nuevo.");
    } finally {
      setAplicando(false);
    }
  }

  if (!revisar.length && !datos.length) {
    return aviso ? <p className={`${s.entra} text-sm text-muted-foreground`}>{aviso} Ya no queda nada por confirmar.</p> : null;
  }
  return (
    <section className={`${s.entra} rounded-[14px] border bg-card p-6 text-card-foreground`}>
      <p className="label">Antes de publicar</p>
      {datos.length > 0 && (
        <div className="mt-3">
          <p className="font-semibold">Datos que tenés que confirmar</p>
          <p className="text-sm text-muted-foreground">
            BrandIA no inventa precios, plazos ni testimonios: los dejó marcados «[a confirmar]». Escribí cada dato, o marcá «No va», y
            BrandIA reescribe las piezas que lo usan.
          </p>
          <ul className="mt-4 flex flex-col gap-4">
            {datos.map((d, i) => {
              const sacar = respuestas[d] === null;
              return (
                <li key={d} className="flex flex-col gap-2">
                  <label htmlFor={`dato-${i}`} className="text-sm leading-snug">
                    {d}
                  </label>
                  <div className="flex min-w-0 gap-2">
                    <input
                      id={`dato-${i}`}
                      type="text"
                      disabled={sacar || aplicando}
                      value={sacar ? "" : (respuestas[d] ?? "")}
                      onChange={(e) => responder(d, e.target.value)}
                      placeholder={sacar ? "No va: se saca de la pieza" : "Escribilo acá"}
                      className="h-10 min-w-0 flex-1 rounded-[4px] border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                    />
                    <button
                      type="button"
                      aria-pressed={sacar}
                      disabled={aplicando}
                      onClick={() => responder(d, sacar ? "" : null)}
                      className={`h-10 shrink-0 rounded-full border px-4 text-sm transition-colors duration-300 ease-brandia ${sacar ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      No va
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={aplicar} disabled={!listas.length || aplicando}>
              {aplicando ? "Aplicando tus datos…" : listas.length > 1 ? `Aplicar ${listas.length} datos` : "Aplicar a las piezas"}
            </Button>
            {aplicando ? (
              <Armando que="feed" mensaje="Reescribiendo las piezas con tus datos" />
            ) : (
              <span className="text-sm text-muted-foreground" role="status">
                {aviso || "Lo que dejes vacío sigue marcado para después."}
              </span>
            )}
          </div>
        </div>
      )}
      {revisar.length > 0 && (
        <div className="mt-6">
          <p className="font-semibold">
            {revisar.length === 1 ? "Una pieza para revisar" : `${revisar.length} piezas para revisar`}
          </p>
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {revisar.map((p) => (
              <li key={p.id}>
                <a href={`#pieza-${p.id}`} className="text-foreground underline underline-offset-2">
                  {FORMATOS[p.formato].nombre}: {p.plan.idea}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** Todo el feed en un .zip: una carpeta por pieza con sus imágenes y su texto */
function BajarFeed({ lote, kit, plan, generando }: { lote: Lote; kit: Kit; plan: Plan; generando: boolean }) {
  const [bajando, setBajando] = useState(false);
  const [error, setError] = useState(false);
  if (generando) return null;
  async function todo() {
    setBajando(true);
    setError(false);
    try {
      const archivos = [];
      for (const [i, item] of plan.piezas.entries()) {
        const pieza = lote.piezas[item.id];
        if (!pieza) continue;
        archivos.push(...(await archivosDePieza(i + 1, item, pieza, componerPieza(pieza, kit, lote.imagenes[item.id] ?? {}))));
      }
      bajar(zip(archivos), `${slug(kit.nombre)}-contenido-para-redes.zip`);
    } catch {
      setError(true);
    } finally {
      setBajando(false);
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" onClick={todo} disabled={bajando}>
        <Download data-icon="inline-start" className={bajando ? "animate-bounce" : ""} />
        {bajando ? "Armando tus imágenes…" : "Descargar todo el contenido"}
      </Button>
      <span className="text-sm text-muted-foreground">
        {error ? "No pudimos armar el archivo. Probá de nuevo." : "Cada pieza en PNG, lista para subir, con su texto para copiar."}
      </span>
    </div>
  );
}

export function Feed({ lote: llegado, kit, plan, identidad, logo, generando, meGusta, onMeGusta, onReintentar, onMesCompleto }: {
  lote: Lote;
  kit: Kit;
  plan: Plan;
  identidad: IdentidadIA;
  /** El logo que eligió la persona (null: el símbolo) */
  logo: PropuestaLogo | null;
  generando: boolean;
  /** Las piezas marcadas con ♥ (sin `onMeGusta`, por ejemplo en /pruebas, no se muestra el ♥) */
  meGusta?: string[];
  onMeGusta?: (id: string) => void;
  /** Mes completo: vuelve a pedir lo que no salió */
  onReintentar?: () => Promise<void>;
  /** Para un suscriptor que está viendo una semana suelta: arma el mes completo */
  onMesCompleto?: () => void;
}) {
  const c = useMemo(() => coloresDeMarca(kit), [kit]);
  const titulos = `"${kit.tipografias.titulos.familia}", serif`;
  const usuario = usuarioDe(kit.nombre);

  // Los textos que la IA reescribió con los datos que confirmó la persona ("Antes de publicar").
  // Se guardan en la pestaña para que no se pierdan al recargar; el resto de la pieza queda igual.
  const claveCorregidas = `brandia:completadas:${kit.nombre}|${plan.objetivo}`;
  const [corregidas, setCorregidas] = useState<Record<string, Pieza["contenido"]>>({});
  useEffect(() => {
    try {
      setCorregidas(JSON.parse(sessionStorage.getItem(claveCorregidas) ?? "{}"));
    } catch {}
  }, [claveCorregidas]);
  const corregir = (nuevas: Record<string, Pieza["contenido"]>) =>
    setCorregidas((antes) => {
      const todas = { ...antes, ...nuevas };
      try {
        sessionStorage.setItem(claveCorregidas, JSON.stringify(todas));
      } catch {}
      return todas;
    });
  const lote = useMemo(() => {
    if (!Object.keys(corregidas).length) return llegado;
    const piezas = { ...llegado.piezas };
    for (const [id, contenido] of Object.entries(corregidas)) {
      if (piezas[id]) piezas[id] = { ...piezas[id], contenido } as Pieza;
    }
    return { ...llegado, piezas };
  }, [llegado, corregidas]);

  useEffect(() => {
    for (const u of kit.fuentes) cargarFuentes(u);
  }, [kit.fuentes]);

  const inicio = lote.mes?.inicio;
  const grupos = useMemo(() => {
    if (!inicio) return [{ semana: 1, titulo: null, fechas: "", items: plan.piezas }];
    const corta = (d: Date) => d.toLocaleDateString("es-UY", { day: "numeric", month: "short" });
    return [...new Set(plan.piezas.map((p) => p.semana ?? 1))]
      .sort((a, b) => a - b)
      .map((semana) => {
        const lunes = fechaLocal(inicio);
        lunes.setDate(lunes.getDate() + (semana - 1) * 7);
        const domingo = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + 6);
        return {
          semana,
          titulo: `Semana ${semana}`,
          fechas: `${corta(lunes)} al ${corta(domingo)}`,
          items: plan.piezas.filter((p) => (p.semana ?? 1) === semana),
        };
      });
  }, [inicio, plan.piezas]);

  return (
    <div className="flex flex-col gap-4">
      {lote.mes ? (
        <ProgresoMes lote={lote} plan={plan} mes={lote.mes} onReintentar={onReintentar} />
      ) : (
        <Progreso lote={lote} plan={plan} generando={generando} />
      )}

      {/* Cómo quedaría como perfil de Instagram, dentro de un celular */}
      <Instagram
        lote={lote}
        kit={kit}
        plan={plan}
        c={c}
        usuario={usuario}
        bio={identidad.voz.ejemplos.bio_instagram}
        avatar={<Avatar kit={kit} logo={logo} c={c} />}
      />

      {/* El perfil y el plan del mes */}
      <section
        className={`${s.entra} rounded-[14px] p-6 sm:p-10`}
        style={{ background: c.fondo, color: c.texto, fontFamily: `"${kit.tipografias.texto.familia}", sans-serif` }}
      >
        <div className="flex items-center gap-5">
          <div className="size-20 shrink-0 rounded-full p-[3px] sm:size-24" style={{ background: c.principal }}>
            <div className="size-full rounded-full p-[2px]" style={{ background: c.fondo }}>
              <Avatar kit={kit} logo={logo} c={c} />
            </div>
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{usuario}</p>
            <p className="text-2xl leading-tight" style={{ fontFamily: titulos }}>
              {kit.nombre}
            </p>
          </div>
        </div>
        <p className="mt-5 max-w-[34em] text-[15px] leading-relaxed whitespace-pre-line">{identidad.voz.ejemplos.bio_instagram}</p>

        <div className="mt-8 border-t pt-6" style={{ borderColor: `${c.texto}26` }}>
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase opacity-70">El plan del mes</p>
          <p className="mt-2 max-w-[34em] text-xl leading-snug" style={{ fontFamily: titulos }}>
            {plan.objetivo}
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {plan.pilares.map((p) => (
              <li key={p.nombre} className="rounded-[4px] p-3" style={{ boxShadow: `inset 0 0 0 1px ${c.texto}26` }}>
                <p className="font-semibold">{p.nombre}</p>
                <p className="mt-1 text-[13px] leading-snug opacity-75">{p.para_que}</p>
              </li>
            ))}
          </ul>
          <Calendario plan={plan} piezas={lote.piezas} c={c} titulos={titulos} inicio={lote.mes?.inicio} onMesCompleto={onMesCompleto} />
        </div>
      </section>

      <Pendientes lote={lote} plan={plan} kit={kit} onCorregidas={corregir} />
      <BajarFeed lote={lote} kit={kit} plan={plan} generando={generando} />

      {/* Las piezas, en el orden del plan. En el mes completo, una tanda por semana */}
      {grupos.map((g) => (
        <section key={g.semana} aria-label={g.titulo ?? "Las piezas"} className="flex flex-col gap-4">
          {g.titulo && (
            <h2 className="mt-4 flex flex-wrap items-baseline gap-x-3 text-2xl">
              {g.titulo}
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "inherit" }}>
                {g.fechas}
              </span>
            </h2>
          )}
          <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ fontFamily: `"${kit.tipografias.texto.familia}", sans-serif` }}>
            {g.items.map((item) => (
              <TarjetaPieza
                key={item.id}
                n={plan.piezas.indexOf(item) + 1}
                meGusta={meGusta?.includes(item.id) ?? false}
                onMeGusta={onMeGusta ? () => onMeGusta(item.id) : undefined}
                item={item}
                pieza={lote.piezas[item.id]}
                kit={kit}
                imagenes={lote.imagenes[item.id] ?? SIN_IMAGENES}
                fallas={lote.fallas}
                usuario={usuario}
                inicio={lote.mes?.inicio}
                generando={generando}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
