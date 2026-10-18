"use client";

import { Button, buttonVariants } from "@build101/ui/components/button";
import { ArrowLeft, ArrowRight, Info, Plus, RotateCcw, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { BotonWeb } from "@/components/boton-web";
import { simboloConNombre } from "@/components/brandbook/archivos";
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
import { CLAVE_FICHA } from "@/components/entrevista/ficha";
import { LogoBranderia } from "@/components/logo-branderia";
import { alternar, MeGusta } from "@/components/me-gusta";
import { Pasos } from "@/components/pasos";
import { MENSAJE_FRENO, puedoArrancarSolo } from "@/lib/freno";
import { PRODUCTOS_MAS, PRODUCTOS_SUGERIDOS, type ProductoSugerido } from "@/lib/ia/branderia";
import type { Brief } from "@/lib/ia/brief";
import { MAXIMO_UNIDADES } from "@/lib/pedidos";

import s from "../entrevista/entrevista.module.css";
import b from "./branderia.module.css";
import { PedirKit } from "./pedido";

// Paso 4 · Tus productos (módulo C, BranderIA). Al entrar, la IA elige los 10 productos con la marca que más le
// sirven a ESE negocio (POST /api/branderia/sugerir: una pastelería, cajas y bolsas; un estudio, tarjetas y
// carpetas) y saca la foto realista de cada uno con la marca impresa (POST /api/branderia): recibe el logo que
// eligió la persona como referencia y lo imprime siguiendo el material.
// Mientras tanto se ve una pantalla de carga con el logo de BranderIA y una barra: los productos aparecen
// completos, con todas sus fotos, de una sola vez. Después se pueden sumar más ("Otras opciones", en la línea
// de los marcados con ♥) o pedir en palabras los que faltan; lo nuevo aparece cuando sus fotos están listas.
// Nada se borra: las fotos de antes quedan como alternativas de cada producto.
// Las cantidades van con − y + y una barra, en la escala que propone la IA para cada producto (un cartel de a 1;
// las tarjetas, de a 50 o 100). El pedido se guarda de verdad (pedido.tsx → POST /api/branderia/pedido), sale por
// WhatsApp al de BrandIA y el equipo lo ve en /pedidos, pero no se cobra: BrandIA le responde con la cotización.
// Todo queda guardado (las fotos achicadas) junto con su marca: si se recarga, no se vuelve a pedir.

export const CLAVE_BRANDERIA = "brandia:branderia";

/** `logo`: el que eligió la persona en el brandbook (null: el símbolo, solo o `conNombre`) */
type Marca = { ficha: string; brief: Brief; identidad: IdentidadIA; logo: PropuestaLogo | null; conNombre: boolean };

type Producto = ProductoSugerido & { id: string };

type Foto = { estado: "pendiente" } | { estado: "sacando" } | { estado: "lista"; url: string } | { estado: "error" };

/** Lo que queda guardado en la pestaña */
type Guardado = {
  huella: string;
  productos: Producto[];
  fotos: Record<string, string>;
  otras: Record<string, string[]>;
  gustan: string[];
};

/** Cómo va una carga: primero la IA piensa los productos y después saca sus fotos */
type Avance = { fase: "pensando" | "fotos"; listas: number; total: number };

const A_LA_VEZ = 5;

/**
 * De cuánto a cuánto se pide un producto: lo propone la IA (cantidad_minima, cantidad_paso y cantidad_tipica).
 * Si no vino o vino raro, lo prudente: desde 1, de a 1. La barra llega hasta 4 veces la típica (20 pasos como mínimo).
 */
function escala(p: Partial<ProductoSugerido>) {
  const entero = (n: unknown, otro: number) => (typeof n === "number" && Number.isFinite(n) && n >= 1 ? Math.round(n) : otro);
  const minimo = Math.min(entero(p.cantidad_minima, 1), MAXIMO_UNIDADES / 2);
  const paso = Math.min(entero(p.cantidad_paso, 1), 1000);
  const tipica = entero(p.cantidad_tipica, minimo);
  const enPaso = (n: number, redondeo: (x: number) => number) =>
    minimo + redondeo((Math.min(Math.max(n, minimo), MAXIMO_UNIDADES) - minimo) / paso) * paso;
  const maximo = enPaso(Math.max(minimo + paso * 20, tipica * 4), Math.floor);
  return { minimo, paso, maximo, tipica: Math.min(enPaso(tipica, Math.round), maximo) };
}

function leer<T>(clave: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(clave) ?? "null");
  } catch {
    return null;
  }
}

// Para reconocer si lo guardado es de esta misma marca y de este mismo logo
// (v5: cada producto trae su escala de cantidades; v4: los productos los elige la IA para el rubro)
const huella = (m: Marca) =>
  `v5|${m.ficha}|${m.identidad.nombre}|${m.identidad.paleta.map((c) => c.hex).join()}|${m.logo ? m.logo.imagen.slice(-48) : m.conNombre ? "simbolo-nombre" : "simbolo"}`;

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
  if (m.conNombre && m.identidad.logo.isotipo_svg) {
    // El símbolo con el nombre es apaisado: entra entero en el cuadrado, sin recortarse
    const ancho = await simboloConNombre(m.identidad, 160);
    const lienzo = document.createElement("canvas");
    lienzo.width = lienzo.height = 512;
    const c = lienzo.getContext("2d");
    if (!c) throw new Error("Sin lienzo");
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, 512, 512);
    const escala = Math.min(480 / ancho.width, 480 / ancho.height);
    const [w, h] = [ancho.width * escala, ancho.height * escala];
    c.drawImage(ancho, (512 - w) / 2, (512 - h) / 2, w, h);
    return lienzo.toDataURL("image/png");
  }
  const svg = new Blob([svgConTamano(m.identidad.logo.isotipo_svg, 512)], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svg);
  try {
    return await aLienzo(url, 512, "image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Cuánto va de una carga, de 0 a 1: pensar los productos es el primer tramo y las fotos, el resto */
const porcentaje = (a: Avance) => (a.fase === "pensando" ? 0.08 : 0.12 + (0.88 * a.listas) / Math.max(1, a.total));

export function Branderia() {
  const [marca, setMarca] = useState<Marca | null | "sin-marca">(null);
  /** Los productos a la vista (los que se están sumando aparecen recién cuando tienen sus fotos) */
  const [productos, setProductos] = useState<Producto[]>([]);
  const [fotos, setFotos] = useState<Record<string, Foto>>({});
  const [otras, setOtras] = useState<Record<string, string[]>>({});
  const [gustan, setGustan] = useState<string[]>([]);
  /** La primera carga: hasta que están todas las fotos, la pantalla de carga */
  const [inicio, setInicio] = useState<{ tipo: "cargando"; avance: Avance } | { tipo: "listo" } | { tipo: "error"; mensaje: string }>(
    { tipo: "cargando", avance: { fase: "pensando", listas: 0, total: PRODUCTOS_SUGERIDOS } },
  );
  /** Una carga de productos nuevos, con la página ya a la vista */
  const [sumando, setSumando] = useState<{ que: string; avance: Avance } | null>(null);
  const [errorSumar, setErrorSumar] = useState<string | null>(null);
  const [pedidoNuevo, setPedidoNuevo] = useState("");
  const [renovando, setRenovando] = useState(false);
  /** Las unidades de cada producto en el kit (0: no está) */
  const [cantidad, setCantidad] = useState<Record<string, number>>({});

  // Lo mismo que el estado, para leerlo dentro de las cargas sin esperar a que React vuelva a dibujar
  const listas = useRef<Record<string, string>>({});
  const otrasRef = useRef<Record<string, string[]>>({});
  const mostrados = useRef<Producto[]>([]);
  const gustanRef = useRef<string[]>([]);
  const vistos = useRef(0);
  const carrito = useRef<HTMLElement>(null);

  const guardarTodo = useCallback((m: Marca) => {
    const g: Guardado = {
      huella: huella(m),
      productos: mostrados.current,
      fotos: listas.current,
      otras: otrasRef.current,
      gustan: gustanRef.current,
    };
    try {
      sessionStorage.setItem(CLAVE_BRANDERIA, JSON.stringify(g));
    } catch {
      // Las fotos pesan: si no entran las alternativas, se guarda sin ellas
      try {
        sessionStorage.setItem(CLAVE_BRANDERIA, JSON.stringify({ ...g, otras: {} }));
      } catch {}
    }
  }, []);

  /** La IA elige productos (los nuevos, sin repetir lo que ya vio y en la línea de lo marcado con ♥) */
  const pedirProductos = useCallback(async (m: Marca, opciones: { cantidad: number; pedido?: string }, senal?: AbortSignal) => {
    const res = await fetch("/api/branderia/sugerir", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        brief: m.brief,
        marca: { nombre: m.identidad.nombre, eslogan: m.identidad.eslogan },
        ya: mostrados.current.map((p) => p.nombre),
        gustan: mostrados.current.filter((p) => gustanRef.current.includes(p.id)).map((p) => p.nombre),
        pedido: opciones.pedido?.trim() || undefined,
        cantidad: opciones.cantidad,
      }),
      signal: senal,
    });
    const datos = await res.json().catch(() => ({}));
    if (!res.ok || !Array.isArray(datos.productos)) throw new Error(datos?.error || "No pudimos pensar productos para tu rubro.");
    return (datos.productos as ProductoSugerido[]).map((p) => ({ ...p, id: `p${++vistos.current}` }));
  }, []);

  /** Saca las fotos de esos productos (de a 5) y avisa cuántas van. Termina cuando están todas, salgan o no. */
  const sacarFotos = useCallback(
    async (m: Marca, lista: Producto[], senal?: AbortSignal, avisar?: (listas: number) => void) => {
      setFotos((f) => ({ ...f, ...Object.fromEntries(lista.map((p) => [p.id, { estado: "sacando" } as Foto])) }));
      let logo: string;
      try {
        logo = await logoParaIA(m);
      } catch {
        setFotos((f) => ({ ...f, ...Object.fromEntries(lista.map((p) => [p.id, { estado: "error" } as Foto])) }));
        avisar?.(lista.length);
        return;
      }
      const cola = [...lista];
      let hechas = 0;
      const trabajar = async () => {
        for (let p = cola.shift(); p; p = cola.shift()) {
          // Cada producto toma una frase distinta según su número (p1, p2…), para que el kit no repita
          const i = Number(p.id.slice(1)) || 0;
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
            listas.current = { ...listas.current, [p.id]: chica };
            setFotos((f) => ({ ...f, [p.id]: { estado: "lista", url: chica } }));
          } catch {
            if (senal?.aborted) return;
            setFotos((f) => ({ ...f, [p.id]: { estado: "error" } }));
          }
          avisar?.(++hechas);
        }
      };
      await Promise.all(Array.from({ length: Math.min(A_LA_VEZ, lista.length) }, trabajar));
    },
    [],
  );

  /** Al entrar: la IA piensa los 10 productos, se sacan todas las fotos y recién ahí se muestra todo */
  const arrancar = useCallback(
    async (m: Marca, senal?: AbortSignal) => {
      const total = PRODUCTOS_SUGERIDOS;
      setInicio({ tipo: "cargando", avance: { fase: "pensando", listas: 0, total } });
      let nuevos: Producto[];
      try {
        nuevos = await pedirProductos(m, { cantidad: total }, senal);
      } catch (e) {
        if (!senal?.aborted) setInicio({ tipo: "error", mensaje: (e as Error).message });
        return;
      }
      if (senal?.aborted) return;
      mostrados.current = nuevos;
      setInicio({ tipo: "cargando", avance: { fase: "fotos", listas: 0, total: nuevos.length } });
      await sacarFotos(m, nuevos, senal, (n) =>
        setInicio({ tipo: "cargando", avance: { fase: "fotos", listas: n, total: nuevos.length } }),
      );
      if (senal?.aborted) return;
      setProductos(nuevos);
      guardarTodo(m);
      setInicio({ tipo: "listo" });
    },
    [pedirProductos, sacarFotos, guardarTodo],
  );

  useEffect(() => {
    const ficha = sessionStorage.getItem(CLAVE_FICHA);
    const brief = leer<Brief>(CLAVE_FICHA);
    const guardada = leer<MarcaGuardada>(CLAVE_IDENTIDAD);
    if (!ficha || !brief || guardada?.ficha !== ficha) return setMarca("sin-marca");
    const m = {
      ficha,
      brief,
      identidad: guardada.identidad,
      logo: logoDeMarca(guardada.logos ?? [], guardada.elegido),
      conNombre: guardada.elegido === "simbolo-nombre",
    };
    setMarca(m);

    const previo = leer<Guardado>(CLAVE_BRANDERIA);
    if (previo?.huella === huella(m) && previo.productos?.length) {
      listas.current = previo.fotos ?? {};
      otrasRef.current = previo.otras ?? {};
      mostrados.current = previo.productos;
      gustanRef.current = previo.gustan ?? [];
      vistos.current = Math.max(0, ...previo.productos.map((p) => Number(p.id.slice(1)) || 0));
      setProductos(previo.productos);
      setOtras(otrasRef.current);
      setGustan(gustanRef.current);
      setFotos(
        Object.fromEntries(
          previo.productos.map((p) => [p.id, listas.current[p.id] ? { estado: "lista", url: listas.current[p.id]! } : { estado: "error" }]),
        ),
      );
      return setInicio({ tipo: "listo" });
    }

    // Si la página se recarga sola en loop, no se vuelve a pedir: queda el botón para hacerlo a mano
    if (!puedoArrancarSolo("branderia")) return setInicio({ tipo: "error", mensaje: MENSAJE_FRENO });
    const control = new AbortController();
    arrancar(m, control.signal);
    return () => control.abort();
  }, [arrancar]);

  if (marca === null) return <main className="min-h-0 overflow-y-auto" />;

  /** Suma productos: "Otras opciones" (sin pedido) o los que pide en palabras. Aparecen cuando tienen foto. */
  async function sumar(m: Marca, pedidoTexto?: string) {
    if (sumando) return;
    const que = pedidoTexto?.trim() ? `Buscando «${pedidoTexto.trim()}»` : "Pensando otras opciones";
    setErrorSumar(null);
    setSumando({ que, avance: { fase: "pensando", listas: 0, total: PRODUCTOS_MAS } });
    try {
      const nuevos = await pedirProductos(m, { cantidad: PRODUCTOS_MAS, pedido: pedidoTexto });
      if (!nuevos.length) throw new Error("No encontramos productos nuevos para eso.");
      setSumando({ que, avance: { fase: "fotos", listas: 0, total: nuevos.length } });
      await sacarFotos(m, nuevos, undefined, (n) => setSumando({ que, avance: { fase: "fotos", listas: n, total: nuevos.length } }));
      mostrados.current = [...mostrados.current, ...nuevos];
      setProductos(mostrados.current);
      guardarTodo(m);
      setPedidoNuevo("");
      // Que se vean los nuevos
      requestAnimationFrame(() => document.getElementById(`producto-${nuevos[0]!.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    } catch (e) {
      setErrorSumar((e as Error).message);
    } finally {
      setSumando(null);
    }
  }

  /** Fotos nuevas de todo: las de ahora quedan como alternativas de cada producto (y se ven mientras tanto) */
  async function fotosNuevas(m: Marca) {
    setRenovando(true);
    for (const p of mostrados.current) {
      const actual = listas.current[p.id];
      if (actual) otrasRef.current = { ...otrasRef.current, [p.id]: [actual, ...(otrasRef.current[p.id] ?? [])].slice(0, 4) };
    }
    setOtras(otrasRef.current);
    await sacarFotos(m, mostrados.current);
    guardarTodo(m);
    setRenovando(false);
  }

  /** Una sola foto (la que no salió, o una nueva para ese producto) */
  async function otraFoto(m: Marca, p: Producto) {
    const actual = listas.current[p.id];
    if (actual) {
      otrasRef.current = { ...otrasRef.current, [p.id]: [actual, ...(otrasRef.current[p.id] ?? [])].slice(0, 4) };
      setOtras(otrasRef.current);
    }
    await sacarFotos(m, [p]);
    guardarTodo(m);
  }

  /** Pone una foto de antes como la principal (la que estaba pasa a las alternativas) */
  function usarOtra(m: Marca, id: string, url: string) {
    const actual = listas.current[id];
    otrasRef.current = { ...otrasRef.current, [id]: [...(actual ? [actual] : []), ...(otrasRef.current[id] ?? []).filter((u) => u !== url)] };
    listas.current = { ...listas.current, [id]: url };
    setOtras(otrasRef.current);
    setFotos((f) => ({ ...f, [id]: { estado: "lista", url } }));
    guardarTodo(m);
  }

  function meGusta(m: Marca, id: string) {
    gustanRef.current = alternar(gustanRef.current, id);
    setGustan(gustanRef.current);
    guardarTodo(m);
  }

  const sacando = productos.some((p) => fotos[p.id]?.estado === "sacando");
  const elegidos = productos.filter((p) => (cantidad[p.id] ?? 0) > 0);
  const unidades = elegidos.reduce((t, p) => t + (cantidad[p.id] ?? 0), 0);

  /** El + suma un paso (o, si no estaba en el kit, la cantidad típica); el − resta uno y debajo de la mínima lo saca */
  function cambiar(p: Producto, sentido: 1 | -1) {
    const e = escala(p);
    setCantidad((c) => {
      const n = c[p.id] ?? 0;
      const nueva = sentido > 0 ? (n ? Math.min(n + e.paso, e.maximo) : e.tipica) : n - e.paso < e.minimo ? 0 : n - e.paso;
      return { ...c, [p.id]: nueva };
    });
  }

  function fijar(id: string, n: number) {
    setCantidad((c) => ({ ...c, [id]: n }));
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

        {marca === "sin-marca" && (
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
        )}

        {marca !== "sin-marca" && inicio.tipo === "cargando" && <Carga marca={marca} avance={inicio.avance} />}

        {marca !== "sin-marca" && inicio.tipo === "error" && (
          <div className={`${s.entra} flex min-h-[60svh] flex-col items-start justify-center`}>
            <h1 className="display max-w-[16ch]">Algo se trabó.</h1>
            <p className="lead mt-4 max-w-[34em] text-base">{inicio.mensaje} Tu marca sigue guardada.</p>
            <Button size="lg" className="mt-8" onClick={() => arrancar(marca)}>
              Probar de nuevo
            </Button>
          </div>
        )}

        {marca !== "sin-marca" && inicio.tipo === "listo" && (
          <>
            <div className={`${s.entra} mt-10 mb-8 flex flex-col gap-4`}>
              <p className="label">Módulo C · BranderIA</p>
              <h1 className={`${s.seCocina} display max-w-[18ch]`}>
                {marca.identidad.nombre}, <span className={s.it}>en tus manos.</span>
              </h1>
              <p className="lead max-w-[36em] text-base">
                Los productos que más le sirven a tu negocio, con tu marca impresa. Marcá con ♥ los que te gustan, elegí
                cantidades y armá tu kit: BrandIA lo produce y te lo manda.
              </p>
            </div>

            {/* En celular el carrito queda abajo de los productos: esta barra lo deja a mano */}
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
              <div className="flex flex-col gap-4">
                <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
                  {productos.map((p) => (
                    <Tarjeta
                      key={p.id}
                      producto={p}
                      foto={fotos[p.id] ?? { estado: "error" }}
                      marca={marca}
                      cantidad={cantidad[p.id] ?? 0}
                      onCambiar={(sentido) => cambiar(p, sentido)}
                      onFijar={(n) => fijar(p.id, n)}
                      onSacar={() => otraFoto(marca, p)}
                      otras={otras[p.id] ?? []}
                      onUsarOtra={(url) => usarOtra(marca, p.id, url)}
                      meGusta={gustan.includes(p.id)}
                      onMeGusta={() => meGusta(marca, p.id)}
                    />
                  ))}
                </ul>

                {/* Sumar productos: otras opciones o lo que falta, pedido en palabras */}
                <section aria-labelledby="titulo-sumar" className="rounded-lg border bg-card p-5">
                  <h2 id="titulo-sumar" className="text-[clamp(1.3rem,1.1rem+0.8vw,1.7rem)]">
                    ¿Te falta <span className={s.it}>algo</span>?
                  </h2>
                  {sumando ? (
                    <div className="mt-4" role="status" aria-live="polite">
                      <p className="text-sm font-semibold">{sumando.que}</p>
                      <Barra valor={porcentaje(sumando.avance)} />
                      <p className="mt-2 text-sm text-muted-foreground tabular-nums">
                        {sumando.avance.fase === "pensando"
                          ? "Eligiendo productos para tu negocio…"
                          : `Sacando las fotos con tu marca: ${sumando.avance.listas} de ${sumando.avance.total}`}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="mt-1 text-[15px] text-muted-foreground">
                        Pedí el producto que necesitás o pedí otras opciones
                        {gustan.length ? " en la línea de los que marcaste con ♥" : ""}. Los de ahora no se borran.
                      </p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (pedidoNuevo.trim()) sumar(marca, pedidoNuevo);
                        }}
                        className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center"
                      >
                        <label htmlFor="pedido-productos" className="sr-only">
                          Qué producto necesitás
                        </label>
                        <input
                          id="pedido-productos"
                          value={pedidoNuevo}
                          onChange={(e) => setPedidoNuevo(e.target.value)}
                          maxLength={200}
                          placeholder="Ej.: stickers para cerrar las cajas"
                          className="h-11 w-full min-w-0 rounded-full border border-input bg-background px-5 text-[15px] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                        />
                        <Button type="submit" size="lg" disabled={!pedidoNuevo.trim()} className="self-start sm:self-auto">
                          <Plus data-icon="inline-start" />
                          Agregar
                        </Button>
                      </form>
                      <Button variant="outline" className="mt-3" onClick={() => sumar(marca)}>
                        <Sparkles data-icon="inline-start" />
                        Otras {PRODUCTOS_MAS} opciones
                      </Button>
                    </>
                  )}
                  {errorSumar && !sumando && (
                    <p className="mt-3 text-sm text-destructive" role="alert">
                      {errorSumar} Probá de nuevo.
                    </p>
                  )}
                </section>
              </div>

              {/* El carrito: desde pantallas medianas queda fijo a la derecha mientras se recorren los productos */}
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
                      const foto = fotos[p.id];
                      return (
                        <li key={p.id} className={`${s.entra} flex items-start gap-3 py-3 first:pt-0`}>
                          <div className="relative size-14 shrink-0 overflow-hidden rounded-[8px] bg-muted">
                            {foto?.estado === "lista" && <img src={foto.url} alt="" className="size-full object-cover" />}
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
                                onClick={() => fijar(p.id, 0)}
                                className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors duration-300 ease-brandia hover:bg-muted hover:text-foreground"
                              >
                                <X className="size-3.5" />
                              </button>
                            </div>
                            <Cantidad
                              producto={p}
                              valor={cantidad[p.id] ?? 0}
                              onCambiar={(sentido) => cambiar(p, sentido)}
                              onFijar={(n) => fijar(p.id, n)}
                              chico
                            />
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
                    <dd className="text-muted-foreground">Te lo cotizamos</dd>
                  </div>
                </dl>

                {/* Lo que sugiere la IA puede no estar todavía entre lo que producimos: se consulta antes de cotizar */}
                <p className="flex items-start gap-2 rounded-[10px] bg-muted px-3 py-2.5 text-[13px] leading-snug text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    Armá tu carrito y <span className="font-semibold text-foreground">consultá por disponibilidad</span>: te
                    confirmamos qué podemos producir y te pasamos la cotización.
                  </span>
                </p>

                <PedirKit
                  identidad={marca.identidad}
                  items={elegidos.map((p) => ({
                    nombre: p.nombre,
                    detalle: p.detalle,
                    tecnica: p.tecnica,
                    estampa: p.estampa,
                    cantidad: cantidad[p.id] ?? 0,
                  }))}
                />
              </aside>
            </div>

            <p className="mt-6 max-w-[40em] text-sm text-muted-foreground">
              Los productos los elige la IA para tu negocio y las fotos las genera con tu logo y el estilo de{" "}
              {marca.identidad.nombre}. Tu pedido queda guardado y te escribimos con la cotización: todavía no se cobra nada.
            </p>
            <Button variant="ghost" size="sm" className="mt-2" disabled={sacando || renovando || !!sumando} onClick={() => fotosNuevas(marca)}>
              <RotateCcw data-icon="inline-start" />
              {renovando ? "Sacando fotos nuevas…" : "Sacar fotos nuevas"}
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

/** La barra de avance de una carga */
function Barra({ valor }: { valor: number }) {
  return (
    <div
      className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(valor * 100)}
    >
      <div
        className={`h-full origin-left rounded-full bg-foreground transition-transform duration-500 ease-brandia ${valor < 0.12 ? b.respira : ""}`}
        style={{ transform: `scaleX(${Math.max(0.03, Math.min(1, valor))})` }}
      />
    </div>
  );
}

/** Lo que se lee mientras la IA trabaja: cambia solo, para que la pantalla nunca esté quieta */
const FRASES_FOTOS = [
  "Imprimiendo tu logo en cada producto…",
  "Acomodando la luz de cada foto…",
  "Probando tus colores en cada material…",
  "Revisando que tu nombre se lea bien…",
];

/** La pantalla de carga de BranderIA: el logo, la barra y en qué está, hasta que estén todas las fotos */
function Carga({ marca, avance }: { marca: Marca; avance: Avance }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => n + 1), 2600);
    return () => clearInterval(t);
  }, []);
  const rubro = marca.brief.marca.rubro?.trim();
  return (
    <div className={`${s.entra} mx-auto flex min-h-[64svh] max-w-[34rem] flex-col items-center justify-center text-center`}>
      <LogoBranderia className="text-[44px]" />
      <h1 className={`${s.seCocina} display mt-10 text-[clamp(2rem,1.4rem+2vw,3rem)]`}>
        Armando <span className={s.it}>tus</span> productos.
      </h1>
      <p className="lead mt-3 text-base">
        La IA elige lo que más le sirve a {marca.identidad.nombre}
        {rubro ? ` (${rubro})` : ""} y le saca la foto a cada producto con tu marca. Te los mostramos cuando estén todos.
      </p>
      <div className="mt-8 w-full max-w-sm" role="status" aria-live="polite">
        <Barra valor={porcentaje(avance)} />
        <p className="mt-3 flex justify-between gap-3 text-sm text-muted-foreground">
          <span key={avance.fase === "pensando" ? "p" : `f${i % FRASES_FOTOS.length}`} className={s.progreso}>
            {avance.fase === "pensando" ? "Pensando qué productos usa tu negocio…" : FRASES_FOTOS[i % FRASES_FOTOS.length]}
          </span>
          {avance.fase === "fotos" && (
            <span className="shrink-0 tabular-nums">
              {avance.listas} de {avance.total}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function Tarjeta({
  producto: p,
  foto,
  marca,
  cantidad,
  onCambiar,
  onFijar,
  onSacar,
  otras,
  onUsarOtra,
  meGusta,
  onMeGusta,
}: {
  producto: Producto;
  foto: Foto;
  marca: Marca;
  cantidad: number;
  onCambiar: (sentido: 1 | -1) => void;
  onFijar: (n: number) => void;
  onSacar: () => void;
  /** Fotos de antes del producto, para volver a una */
  otras: string[];
  onUsarOtra: (url: string) => void;
  meGusta: boolean;
  onMeGusta: () => void;
}) {
  return (
    <li
      id={`producto-${p.id}`}
      className={`${s.entra} flex flex-col gap-2.5 rounded-lg border bg-card p-3 transition-[transform,box-shadow] duration-500 ease-brandia hover:-translate-y-1.5 hover:shadow-[0_24px_40px_-24px_rgba(30,30,28,.35)]`}
    >
      <div className="relative aspect-square overflow-hidden rounded-[10px] bg-muted">
        <Vista producto={p} foto={foto} marca={marca} anterior={otras[0]} />
        <MeGusta
          activo={meGusta}
          onClick={onMeGusta}
          que={p.nombre}
          className="absolute top-2 right-2 size-9 bg-card/90 text-foreground shadow-sm"
          tam="size-[18px]"
        />
        {foto.estado === "sacando" && (
          <span
            role="status"
            className={`${b.respira} absolute inset-x-2 bottom-2 rounded-full bg-card/90 px-2 py-1 text-center text-[0.6875rem] font-semibold`}
          >
            Sacando la foto con tu marca…
          </span>
        )}
        {foto.estado === "error" && (
          <button
            type="button"
            onClick={onSacar}
            className="absolute inset-x-2 bottom-2 rounded-full bg-card/90 px-2 py-1 text-[0.6875rem] font-semibold underline-offset-4 hover:underline"
          >
            No salió la foto · Probar de nuevo
          </button>
        )}
      </div>
      {otras.length > 0 && foto.estado !== "sacando" && (
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Fotos anteriores">
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
        <p className="mt-1.5 text-xs leading-snug">{p.por_que}</p>
      </div>
      <div className="mt-auto">
        <Cantidad producto={p} valor={cantidad} onCambiar={onCambiar} onFijar={onFijar} />
      </div>
    </li>
  );
}

const resumen = (productos: number, unidades: number) =>
  `${productos} producto${productos > 1 ? "s" : ""} · ${unidades} unidad${unidades === 1 ? "" : "es"}`;

/**
 * Las unidades de un producto: − y + de a un paso y, cuando está en el kit, una barra para moverse rápido
 * entre la mínima y la máxima de su escala. Sin estar en el kit dice desde cuánto se pide.
 */
function Cantidad({
  producto: p,
  valor,
  onCambiar,
  onFijar,
  chico,
}: {
  producto: Producto;
  valor: number;
  onCambiar: (sentido: 1 | -1) => void;
  onFijar: (n: number) => void;
  chico?: boolean;
}) {
  const e = escala(p);
  return (
    <div className={`flex flex-col gap-1 ${chico ? "mt-1.5" : ""}`}>
      <div className={`flex items-center gap-2 ${chico ? "" : "justify-between"}`}>
        <Paso etiqueta={`Menos ${p.nombre}`} disabled={valor === 0} onClick={() => onCambiar(-1)} chico={chico}>
          −
        </Paso>
        <span className={`${chico ? "w-16" : ""} text-center text-sm tabular-nums`}>{valor ? `${valor} u.` : "—"}</span>
        <Paso etiqueta={`Más ${p.nombre}`} disabled={valor >= e.maximo} onClick={() => onCambiar(1)} chico={chico}>
          +
        </Paso>
      </div>
      {valor > 0 && e.maximo > e.minimo ? (
        <input
          type="range"
          min={e.minimo}
          max={e.maximo}
          step={e.paso}
          value={valor}
          onChange={(ev) => onFijar(Number(ev.target.value))}
          aria-label={`Unidades de ${p.nombre}`}
          aria-valuetext={`${valor} unidades`}
          className="h-6 w-full cursor-pointer [accent-color:var(--foreground)]"
        />
      ) : null}
      <p className="text-[0.6875rem] leading-tight text-muted-foreground">
        Desde {e.minimo} u.{e.paso > 1 ? ` · de a ${e.paso}` : ""}
      </p>
    </div>
  );
}

/**
 * La foto del producto con la marca impresa por la IA. Mientras se saca una nueva, se ve la anterior;
 * si no hay ninguna (no salió), el logo del cliente sobre el fondo, sin ilustraciones de muestra.
 */
function Vista({ producto: p, foto, marca, anterior }: { producto: Producto; foto: Foto; marca: Marca; anterior?: string }) {
  if (foto.estado === "lista") {
    return (
      <img src={foto.url} alt={`${p.nombre} con la marca ${marca.identidad.nombre}`} className={`${b.foto} size-full object-cover`} />
    );
  }
  if (foto.estado === "sacando" && anterior) {
    return <img src={anterior} alt="" className="size-full object-cover opacity-50" />;
  }
  const logo = marca.logo?.imagen;
  return (
    <div className="grid size-full place-items-center">
      <span aria-hidden className="block w-1/3 opacity-60">
        {logo ? (
          <img src={logo} alt="" className="w-full rounded-[3px] object-contain" />
        ) : (
          <span
            className="block aspect-square w-full [&>svg]:size-full"
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
