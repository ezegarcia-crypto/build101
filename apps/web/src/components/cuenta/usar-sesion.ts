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
    // Si entró con el enlace del mail, eso pasó en otra pestaña: al volver a esta, se mira de nuevo la sesión
    const mirar = () => {
      if (document.visibilityState !== "visible") return;
      supabase.auth.getSession().then(({ data: d }) => {
        setEstado((antes) =>
          antes.usuario?.id === d.session?.user.id ? antes : { cargando: false, usuario: d.session?.user ?? null },
        );
      });
    };
    document.addEventListener("visibilitychange", mirar);
    window.addEventListener("focus", mirar);
    return () => {
      data.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", mirar);
      window.removeEventListener("focus", mirar);
    };
  }, []);

  return estado;
}
