import { buttonVariants } from "@build101/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Entrada } from "../_piezas/entrada";
import { DetrasDeEscena, Encabezado, Lienzo, LugarLogo, Pasos, Renglon } from "../_piezas/piezas";

export default function Web() {
  return (
    <Entrada className="flex flex-col gap-14">
      <Encabezado
        modulo="Módulo B · Generá tus contenidos"
        titulo="Tu web, armada"
        clave="con tu marca."
        bajada="Le contás a BrandIA para qué querés tu web. Mira qué hacen otras de tu rubro, te la arma con tu marca y tu voz, y la cambiás pidiéndolo en palabras."
      />

      <Lienzo nota="Vista previa de tu web">
        <div className="mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-[16px] bg-card">
          <div className="flex items-center gap-2 border-b px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-foreground/15" />
              <span className="size-2.5 rounded-full bg-foreground/15" />
              <span className="size-2.5 rounded-full bg-foreground/15" />
            </span>
            <span className="mx-auto rounded-full bg-muted px-4 py-1 text-xs text-muted-foreground">tumarca.com</span>
          </div>
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <LugarLogo className="size-8" />
            <span className="flex gap-3">
              <Renglon ancho="2.5rem" alto="0.45rem" />
              <Renglon ancho="2.5rem" alto="0.45rem" />
              <Renglon ancho="2.5rem" alto="0.45rem" />
            </span>
          </div>
          <div className="grid gap-5 px-5 pb-6 sm:grid-cols-2 sm:items-center">
            <div className="flex flex-col gap-3">
              <Renglon ancho="90%" alto="1.25rem" />
              <Renglon ancho="65%" alto="1.25rem" />
              <Renglon ancho="80%" />
              <span className="mt-2 self-start rounded-full bg-foreground/15 px-5 py-2.5 text-xs font-semibold text-muted-foreground">
                Tu botón principal
              </span>
            </div>
            <span className="grid aspect-[4/3] place-items-center rounded-sm bg-muted text-xs text-muted-foreground">
              Tus fotos
            </span>
          </div>
        </div>
      </Lienzo>

      <Pasos
        pasos={[
          { titulo: "Contás qué necesitás", texto: "Solo lo que falta: para qué es la web, horarios, contacto. Tu marca ya la tiene." },
          { titulo: "Mira tu rubro", texto: "Qué hacen otras webs como la tuya y dónde te podés diferenciar. Te propone estilos." },
          { titulo: "Arma tu web", texto: "Estructura, textos con tu voz y tu identidad aplicada. Nunca inventa un dato." },
          { titulo: "La cambiás hablando", texto: "Pedís cambios en palabras, elegís tu dirección (dominio) y queda publicada." },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/crear/web" className={buttonVariants({ size: "lg" })}>
          Armar mi web
          <ArrowRight data-icon="inline-end" />
        </Link>
        <p className="text-sm text-muted-foreground">La entrevista, la web y los cambios por chat ya funcionan.</p>
      </div>

      <DetrasDeEscena>
        Ya funcionan con IA la entrevista de la web, la web armada con tu marca y los cambios por chat. Mirar la
        competencia, elegir el dominio y publicar siguen en construcción: no se compra ningún dominio ni se cobra nada.
      </DetrasDeEscena>
    </Entrada>
  );
}
