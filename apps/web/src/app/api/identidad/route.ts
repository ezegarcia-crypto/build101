import { generateText, Output } from "ai";

import { briefSchema } from "@/lib/ia/brief";
import {
  asegurarContraste,
  type Comprobacion,
  comprobarPrincipal,
  limpiarSvg,
  parametroGoogleFonts,
} from "@/lib/ia/comprobaciones";
import { direccionSchema } from "@/lib/ia/direcciones";
import {
  logoSchema,
  MODELO_LOGO,
  MODELO_TEXTOS,
  PROMPT_LOGO,
  PROMPT_TEXTOS,
  textosSchema,
} from "@/lib/ia/identidad";
import { conReintento } from "@/lib/ia/reintentar";
import { etiquetar, medir, senalDelPedido } from "@/lib/ia/gastos";

// Módulo A, paso 3: con la ficha y la dirección elegida, el contenido del brandbook y el símbolo del logo.
// Entra: { brief, direccion }. Sale: { identidad }, con las comprobaciones de calidad
// y `fuentes_url`, el link de Google Fonts para cargar las dos tipografías en la pantalla.

export const maxDuration = 180;

// Si una tipografía no existe en Google Fonts, se reemplaza por una segura del mismo uso
const REEMPLAZO = { titulos: "DM Serif Display", texto: "DM Sans" } as const;

export const POST = medir("identidad", async (req: Request) => {
  const cuerpo = await req.json();
  const ficha = briefSchema.safeParse(cuerpo.brief);
  const elegida = direccionSchema.safeParse(cuerpo.direccion);
  if (!ficha.success || !elegida.success) {
    return Response.json({ error: "Faltan la ficha o la dirección elegida" }, { status: 400 });
  }
  const brief = ficha.data;
  const direccion = elegida.data;
  const contexto = `Ficha de la marca:\n${JSON.stringify(brief, null, 2)}\n\nDirección visual elegida:\n${JSON.stringify(direccion, null, 2)}`;

  const [textos, logo, fuenteTitulos, fuenteTexto] = await Promise.all([
    conReintento(() =>
      generateText({
        model: MODELO_TEXTOS,
        abortSignal: senalDelPedido(),
        providerOptions: etiquetar(),
        instructions: PROMPT_TEXTOS,
        output: Output.object({ schema: textosSchema }),
        prompt: contexto,
      }),
    ),
    conReintento(() =>
      generateText({
        model: MODELO_LOGO,
        abortSignal: senalDelPedido(),
        providerOptions: etiquetar(),
        instructions: PROMPT_LOGO,
        output: Output.object({ schema: logoSchema }),
        prompt: `${contexto}\n\nTipo de logo: ${direccion.logo_sugerido.tipo}. Formas: ${direccion.formas}.`,
      }),
    ),
    parametroGoogleFonts(direccion.tipografias.titulos.familia),
    parametroGoogleFonts(direccion.tipografias.texto.familia),
  ]);

  const comprobaciones: Comprobacion[] = [];

  const { paleta, comprobacion: contrasteOk } = asegurarContraste(direccion.paleta);
  comprobaciones.push(contrasteOk, comprobarPrincipal(paleta));

  const tipografias = {
    titulos: fuenteTitulos ? direccion.tipografias.titulos.familia : REEMPLAZO.titulos,
    texto: fuenteTexto ? direccion.tipografias.texto.familia : REEMPLAZO.texto,
  };
  const parametros = [fuenteTitulos ?? "family=DM+Serif+Display", fuenteTexto ?? "family=DM+Sans:wght@400;700"];
  comprobaciones.push({
    que: "Tipografías",
    ok: Boolean(fuenteTitulos && fuenteTexto),
    detalle:
      fuenteTitulos && fuenteTexto
        ? `${tipografias.titulos} y ${tipografias.texto} existen en Google Fonts`
        : `Se reemplazó la que no existe en Google Fonts: ${tipografias.titulos} y ${tipografias.texto}`,
  });

  const { svg, comprobacion: logoOk } = limpiarSvg(logo.output.isotipo_svg);
  comprobaciones.push(logoOk);

  return Response.json({
    identidad: {
      ...textos.output,
      direccion: {
        id: direccion.id,
        nombre: direccion.nombre,
        idea: direccion.idea,
        palabras: direccion.palabras,
        formas: direccion.formas,
      },
      paleta,
      tipografias,
      fuentes_url: `https://fonts.googleapis.com/css2?${[...new Set(parametros)].join("&")}&display=swap`,
      logo: { tipo: direccion.logo_sugerido.tipo, isotipo_svg: svg, explicacion: logo.output.explicacion },
      comprobaciones,
    },
  });
});
