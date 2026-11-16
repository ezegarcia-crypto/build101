"use client";

import { useEffect } from "react";

import { useSesion } from "@/components/cuenta/usar-sesion";
import { CLAVE_PLAN } from "@/lib/prueba-gratis";
import { supabaseNavegador } from "@/lib/supabase/navegador";

// Anota en el navegador si la cuenta que entró tiene el plan mensual activo, pago o piloto, y hasta cuándo. Con eso
// la prueba gratis no la frena (lib/prueba-gratis.ts). No dibuja nada: va en el layout de toda la app. Si nadie
// entró o el plan venció, lo borra. Lo lee de la base con la sesión de la persona: solo ve lo suyo (cuentas.sql).
//
// Es un freno de pantalla, como la prueba gratis: quien lo tocara a mano igual choca con el tope diario del servidor.

type Fila = { estado: string; hasta: string | null; proveedor: string };

// Días de gracia de un plan pago después de su fecha: Mercado Pago a veces reintenta el cobro (lib/suscripcion-activa.ts)
const GRACIA_MS = 3 * 86_400_000;
// Un plan pago sin fecha de vencimiento se anota por un mes; se vuelve a mirar cada vez que entra
const UN_MES_MS = 30 * 86_400_000;

function hastaCuando(filas: Fila[]) {
  const ahora = Date.now();
  let mejor = 0;
  for (const f of filas) {
    const fin = f.hasta
      ? new Date(f.hasta).getTime() + (f.estado === "activa" && f.proveedor !== "piloto" ? GRACIA_MS : 0)
      : f.estado === "activa"
        ? ahora + UN_MES_MS
        : 0;
    if (fin > mejor) mejor = fin;
  }
  return mejor > ahora ? new Date(mejor).toISOString() : null;
}

function anotar(hasta: string | null) {
  try {
    if (hasta) localStorage.setItem(CLAVE_PLAN, hasta);
    else localStorage.removeItem(CLAVE_PLAN);
  } catch {}
}

export function PlanDeLaCuenta() {
  const { cargando, usuario } = useSesion();
  const id = usuario?.id ?? null;

  useEffect(() => {
    if (cargando) return;
    const supabase = supabaseNavegador();
    if (!id || !supabase) {
      anotar(null);
      return;
    }
    let vigente = true;
    async function mirar() {
      const { data, error } = await supabase!
        .from("suscripciones")
        .select("estado, hasta, proveedor")
        .eq("plan", "mensual")
        .in("estado", ["activa", "cancelada"]);
      if (!vigente) return;
      if (error) {
        console.error("[cuenta] no se pudo leer el plan:", error.message);
        return;
      }
      anotar(hastaCuando((data as Fila[]) ?? []));
    }
    mirar();
    const alVolver = () => document.visibilityState === "visible" && mirar();
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      vigente = false;
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [cargando, id]);

  return null;
}
