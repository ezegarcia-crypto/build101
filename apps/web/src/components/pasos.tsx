// Los pasos del recorrido de la demo: la entrevista, el brandbook y el feed
const PASOS = ["Contanos", "Tu marca", "Tu contenido"];

export function Pasos({ actual }: { actual: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-2" aria-hidden="true">
        {PASOS.map((p, i) => (
          <i
            key={p}
            className={`block h-1 rounded-full transition-all duration-300 ease-brandia ${
              i === actual ? "w-[52px] bg-foreground" : i < actual ? "w-7 bg-foreground/60" : "w-7 bg-foreground/20"
            }`}
          />
        ))}
      </div>
      <p className="label whitespace-nowrap">
        Paso {actual + 1} · {PASOS[actual]}
      </p>
    </div>
  );
}
