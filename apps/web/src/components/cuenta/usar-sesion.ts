"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { supabaseNavegador } from "@/lib/supabase/navegador";

/** Quién entró a su cuenta en este navegador. `cargando` mientras se averigua; `usuario` null si nadie entró. */
export function useSesion() {
  const [estado, setEstado] = useState<{ cargando: boolean; usuario: User | null }>({ cargando: true, usuario: null });

  useEffect(() => {
    const supabase = supabaseNavegador();
    if (!supabase) {
      setEstado({ cargando: false, usuario: null });
      return;
    }
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      setEstado({ cargando: false, usuario: sesion?.user ?? null });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return estado;
}
