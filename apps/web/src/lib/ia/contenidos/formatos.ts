// El registro de formatos: qué piezas sabe hacer el módulo B y las reglas de cada una.
// Es la única fuente de las medidas y los límites: los mismos números entran al prompt del
// redactor (para que escriba dentro del límite), al control de calidad (para verificar) y al
// compositor (para dibujar). Si una regla cambia, se cambia acá y llega a los tres.
//
// Estado: "funciona" = la IA lo genera hoy · "en_construccion" = pantalla que muestra cómo va a ser.

export type IdFormato = "post" | "carrusel" | "historia" | "reel";
export type IdFormatoProximo = "pauta_meta" | "newsletter" | "linkedin" | "x" | "web";

export type Formato = {
  id: IdFormato;
  nombre: string;
  redes: string;
  ancho: number;
  alto: number;
  /** Margen que no se tapa con la interfaz de la red (arriba y abajo), en px. */
  zona_segura: number;
  /** Para qué sirve, en una frase: lo lee el planificador para elegir el formato. */
  para_que: string;
  /** Límites duros, en palabras salvo que diga caracteres. */
  limites: Record<string, number>;
  /** Reglas de escritura del formato: entran tal cual al prompt del redactor. */
  reglas: string[];
};

export const FORMATOS: Record<IdFormato, Formato> = {
  post: {
    id: "post",
    nombre: "Posteo",
    redes: "Instagram y Facebook, feed",
    ancho: 1080,
    alto: 1350,
    zona_segura: 0,
    para_que: "Una sola idea que se entiende en 2 segundos: un producto, un dato, una novedad",
    limites: { titular: 8, bajada: 18, cta: 4, caption_caracteres: 600, hashtags: 5, emojis: 3 },
    reglas: [
      "Una sola idea por pieza.",
      "El titular va en la imagen y se lee a 30 cm del celular: corto y con el dato adelante.",
      "Marcá UNA palabra del titular entre asteriscos (*así*): es la que va en el color de acento.",
      "El caption amplía, no repite el titular. Termina con una invitación concreta.",
    ],
  },
  carrusel: {
    id: "carrusel",
    nombre: "Carrusel",
    redes: "Instagram y LinkedIn",
    ancho: 1080,
    alto: 1350,
    zona_segura: 0,
    para_que: "Explicar o enseñar algo en pasos: guías, comparaciones, procesos, listas",
    limites: { laminas_min: 3, laminas_max: 6, titular: 8, texto: 30, caption_caracteres: 600, hashtags: 5, emojis: 3 },
    reglas: [
      "La primera lámina es el gancho: promete lo que se aprende al pasar.",
      "Cada lámina del medio desarrolla un solo punto.",
      "La última lámina cierra con una acción concreta (guardar, escribir, pasar por el local).",
      "Marcá UNA palabra de cada titular entre asteriscos (*así*).",
    ],
  },
  historia: {
    id: "historia",
    nombre: "Historia",
    redes: "Instagram y Facebook, historias",
    ancho: 1080,
    alto: 1920,
    zona_segura: 250,
    para_que: "Lo del día y la conversación: encuestas, preguntas, detrás de escena, recordatorios",
    limites: { pantallas_min: 1, pantallas_max: 3, texto: 12, sticker: 6 },
    reglas: [
      "Cada pantalla se lee en 3 segundos.",
      "Al menos una pantalla invita a responder con un sticker (encuesta, pregunta o cuenta regresiva).",
      "Tono más suelto que el feed, pero con la misma voz.",
      "Marcá UNA palabra de cada texto entre asteriscos (*así*).",
    ],
  },
  reel: {
    id: "reel",
    nombre: "Reel",
    redes: "Instagram Reels, TikTok y YouTube Shorts",
    ancho: 1080,
    alto: 1920,
    zona_segura: 250,
    para_que: "Mostrar en movimiento: cómo se hace, antes y después, un día en el negocio",
    limites: { escenas_min: 4, escenas_max: 6, ganchos: 3, texto_en_pantalla: 7, voz_en_off: 20, caption_caracteres: 600, hashtags: 5, emojis: 3 },
    reglas: [
      "Dura entre 15 y 20 segundos. El gancho aparece en el primer segundo y medio.",
      "Se entiende sin sonido: el texto en pantalla cuenta la historia aunque nadie escuche.",
      "A la mitad hay un giro que retiene (un cambio, una revelación, un antes y después).",
      "La última escena dura 2,5 segundos y cierra con la marca y una acción.",
      "Separá siempre lo que se dice (voz en off) de lo que se ve (la toma).",
      "Tres ganchos de fórmulas distintas, para poder probar cuál funciona.",
    ],
  },
};

/** Los formatos que todavía no genera la IA: la pantalla los muestra "en construcción". */
export const FORMATOS_PROXIMOS: Record<IdFormatoProximo, { nombre: string; que_va_a_hacer: string }> = {
  pauta_meta: {
    nombre: "Pauta en Meta",
    que_va_a_hacer:
      "Busca en la librería de anuncios los avisos de tu rubro, descarta los que no son, detecta los ganchos y ofertas que más duran activos y arma tus anuncios en 4:5 y 9:16 con texto principal, título y descripción",
  },
  newsletter: {
    nombre: "Newsletter",
    que_va_a_hacer: "Le contás tres cosas que pasaron este mes y arma el mail con tu marca, listo para mandar",
  },
  linkedin: {
    nombre: "LinkedIn",
    que_va_a_hacer: "Convierte las ideas del mes en posteos y carruseles con un tono más profesional, con tu misma voz",
  },
  x: { nombre: "X", que_va_a_hacer: "Hilos y posteos cortos a partir de los mismos pilares del mes" },
  web: { nombre: "Página web", que_va_a_hacer: "Una página de una sola pantalla con tu marca, tu propuesta y cómo contactarte" },
};

/** La mezcla por defecto del lote de la demo: un feed que se ve completo con pocas piezas. */
export const MEZCLA_DEMO: Record<IdFormato, number> = { post: 2, carrusel: 1, historia: 2, reel: 1 };
