---
documento: Motor v1 · etapa 1 (a mano, con Claude) y su pasaje a API
version: 0.1 · borrador
fecha: 2026-10-06
autor: Ezequiel García (con Claude)
relacionado: /03-projects/00-plataforma/outputs/drafts/2026-10-06_motor-v1-costos-y-precios.md · /03-projects/00-plataforma/docs/2026-09-23_ARQUITECTURA-APP.md § 5
---

# Motor v1

## La regla que hace que la etapa 1 no se tire

**Cada paso tiene un prompt escrito y un archivo de salida con formato fijo.** En la etapa 1 los
corre Claude acá, en la conversación; en la etapa 2 los corre la API con el mismo prompt y el
mismo formato. Lo único que cambia es quién aprieta el botón. Si un paso funciona a mano, el
prompt ya está probado para la app.

## Los pasos hasta el moodboard

| # | Paso | Entra | Sale | Prompt | En la API (etapa 2) |
|---|---|---|---|---|---|
| 0 | ¿Ya tenés marca? | Respuesta del cliente | `tipo_proyecto` | en `01-entrevistador.md` | Botones en la app, sin IA |
| 1 | Entrevista | Charla con el cliente | `brief.json` | `01-entrevistador.md` | Sonnet 5.5 en chat; al cierre, salida estructurada con `brief.schema.json` · ≈ USD 0,08 |
| 2 | Análisis de referencias | Fotos, capturas, Pinterest, sitios | `referencias.json` | `02-referencias.md` | Sonnet 5.5 con imágenes · ≈ USD 0,01–0,02 por imagen |
| 3 | Direcciones visuales | `brief.json` + `referencias.json` | `direcciones.json` (3 direcciones) | `03-direcciones.md` | Sonnet u Opus 5.5 · ≈ USD 0,07–0,15 |
| 4 | Moodboards | `direcciones.json` + imágenes | `moodboards.html` | — (plantilla) | Plantilla HTML, sin IA. Imágenes: banco gratis (Pexels/Unsplash) o IA a USD 0,03–0,05 c/u |
| 5 | Elección | El cliente elige una dirección (y puede mezclar) | `direccion_elegida` en `brief.json` | — | Botones en la app |
| 6 | Prompt maestro | Todo lo anterior | `prompt-maestro.json` | (siguiente entrega) | Sonnet u Opus 5.5 |

Después del 6 siguen logos, sistema y manual (arquitectura § 5). Se escriben cuando los pasos 1 a 5
estén probados con la primera marca.

## Etapa 1: cómo se corre una marca

1. Se crea `banco-de-pruebas/<nombre-de-la-marca>/`.
2. **Entrevista:** Claude hace las preguntas de `01-entrevistador.md` en el chat, en tandas cortas.
   La persona contesta como contestaría un cliente. Al final Claude escribe `brief.json`.
3. **Referencias:** la persona adjunta fotos, capturas o links. Claude escribe `referencias.json`.
4. **Direcciones y moodboards:** Claude escribe `direcciones.json` y arma `moodboards.html`.
5. La persona elige. Se anota qué tan bien encajó cada paso (1 a 5) y qué faltó.
6. **Registro de uso:** en la etapa 1 no hay costo en dólares por marca (corre en la suscripción).
   Se anota igual cuántas vueltas llevó cada paso. El costo exacto se mide al final corriendo las
   mismas marcas una vez por API (≈ USD 20–30 en total).

## Imágenes del moodboard

| Origen | Etapa 1 | Etapa 2 | Costo |
|---|---|---|---|
| Referencias del cliente | Sí, siempre que haya | Sí | 0 |
| Muestras dibujadas (paleta, tipografías, formas, texturas en SVG) | Sí | Sí | 0 |
| Fotos de banco libre | Opcional | Pexels/Unsplash por API | 0 |
| Imágenes generadas con IA | Solo si hace falta algo que no existe | GPT Image 2 o FLUX | USD 0,03–0,05 c/u |

Por defecto el moodboard se arma **sin generar imágenes**: referencias del cliente + muestras
dibujadas + fotos de banco. Es gratis y sale al instante. Las imágenes con IA van solo donde suman.

## Archivos

- `motor.html` — **el motor funcionando** (pasos 1 a 4 + evaluación con costo estimado). Publicado como artifact privado: https://claude.ai/artifact/UvCUoNLrgD1UpydngbLQof. Usa Claude desde la cuenta de quien lo abre; las marcas quedan guardadas en el artifact para el equipo.

- `01-entrevistador.md` — prompt y guion de la entrevista.
- `brief.schema.json` — formato del brief (lo usa la API para la salida estructurada).
- `02-referencias.md` — prompt de análisis de referencias.
- `03-direcciones.md` — prompt de direcciones visuales y formato de `direcciones.json`.
- `banco-de-pruebas/` — una carpeta por marca probada.
