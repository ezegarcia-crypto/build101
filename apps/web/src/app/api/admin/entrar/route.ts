import { entrar, normalizarMail } from "@/lib/admin/admins";

import { cuerpo, error, respuestaConSesion } from "../respuesta";

// POST /api/admin/entrar · { mail, clave, codigo } → deja la sesión de administrador. Sin IA.

export async function POST(req: Request) {
  const datos = await cuerpo(req);
  const mail = normalizarMail(datos.mail);
  const clave = String(datos.clave ?? "").slice(0, 200);
  const codigo = String(datos.codigo ?? "").replace(/\s/g, "");
  if (!mail || !clave || !codigo) return error("Completá el mail, la contraseña y el código.");
  try {
    const r = await entrar(mail, clave, codigo);
    if (!r.ok) return error(r.error, 401);
    return respuestaConSesion(mail, r.nombre);
  } catch (e) {
    console.error("[admin] no se pudo entrar", e);
    return error("No pudimos revisar tus datos. Probá de nuevo en un rato.", 503);
  }
}
