import { cookies } from "next/headers";

import { COOKIE_ADMIN, leerSesion } from "@/lib/admin/sesion";

import { BotonSalir } from "./formularios";

// Arriba de cada panel (/costos, /pruebas, /pedidos y /admin/cobros): los links entre paneles, quién entró y el botón
// para salir. Sin sesión (en la compu sin Supabase los paneles abren sin login) no muestra nada.

const PANELES = [
  ["/admin/cobros", "Cobros"],
  ["/costos", "Costos"],
  ["/pedidos", "Pedidos"],
  ["/pruebas", "Pruebas"],
] as const;

export async function SesionAdmin() {
  const sesion = await leerSesion((await cookies()).get(COOKIE_ADMIN)?.value);
  if (!sesion) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
      <nav aria-label="Paneles del equipo" className="flex flex-wrap gap-x-3">
        {PANELES.map(([ruta, nombre]) => (
          <a key={ruta} href={ruta} className="text-accent-text">
            {nombre}
          </a>
        ))}
      </nav>
      <span>Entraste como {sesion.nombre}</span>
      <BotonSalir />
    </div>
  );
}
