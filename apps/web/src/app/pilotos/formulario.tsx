"use client";

import { useActionState } from "react";

import { Button } from "@build101/ui/components/button";

import { dar, type EstadoForm } from "./acciones";

// El formulario para dar una cuenta piloto: el correo de la persona, cuántos días es gratis y una nota para el equipo.

const campo = "rounded-[4px] border bg-background px-2 py-1.5 text-[0.9375rem]";

export function Formulario({ diasPorDefecto }: { diasPorDefecto: number }) {
  const [estado, enviar, enviando] = useActionState<EstadoForm, FormData>(dar, { ok: false, mensaje: null });

  return (
    <form action={enviar} className="flex flex-col gap-4 rounded-[14px] border bg-card p-5 sm:p-6">
      <h2 className="text-xl">Dar una cuenta piloto</h2>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <label className="flex flex-col gap-1 text-[0.9375rem]">
          Correo de la persona
          <input
            type="email"
            name="mail"
            required
            autoComplete="off"
            inputMode="email"
            placeholder="nombre@negocio.com"
            className={campo}
          />
        </label>
        <label className="flex flex-col gap-1 text-[0.9375rem]">
          Días gratis
          <input type="number" name="dias" min={1} max={365} step={1} required defaultValue={diasPorDefecto} className={campo} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-[0.9375rem]">
        Nota para el equipo (opcional)
        <input name="nota" maxLength={200} placeholder="Quién es y de dónde viene. La persona no la ve" className={campo} />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={enviando}>
          {enviando ? "Guardando…" : "Dar cuenta piloto"}
        </Button>
        {estado.mensaje && (
          <span role="status" className={estado.ok ? "text-[0.9375rem]" : "text-[0.9375rem] text-destructive"}>
            {estado.mensaje}
          </span>
        )}
      </div>
    </form>
  );
}
