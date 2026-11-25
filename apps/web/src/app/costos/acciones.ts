"use server";

import { revalidatePath } from "next/cache";

import { esAdmin } from "@/lib/admin/sesion";
import { anotarPago, borrarPago, pagoSchema } from "@/lib/pagos";

// Anotar y borrar pagos del registro. Cada acción revisa de nuevo que sea un administrador.

export type EstadoForm = { ok: boolean; mensaje: string | null };

const texto = (v: FormDataEntryValue | null) => (v === null || String(v).trim() === "" ? null : String(v));

export async function anotar(_: EstadoForm, datos: FormData): Promise<EstadoForm> {
  if (!(await esAdmin())) return { ok: false, mensaje: "No tenés permiso para anotar pagos." };
  const r = pagoSchema.safeParse({
    fecha: datos.get("fecha"),
    quien: datos.get("quien"),
    concepto: datos.get("concepto"),
    categoria: datos.get("categoria"),
    monto_usd: datos.get("monto_usd"),
    reparto: datos.get("reparto"),
    porcentaje: texto(datos.get("porcentaje")),
    nota: texto(datos.get("nota")),
  });
  if (!r.success) return { ok: false, mensaje: r.error.issues[0]?.message ?? "Revisá los datos." };
  if (r.data.reparto === "porcentaje" && r.data.porcentaje === null) {
    return { ok: false, mensaje: "Poné qué porcentaje es de BrandIA." };
  }
  try {
    await anotarPago(r.data);
  } catch (error) {
    console.error("[costos] no se pudo anotar el pago", error);
    return { ok: false, mensaje: "No se pudo guardar. Probá de nuevo en un rato." };
  }
  revalidatePath("/costos");
  return { ok: true, mensaje: "Pago anotado." };
}

export async function borrar(id: number) {
  if (!(await esAdmin())) return;
  await borrarPago(id);
  revalidatePath("/costos");
}
