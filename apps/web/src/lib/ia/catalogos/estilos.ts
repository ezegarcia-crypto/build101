import type { Comprobacion } from "@/lib/ia/comprobaciones";

import datos from "./estilos.json";

// El catálogo de estilos del motor de marca (issue #2): las 15 familias de estilo del apéndice A del informe de
// estudios referentes (reports/). Cada familia se define por un mecanismo (la decisión de diseño que la hace
// distinta: una retícula, el vacío, un personaje, la tipografía propia…), no por un adjetivo. Las 3 direcciones
// visuales salen de 3 familias distintas, así son ideas diferentes y no variantes de una misma.
// El JSON lo arma scripts/catalogo-estilos.mjs (README.md de esta carpeta): no se edita a mano.

export type FamiliaEstilo = {
  numero: number;
  nombre: string;
  /** La decisión de diseño que define a la familia */
  mecanismo: string;
  /** Rubros para los que sirve (orientativo: la IA puede usarla en otros si la ficha lo justifica) */
  rubros: string[];
  /** Descriptores en inglés, listos para el prompt de imágenes. No nombran estudios ni diseñadores */
  descriptores: string[];
};

export const FAMILIAS = datos.familias as FamiliaEstilo[];

const clave = (nombre: string) =>
  nombre
    .normalize("NFD")
    .replace(/[̀-ͯ"'«»]/g, "")
    .replace(/^\s*\d+\s*[.)·-]?\s*/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const POR_CLAVE = new Map(FAMILIAS.map((f) => [clave(f.nombre), f]));

/** La familia con ese nombre (sin importar mayúsculas, tildes ni el número adelante), o con ese número */
export function buscarFamilia(nombre: string | number): FamiliaEstilo | undefined {
  if (typeof nombre === "number") return FAMILIAS.find((f) => f.numero === nombre);
  return POR_CLAVE.get(clave(nombre)) ?? FAMILIAS.find((f) => String(f.numero) === nombre.trim());
}

/** Lo que guarda cada dirección sobre su familia de estilo */
export type EstiloDireccion = {
  familia: string;
  numero: number | null;
  mecanismo: string | null;
  /** El descriptor en inglés que eligió la IA, para que el logo y las imágenes sigan el mismo estilo */
  descriptor: string | null;
  por_que: string;
};

/**
 * Las familias de estilo de las direcciones, contra el catálogo. Cada dirección tiene que salir de una familia que
 * exista y distinta de las otras. Lo que no cumple no se puede arreglar sin volver a pedirle a la IA: se cuenta en
 * la comprobación de esa dirección. El descriptor se elige por número dentro de la familia; si no existe, el primero.
 */
export function estilosDelCatalogo(pedidos: { familia: string; descriptor: number; por_que: string }[]): {
  estilo: EstiloDireccion;
  comprobacion: Comprobacion;
}[] {
  const familias = pedidos.map((p) => buscarFamilia(p.familia));
  return pedidos.map((p, i) => {
    const familia = familias[i];
    if (!familia) {
      return {
        estilo: { familia: p.familia, numero: null, mecanismo: null, descriptor: null, por_que: p.por_que },
        comprobacion: { que: "Estilo", ok: false, detalle: `«${p.familia}» no es una familia del catálogo de estilos` },
      };
    }
    const repetida = familias.some((f, j) => j !== i && f?.numero === familia.numero);
    const enRango = Number.isInteger(p.descriptor) && p.descriptor >= 1 && p.descriptor <= familia.descriptores.length;
    const descriptor = familia.descriptores[enRango ? p.descriptor - 1 : 0];
    const avisos = [
      repetida ? "otra dirección sale de la misma familia: no son ideas distintas" : null,
      enRango ? null : `el descriptor ${p.descriptor} no existe, va el primero de la familia`,
    ].filter(Boolean);
    return {
      estilo: { familia: familia.nombre, numero: familia.numero, mecanismo: familia.mecanismo, descriptor, por_que: p.por_que },
      comprobacion: {
        que: "Estilo",
        ok: !repetida,
        detalle: avisos.length
          ? `${familia.nombre}: ${avisos.join("; ")}`
          : `${familia.nombre}, distinta de las otras direcciones (catálogo de estilos de BrandIA)`,
      },
    };
  });
}

/** El catálogo como texto para el prompt: por familia, su mecanismo, sus rubros y sus descriptores numerados */
export function catalogoEstilosParaPrompt() {
  return FAMILIAS.map((f) => {
    const descriptores = f.descriptores.map((d, i) => `  ${i + 1}. ${d}`).join("\n");
    return `### ${f.numero}. ${f.nombre}\nMecanismo: ${f.mecanismo}. Rubros: ${f.rubros.join(", ")}.\n${descriptores}`;
  }).join("\n\n");
}
