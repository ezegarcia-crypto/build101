"use client";

import { Button } from "@build101/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Los formularios de /admin (entrar) y /admin/alta (activar la cuenta con Google Authenticator).
// Hablan con /api/admin/entrar y /api/admin/alta, que dejan la sesión de administrador en una cookie.

const campo =
  "h-11 w-full rounded-[4px] border bg-background px-3 text-[0.9375rem] text-foreground outline-none transition-shadow duration-300 ease-brandia focus-visible:ring-2 focus-visible:ring-ring/50";
const campoCodigo = `${campo} font-mono text-lg tracking-[0.4em]`;

/** Solo se vuelve a uno de los paneles: nunca a una dirección que venga escrita en el link. */
function destinoSeguro(volver: string | undefined) {
  return volver && /^\/(costos|pedidos|pruebas)(\/[\w-]*)?$/.test(volver) ? volver : "/costos";
}

async function enviar(ruta: string, datos: Record<string, unknown>) {
  const r = await fetch(ruta, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(datos),
  });
  const respuesta = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(respuesta.error ?? "Algo falló. Probá de nuevo en un rato.");
  return respuesta;
}

function Campo({ etiqueta, ayuda, ...props }: { etiqueta: string; ayuda?: string } & React.ComponentProps<"input">) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      <span>
        {etiqueta} {ayuda && <span className="font-normal text-muted-foreground">({ayuda})</span>}
      </span>
      <input className={props.inputMode === "numeric" ? campoCodigo : campo} {...props} />
    </label>
  );
}

function Aviso({ texto }: { texto: string }) {
  return texto ? (
    <p role="alert" className="text-sm font-semibold text-destructive">
      {texto}
    </p>
  ) : null;
}

const propsCodigo = {
  name: "codigo",
  required: true,
  inputMode: "numeric",
  autoComplete: "one-time-code",
  pattern: "\\d{6}",
  maxLength: 6,
  placeholder: "000000",
} as const;

export function FormEntrar({ volver }: { volver?: string }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setEnviando(true);
    setError("");
    try {
      await enviar("/api/admin/entrar", Object.fromEntries(new FormData(form)));
      window.location.assign(destinoSeguro(volver));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo falló.");
      (form.elements.namedItem("codigo") as HTMLInputElement | null)?.select();
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="flex flex-col gap-5">
      <Campo etiqueta="Tu mail" name="mail" type="email" required autoComplete="username" />
      <Campo etiqueta="Tu contraseña" name="clave" type="password" required autoComplete="current-password" />
      <Campo etiqueta="Código de Google Authenticator" ayuda="6 números, el de BrandIA" {...propsCodigo} />
      <Aviso texto={error} />
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={enviando}>
          {enviando ? "Revisando…" : "Entrar"} <ArrowRight data-icon="inline-end" />
        </Button>
        <Link href="/admin/alta" className="text-sm text-accent-text">
          ¿Primera vez? Activá tu cuenta
        </Link>
      </div>
    </form>
  );
}

export function FormAlta() {
  const [paso, setPaso] = useState<"datos" | "qr">("datos");
  const [datos, setDatos] = useState<Record<string, string>>({});
  const [qr, setQr] = useState({ imagen: "", semilla: "" });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function iniciar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const escritos = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (escritos.clave !== escritos.repetida) return setError("Las dos contraseñas no son iguales.");
    setEnviando(true);
    setError("");
    try {
      const r = await enviar("/api/admin/alta", { ...escritos, paso: "iniciar" });
      setDatos(escritos);
      setQr({ imagen: r.qr, semilla: r.semilla });
      setPaso("qr");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo falló.");
    }
    setEnviando(false);
  }

  async function confirmar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const codigo = String(new FormData(e.currentTarget).get("codigo") ?? "");
    setEnviando(true);
    setError("");
    try {
      await enviar("/api/admin/alta", { ...datos, codigo, paso: "confirmar" });
      window.location.assign("/costos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo falló.");
      setEnviando(false);
    }
  }

  if (paso === "qr") {
    return (
      <form onSubmit={confirmar} className="flex flex-col gap-5">
        <ol className="flex list-decimal flex-col gap-2 ps-5 text-[0.9375rem]">
          <li>Abrí Google Authenticator en tu celular y tocá el botón <strong>+</strong>.</li>
          <li>Elegí «Escanear un código QR» y apuntá a este cuadro.</li>
          <li>Escribí abajo los 6 números que aparecen para «BrandIA».</li>
        </ol>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
          <img src={qr.imagen} alt="Código QR para Google Authenticator" width={200} height={200} className="rounded-[4px] border bg-white" />
          <p className="max-w-xs text-sm text-muted-foreground">
            ¿No podés escanear? Elegí «Ingresar una clave de configuración» y escribí:
            <code className="mt-1 block break-all font-mono text-foreground">{qr.semilla.match(/.{1,4}/g)?.join(" ")}</code>
          </p>
        </div>
        <Campo etiqueta="Código de Google Authenticator" {...propsCodigo} autoFocus />
        <Aviso texto={error} />
        <div>
          <Button type="submit" size="lg" disabled={enviando}>
            {enviando ? "Revisando…" : "Activar mi cuenta"} <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={iniciar} className="flex flex-col gap-5">
      <Campo etiqueta="Contraseña del equipo" ayuda="la de siempre, la tiene Eze" name="claveEquipo" type="password" required autoComplete="off" />
      <Campo etiqueta="Tu mail" ayuda="el que está en la lista de administradores" name="mail" type="email" required autoComplete="username" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Tu contraseña nueva" ayuda="10 o más caracteres" name="clave" type="password" required minLength={10} autoComplete="new-password" />
        <Campo etiqueta="Repetila" name="repetida" type="password" required minLength={10} autoComplete="new-password" />
      </div>
      <Aviso texto={error} />
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={enviando}>
          {enviando ? "Preparando…" : "Siguiente: Google Authenticator"} <ArrowRight data-icon="inline-end" />
        </Button>
        <Link href="/admin" className="text-sm text-accent-text">
          Ya tengo cuenta
        </Link>
      </div>
    </form>
  );
}

/** Borra la sesión de administrador y vuelve a /admin. El navegador sigue siendo del equipo. */
export function BotonSalir() {
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    setSaliendo(true);
    await fetch("/api/admin/salir", { method: "POST" }).catch(() => null);
    window.location.assign("/admin");
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={salir} disabled={saliendo}>
      {saliendo ? "Saliendo…" : "Salir"}
    </Button>
  );
}
