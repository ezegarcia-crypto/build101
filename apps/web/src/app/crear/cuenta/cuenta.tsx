"use client";

import { Button, buttonVariants } from "@build101/ui/components/button";
import type { User } from "@supabase/supabase-js";
import { ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { Entrada } from "@/app/crear/proximamente/_piezas/entrada";
import { Clave } from "@/app/crear/proximamente/_piezas/piezas";
import { useSesion } from "@/components/cuenta/usar-sesion";
import Loader from "@/components/loader";
import { destinoSeguro } from "@/lib/destino";
import {
  abrirMarca,
  borrarMarca,
  CLAVE_MARCA_CUENTA,
  hayMarcaEnLaPestana,
  listarMarcas,
  type MarcaDeCuenta,
} from "@/lib/marcas-cuenta";
import { PLANES } from "@/lib/planes";
import { supabaseNavegador } from "@/lib/supabase/navegador";

// La pantalla de la cuenta. Sin sesión: entrar con un código que llega por mail (o con Google, si está prendido en
// Supabase). Con sesión: el plan, las marcas guardadas (abrir o borrar) y salir.
// El código por mail se usa en lugar del enlace porque el enlace abre otra pestaña, y la marca vive en esta.

const campo =
  "h-11 w-full rounded-[4px] border bg-background px-3 text-[0.9375rem] text-foreground outline-none transition-shadow duration-300 ease-brandia focus-visible:ring-2 focus-visible:ring-ring/50";

export function Cuenta() {
  return (
    <Suspense fallback={<Cargando />}>
      <CuentaAdentro />
    </Suspense>
  );
}

function Cargando() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <Loader />
    </div>
  );
}

function CuentaAdentro() {
  const { cargando, usuario } = useSesion();
  const parametros = useSearchParams();
  const volver = parametros.get("volver");
  const error = parametros.get("error");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <p className="text-muted-foreground">Las cuentas todavía no están conectadas en esta versión de BrandIA.</p>
    );
  }
  if (cargando) return <Cargando />;
  return usuario ? <MiCuenta usuario={usuario} /> : <Entrar volver={volver} error={error} />;
}

// ─── Entrar ──────────────────────────────────────────────────────────────────────────────────────────────────

function Entrar({ volver, error: errorInicial }: { volver: string | null; error: string | null }) {
  const router = useRouter();
  const [paso, setPaso] = useState<"mail" | "codigo">("mail");
  const [mail, setMail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(
    errorInicial === "enlace" ? "Ese enlace ya no sirve. Pedí un código nuevo y escribilo acá." : "",
  );
  const [google, setGoogle] = useState(false);
  const [conMarca, setConMarca] = useState(false);

  useEffect(() => {
    setConMarca(hayMarcaEnLaPestana());
    // Google aparece solo si está prendido en Supabase (Authentication → Providers)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !clave) return;
    fetch(`${url}/auth/v1/settings`, { headers: { apikey: clave } })
      .then((r) => r.json())
      .then((d: { external?: { google?: boolean } }) => setGoogle(Boolean(d.external?.google)))
      .catch(() => {});
  }, []);

  const vuelta = () =>
    `${window.location.origin}/crear/cuenta/entrar?volver=${encodeURIComponent(destinoSeguro(volver))}`;

  async function pedirCodigo(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    const { error: err } = await supabaseNavegador()!.auth.signInWithOtp({
      email: mail.trim(),
      options: { emailRedirectTo: vuelta(), shouldCreateUser: true },
    });
    setEnviando(false);
    if (err) {
      setError(
        err.status === 429
          ? "Pediste muchos códigos seguidos. Esperá un rato y probá de nuevo."
          : "No pudimos mandarte el código. Revisá el mail y probá de nuevo.",
      );
      return;
    }
    setPaso("codigo");
  }

  async function entrarConCodigo(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    const { error: err } = await supabaseNavegador()!.auth.verifyOtp({
      email: mail.trim(),
      token: codigo.replace(/\D/g, ""),
      type: "email",
    });
    setEnviando(false);
    if (err) {
      setError("Ese código no es o ya venció. Fijate el último mail que te mandamos.");
      return;
    }
    router.replace(destinoSeguro(volver) as "/crear/cuenta");
  }

  async function entrarConGoogle() {
    setError("");
    const { error: err } = await supabaseNavegador()!.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: vuelta() },
    });
    if (err) setError("No pudimos abrir Google. Probá con tu mail.");
  }

  return (
    <Entrada className="flex flex-col gap-10">
      <header className="flex max-w-2xl flex-col gap-5">
        <p data-entra className="label">
          BrandIA · tu cuenta
        </p>
        <h1 data-entra className="display text-balance">
          Entrá a tu <Clave>cuenta.</Clave>
        </h1>
        <p data-entra className="text-lg text-muted-foreground">
          {conMarca
            ? "La marca que armaste en esta pestaña se guarda en tu cuenta apenas entrás. Después la encontrás desde cualquier lado."
            : "Tus marcas quedan guardadas en tu cuenta: las encontrás desde cualquier compu o celular."}
        </p>
      </header>

      <section data-entra className="flex max-w-xl flex-col gap-5 rounded-[14px] border bg-card p-6 sm:p-8">
        {paso === "mail" ? (
          <form onSubmit={pedirCodigo} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Tu mail
              <input
                type="email"
                name="email"
                required
                maxLength={120}
                autoComplete="email"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                className={campo}
              />
            </label>
            <p className="text-sm text-muted-foreground">
              Te mandamos un código para entrar. Sin contraseña. Si es la primera vez, se crea tu cuenta.
            </p>
            <div>
              <Button type="submit" size="lg" disabled={enviando}>
                {enviando ? "Mandando…" : "Mandame el código"} <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={entrarConCodigo} className="flex flex-col gap-4">
            <p className="text-[0.9375rem]">
              Te mandamos un código a <strong className="break-all">{mail}</strong>. Si no está, mirá en correo no
              deseado.
            </p>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              El código
              <input
                name="codigo"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9 ]{6,10}"
                maxLength={10}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className={`${campo} font-display text-xl tracking-[0.3em]`}
                // biome-ignore lint/a11y/noAutofocus: el único campo de este paso
                autoFocus
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" size="lg" disabled={enviando}>
                {enviando ? "Entrando…" : "Entrar"} <ArrowRight data-icon="inline-end" />
              </Button>
              <button
                type="button"
                onClick={() => {
                  setPaso("mail");
                  setCodigo("");
                  setError("");
                }}
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                Usar otro mail
              </button>
            </div>
          </form>
        )}

        {error && (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {error}
          </p>
        )}

        {google && paso === "mail" && (
          <>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
            </div>
            <div>
              <Button type="button" variant="outline" size="lg" onClick={entrarConGoogle}>
                Entrar con Google
              </Button>
            </div>
          </>
        )}
      </section>
    </Entrada>
  );
}

// ─── Adentro ─────────────────────────────────────────────────────────────────────────────────────────────────

type SuscripcionDeCuenta = { plan: string; estado: string; hasta: string | null; prueba: boolean };

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-UY", { day: "numeric", month: "long", year: "numeric" });

const PASOS: Record<string, string> = {
  ficha: "Entrevista",
  marca: "Marca",
  contenido: "Contenido",
  productos: "Productos",
  web: "Web",
};

function MiCuenta({ usuario }: { usuario: User }) {
  const router = useRouter();
  const supabase = supabaseNavegador()!;
  const [marcas, setMarcas] = useState<MarcaDeCuenta[] | null>(null);
  const [suscripciones, setSuscripciones] = useState<SuscripcionDeCuenta[]>([]);
  const [error, setError] = useState("");
  const [abriendo, setAbriendo] = useState<string | null>(null);
  const [enEstaPestana, setEnEstaPestana] = useState<string | null>(null);

  const nombre =
    (usuario.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    (usuario.user_metadata?.name as string | undefined)?.split(" ")[0] ??
    usuario.email?.split("@")[0] ??
    "";

  const cargar = useCallback(async () => {
    try {
      setMarcas(await listarMarcas(supabase));
      const { data } = await supabase
        .from("suscripciones")
        .select("plan, estado, hasta, prueba")
        .in("estado", ["activa", "pausada"])
        .order("creado", { ascending: false });
      setSuscripciones((data as SuscripcionDeCuenta[]) ?? []);
    } catch {
      setError("No pudimos traer tus marcas. Probá de nuevo en un rato.");
      setMarcas([]);
    }
  }, [supabase]);

  useEffect(() => {
    try {
      setEnEstaPestana(sessionStorage.getItem(CLAVE_MARCA_CUENTA));
    } catch {}
    cargar();
    // La marca de esta pestaña se guarda sola unos segundos después de entrar: se vuelve a mirar para que aparezca
    const otra = window.setTimeout(() => {
      try {
        setEnEstaPestana(sessionStorage.getItem(CLAVE_MARCA_CUENTA));
      } catch {}
      cargar();
    }, 6_000);
    return () => window.clearTimeout(otra);
  }, [cargar]);

  async function abrir(m: MarcaDeCuenta) {
    setAbriendo(m.id);
    setError("");
    try {
      const pantalla = await abrirMarca(supabase, usuario.id, m);
      router.push(pantalla as "/crear");
    } catch {
      setError("No pudimos abrir esa marca. Probá de nuevo.");
      setAbriendo(null);
    }
  }

  async function borrar(m: MarcaDeCuenta) {
    if (!window.confirm(`¿Borrar «${m.nombre ?? "tu marca"}» de tu cuenta? No se puede deshacer.`)) return;
    try {
      await borrarMarca(supabase, usuario.id, m.id);
      setMarcas((lista) => lista?.filter((x) => x.id !== m.id) ?? null);
    } catch {
      setError("No pudimos borrarla. Probá de nuevo.");
    }
  }

  async function salir() {
    try {
      sessionStorage.removeItem(CLAVE_MARCA_CUENTA);
      sessionStorage.removeItem("brandia:cuenta-huellas");
    } catch {}
    await supabase.auth.signOut();
    router.replace("/crear");
  }

  const activa = suscripciones.find((s) => s.estado === "activa" && s.plan === "mensual") ?? suscripciones.find((s) => s.estado === "activa");
  const planActivo = activa ? PLANES.find((p) => p.id === activa.plan) : undefined;

  return (
    <Entrada className="flex flex-col gap-14">
      <header className="flex flex-col gap-5">
        <p data-entra className="label">
          BrandIA · tu cuenta
        </p>
        <h1 data-entra className="display text-balance">
          Hola, <Clave>{nombre}.</Clave>
        </h1>
        <p data-entra className="max-w-2xl text-lg break-words text-muted-foreground">
          Entraste con {usuario.email}. Lo que armás queda guardado acá solo, mientras trabajás.
        </p>
      </header>

      <section data-entra className="flex flex-col gap-4 rounded-[14px] border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex flex-col gap-1.5">
          <p className="label">Tu plan</p>
          {planActivo ? (
            <>
              <h2 className="text-2xl">{planActivo.nombre}</h2>
              <p className="text-muted-foreground">
                {activa?.hasta ? `Activo. Se renueva el ${fecha(activa.hasta)}.` : "Activo."}
                {activa?.prueba ? " (Modo prueba: no se cobró de verdad.)" : ""}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl">Prueba gratis</h2>
              <p className="text-muted-foreground">Estás en la beta: armás una marca completa sin pagar.</p>
            </>
          )}
        </div>
        {!planActivo && (
          <Link href="/crear/planes" className={buttonVariants({ size: "lg" })}>
            Ver los planes <ArrowRight data-icon="inline-end" />
          </Link>
        )}
      </section>

      <section className="flex flex-col gap-5">
        <div data-entra className="flex flex-wrap items-end justify-between gap-3">
          <h2>
            Tus <span className="italic">marcas</span>
          </h2>
          <Link href="/crear" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Armar otra marca
          </Link>
        </div>

        {error && (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {error}
          </p>
        )}

        {marcas === null ? (
          <Cargando />
        ) : marcas.length === 0 ? (
          <div data-entra className="flex flex-col items-start gap-4 rounded-[14px] border border-dashed p-6 sm:p-8">
            <p className="text-muted-foreground">
              Todavía no guardaste ninguna marca. Contanos tu negocio y se guarda sola en tu cuenta.
            </p>
            <Link href="/crear" className={buttonVariants({ size: "lg" })}>
              Armar mi marca <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {marcas.map((m) => (
              <li key={m.id} data-entra className="flex flex-col overflow-hidden rounded-[14px] border bg-card">
                {/* Los colores de SU marca: la tarjeta le deja lugar al cliente */}
                <div aria-hidden className="flex h-16">
                  {m.colores.length ? (
                    m.colores.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)
                  ) : (
                    <span className="flex-1 bg-muted" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl break-words">{m.nombre ?? "Marca sin nombre todavía"}</h3>
                    {m.rubro && <p className="text-sm text-muted-foreground">{m.rubro}</p>}
                  </div>
                  <ul className="flex flex-wrap gap-1.5">
                    {m.pasos.map((p) => (
                      <li key={p} className="rounded-full border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                        {PASOS[p] ?? p}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    {enEstaPestana === m.id ? "Abierta en esta pestaña · " : ""}Guardada el {fecha(m.actualizado)}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <Button size="lg" onClick={() => abrir(m)} disabled={abriendo !== null}>
                      {abriendo === m.id ? "Abriendo…" : "Abrir"} <ArrowRight data-icon="inline-end" />
                    </Button>
                    <button
                      type="button"
                      onClick={() => borrar(m)}
                      aria-label={`Borrar ${m.nombre ?? "esta marca"}`}
                      className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors duration-300 ease-brandia hover:bg-muted hover:text-foreground"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div data-entra>
        <button type="button" onClick={salir} className={buttonVariants({ variant: "ghost", size: "lg" })}>
          Salir de mi cuenta
        </button>
      </div>
    </Entrada>
  );
}
