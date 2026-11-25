"use server";

import { revalidatePath } from "next/cache";

import { esAdmin } from "@/lib/admin/sesion";
import { cambiarEstado, ESTADOS, type Estado } from "@/lib/pedidos";

// Cambiar el estado de un pedido de BranderIA. Revisa de nuevo que sea un administrador, como /costos.

export async function moverPedido(datos: FormData) {
  if (!(await esAdmin())) return;
  const id = Number(datos.get("id"));
  const nuevo = String(datos.get("estado")) as Estado;
  if (!Number.isInteger(id) || id <= 0 || !(nuevo in ESTADOS)) return;
  try {
    await cambiarEstado(id, nuevo);
  } catch (error) {
    console.error("[pedidos] no se pudo cambiar el estado", error);
  }
  revalidatePath("/pedidos");
}
