"use client";

import { Button, buttonVariants } from "@build101/ui/components/button";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Armando } from "@/components/entrevista/armando";
import { CLAVE_FICHA } from "@/components/entrevista/ficha";
import { BotonWeb } from "@/components/boton-web";
import { alternar } from "@/components/me-gusta";
import { Pasos } from "@/components/pasos";
import { MENSAJE_FRENO, puedoArrancarSolo } from "@/lib/freno";
import type { Brief } from "@/lib/ia/brief";

import s from "../entrevista/entrevista.module.css";
import { Brandbook, Controles } from "./brandbook";
import { Descargas } from "./descargas";
import { Direcciones } from "./direcciones";
import { OtrosLogos } from "./otros-logos";
import { Nombres } from "./nombres";
import { OtraPaleta, type PaletaNueva, type VersionPaleta } from "./otra-paleta";
import { limpiarSimbolo, logoParaEnviar, useVersiones } from "./versiones";
import {
  CLAVE_DIRECCIONES,
  CLAVE_IDENTIDAD,
  claveDe,
  type DireccionConControl,
  direccionPura,
  type IdentidadIA,
  type LogoElegido,
  logoDeMarca,
  type MarcaGuardada,
  type PropuestaLogo,
  recolorearSvg,
} from "./identidad";

// Paso 2 · Tu marca. Con la ficha de la entrevista:
//   0. la IA propone nombres con su trasfondo (en paralelo con las direcciones) y la persona elige uno;
//   1. la IA propone 3 direcciones visuales y la persona elige una;
//   2. con esa, la IA arma la identidad y dibuja 3 logos (en paralelo);
//   3. se muestra el brandbook. Ahí se puede elegir el logo (o el símbolo solo), pedir otras paletas y logos
//      nuevos: cada vuelta suma opciones, nunca borra las anteriores.
// Todo queda guardado junto con su ficha: si se recarga la página, no se vuelve a generar.

type Ficha = { texto: string; brief: Brief };

type Estado =
  | { tipo: "cargando" }
  | { tipo: "sin-ficha" }
  | { tipo: "buscando" }
  | { tipo: "elegir"; direcciones: DireccionConControl[] }
  | { tipo: "armando"; direcciones: DireccionConControl[]; direccion: DireccionConControl }
  | {
      tipo: "lista";
      direcciones: DireccionConControl[];
      identidad: IdentidadIA;
      logos: PropuestaLogo[];
      elegido?: LogoElegido;
      /** El camino elegido (con su clave: puede ser una variante de otros colores) */
      direccion?: DireccionConControl;
      /** Lo marcado con ♥ en el brandbook: colores (hex en minúscula) y logos (posición) */
      coloresGustan: string[];
      logosGustan: (number | "simbolo")[];
      /** Todas las paletas que se probaron (la primera es la de la dirección): iterar suma, no borra */
      paletas: VersionPaleta[];
      /** Las paletas con las que ya se dibujaron logos completos: con otra, se ofrece dibujar logos nuevos */
      paletasConLogos: string[];
    }
  | { tipo: "error"; mensaje: string; reintentar: () => void };

type Lista = Extract<Estado, { tipo: "lista" }>;

const huellaPaleta = (i: { paleta: IdentidadIA["paleta"] }) => i.paleta.map((c) => c.hex).join();

const DE_PALETA = ["Contraste del texto", "Color principal"];

/** La paleta de una identidad como versión, con su símbolo y sus controles */
const versionDe = (i: IdentidadIA, explicacion?: string): VersionPaleta => ({
  paleta: i.paleta,
  isotipo_svg: i.logo.isotipo_svg,
  comprobaciones: i.comprobaciones.filter((c) => DE_PALETA.includes(c.que)),
  explicacion,
  uso_de_colores: i.estilo.uso_de_colores,
});

/** La identidad con otra de sus paletas aplicada */
const conPaleta = (i: IdentidadIA, v: VersionPaleta): IdentidadIA => ({
  ...i,
  paleta: v.paleta,
  logo: { ...i.logo, isotipo_svg: v.isotipo_svg },
  estilo: { ...i.estilo, uso_de_colores: v.uso_de_colores ?? i.estilo.uso_de_colores },
  comprobaciones: [...v.comprobaciones, ...i.comprobaciones.filter((c) => !DE_PALETA.includes(c.que))],
});

type Guardada = MarcaGuardada & {
  paletas?: VersionPaleta[];
  paletasConLogos?: string[];
  direccion?: DireccionConControl;
  coloresGustan?: string[];
  logosGustan?: (number | "simbolo")[];
};

/** Los caminos que se vieron, con lo marcado con ♥ (caminos por su clave y colores en hex) */
type Caminos = { ficha: string; direcciones: DireccionConControl[]; gustan?: string[]; colores?: string[] };

/** La identidad con el logo elegido y todo lo demás, guardada junto con su ficha */
function guardarMarca(ficha: string, l: Lista) {
  const marca: Guardada = {
    ficha,
    identidad: l.identidad,
    logos: l.logos,
    elegido: l.elegido,
    paletas: l.paletas,
    paletasConLogos: l.paletasConLogos,
    direccion: l.direccion,
    coloresGustan: l.coloresGustan,
    logosGustan: l.logosGustan,
  };
  if (guardar(CLAVE_IDENTIDAD, marca)) return;
  // Sin lugar (los logos pesan, sobre todo en el celular): se guarda al menos el logo elegido, que es el que usan
  // el feed, BranderIA y la web. Si tampoco entra con su símbolo, va sin el símbolo; y si no, sin logos.
  const elegido = typeof l.elegido === "number" ? l.logos[l.elegido] : undefined;
  if (elegido && guardar(CLAVE_IDENTIDAD, { ...marca, logos: [elegido], elegido: 0, logosGustan: [] })) return;
  if (elegido && guardar(CLAVE_IDENTIDAD, { ...marca, logos: [{ ...elegido, simbolo: undefined }], elegido: 0, logosGustan: [] })) return;
  guardar(CLAVE_IDENTIDAD, { ...marca, logos: [], elegido: undefined });
}

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
  // Lo marcado con ♥ en los caminos: guía las próximas vueltas (qué conservar y por dónde seguir)
  const [caminosGustan, setCaminosGustan] = useState<string[]>([]);
  const [coloresGustan, setColoresGustan] = useState<string[]>([]);
  // Lo mismo, para guardar siempre lo último aunque se toquen varios ♥ seguidos
  const gustos = useRef({ caminos: [] as string[], colores: [] as string[] });
  const [pidiendoCaminos, setPidiendoCaminos] = useState(false);
  const [errorCaminos, setErrorCaminos] = useState<string | null>(null);
  const [pedidoCaminos, setPedidoCaminos] = useState("");

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
      const cuerpo = { brief, direccion: direccionPura(direccion) };
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
      const lista: Lista = {
        tipo: "lista",
        direcciones,
        identidad: identidad.value.identidad,
        logos: propuestas,
        elegido: propuestas.length ? 0 : "simbolo",
        direccion,
        coloresGustan: [],
        logosGustan: [],
        paletas: [versionDe(identidad.value.identidad)],
        paletasConLogos: [huellaPaleta(identidad.value.identidad)],
      };
      guardarMarca(f.texto, lista);
      setEstado(lista);
    },
    [],
  );

  useEffect(() => {
    const texto = sessionStorage.getItem(CLAVE_FICHA);
    const brief = leer<Brief>(CLAVE_FICHA);
    if (!texto || !brief) return setEstado({ tipo: "sin-ficha" });
    const f = { texto, brief };
    setFicha(f);

    const dirs = leer<Caminos>(CLAVE_DIRECCIONES);
    const ident = leer<Guardada>(CLAVE_IDENTIDAD);
    if (dirs?.ficha === texto) {
      gustos.current = { caminos: dirs.gustan ?? [], colores: dirs.colores ?? [] };
      setCaminosGustan(gustos.current.caminos);
      setColoresGustan(gustos.current.colores);
    }
    if (dirs?.ficha === texto && ident?.ficha === texto) {
      return setEstado({
        tipo: "lista",
        direcciones: dirs.direcciones,
        identidad: ident.identidad,
        logos: ident.logos ?? [],
        elegido: ident.elegido,
        direccion: ident.direccion,
        coloresGustan: ident.coloresGustan ?? [],
        logosGustan: ident.logosGustan ?? [],
        // Las marcas guardadas antes de iterar la paleta: una sola, con la que se dibujaron los logos
        paletas: ident.paletas ?? [versionDe(ident.identidad)],
        paletasConLogos: ident.paletasConLogos ?? [huellaPaleta(ident.identidad)],
      });
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

  const [redibujando, setRedibujando] = useState(false);
  const [errorLogos, setErrorLogos] = useState<string>();

  /** Cambia la marca lista y la guarda */
  const actualizar = useCallback(
    (cambio: (l: Lista) => Lista) => {
      setEstado((e) => {
        if (e.tipo !== "lista" || !ficha) return e;
        const nueva = cambio(e);
        guardarMarca(ficha.texto, nueva);
        return nueva;
      });
    },
    [ficha],
  );

  // Las 4 versiones del logo elegido (brandbook y descargas). Si el elegido es una propuesta de Recraft, su
  // símbolo solo lo separa la IA: UNA vez por logo, cuando se elige (o al abrir la marca con ese elegido),
  // y queda guardado en la propuesta. Si falla, queda marcado y no se vuelve a pedir solo: hay un botón.
  const [separando, setSeparando] = useState<number | null>(null);
  const simbolosPedidos = useRef(new Set<string>());
  const lista = estado.tipo === "lista" ? estado : null;
  const logoElegido = lista ? logoDeMarca(lista.logos, lista.elegido) : null;
  const indiceElegido = lista && logoElegido ? lista.logos.indexOf(logoElegido) : -1;
  const versiones = useVersiones(lista?.identidad ?? null, logoElegido, separando !== null && separando === indiceElegido);

  async function separarSimbolo(l: Lista, i: number, aMano = false) {
    const logo = l.logos[i];
    if (!logo || separando !== null) return;
    const clave = `${i}:${logo.imagen.slice(-40)}`;
    if (!aMano) {
      if (logo.simbolo || logo.simboloFallo || simbolosPedidos.current.has(clave)) return;
      if (!puedoArrancarSolo("logo-simbolo")) return;
    }
    simbolosPedidos.current.add(clave);
    setSeparando(i);
    let simbolo: string | null = null;
    try {
      const { imagen } = await pedir<{ imagen: string }>("/api/logo/simbolo", {
        logo: await logoParaEnviar(logo.imagen),
        nombre: l.identidad.nombre,
        tipo: logo.tipo,
      });
      simbolo = await limpiarSimbolo(imagen);
    } catch (e) {
      console.error("[logo-simbolo]", e);
    }
    // Si sale mal, se queda el que había (si había) y se marca para no volver a pedirlo solo
    actualizar((actual) => ({
      ...actual,
      logos: actual.logos.map((x, j) =>
        j === i ? { ...x, simbolo: simbolo ?? x.simbolo, simboloFallo: !simbolo && !x.simbolo } : x,
      ),
    }));
    setSeparando(null);
  }

  // Corre cuando cambia el logo elegido o termina una separación (nunca en bucle: ver separarSimbolo)
  useEffect(() => {
    if (lista && indiceElegido >= 0 && separando === null) void separarSimbolo(lista, indiceElegido);
  }, [indiceElegido, separando, lista?.logos.length]);

  /** La ficha con el nombre final y la dirección completa de esta marca, para volver a pedirle a la IA */
  function contexto(l: Lista) {
    const direccion =
      l.direccion ?? l.direcciones.find((d) => d.id === l.identidad.direccion.id) ?? l.direcciones[0]!;
    const brief = ficha ? { ...ficha.brief, marca: { ...ficha.brief.marca, nombre: l.identidad.nombre } } : null;
    return { brief, direccion };
  }

  async function pedirPaleta(l: Lista, pedido: string) {
    const { brief, direccion } = contexto(l);
    return pedir<PaletaNueva>("/api/paleta", {
      brief,
      direccion: direccionPura(direccion),
      paleta: l.identidad.paleta,
      vistas: l.paletas.map((v) => v.paleta),
      pedido: pedido.trim() || undefined,
      // Los colores marcados con ♥ se quedan; cambia el resto
      conservar: l.identidad.paleta.map((c) => c.hex).filter((h) => l.coloresGustan.includes(h.toLowerCase())),
    });
  }

  /** La paleta nueva se suma a las que ya había y queda aplicada (el símbolo la sigue, color por rol) */
  function nuevaPaleta(p: PaletaNueva) {
    actualizar((l) => {
      const version: VersionPaleta = {
        paleta: p.paleta,
        isotipo_svg: recolorearSvg(l.identidad.logo.isotipo_svg, l.identidad.paleta, p.paleta),
        comprobaciones: p.comprobaciones,
        explicacion: p.explicacion,
        uso_de_colores: p.uso_de_colores,
      };
      return { ...l, paletas: [...l.paletas, version], identidad: conPaleta(l.identidad, version) };
    });
  }

  function elegirPaleta(i: number) {
    actualizar((l) => (l.paletas[i] ? { ...l, identidad: conPaleta(l.identidad, l.paletas[i]) } : l));
  }

  /**
   * Otros logos: se suman a los de antes (el elegido no cambia). Van con la paleta aplicada, en la línea de los
   * marcados con ♥ y con el pedido en palabras, sin repetir ideas que ya vio.
   */
  async function otrosLogos(l: Lista, pedido = "", iniciales = false) {
    const { brief, direccion } = contexto(l);
    setRedibujando(true);
    setErrorLogos(undefined);
    try {
      const { propuestas } = await pedir<{ propuestas: PropuestaLogo[] }>("/api/logo", {
        brief,
        direccion: { ...direccionPura(direccion), paleta: l.identidad.paleta },
        // El símbolo marcado con ♥ entra como idea a usar: así los logos nuevos lo llevan
        gustan: l.logosGustan
          .map((i) =>
            i === "simbolo"
              ? `Usar el símbolo de la marca en el logo completo: ${l.identidad.logo.explicacion}`
              : l.logos[i]?.concepto,
          )
          .filter((x): x is string => !!x),
        vistos: l.logos.map((x) => x.concepto),
        pedido: pedido.trim() || undefined,
        tipo: iniciales ? "monograma" : undefined,
      });
      actualizar((actual) => ({
        ...actual,
        logos: [...actual.logos, ...propuestas],
        paletasConLogos: [...new Set([...actual.paletasConLogos, huellaPaleta(actual.identidad)])],
      }));
    } catch (e) {
      setErrorLogos((e as Error).message);
      throw e;
    } finally {
      setRedibujando(false);
    }
  }

  /** Guarda los caminos con lo marcado */
  function guardarCaminos(direcciones: DireccionConControl[]) {
    const { caminos: gustan, colores } = gustos.current;
    if (ficha) guardar(CLAVE_DIRECCIONES, { ficha: ficha.texto, direcciones, gustan, colores } satisfies Caminos);
  }

  function meGustaCamino(direcciones: DireccionConControl[], clave: string) {
    gustos.current = { ...gustos.current, caminos: alternar(gustos.current.caminos, clave) };
    setCaminosGustan(gustos.current.caminos);
    guardarCaminos(direcciones);
  }

  function meGustaColor(direcciones: DireccionConControl[], hex: string) {
    gustos.current = { ...gustos.current, colores: alternar(gustos.current.colores, hex) };
    setColoresGustan(gustos.current.colores);
    guardarCaminos(direcciones);
  }

  /** Suma caminos a los que ya hay (en el paso de elegir); nunca reemplaza */
  function sumarCaminos(nuevos: DireccionConControl[], despuesDe?: string) {
    setEstado((e) => {
      if (e.tipo !== "elegir") return e;
      const lista = [...e.direcciones];
      const i = despuesDe ? lista.findIndex((d) => claveDe(d) === despuesDe) : -1;
      lista.splice(i >= 0 ? i + 1 : lista.length, 0, ...nuevos);
      guardarCaminos(lista);
      return { ...e, direcciones: lista };
    });
  }

  /** Otra paleta para un camino: se suma como una variante al lado, con los colores marcados conservados */
  async function otrosColores(d: DireccionConControl, pedido: string, todas: DireccionConControl[]) {
    if (!ficha) return;
    const base = claveDe(d).split("-c")[0]!;
    const hermanas = todas.filter((x) => claveDe(x) === base || claveDe(x).startsWith(`${base}-c`));
    const brief = nombreElegido ? { ...ficha.brief, marca: { ...ficha.brief.marca, nombre: nombreElegido } } : ficha.brief;
    const p = await pedir<PaletaNueva>("/api/paleta", {
      brief,
      direccion: direccionPura(d),
      paleta: d.paleta,
      vistas: hermanas.map((x) => x.paleta),
      pedido: pedido.trim() || undefined,
      conservar: d.paleta.map((c) => c.hex).filter((h) => gustos.current.colores.includes(h.toLowerCase())),
    });
    const n = todas.filter((x) => claveDe(x).startsWith(`${base}-c`)).length + 1;
    sumarCaminos(
      [
        {
          ...d,
          paleta: p.paleta,
          comprobaciones: p.comprobaciones,
          clave: `${base}-c${n}`,
          etiqueta: `Otros colores ${n}`,
          explicacion: p.explicacion,
        },
      ],
      claveDe(hermanas.at(-1) ?? d),
    );
  }

  /** Otra vuelta de tres caminos, guiada por lo marcado con ♥ y el pedido en palabras */
  async function otrosCaminos(e: React.FormEvent, todas: DireccionConControl[]) {
    e.preventDefault();
    if (!ficha || pidiendoCaminos) return;
    setPidiendoCaminos(true);
    setErrorCaminos(null);
    try {
      const brief = nombreElegido ? { ...ficha.brief, marca: { ...ficha.brief.marca, nombre: nombreElegido } } : ficha.brief;
      const colores = (d: DireccionConControl) => d.paleta.map((c) => c.hex);
      const { direcciones } = await pedir<{ direcciones: DireccionConControl[] }>("/api/direcciones", {
        brief,
        gustan: todas
          .filter((d) => gustos.current.caminos.includes(claveDe(d)))
          .map((d) => ({ nombre: d.nombre, idea: d.idea, colores: colores(d) })),
        vistos: todas.map((d) => ({ nombre: d.nombre, colores: colores(d) })),
        colores: gustos.current.colores,
        pedido: pedidoCaminos.trim() || undefined,
      });
      const vuelta = new Set(todas.map((d) => claveDe(d).split("-")[0]!.replace(/^[ABC]/, ""))).size + 1;
      sumarCaminos(direcciones.map((d) => ({ ...d, clave: `${d.id}${vuelta}`, etiqueta: `Vuelta ${vuelta}` })));
      setPedidoCaminos("");
    } catch (err) {
      setErrorCaminos((err as Error).message);
    } finally {
      setPidiendoCaminos(false);
    }
  }

  // La marca armada queda guardada mientras se mira otro nombre u otro camino: se puede volver a ella.
  // Solo se reemplaza si se elige otro camino.
  const [marcaArmada, setMarcaArmada] = useState<Lista | null>(null);

  function otroCamino(l: Lista) {
    setMarcaArmada(l);
    setEstado({ tipo: "elegir", direcciones: l.direcciones });
    document.querySelector("main")?.scrollTo({ top: 0 });
  }

  function volverAMarca(direcciones: DireccionConControl[]) {
    if (!marcaArmada) return;
    // Con los caminos que se hayan sumado mientras tanto
    const l = { ...marcaArmada, direcciones };
    if (ficha) guardarMarca(ficha.texto, l);
    setMarcaArmada(null);
    setEstado(l);
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
              {marcaArmada && (
                <Button variant="outline" size="sm" className="mb-6" onClick={() => volverAMarca(estado.direcciones)}>
                  <ArrowLeft data-icon="inline-start" />
                  Volver a {marcaArmada.identidad.nombre}
                </Button>
              )}
              <h1 className="display max-w-[18ch] text-[clamp(2rem,1.4rem+2vw,3rem)]">
                Elegí <span className={s.it}>tu</span> camino.
              </h1>
              <p className="lead mt-3 max-w-[40em] text-base">
                Formas de contar tu marca, con colores sacados de tu negocio. Marcá con ♥ los caminos y los colores que
                te gustan, probá otros colores en cualquiera o pedí otros caminos: lo nuevo se suma y nada se borra.
              </p>
            </div>
            <Direcciones
              direcciones={estado.direcciones}
              nombreMarca={nombreElegido ?? nombreMarca}
              onElegir={(d) => {
                setMarcaArmada(null);
                if (ficha) elegir(ficha, estado.direcciones, d, nombreElegido);
              }}
              iterar={{
                gustan: caminosGustan,
                onMeGusta: (clave) => meGustaCamino(estado.direcciones, clave),
                colores: coloresGustan,
                onColor: (hex) => meGustaColor(estado.direcciones, hex),
                onOtrosColores: (d, pedido) => otrosColores(d, pedido, estado.direcciones),
              }}
            />

            {/* Otra vuelta de caminos: guiada por lo marcado con ♥ y el pedido */}
            <section aria-labelledby="titulo-otros-caminos" className={`${s.entra} mt-8 rounded-lg border bg-card p-6`}>
              <h2 id="titulo-otros-caminos" className="text-[clamp(1.4rem,1.1rem+1vw,1.9rem)]">
                ¿Ninguno <span className={s.it}>te cierra</span>?
              </h2>
              <p className="mt-1 max-w-[40em] text-[15px] text-muted-foreground">
                Pedí tres caminos más.{" "}
                {caminosGustan.length || coloresGustan.length
                  ? "Van a seguir la línea de lo que marcaste con ♥ y conservar los colores marcados."
                  : "Si marcás con ♥ lo que te gusta, los nuevos van por ahí."}
              </p>
              <form onSubmit={(e) => otrosCaminos(e, estado.direcciones)} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <label htmlFor="pedido-caminos" className="sr-only">
                  Qué buscás en los caminos
                </label>
                <input
                  id="pedido-caminos"
                  value={pedidoCaminos}
                  onChange={(e) => setPedidoCaminos(e.target.value)}
                  maxLength={300}
                  disabled={pidiendoCaminos}
                  placeholder="¿Qué buscás? Ej.: colores de pastelería, más moderno"
                  className="h-11 w-full min-w-0 rounded-full border border-input bg-background px-5 text-[15px] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 sm:max-w-md"
                />
                <Button type="submit" variant="outline" size="lg" disabled={pidiendoCaminos} className="self-start sm:self-auto">
                  <RefreshCw data-icon="inline-start" className={pidiendoCaminos ? "animate-spin" : ""} />
                  {pidiendoCaminos ? "Pensando caminos…" : "Otros caminos"}
                </Button>
              </form>
              {pidiendoCaminos && (
                <div className="mt-4">
                  <Armando que="direcciones" />
                </div>
              )}
              {errorCaminos && (
                <p className="mt-3 text-sm text-destructive" role="alert">
                  {errorCaminos} Probá de nuevo.
                </p>
              )}
            </section>
          </>
        )}

        {estado.tipo === "armando" && (
          <div className="flex min-h-[60svh] flex-col items-start justify-center">
            <p className="label">Elegiste · {estado.direccion.nombre}</p>
            <h1 className={`${s.seCocina} display mt-3 max-w-[16ch]`}>
              Estamos armando <span className={s.it}>tu</span> marca.
            </h1>
            <p className="lead mt-4 max-w-[34em] text-base">
              La esencia (con misión y visión), la voz y el tono, los logos y el brandbook completo. Tarda unos 30 segundos.
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
              <Button variant="outline" size="sm" onClick={() => otroCamino(estado)}>
                Cambiar nombre o camino
              </Button>
            </div>
            <Brandbook
              identidad={estado.identidad}
              logos={estado.logos}
              elegido={estado.elegido}
              onElegir={(elegido) => actualizar((l) => ({ ...l, elegido }))}
              versiones={versiones}
              separando={separando !== null && separando === indiceElegido}
              onReintentarSimbolo={indiceElegido >= 0 ? () => void separarSimbolo(estado, indiceElegido, true) : undefined}
              gustos={{
                colores: estado.coloresGustan,
                onColor: (hex) => actualizar((l) => ({ ...l, coloresGustan: alternar(l.coloresGustan, hex) })),
                logos: estado.logosGustan,
                onLogo: (i) => actualizar((l) => ({ ...l, logosGustan: alternar(l.logosGustan, i) })),
              }}
              extra={{
                logo: (
                  <OtrosLogos
                    pedir={(pedido, iniciales) => otrosLogos(estado, pedido, iniciales)}
                    pidiendo={redibujando}
                    error={errorLogos}
                    marcados={estado.logosGustan.length}
                  />
                ),
                paleta: (
                  <OtraPaleta
                    versiones={estado.paletas}
                    actual={estado.paletas.findIndex((v) => huellaPaleta(v) === huellaPaleta(estado.identidad))}
                    onElegir={elegirPaleta}
                    pedir={(pedido) => pedirPaleta(estado, pedido)}
                    onNueva={nuevaPaleta}
                    logosViejos={estado.logos.length > 0 && !estado.paletasConLogos.includes(huellaPaleta(estado.identidad))}
                    onRedibujar={() => otrosLogos(estado).catch(() => {})}
                    redibujando={redibujando}
                    marcados={estado.identidad.paleta.filter((c) => estado.coloresGustan.includes(c.hex.toLowerCase())).length}
                  />
                ),
              }}
            />
            <div className="mt-4 flex flex-col gap-4">
              <Controles comprobaciones={estado.identidad.comprobaciones} />
              <Descargas identidad={estado.identidad} versiones={versiones} />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/crear/contenido" className={buttonVariants({ size: "lg" })}>
                Ver mis contenidos
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
