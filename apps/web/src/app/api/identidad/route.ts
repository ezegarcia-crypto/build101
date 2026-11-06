import { generateText, Output } from "ai";

import { briefSchema } from "@/lib/ia/brief";
import { tipografiasDeLaIdentidad } from "@/lib/ia/catalogos/fuentes";
import { asegurarContraste, type Comprobacion, comprobarPrincipal, limpiarSvg } from "@/lib/ia/comprobaciones";
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

export const POST = medir("identidad", async (req: Request) => {
  const cuerpo = await req.json();
  const ficha = briefSchema.safeParse(cuerpo.brief);
  const elegida = direccionSchema.safeParse(cuerpo.direccion);
  if (!ficha.success || !elegida.success) {
    return Response.json({ error: "Faltan la ficha o la dirección elegida" }, { status: 400 });
  }
  const brief = ficha.data;
  // El nombre de la ficha manda (el que la persona eligió entre las propuestas, o el que el negocio ya
  // tenía): reemplaza la propuesta que traía la dirección, para que textos y logos digan lo mismo.
  const direccion = brief.marca.nombre ? { ...elegida.data, nombre_marca: brief.marca.nombre } : elegida.data;
  const contexto = `Ficha de la marca:\n${JSON.stringify(brief, null, 2)}\n\nDirección visual elegida:\n${JSON.stringify(direccion, null, 2)}`;

  const [textos, logo, fuentes] = await Promise.all([
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
    tipografiasDeLaIdentidad({
      titulos: direccion.tipografias.titulos.familia,
      texto: direccion.tipografias.texto.familia,
    }),
  ]);

  const comprobaciones: Comprobacion[] = [];

  const { paleta, comprobacion: contrasteOk } = asegurarContraste(direccion.paleta);
  comprobaciones.push(contrasteOk, comprobarPrincipal(paleta));

  comprobaciones.push(fuentes.comprobacion);

  const { svg, comprobacion: logoOk } = limpiarSvg(logo.output.isotipo_svg);
  comprobaciones.push(logoOk);

  return Response.json({
    identidad: {
      ...textos.output,
      nombre: brief.marca.nombre ?? textos.output.nombre,
      direccion: {
        id: direccion.id,
        nombre: direccion.nombre,
        idea: direccion.idea,
        palabras: direccion.palabras,
        formas: direccion.formas,
      },
      paleta,
      tipografias: fuentes.tipografias,
      fuentes_url: fuentes.fuentes_url,
      logo: { tipo: direccion.logo_sugerido.tipo, isotipo_svg: svg, explicacion: logo.output.explicacion },
      comprobaciones,
    },
  });
});
