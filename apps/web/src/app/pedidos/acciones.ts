"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { revisarClave } from "@/lib/clave-costos";
import { cambiarEstado, ESTADOS, type Estado } from "@/lib/pedidos";

// Cambiar el estado de un pedido de BranderIA. Revisa la contraseña del panel de nuevo, como /costos.

export async function moverPedido(datos: FormData) {
  const estado = revisarClave((await headers()).get("authorization"));
  if (estado !== "ok" && estado !== "abierto") return;
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
