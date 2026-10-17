import type { Metadata } from "next";

import { inicioArchivos, leerCliente, type Prueba } from "@/lib/pruebas";

import { nombreDelPaso } from "../pasos";
import { armarResumen } from "./resumen";
import { Vistas } from "./vistas";

// Una prueba entera. Arriba, lo que se generó dibujado como en la app (la entrevista, los nombres, los
// caminos, el brandbook, el feed, los productos y la web). Abajo, el historial: cada pedido a la IA en
// orden, con lo que entró y lo que salió, desplegando "Qué se mandó" y "Qué volvió".

export const metadata: Metadata = {
  title: "Una prueba · BrandIA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const hora = new Intl.DateTimeFormat("es-UY", {
  day: "numeric",
  month: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "America/Montevideo",
});

// Lo que se muestra de cada JSON; el entero está en "Bajar todo"
const MAXIMO_A_LA_VISTA = 40_000;

/** Los links a nuestra carpeta que aparecen en un valor, sin repetir */
function archivos(valor: unknown, inicio: string, encontrados = new Set<string>()) {
  if (typeof valor === "string") {
    if (valor.startsWith(inicio)) encontrados.add(valor);
  } else if (Array.isArray(valor)) {
    for (const v of valor) archivos(v, inicio, encontrados);
  } else if (valor && typeof valor === "object") {
    for (const v of Object.values(valor)) archivos(v, inicio, encontrados);
  }
  return encontrados;
}

/** En los chats, lo último que escribió la persona */
function ultimoMensaje(entrada: unknown) {
  const mensajes = (entrada as { messages?: { role: string; parts?: { type: string; text?: string }[] }[] })?.messages;
  const ultimo = mensajes?.findLast((m) => m.role === "user");
  return ultimo?.parts?.filter((p) => p.type === "text").map((p) => p.text).join("\n") || null;
}

function Json({ titulo, valor }: { titulo: string; valor: unknown }) {
  if (valor === null || valor === undefined) return null;
  const texto = JSON.stringify(valor, null, 2);
  return (
    <details className="rounded-md border">
      <summary className="cursor-pointer px-4 py-2 text-[0.9375rem]">{titulo}</summary>
      <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap break-words border-t px-4 py-3 text-[0.8125rem]">
        {texto.length > MAXIMO_A_LA_VISTA ? `${texto.slice(0, MAXIMO_A_LA_VISTA)}\n…` : texto}
      </pre>
    </details>
  );
}

function Pedido({ p, inicio }: { p: Prueba; inicio: string }) {
  const medios = [...archivos(p.salida, inicio)];
  const chat = p.salida as { respuesta?: string } | null;
  const escrito = ultimoMensaje(p.entrada);
  const texto = (p.salida as { texto?: string } | null)?.texto;
  const audio = Object.values((p.entrada as Record<string, unknown>) ?? {}).find(
    (v) => typeof v === "string" && v.startsWith(inicio),
  ) as string | undefined;

  return (
    <li className="flex flex-col gap-3 rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-xl">{nombreDelPaso(p.paso)}</h2>
        <span className="lead">
          {hora.format(new Date(p.creado))} · {String(p.segundos).replace(".", ",")} s
          {p.estado >= 400 ? ` · falló (${p.estado})` : ""}
        </span>
      </div>

      {p.paso === "transcribir" && audio && <audio controls src={audio} className="w-full" />}
      {texto && <p className="text-[0.9375rem]">“{texto}”</p>}
      {escrito && (
        <p className="text-[0.9375rem]">
          <span className="label">La persona: </span>
          {escrito}
        </p>
      )}
      {chat?.respuesta && (
        <p className="whitespace-pre-wrap text-[0.9375rem]">
          <span className="label">BrandIA: </span>
          {chat.respuesta}
        </p>
      )}
      {medios.length > 0 && p.paso !== "transcribir" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {medios.map((url) =>
            /\.(mp4|webm)$/.test(url) ? (
              <video key={url} src={url} controls className="w-full rounded-md border" />
            ) : (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                <img src={url} alt="" loading="lazy" className="aspect-square w-full rounded-md border object-cover" />
              </a>
            ),
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Json titulo="Qué se mandó" valor={p.entrada} />
        <Json titulo="Qué volvió" valor={p.salida} />
      </div>
    </li>
  );
}

async function leer(cliente: string) {
  try {
    return { pedidos: await leerCliente(cliente) };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export default async function UnaPrueba({ params }: { params: Promise<{ cliente: string }> }) {
  const { cliente } = await params;
  const r = await leer(cliente);
  const inicio = inicioArchivos() ?? "\u0000";
  // El nombre de la última identidad que se armó (puede haber probado más de un camino)
  const marca = r.pedidos
    ?.map((p) => (p.salida as { identidad?: { nombre?: string } } | null)?.identidad?.nombre)
    .findLast(Boolean);

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-[1080px] flex-col gap-14 px-4 py-12 sm:py-16">
      <header className="flex flex-col gap-3">
        <p className="label">
          <a href="/pruebas">← Todas las pruebas</a>
        </p>
        <h1 className="display text-balance">{marca ?? "Sin marca todavía"}</h1>
        <p className="label break-all">Cliente {cliente}</p>
        {r.pedidos && (
          <p className="text-lg text-muted-foreground">
            {r.pedidos.length} {r.pedidos.length === 1 ? "pedido" : "pedidos"} a la IA, en el orden en que pasaron.{" "}
            <a href={`/pruebas/${cliente}/descargar`}>Bajar todo (JSON)</a>
          </p>
        )}
      </header>

      {!r.pedidos ? (
        <p className="rounded-lg border bg-card px-5 py-4 text-[0.9375rem]">No se pudo leer la prueba: {r.error}</p>
      ) : (
        <>
          <Vistas r={armarResumen(r.pedidos)} />
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl">El historial</h2>
              <p className="lead">Cada pedido a la IA, en orden, con lo que se mandó y lo que volvió.</p>
            </div>
            <ol className="flex flex-col gap-4">
              {r.pedidos.map((p) => (
                <Pedido key={p.id} p={p} inicio={inicio} />
              ))}
            </ol>
          </section>
        </>
      )}
    </main>
  );
}
