import { COBROS_EJEMPLO, COSTO_IA_EJEMPLO, FACTURAS_EJEMPLO, SUSCRIPCIONES_EJEMPLO } from "@/lib/admin/cobros-ejemplo";

// Lo que muestra el panel de cobros (/admin/cobros). Los tipos copian las tablas de Eze (apps/web/supabase/cuentas.sql,
// rama claude/cuentas-y-cobros): `suscripciones` y `cobros` (se llama así porque `pagos` ya es el registro de gastos
// del equipo de /costos). Lo marcado "A CONFIRMAR CON EZE" todavía no existe en la base: las facturas (C5), sus
// reintentos y el costo de IA de cada cuenta.
//
// Hoy lee los datos de ejemplo (lib/admin/cobros-ejemplo.ts). Cuando estén las tablas, solo cambia leerPanelCobros().

export type Plan = "marca" | "mensual" | "branderia";

export const PLANES: Record<Plan, string> = {
  marca: "Tu marca",
  mensual: "Tu marca andando",
  branderia: "BranderIA",
};

/** Tabla `suscripciones`, más el mail de `perfiles` para saber quién es. */
export type Suscripcion = {
  id: string;
  usuario: string;
  mail: string | null;
  plan: Plan;
  creado: string;
  actualizado: string;
  estado: "pendiente" | "activa" | "pausada" | "cancelada";
  proveedor: "mercadopago" | "piloto";
  proveedor_id: string | null;
  hasta: string | null;
  prueba: boolean;
  nota: string | null;
};

/** Tabla `cobros`: cada pago que avisa Mercado Pago (el primero y los de cada mes). */
export type Cobro = {
  id: number;
  creado: string;
  usuario: string | null;
  mail: string | null;
  suscripcion: string | null;
  proveedor: string;
  proveedor_id: string;
  /** Tal cual lo dice Mercado Pago: approved, pending, in_process, rejected, refunded, charged_back, cancelled… */
  estado: string;
  monto: number | null;
  moneda: string | null;
  prueba: boolean;
};

/** A CONFIRMAR CON EZE: la factura (e-ticket) de cada cobro aprobado y sus reintentos si falló. */
export type Factura = {
  cobro: number;
  estado: "emitida" | "pendiente" | "fallo";
  numero: string | null;
  intentos: number;
  ultimo_intento: string | null;
  error: string | null;
};

export type PanelCobros = {
  /** "ejemplo" mientras no estén las tablas: la pantalla lo avisa arriba de todo. */
  origen: "ejemplo" | "base";
  suscripciones: Suscripcion[];
  cobros: Cobro[];
  facturas: Factura[];
  /** A CONFIRMAR CON EZE: lo que costó la IA de cada cuenta, en dólares. Hoy /costos lo mide por navegador. */
  costoIA: Record<string, number>;
};

export const ESTADOS_COBRO: Record<string, { texto: string; tipo: "ok" | "espera" | "mal" | "devuelto" }> = {
  approved: { texto: "Aprobado", tipo: "ok" },
  authorized: { texto: "Autorizado", tipo: "espera" },
  pending: { texto: "Pendiente", tipo: "espera" },
  in_process: { texto: "En revisión", tipo: "espera" },
  in_mediation: { texto: "En disputa", tipo: "mal" },
  rejected: { texto: "Rechazado", tipo: "mal" },
  cancelled: { texto: "Cancelado", tipo: "mal" },
  refunded: { texto: "Devuelto", tipo: "devuelto" },
  charged_back: { texto: "Contracargo", tipo: "devuelto" },
};

export function estadoCobro(estado: string) {
  return ESTADOS_COBRO[estado] ?? { texto: estado, tipo: "espera" as const };
}

export async function leerPanelCobros(): Promise<PanelCobros> {
  return {
    origen: "ejemplo",
    suscripciones: SUSCRIPCIONES_EJEMPLO,
    cobros: COBROS_EJEMPLO,
    facturas: FACTURAS_EJEMPLO,
    costoIA: COSTO_IA_EJEMPLO,
  };
}
