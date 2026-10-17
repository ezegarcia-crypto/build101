"use client";

import { instalarClienteEnPedidos } from "@/lib/cliente";

// Se instala apenas carga la app, antes de que cualquier pantalla le pida algo a la IA.
instalarClienteEnPedidos();

/** Marca cada pedido a /api con el id del cliente, para medir cuánto costó cada uno (ver lib/cliente.ts). */
export function ClienteEnPedidos() {
  return null;
}
