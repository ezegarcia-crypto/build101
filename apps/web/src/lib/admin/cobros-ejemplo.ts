import type { Cobro, Factura, Suscripcion } from "@/lib/admin/cobros";

// DATOS DE EJEMPLO del panel de cobros, todos inventados (mails @ejemplo.com). Están solo para armar y probar la
// pantalla mientras no existen las tablas de verdad: el panel avisa arriba de todo que son de ejemplo. Cubren los
// casos que el panel tiene que mostrar bien: pago aprobado, pendiente, rechazado, devuelto, suscripción activa,
// pausada por cobro fallido y dada de baja, cuenta piloto, cobro en modo prueba, factura emitida, pendiente y con
// error después de varios reintentos. Cuando se conecte la base, este archivo se borra.

const u = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const s = (n: number) => `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export const SUSCRIPCIONES_EJEMPLO: Suscripcion[] = [
  {
    id: s(1), usuario: u(1), mail: "panaderia.lucia@ejemplo.com", plan: "marca",
    creado: "2026-12-14T13:05:00Z", actualizado: "2026-12-14T13:07:00Z", estado: "activa",
    proveedor: "mercadopago", proveedor_id: "pref-1001", hasta: null, prueba: false, nota: null,
  },
  {
    id: s(2), usuario: u(2), mail: "taller.bicis@ejemplo.com", plan: "mensual",
    creado: "2026-12-14T15:40:00Z", actualizado: "2026-12-14T15:42:00Z", estado: "activa",
    proveedor: "mercadopago", proveedor_id: "pre-2002", hasta: "2027-01-14T15:42:00Z", prueba: false, nota: null,
  },
  {
    id: s(3), usuario: u(3), mail: "yoga.costa@ejemplo.com", plan: "mensual",
    creado: "2026-11-15T10:00:00Z", actualizado: "2026-12-15T10:03:00Z", estado: "pausada",
    proveedor: "mercadopago", proveedor_id: "pre-2003", hasta: "2026-12-15T10:00:00Z", prueba: false, nota: null,
  },
  {
    id: s(4), usuario: u(4), mail: "estudio.contable@ejemplo.com", plan: "mensual",
    creado: "2026-12-15T18:20:00Z", actualizado: "2026-12-16T09:00:00Z", estado: "cancelada",
    proveedor: "mercadopago", proveedor_id: "pre-2004", hasta: "2027-01-15T18:20:00Z", prueba: false, nota: null,
  },
  {
    id: s(5), usuario: u(5), mail: "heladeria.sur@ejemplo.com", plan: "marca",
    creado: "2026-12-16T11:10:00Z", actualizado: "2026-12-16T11:10:00Z", estado: "pendiente",
    proveedor: "mercadopago", proveedor_id: "pref-1005", hasta: null, prueba: false, nota: null,
  },
  {
    id: s(6), usuario: u(6), mail: "vivero.norte@ejemplo.com", plan: "marca",
    creado: "2026-12-16T16:30:00Z", actualizado: "2026-12-17T12:00:00Z", estado: "cancelada",
    proveedor: "mercadopago", proveedor_id: "pref-1006", hasta: null, prueba: false, nota: null,
  },
  {
    id: s(7), usuario: u(7), mail: "cafe.esquina@ejemplo.com", plan: "mensual",
    creado: "2026-12-10T09:00:00Z", actualizado: "2026-12-10T09:00:00Z", estado: "activa",
    proveedor: "piloto", proveedor_id: null, hasta: "2027-01-10T09:00:00Z", prueba: false,
    nota: "Amiga de la lista de espera, beta cerrada",
  },
  {
    id: s(8), usuario: u(8), mail: "socio.prueba@ejemplo.com", plan: "mensual",
    creado: "2026-12-03T20:00:00Z", actualizado: "2026-12-03T20:02:00Z", estado: "activa",
    proveedor: "mercadopago", proveedor_id: "pre-2008", hasta: "2027-01-03T20:02:00Z", prueba: true, nota: null,
  },
];

export const COBROS_EJEMPLO: Cobro[] = [
  {
    id: 1, creado: "2026-12-03T20:02:00Z", usuario: u(8), mail: "socio.prueba@ejemplo.com", suscripcion: s(8),
    proveedor: "mercadopago", proveedor_id: "mp-90001", estado: "approved", monto: 1190, moneda: "UYU", prueba: true,
  },
  {
    id: 2, creado: "2026-12-14T13:07:00Z", usuario: u(1), mail: "panaderia.lucia@ejemplo.com", suscripcion: s(1),
    proveedor: "mercadopago", proveedor_id: "mp-90002", estado: "approved", monto: 800, moneda: "UYU", prueba: false,
  },
  {
    id: 3, creado: "2026-12-14T15:42:00Z", usuario: u(2), mail: "taller.bicis@ejemplo.com", suscripcion: s(2),
    proveedor: "mercadopago", proveedor_id: "mp-90003", estado: "approved", monto: 1190, moneda: "UYU", prueba: false,
  },
  {
    id: 4, creado: "2026-11-15T10:01:00Z", usuario: u(3), mail: "yoga.costa@ejemplo.com", suscripcion: s(3),
    proveedor: "mercadopago", proveedor_id: "mp-90004", estado: "approved", monto: 1190, moneda: "UYU", prueba: false,
  },
  {
    id: 5, creado: "2026-12-15T10:03:00Z", usuario: u(3), mail: "yoga.costa@ejemplo.com", suscripcion: s(3),
    proveedor: "mercadopago", proveedor_id: "mp-90005", estado: "rejected", monto: 1190, moneda: "UYU", prueba: false,
  },
  {
    id: 6, creado: "2026-12-15T18:22:00Z", usuario: u(4), mail: "estudio.contable@ejemplo.com", suscripcion: s(4),
    proveedor: "mercadopago", proveedor_id: "mp-90006", estado: "approved", monto: 1190, moneda: "UYU", prueba: false,
  },
  {
    id: 7, creado: "2026-12-16T11:12:00Z", usuario: u(5), mail: "heladeria.sur@ejemplo.com", suscripcion: s(5),
    proveedor: "mercadopago", proveedor_id: "mp-90007", estado: "pending", monto: 800, moneda: "UYU", prueba: false,
  },
  {
    id: 8, creado: "2026-12-16T16:31:00Z", usuario: u(6), mail: "vivero.norte@ejemplo.com", suscripcion: s(6),
    proveedor: "mercadopago", proveedor_id: "mp-90008", estado: "refunded", monto: 800, moneda: "UYU", prueba: false,
  },
];

// A CONFIRMAR CON EZE: no hay tabla de facturas todavía (C5).
export const FACTURAS_EJEMPLO: Factura[] = [
  { cobro: 1, estado: "emitida", numero: "A-000101", intentos: 1, ultimo_intento: "2026-12-03T20:03:00Z", error: null },
  { cobro: 2, estado: "emitida", numero: "A-000102", intentos: 1, ultimo_intento: "2026-12-14T13:08:00Z", error: null },
  {
    cobro: 3, estado: "fallo", numero: null, intentos: 3, ultimo_intento: "2026-12-14T17:42:00Z",
    error: "El proveedor de facturas no respondió",
  },
  { cobro: 4, estado: "emitida", numero: "A-000088", intentos: 1, ultimo_intento: "2026-11-15T10:02:00Z", error: null },
  { cobro: 6, estado: "pendiente", numero: null, intentos: 0, ultimo_intento: null, error: null },
  { cobro: 8, estado: "emitida", numero: "A-000104", intentos: 1, ultimo_intento: "2026-12-16T16:32:00Z", error: null },
];

// A CONFIRMAR CON EZE: lo que costó la IA de cada cuenta, en dólares (hoy /costos lo mide por navegador, no por cuenta).
export const COSTO_IA_EJEMPLO: Record<string, number> = {
  [u(1)]: 1.84,
  [u(2)]: 3.12,
  [u(3)]: 2.4,
  [u(4)]: 0.97,
  [u(5)]: 1.1,
  [u(6)]: 0.62,
  [u(7)]: 2.05,
  [u(8)]: 4.3,
};
