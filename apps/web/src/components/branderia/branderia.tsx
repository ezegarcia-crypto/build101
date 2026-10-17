"use client";

import { Button, buttonVariants } from "@build101/ui/components/button";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { EnConstruccion } from "@/app/crear/proximamente/_piezas/piezas";
import {
  CLAVE_IDENTIDAD,
  contraste,
  type IdentidadIA,
  type PropuestaLogo,
  rolesDe,
  svgSeguro,
} from "@/components/brandbook/identidad";
import { CLAVE_FICHA } from "@/components/entrevista/ficha";
import { Pasos } from "@/components/pasos";

import s from "../entrevista/entrevista.module.css";
import b from "./branderia.module.css";

// Paso 4 · Tus productos (módulo C, BranderIA). Con la identidad de la marca, la IA saca la foto de
// cada producto del catálogo (POST /api/contenidos/imagen, el mismo modelo de imágenes del feed).
// La foto sale lisa, sin logo: el logo real del cliente "cae" encima, nunca lo dibuja una IA.
// El pedido está en construcción: se arma el kit, pero no se cobra ni se pide nada.
// Las fotos quedan guardadas (achicadas) junto con su identidad: si se recarga, no se vuelven a pedir.

export const CLAVE_BRANDERIA = "brandia:branderia";

type Marca = { ficha: string; identidad: IdentidadIA; logos: PropuestaLogo[] };

// El catálogo inicial (equipo/design-system.md § 6). `tam`: ancho del logo sobre la foto, en %.
type Producto = { id: string; nombre: string; detalle: string; escena: string; tam: number; destacado?: boolean };

const CATALOGO: Producto[] = [
  { id: "remera", nombre: "Remeras", detalle: "Algodón", tam: 30, destacado: true,
    escena: "una remera de algodón lisa, doblada prolijo o colgada de frente, con el pecho liso mirando a cámara" },
  { id: "taza", nombre: "Tazas de café", detalle: "Cerámica", tam: 26, destacado: true,
    escena: "una taza de café de cerámica lisa, de frente, con el cuerpo liso mirando a cámara y el asa a un costado" },
  { id: "tote", nombre: "Tote bags", detalle: "Algodón crudo", tam: 32, destacado: true,
    escena: "una tote bag de algodón crudo lisa, colgada o apoyada de frente, con la cara grande lisa mirando a cámara" },
  { id: "tarjetas", nombre: "Tarjetas", detalle: "Papel grueso", tam: 26, destacado: true,
    escena: "una pila de tarjetas personales de papel grueso, lisas, vistas desde arriba, con la de arriba en el centro" },
  { id: "termo", nombre: "Termos para mate", detalle: "Acero, pico cebador", tam: 20,
    escena: "un termo de acero para mate con pico cebador, parado de frente, con el cuerpo liso mirando a cámara" },
  { id: "mate", nombre: "Mates", detalle: "Con bombilla", tam: 22,
    escena: "un mate con bombilla de acero, de frente, con la parte lisa del mate mirando a cámara" },
  { id: "vaso", nombre: "Vasos térmicos", detalle: "Con tapa", tam: 22,
    escena: "un vaso térmico con tapa, parado de frente, con el cuerpo liso mirando a cámara" },
  { id: "gorro", nombre: "Gorros", detalle: "Bordados", tam: 24,
    escena: "un gorro tipo cap liso, de frente, con el frente liso mirando a cámara" },
  { id: "folletos", nombre: "Folletos", detalle: "Tríptico", tam: 26,
    escena: "un folleto tríptico de papel, cerrado y apoyado de frente, con la tapa lisa en el centro" },
  { id: "carpeta", nombre: "Carpetas", detalle: "Con bolsillo", tam: 28,
    escena: "una carpeta institucional con bolsillo, cerrada, vista de frente, con la tapa lisa en el centro" },
  { id: "lapicera", nombre: "Lapiceras", detalle: "Grabadas", tam: 16,
    escena: "una lapicera lisa acostada en horizontal, cruzando el centro de la imagen, con el cuerpo liso a la vista" },
  { id: "soporte", nombre: "Soportes de celular", detalle: "Para videollamadas", tam: 22,
    escena: "un soporte de escritorio para celular, liso, de frente, con su parte plana mirando a cámara" },
];

const CANTIDADES = [0, 25, 50, 100, 250, 500];
const A_LA_VEZ = 4;

type Foto = { estado: "pendiente" } | { estado: "sacando" } | { estado: "lista"; url: string } | { estado: "error" };

function leer<T>(clave: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(clave) ?? "null");
  } catch {
    return null;
  }
}

// Para reconocer si las fotos guardadas son de esta misma marca
const huella = (m: Marca) => `${m.ficha}|${m.identidad.nombre}|${m.identidad.paleta.map((c) => c.hex).join()}`;

/** El pedido de la foto, con la marca aplicada. Sin IA: siempre igual para la misma entrada. */
function promptProducto(p: Producto, id: IdentidadIA) {
  const { fondo, principal, acento } = rolesDe(id.paleta);
  // El logo se apoya con "multiplicar": sobre un producto claro se ve tal cual, sobre uno oscuro se perdería
  const claro = contraste(fondo, "#000000") >= 12;
  const color = claro ? `del color ${fondo} (o blanco o crudo, lo que quede más natural para el material)` : "blanco o crudo";
  return [
    `Foto de producto realista, de catálogo, para la marca «${id.nombre}»: ${p.escena}.`,
    `El producto es ${color}, completamente liso y sin estampar. Algún detalle chico (una tapa, un cordón, el borde) puede ser ${principal} o ${acento}.`,
    "El lugar donde se imprime el logo está plano, limpio y de frente, exactamente en el centro de la imagen.",
    "El producto ocupa el centro y entra entero en el cuadrado central: la foto se recorta cuadrada.",
    `Fondo, luz y ambiente como las fotos de la marca: ${id.estilo.fotografia}`,
    `Que el fondo dialogue con la paleta (${id.paleta.map((c) => c.hex).join(", ")}) sin teñir la foto de un color.`,
    "Natural, con texturas reales del material, nada de aspecto de render.",
    "Sin ningún texto, letras, números, logos, marcas de agua ni marcas comerciales.",
  ].join("\n");
}

/** Recorta la foto vertical al cuadrado del centro y la achica, para que entre guardada. */
async function achicar(url: string, lado = 640): Promise<string> {
  const img = new Image();
  img.src = url;
  await img.decode();
  const corte = Math.min(img.naturalWidth, img.naturalHeight);
  const lienzo = document.createElement("canvas");
  lienzo.width = lienzo.height = lado;
  lienzo
    .getContext("2d")
    ?.drawImage(img, (img.naturalWidth - corte) / 2, (img.naturalHeight - corte) / 2, corte, corte, 0, 0, lado, lado);
  return lienzo.toDataURL("image/jpeg", 0.82);
}

export function Branderia() {
  const [marca, setMarca] = useState<Marca | null | "sin-marca">(null);
  const [fotos, setFotos] = useState<Record<string, Foto>>(() =>
    Object.fromEntries(CATALOGO.map((p) => [p.id, { estado: "pendiente" }])),
  );
  const [nivel, setNivel] = useState<Record<string, number>>({});
  const [pedido, setPedido] = useState(false);
  const listas = useRef<Record<string, string>>({});
  const aviso = useRef<HTMLDivElement>(null);

  // Al pedir, el aviso aparece arriba del catálogo: se lleva la vista hasta ahí
  useEffect(() => {
    if (pedido) aviso.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [pedido]);

  const sacar = useCallback(async (m: Marca, ids: string[], senal?: AbortSignal) => {
    setFotos((f) => ({ ...f, ...Object.fromEntries(ids.map((id) => [id, { estado: "sacando" } as Foto])) }));
    const cola = [...ids];
    const trabajar = async () => {
      for (let id = cola.shift(); id; id = cola.shift()) {
        const p = CATALOGO.find((x) => x.id === id)!;
        try {
          const res = await fetch("/api/contenidos/imagen", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ clave: p.id, prompt: promptProducto(p, m.identidad), ancho: 1024, alto: 1024 }),
            signal: senal,
          });
          if (!res.ok) throw new Error();
          const { url } = (await res.json()) as { url: string };
          const chica = await achicar(url);
          listas.current[p.id] = chica;
          setFotos((f) => ({ ...f, [p.id]: { estado: "lista", url: chica } }));
          try {
            sessionStorage.setItem(CLAVE_BRANDERIA, JSON.stringify({ huella: huella(m), fotos: listas.current }));
          } catch {
            // Si no entra, las fotos se ven igual, solo que no quedan guardadas
          }
        } catch {
          if (senal?.aborted) return;
          setFotos((f) => ({ ...f, [p.id]: { estado: "error" } }));
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(A_LA_VEZ, ids.length) }, trabajar));
  }, []);

  useEffect(() => {
    const ficha = sessionStorage.getItem(CLAVE_FICHA);
    const guardada = leer<{ ficha: string; identidad: IdentidadIA; logos: PropuestaLogo[] }>(CLAVE_IDENTIDAD);
    if (!ficha || guardada?.ficha !== ficha) return setMarca("sin-marca");
    const m = { ficha, identidad: guardada.identidad, logos: guardada.logos ?? [] };
    setMarca(m);

    const previo = leer<{ huella: string; fotos: Record<string, string> }>(CLAVE_BRANDERIA);
    if (previo?.huella === huella(m) && Object.keys(previo.fotos).length) {
      listas.current = previo.fotos;
      setFotos((f) => ({
        ...f,
        ...Object.fromEntries(Object.entries(previo.fotos).map(([id, url]) => [id, { estado: "lista", url } as Foto])),
      }));
      return;
    }
    // Al entrar, la IA saca las fotos de los destacados; el resto, cuando la persona lo pide
    const control = new AbortController();
    sacar(m, CATALOGO.filter((p) => p.destacado).map((p) => p.id), control.signal);
    return () => control.abort();
  }, [sacar]);

  if (marca === null) return <main className="min-h-0 overflow-y-auto" />;

  const pendientes = CATALOGO.filter((p) => fotos[p.id]?.estado === "pendiente" || fotos[p.id]?.estado === "error");
  const sacando = CATALOGO.some((p) => fotos[p.id]?.estado === "sacando");
  const elegidos = CATALOGO.filter((p) => (nivel[p.id] ?? 0) > 0);
  const unidades = elegidos.reduce((t, p) => t + (CANTIDADES[nivel[p.id] ?? 0] ?? 0), 0);

  function cambiar(id: string, paso: number) {
    setPedido(false);
    setNivel((n) => ({ ...n, [id]: Math.min(Math.max((n[id] ?? 0) + paso, 0), CANTIDADES.length - 1) }));
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
                La IA saca la foto de cada producto con el estilo de tu marca, y tu logo cae encima. Elegí cantidades y
                armá tu kit: BrandIA lo produce y te lo manda.
              </p>
            </div>

            {/* La barra del kit queda a mano mientras se recorre el catálogo */}
            <div className="sticky top-0 z-10 -mx-4 mb-3 bg-background/85 px-4 py-2 backdrop-blur">
              <div className="flex flex-wrap items-center gap-3 rounded-[16px] border bg-card p-3 pl-4">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Tu kit</span>
                  <span aria-live="polite" className="font-semibold">
                    {elegidos.length
                      ? `${elegidos.length} producto${elegidos.length > 1 ? "s" : ""} · ${unidades} unidades`
                      : "Elegí productos y cantidades"}
                  </span>
                </div>
                <div className="ml-auto flex flex-wrap gap-2">
                  {pendientes.length > 0 && (
                    <Button variant="outline" disabled={sacando} onClick={() => sacar(marca, pendientes.map((p) => p.id))}>
                      Ver {pendientes.length} más con mi marca
                    </Button>
                  )}
                  <Button disabled={!elegidos.length} onClick={() => setPedido(true)}>
                    Pedir <span aria-hidden>→</span>
                  </Button>
                </div>
              </div>
            </div>

            {pedido && (
              <div
                ref={aviso}
                role="status"
                className={`${s.entra} mb-3 flex flex-col gap-3 rounded-[16px] bg-primary p-4 text-primary-foreground sm:p-6`}
              >
                <div>
                  <EnConstruccion texto="El pedido está en construcción" />
                </div>
                <p className="text-lg font-semibold">Así va a funcionar.</p>
                <ul className="flex flex-wrap gap-2 text-sm">
                  {elegidos.map((p) => (
                    <li key={p.id} className="rounded-full bg-primary-foreground/12 px-3 py-1">
                      {CANTIDADES[nivel[p.id] ?? 0]} {p.nombre.toLowerCase()}
                    </li>
                  ))}
                </ul>
                <p className="max-w-[40em] text-[0.9375rem] opacity-85">
                  BrandIA produce cada producto con tu marca, controla que salga bien y te lo manda a tu puerta. Todavía
                  no se hizo ningún pedido ni se cobró nada.
                </p>
              </div>
            )}

            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {CATALOGO.map((p) => (
                <Tarjeta
                  key={p.id}
                  producto={p}
                  foto={fotos[p.id] ?? { estado: "pendiente" }}
                  marca={marca}
                  cantidad={nivel[p.id] ?? 0}
                  onCambiar={(paso) => cambiar(p.id, paso)}
                  onSacar={() => sacar(marca, [p.id])}
                />
              ))}
            </ul>

            <p className="mt-6 max-w-[40em] text-sm text-muted-foreground">
              Las fotos las genera la IA con el estilo de {marca.identidad.nombre}; el logo es el tuyo, tal cual. Sin
              precios ni pedidos reales por ahora.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              disabled={sacando}
              onClick={() => {
                sessionStorage.removeItem(CLAVE_BRANDERIA);
                listas.current = {};
                sacar(marca, CATALOGO.filter((p) => fotos[p.id]?.estado === "lista").map((p) => p.id));
              }}
            >
              <RotateCcw data-icon="inline-start" />
              Sacar fotos nuevas
            </Button>
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
}: {
  producto: Producto;
  foto: Foto;
  marca: Marca;
  cantidad: number;
  onCambiar: (paso: number) => void;
  onSacar: () => void;
}) {
  const logo = marca.logos[0]?.imagen;
  return (
    <li className="flex flex-col gap-2.5 rounded-lg border bg-card p-3 transition-[transform,box-shadow] duration-500 ease-brandia hover:-translate-y-1.5 hover:shadow-[0_24px_40px_-24px_rgba(30,30,28,.35)]">
      <div className="relative aspect-square overflow-hidden rounded-[10px] bg-muted">
        {foto.estado === "lista" ? (
          <>
            <img src={foto.url} alt={`${p.nombre} con la marca ${marca.identidad.nombre}`} className={`${b.foto} size-full object-cover`} />
            {/* El logo real, apoyado con "multiplicar" para que tome la textura del producto */}
            <span
              aria-hidden
              className={`${b.cae} absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 mix-blend-multiply`}
              style={{ width: `${p.tam}%`, animationDelay: "0.35s" }}
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
          </>
        ) : (
          <div
            className={`grid size-full place-items-center border border-dashed border-foreground/20 p-3 text-center text-[0.6875rem] leading-snug text-muted-foreground ${
              foto.estado === "sacando" ? b.respira : ""
            }`}
          >
            {foto.estado === "sacando" && <span role="status">Sacando la foto con tu marca…</span>}
            {foto.estado === "pendiente" && (
              <button type="button" onClick={onSacar} className="font-semibold text-foreground underline-offset-4 hover:underline">
                Verlo con mi marca
              </button>
            )}
            {foto.estado === "error" && (
              <span className="flex flex-col items-center gap-1">
                No salió la foto.
                <button type="button" onClick={onSacar} className="font-semibold text-foreground underline-offset-4 hover:underline">
                  Probar de nuevo
                </button>
              </span>
            )}
          </div>
        )}
      </div>
      <div className="leading-tight">
        <p className="text-[0.9375rem] font-semibold">{p.nombre}</p>
        <p className="text-xs text-muted-foreground">{p.detalle}</p>
      </div>
      <div className="flex items-center justify-between gap-1">
        <button
          type="button"
          aria-label={`Menos ${p.nombre}`}
          disabled={cantidad === 0}
          onClick={() => onCambiar(-1)}
          className="grid size-8 place-items-center rounded-full border text-base transition-colors duration-300 ease-brandia hover:bg-muted disabled:opacity-35"
        >
          −
        </button>
        <span className="text-sm tabular-nums">{CANTIDADES[cantidad] ? `${CANTIDADES[cantidad]} u.` : "—"}</span>
        <button
          type="button"
          aria-label={`Más ${p.nombre}`}
          disabled={cantidad === CANTIDADES.length - 1}
          onClick={() => onCambiar(1)}
          className="grid size-8 place-items-center rounded-full border text-base transition-colors duration-300 ease-brandia hover:bg-muted disabled:opacity-35"
        >
          +
        </button>
      </div>
    </li>
  );
}
