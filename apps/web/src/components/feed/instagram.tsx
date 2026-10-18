"use client";

import {
  Award,
  BadgeCheck,
  Baby,
  BatteryFull,
  Bike,
  BookOpen,
  Brain,
  Briefcase,
  Brush,
  Building2,
  Cake,
  Calendar,
  Camera,
  Car,
  ChefHat,
  ChevronDown,
  CircleHelp,
  Clapperboard,
  Clock,
  Coffee,
  Copy,
  Dumbbell,
  Flame,
  Flower2,
  Footprints,
  Gem,
  Gift,
  Glasses,
  GraduationCap,
  Grid3x3,
  Hammer,
  Handshake,
  HandHeart,
  Heart,
  House,
  IceCreamCone,
  Image,
  Lamp,
  Laptop,
  Leaf,
  Lightbulb,
  type LucideIcon,
  MapPin,
  Megaphone,
  Menu,
  MessageCircle,
  Mic,
  Mountain,
  Music,
  Newspaper,
  Package,
  Palette,
  PawPrint,
  PenTool,
  Percent,
  Pill,
  Pizza,
  Plane,
  Quote,
  Recycle,
  Rocket,
  Scissors,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  SignalHigh,
  Smile,
  Sofa,
  Sparkles,
  Sprout,
  SquarePlus,
  SquareUserRound,
  Star,
  Stethoscope,
  Store,
  Sun,
  Tag,
  Target,
  TrendingUp,
  Trophy,
  Truck,
  Users,
  Utensils,
  Video,
  WandSparkles,
  Waves,
  Wifi,
  Wine,
  Wrench,
  Zap,
} from "lucide-react";
import { type MouseEvent, type ReactNode, useEffect, useMemo, useState } from "react";

import { type Colores, componerPieza, type Imagenes } from "@/lib/ia/contenidos/componer";
import type { ItemPlan, Pieza, Plan } from "@/lib/ia/contenidos/esquemas";
import { FORMATOS } from "@/lib/ia/contenidos/formatos";
import type { Kit } from "@/lib/ia/contenidos/kit";
import { type Icono, ICONOS } from "@/lib/ia/destacadas";

import type { Lote } from "./feed";
import f from "./feed.module.css";

// El feed armado como perfil de Instagram, dentro de un celular. Retirada visual (design-system §5):
// lo que es de la marca (el avatar, las destacadas y cada pieza de la grilla) va con sus colores y sus
// letras; el celular y la interfaz de Instagram, neutros. La grilla muestra el primer lienzo de cada
// pieza (posteo, primera lámina del carrusel y portada del reel; las historias no van), recortado a 4:5.
// Las destacadas son un círculo por pilar del plan: el ícono y el nombre corto los elige la IA
// (POST /api/contenidos/destacadas); mientras tanto, o si falla, el círculo lleva el símbolo de la marca.

/** El nombre de la lista cerrada → el ícono. TypeScript avisa si falta alguno de ICONOS. */
const DIBUJO: Record<Icono, LucideIcon> = {
  Sparkles, Heart, Star, Users, MessageCircle, Lightbulb, BookOpen, GraduationCap, Camera, Image, Video,
  Megaphone, Tag, ShoppingBag, Gift, Percent, Calendar, Clock, MapPin, Store, House, Leaf, Sprout, Flower2,
  Sun, Mountain, Waves, Coffee, Utensils, ChefHat, Wine, Cake, Pizza, IceCreamCone, Flame, Shirt, Scissors,
  Gem, Glasses, Palette, Brush, PenTool, Hammer, Wrench, Dumbbell, Bike, Footprints, Music, Mic, Briefcase,
  Handshake, Building2, Sofa, Lamp, TrendingUp, Target, Rocket, Zap, Trophy, Award, BadgeCheck, ShieldCheck,
  CircleHelp, Quote, Newspaper, Truck, Package, Baby, PawPrint, Smile, HandHeart, Recycle, Stethoscope, Pill,
  Brain, Plane, Car, Laptop, WandSparkles,
};

const SISTEMA = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
const SIN_IMAGENES: Imagenes = {};

// ── Las destacadas ───────────────────────────────────────────────────────────────────────────

type Destacada = { pilar: string; nombre_corto: string; icono: Icono } | null;

// Un solo pedido por marca y pilares: aunque el componente se vuelva a montar, no se repite
// (y si falla, tampoco se reintenta solo: queda el símbolo de la marca).
const pedidos = new Map<string, Promise<Destacada[] | null>>();

function pedirDestacadas(marca: string, plan: Plan) {
  const clave = `brandia:destacadas:${marca}|${plan.pilares.map((p) => p.nombre).join("|")}`;
  const ya = pedidos.get(clave);
  if (ya) return ya;
  let guardado: Destacada[] | null = null;
  try {
    guardado = JSON.parse(sessionStorage.getItem(clave) ?? "null");
  } catch {}
  const pedido: Promise<Destacada[] | null> = guardado
    ? Promise.resolve(guardado)
    : fetch("/api/contenidos/destacadas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ marca, objetivo: plan.objetivo, pilares: plan.pilares }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { destacadas?: Destacada[] } | null) => {
          const lista = d?.destacadas ?? null;
          if (lista) {
            try {
              sessionStorage.setItem(clave, JSON.stringify(lista));
            } catch {}
          }
          return lista;
        })
        .catch(() => null);
  pedidos.set(clave, pedido);
  return pedido;
}

function useDestacadas(marca: string, plan: Plan) {
  const clave = `${marca}|${plan.pilares.map((p) => p.nombre).join("|")}`;
  const [estado, setEstado] = useState<{ clave: string; lista: Destacada[] | null } | null>(null);
  useEffect(() => {
    let vigente = true;
    pedirDestacadas(marca, plan).then((lista) => vigente && setEstado({ clave, lista }));
    return () => {
      vigente = false;
    };
    // El plan entra por la clave: solo se pide de nuevo si cambian la marca o los pilares
  }, [clave]);
  return estado?.clave === clave ? { cargando: false, lista: estado.lista } : { cargando: true, lista: null };
}

function Destacadas({ kit, plan, c, simbolo }: { kit: Kit; plan: Plan; c: Colores; simbolo: ReactNode }) {
  const { cargando, lista } = useDestacadas(kit.nombre, plan);
  return (
    <ul className={`${f.desliza} mt-4 flex gap-3.5 overflow-x-auto px-4`} aria-label="Historias destacadas">
      {plan.pilares.map((p, i) => {
        const d = lista?.[i];
        const Dibujo = d && DIBUJO[d.icono] && ICONOS.includes(d.icono) ? DIBUJO[d.icono] : null;
        return (
          <li key={p.nombre} className="flex w-[62px] shrink-0 flex-col items-center gap-1">
            <span className="size-[60px] rounded-full p-[2px] ring-1 ring-neutral-300">
              {cargando ? (
                <span className="block size-full animate-pulse rounded-full" style={{ background: c.apoyo }} />
              ) : Dibujo ? (
                <span className="grid size-full place-items-center rounded-full" style={{ background: c.principal, color: c.sobrePrincipal }}>
                  <Dibujo className="size-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
              ) : (
                <span className="block size-full">{simbolo}</span>
              )}
            </span>
            <span className="w-full truncate text-center text-[11px] leading-tight" title={p.nombre}>
              {d?.nombre_corto || p.nombre}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ── La grilla ────────────────────────────────────────────────────────────────────────────────

function Celda({ item, pieza, kit, imagenes, fallo, c }: {
  item: ItemPlan;
  pieza?: Pieza;
  kit: Kit;
  imagenes: Imagenes;
  fallo: boolean;
  c: Colores;
}) {
  // El primer lienzo: el posteo, la primera lámina del carrusel o la portada del reel
  const lienzo = useMemo(() => (pieza ? componerPieza(pieza, kit, imagenes)[0] : undefined), [pieza, kit, imagenes]);
  const Marca = item.formato === "carrusel" ? Copy : item.formato === "reel" ? Clapperboard : null;

  function ir(e: MouseEvent<HTMLAnchorElement>) {
    const destino = document.getElementById(`pieza-${item.id}`);
    if (!destino) return;
    e.preventDefault();
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    destino.scrollIntoView({ behavior: quieto ? "auto" : "smooth", block: "start" });
  }

  return (
    <a
      href={`#pieza-${item.id}`}
      onClick={ir}
      aria-label={`${FORMATOS[item.formato].nombre}: ${item.idea}`}
      className="relative block aspect-[4/5] overflow-hidden outline-offset-[-2px] transition-opacity duration-300 ease-brandia hover:opacity-90"
      style={{ background: c.apoyo }}
    >
      {lienzo ? (
        // El lienzo ocupa todo el ancho; si es más alto (el reel, 9:16), se recorta al centro
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: lienzo.svg }}
        />
      ) : (
        <span className={`block size-full ${fallo ? "opacity-50" : "animate-pulse"}`} style={{ background: c.apoyo }} />
      )}
      {Marca && <Marca className="absolute top-1.5 right-1.5 size-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" aria-hidden="true" />}
    </a>
  );
}

// ── El celular ───────────────────────────────────────────────────────────────────────────────

export function Instagram({ lote, kit, plan, c, usuario, bio, avatar }: {
  lote: Lote;
  kit: Kit;
  plan: Plan;
  c: Colores;
  usuario: string;
  bio: string;
  /** El avatar de la marca (logo elegido o símbolo), el mismo que usa el feed */
  avatar: ReactNode;
}) {
  const grilla = plan.piezas.filter((p) => p.formato !== "historia");
  const historias = plan.piezas.length - grilla.length;

  return (
    <figure className="mx-auto w-full max-w-[360px]">
      {/* El marco y la interfaz de Instagram, neutros */}
      <div className="rounded-[48px] bg-neutral-900 p-[9px] shadow-xl ring-1 ring-black/10 dark:ring-white/15">
        <div
          className="relative flex aspect-[9/19] flex-col overflow-hidden rounded-[40px] bg-white text-neutral-900"
          style={{ fontFamily: SISTEMA }}
        >
          {/* La barra de estado y la isla */}
          <div aria-hidden="true" className="flex h-11 shrink-0 items-center justify-between px-7 pt-1 text-[13px] font-semibold">
            <span>9:41</span>
            <span className="absolute top-2.5 left-1/2 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1">
              <SignalHigh className="size-4" />
              <Wifi className="size-4" />
              <BatteryFull className="size-5" />
            </span>
          </div>

          {/* El usuario arriba */}
          <div className="flex h-11 shrink-0 items-center justify-between px-4">
            <p className="flex min-w-0 items-center gap-1 text-[17px] font-bold">
              <span className="truncate">{usuario}</span>
              <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
            </p>
            <span aria-hidden="true" className="flex items-center gap-4">
              <SquarePlus className="size-6" strokeWidth={1.75} />
              <Menu className="size-6" strokeWidth={1.75} />
            </span>
          </div>

          {/* Lo que se desplaza: el perfil, las destacadas y la grilla */}
          <div className={`${f.desliza} min-h-0 flex-1 overflow-y-auto overscroll-contain`}>
            <div className="flex items-center gap-5 px-4 pt-2">
              <div className="size-[78px] shrink-0 rounded-full p-[3px]" style={{ background: c.principal }}>
                <div className="size-full rounded-full bg-white p-[2px]">{avatar}</div>
              </div>
              <dl className="flex min-w-0 flex-1 justify-around gap-2 text-center text-[13px] leading-tight">
                {[
                  [grilla.length, "posteos"],
                  [historias, "historias"],
                  [plan.pilares.length, "destacadas"],
                ].map(([n, nombre]) => (
                  <div key={nombre} className="flex flex-col-reverse">
                    <dt>{nombre}</dt>
                    <dd className="text-[16px] font-semibold tabular-nums">{n}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="px-4 pt-3 text-[13px] leading-snug">
              <p className="font-semibold">{kit.nombre}</p>
              <p className="whitespace-pre-line">{bio.replace(/\*/g, "")}</p>
            </div>

            <div aria-hidden="true" className="grid grid-cols-2 gap-1.5 px-4 pt-3 text-[13px] font-semibold">
              <span className="grid h-8 place-items-center rounded-lg bg-neutral-100">Editar perfil</span>
              <span className="grid h-8 place-items-center rounded-lg bg-neutral-100">Compartir perfil</span>
            </div>

            <Destacadas kit={kit} plan={plan} c={c} simbolo={avatar} />

            <div aria-hidden="true" className="mt-3 grid grid-cols-3">
              <span className="grid h-11 place-items-center border-b-[1.5px] border-neutral-900">
                <Grid3x3 className="size-6" strokeWidth={1.75} />
              </span>
              <span className="grid h-11 place-items-center border-b border-neutral-200 text-neutral-400">
                <Clapperboard className="size-6" strokeWidth={1.75} />
              </span>
              <span className="grid h-11 place-items-center border-b border-neutral-200 text-neutral-400">
                <SquareUserRound className="size-6" strokeWidth={1.75} />
              </span>
            </div>

            <div className="grid grid-cols-3 gap-[2px]">
              {grilla.map((item) => (
                <Celda
                  key={item.id}
                  item={item}
                  pieza={lote.piezas[item.id]}
                  kit={kit}
                  imagenes={lote.imagenes[item.id] ?? SIN_IMAGENES}
                  fallo={Boolean(lote.fallas[item.id])}
                  c={c}
                />
              ))}
            </div>
          </div>

          {/* La barra de abajo */}
          <div aria-hidden="true" className="flex h-12 shrink-0 items-center justify-around border-t border-neutral-200 bg-white">
            <House className="size-6" strokeWidth={1.75} />
            <Search className="size-6" strokeWidth={1.75} />
            <SquarePlus className="size-6" strokeWidth={1.75} />
            <Clapperboard className="size-6" strokeWidth={1.75} />
            <span className="size-7 rounded-full p-[1.5px] ring-[1.5px] ring-neutral-900">{avatar}</span>
          </div>
          <div aria-hidden="true" className="grid h-5 shrink-0 place-items-center bg-white">
            <span className="h-[5px] w-32 rounded-full bg-neutral-900" />
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-sm text-muted-foreground">Así se vería tu perfil. Tocá una pieza para verla abajo.</figcaption>
    </figure>
  );
}
