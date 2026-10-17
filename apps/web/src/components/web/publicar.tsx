"use client";

import { Button, buttonVariants } from "@build101/ui/components/button";
import { ArrowRight, Check, Copy, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";

import { contraste, type IdentidadIA, rolesDe } from "@/components/brandbook/identidad";
import s from "@/components/entrevista/entrevista.module.css";
import type { FichaWeb } from "@/lib/ia/web/ficha-web";
import type { Web } from "@/lib/ia/web/web";

// Web del cliente, pasos 7 y 8 (versión demo): publicar en /w/[slug] y la entrega (link y QR).
// La dirección y su clave quedan en la sesión: si la persona cambia algo y vuelve a publicar, se actualiza
// la misma dirección. Elegir un dominio propio y pagarlo sigue en construcción.

const CLAVE_PUBLICADA = "brandia:web-publicada";

type Publicada = { ficha: string; slug: string; clave: string; url: string; version: string };

function leerPublicada(ficha: string): Publicada | null {
  try {
    const p = JSON.parse(sessionStorage.getItem(CLAVE_PUBLICADA) ?? "null") as Publicada | null;
    return p?.ficha === ficha ? p : null;
  } catch {
    return null;
  }
}

function guardarPublicada(p: Publicada) {
  try {
    sessionStorage.setItem(CLAVE_PUBLICADA, JSON.stringify(p));
  } catch {
    // sin lugar en la sesión: se sigue sin guardar
  }
}

/** El QR con los colores de la marca: el más oscuro que se lea bien sobre el fondo */
function useQr(url: string | null, identidad: IdentidadIA) {
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    if (!url) return setQr(null);
    const { fondo, principal, texto } = rolesDe(identidad.paleta);
    const oscuro = contraste(principal, fondo) >= 4.5 ? principal : texto;
    let vigente = true;
    QRCode.toDataURL(url, { width: 720, margin: 2, errorCorrectionLevel: "M", color: { dark: oscuro, light: fondo } })
      .then((dato) => vigente && setQr(dato))
      .catch(() => vigente && setQr(null));
    return () => {
      vigente = false;
    };
  }, [url, identidad.paleta]);
  return qr;
}

export function Publicar({
  ficha,
  web,
  fichaWeb,
  identidad,
  fotos,
  ocupado,
}: {
  ficha: string;
  web: Web;
  fichaWeb: FichaWeb;
  identidad: IdentidadIA;
  fotos: Record<string, string>;
  ocupado: boolean;
}) {
  const [publicada, setPublicada] = useState<Publicada | null>(null);
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const version = useMemo(() => JSON.stringify({ web, fichaWeb, fotos }), [web, fichaWeb, fotos]);
  const qr = useQr(publicada?.url ?? null, identidad);

  useEffect(() => setPublicada(leerPublicada(ficha)), [ficha]);

  const desactualizada = !!publicada && publicada.version !== version;

  async function publicar() {
    setPublicando(true);
    setError(null);
    try {
      const res = await fetch("/api/web/publicar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          web,
          ficha_web: fichaWeb,
          identidad: {
            nombre: identidad.nombre,
            paleta: identidad.paleta,
            tipografias: identidad.tipografias,
            fuentes_url: identidad.fuentes_url,
            logo: { isotipo_svg: identidad.logo.isotipo_svg },
          },
          fotos,
          anterior: publicada ? { slug: publicada.slug, clave: publicada.clave } : undefined,
        }),
      });
      const datos = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(datos?.error || "No pudimos publicar la web.");
      const nueva: Publicada = { ficha, slug: datos.slug, clave: datos.clave, url: datos.url, version };
      guardarPublicada(nueva);
      setPublicada(nueva);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPublicando(false);
    }
  }

  async function copiar() {
    if (!publicada) return;
    try {
      await navigator.clipboard.writeText(publicada.url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sin permiso para copiar: el link queda a la vista para copiarlo a mano
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {(!publicada || desactualizada) && (
        <Button size="lg" onClick={publicar} disabled={ocupado || publicando}>
          {publicando ? "Publicando…" : publicada ? "Publicar los cambios" : "Me gusta, quiero publicarla"}
          {!publicando && <ArrowRight data-icon="inline-end" />}
        </Button>
      )}
      {error && !publicando && <p className="text-sm text-accent-text">{error}</p>}

      {publicada && (
        <div className={`${s.entra} rounded-[14px] border bg-card p-4`}>
          <p className="label">{desactualizada ? "Tu web publicada" : "Tu web ya está publicada"}</p>
          {desactualizada && (
            <p className="mt-2 text-sm text-muted-foreground">
              Tenés cambios sin publicar: la dirección todavía muestra la versión anterior.
            </p>
          )}
          <a
            href={publicada.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block break-all text-[15px] font-semibold underline underline-offset-4"
          >
            {publicada.url.replace(/^https?:\/\//, "")}
          </a>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copiar}>
              {copiado ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
              {copiado ? "Copiado" : "Copiar"}
            </Button>
            <a href={publicada.url} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <ExternalLink data-icon="inline-start" />
              Abrir
            </a>
          </div>
          {qr && (
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <img src={qr} alt={`Código QR de la web de ${identidad.nombre}`} className="size-36 rounded-[10px] border" />
              <div className="flex flex-col items-start gap-2">
                <p className="max-w-[16em] text-sm text-muted-foreground">
                  Para la vidriera, el mostrador o tus tarjetas: lo escanean con el celular y entran a tu web.
                </p>
                <a href={qr} download={`qr-${publicada.slug}.png`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  <Download data-icon="inline-start" />
                  Descargar QR
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {publicada && (
        <div className="rounded-[14px] border border-dashed p-4 text-sm">
          <p className="font-semibold">Tu dominio propio · en construcción</p>
          <p className="mt-1 text-muted-foreground">
            El próximo paso es elegir tu dominio (por ejemplo, tumarca.com.uy), revisar que esté libre y conectarlo a esta web.
            En esta versión no se compra ningún dominio ni se cobra nada.
          </p>
          <Link href="/crear/proximamente/web" className="mt-2 inline-block underline underline-offset-4">
            Ver cómo va a funcionar
          </Link>
        </div>
      )}
    </div>
  );
}
