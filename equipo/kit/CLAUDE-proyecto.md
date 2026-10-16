# CLAUDE.md · [nombre del producto]

> Plantilla. El sábado, después del kickoff, se copia al repo `build101` como `CLAUDE.md` y se completan los corchetes.

## El producto

- **Qué es, en una frase:** [ej.: "un agente que atiende a los interesados en una propiedad, los califica y les agenda la visita"]
- **Para quién:** [quién lo usa y qué problema tiene hoy]
- **Dónde está la IA:** [qué decide o hace la IA adentro del producto; qué herramientas usa]
- **La consigna del evento:** [pegar la consigna textual]

## La demo (lo que vamos a mostrar al jurado)

Recorrido exacto, paso a paso:
1. [el usuario entra y ve…]
2. [hace… y la IA…]
3. [resultado final que se ve en pantalla]

**Está terminado cuando:** [criterio que se pueda comprobar, también en tamaño celular]

## Quién toca qué

| Persona | Parte | Carpetas que puede tocar |
|---|---|---|
| [nombre] | Pantallas y diseño | [ej. `apps/web/src/app`, `apps/web/src/components`] |
| [nombre] | La IA del producto | [ej. `apps/web/src/agent`] |
| [nombre] | Datos, publicación y pruebas | [ej. `apps/web/src/lib/db`, `tests/`] |

## Reglas para el agente

- Hacé solo lo que te pido. No agregues funciones, archivos ni cambios extra; si ves una mejora, proponela pero no la hagas.
- No toques archivos fuera de mi parte (ver la tabla de arriba).
- Hacé commit cada vez que algo funcione.
- Antes de decir "listo": corré el lint y las pruebas, probá en el navegador (también en tamaño celular) y mostrame una captura.
- Ninguna clave en el código ni en GitHub. Van en `.env.local` y en las variables de entorno de Vercel.
- Los textos de la app, en español rioplatense.
- Explicame lo que hiciste en lenguaje simple: no soy programador.

## Stack

Next.js (plantilla Better-T-Stack) · shadcn · Supabase [si hace falta] · Vercel · [IA: Eve / AI SDK / tool use de Claude] · [otros].

## Diseño

Seguí `design-system.md` (colores, tipografía y estilo). Referencia visual: [link o captura].
