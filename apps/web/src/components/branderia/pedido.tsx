"use client";

import { Button } from "@build101/ui/components/button";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

import type { IdentidadIA } from "@/components/brandbook/identidad";
import { linkWhatsApp, mensajeWhatsApp } from "@/lib/pedidos";

import s from "../entrevista/entrevista.module.css";

// El pedido del kit de BranderIA: "Pedir cotización" abre el formulario (nombre, WhatsApp, a dónde mandarlo),
// el pedido se guarda en Supabase (POST /api/branderia/pedido) y se abre WhatsApp con el mensaje listo para el
// WhatsApp de BrandIA (WHATSAPP_BRANDIA en lib/pedidos.ts): los productos, las cantidades, los datos y el número.
// Si no se pudo guardar, WhatsApp se abre igual. La persona ve su número, los pasos y el botón "Mandar por
// WhatsApp" (por si el navegador no dejó abrir la ventana). No se cobra nada: el equipo lo ve en /pedidos.

const CLAVE_PEDIDO = "brandia:pedido-branderia";

export type ItemKit = { nombre: string; detalle: string; tecnica: string; estampa: string; cantidad: number };

/** `numero` null: no se pudo guardar, pero el pedido salió por WhatsApp. `mensaje`: el texto para WhatsApp. */
type Hecho = { numero: string | null; marca: string; unidades: number; contacto: string; mensaje: string };

const PASOS = ["Recibido", "Cotización por WhatsApp", "Producción con tu marca", "En camino", "Entregado"];

const campo =
  "h-10 w-full rounded-[4px] border bg-background px-3 text-[0.9375rem] text-foreground outline-none transition-shadow duration-300 ease-brandia focus-visible:ring-2 focus-visible:ring-ring/50";

function leerHecho(marca: string): Hecho | null {
  try {
    const h = JSON.parse(sessionStorage.getItem(CLAVE_PEDIDO) ?? "null") as Hecho | null;
    return h?.marca === marca && h.mensaje ? h : null;
  } catch {
    return null;
  }
}

export function PedirKit({ identidad, items }: { identidad: IdentidadIA; items: ItemKit[] }) {
  const [modo, setModo] = useState<"cerrado" | "formulario" | "enviando">("cerrado");
  const [hecho, setHecho] = useState<Hecho | null>(null);
  const [error, setError] = useState("");
  const unidades = items.reduce((t, i) => t + i.cantidad, 0);

  // Si ya pidió en esta pestaña, al volver ve su pedido
  useEffect(() => setHecho(leerHecho(identidad.nombre)), [identidad.nombre]);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const pedido = {
      nombre: datos.nombre ?? "",
      contacto: datos.contacto ?? "",
      entrega: datos.entrega ?? "",
      nota: datos.nota || undefined,
      marca: identidad.nombre,
      items,
    };
    // La pestaña de WhatsApp se abre ya, con el toque: abierta después de esperar a Supabase, algunos navegadores
    // la bloquean. Cuando el pedido está guardado, se le pone el link con el número.
    const ventana = linkWhatsApp("") ? window.open("", "_blank") : null;
    if (ventana) ventana.document.title = "Abriendo WhatsApp…";
    setModo("enviando");
    setError("");

    let numero: string | null = null;
    try {
      const r = await fetch("/api/branderia/pedido", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...pedido, colores: identidad.paleta.map((c) => c.hex), sitio: datos.sitio }),
      });
      const respuesta = await r.json().catch(() => ({}));
      // Datos mal cargados: se corrigen en el formulario y no sale nada por WhatsApp
      if (r.status === 400) {
        ventana?.close();
        setError(respuesta.error ?? "Revisá los datos.");
        setModo("formulario");
        return;
      }
      if (r.ok) numero = respuesta.numero ?? null;
    } catch {
      // Sin conexión con la base: el pedido sale igual por WhatsApp
    }

    const mensaje = mensajeWhatsApp({ ...pedido, numero });
    const link = linkWhatsApp(mensaje);
    if (!numero && !link) {
      ventana?.close();
      setError("No pudimos guardar tu pedido. Probá de nuevo en un rato.");
      setModo("formulario");
      return;
    }
    if (link) abrir(link, ventana);

    const nuevo: Hecho = { numero, marca: identidad.nombre, unidades, contacto: pedido.contacto, mensaje };
    setHecho(nuevo);
    setModo("cerrado");
    try {
      sessionStorage.setItem(CLAVE_PEDIDO, JSON.stringify(nuevo));
    } catch {}
  }

  function otroPedido() {
    setHecho(null);
    try {
      sessionStorage.removeItem(CLAVE_PEDIDO);
    } catch {}
  }

  if (hecho) {
    const link = linkWhatsApp(hecho.mensaje);
    return (
      <div role="status" className={`${s.entra} flex flex-col gap-3 rounded-[12px] bg-primary p-4 text-primary-foreground`}>
        {hecho.numero && <p className="text-xs font-semibold tracking-[0.12em] uppercase opacity-75">Pedido {hecho.numero}</p>}
        <p className="font-semibold">{hecho.numero ? "Listo, guardamos tu pedido." : "Tu pedido va por WhatsApp."}</p>
        <p className="text-sm opacity-85">
          {hecho.unidades} {hecho.unidades === 1 ? "unidad" : "unidades"} con la marca {hecho.marca}.{" "}
          {link
            ? "Mandanos el mensaje por WhatsApp (si no se abrió solo, tocá el botón) y te respondemos con la cotización."
            : `Te escribimos a ${hecho.contacto} con la cotización.`}{" "}
          Todavía no se cobró nada.
        </p>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-full bg-primary-foreground px-5 text-[0.9375rem] font-semibold text-primary transition-opacity duration-300 ease-brandia hover:opacity-90"
          >
            <MessageCircle className="size-4" aria-hidden />
            Mandar por WhatsApp
          </a>
        ) : (
          <span className="inline-flex h-11 items-center gap-2 self-start rounded-full border border-current/40 px-5 text-sm opacity-75">
            <MessageCircle className="size-4" aria-hidden />
            Falta configurar el WhatsApp de BrandIA
          </span>
        )}
        <ol className="flex flex-col gap-1.5 text-sm">
          {PASOS.map((p, i) => (
            <li key={p} className={`flex items-center gap-2 ${i === 0 ? "font-semibold" : "opacity-60"}`}>
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                  i === 0 ? "border-transparent bg-primary-foreground text-primary" : "border-current/40"
                }`}
              >
                {i === 0 && <Check className="size-3" aria-hidden />}
              </span>
              {p}
            </li>
          ))}
        </ol>
        <button type="button" onClick={otroPedido} className="self-start text-sm underline underline-offset-2 opacity-85">
          Hacer otro pedido
        </button>
      </div>
    );
  }

  if (modo === "cerrado") {
    return (
      <Button size="lg" disabled={!items.length} onClick={() => setModo("formulario")}>
        Pedir cotización <span aria-hidden>→</span>
      </Button>
    );
  }

  return (
    <form onSubmit={enviar} className={`${s.entra} flex flex-col gap-3 rounded-[12px] border p-4`}>
      <div>
        <p className="font-semibold">¿A quién le escribimos?</p>
        <p className="text-sm text-muted-foreground">
          Se abre WhatsApp con tu pedido listo para mandarnos. Te pasamos la cotización por ahí: no se cobra nada ahora.
        </p>
      </div>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Tu nombre
        <input name="nombre" required maxLength={80} autoComplete="name" className={campo} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Tu WhatsApp o mail
        <input name="contacto" required maxLength={120} autoComplete="tel" inputMode="tel" placeholder="099 123 456" className={campo} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        ¿A dónde te lo mandamos?
        <input name="entrega" required maxLength={200} autoComplete="address-level2" placeholder="Ciudad y barrio" className={campo} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        <span>
          Algo más <span className="font-normal text-muted-foreground">(opcional)</span>
        </span>
        <textarea
          name="nota"
          maxLength={500}
          rows={2}
          placeholder="Para cuándo lo necesitás, colores, talles…"
          className="w-full rounded-[4px] border bg-background px-3 py-2 text-[0.9375rem] outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      </label>
      {/* Para robots: una persona no lo ve ni lo completa */}
      <input name="sitio" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {error && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="lg" disabled={modo === "enviando" || !items.length}>
          {modo === "enviando" ? "Enviando…" : "Enviar por WhatsApp"} <ArrowRight data-icon="inline-end" />
        </Button>
        <Button type="button" variant="ghost" onClick={() => setModo("cerrado")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

/** Lleva la pestaña ya abierta a WhatsApp; si el navegador no la dejó abrir, prueba abrir una nueva. */
function abrir(link: string, ventana: Window | null) {
  if (ventana && !ventana.closed) {
    ventana.opener = null;
    ventana.location.href = link;
    return;
  }
  window.open(link, "_blank", "noopener");
}
