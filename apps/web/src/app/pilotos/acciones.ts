"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { revisarClave } from "@/lib/clave-costos";
import { darPiloto, pilotoSchema, terminarPiloto } from "@/lib/pilotos";

// Dar y terminar cuentas piloto. Cada acción revisa la contraseña del panel de nuevo, como /costos y /pedidos:
// Next.js deja llamar a una acción desde cualquier dirección del sitio.

export type EstadoForm = { ok: boolean; mensaje: string | null };

async function autorizado() {
  const estado = revisarClave((await headers()).get("authorization"));
  return estado === "ok" || estado === "abierto";
}

const fecha = new Intl.DateTimeFormat("es-UY", { day: "numeric", month: "long", timeZone: "America/Montevideo" });

export async function dar(_: EstadoForm, datos: FormData): Promise<EstadoForm> {
  if (!(await autorizado())) return { ok: false, mensaje: "No tenés permiso para dar cuentas piloto." };
  const r = pilotoSchema.safeParse({
    mail: datos.get("mail") ?? "",
    dias: datos.get("dias"),
    nota: datos.get("nota"),
  });
  if (!r.success) return { ok: false, mensaje: r.error.issues[0]?.message ?? "Revisá los datos." };
  try {
    const { hasta, alargada } = await darPiloto(r.data);
    revalidatePath("/pilotos");
    return {
      ok: true,
      mensaje: `${alargada ? `Listo, se le sumaron ${r.data.dias} días` : "Listo"}: ${r.data.mail} tiene BrandIA completo gratis hasta el ${fecha.format(new Date(hasta))}.`,
    };
  } catch (error) {
    console.error("[pilotos] no se pudo dar la cuenta", error);
    return { ok: false, mensaje: "No se pudo guardar. Probá de nuevo en un rato." };
  }
}

export async function terminar(datos: FormData) {
  if (!(await autorizado())) return;
  const id = String(datos.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  try {
    await terminarPiloto(id);
  } catch (error) {
    console.error("[pilotos] no se pudo terminar la cuenta", error);
  }
  revalidatePath("/pilotos");
}
