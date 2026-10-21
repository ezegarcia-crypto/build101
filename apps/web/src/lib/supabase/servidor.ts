import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase desde el servidor, con la sesión de la persona que hizo el pedido (la leen las cookies que deja el
// navegador al entrar). Sirve para saber quién es y leer lo suyo respetando la seguridad por fila.
// Para escribir lo que la persona no puede tocar (suscripciones, cobros) se usa lib/supabase/servicio.ts.

export async function supabaseServidor() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !clave) return null;
  const almacen = await cookies();
  return createServerClient(url, clave, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (lista) => {
        // En una página (server component) no se pueden escribir cookies: ahí la sesión la renueva el navegador
        try {
          for (const { name, value, options } of lista) almacen.set(name, value, options);
        } catch {}
      },
    },
  });
}
