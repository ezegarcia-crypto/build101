"use client";

import { Button } from "@build101/ui/components/button";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";

import type { IdentidadIA } from "@/components/brandbook/identidad";

import s from "../entrevista/entrevista.module.css";

// El pedido del kit de BranderIA: "Pedir cotización" abre el formulario (nombre, WhatsApp, a dónde mandarlo),
// el pedido se guarda en Supabase (POST /api/branderia/pedido) y la persona ve su número y en qué paso está.
// No se cobra nada: el equipo lo ve en /pedidos y le escribe con la cotización.

const CLAVE_PEDIDO = "brandia:pedido-branderia";

export type ItemKit = { nombre: string; detalle: string; tecnica: string; estampa: string; cantidad: number };

type Hecho = { numero: string; marca: string; unidades: number; contacto: string };

const PASOS = ["Recibido", "Cotización por WhatsApp", "Producción con tu marca", "En camino", "Entregado"];

const campo =
  "h-10 w-full rounded-[4px] border bg-background px-3 text-[0.9375rem] text-foreground outline-none transition-shadow duration-300 ease-brandia focus-visible:ring-2 focus-visible:ring-ring/50";

function leerHecho(marca: string): Hecho | null {
  try {
    const h = JSON.parse(sessionStorage.getItem(CLAVE_PEDIDO) ?? "null") as Hecho | null;
    return h?.marca === marca ? h : null;
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
    setModo("enviando");
    setError("");
    try {
      const r = await fetch("/api/branderia/pedido", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...datos,
          nota: datos.nota || undefined,
          marca: identidad.nombre,
          colores: identidad.paleta.map((c) => c.hex),
          items,
        }),
      });
      const respuesta = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(respuesta.error ?? "No pudimos guardar tu pedido. Probá de nuevo en un rato.");
      const nuevo: Hecho = { numero: respuesta.numero, marca: identidad.nombre, unidades, contacto: datos.contacto };
      setHecho(nuevo);
      setModo("cerrado");
      try {
        sessionStorage.setItem(CLAVE_PEDIDO, JSON.stringify(nuevo));
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar tu pedido. Probá de nuevo en un rato.");
      setModo("formulario");
    }
  }

  function otroPedido() {
    setHecho(null);
    try {
      sessionStorage.removeItem(CLAVE_PEDIDO);
    } catch {}
  }

  if (hecho) {
    return (
      <div role="status" className={`${s.entra} flex flex-col gap-3 rounded-[12px] bg-primary p-4 text-primary-foreground`}>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase opacity-75">Pedido {hecho.numero}</p>
        <p className="font-semibold">Listo, recibimos tu pedido.</p>
        <p className="text-sm opacity-85">
          {hecho.unidades} unidades con la marca {hecho.marca}. Te escribimos a {hecho.contacto} con la cotización. Todavía
          no se cobró nada.
        </p>
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
        <p className="text-sm text-muted-foreground">Te pasamos la cotización por WhatsApp. No se cobra nada ahora.</p>
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
          {modo === "enviando" ? "Enviando…" : "Enviar pedido"} <ArrowRight data-icon="inline-end" />
        </Button>
        <Button type="button" variant="ghost" onClick={() => setModo("cerrado")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
