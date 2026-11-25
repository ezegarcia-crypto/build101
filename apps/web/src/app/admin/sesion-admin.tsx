import { cookies } from "next/headers";

import { COOKIE_ADMIN, leerSesion } from "@/lib/admin/sesion";

import { BotonSalir } from "./formularios";

// Arriba de cada panel (/costos, /pruebas y /pedidos): quién entró y el botón para salir. Sin sesión (en la compu sin
// Supabase los paneles abren sin login) no muestra nada.

export async function SesionAdmin() {
  const sesion = await leerSesion((await cookies()).get(COOKIE_ADMIN)?.value);
  if (!sesion) return null;
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span>Entraste como {sesion.nombre}</span>
      <BotonSalir />
    </div>
  );
}
