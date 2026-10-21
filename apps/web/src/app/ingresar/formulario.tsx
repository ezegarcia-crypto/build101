"use client";

import { Button } from "@build101/ui/components/button";
import gsap from "gsap";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { pedirCodigo, verificarCodigo } from "./acciones";

// La tarjeta de ingreso, en dos pasos: el correo y después el código que llega por correo.
// Al cambiar de paso, el contenido entra con la curva de BrandIA (power2.out, 0,5 s).

const campo =
  "h-12 w-full min-w-0 rounded-full border border-input bg-background px-5 text-base text-foreground outline-none transition-colors duration-300 ease-brandia placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive dark:bg-input/30";

export function Formulario() {
  const [paso, setPaso] = useState<"correo" | "codigo">("correo");
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [enConstruccion, setEnConstruccion] = useState(false);
  const [cargando, empezar] = useTransition();
  const caja = useRef<HTMLDivElement>(null);
  const primeraVez = useRef(true);

  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    if (!caja.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(caja.current.children, { y: 16, opacity: 0, duration: 0.5, ease: "power2.out", stagger: 0.05 });
  }, [paso]);

  function enviarCorreo(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    empezar(async () => {
      const r = await pedirCodigo(correo);
      if (!r.ok) return setError(r.error);
      setEnConstruccion(Boolean(r.enConstruccion));
      setPaso("codigo");
    });
  }

  function enviarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    empezar(async () => {
      const r = await verificarCodigo(correo, codigo);
      if (!r.ok) return setError(r.error);
      window.location.href = "/crear";
    });
  }

  function cambiarCorreo() {
    setPaso("correo");
    setCodigo("");
    setError("");
  }

  return (
    <div ref={caja} className="flex flex-col gap-6">
      {paso === "correo" ? (
        <>
          <div className="flex flex-col gap-3">
            <p className="label">Ingresá a tu marca</p>
            <h2 className="text-balance">Hola de nuevo.</h2>
            <p className="text-muted-foreground">Escribí tu correo y te mandamos un código para entrar.</p>
          </div>

          <form onSubmit={enviarCorreo} noValidate className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Tu correo</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                required
                placeholder="vos@tunegocio.com"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  setError("");
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "error-ingreso" : undefined}
                className={campo}
              />
            </label>
            <AvisoError texto={error} />
            <Button type="submit" size="lg" disabled={cargando || !correo.trim()} className="w-full">
              {cargando ? "Mandando…" : "Recibir código"} <span aria-hidden>→</span>
            </Button>
          </form>

          <p className="text-[0.9375rem] text-muted-foreground">
            Sin contraseñas: entrás con un código que te llega por correo y vence a los pocos minutos.
          </p>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <p className="label">Revisá tu correo</p>
            <h2 className="text-balance">Te mandamos un código.</h2>
            <p className="text-muted-foreground">
              Escribí los 6 números que mandamos a <span className="font-semibold text-foreground">{correo.trim()}</span>.
            </p>
          </div>

          {enConstruccion && (
            <p className="rounded-[14px] border border-dashed border-foreground/30 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">En construcción.</span> El ingreso se está conectando:
              todavía no mandamos el correo. Así se va a ver este paso.
            </p>
          )}

          <form onSubmit={enviarCodigo} noValidate className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Código</span>
              <input
                type="text"
                name="codigo"
                autoComplete="one-time-code"
                autoFocus
                inputMode="numeric"
                maxLength={6}
                placeholder="······"
                value={codigo}
                onChange={(e) => {
                  setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "error-ingreso" : undefined}
                className={`${campo} text-center font-display text-2xl tracking-[0.5em] tabular-nums`}
              />
            </label>
            <AvisoError texto={error} />
            <Button type="submit" size="lg" disabled={cargando || codigo.length < 6} className="w-full">
              {cargando ? "Entrando…" : "Entrar"} <span aria-hidden>→</span>
            </Button>
          </form>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <button
              type="button"
              onClick={cambiarCorreo}
              className="font-semibold text-muted-foreground transition-colors duration-300 ease-brandia hover:text-foreground"
            >
              ← Cambiar correo
            </button>
            <button
              type="button"
              disabled={cargando}
              onClick={() => empezar(async () => void (await pedirCodigo(correo)))}
              className="font-semibold text-muted-foreground transition-colors duration-300 ease-brandia hover:text-foreground"
            >
              Mandame otro código
            </button>
          </div>
        </>
      )}

      <hr className="border-border" />

      <div className="flex flex-col gap-2">
        <p className="font-semibold">¿Es tu primera vez?</p>
        <p className="text-[0.9375rem] text-muted-foreground">
          No hace falta registrarte: con tu correo armamos tu cuenta. Si todavía no BrandIAste tu marca,{" "}
          <Link href="/crear" className="font-semibold text-foreground underline-offset-4 hover:underline">
            empezá acá
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function AvisoError({ texto }: { texto: string }) {
  if (!texto) return null;
  return (
    <p id="error-ingreso" role="alert" className="text-sm font-semibold text-accent-text">
      {texto}
    </p>
  );
}
