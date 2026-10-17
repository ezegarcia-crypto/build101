import { PASOS } from "@/lib/ia/gastos";

/** El nombre de cada paso para mostrar ("logo" → "Tres logos") */
export function nombreDelPaso(paso: string) {
  return paso in PASOS ? PASOS[paso as keyof typeof PASOS].nombre : paso === "transcribir" ? "Audio a texto" : paso;
}
