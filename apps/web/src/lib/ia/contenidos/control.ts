import type { Brief } from "@/lib/ia/brief";
import type {
  ContenidoCarrusel,
  ContenidoHistoria,
  ContenidoPost,
  ContenidoReel,
  Observacion,
} from "@/lib/ia/contenidos/esquemas";
import { FORMATOS, type IdFormato } from "@/lib/ia/contenidos/formatos";
import { CLICHES } from "@/lib/ia/contenidos/prompts";
import type { Identidad } from "@/lib/ia/identidad";

// El control de calidad de cada pieza, sin IA: reglas que se pueden verificar con código.
// blocker = la pieza vuelve al redactor una vez con el problema anotado; si sigue, sale marcada
// "revisar" para que la vea una persona. menor = sale igual, con el aviso.

type Contenido = ContenidoPost | ContenidoCarrusel | ContenidoHistoria | ContenidoReel;

const sinMarcas = (s: string) => s.replace(/\*/g, "");
const contarPalabras = (s: string | null | undefined) => (s ? sinMarcas(s).trim().split(/\s+/).filter(Boolean).length : 0);
const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const EMOJI = /\p{Extended_Pictographic}/gu;

// Formas que delatan el trato. Solo las que no se confunden con otra persona del verbo.
// Los límites de palabra son con letras Unicode: \b no reconoce las letras con tilde.
const VOSEO = /(?<!\p{L})(tenés|querés|podés|sabés|sos|vení|mirá|probá|escribinos|contanos|elegí|pedí|reservá|hacé|andá|pasá|animate|seguinos)(?!\p{L})/iu;
const TUTEO = /(?<!\p{L})(tienes|quieres|puedes|sabes|eres|escríbenos|cuéntanos|anímate|síguenos|tú)(?!\p{L})/iu;

/** Datos duros escritos en el texto: precios, porcentajes, horarios. */
const DATO_DURO = /(?:\$|USD|U\$S|€)\s?\d[\d.,]*|\d+(?:[.,]\d+)?\s?%|\b\d{1,2}(?::\d{2})?\s?(?:h|hs|horas)\b|\b\d{1,2}:\d{2}\b/gi;

function textosDe(formato: IdFormato, c: Contenido): { ranura: string; texto: string | null; limite?: number }[] {
  const L = FORMATOS[formato].limites;
  switch (formato) {
    case "post": {
      const p = c as ContenidoPost;
      return [
        { ranura: "titular", texto: p.titular, limite: L.titular },
        { ranura: "bajada", texto: p.bajada, limite: L.bajada },
        { ranura: "cta", texto: p.cta, limite: L.cta },
        { ranura: "caption", texto: p.caption },
      ];
    }
    case "carrusel": {
      const k = c as ContenidoCarrusel;
      return [
        ...k.laminas.flatMap((l, i) => [
          { ranura: `lámina ${i + 1} · titular`, texto: l.titular, limite: L.titular },
          { ranura: `lámina ${i + 1} · texto`, texto: l.texto, limite: L.texto },
        ]),
        { ranura: "caption", texto: k.caption },
      ];
    }
    case "historia": {
      const h = c as ContenidoHistoria;
      return h.pantallas.flatMap((p, i) => [
        { ranura: `pantalla ${i + 1} · texto`, texto: p.texto, limite: L.texto },
        { ranura: `pantalla ${i + 1} · sticker`, texto: p.sticker.texto, limite: L.sticker },
      ]);
    }
    case "reel": {
      const r = c as ContenidoReel;
      return [
        ...r.ganchos.map((g, i) => ({ ranura: `gancho ${i + 1}`, texto: g.texto, limite: L.texto_en_pantalla })),
        ...r.escenas.flatMap((e, i) => [
          { ranura: `escena ${i + 1} · texto en pantalla`, texto: e.texto_en_pantalla, limite: L.texto_en_pantalla },
          { ranura: `escena ${i + 1} · voz en off`, texto: e.voz_en_off, limite: L.voz_en_off },
        ]),
        { ranura: "caption", texto: r.caption },
      ];
    }
  }
}

/** Los textos que van dibujados en la imagen y llevan una palabra de acento. */
function textosConAcento(formato: IdFormato, c: Contenido): { ranura: string; texto: string }[] {
  if (formato === "post") return [{ ranura: "titular", texto: (c as ContenidoPost).titular }];
  if (formato === "carrusel")
    return (c as ContenidoCarrusel).laminas.map((l, i) => ({ ranura: `lámina ${i + 1}`, texto: l.titular }));
  if (formato === "historia")
    return (c as ContenidoHistoria).pantallas.map((p, i) => ({ ranura: `pantalla ${i + 1}`, texto: p.texto }));
  return (c as ContenidoReel).escenas.map((e, i) => ({ ranura: `escena ${i + 1}`, texto: e.texto_en_pantalla }));
}

export function controlarPieza(formato: IdFormato, c: Contenido, identidad: Identidad, brief: Brief): Observacion[] {
  const obs: Observacion[] = [];
  const L = FORMATOS[formato].limites;
  const textos = textosDe(formato, c);
  const todo = textos.map((t) => t.texto ?? "").join("\n");

  // 1. Largos: lo que va en la imagen tiene que leerse a 30 cm del celular.
  for (const t of textos) {
    if (!t.limite || !t.texto) continue;
    const n = contarPalabras(t.texto);
    if (n > t.limite)
      obs.push({
        control: "largo",
        gravedad: n > t.limite + 2 ? "blocker" : "menor",
        detalle: `${t.ranura}: ${n} palabras, el máximo es ${t.limite}.`,
      });
  }
  const caption = "caption" in c ? c.caption : null;
  if (caption && L.caption_caracteres && caption.length > L.caption_caracteres)
    obs.push({ control: "largo", gravedad: "menor", detalle: `caption: ${caption.length} caracteres, el máximo es ${L.caption_caracteres}.` });

  // 2. Cantidades del formato.
  const rango = (n: number, min: number, max: number, que: string) => {
    if (n < min || n > max) obs.push({ control: "cantidad", gravedad: "blocker", detalle: `${n} ${que}: tienen que ser entre ${min} y ${max}.` });
  };
  if (formato === "carrusel") rango((c as ContenidoCarrusel).laminas.length, L.laminas_min, L.laminas_max, "láminas");
  if (formato === "historia") rango((c as ContenidoHistoria).pantallas.length, L.pantallas_min, L.pantallas_max, "pantallas");
  if (formato === "reel") {
    const r = c as ContenidoReel;
    rango(r.escenas.length, L.escenas_min, L.escenas_max, "escenas");
    rango(r.ganchos.length, L.ganchos, L.ganchos, "ganchos");
    if (new Set(r.ganchos.map((g) => g.formula)).size < r.ganchos.length)
      obs.push({ control: "ganchos", gravedad: "menor", detalle: "Hay ganchos con la misma fórmula: tienen que ser distintas para poder compararlas." });
  }

  // 3. Palabras prohibidas de la marca y frases gastadas.
  const texto = normalizar(todo);
  for (const p of identidad.voz.lexico_no)
    if (p.trim() && texto.includes(normalizar(p)))
      obs.push({ control: "voz", gravedad: "blocker", detalle: `Usa «${p}», que la marca nunca dice.` });
  for (const p of CLICHES)
    if (texto.includes(normalizar(p))) obs.push({ control: "voz", gravedad: "menor", detalle: `Frase gastada: «${p}».` });

  // 4. Trato: una marca de vos no tutea, y al revés.
  const trato = identidad.voz.trato;
  if (trato === "vos" && TUTEO.test(todo))
    obs.push({ control: "trato", gravedad: "blocker", detalle: `Mezcla el tú («${todo.match(TUTEO)?.[0]}») en una marca que habla de vos.` });
  if (trato !== "vos" && VOSEO.test(todo))
    obs.push({ control: "trato", gravedad: "blocker", detalle: `Usa voseo («${todo.match(VOSEO)?.[0]}») en una marca que habla de ${trato}.` });
  if (trato === "usted" && TUTEO.test(todo))
    obs.push({ control: "trato", gravedad: "blocker", detalle: `Tutea («${todo.match(TUTEO)?.[0]}») en una marca que habla de usted.` });

  // 5. Datos inventados: un precio, porcentaje u horario que el negocio nunca dio.
  const fuente = JSON.stringify(brief).replace(/\D+/g, " ");
  for (const dato of todo.match(DATO_DURO) ?? []) {
    const numeros = dato.replace(/\D+/g, " ").trim().split(" ");
    if (numeros.some((n) => n && !new RegExp(`\\b${n}\\b`).test(fuente)))
      obs.push({ control: "datos", gravedad: "blocker", detalle: `«${dato}» no está en lo que contó el negocio: o se saca, o va «[a confirmar]».` });
  }

  // 6. Una palabra de acento por texto (la que va en el color de la marca).
  for (const t of textosConAcento(formato, c)) {
    const marcas = (t.texto.match(/\*[^*]+\*/g) ?? []).length;
    if (marcas !== 1)
      obs.push({ control: "acento", gravedad: "menor", detalle: `${t.ranura}: tiene ${marcas} palabras marcadas con *asteriscos*, tiene que ser una.` });
  }

  // 7. Redes: hashtags y emojis con mesura.
  if ("hashtags" in c && L.hashtags && c.hashtags.length > L.hashtags)
    obs.push({ control: "hashtags", gravedad: "menor", detalle: `${c.hashtags.length} hashtags, el máximo es ${L.hashtags}.` });
  const emojis = (todo.match(EMOJI) ?? []).length;
  if (L.emojis !== undefined && emojis > L.emojis)
    obs.push({ control: "emojis", gravedad: "menor", detalle: `${emojis} emojis, el máximo es ${L.emojis}.` });

  // 8. Lo visual: si es foto, tiene que haber una escena para generar la imagen.
  const visuales =
    formato === "historia"
      ? (c as ContenidoHistoria).pantallas.map((p) => p.visual)
      : formato === "reel"
        ? []
        : [(c as ContenidoPost | ContenidoCarrusel).visual];
  for (const v of visuales)
    if (v.tipo === "foto" && !v.escena?.trim())
      obs.push({ control: "imagen", gravedad: "blocker", detalle: "Es una pieza con foto pero no dice qué se ve (falta la escena)." });

  // 9. Historias: al menos una pantalla invita a responder.
  if (formato === "historia" && (c as ContenidoHistoria).pantallas.every((p) => p.sticker.tipo === "ninguno"))
    obs.push({ control: "conversacion", gravedad: "menor", detalle: "Ninguna pantalla invita a responder (encuesta, pregunta o cuenta regresiva)." });

  return obs;
}
