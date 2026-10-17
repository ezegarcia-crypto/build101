import { z } from "zod";

import type { Brief } from "@/lib/ia/brief";

// El kit de contenidos: lo que los motores del módulo B necesitan saber de la marca, sacado de la
// identidad que arma el módulo A (/api/identidad) más la ficha. Es la única puerta de entrada:
// si la identidad cambia de forma, se ajusta `armarKit` y el resto de los motores no se toca.
// Sin IA y sin servidor: la pantalla también lo puede armar.

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

/** Lo que se lee de la identidad del módulo A. Los campos que no se usan acá se ignoran. */
export const identidadEntradaSchema = z.object({
  nombre: z.string(),
  eslogan: z.string(),
  esencia: z.object({
    idea: z.string(),
    promesa: z.string(),
    posicionamiento: z.string(),
    valores: z.array(z.object({ valor: z.string(), significa: z.string() })),
  }),
  voz: z.object({
    resumen: z.string(),
    rasgos: z.array(z.object({ rasgo: z.string(), es: z.string(), no_es: z.string() })),
    palabras_si: z.array(z.string()),
    palabras_no: z.array(z.string()),
    ejemplos: z.object({ bio_instagram: z.string(), posteo: z.string(), respuesta_cliente: z.string(), cartel: z.string() }),
  }),
  estilo: z.object({ uso_de_colores: z.string(), fotografia: z.string() }),
  direccion: z.object({ formas: z.string() }).optional(),
  paleta: z.array(z.object({ hex, nombre: z.string(), rol: z.enum(["principal", "acento", "fondo", "texto", "apoyo"]) })),
  tipografias: z.object({ titulos: z.string(), texto: z.string() }),
  fuentes_url: z.string(),
  logo: z.object({ isotipo_svg: z.string() }),
});

export type IdentidadEntrada = z.infer<typeof identidadEntradaSchema>;

export type Kit = {
  nombre: string;
  esencia: string;
  promesa: string;
  mensajes_clave: string[];
  voz: {
    trato: Brief["marca"]["trato"];
    tono: string[];
    reglas: string[];
    lexico_si: string[];
    lexico_no: string[];
    /** Textos de la marca que muestran cómo suena. */
    ejemplos: string[];
  };
  paleta: IdentidadEntrada["paleta"];
  tipografias: { titulos: { familia: string; peso: number }; texto: { familia: string; peso: number } };
  /** Links de Google Fonts para cargar las dos tipografías. */
  fuentes: string[];
  estilo_visual: { fotografia: string; uso_de_colores: string; formas: string; evitar: string[] };
  /** El símbolo de la marca en SVG (100×100), tal cual. Va al lado del nombre: nunca se redibuja. */
  isotipo_svg: string | null;
};

/** ¿El link de fuentes trae el peso 700 de esta familia? */
function tieneNegrita(fuentesUrl: string, familia: string): boolean {
  const nombre = encodeURIComponent(familia.trim()).replace(/%20/g, "+");
  return fuentesUrl.includes(`family=${nombre}:wght@400;700`);
}

export function armarKit(identidad: IdentidadEntrada, brief: Brief): Kit {
  const v = identidad.voz;
  const { titulos, texto } = identidad.tipografias;
  return {
    nombre: identidad.nombre,
    esencia: identidad.esencia.idea,
    promesa: identidad.esencia.promesa,
    mensajes_clave: [identidad.eslogan, identidad.esencia.posicionamiento, ...identidad.esencia.valores.map((x) => `${x.valor}: ${x.significa}`)]
      .filter((m) => m.trim())
      .slice(0, 5),
    voz: {
      trato: brief.marca.trato,
      tono: v.rasgos.map((r) => r.rasgo),
      reglas: [v.resumen, ...v.rasgos.map((r) => `${r.rasgo}: ${r.es}; no ${r.no_es}`)],
      lexico_si: v.palabras_si,
      lexico_no: v.palabras_no,
      ejemplos: [v.ejemplos.posteo, v.ejemplos.cartel, v.ejemplos.bio_instagram].filter(Boolean),
    },
    paleta: identidad.paleta,
    tipografias: {
      titulos: { familia: titulos, peso: tieneNegrita(identidad.fuentes_url, titulos) ? 700 : 400 },
      texto: { familia: texto, peso: 400 },
    },
    fuentes: [identidad.fuentes_url],
    estilo_visual: {
      fotografia: identidad.estilo.fotografia,
      uso_de_colores: identidad.estilo.uso_de_colores,
      formas: identidad.direccion?.formas ?? "",
      // Para las imágenes: lo que la marca no quiere transmitir y los colores que no quiere.
      evitar: [...brief.personalidad.palabras_no.map((p) => `nada que se sienta ${p}`), ...brief.gustos.colores_no.map((c) => `el color ${c}`)],
    },
    isotipo_svg: identidad.logo.isotipo_svg.trim() || null,
  };
}
