import { buttonVariants } from "@build101/ui/components/button";
import { ExternalLink } from "lucide-react";

// "Crear mi sitio web": aparece en todo el recorrido desde que la marca está armada (marca, contenido y
// productos) y abre la web del cliente en una pestaña nueva, para no perder la página en la que está.
// rel="opener" a propósito: así el navegador le copia a la pestaña nueva lo guardado en esta (la ficha y la
// marca viven en sessionStorage). Con "noopener", que es lo que hace target="_blank" solo, la nueva arranca vacía.
// Si igual llega vacía, la pestaña nueva lo trae de la que la abrió (heredarDeLaQueAbrio).

export function BotonWeb({ variant = "outline" }: { variant?: "default" | "outline" }) {
  return (
    <a href="/crear/web" target="_blank" rel="opener" className={buttonVariants({ variant, size: "lg" })}>
      Crear mi sitio web
      <ExternalLink data-icon="inline-end" />
    </a>
  );
}

/**
 * Si esta pestaña llegó sin la ficha (la abrió el botón de la web y el navegador no copió lo guardado),
 * trae lo de BrandIA de la pestaña que la abrió, que es de la misma web.
 */
export function heredarDeLaQueAbrio() {
  try {
    if (sessionStorage.getItem("brandia:ficha") || !window.opener) return;
    const otra = (window.opener as Window).sessionStorage;
    for (let i = 0; i < otra.length; i++) {
      const clave = otra.key(i);
      if (clave?.startsWith("brandia:")) sessionStorage.setItem(clave, otra.getItem(clave) ?? "");
    }
  } catch {
    // Otra web o sin acceso: sigue como estaba y la pantalla pide empezar por la entrevista
  }
}
