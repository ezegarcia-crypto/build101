import { Fragment, type ReactNode } from "react";

// Las respuestas de BrandIA traen un Markdown sencillo: párrafos, listas numeradas o con guiones
// y **negritas**. Esto lo muestra sin sumar librerías.

function conNegritas(texto: string): ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((trozo, i) =>
    trozo.startsWith("**") && trozo.endsWith("**") ? (
      <strong key={i} className="font-semibold">
        {trozo.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{trozo}</Fragment>
    ),
  );
}

type Bloque = { tipo: "p"; lineas: string[] } | { tipo: "ol" | "ul"; items: string[] };

export function TextoIA({ texto }: { texto: string }) {
  const bloques: Bloque[] = [];

  for (const cruda of texto.split("\n")) {
    const linea = cruda.trim();
    const ultimo = bloques.at(-1);
    const numerada = linea.match(/^\d+[.)]\s+(.*)/);
    const conGuion = linea.match(/^[-*•]\s+(.*)/);

    if (!linea) {
      bloques.push({ tipo: "p", lineas: [] });
    } else if (numerada) {
      if (ultimo?.tipo === "ol") ultimo.items.push(numerada[1]);
      else bloques.push({ tipo: "ol", items: [numerada[1]] });
    } else if (conGuion) {
      if (ultimo?.tipo === "ul") ultimo.items.push(conGuion[1]);
      else bloques.push({ tipo: "ul", items: [conGuion[1]] });
    } else if (ultimo?.tipo === "p") {
      ultimo.lineas.push(linea);
    } else {
      bloques.push({ tipo: "p", lineas: [linea] });
    }
  }

  return (
    <div className="space-y-2.5">
      {bloques.map((b, i) => {
        if (b.tipo === "p") {
          if (!b.lineas.length) return null;
          return <p key={i}>{conNegritas(b.lineas.join(" "))}</p>;
        }
        const Lista = b.tipo;
        return (
          <Lista
            key={i}
            className={`space-y-1.5 pl-5 ${b.tipo === "ol" ? "list-decimal" : "list-disc"} marker:text-muted-foreground`}
          >
            {b.items.map((item, j) => (
              <li key={j}>{conNegritas(item)}</li>
            ))}
          </Lista>
        );
      })}
    </div>
  );
}
