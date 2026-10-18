"use client";

import { Button } from "@build101/ui/components/button";
import { Download, FileText } from "lucide-react";
import { useState } from "react";

import s from "../entrevista/entrevista.module.css";
import { archivosDeMarca, bajar, brandbookHtml, deDataUrl, slug, zip } from "./archivos";
import { type IdentidadIA, svgConTamano } from "./identidad";
import type { Versiones } from "./versiones";

// Los archivos finales de la marca, para llevarse: todo en un .zip, o de a uno. Solo lo elegido: el logo
// en sus 4 versiones, la paleta y las tipografías que quedaron, y el brandbook. Las pruebas no viajan.
// Va con la ropa de BrandIA.

export function Descargas({ identidad, versiones }: { identidad: IdentidadIA; versiones: Versiones | null }) {
  const [armando, setArmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const base = slug(identidad.nombre);
  const completo = versiones?.lista.find((v) => v.clave === "completo");

  async function todo() {
    if (!versiones) return;
    setArmando(true);
    setError(null);
    try {
      const archivos = await archivosDeMarca(identidad, versiones);
      bajar(zip(archivos.map((a) => ({ ...a, nombre: `${base}/${a.nombre}` }))), `marca-${base}.zip`);
    } catch {
      setError("No pudimos armar el archivo. Probá de nuevo.");
    } finally {
      setArmando(false);
    }
  }

  function brandbookPdf() {
    if (!versiones) return;
    // El brandbook se abre en otra pestaña y se manda a imprimir: ahí se elige "Guardar como PDF"
    const html = brandbookHtml(identidad, versiones);
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const ventana = window.open(url, "_blank");
    if (!ventana) {
      URL.revokeObjectURL(url);
      return bajar(new Blob([html], { type: "text/html" }), `${base}-brandbook.html`);
    }
    ventana.addEventListener("load", () => setTimeout(() => ventana.print(), 800));
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <section className={`${s.entra} rounded-lg border bg-card p-6 sm:p-8`} aria-labelledby="titulo-descargas">
      <p className="label">Tus archivos</p>
      <h2 id="titulo-descargas" className="mt-2 text-[clamp(1.6rem,1.2rem+1.4vw,2.2rem)]">
        Llevate <span className={s.it}>tu</span> marca.
      </h2>
      <p className="lead mt-2 max-w-[38em] text-base">
        Solo lo que elegiste: tu logo en sus 4 versiones, tu paleta, tus tipografías y el brandbook, listos para la
        imprenta, tus redes o quien te haga la web.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="lg" onClick={todo} disabled={armando || !versiones}>
          <Download data-icon="inline-start" className={armando ? "animate-bounce" : ""} />
          {armando ? "Armando tus archivos…" : "Descargar todo (.zip)"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          disabled={!completo}
          onClick={() => completo && bajar(deDataUrl(completo.archivo), `${base}-logo.png`)}
        >
          Logo
        </Button>
        {versiones?.simboloSvg && identidad.logo.isotipo_svg && (
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              bajar(new Blob([svgConTamano(identidad.logo.isotipo_svg, 1024)], { type: "image/svg+xml" }), `${base}-simbolo.svg`)
            }
          >
            Símbolo (SVG)
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={brandbookPdf} disabled={!versiones}>
          <FileText data-icon="inline-start" />
          Brandbook en PDF
        </Button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
