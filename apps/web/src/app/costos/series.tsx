// Los colores de cada familia de modelos, para el gráfico y las tarjetas del panel. El color sigue al
// modelo (no a su puesto en el ranking). Paleta validada con la guía de visualización, en claro y
// oscuro, sin naranja: en BrandIA el naranja es un solo punto por pantalla.

export const FAMILIAS = [
  { clave: "sonnet", nombre: "Claude Sonnet", color: "var(--serie-1)", es: (m: string) => m.includes("claude-sonnet") },
  { clave: "recraft", nombre: "Recraft", color: "var(--serie-2)", es: (m: string) => m.startsWith("recraft/") },
  { clave: "opus", nombre: "Claude Opus", color: "var(--serie-3)", es: (m: string) => m.includes("claude-opus") },
  { clave: "gpt-image", nombre: "GPT Image", color: "var(--serie-4)", es: (m: string) => m.startsWith("openai/") },
  { clave: "otros", nombre: "Otros", color: "var(--serie-otros)", es: () => true },
] as const;

export function familia(modelo: string) {
  return FAMILIAS.find((f) => f.es(modelo)) ?? FAMILIAS[FAMILIAS.length - 1];
}

export const ESTILOS_SERIES = `
.viz-etapas {
  --serie-1: #2a78d6; --serie-2: #1baf7a; --serie-3: #4a3aa7; --serie-4: #e87ba4; --serie-otros: #9a978f;
}
.dark .viz-etapas {
  --serie-1: #3987e5; --serie-2: #199e70; --serie-3: #9085e9; --serie-4: #d55181; --serie-otros: #6f6d66;
}`;

export function Muestra({ modelo }: { modelo: string }) {
  return <span aria-hidden className="inline-block size-2.5 shrink-0 rounded-[2px]" style={{ background: familia(modelo).color }} />;
}

