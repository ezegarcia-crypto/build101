import type { EstadoSemana, MesEnPantalla } from "@/lib/feed-mensual";
import type { ItemPlan } from "@/lib/ia/contenidos/esquemas";

import type { Lote } from "./feed";

// El mes completo del suscriptor, del lado de la pantalla. El servidor lo arma de a una semana y lo guarda
// (POST /api/contenidos/mes); acá se lee cada pocos segundos (GET) y se pasa al mismo `Lote` que dibuja el feed.
// Las fotos llegan como links: se bajan una vez y se guardan en memoria como data URL, así se dibujan en el SVG
// y entran en las descargas. No se guardan en la pestaña (pesan): al recargar se vuelven a bajar.

/** Lo que el lote de un mes trae de más: en qué semana va y qué se puede hacer */
export type InfoMes = {
  id: string;
  /** El lunes en que empieza, AAAA-MM-DD */
  inicio: string;
  semanas: { semana: number; estado: EstadoSemana }[];
  /** Hay un servidor armándolo ahora */
  vivo: boolean;
  /** Ya no va a cambiar solo */
  terminado: boolean;
  /** Quedó algo sin salir que todavía se puede volver a pedir */
  reintentable: boolean;
};

export type RespuestaMes = { mes: MesEnPantalla; vivo: boolean; trabado: boolean; terminado: boolean; reintentable: boolean };

export const SEMANAS_DEL_MES = 4;

const dosCifras = (n: number) => String(n).padStart(2, "0");

/** El próximo lunes (hoy, si hoy es lunes), en la hora de la persona, como AAAA-MM-DD */
export function proximoLunesISO(hoy = new Date()) {
  const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const desdeLunes = (d.getDay() + 6) % 7;
  if (desdeLunes) d.setDate(d.getDate() + 7 - desdeLunes);
  return `${d.getFullYear()}-${dosCifras(d.getMonth() + 1)}-${dosCifras(d.getDate())}`;
}

/** AAAA-MM-DD → la fecha a la medianoche, en la hora de la persona */
export function fechaLocal(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a!, m! - 1, d!);
}

const DIAS: ItemPlan["dia"][] = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

/** El día exacto en que sale una pieza del mes */
export function fechaDePieza(inicio: string, item: ItemPlan) {
  const d = fechaLocal(inicio);
  d.setDate(d.getDate() + ((item.semana ?? 1) - 1) * 7 + DIAS.indexOf(item.dia));
  return d;
}

function mensaje(r: RespuestaMes) {
  const m = r.mes;
  if (!m.plan) return "Pensando qué tiene que contar tu marca este mes";
  const s = m.semanas.find((x) => x.estado === "generando") ?? m.semanas.find((x) => x.estado === "pendiente");
  if (!s) return "Tu mes está listo";
  return s.estado === "generando" ? `Escribiendo la semana ${s.semana} de ${m.semanas.length} con tu voz` : `Pasando a la semana ${s.semana}`;
}

/** Lo que mandó el servidor, como el lote que dibuja el feed (sin las fotos: van aparte) */
export function loteDeMes(r: RespuestaMes): Lote {
  const m = r.mes;
  const fines = m.semanas.map((s) => (s.fin ? Date.parse(s.fin) : 0));
  return {
    kit: m.kit,
    plan: m.plan,
    piezas: m.piezas,
    imagenes: {},
    fallas: Object.fromEntries(Object.entries(m.fallas).map(([k, f]) => [k, f.mensaje])),
    mensaje: mensaje(r),
    fin: r.terminado
      ? { segundos: Math.max(0, Math.round((Math.max(...fines) - Date.parse(m.creado)) / 1000)), imagenes: m.fotos_hechas }
      : null,
    mes: {
      id: m.id,
      inicio: m.inicio,
      semanas: m.semanas.map((s) => ({ semana: s.semana, estado: s.estado })),
      vivo: r.vivo,
      terminado: r.terminado,
      reintentable: r.reintentable,
    },
  };
}

/** Las fotos del mes que todavía no están en memoria */
export function fotosQueFaltan(m: MesEnPantalla, pedidas: Set<string>) {
  return Object.entries(m.imagenes).flatMap(([pieza, claves]) =>
    Object.entries(claves)
      .filter(([clave]) => !pedidas.has(`${pieza}/${clave}`))
      .map(([clave, url]) => ({ pieza, clave, url })),
  );
}

/** Baja una foto y la devuelve como data URL (para dibujarla dentro del SVG y en las descargas) */
export async function aDataUrl(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`La foto respondió ${r.status}`);
  const blob = await r.blob();
  return new Promise<string>((ok, mal) => {
    const lector = new FileReader();
    lector.onload = () => ok(String(lector.result));
    lector.onerror = () => mal(lector.error);
    lector.readAsDataURL(blob);
  });
}
