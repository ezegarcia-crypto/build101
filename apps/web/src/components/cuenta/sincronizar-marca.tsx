"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useSesion } from "@/components/cuenta/usar-sesion";
import { guardarPestana, soltarSiSeReinicio } from "@/lib/marcas-cuenta";
import { supabaseNavegador } from "@/lib/supabase/navegador";

// Guarda sola en la cuenta la marca que se arma en esta pestaña, si la persona entró. No dibuja nada: va en el
// layout de toda la app. Cada pocos segundos mira qué cambió en la pestaña y sube solo eso (lib/marcas-cuenta.ts),
// y también al irse de la pestaña. No usa IA ni pasa por nuestro servidor.

const CADA = 8_000;

export function SincronizarMarca() {
  const { usuario } = useSesion();
  const ocupado = useRef(false);
  const avisado = useRef(false);

  useEffect(() => {
    const supabase = supabaseNavegador();
    if (!usuario || !supabase) return;

    async function guardar() {
      if (ocupado.current) return;
      ocupado.current = true;
      try {
        soltarSiSeReinicio();
        const subidas = await guardarPestana(supabase!, usuario!.id);
        if (subidas > 0 && !avisado.current) {
          avisado.current = true;
          toast.success("Tu marca quedó guardada en tu cuenta.");
        }
      } catch (e) {
        console.error("[cuenta] no se pudo guardar la marca:", e);
      } finally {
        ocupado.current = false;
      }
    }

    guardar();
    const intervalo = window.setInterval(guardar, CADA);
    const alIrse = () => document.visibilityState === "hidden" && guardar();
    document.addEventListener("visibilitychange", alIrse);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alIrse);
    };
  }, [usuario]);

  return null;
}
