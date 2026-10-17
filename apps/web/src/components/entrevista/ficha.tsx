import s from "./entrevista.module.css";

// La ficha de la marca que devuelve la IA al terminar la entrevista.
// El tipo completo es `Brief`, en apps/web/src/lib/ia/brief.ts (rama ia, de Eze).
// Acá van solo los campos que se muestran, todos opcionales para no romper si falta alguno.
export type FichaMarca = {
  tipo_proyecto?: "nueva" | "renovacion" | "solo_productos";
  marca?: { nombre?: string | null; necesita_nombre?: boolean; rubro?: string; ubicacion?: string };
  negocio?: { que_hace?: string; diferencial?: string };
  publico?: { descripcion?: string };
  personalidad?: { palabras_si?: string[]; palabras_no?: string[] };
  huecos?: string[];
};

// La ficha pasa a la pantalla siguiente (la identidad) por acá
export const CLAVE_FICHA = "brandia:ficha";

const TIPO: Record<string, string> = {
  nueva: "Marca nueva",
  renovacion: "Renovación de marca",
  solo_productos: "Productos con tu marca",
};

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label">{titulo}</p>
      <div className="mt-1.5 text-[15px] leading-relaxed">{children}</div>
    </div>
  );
}

function Chips({ palabras, tachadas }: { palabras: string[]; tachadas?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {palabras.map((p) => (
        <span
          key={p}
          className={`rounded-full border px-3 py-1 text-[13px] ${tachadas ? "text-muted-foreground line-through decoration-1" : ""}`}
        >
          {p}
        </span>
      ))}
    </div>
  );
}

export function Ficha({ ficha }: { ficha: FichaMarca }) {
  const { marca, negocio, publico, personalidad } = ficha;
  const nombre = marca?.nombre?.trim();
  const lugar = [marca?.rubro, marca?.ubicacion].filter(Boolean).join(" · ");
  const si = personalidad?.palabras_si ?? [];
  const no = personalidad?.palabras_no ?? [];
  const huecos = ficha.huecos ?? [];

  return (
    <article className={`${s.entra} rounded-lg border bg-card p-5 shadow-[0_40px_70px_-45px_rgba(30,30,28,.45)] sm:p-7`}>
      <p className="label">Tu ficha{ficha.tipo_proyecto ? ` · ${TIPO[ficha.tipo_proyecto]}` : ""}</p>
      <h2 className={`${s.seCocina} mt-3 text-[clamp(2rem,1.4rem+2.4vw,3rem)] leading-[1.02]`}>
        {nombre || <span className={s.it}>Sin nombre, todavía</span>}
      </h2>
      {lugar && <p className="mt-2 text-muted-foreground">{lugar}</p>}
      {!nombre && marca?.necesita_nombre && (
        <p className="mt-2 text-sm text-muted-foreground">Te vamos a proponer opciones de nombre.</p>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {negocio?.que_hace && <Dato titulo="Qué hacés">{negocio.que_hace}</Dato>}
        {negocio?.diferencial && <Dato titulo="Por qué te eligen">{negocio.diferencial}</Dato>}
        {publico?.descripcion && <Dato titulo="Para quién">{publico.descripcion}</Dato>}
        {si.length > 0 && (
          <Dato titulo="Cómo se tiene que sentir">
            <Chips palabras={si} />
          </Dato>
        )}
        {no.length > 0 && (
          <Dato titulo="Lo que nunca">
            <Chips palabras={no} tachadas />
          </Dato>
        )}
        {huecos.length > 0 && (
          <Dato titulo="Quedó por definir">
            <span className="text-muted-foreground">{huecos.join(" · ")}</span>
          </Dato>
        )}
      </div>
    </article>
  );
}
