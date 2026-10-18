"use client";

import { useEffect, useState } from "react";

import { CLAVE_EQUIPO } from "@/lib/prueba-gratis";

// Entrar a /costos (con la contraseña) deja este navegador como del equipo: sin límite de prueba gratis.
// El servidor lo sabe por la cookie que deja el proxy (lib/equipo.ts); esta marca es para que la pantalla
// tampoco se frene a sí misma (lib/prueba-gratis.ts).
export function NavegadorEquipo() {
  const [listo, setListo] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_EQUIPO, "1");
      setListo(true);
    } catch {}
  }, []);
  if (!listo) return null;
  return (
    <p className="rounded-full border px-4 py-2 text-sm text-muted-foreground">
      Este navegador es del equipo: no tiene límite de prueba gratis ni tope diario.
    </p>
  );
}
