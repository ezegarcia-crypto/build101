import { Ejemplo, LugarLogo, Renglon } from "./piezas";

/** Una publicación de muestra (LinkedIn, X): cuenta sin marca, texto de ejemplo marcado y lugar para la imagen. */
export function Publicacion({ ejemplo, imagen = true }: { ejemplo: string; imagen?: boolean }) {
  return (
    <article className="flex flex-col gap-3 rounded-[16px] bg-card p-4">
      <div className="flex items-center gap-3">
        <LugarLogo />
        <div className="flex flex-1 flex-col gap-1.5">
          <Renglon ancho="40%" />
          <Renglon ancho="25%" alto="0.4rem" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Ejemplo className="self-start" texto="Texto de ejemplo, escrito a mano" />
        <p className="text-[0.9375rem]">{ejemplo}</p>
      </div>
      {imagen && (
        <span className="grid aspect-[16/9] place-items-center rounded-sm bg-muted text-xs text-muted-foreground">
          Imagen con tu marca
        </span>
      )}
      <div className="flex gap-4 border-t pt-3">
        <Renglon ancho="3rem" alto="0.4rem" />
        <Renglon ancho="3rem" alto="0.4rem" />
        <Renglon ancho="3rem" alto="0.4rem" />
      </div>
    </article>
  );
}
