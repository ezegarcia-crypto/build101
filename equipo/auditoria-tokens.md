# Auditoría de tokens y costos de la IA · BrandIA

Hecha el sábado 17/10 a las 15:50, en la rama `web-cliente` (código al día con `git pull`).

## 0. Urgente: el Gateway está sin saldo

La consulta al Gateway de Vercel (`/v1/credits`, con la clave de `apps/web/.env.local`) devolvió:

- **Saldo: USD −19,71** (está en negativo)
- **Crédito cargado: USD 55.** Gastado: USD 74,62, todo el sábado 17/10 (ver punto 0b)

Con saldo negativo **toda llamada a la IA falla** con el error 402 `insufficient_funds`: entrevista, marca, logo, contenidos y web. Si la web publicada usa el mismo team (`ezegb`), la demo hoy no anda. **Eze tiene que cargar crédito** en Vercel → AI Gateway → Top up. Con USD 40 alcanza para volver a positivo y tener unas 30 corridas completas.

Por eso esta auditoría **no midió en vivo**: los tokens de entrada salen de medir los prompts reales del código con una ficha real (Miga, de `entrevistas-simuladas.md`); los de salida, de los tiempos medidos y del tamaño de lo que devuelve cada paso. Donde hay costo medido por el Gateway (contenidos), se usa ese.

## 0b. En qué se fueron los USD 74,62 (datos reales del Gateway)

Sale del reporte del Gateway (`/v1/report`, agrupado por modelo, por día y por clave). Todo el gasto es del sábado 17/10: 2.116 pedidos a la IA.

**Por modelo:**

| Modelo | Pedidos | Tokens entrada | Tokens salida | Tokens "pensando" | USD | % |
|---|---|---|---|---|---|---|
| Claude Sonnet 5.5 | 1.834 | 5,19 M | 3,52 M | 2,06 M | **66,15** | 89 % |
| Recraft v4.1 (logos y feed simple) | 177 imágenes | | | | 6,03 | 8 % |
| Claude Opus 5.5 (isotipo) | 29 | 0,08 M | 0,03 M | 0,03 M | 1,51 | 2 % |
| GPT Image 2 (fotos del feed) | 59 imágenes | | | | 0,67 | 1 % |
| Otros (pruebas sueltas de Flux, Seedream, Gemini, Haiku) | 17 | | | | 0,26 | 0 % |

**Por quién lo pidió:**

| Origen | Pedidos | USD |
|---|---|---|
| El proyecto `build101` de Vercel (la web publicada y las compus que usan `vercel env pull`) | 2.045 | **73,12** |
| La clave `brandia-vercel-gate` (la de `.env.local` en la compu de Rodrigo) | 71 | 1,50 |

**La causa principal: una pantalla que se recargaba sola.** Lo dice el commit de Eze `e93e95e` (16:01): *una página que se recargaba sola pidió más de 1.000 veces las direcciones*. Las cuentas cierran:

- Cada pedido de direcciones a Sonnet cuesta unos USD 0,045 (unos 2.400 tokens de entrada y unos 4.000 de salida contando lo que "piensa").
- 1.000 a 1.100 pedidos × USD 0,045 ≈ **USD 45 a 50**: **dos tercios de todo el gasto**.
- El pedido promedio de Sonnet del día (2.800 tokens de entrada) se parece mucho a uno de direcciones, otra señal de que la mayoría fueron esos.
- El resto (unos USD 25) es el trabajo normal del día: pruebas de las entrevistas, unas 29 identidades (29 pedidos a Opus, uno por identidad), logos y feeds simples con Recraft, y unos 5 lotes de contenidos con fotos.

Eze ya lo frenó (commits `e93e95e` y `0379be6`): tope de pedidos por minuto por paso, la IA deja de generar si la persona se va de la página, y las pantallas que arrancan solas no arrancan más de 3 veces en 2 minutos. También sumó el panel `/costos` (commit `875c02c`), que etiqueta cada llamada por paso: desde ahora el Gateway puede separar el gasto por paso, algo que hasta las 15:40 no se podía.

**Dos cosas que corrigen las estimaciones de abajo:**

1. **Sonnet "piensa" antes de responder, y eso se cobra como salida.** Fueron 2,06 millones de tokens, USD 20,6, casi un tercio de lo de Sonnet. Las salidas de la tabla del punto 2 no lo incluían: hay que sumarles más o menos un 60 %.
2. **Las fotos de GPT Image 2 salen baratas:** USD 0,67 por 59 fotos, **USD 0,011 por foto**. Las 10 fotos de un lote cuestan unos USD 0,11, no hasta 1,90 como estimaba el punto 4.1.

Con esas dos correcciones, **un cliente completo cuesta alrededor de USD 0,90** (no 0,75).

## 1. Precios (del Gateway, hoy)

| Modelo | Para qué | Entrada | Salida |
|---|---|---|---|
| Claude Sonnet 5.5 | Casi todo el texto | USD 2 por millón de tokens | USD 10 por millón |
| Claude Opus 5.5 | Solo el isotipo SVG de la identidad | USD 4 por millón | USD 20 por millón |
| Claude Haiku 5.5 | Agente de voz (vía ElevenLabs) y el "cliente simulado" de las pruebas | USD 0,10 por millón | USD 0,50 por millón |
| Recraft v4.1 | Los 3 logos dibujados | USD 0,035 por imagen (0,08 si es vectorial) | |
| GPT Image 2 | Fotos del feed y respaldo del logo | USD 5 por millón | USD 30 por millón (de tokens de imagen) |

Un token es un pedacito de palabra: en español, unos 3,3 caracteres.

## 2. Costo por paso

| # | Paso (ruta) | Modelo | Tokens entrada | Tokens salida | USD aprox. |
|---|---|---|---|---|---|
| A1 | Entrevista por chat (`/api/entrevista`), ~5 turnos | Sonnet | ~14.500 | ~2.000 | **0,05** |
| A1v | Entrevista por voz, llamada de 5 min (ElevenLabs + Haiku) | — | — | — | **0,40 a 0,50** (a confirmar en ElevenLabs) |
| A1v | Ficha de la voz (`/api/voz/ficha`) | Sonnet | ~2.800 | ~1.000 | 0,02 |
| A2 | 3 direcciones visuales (`/api/direcciones`) | Sonnet | ~2.400 | ~2.500 | **0,03** |
| A3 | Identidad: textos del brandbook (`/api/identidad`) | Sonnet | ~3.500 | ~3.000 | 0,04 |
| A3 | Identidad: isotipo SVG | **Opus** | ~2.400 | ~1.500 | 0,04 |
| A4 | Logos: 3 ideas (`/api/logo`) | Sonnet | ~2.300 | ~1.200 | 0,02 |
| A4 | Logos: 3 dibujos | Recraft | — | — | 0,11 |
| | **Módulo A, marca completa (por chat)** | | | | **≈ 0,28** |
| B | Lote de contenidos, solo texto (`/api/contenidos/lote`): plan + 6 piezas + correcciones | Sonnet | ~25.000 | ~8.000 | **0,15 a 0,18** (medido) |
| B | Lote: 9 a 11 fotos 1024×1536 | GPT Image 2 | — | — | **0,10 a 1,90** (ver punto 4.1) |
| B | "Otra versión" de una pieza (`/api/contenidos/pieza`) | Sonnet | ~3.000 | ~800 | 0,015 |
| B | Una foto suelta (`/api/contenidos/imagen`) | GPT Image 2 | — | — | 0,01 a 0,19 |
| B* | Feed simple, el que se retira (`/api/contenidos`) | Sonnet + Recraft | | | 0,29 (medido) |
| W1 | Entrevista de la web (`/api/web/entrevista`), ~5 turnos | Sonnet | ~16.000 | ~1.800 | **0,05** |
| W2 | Armar la web (`/api/web/armar`) | Sonnet | ~3.000 | ~2.500 | **0,03** |
| W3 | Cada cambio por chat (`/api/web/cambio`) | Sonnet | ~5.500 | ~3.000 | **0,04 por cambio** |

## 3. Costo por iteración (un cliente de punta a punta)

| Recorrido | USD |
|---|---|
| Marca completa por chat (A1 a A4) | 0,28 |
| + Contenidos con fotos, si las fotos salen baratas | + 0,25 |
| + Web con 3 cambios (W1 + W2 + 3 × W3) | + 0,20 |
| **Total, un cliente completo** | **≈ 0,75** |
| Lo mismo con entrevista por voz en vez de chat | ≈ 1,20 |
| Con lo que "piensa" Sonnet y el costo real de las fotos (punto 0b) | ≈ 0,90 |

Para el finde: 10 ensayos + 10 pruebas del jurado ≈ **USD 20** (con la corrección del punto 0b). Lo que de verdad dispara el gasto es una pantalla que repite pedidos sola: eso costó USD 45 a 50 en una tarde.

## 4. Hallazgos y qué conviene hacer

1. **Las fotos: resuelto con datos reales.** `contenidos/imagen.ts` no fija la calidad de GPT Image 2, pero el Gateway muestra que cada foto costó USD 0,011. No hace falta tocarlo.
2. **El Gateway quedó en negativo (punto 0).** Lo más urgente de todo.
3. **Las entrevistas reenvían todo en cada turno.** En cada respuesta vuelven a viajar las instrucciones, el molde de la ficha (~1.300 tokens) y toda la charla. Es la mitad del costo de A1 y W1. Se puede activar la caché de Anthropic (pagar 10 % por lo repetido), pero ahorra ~USD 0,03 por cliente: **no vale la pena antes de la demo**.
4. **Opus para el isotipo cuesta el doble que Sonnet**, pero son USD 0,04: si el logo sale mejor, dejarlo.
5. **Cada cambio de la web reescribe la web entera** (por eso la salida es grande). A USD 0,04 por cambio está bien para la demo; más adelante, devolver solo lo que cambia.
6. **Solo el lote de contenidos informa su costo** (`uso` en el evento `fin`). Las demás rutas no lo anotan. Para el pitch ("una marca completa cuesta X centavos") conviene sumar el costo del Gateway en cada respuesta.
7. **Reintentos:** `conReintento` vuelve a llamar si falla; en un fallo, ese paso cuesta el doble. No cambia el promedio.
8. **El feed simple se retira** (decisión del 17/10). Cuando se borre, desaparece un gasto de USD 0,29 por uso.
9. **Las pruebas sin pantalla gastan de verdad:** `probar-contenidos.ts` con 3 negocios y fotos cuesta unos USD 2 a 6 por corrida. Usar `--solo=` para probar con uno.

## 5. Para el pitch

> Una marca completa (entrevista, tres direcciones, brandbook y logos) le cuesta a BrandIA unos **28 centavos de dólar** de IA. Con el mes de contenidos y la web, menos de **un dólar** por cliente.

(Confirmar con el panel de Vercel después de cargar crédito y correr un cliente completo.)
