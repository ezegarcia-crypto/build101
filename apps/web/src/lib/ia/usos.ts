import { MODELO_IMAGEN as MODELO_FOTOS_FEED } from "@/lib/ia/contenidos/imagen";
import { MODELO_PLAN, MODELO_REDACCION } from "@/lib/ia/contenidos/prompts";
import { MODELO_DESTACADAS } from "@/lib/ia/destacadas";
import { MODELO_DIRECCIONES } from "@/lib/ia/direcciones";
import { MODELO_ENTREVISTA } from "@/lib/ia/entrevistador";
import type { Paso } from "@/lib/ia/gastos";
import { MODELO_LOGO, MODELO_TEXTOS } from "@/lib/ia/identidad";
import {
  MODELO_CONCEPTOS,
  MODELO_IMAGEN as MODELO_DIBUJO_LOGO,
  MODELO_IMAGEN_RESPALDO as MODELO_DIBUJO_LOGO_RESPALDO,
} from "@/lib/ia/logo";
import { MODELO_SUGERIR } from "@/lib/ia/branderia";
import { MODELO_NOMBRES } from "@/lib/ia/nombres";
import { MODELO_PALETA } from "@/lib/ia/paleta";
import { MODELO_WEB } from "@/lib/ia/web/ficha-web";
import { MODELO_FOTO_WEB } from "@/lib/ia/web/fotos";

// Para qué usa cada paso cada modelo. Sale de las mismas constantes que usa el código, así que si
// alguien cambia un modelo, el panel /costos lo muestra solo. Lo medido (cuánto gastó cada modelo en
// cada paso) lo trae el reporte del Gateway; esto es la intención.

export type Uso = { modelo: string; para: string; respaldo?: boolean };

export const USOS: Record<Paso, Uso[]> = {
  entrevista: [{ modelo: MODELO_ENTREVISTA, para: "Conversa con la persona y arma la ficha de la marca" }],
  direcciones: [{ modelo: MODELO_DIRECCIONES, para: "Propone las tres direcciones visuales" }],
  nombres: [{ modelo: MODELO_NOMBRES, para: "Propone nombres con su porqué" }],
  identidad: [
    { modelo: MODELO_TEXTOS, para: "Escribe la esencia (misión y visión), la voz, el tono y el brandbook" },
    { modelo: MODELO_LOGO, para: "Dibuja el símbolo del logo en SVG" },
  ],
  logo: [
    { modelo: MODELO_CONCEPTOS, para: "Piensa las ideas de los tres logos" },
    { modelo: MODELO_DIBUJO_LOGO, para: "Dibuja los logos" },
    { modelo: MODELO_DIBUJO_LOGO_RESPALDO, para: "Dibuja los logos si falla el principal", respaldo: true },
  ],
  paleta: [{ modelo: MODELO_PALETA, para: "Propone otra paleta según lo que pide la persona" }],
  "contenidos-lote": [
    { modelo: MODELO_PLAN, para: "Planifica el mes" },
    { modelo: MODELO_REDACCION, para: "Escribe y corrige cada pieza" },
    { modelo: MODELO_FOTOS_FEED, para: "Genera las fotos de las piezas" },
  ],
  "contenidos-plan": [{ modelo: MODELO_PLAN, para: "Planifica el mes" }],
  "contenidos-pieza": [{ modelo: MODELO_REDACCION, para: "Escribe y corrige una pieza" }],
  "contenidos-imagen": [{ modelo: MODELO_FOTOS_FEED, para: "Genera una foto" }],
  "contenidos-destacadas": [{ modelo: MODELO_DESTACADAS, para: "Elige el ícono y el nombre de cada historia destacada" }],
  // Retirado el 17/10: queda solo para que /costos muestre lo que ya se gastó con él.
  "contenidos-simple": [],
  "web-entrevista": [{ modelo: MODELO_WEB, para: "Pregunta lo que falta para la web del cliente" }],
  "web-armar": [{ modelo: MODELO_WEB, para: "Arma la web con la marca del cliente" }],
  "web-cambio": [{ modelo: MODELO_WEB, para: "Cambia la web según lo que pide la persona" }],
  "web-foto": [{ modelo: MODELO_FOTO_WEB, para: "Genera las fotos de la web con la marca" }],
  // Publicar no usa IA (está en PASOS solo por el tope de pedidos por minuto)
  "web-publicar": [],
  branderia: [{ modelo: MODELO_FOTOS_FEED, para: "Saca la foto de un producto con el logo impreso" }],
  "branderia-sugerir": [{ modelo: MODELO_SUGERIR, para: "Elige los productos con la marca que más le sirven a ese rubro" }],
};

/** Los pasos que usan un modelo, con para qué. */
export function pasosDelModelo(modelo: string) {
  return (Object.entries(USOS) as [Paso, Uso[]][]).flatMap(([paso, usos]) =>
    usos.filter((u) => u.modelo === modelo).map((u) => ({ paso, ...u })),
  );
}
