import { z } from "zod";

import { supabaseServicio } from "@/lib/supabase/servicio";

// Las cuentas piloto: el equipo le regala a alguien el plan completo ("Tu marca andando") por un tiempo, sin cobrarle.
// Se arman desde /pilotos (solo para el equipo, con la contraseña de /costos). Por dentro es una fila más de
// `suscripciones`, con proveedor "piloto" y la fecha hasta la que es gratis (ver apps/web/supabase/cuentas.sql).
// Así, todo lo que se destraba pagando también se destraba para un piloto, sin tocar el resto de la app.
//
// Si la persona todavía no tenía cuenta, se le crea con su correo (sin contraseña): entra en /ingresar con el
// código que le llega por correo, como cualquiera. Solo en el servidor, con la clave de servicio.

export type Piloto = {
  id: string;
  usuario: string;
  mail: string | null;
  creado: string;
  hasta: string | null;
  estado: string;
  nota: string | null;
};

export const pilotoSchema = z.object({
  mail: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Revisá el correo: parece que le falta algo."),
  dias: z.coerce
    .number()
    .int("Los días van sin decimales.")
    .min(1, "Tiene que ser al menos un día.")
    .max(365, "Como mucho, un año."),
  nota: z
    .string()
    .trim()
    .max(200, "La nota es muy larga (hasta 200 letras).")
    .nullable()
    .transform((v) => v || null),
});

export const DIAS_PILOTO = 60;
const DIA_MS = 86_400_000;

export const hayBaseDeDatos = () => supabaseServicio() !== null;

function base() {
  const s = supabaseServicio();
  if (!s) throw new Error("Falta conectar la base de datos (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).");
  return s;
}

/** Las cuentas piloto, las más nuevas primero, con el correo de cada una. */
export async function listarPilotos(): Promise<Piloto[]> {
  const { data, error } = await base()
    .from("suscripciones")
    .select("id, usuario, creado, hasta, estado, nota")
    .eq("proveedor", "piloto")
    .order("creado", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  const filas = data ?? [];
  if (!filas.length) return [];
  const { data: perfiles } = await base()
    .from("perfiles")
    .select("id, mail")
    .in(
      "id",
      filas.map((f) => f.usuario),
    );
  const mails = new Map((perfiles ?? []).map((p) => [p.id as string, p.mail as string | null]));
  return filas.map((f) => ({ ...f, mail: mails.get(f.usuario) ?? null }) as Piloto);
}

/** El id de la cuenta con ese correo. Si no existe, la crea (sin contraseña: entra con el código por correo). */
async function cuentaDe(mail: string) {
  const s = base();
  const { data: perfil } = await s.from("perfiles").select("id").eq("mail", mail).maybeSingle();
  if (perfil?.id) return perfil.id as string;

  const { data: nueva, error } = await s.auth.admin.createUser({ email: mail, email_confirm: true });
  if (nueva.user) return nueva.user.id;

  // Ya tenía cuenta pero sin perfil (las de antes de cuentas.sql): se la busca entre las cuentas
  for (let pagina = 1; pagina <= 20; pagina++) {
    const { data: lista } = await s.auth.admin.listUsers({ page: pagina, perPage: 1000 });
    const encontrada = lista.users.find((u) => u.email?.toLowerCase() === mail);
    if (encontrada) return encontrada.id;
    if (lista.users.length < 1000) break;
  }
  throw new Error(`No se pudo crear la cuenta: ${error?.message ?? "sin motivo"}`);
}

/**
 * Le da a ese correo una cuenta piloto por `dias` días, contando desde hoy. Si ya tenía una vigente, se le suman
 * los días a los que le quedan (no se arma otra). Si la que tenía ya venció, arranca una nueva. Devuelve hasta
 * cuándo queda gratis.
 */
export async function darPiloto({ mail, dias, nota }: z.infer<typeof pilotoSchema>) {
  const usuario = await cuentaDe(mail);
  const s = base();
  const ahora = new Date().toISOString();

  const { data: vigente } = await s
    .from("suscripciones")
    .select("id, nota, hasta")
    .eq("usuario", usuario)
    .eq("proveedor", "piloto")
    .eq("estado", "activa")
    .gt("hasta", ahora)
    .order("hasta", { ascending: false })
    .limit(1)
    .maybeSingle();

  const desde = vigente?.hasta ? new Date(vigente.hasta).getTime() : Date.now();
  const hasta = new Date(desde + dias * DIA_MS).toISOString();

  const { error } = vigente
    ? await s
        .from("suscripciones")
        .update({ hasta, actualizado: ahora, nota: nota ?? vigente.nota })
        .eq("id", vigente.id)
    : await s.from("suscripciones").insert({
        usuario,
        plan: "mensual",
        estado: "activa",
        proveedor: "piloto",
        hasta,
        nota,
      });
  if (error) throw new Error(error.message);
  return { hasta, alargada: Boolean(vigente) };
}

/** Termina una cuenta piloto hoy: la persona sigue teniendo su cuenta y sus marcas, pero vuelve a la prueba gratis. */
export async function terminarPiloto(id: string) {
  const ahora = new Date().toISOString();
  const { error } = await base()
    .from("suscripciones")
    .update({ estado: "cancelada", hasta: ahora, actualizado: ahora })
    .eq("id", id)
    .eq("proveedor", "piloto");
  if (error) throw new Error(error.message);
}
