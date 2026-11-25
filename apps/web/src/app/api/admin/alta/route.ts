import QRCode from "qrcode";

import { confirmarAlta, iniciarAlta, normalizarMail } from "@/lib/admin/admins";
import { esClaveDelEquipo } from "@/lib/clave-costos";

import { cuerpo, error, respuestaConSesion } from "../respuesta";

// POST /api/admin/alta · el alta de un administrador de la lista, en dos pasos. Sin IA.
// paso "iniciar": { claveEquipo, mail, clave } → el QR para escanear con Google Authenticator.
// paso "confirmar": { claveEquipo, mail, clave, codigo } → activa la cuenta y deja la sesión.

export async function POST(req: Request) {
  const datos = await cuerpo(req);
  if (!esClaveDelEquipo(String(datos.claveEquipo ?? ""))) return error("La contraseña del equipo no es correcta.", 401);
  const mail = normalizarMail(datos.mail);
  const clave = String(datos.clave ?? "").slice(0, 200);
  if (!mail || !clave) return error("Completá tu mail y la contraseña que elegiste.");
  try {
    if (datos.paso === "iniciar") {
      const r = await iniciarAlta(mail, clave);
      if (!r.ok) return error(r.error);
      const qr = await QRCode.toDataURL(r.link, { margin: 1, width: 240, color: { dark: "#1E1E1C", light: "#FFFFFF" } });
      return Response.json({ ok: true, qr, semilla: r.semilla });
    }
    const r = await confirmarAlta(mail, clave, String(datos.codigo ?? "").replace(/\s/g, ""));
    if (!r.ok) return error(r.error, 401);
    return respuestaConSesion(mail, r.nombre);
  } catch (e) {
    console.error("[admin] no se pudo hacer el alta", e);
    return error("No pudimos guardar el alta. Probá de nuevo en un rato.", 503);
  }
}
