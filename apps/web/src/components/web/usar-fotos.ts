"use client";

import { useEffect, useRef, useState } from "react";

import type { IdentidadIA } from "@/components/brandbook/identidad";
import type { FichaWeb } from "@/lib/ia/web/ficha-web";
import type { PedidoFoto } from "@/lib/ia/web/fotos";
import type { Web } from "@/lib/ia/web/web";

// Las fotos de la web: las genera BrandIA salvo que la persona diga que trae las suyas (ficha_web.fotos === "propias").
// Si no lo definió ("sin_definir", por ejemplo "completalo como te parezca") o pidió usar su Instagram (todavía no
// se lee), van fotos generadas, marcadas como ilustrativas: mejor que dejar los lugares vacíos.
// Pide a /api/web/foto cada foto que falta, una vez por descripción: si falla no se reintenta sola
// (queda el lugar con la descripción), y hay un tope por sesión para que un loop no se coma el crédito.

const CLAVE_FOTOS = "brandia:web-fotos";
const TOPE_POR_SESION = 10;

function leerFotos(ficha: string): Record<string, string> {
  try {
    const g = JSON.parse(sessionStorage.getItem(CLAVE_FOTOS) ?? "null") as { ficha: string; fotos: Record<string, string> } | null;
    return g?.ficha === ficha ? g.fotos : {};
  } catch {
    return {};
  }
}

function guardarFotos(ficha: string, fotos: Record<string, string>) {
  try {
    sessionStorage.setItem(CLAVE_FOTOS, JSON.stringify({ ficha, fotos }));
  } catch {
    // sin lugar en la sesión: se sigue sin guardar
  }
}

export function useFotosWeb({
  ficha,
  web,
  fichaWeb,
  identidad,
  rubro,
}: {
  ficha: string;
  web: Web;
  fichaWeb: FichaWeb;
  identidad: IdentidadIA;
  rubro?: string;
}) {
  // Se leen al crear el estado (no en un efecto): así el primer pedido ya sabe cuáles están y no las repite
  const [fotos, setFotos] = useState<Record<string, string>>(() => leerFotos(ficha));
  const [enCamino, setEnCamino] = useState(0);
  const pedidas = useRef(new Set<string>());

  useEffect(() => {
    if (fichaWeb.fotos === "propias") return;
    const faltan = [...new Set(web.secciones.map((s) => s.foto).filter((f): f is string => !!f))].filter(
      (d) => !fotos[d] && !pedidas.current.has(d),
    );
    for (const descripcion of faltan) {
      if (pedidas.current.size >= TOPE_POR_SESION) break;
      pedidas.current.add(descripcion);
      setEnCamino((n) => n + 1);
      const pedido: PedidoFoto = {
        descripcion,
        marca: {
          nombre: identidad.nombre,
          rubro,
          fotografia: identidad.estilo?.fotografia,
          uso_de_colores: identidad.estilo?.uso_de_colores,
          paleta: identidad.paleta,
        },
      };
      fetch("/api/web/foto", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(pedido) })
        .then((r) => (r.ok ? r.json() : null))
        .then((datos: { url?: string } | null) => {
          if (!datos?.url) return;
          setFotos((antes) => {
            const nuevas = { ...antes, [descripcion]: datos.url as string };
            guardarFotos(ficha, nuevas);
            return nuevas;
          });
        })
        .catch(() => {})
        .finally(() => setEnCamino((n) => n - 1));
    }
  }, [ficha, web, fichaWeb.fotos, fotos, identidad, rubro]);

  return { fotos, generando: enCamino > 0 };
}
