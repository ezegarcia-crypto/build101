import { z } from "zod";

import { colorSchema } from "@/lib/ia/direcciones";
import { fichaWebSchema } from "@/lib/ia/web/ficha-web";
import { webSchema } from "@/lib/ia/web/web";

// Las webs publicadas de los clientes (/w/[slug]), guardadas en Supabase (tabla `webs`, ver apps/web/supabase/webs.sql).
// Solo lo usa el servidor, con la clave de servicio, igual que lib/pagos.ts. Cada web se guarda con una `clave`
// al azar que queda en el navegador de quien la publicó: con ella, volver a publicar actualiza la misma dirección.

// De la identidad se guarda solo lo que la vista usa para dibujar la web
export const identidadWebSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  paleta: z.array(colorSchema).min(1).max(8),
  tipografias: z.object({ titulos: z.string().max(60), texto: z.string().max(60) }),
  fuentes_url: z.union([z.literal(""), z.string().max(500).startsWith("https://fonts.googleapis.com/")]),
  logo: z.object({ isotipo_svg: z.string().max(60_000) }),
});

export type IdentidadWeb = z.infer<typeof identidadWebSchema>;

export const webPublicadaSchema = z.object({
  web: webSchema,
  ficha_web: fichaWebSchema,
  identidad: identidadWebSchema,
});

export type WebPublicada = z.infer<typeof webPublicadaSchema>;

/** La dirección a partir del nombre: minúsculas, sin tildes y con guiones ("Huellas del Litoral" → "huellas-del-litoral") */
export function slugDe(nombre: string) {
  const slug = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
  return slug || "mi-web";
}

export const slugValido = (slug: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length <= 60;

const finalAlAzar = () => crypto.randomUUID().replace(/-/g, "").slice(0, 4);

function conexion() {
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) return null;
  return {
    url: `${url.replace(/\/$/, "")}/rest/v1/webs`,
    headers: { apikey: clave, Authorization: `Bearer ${clave}`, "content-type": "application/json" },
  };
}

async function pedir(metodo: string, consulta: string, cuerpo?: unknown) {
  const c = conexion();
  if (!c) throw new Error("Falta conectar la base de datos (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).");
  return fetch(`${c.url}${consulta}`, {
    method: metodo,
    headers: { ...c.headers, Prefer: "return=representation" },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    cache: "no-store",
  });
}

/**
 * Guarda la web. Si viene la dirección con su clave, actualiza esa misma web; si no (o la clave no coincide),
 * crea una dirección nueva a partir del nombre de la marca, con un final corto al azar si ya existe.
 */
export async function publicarWeb(datos: WebPublicada, anterior?: { slug: string; clave: string }) {
  if (anterior && slugValido(anterior.slug) && anterior.clave) {
    const r = await pedir(
      "PATCH",
      `?slug=eq.${anterior.slug}&clave=eq.${encodeURIComponent(anterior.clave)}`,
      { datos, actualizado: new Date().toISOString() },
    );
    if (!r.ok) throw new Error(`Supabase respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
    if (((await r.json()) as unknown[]).length) return anterior;
  }

  const base = slugDe(datos.identidad.nombre);
  const clave = crypto.randomUUID();
  for (let intento = 0; intento < 5; intento++) {
    const slug = intento === 0 ? base : `${base}-${finalAlAzar()}`;
    const r = await pedir("POST", "", { slug, clave, datos });
    if (r.ok) return { slug, clave };
    if (r.status !== 409) throw new Error(`Supabase respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
  }
  throw new Error("No encontramos una dirección libre para la web.");
}

/** La web publicada en esa dirección, o null si no existe */
export async function leerWeb(slug: string): Promise<WebPublicada | null> {
  if (!slugValido(slug) || !conexion()) return null;
  const r = await pedir("GET", `?slug=eq.${slug}&select=datos`);
  if (!r.ok) throw new Error(`Supabase respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const filas = (await r.json()) as { datos: unknown }[];
  const web = webPublicadaSchema.safeParse(filas[0]?.datos);
  return web.success ? web.data : null;
}
