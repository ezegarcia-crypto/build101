// Arma el catálogo de estilos del motor de marca (issue #2): las 15 familias de estilo del apéndice A del informe
// "Estudios de branding referentes mundiales" (reports/). Cada familia dice qué mecanismo la define (la decisión de
// diseño que la hace distinta, no un adjetivo), para qué rubros sirve y sus descriptores en inglés, listos para el
// prompt. La IA elige de acá una familia distinta para cada una de las 3 direcciones visuales.
//
// Los descriptores son síntesis propias del informe y no nombran estudios ni diseñadores. Igual, este script lo
// comprueba: junta los nombres de la columna "Estudio" de las tablas del informe y frena si alguno aparece en los
// datos. Los acentos regionales del apéndice quedan para otro paso (acento con intensidad regulable, issue #2).
//
// Uso: node scripts/catalogo-estilos.mjs
// Escribe apps/web/src/lib/ia/catalogos/estilos.json. Si se cambia el apéndice A, se vuelve a correr.
import { readFileSync, writeFileSync } from "node:fs";

const INFORME = new URL("../reports/Estudios de branding referentes mundiales.md", import.meta.url);
const SALIDA = new URL("../apps/web/src/lib/ia/catalogos/estilos.json", import.meta.url);

const texto = readFileSync(INFORME, "utf8");

// El apéndice A va desde su título hasta los acentos regionales
const inicio = texto.indexOf("## Apéndice A");
const fin = texto.indexOf("### Acentos regionales", inicio);
if (inicio < 0 || fin < 0) throw new Error("No encontré el apéndice A en el informe");
const apendice = texto.slice(inicio, fin);

const familias = [];
const bloques = apendice.split(/^### /m).slice(1);
for (const bloque of bloques) {
  const titulo = bloque.match(/^(\d+)\.\s+(.+)$/m);
  const mecanismo = bloque.match(/\*Mecanismo:\*\s*(.+?)\s*\*Rubros:\*/s);
  const rubros = bloque.match(/\*Rubros:\*\s*(.+?)\.?\s*$/m);
  const codigo = bloque.match(/```\n([\s\S]*?)```/);
  if (!titulo || !mecanismo || !rubros || !codigo) throw new Error(`Familia mal armada en el informe: ${bloque.slice(0, 60)}`);
  familias.push({
    numero: Number(titulo[1]),
    nombre: titulo[2].trim(),
    mecanismo: mecanismo[1].trim().replace(/\.$/, ""),
    rubros: rubros[1]
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean),
    descriptores: codigo[1]
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
  });
}
if (familias.length !== 15) throw new Error(`Esperaba 15 familias y encontré ${familias.length}`);

// Nombres de estudios: la primera columna de las tablas que empiezan con "| Estudio |"
const estudios = new Set();
let enTabla = false;
for (const linea of texto.split("\n")) {
  if (/^\|\s*Estudio\s*\|/.test(linea)) {
    enTabla = true;
    continue;
  }
  if (!linea.startsWith("|")) {
    enTabla = false;
    continue;
  }
  if (!enTabla || /^\|\s*-/.test(linea)) continue;
  const celda = linea.split("|")[1].replace(/\(.*?\)/g, "").replace(/\*/g, "").trim();
  for (const parte of celda.split(/\s*[/]\s*/)) if (parte.length >= 3) estudios.add(parte);
}
if (estudios.size < 50) throw new Error(`Encontré solo ${estudios.size} estudios en el informe: revisar cómo se leen las tablas`);

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const datos = JSON.stringify(familias);
// Con mayúsculas, como se escribe un nombre propio: así "manual" o "character" (palabras comunes que también son
// nombres de estudios) no frenan el script
const nombrados = [...estudios].filter((e) => new RegExp(`(^|[^\\p{L}])${escapar(e)}([^\\p{L}]|$)`, "u").test(datos));
if (nombrados.length) throw new Error(`Los datos nombran estudios, y no puede ser: ${nombrados.join(", ")}`);

writeFileSync(
  SALIDA,
  `${JSON.stringify(
    {
      actualizado: new Date().toISOString().slice(0, 10),
      origen: "reports/Estudios de branding referentes mundiales.md, apéndice A",
      familias,
    },
    null,
    1,
  )}\n`,
);
console.log(
  `${familias.length} familias y ${familias.reduce((n, f) => n + f.descriptores.length, 0)} descriptores. ` +
    `Se revisó que no nombren a ninguno de los ${estudios.size} estudios del informe.`,
);
