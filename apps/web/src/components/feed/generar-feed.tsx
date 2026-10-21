"use client";

import { Button, buttonVariants } from "@build101/ui/components/button";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BotonWeb } from "@/components/boton-web";
import {
  CLAVE_IDENTIDAD,
  type IdentidadIA,
  logoDeMarca,
  type MarcaGuardada,
  type PropuestaLogo,
} from "@/components/brandbook/identidad";
import { Armando } from "@/components/entrevista/armando";
import { CLAVE_FICHA } from "@/components/entrevista/ficha";
import { Pasos } from "@/components/pasos";
import { puedoArrancarSolo } from "@/lib/freno";
import type { Brief } from "@/lib/ia/brief";
import type { Imagenes } from "@/lib/ia/contenidos/componer";
import { ESTILO_POR_DEFECTO, ESTILOS, type IdEstilo, ID_ESTILOS } from "@/lib/ia/contenidos/estilos";
import { armarKit, type IdentidadEntrada } from "@/lib/ia/contenidos/kit";
import type { Evento } from "@/lib/ia/contenidos/motor";

import s from "../entrevista/entrevista.module.css";
import { ElegirEstilo } from "./elegir-estilo";
import { Feed, type Lote } from "./feed";
import { aDataUrl, fotosQueFaltan, loteDeMes, proximoLunesISO, type RespuestaMes } from "./mes";

// Paso 3 · Tu contenido. Con la ficha y la identidad, el motor de contenidos de Eze arma el lote:
// plan del mes, posteos, carrusel, historias y reel, con sus imágenes (POST /api/contenidos/lote,
// ver lib/ia/contenidos/README.md). La respuesta llega de a partes: cada pieza se muestra apenas
// sale y se vuelve a dibujar cuando llegan sus imágenes. Tarda ~70 s.
// El lote terminado queda guardado junto con su identidad: si se recarga, no se vuelve a generar.
// "Sumar otro feed" no borra: los anteriores quedan para ir y volver, y los "me gusta" de todos guían al nuevo.
// Antes del primer feed, la persona elige el estilo de diseño (elegir-estilo.tsx, vista previa con su
// marca y sin IA). El estilo viaja al motor y vuelve dentro del kit: queda guardado con cada lote.
//
// Mes completo (suscriptores, GET /api/suscripcion → lib/suscripcion.ts): en vez de una semana, se arma el mes
// entero (POST /api/contenidos/mes). Lo arma el servidor de a una semana y lo guarda en Supabase; acá se lee cada
// 4 s y se dibuja con el mismo Feed. En la pestaña queda solo el id del mes (sin fotos): al recargar se retoma.
// Si el mes quedó trabado (se cayó el servidor), se pide seguir una vez por semana, con el freno de lib/freno.ts.

export const CLAVE_FEED = "brandia:feed";
/** Las piezas que la persona marcó con "me gusta", del feed que está viendo */
export const CLAVE_ME_GUSTA = "brandia:me-gusta";

type Marca = { ficha: string; brief: Brief; identidad: IdentidadIA; logo: PropuestaLogo | null };
type Gusto = { formato: string; pilar: string; idea: string };

/** id del mes → pieza → clave → data URL. Las fotos del mes van aparte del lote: no se guardan en la pestaña */
type FotosDeMeses = Record<string, Record<string, Imagenes>>;

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Cada cuánto se mira cómo va el mes, y hasta cuándo (un mes tarda unos 5 minutos) */
const CADA = 4000;
const COMO_MUCHO = 25 * 60_000;

type Estado =
  | { tipo: "cargando" }
  | { tipo: "sin-marca" }
  | { tipo: "elegir" }
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

/** Los feeds en la pestaña. Los meses van sin fotos (están en Supabase); si no entra todo, solo el último */
function guardarFeeds(m: Marca, lote: Lote, anteriores: Lote[]) {
  const liviano = (l: Lote) => (l.mes ? { ...l, imagenes: {} } : l);
  try {
    sessionStorage.setItem(CLAVE_FEED, JSON.stringify({ huella: huella(m), lote: liviano(lote), anteriores: anteriores.map(liviano) }));
  } catch {
    // Las imágenes pesan: si no entran todos, se guarda solo el último (los anteriores se ven igual hasta recargar)
    try {
      sessionStorage.setItem(CLAVE_FEED, JSON.stringify({ huella: huella(m), lote: liviano(lote), anteriores: anteriores.filter((l) => l.mes).map(liviano) }));
    } catch {}
  }
}

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

  // "Generar otro" suma un feed: los anteriores quedan para ir y volver (nada se borra)
  const [anteriores, setAnteriores] = useState<Lote[]>([]);
  const previos = useRef<Lote[]>([]);
  /** El feed anterior que se está mirando; null: el último */
  const [ver, setVer] = useState<number | null>(null);
  /** "número de feed:id de pieza" de lo que la persona marcó con "me gusta", en todos los feeds */
  const [meGusta, setMeGusta] = useState<string[]>([]);

  /** El estilo del próximo feed: el que eligió antes de generar, o el que cambió para "Sumar otro feed" */
  const [estilo, setEstilo] = useState<IdEstilo>(ESTILO_POR_DEFECTO);
  const control = useRef<AbortController | null>(null);
  useEffect(() => () => control.current?.abort(), []);

  const generar = useCallback(async (m: Marca, estiloElegido: IdEstilo, gustaron?: Gusto[]) => {
    control.current?.abort();
    control.current = new AbortController();
    const senal = control.current.signal;
    let lote = LOTE_VACIO;
    setEstado({ tipo: "lote", lote, generando: true });
    document.querySelector("main")?.scrollTo({ top: 0 });
    try {
      const res = await fetch("/api/contenidos/lote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief: m.brief, identidad: m.identidad, imagenes: true, gustaron, estilo: estiloElegido }),
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
      guardarFeeds(m, lote, previos.current);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setEstado({ tipo: "error", mensaje: (e as Error).message });
    }
  }, []);

  // ── El mes completo del suscriptor ─────────────────────────────────────────────────────────

  /** null mientras se pregunta. Lo decide el servidor (lib/suscripcion.ts) */
  const [suscripto, setSuscripto] = useState<boolean | null>(null);
  const preguntaSuscripcion = useRef<Promise<boolean> | null>(null);
  const [fotos, setFotos] = useState<FotosDeMeses>({});
  /** Los meses que se están mirando ahora (para no mirar dos veces el mismo) y las fotos ya pedidas */
  const siguiendo = useRef(new Set<string>());
  const fotosPedidas = useRef(new Map<string, Set<string>>());
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const esSuscripto = useCallback(() => {
    preguntaSuscripcion.current ??= fetch("/api/suscripcion", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { activa: false }))
      .then((d: { activa?: boolean }) => Boolean(d.activa))
      .catch(() => false)
      .then((activa) => (setSuscripto(activa), activa));
    return preguntaSuscripcion.current;
  }, []);

  /** Cambia el lote de ese mes, esté donde esté (el que se está armando o uno anterior) */
  const ponerMes = useCallback((id: string, cambiar: (l: Lote) => Lote) => {
    setEstado((e) => {
      if (e.tipo !== "lote" || e.lote.mes?.id !== id) return e;
      const lote = cambiar(e.lote);
      return { tipo: "lote", lote, generando: !lote.fin };
    });
    if (previos.current.some((l) => l.mes?.id === id)) {
      previos.current = previos.current.map((l) => (l.mes?.id === id ? cambiar(l) : l));
      setAnteriores(previos.current);
    }
  }, []);

  /** Baja las fotos nuevas del mes, de a 4 */
  const bajarFotos = useCallback(async (id: string, lista: { pieza: string; clave: string; url: string }[]) => {
    const pedidas = fotosPedidas.current.get(id) ?? new Set<string>();
    fotosPedidas.current.set(id, pedidas);
    const cola = lista.filter((f) => !pedidas.has(`${f.pieza}/${f.clave}`));
    for (const f of cola) pedidas.add(`${f.pieza}/${f.clave}`);
    const trabajar = async () => {
      for (let f = cola.shift(); f; f = cola.shift()) {
        const foto = f;
        try {
          const url = await aDataUrl(foto.url).catch(() => esperar(2000).then(() => aDataUrl(foto.url)));
          setFotos((todas) => ({
            ...todas,
            [id]: { ...todas[id], [foto.pieza]: { ...todas[id]?.[foto.pieza], [foto.clave]: url } },
          }));
        } catch {
          pedidas.delete(`${foto.pieza}/${foto.clave}`); // la próxima mirada la vuelve a pedir
        }
      }
    };
    await Promise.all([trabajar(), trabajar(), trabajar(), trabajar()]);
  }, []);

  /** Mira cómo va el mes cada 4 s hasta que ya no cambia. Si quedó trabado, pide seguir (una vez por semana) */
  const seguirMes = useCallback(
    async (id: string) => {
      if (siguiendo.current.has(id)) return;
      siguiendo.current.add(id);
      const pedidosDeSeguir = new Set<string>();
      const hasta = Date.now() + COMO_MUCHO;
      try {
        while (montado.current && Date.now() < hasta) {
          const r = await fetch(`/api/contenidos/mes?id=${encodeURIComponent(id)}`, { cache: "no-store" }).catch(() => null);
          if (r?.status === 404) {
            ponerMes(id, (l) => ({ ...l, fallas: { ...l.fallas, lote: "No encontramos este mes." }, fin: l.fin ?? { segundos: 0, imagenes: 0 } }));
            return;
          }
          if (r?.ok) {
            const d = (await r.json()) as RespuestaMes;
            ponerMes(id, () => loteDeMes(d));
            void bajarFotos(id, fotosQueFaltan(d.mes, fotosPedidas.current.get(id) ?? new Set()));
            if (d.terminado) return;
            const s = d.mes.semanas.find((x) => x.estado !== "lista");
            const clave = s ? `${s.semana}:${s.intentos}` : "";
            if (d.trabado && s && !pedidosDeSeguir.has(clave) && puedoArrancarSolo(`mes:${id}`)) {
              pedidosDeSeguir.add(clave);
              await fetch("/api/contenidos/mes/seguir", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id }),
              }).catch(() => null);
            }
          }
          await esperar(CADA);
        }
      } finally {
        siguiendo.current.delete(id);
      }
    },
    [bajarFotos, ponerMes],
  );

  const generarMes = useCallback(
    async (m: Marca, estiloElegido: IdEstilo, gustaron?: Gusto[]) => {
      control.current?.abort();
      setEstado({ tipo: "lote", lote: { ...LOTE_VACIO, mensaje: "Arrancando tu mes…" }, generando: true });
      document.querySelector("main")?.scrollTo({ top: 0 });
      try {
        const res = await fetch("/api/contenidos/mes", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ brief: m.brief, identidad: m.identidad, gustaron, estilo: estiloElegido, inicio: proximoLunesISO() }),
        });
        const datos = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
        if (!res.ok || !datos.id) throw new Error(datos.error || "No pudimos conectar con BrandIA.");
        const id = datos.id;
        const lote: Lote = {
          ...LOTE_VACIO,
          mensaje: "Pensando qué tiene que contar tu marca este mes",
          mes: { id, inicio: proximoLunesISO(), semanas: [], vivo: true, terminado: false, reintentable: false },
        };
        setEstado({ tipo: "lote", lote, generando: true });
        guardarFeeds(m, lote, previos.current);
        void seguirMes(id);
      } catch (e) {
        setEstado({ tipo: "error", mensaje: (e as Error).message });
      }
    },
    [seguirMes],
  );

  /** Lo que no salió del mes (o la semana que se trabó): se pide de nuevo, con un toque */
  const reintentarMes = useCallback(
    async (id: string) => {
      const r = await fetch("/api/contenidos/mes/seguir", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, reintentar: true }),
      }).catch(() => null);
      if (r && (r.ok || r.status === 409)) {
        ponerMes(id, (l) => ({ ...l, fin: null, mes: l.mes && { ...l.mes, terminado: false, vivo: true } }));
        await esperar(1500);
        void seguirMes(id);
      }
    },
    [ponerMes, seguirMes],
  );

  useEffect(() => {
    void esSuscripto();
  }, [esSuscripto]);

  // Los meses se guardan en la pestaña cada vez que cambian (sin fotos: es liviano)
  useEffect(() => {
    if (!marca || estado.tipo !== "lote" || !estado.lote.mes) return;
    guardarFeeds(marca, estado.lote, anteriores);
  }, [marca, estado, anteriores]);

  useEffect(() => {
    const ficha = sessionStorage.getItem(CLAVE_FICHA);
    const brief = leer<Brief>(CLAVE_FICHA);
    const guardada = leer<MarcaGuardada>(CLAVE_IDENTIDAD);
    if (!ficha || !brief || guardada?.ficha !== ficha) return setEstado({ tipo: "sin-marca" });
    const m = { ficha, brief, identidad: guardada.identidad, logo: logoDeMarca(guardada.logos ?? [], guardada.elegido) };
    setMarca(m);

    const previo = leer<{ huella: string; lote?: Lote; anteriores?: Lote[] }>(CLAVE_FEED);
    if (previo?.huella === huella(m) && (previo.lote?.plan || previo.lote?.mes)) {
      previos.current = previo.anteriores ?? [];
      setAnteriores(previos.current);
      const gustos = leer<{ huella: string; ids: string[] }>(CLAVE_ME_GUSTA);
      if (gustos?.huella === huella(m)) setMeGusta(gustos.ids);
      setEstilo(previo.lote.kit?.estilo ?? ESTILO_POR_DEFECTO);
      // Un mes se retoma: se vuelve a leer del servidor (y sus fotos), siga armándose o no
      return setEstado({ tipo: "lote", lote: previo.lote, generando: Boolean(previo.lote.mes && !previo.lote.fin) });
    }

    // Marca nueva: antes de gastar, que elija el estilo
    setEstado({ tipo: "elegir" });
  }, []);

  async function elegir(e: IdEstilo) {
    if (!marca) return;
    setEstilo(e);
    if (await esSuscripto()) generarMes(marca, e);
    else generar(marca, e);
  }

  // La vista previa de los estilos se compone con el mismo kit que arma el motor, sin IA
  const kitPrevio = useMemo(() => {
    if (!marca) return null;
    try {
      return armarKit(marca.identidad as unknown as IdentidadEntrada, marca.brief);
    } catch {
      return null;
    }
  }, [marca]);

  function marcar(clave: string) {
    if (!marca) return;
    setMeGusta((ids) => {
      const nuevos = ids.includes(clave) ? ids.filter((x) => x !== clave) : [...ids, clave];
      try {
        sessionStorage.setItem(CLAVE_ME_GUSTA, JSON.stringify({ huella: huella(marca), ids: nuevos }));
      } catch {}
      return nuevos;
    });
  }

  function otroFeed() {
    if (!marca) return;
    const actual = estado.tipo === "lote" && estado.lote.plan ? estado.lote : null;
    const todos = actual ? [...previos.current, actual] : previos.current;
    // Lo que le gustó de todos los feeds guía al próximo
    const gustaron = todos.flatMap((l, n) =>
      (l.plan?.piezas ?? [])
        .filter((p) => meGusta.includes(`${n}:${p.id}`))
        .map((p) => ({ formato: p.formato, pilar: p.pilar, idea: p.idea })),
    );
    previos.current = todos;
    setAnteriores(todos);
    setVer(null);
    if (suscripto) generarMes(marca, estilo, gustaron.length ? gustaron : undefined);
    else generar(marca, estilo, gustaron.length ? gustaron : undefined);
  }

  const ultimo = estado.tipo === "lote" ? estado.lote : null;
  const generando = estado.tipo === "cargando" || (estado.tipo === "lote" && estado.generando);
  const lote = ver !== null ? (anteriores[ver] ?? ultimo) : ultimo;
  const numero = ver ?? anteriores.length;
  const gustanAca = meGusta.filter((k) => k.startsWith(`${numero}:`)).map((k) => k.slice(k.indexOf(":") + 1));
  const generandoAca = ver === null && generando;
  // Las fotos del mes van aparte (no se guardan en la pestaña): se suman acá para dibujar
  const loteVisible = lote?.mes ? { ...lote, imagenes: fotos[lote.mes.id] ?? {} } : lote;
  const mesVisible = lote?.mes?.id;
  // Un mes que se está viendo se lee del servidor: para retomarlo si se sigue armando, o para traer sus fotos
  useEffect(() => {
    if (mesVisible) void seguirMes(mesVisible);
  }, [mesVisible, seguirMes]);
  const mesSinPlan = Boolean(lote?.mes && !lote.plan);
  const mesFallo = mesSinPlan && Boolean(lote?.fin);

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

        {/* Los feeds que ya se generaron: generar otro suma, no borra */}
        {anteriores.length > 0 && (
          <nav aria-label="Tus feeds" className={`${s.entra} mt-8 flex flex-wrap items-center gap-2`}>
            <span className="label mr-1">Tus feeds</span>
            {[...anteriores, ultimo].map((_, n) => {
              const activo = n === numero;
              const enCurso = n === anteriores.length && (generando || estado.tipo === "error");
              return (
                <Button
                  key={n}
                  size="sm"
                  variant={activo ? "default" : "outline"}
                  aria-pressed={activo}
                  onClick={() => setVer(n === anteriores.length ? null : n)}
                >
                  Feed {n + 1}
                  {enCurso ? (estado.tipo === "error" ? " · no salió" : " · armándose…") : ""}
                  {!enCurso && meGusta.some((k) => k.startsWith(`${n}:`)) ? " ♥" : ""}
                </Button>
              );
            })}
          </nav>
        )}

        {/* Marca nueva: elige el estilo antes de generar */}
        {estado.tipo === "elegir" && marca && (
          <div className={`${s.entra} mt-10`}>
            <h1 className="display max-w-[18ch]">
              ¿Cuál te gusta <span className={s.it}>más</span>?
            </h1>
            <p className="lead mt-4 mb-6 max-w-[38em] text-base">
              Dos estilos para el feed de {marca.identidad.nombre}, con tus colores, tus letras, tu logo y fotos de tu rubro.
              {" "}
              {suscripto ? "Elegí uno y armamos tu mes entero así." : "Elegí uno y armamos el feed entero así."}
            </p>
            {kitPrevio ? (
              <ElegirEstilo kit={kitPrevio} clave={huella(marca)} brief={marca.brief} identidad={marca.identidad} onElegir={elegir} />
            ) : (
              <Button size="lg" onClick={() => elegir(ESTILO_POR_DEFECTO)}>
                Armar mi feed
                <ArrowRight data-icon="inline-end" />
              </Button>
            )}
          </div>
        )}

        {/* Hasta que llega el plan, la pantalla de espera */}
        {ver === null && !mesFallo && (estado.tipo === "cargando" || (lote && !lote.plan)) && (
          <div className="flex min-h-[60svh] flex-col items-start justify-center">
            {lote?.mes ? (
              <>
                <h1 className={`${s.seCocina} display max-w-[16ch]`}>
                  Armando <span className={s.it}>tu</span> mes.
                </h1>
                <p className="lead mt-4 max-w-[34em] text-base">
                  Cuatro semanas de posteos, carruseles, historias y reels con la voz, los colores y las letras de{" "}
                  {marca?.identidad.nombre ?? "tu marca"}, cada uno en su día. Tarda unos cinco minutos: cada semana aparece apenas
                  está, y podés cerrar la pestaña, que BrandIA lo sigue armando.
                </p>
              </>
            ) : (
              <>
                <h1 className={`${s.seCocina} display max-w-[16ch]`}>
                  Armando <span className={s.it}>tu</span> {anteriores.length ? "próximo" : "primer"} feed.
                </h1>
                <p className="lead mt-4 max-w-[34em] text-base">
                  Posteos, un carrusel, historias y un reel con la voz, los colores y las letras de{" "}
                  {marca?.identidad.nombre ?? "tu marca"}. Tarda alrededor de un minuto, y cada pieza aparece apenas está.
                </p>
              </>
            )}
            <div className="mt-8">{lote && <Armando que="feed" mensaje={lote.mensaje} />}</div>
          </div>
        )}

        {/* El mes no arrancó: el plan no salió ni probando varias veces */}
        {mesFallo && lote?.mes && (
          <div className={`${s.entra} flex min-h-[60svh] flex-col items-start justify-center`}>
            <h1 className="display max-w-[16ch]">Algo se trabó.</h1>
            <p className="lead mt-4 max-w-[34em] text-base">
              {lote.fallas.lote ?? "No pudimos armar el plan del mes."} Tu marca sigue guardada.
            </p>
            {lote.mes.semanas[0] && lote.mes.semanas[0].estado === "fallo" && (
              <Button size="lg" className="mt-8" onClick={() => lote.mes && reintentarMes(lote.mes.id)}>
                Probar de nuevo
              </Button>
            )}
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

        {ver === null && estado.tipo === "error" && (
          <div className={`${s.entra} flex min-h-[60svh] flex-col items-start justify-center`}>
            <h1 className="display max-w-[16ch]">Algo se trabó.</h1>
            <p className="lead mt-4 max-w-[34em] text-base">{estado.mensaje} Tu marca sigue guardada.</p>
            <Button size="lg" className="mt-8" onClick={() => marca && (suscripto ? generarMes(marca, estilo) : generar(marca, estilo))}>
              Probar de nuevo
            </Button>
          </div>
        )}

        {loteVisible?.plan && loteVisible.kit && marca && (
          <>
            <div className={`${s.entra} mt-10 mb-8 flex flex-wrap items-end justify-between gap-4`}>
              <h1 className="display max-w-[18ch]">
                {loteVisible.mes ? "El mes" : "El feed"} de <span className={s.it}>{marca.identidad.nombre}</span>.
              </h1>
              <div className="flex flex-col items-start gap-1 sm:items-end">
                <Button variant="outline" size="sm" onClick={otroFeed} disabled={generando}>
                  <RotateCcw data-icon="inline-start" />
                  {suscripto
                    ? meGusta.length
                      ? "Sumar otro mes en esta línea"
                      : "Sumar otro mes"
                    : meGusta.length
                      ? "Sumar otro en esta línea"
                      : "Sumar otro feed"}
                </Button>
                {!generando && (
                  <div role="group" aria-label="Estilo del próximo feed" className="flex items-center gap-1 text-xs">
                    <span className="mr-1 text-muted-foreground">Estilo del próximo:</span>
                    {ID_ESTILOS.map((e) => (
                      <Button key={e} size="xs" variant={estilo === e ? "default" : "ghost"} aria-pressed={estilo === e} onClick={() => setEstilo(e)}>
                        {ESTILOS[e].nombre}
                      </Button>
                    ))}
                  </div>
                )}
                {!generando && (
                  <p className="text-xs text-muted-foreground">
                    {meGusta.length
                      ? `${meGusta.length === 1 ? "Te gustó 1 pieza" : `Te gustaron ${meGusta.length} piezas`}: el próximo ${suscripto ? "mes" : "feed"} va a ir por ahí.`
                      : `Marcá con ♥ lo que te gusta y el próximo ${suscripto ? "mes" : "feed"} va a ir por ahí. Los anteriores no se borran.`}
                  </p>
                )}
              </div>
            </div>
            <Feed
              lote={loteVisible}
              kit={loteVisible.kit}
              plan={loteVisible.plan}
              identidad={marca.identidad}
              logo={marca.logo}
              generando={generandoAca}
              meGusta={gustanAca}
              onMeGusta={(id) => marcar(`${numero}:${id}`)}
              onReintentar={loteVisible.mes ? () => reintentarMes(loteVisible.mes!.id) : undefined}
              onMesCompleto={suscripto && !loteVisible.mes && !generando ? otroFeed : undefined}
            />
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/crear/branderia" className={buttonVariants({ size: "lg" })}>
                Ver mis productos
                <ArrowRight data-icon="inline-end" />
              </Link>
              <BotonWeb />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
