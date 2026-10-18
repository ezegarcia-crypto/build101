import { z } from "zod";

// Los planes de BrandIA y la gente que se anota para uno (tabla `interesados`, ver apps/web/supabase/interesados.sql).
// Todavía no se cobra: quien elige un plan deja sus datos y el equipo lo contacta. El cobro automático (Mercado
// Pago) está en construcción. Precios de lanzamiento que fijaron los socios el 18/10:
// la marca USD 19,99 y la suscripción USD 29 por mes. Solo el servidor habla con Supabase, con la clave de servicio, como lib/pagos.ts.

export type Plan = {
  id: "marca" | "mensual" | "branderia";
  nombre: string;
  precio: string;
  periodo: string;
  resumen: string;
  incluye: string[];
  /** Lo que se suma más adelante (está en "Lo que viene") */
  pronto?: string[];
  destacado?: boolean;
};

export const PLANES: Plan[] = [
  {
    id: "marca",
    nombre: "Tu marca",
    precio: "USD 19,99",
    periodo: "un solo pago",
    resumen: "Contás tu negocio y te llevás la marca entera, lista para usar.",
    incluye: [
      "La entrevista por chat, escrita o con audios",
      "Nombres con su porqué y tres caminos para elegir",
      "Logo, paleta, tipografías y voz de la marca",
      "El brandbook completo, con misión, visión y tono",
      "Todos los archivos para descargar",
    ],
  },
  {
    id: "mensual",
    nombre: "Tu marca andando",
    precio: "USD 29",
    periodo: "por mes",
    resumen: "Cada mes, tu calendario y tus contenidos hechos con tu marca.",
    incluye: [
      "Tu marca (el plan de arriba) incluida",
      "El plan del mes: temas, días y horarios",
      "Hasta 30 piezas por mes: posteos, carruseles, historias y reels",
      "Tu web con tu marca, publicada con link y QR",
      "Cambios cuando quieras, pidiéndolos en palabras",
    ],
    pronto: ["Publicación automática en tus redes", "Newsletter, LinkedIn y X", "Pauta en Meta"],
    destacado: true,
  },
  {
    id: "branderia",
    nombre: "BranderIA",
    precio: "A cotizar",
    periodo: "por pedido",
    resumen: "Tus productos con tu marca: BrandIA los produce y te los manda.",
    incluye: [
      "Productos elegidos para tu rubro",
      "La foto de cada producto con tu marca antes de pedir",
      "Producción y envío a cargo de BrandIA",
      "Te pasamos la cotización por WhatsApp",
    ],
  },
];

const IDS = PLANES.map((p) => p.id) as [Plan["id"], ...Plan["id"][]];

export const interesadoSchema = z.object({
  plan: z.enum(IDS),
  nombre: z.string().trim().min(1, "Contanos tu nombre").max(80),
  contacto: z
    .string()
    .trim()
    .min(6, "Dejanos un mail o un WhatsApp")
    .max(120)
    .refine((v) => /^\S+@\S+\.\S+$/.test(v) || /^\+?[\d\s()-]{6,}$/.test(v), "Dejanos un mail o un WhatsApp"),
  marca: z.string().trim().max(80).optional(),
});

export type Interesado = z.infer<typeof interesadoSchema>;

/** Guarda a la persona que se anotó para un plan. */
export async function anotarInteresado(datos: Interesado, cliente?: string) {
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) throw new Error("Falta conectar la base de datos (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).");
  const r = await fetch(`${url.replace(/\/$/, "")}/rest/v1/interesados`, {
    method: "POST",
    headers: { apikey: clave, Authorization: `Bearer ${clave}`, "content-type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ ...datos, marca: datos.marca || null, cliente: cliente ?? null }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Supabase respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
}
