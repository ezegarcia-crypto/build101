"use client";

import { Button, buttonVariants } from "@build101/ui/components/button";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { EnConstruccion } from "@/app/crear/proximamente/_piezas/piezas";
import { BotonWeb } from "@/components/boton-web";
import {
  CLAVE_IDENTIDAD,
  contraste,
  type IdentidadIA,
  logoDeMarca,
  type MarcaGuardada,
  type PropuestaLogo,
  rolesDe,
  svgConTamano,
  svgSeguro,
} from "@/components/brandbook/identidad";
import { Armando } from "@/components/entrevista/armando";
import { CLAVE_FICHA } from "@/components/entrevista/ficha";
import { Pasos } from "@/components/pasos";
import { MENSAJE_FRENO, puedoArrancarSolo } from "@/lib/freno";
import type { ProductoSugerido } from "@/lib/ia/branderia";
import type { Brief } from "@/lib/ia/brief";

import s from "../entrevista/entrevista.module.css";
import b from "./branderia.module.css";
import { MUESTRAS } from "./muestras";

// Paso 4 · Tus productos (módulo C, BranderIA). Al entrar, la IA elige los productos que más le sirven a ese
// rubro (POST /api/branderia/sugerir) y saca la foto realista de esos primero y después de los 12 productos
// del catálogo, con la marca impresa (POST /api/branderia): recibe el logo real del cliente como referencia y
// lo imprime siguiendo el material. Cada producto lleva algo distinto: solo el logo, el nombre, una frase
// de la marca o combinaciones, como haría una marca de verdad con su merch.
// Mientras la IA trabaja se ve la ilustración del producto de la web original, con el logo encima.
// La cotización está en construcción: se arma el kit, pero no se cotiza, cobra ni pide nada.
// Las fotos quedan guardadas (achicadas) junto con su identidad: si se recarga, no se vuelven a pedir.

export const CLAVE_BRANDERIA = "brandia:branderia";

/** `logo`: el que eligió la persona en el brandbook (null: el símbolo solo) */
type Marca = { ficha: string; brief: Brief; identidad: IdentidadIA; logo: PropuestaLogo | null };

// Qué lleva impreso cada producto
type Estampa = "logo" | "logo-nombre" | "nombre" | "frase" | "logo-frase";

// El catálogo inicial (equipo/design-system.md § 6). `color`: "claro" (blanco, crudo o el fondo de la
// marca) o "marca" (el color principal). `tecnica`: cómo se marca ese material.
type Producto = {
  id: string;
  nombre: string;
  detalle: string;
  escena: string;
  estampa: Estampa;
  tecnica: string;
  color: "claro" | "marca";
  /** Solo los sugeridos por la IA: para qué le sirve a este negocio */
  por_que?: string;
};

const CATALOGO: Producto[] = [
  { id: "remera", nombre: "Remeras", detalle: "Algodón", estampa: "logo-frase", tecnica: "estampado en serigrafía", color: "claro",
    escena: "una remera de algodón colgada de frente en una percha de madera, con el pecho a cámara" },
  { id: "taza", nombre: "Tazas de café", detalle: "Cerámica", estampa: "logo-nombre", tecnica: "impreso en la cerámica", color: "claro",
    escena: "una taza de café de cerámica, de frente, con el asa a un costado" },
  { id: "tote", nombre: "Tote bags", detalle: "Algodón crudo", estampa: "frase", tecnica: "estampado en serigrafía", color: "claro",
    escena: "una tote bag de algodón crudo colgada o apoyada de frente, con la cara grande a cámara" },
  { id: "tarjetas", nombre: "Tarjetas", detalle: "Papel grueso", estampa: "logo-nombre", tecnica: "impreso", color: "claro",
    escena: "una pila de tarjetas personales de papel grueso vistas desde arriba, con la de arriba en el centro" },
  { id: "termo", nombre: "Termos para mate", detalle: "Acero, pico cebador", estampa: "logo", tecnica: "grabado láser", color: "marca",
    escena: "un termo de acero para mate con pico cebador, parado de frente" },
  { id: "mate", nombre: "Mates", detalle: "Con bombilla", estampa: "logo", tecnica: "grabado", color: "claro",
    escena: "un mate con bombilla de acero, de frente" },
  { id: "vaso", nombre: "Vasos térmicos", detalle: "Con tapa", estampa: "nombre", tecnica: "impreso", color: "claro",
    escena: "un vaso térmico con tapa, parado de frente" },
  { id: "gorro", nombre: "Gorros", detalle: "Bordados", estampa: "logo", tecnica: "bordado", color: "marca",
    escena: "un gorro tipo cap, de frente, con el frente a cámara" },
  { id: "folletos", nombre: "Folletos", detalle: "Tríptico", estampa: "logo-frase", tecnica: "impreso en la tapa", color: "claro",
    escena: "un folleto tríptico de papel, cerrado y apoyado de frente, con otro abierto atrás" },
  { id: "carpeta", nombre: "Carpetas", detalle: "Con bolsillo", estampa: "logo-nombre", tecnica: "impreso en la tapa", color: "marca",
    escena: "una carpeta institucional con bolsillo, cerrada, vista de frente" },
  { id: "lapicera", nombre: "Lapiceras", detalle: "Grabadas", estampa: "nombre", tecnica: "grabado a lo largo del cuerpo", color: "claro",
    escena: "dos lapiceras acostadas en diagonal sobre una libreta, con el cuerpo a la vista" },
  { id: "soporte", nombre: "Soportes de celular", detalle: "Para videollamadas", estampa: "logo", tecnica: "impreso", color: "claro",
    escena: "un soporte de escritorio para celular, de frente, con un celular apoyado" },
];

const CANTIDADES = [0, 25, 50, 100, 250, 500];
const A_LA_VEZ = 4;

type Foto = { estado: "pendiente" } | { estado: "sacando" } | { estado: "lista"; url: string } | { estado: "error" };

const aProducto = (p: ProductoSugerido, i: number): Producto => ({ ...p, id: `sugerido-${i + 1}` });

function leer<T>(clave: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(clave) ?? "null");
  } catch {
    return null;
  }
}

// Para reconocer si las fotos guardadas son de esta misma marca y de este mismo logo
// (v3: el logo elegido, que puede no ser el primero, y los productos sugeridos para el rubro)
const huella = (m: Marca) =>
  `v3|${m.ficha}|${m.identidad.nombre}|${m.identidad.paleta.map((c) => c.hex).join()}|${m.logo ? m.logo.imagen.slice(-48) : "simbolo"}`;

/** Las frases de la marca para los productos: el eslogan y las palabras propias, en ese orden. */
function frasesDe(id: IdentidadIA) {
  return [id.eslogan, ...id.voz.palabras_si].map((f) => f?.trim()).filter((f): f is string => !!f);
}

/** El pedido de la foto, con la marca aplicada. Sin IA: siempre igual para la misma entrada. */
function promptProducto(p: Producto, id: IdentidadIA, i: number) {
  const { fondo, principal, acento } = rolesDe(id.paleta);
  const frases = frasesDe(id);
  // Cada producto con frase toma una distinta, para que el kit no repita
  const frase = frases.length ? frases[i % frases.length] : id.nombre;
  const letras = `en letras al estilo de la tipografía ${id.tipografias.titulos}`;
  const nombre = `el nombre «${id.nombre}» ${letras}`;
  const queLleva = {
    logo: "solo el logo de la imagen adjunta",
    "logo-nombre": `el logo de la imagen adjunta y, debajo, ${nombre}`,
    nombre: `solo ${nombre}, sin el logo`,
    frase: `solo la frase «${frase}» ${letras}, sin el logo`,
    "logo-frase": `el logo de la imagen adjunta y, cerca, la frase «${frase}» ${letras}`,
  }[p.estampa];
  const claro = contraste(fondo, "#000000") >= 12;
  const color =
    p.color === "marca"
      ? `del color ${principal}`
      : claro
        ? `del color ${fondo} (o blanco o crudo, lo que quede más natural para el material)`
        : "blanco o crudo";
  return [
    `Foto de producto realista, de catálogo, de la marca «${id.nombre}»: ${p.escena}. El producto es ${color}.`,
    `Lleva ${queLleva}, ${p.tecnica}. Es un producto real ya fabricado: la marca sigue la forma, la curva y la textura del material, y toma su luz, sus sombras y su brillo.`,
    "El logo se copia exactamente igual al de la imagen adjunta: misma forma y mismos colores. Si no se lee sobre el color del producto, va en un solo color que contraste. El fondo blanco de la imagen adjunta no se imprime.",
    `Los textos se escriben exactamente como están, sin errores, en ${principal} o ${acento} (o en claro si el producto es oscuro).`,
    "El producto ocupa el centro, entero y bien a la vista.",
    `Fondo, luz y ambiente como las fotos de la marca: ${id.estilo.fotografia}`,
    `Que el fondo dialogue con la paleta (${id.paleta.map((c) => c.hex).join(", ")}) sin teñir la foto de un color.`,
    "Natural, con texturas reales, nada de aspecto de render. Ningún otro texto, logo ni marca comercial.",
  ].join("\n");
}

/** Dibuja una imagen en un lienzo cuadrado y la devuelve como data URL. */
async function aLienzo(src: string, lado: number, tipo: "image/png" | "image/jpeg") {
  const img = new Image();
  img.src = src;
  await img.decode();
  const corte = Math.min(img.naturalWidth, img.naturalHeight);
  const lienzo = document.createElement("canvas");
  lienzo.width = lienzo.height = lado;
  const c = lienzo.getContext("2d");
  if (!c) throw new Error("Sin lienzo");
  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, lado, lado);
  c.drawImage(img, (img.naturalWidth - corte) / 2, (img.naturalHeight - corte) / 2, corte, corte, 0, 0, lado, lado);
  return lienzo.toDataURL(tipo, 0.82);
}

/** El logo del cliente en PNG de 512, para mandárselo a la IA: el elegido o, si eligió el símbolo, el SVG. */
async function logoParaIA(m: Marca) {
  if (m.logo?.imagen) return aLienzo(m.logo.imagen, 512, "image/png");
  const svg = new Blob([svgConTamano(m.identidad.logo.isotipo_svg, 512)], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svg);
  try {
    return await aLienzo(url, 512, "image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function Branderia() {
  const [marca, setMarca] = useState<Marca | null | "sin-marca">(null);
  const [fotos, setFotos] = useState<Record<string, Foto>>(() =>
    Object.fromEntries(CATALOGO.map((p) => [p.id, { estado: "pendiente" }])),
  );
  const [nivel, setNivel] = useState<Record<string, number>>({});
  const [pedido, setPedido] = useState(false);
  // Los sugeridos para el rubro: cada vuelta suma productos nuevos, nunca borra los de antes
  const [sugeridos, setSugeridos] = useState<Producto[]>([]);
  const [pensando, setPensando] = useState(true);
  const [errorSugeridos, setErrorSugeridos] = useState<string | null>(null);
  // Las fotos de antes de cada producto (al sacar fotos nuevas, las anteriores quedan como alternativas)
  const [otras, setOtras] = useState<Record<string, string[]>>({});
  const otrasRef = useRef<Record<string, string[]>>({});
  const listas = useRef<Record<string, string>>({});
  const productos = useRef<Producto[]>(CATALOGO);
  const sugeridosGuardados = useRef<Producto[]>([]);
  const carrito = useRef<HTMLElement>(null);

  const guardarFotos = useCallback((m: Marca) => {
    try {
      sessionStorage.setItem(
        CLAVE_BRANDERIA,
        JSON.stringify({ huella: huella(m), fotos: listas.current, otras: otrasRef.current, sugeridos: sugeridosGuardados.current }),
      );
    } catch {
      // Si no entra, las fotos se ven igual, solo que no quedan guardadas
    }
  }, []);

  const sacar = useCallback(async (m: Marca, ids: string[], senal?: AbortSignal) => {
    setFotos((f) => ({ ...f, ...Object.fromEntries(ids.map((id) => [id, { estado: "sacando" } as Foto])) }));
    let logo: string;
    try {
      logo = await logoParaIA(m);
    } catch {
      setFotos((f) => ({ ...f, ...Object.fromEntries(ids.map((id) => [id, { estado: "error" } as Foto])) }));
      return;
    }
    const cola = [...ids];
    const trabajar = async () => {
      for (let id = cola.shift(); id; id = cola.shift()) {
        const i = productos.current.findIndex((x) => x.id === id);
        const p = productos.current[i];
        if (!p) continue;
        try {
          const res = await fetch("/api/branderia", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ prompt: promptProducto(p, m.identidad, i), logo }),
            signal: senal,
          });
          if (!res.ok) throw new Error();
          const { url } = (await res.json()) as { url: string };
          const chica = await aLienzo(url, 640, "image/jpeg");
          listas.current[p.id] = chica;
          setFotos((f) => ({ ...f, [p.id]: { estado: "lista", url: chica } }));
          guardarFotos(m);
        } catch {
          if (senal?.aborted) return;
          setFotos((f) => ({ ...f, [p.id]: { estado: "error" } }));
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(A_LA_VEZ, ids.length) }, trabajar));
  }, [guardarFotos]);

  /**
   * La IA elige productos para el rubro y se suman a los que ya había (sin repetirlos). Después se sacan
   * sus fotos, antes que las del catálogo.
   */
  const sugerir = useCallback(
    async (m: Marca, senal?: AbortSignal) => {
      setPensando(true);
      setErrorSugeridos(null);
      try {
        const ya = sugeridosGuardados.current;
        const res = await fetch("/api/branderia/sugerir", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            brief: m.brief,
            marca: { nombre: m.identidad.nombre, eslogan: m.identidad.eslogan },
            ya: ya.map((p) => p.nombre),
          }),
          signal: senal,
        });
        const datos = await res.json().catch(() => ({}));
        if (!res.ok || !Array.isArray(datos.productos)) throw new Error(datos?.error || "No pudimos pensar productos para tu rubro.");
        const nuevos = (datos.productos as ProductoSugerido[]).map((p, i) => aProducto(p, ya.length + i));
        const todos = [...ya, ...nuevos];
        sugeridosGuardados.current = todos;
        productos.current = [...todos, ...CATALOGO];
        setSugeridos(todos);
        guardarFotos(m);
        return nuevos;
      } catch (e) {
        if ((e as Error).name !== "AbortError") setErrorSugeridos((e as Error).message);
        return [];
      } finally {
        if (!senal?.aborted) setPensando(false);
      }
    },
    [guardarFotos],
  );

  /** Saca fotos nuevas de todo: las de antes quedan como alternativas de cada producto */
  function fotosNuevas(m: Marca, ids: string[]) {
    for (const id of ids) {
      const actual = listas.current[id];
      if (actual) otrasRef.current = { ...otrasRef.current, [id]: [actual, ...(otrasRef.current[id] ?? [])].slice(0, 4) };
      delete listas.current[id];
    }
    setOtras(otrasRef.current);
    guardarFotos(m);
    sacar(m, ids);
  }

  /** Pone una foto de antes como la principal (la que estaba pasa a las alternativas) */
  function usarOtra(m: Marca, id: string, url: string) {
    const actual = listas.current[id];
    otrasRef.current = { ...otrasRef.current, [id]: [...(actual ? [actual] : []), ...(otrasRef.current[id] ?? []).filter((u) => u !== url)] };
    listas.current[id] = url;
    setOtras(otrasRef.current);
    setFotos((f) => ({ ...f, [id]: { estado: "lista", url } }));
    guardarFotos(m);
  }

  useEffect(() => {
    const ficha = sessionStorage.getItem(CLAVE_FICHA);
    const brief = leer<Brief>(CLAVE_FICHA);
    const guardada = leer<MarcaGuardada>(CLAVE_IDENTIDAD);
    if (!ficha || !brief || guardada?.ficha !== ficha) return setMarca("sin-marca");
    const m = { ficha, brief, identidad: guardada.identidad, logo: logoDeMarca(guardada.logos ?? [], guardada.elegido) };
    setMarca(m);

    const previo = leer<{
      huella: string;
      fotos: Record<string, string>;
      otras?: Record<string, string[]>;
      sugeridos?: Producto[];
    }>(CLAVE_BRANDERIA);
    if (previo?.huella === huella(m)) {
      listas.current = previo.fotos;
      otrasRef.current = previo.otras ?? {};
      setOtras(otrasRef.current);
      if (previo.sugeridos?.length) {
        sugeridosGuardados.current = previo.sugeridos;
        productos.current = [...previo.sugeridos, ...CATALOGO];
        setSugeridos(previo.sugeridos);
        setPensando(false);
      }
      setFotos((f) => ({
        ...f,
        ...Object.fromEntries(Object.entries(previo.fotos).map(([id, url]) => [id, { estado: "lista", url } as Foto])),
      }));
    }

    const control = new AbortController();
    (async () => {
      // Si la página se recarga sola en loop, no se vuelve a pedir: quedan los botones para hacerlo a mano
      if (!puedoArrancarSolo("branderia")) {
        if (!sugeridosGuardados.current.length) {
          setPensando(false);
          setErrorSugeridos(MENSAJE_FRENO);
        }
        return;
      }
      // Primero los productos para su rubro (si no estaban guardados), después las fotos que falten:
      // las de los sugeridos van primero en la cola
      if (!sugeridosGuardados.current.length) await sugerir(m, control.signal);
      if (control.signal.aborted) return;
      const faltan = productos.current.filter((p) => !listas.current[p.id]).map((p) => p.id);
      if (faltan.length) await sacar(m, faltan, control.signal);
    })();
    return () => control.abort();
  }, [sacar, sugerir]);

  if (marca === null) return <main className="min-h-0 overflow-y-auto" />;

  const lista = [...sugeridos, ...CATALOGO];
  const errores = lista.filter((p) => fotos[p.id]?.estado === "error");
  const sacando = lista.some((p) => fotos[p.id]?.estado === "sacando");
  const elegidos = lista.filter((p) => (nivel[p.id] ?? 0) > 0);
  const unidades = elegidos.reduce((t, p) => t + (CANTIDADES[nivel[p.id] ?? 0] ?? 0), 0);

  function cambiar(id: string, paso: number) {
    setPedido(false);
    setNivel((n) => ({ ...n, [id]: Math.min(Math.max((n[id] ?? 0) + paso, 0), CANTIDADES.length - 1) }));
  }

  function quitar(id: string) {
    setPedido(false);
    setNivel((n) => ({ ...n, [id]: 0 }));
  }

  return (
    <main className="min-h-0 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1080px] px-4 pt-5 pb-16">
        <div className="flex items-center justify-between gap-3">
          <Pasos actual={3} />
          <Link href="/crear/contenido" className={`${buttonVariants({ variant: "ghost", size: "xs" })} text-foreground`}>
            <ArrowLeft data-icon="inline-start" />
            <span className="hidden sm:inline">Volver a tu contenido</span>
          </Link>
        </div>

        {marca === "sin-marca" ? (
          <div className={`${s.entra} flex min-h-[60svh] flex-col items-start justify-center`}>
            <h1 className="display max-w-[16ch]">
              Primero, armemos <span className={s.it}>tu</span> marca.
            </h1>
            <p className="lead mt-4 max-w-[34em] text-base">
              Los productos se hacen con tu identidad: tu logo, tus colores y tu estilo de fotos.
            </p>
            <Link href="/crear" className={`${buttonVariants({ size: "lg" })} mt-8`}>
              Empezar por la entrevista
              <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
        ) : (
          <>
            <div className={`${s.entra} mt-10 mb-8 flex flex-col gap-4`}>
              <p className="label">Módulo C · BranderIA</p>
              <h1 className={`${s.seCocina} display max-w-[18ch]`}>
                {marca.identidad.nombre}, <span className={s.it}>en tus manos.</span>
              </h1>
              <p className="lead max-w-[34em] text-base">
                La IA saca la foto de cada producto con tu marca impresa: tu logo, tu nombre y tus frases. Elegí
                cantidades y armá tu kit: BrandIA lo produce y te lo manda.
              </p>
            </div>

            {/* En celular el carrito queda abajo del catálogo: esta barra lo deja a mano */}
            <div className="sticky top-0 z-10 -mx-4 mb-3 bg-background/85 px-4 py-2 backdrop-blur md:hidden">
              <div className="flex items-center gap-3 rounded-[16px] border bg-card p-3 pl-4">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Tu kit</span>
                  <span aria-live="polite" className="font-semibold">
                    {elegidos.length ? resumen(elegidos.length, unidades) : "Elegí productos y cantidades"}
                  </span>
                </div>
                <Button
                  className="ml-auto"
                  disabled={!elegidos.length}
                  onClick={() => carrito.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                >
                  Ver kit <span aria-hidden>↓</span>
                </Button>
              </div>
            </div>

            <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="flex flex-col gap-3">
                {errores.length > 0 && !sacando && (
                  <Button variant="outline" className="self-start" onClick={() => sacar(marca, errores.map((p) => p.id))}>
                    <RotateCcw data-icon="inline-start" />
                    Volver a probar {errores.length === 1 ? "1 foto" : `${errores.length} fotos`}
                  </Button>
                )}
                <section aria-labelledby="titulo-sugeridos" className="flex flex-col gap-3">
                  <div>
                    <p className="label flex items-center gap-1.5">
                      <Sparkles className="size-3.5" aria-hidden="true" />
                      Pensados para tu negocio
                    </p>
                    <h2 id="titulo-sugeridos" className="mt-1 text-[clamp(1.4rem,1.1rem+1vw,1.9rem)]">
                      Lo que más vas a <span className={s.it}>usar</span>.
                    </h2>
                  </div>
                  {sugeridos.length > 0 && (
                    <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
                      {sugeridos.map((p) => (
                        <Tarjeta
                          key={p.id}
                          producto={p}
                          foto={fotos[p.id] ?? { estado: "pendiente" }}
                          marca={marca}
                          cantidad={nivel[p.id] ?? 0}
                          onCambiar={(paso) => cambiar(p.id, paso)}
                          onSacar={() => sacar(marca, [p.id])}
                          otras={otras[p.id] ?? []}
                          onUsarOtra={(url) => usarOtra(marca, p.id, url)}
                        />
                      ))}
                    </ul>
                  )}
                  {pensando && (
                    <div className="rounded-lg border bg-card p-4">
                      <Armando que="productos" />
                    </div>
                  )}
                  {errorSugeridos && !pensando && (
                    <p className="text-sm text-muted-foreground" role="alert">
                      {errorSugeridos}
                    </p>
                  )}
                  {!pensando && (
                    <Button
                      variant="outline"
                      className="self-start"
                      onClick={async () => {
                        const nuevos = await sugerir(marca);
                        if (nuevos.length) sacar(marca, nuevos.map((p) => p.id));
                      }}
                    >
                      <Sparkles data-icon="inline-start" />
                      {sugeridos.length ? "Sugerir otros productos" : "Pensar productos para mi rubro"}
                    </Button>
                  )}
                </section>

                <p className="label mt-6">El catálogo</p>
                <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
                  {CATALOGO.map((p) => (
                    <Tarjeta
                      key={p.id}
                      producto={p}
                      foto={fotos[p.id] ?? { estado: "pendiente" }}
                      marca={marca}
                      cantidad={nivel[p.id] ?? 0}
                      onCambiar={(paso) => cambiar(p.id, paso)}
                      onSacar={() => sacar(marca, [p.id])}
                      otras={otras[p.id] ?? []}
                      onUsarOtra={(url) => usarOtra(marca, p.id, url)}
                    />
                  ))}
                </ul>
              </div>

              {/* El carrito: desde pantallas medianas queda fijo a la derecha mientras se recorre el catálogo */}
              <aside
                ref={carrito}
                aria-label="Tu kit"
                className="flex scroll-mt-24 flex-col gap-4 rounded-[16px] border bg-card p-4 md:sticky md:top-4 md:max-h-[calc(100svh-6rem)] md:overflow-y-auto"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-xl">Tu kit</h2>
                  {elegidos.length > 0 && (
                    <span className="text-sm text-muted-foreground">{resumen(elegidos.length, unidades)}</span>
                  )}
                </div>

                {elegidos.length ? (
                  <ul className="flex flex-col divide-y">
                    {elegidos.map((p) => {
                      const n = nivel[p.id] ?? 0;
                      const foto = fotos[p.id];
                      return (
                        <li key={p.id} className={`${s.entra} flex items-center gap-3 py-3 first:pt-0`}>
                          <div className="relative size-14 shrink-0 overflow-hidden rounded-[8px] bg-muted">
                            <Vista producto={p} foto={foto ?? { estado: "pendiente" }} marca={marca} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 leading-tight">
                                <p className="truncate text-[0.9375rem] font-semibold">{p.nombre}</p>
                                <p className="truncate text-xs text-muted-foreground">{p.detalle}</p>
                              </div>
                              <button
                                type="button"
                                aria-label={`Sacar ${p.nombre} del kit`}
                                onClick={() => quitar(p.id)}
                                className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors duration-300 ease-brandia hover:bg-muted hover:text-foreground"
                              >
                                <X className="size-3.5" />
                              </button>
                            </div>
                            <div className="mt-1.5 flex items-center gap-2">
                              <Paso etiqueta={`Menos ${p.nombre}`} disabled={n === 0} onClick={() => cambiar(p.id, -1)} chico>
                                −
                              </Paso>
                              <span className="w-14 text-center text-sm tabular-nums">{CANTIDADES[n]} u.</span>
                              <Paso
                                etiqueta={`Más ${p.nombre}`}
                                disabled={n === CANTIDADES.length - 1}
                                onClick={() => cambiar(p.id, 1)}
                                chico
                              >
                                +
                              </Paso>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="rounded-[10px] border border-dashed border-foreground/20 p-4 text-center text-sm text-muted-foreground">
                    Tu kit está vacío. Sumá productos con el <span className="font-semibold text-foreground">+</span>.
                  </p>
                )}

                <dl className="flex flex-col gap-1.5 border-t pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Unidades</dt>
                    <dd className="font-semibold tabular-nums">{unidades}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Envío</dt>
                    <dd>A tu puerta</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Precio</dt>
                    <dd className="text-muted-foreground">Todavía sin precios</dd>
                  </div>
                </dl>

                <Button size="lg" disabled={!elegidos.length} onClick={() => setPedido(true)}>
                  Cotizar <span aria-hidden>→</span>
                </Button>

                {pedido && (
                  <div
                    role="status"
                    className={`${s.entra} flex flex-col gap-2.5 rounded-[12px] bg-primary p-4 text-primary-foreground`}
                  >
                    <div>
                      <EnConstruccion texto="La cotización está en construcción" />
                    </div>
                    <p className="font-semibold">Así va a funcionar.</p>
                    <p className="text-sm opacity-85">
                      BrandIA te cotiza tu kit. Si te sirve, produce cada producto con tu marca, controla que salga
                      bien y te lo manda a tu puerta. Todavía no se cotizó, pidió ni cobró nada.
                    </p>
                  </div>
                )}
              </aside>
            </div>

            <p className="mt-6 max-w-[40em] text-sm text-muted-foreground">
              Las fotos las genera la IA con tu logo y el estilo de {marca.identidad.nombre}. Sin precios ni pedidos
              reales por ahora.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              disabled={sacando}
              onClick={() => fotosNuevas(marca, lista.map((p) => p.id))}
            >
              <RotateCcw data-icon="inline-start" />
              Sacar fotos nuevas
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">Las de ahora no se borran: quedan como alternativas de cada producto.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <BotonWeb />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Tarjeta({
  producto: p,
  foto,
  marca,
  cantidad,
  onCambiar,
  onSacar,
  otras,
  onUsarOtra,
}: {
  producto: Producto;
  foto: Foto;
  marca: Marca;
  cantidad: number;
  onCambiar: (paso: number) => void;
  onSacar: () => void;
  /** Fotos de antes del producto, para volver a una */
  otras: string[];
  onUsarOtra: (url: string) => void;
}) {
  return (
    <li className="flex flex-col gap-2.5 rounded-lg border bg-card p-3 transition-[transform,box-shadow] duration-500 ease-brandia hover:-translate-y-1.5 hover:shadow-[0_24px_40px_-24px_rgba(30,30,28,.35)]">
      <div className="relative aspect-square overflow-hidden rounded-[10px] bg-muted">
        <Vista producto={p} foto={foto} marca={marca} />
        {foto.estado === "sacando" && (
          <span
            role="status"
            className={`${b.respira} absolute inset-x-2 bottom-2 rounded-full bg-card/90 px-2 py-1 text-center text-[0.6875rem] font-semibold`}
          >
            Sacando la foto con tu marca…
          </span>
        )}
        {(foto.estado === "error" || foto.estado === "pendiente") && (
          <button
            type="button"
            onClick={onSacar}
            className="absolute inset-x-2 bottom-2 rounded-full bg-card/90 px-2 py-1 text-[0.6875rem] font-semibold underline-offset-4 hover:underline"
          >
            {foto.estado === "error" ? "No salió la foto · Probar de nuevo" : "Verlo con mi marca"}
          </button>
        )}
      </div>
      {otras.length > 0 && foto.estado !== "sacando" && (
        <div className="flex items-center gap-1.5" aria-label="Fotos anteriores">
          {otras.map((url, i) => (
            <button
              key={url.slice(-40)}
              type="button"
              onClick={() => onUsarOtra(url)}
              aria-label={`Usar la foto anterior ${i + 1} de ${p.nombre}`}
              className="size-9 overflow-hidden rounded-[4px] border transition-transform duration-300 ease-brandia hover:-translate-y-0.5"
            >
              <img src={url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="leading-tight">
        <p className="text-[0.9375rem] font-semibold">{p.nombre}</p>
        <p className="text-xs text-muted-foreground">{p.detalle}</p>
        {p.por_que && <p className="mt-1.5 text-xs leading-snug">{p.por_que}</p>}
      </div>
      <div className="mt-auto flex items-center justify-between gap-1">
        <Paso etiqueta={`Menos ${p.nombre}`} disabled={cantidad === 0} onClick={() => onCambiar(-1)}>
          −
        </Paso>
        <span className="text-sm tabular-nums">{CANTIDADES[cantidad] ? `${CANTIDADES[cantidad]} u.` : "—"}</span>
        <Paso etiqueta={`Más ${p.nombre}`} disabled={cantidad === CANTIDADES.length - 1} onClick={() => onCambiar(1)}>
          +
        </Paso>
      </div>
    </li>
  );
}

const resumen = (productos: number, unidades: number) =>
  `${productos} producto${productos > 1 ? "s" : ""} · ${unidades} unidades`;

/**
 * La foto del producto con la marca impresa por la IA. Mientras no está, la ilustración del producto de
 * la web original con el logo del cliente que "cae" en su lugar.
 */
function Vista({ producto: p, foto, marca }: { producto: Producto; foto: Foto; marca: Marca }) {
  if (foto.estado === "lista") {
    return (
      <img src={foto.url} alt={`${p.nombre} con la marca ${marca.identidad.nombre}`} className={`${b.foto} size-full object-cover`} />
    );
  }
  const m = MUESTRAS[p.id];
  const logo = marca.logo?.imagen;
  return (
    <div className="relative size-full">
      {m && (
        <svg viewBox="0 0 100 100" aria-hidden className="size-full" dangerouslySetInnerHTML={{ __html: m.svg }} />
      )}
      <span
        aria-hidden
        className={`${b.cae} absolute aspect-square -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[3px]`}
        style={{ left: m?.x ?? "50%", top: m?.y ?? "50%", width: m?.ancho ?? "24%", animationDelay: "0.35s" }}
      >
        {logo ? (
          <img src={logo} alt="" className="size-full object-contain" />
        ) : (
          <span
            className="block size-full [&>svg]:size-full"
            dangerouslySetInnerHTML={{ __html: svgSeguro(marca.identidad.logo.isotipo_svg) }}
          />
        )}
      </span>
    </div>
  );
}

/** El botón redondo de − y + de las cantidades */
function Paso({
  etiqueta,
  disabled,
  onClick,
  chico,
  children,
}: {
  etiqueta: string;
  disabled: boolean;
  onClick: () => void;
  chico?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      disabled={disabled}
      onClick={onClick}
      className={`grid ${chico ? "size-7 text-sm" : "size-8 text-base"} place-items-center rounded-full border transition-colors duration-300 ease-brandia hover:bg-muted disabled:opacity-35`}
    >
      {children}
    </button>
  );
}
