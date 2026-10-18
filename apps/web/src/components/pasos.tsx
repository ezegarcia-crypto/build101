// Los pasos del recorrido de la demo: la entrevista, el brandbook, el feed y los productos (BranderIA)
const PASOS = ["Contanos", "Tu marca", "Tu contenido", "Tus productos"];

export function Pasos({ actual }: { actual: number }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex shrink-0 gap-1.5 sm:gap-2" aria-hidden="true">
        {PASOS.map((p, i) => (
          <i
            key={p}
            className={`block h-1 rounded-full transition-all duration-300 ease-brandia ${
              i === actual
                ? "w-7 bg-foreground sm:w-[52px]"
                : i < actual
                  ? "w-3.5 bg-foreground/60 sm:w-7"
                  : "w-3.5 bg-foreground/20 sm:w-7"
            }`}
          />
        ))}
      </div>
      <p className="label min-w-0 truncate">
        Paso {actual + 1} · {PASOS[actual]}
      </p>
    </div>
  );
}
