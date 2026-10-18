"use client";

// El logo que eligió la persona, listo para la web. Las propuestas de logo son imágenes de 1024 × 1024 con
// fondo blanco: acá se le saca el blanco (queda transparente, así se apoya sobre el fondo de la marca),
// se recorta el margen y se achica. Queda un PNG liviano que se puede guardar con la web publicada.
// Sin IA y en el navegador: siempre da lo mismo para la misma imagen.

const ALTO_MAXIMO = 200;
const ANCHO_MAXIMO = 800;

/** El PNG del logo sin fondo blanco y recortado, o null si no se pudo leer la imagen */
export async function logoSinFondo(imagen: string): Promise<string | null> {
  if (typeof document === "undefined" || !imagen.startsWith("data:image/")) return null;
  const img = new Image();
  img.src = imagen;
  try {
    await img.decode();
  } catch {
    return null;
  }

  const lienzo = document.createElement("canvas");
  lienzo.width = img.naturalWidth;
  lienzo.height = img.naturalHeight;
  const x = lienzo.getContext("2d", { willReadFrequently: true });
  if (!x || !lienzo.width || !lienzo.height) return null;
  x.drawImage(img, 0, 0);
  const datos = x.getImageData(0, 0, lienzo.width, lienzo.height);
  const p = datos.data;

  // Blanco → transparente ("color a alfa"): cada píxel queda con la tinta que tenía sobre el blanco
  let [arriba, izquierda, abajo, derecha] = [lienzo.height, lienzo.width, -1, -1];
  for (let i = 0; i < p.length; i += 4) {
    const a = Math.max(255 - p[i], 255 - p[i + 1], 255 - p[i + 2]) / 255;
    if (a < 0.04) {
      p[i + 3] = 0;
      continue;
    }
    for (let k = 0; k < 3; k++) p[i + k] = Math.round(255 - (255 - p[i + k]) / a);
    p[i + 3] = Math.round(p[i + 3] * a);
    const n = i / 4;
    const fila = Math.floor(n / lienzo.width);
    const col = n % lienzo.width;
    if (fila < arriba) arriba = fila;
    if (fila > abajo) abajo = fila;
    if (col < izquierda) izquierda = col;
    if (col > derecha) derecha = col;
  }
  if (abajo < 0) return null;
  x.putImageData(datos, 0, 0);

  // Recorte con un margen chico, y a un tamaño liviano
  const margen = Math.round(Math.max(derecha - izquierda, abajo - arriba) * 0.03);
  const sx = Math.max(0, izquierda - margen);
  const sy = Math.max(0, arriba - margen);
  const sw = Math.min(lienzo.width, derecha + margen + 1) - sx;
  const sh = Math.min(lienzo.height, abajo + margen + 1) - sy;
  const escala = Math.min(1, ALTO_MAXIMO / sh, ANCHO_MAXIMO / sw);
  const final = document.createElement("canvas");
  final.width = Math.max(1, Math.round(sw * escala));
  final.height = Math.max(1, Math.round(sh * escala));
  const f = final.getContext("2d");
  if (!f) return null;
  f.imageSmoothingQuality = "high";
  f.drawImage(lienzo, sx, sy, sw, sh, 0, 0, final.width, final.height);
  return final.toDataURL("image/png");
}
