"use client";

import { Button } from "@build101/ui/components/button";
import { Download, FileText } from "lucide-react";
import { useState } from "react";

import s from "../entrevista/entrevista.module.css";
import { archivosDeMarca, bajar, brandbookHtml, simboloAPng, simboloConNombre, slug, zip } from "./archivos";
import { type IdentidadIA, type LogoElegido, logoDeMarca, type PropuestaLogo, svgConTamano } from "./identidad";

// Los archivos finales de la marca, para llevarse: todo en un .zip, o de a uno. Va con la ropa de BrandIA.

export function Descargas({
  identidad,
  logos,
  elegido,
}: {
  identidad: IdentidadIA;
  logos: PropuestaLogo[];
  elegido: LogoElegido | undefined;
}) {
  const [armando, setArmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const base = slug(identidad.nombre);
  const logo = logoDeMarca(logos, elegido);
  const svg = identidad.logo.isotipo_svg;
  const conNombre = elegido === "simbolo-nombre" && !!svg;

  async function todo() {
    setArmando(true);
    setError(null);
    try {
      const archivos = await archivosDeMarca(identidad, logos, elegido);
      bajar(zip(archivos.map((a) => ({ ...a, nombre: `${base}/${a.nombre}` }))), `marca-${base}.zip`);
    } catch {
      setError("No pudimos armar el archivo. Probá de nuevo.");
    } finally {
      setArmando(false);
    }
  }

  async function soloLogo() {
    if (logo) {
      const res = await fetch(logo.imagen);
      return bajar(await res.blob(), `${base}-logo.${logo.imagen.startsWith("data:image/webp") ? "webp" : "png"}`);
    }
    if (conNombre) {
      const lienzo = await simboloConNombre(identidad, 512);
      return lienzo.toBlob((b) => b && bajar(b, `${base}-logo.png`), "image/png");
    }
    if (svg) bajar(new Blob([(await simboloAPng(svg, 1024)) as BlobPart], { type: "image/png" }), `${base}-logo.png`);
  }

  function brandbookPdf() {
    // El brandbook se abre en otra pestaña y se manda a imprimir: ahí se elige "Guardar como PDF"
    const url = URL.createObjectURL(new Blob([brandbookHtml(identidad, logo, conNombre)], { type: "text/html" }));
    const ventana = window.open(url, "_blank");
    if (!ventana) {
      URL.revokeObjectURL(url);
      return bajar(new Blob([brandbookHtml(identidad, logo, conNombre)], { type: "text/html" }), `${base}-brandbook.html`);
    }
    ventana.addEventListener("load", () => setTimeout(() => ventana.print(), 600));
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <section className={`${s.entra} rounded-lg border bg-card p-6 sm:p-8`} aria-labelledby="titulo-descargas">
      <p className="label">Tus archivos</p>
      <h2 id="titulo-descargas" className="mt-2 text-[clamp(1.6rem,1.2rem+1.4vw,2.2rem)]">
        Llevate <span className={s.it}>tu</span> marca.
      </h2>
      <p className="lead mt-2 max-w-[38em] text-base">
        El logo que elegiste, el símbolo en vector, la paleta, las tipografías y el brandbook, listos para la imprenta,
        tus redes o quien te haga la web.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="lg" onClick={todo} disabled={armando}>
          <Download data-icon="inline-start" className={armando ? "animate-bounce" : ""} />
          {armando ? "Armando tus archivos…" : "Descargar todo (.zip)"}
        </Button>
        <Button variant="outline" size="lg" onClick={soloLogo}>
          Logo
        </Button>
        {svg && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => bajar(new Blob([svgConTamano(svg, 1024)], { type: "image/svg+xml" }), `${base}-simbolo.svg`)}
          >
            Símbolo (SVG)
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={brandbookPdf}>
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
