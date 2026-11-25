// Los códigos de 6 números de Google Authenticator (TOTP, RFC 6238): cambian cada 30 segundos y salen de una
// semilla secreta que comparten la app del celular y el servidor. Hecho con WebCrypto, sin instalar nada.

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const PERIODO = 30;

function aBase32(bytes: Uint8Array) {
  let bits = 0;
  let valor = 0;
  let texto = "";
  for (const b of bytes) {
    valor = (valor << 8) | b;
    bits += 8;
    while (bits >= 5) {
      texto += ALFABETO[(valor >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) texto += ALFABETO[(valor << (5 - bits)) & 31];
  return texto;
}

function deBase32(texto: string) {
  const limpio = texto.replace(/[\s=]/g, "").toUpperCase();
  const bytes: number[] = [];
  let bits = 0;
  let valor = 0;
  for (const letra of limpio) {
    const i = ALFABETO.indexOf(letra);
    if (i < 0) throw new Error("Semilla inválida");
    valor = (valor << 5) | i;
    bits += 5;
    if (bits >= 8) {
      bytes.push((valor >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

/** Una semilla nueva de 160 bits, en base32 (lo que se escanea con el QR). */
export function nuevaSemilla() {
  return aBase32(crypto.getRandomValues(new Uint8Array(20)));
}

/** El link que lee Google Authenticator: aparece como "BrandIA (mail)". */
export function linkParaLaApp(semilla: string, mail: string) {
  const etiqueta = encodeURIComponent(`BrandIA admin:${mail}`);
  return `otpauth://totp/${etiqueta}?secret=${semilla}&issuer=BrandIA&algorithm=SHA1&digits=6&period=${PERIODO}`;
}

async function codigoDelPaso(semilla: string, paso: number) {
  const contador = new Uint8Array(8);
  new DataView(contador.buffer).setBigUint64(0, BigInt(paso));
  const llave = await crypto.subtle.importKey("raw", deBase32(semilla), { name: "HMAC", hash: "SHA-1" }, false, [
    "sign",
  ]);
  const hmac = new Uint8Array(await crypto.subtle.sign("HMAC", llave, contador));
  const corte = hmac[19] & 15;
  const numero =
    ((hmac[corte] & 127) << 24) | (hmac[corte + 1] << 16) | (hmac[corte + 2] << 8) | hmac[corte + 3];
  return String(numero % 1_000_000).padStart(6, "0");
}

/**
 * Revisa el código escrito. Acepta el de ahora y el de 30 segundos antes o después (por si el reloj del celular
 * anda corrido). Devuelve el paso que coincidió, para no aceptar el mismo código dos veces, o null.
 */
export async function revisarCodigo(semilla: string, codigo: string, ultimoPaso: number, ahora = Date.now()) {
  if (!/^\d{6}$/.test(codigo)) return null;
  const paso = Math.floor(ahora / 1000 / PERIODO);
  for (const p of [paso - 1, paso, paso + 1]) {
    if (p > ultimoPaso && (await codigoDelPaso(semilla, p)) === codigo) return p;
  }
  return null;
}
