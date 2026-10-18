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
| Claude Haiku 5.5 | El "cliente simulado" de las pruebas | USD 0,10 por millón | USD 0,50 por millón |
| Recraft v4.1 | Los 3 logos dibujados | USD 0,035 por imagen (0,08 si es vectorial) | |
| GPT Image 2 | Fotos del feed y respaldo del logo | USD 5 por millón | USD 30 por millón (de tokens de imagen) |

Un token es un pedacito de palabra: en español, unos 3,3 caracteres.

## 2. Costo por paso

| # | Paso (ruta) | Modelo | Tokens entrada | Tokens salida | USD aprox. |
|---|---|---|---|---|---|
| A1 | Entrevista por chat (`/api/entrevista`), ~5 turnos | Sonnet | ~14.500 | ~2.000 | **0,05** |
| A1a | Audios pasados a texto (`/api/transcribir`, ElevenLabs Scribe) | — | — | — | Unos 19 créditos de ElevenLabs por minuto de audio (medido el 17/10). Salen de la suscripción, no del Gateway: se ven en `/costos` |
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
| Si cuenta su negocio con audios | + los créditos de ElevenLabs de esos minutos (ver `/costos`) |
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

> Una marca completa (entrevista, tres direcciones, brandbook y logos) le cuesta a BrandIA unos **34 centavos de dólar** de IA (ver punto 6). Con el mes de contenidos y la web, menos de **un dólar** por cliente.

(Confirmar con el panel de Vercel después de cargar crédito y correr un cliente completo.)


## 6. Costo de crear cada marca, con los precios reales

Hecho el sábado 17/10 a las 16:40, con el código de `main` al día (que ya trae el paso de nombres). Usa los precios del punto 1 y lo que mostró el reporte real del punto 0b:

- **Sonnet "piensa" además de responder:** por cada 100 tokens de salida, suma unos 59 tokens de razonamiento que se cobran igual (dato real del día: 2,06 M de razonamiento sobre 3,52 M de salida).
- **Opus (isotipo):** USD 0,052 por pedido, promedio real de 29 pedidos.
- **Recraft (logos):** USD 0,034 por imagen, promedio real de 177 imágenes.

Todavía no hay datos reales por paso: el etiquetado de Eze (`/costos`) entró a las 15:40 y desde entonces no hubo pedidos, porque el Gateway sigue en negativo. Los tokens de cada paso son los estimados del punto 2.

### Paso a paso

| # | Paso | Modelo | Tokens entrada | Salida + razonamiento | USD |
|---|---|---|---|---|---|
| 1 | Entrevista por chat (~5 turnos) | Sonnet | 14.500 | 2.000 + 1.200 | 0,061 |
| 2 | Nombres, 5 propuestas (solo si no tiene nombre; cada vuelta extra, lo mismo) | Sonnet | 2.000 | 800 + 500 | 0,017 |
| 3 | 3 direcciones visuales | Sonnet | 2.400 | 2.500 + 1.500 | 0,045 |
| 4 | Identidad: textos del brandbook | Sonnet | 3.500 | 3.000 + 1.800 | 0,055 |
| 5 | Identidad: isotipo SVG | Opus | 2.800 | 1.100 + 900 | 0,052 |
| 6 | Logos: 3 ideas | Sonnet | 2.300 | 1.200 + 700 | 0,024 |
| 7 | Logos: 3 dibujos | Recraft | — | — | 0,102 |
| | **Marca completa por chat, con nombre propio** | | **≈ 27.500** | **≈ 17.000** | **≈ 0,34** |

### Según cómo la arme cada persona

| Caso | Qué cambia | USD por marca |
|---|---|---|
| Ya tiene nombre, entrevista por chat | Lo de la tabla | **0,34** |
| Sin nombre, pide 2 vueltas de nombres | + 2 × 0,017 | **0,37** |
| Cambia de dirección después de ver la identidad | + identidad y logos otra vez (pasos 4 a 7) | **0,57** |
| Cuenta su negocio con audios en vez de escribir | La entrevista es la misma; se suman unos 19 créditos de ElevenLabs por minuto de audio | **0,34** + los créditos de los audios |
| Falla un paso y se reintenta | Ese paso se paga dos veces | + 0,02 a 0,10 |

### Dónde se va la plata de una marca (caso base, USD 0,34)

| Qué | USD | % |
|---|---|---|
| Dibujos de los logos (Recraft) | 0,102 | 30 % |
| Textos con Sonnet: entrevista, direcciones, brandbook e ideas de logos | 0,185 | 55 % |
| ↳ de eso, solo lo que Sonnet "piensa" | ≈ 0,05 | ≈ 15 % |
| Isotipo con Opus | 0,052 | 15 % |

**Para comparar:** el loop de recargas del 17/10 (≈ USD 45 a 50) equivale a unas **140 marcas completas**.

**Si hubiera que bajar el costo** (no hace falta para la demo):
1. Pedir 2 logos en vez de 3: −0,034.
2. Hacer el isotipo con Sonnet en vez de Opus: −0,025, si la calidad aguanta.
3. Bajar el razonamiento de Sonnet en los pasos simples (nombres, ideas de logos): hasta −0,02.

## 7. Precio unitario total de cada marca (marca + contenidos + web)

Mismo criterio que el punto 6: precios reales, razonamiento de Sonnet incluido (+59 % sobre la salida), fotos a USD 0,011 y logos a USD 0,034. El texto de los contenidos usa el costo medido por el Gateway (USD 0,15 a 0,18; se toma 0,165).

### Desglose completo de un cliente (caso base)

| Módulo | Paso | Modelo | USD |
|---|---|---|---|
| **A · Marca** | Entrevista por chat (~5 turnos) | Sonnet | 0,061 |
| | 3 direcciones visuales | Sonnet | 0,045 |
| | Textos del brandbook | Sonnet | 0,055 |
| | Isotipo SVG | Opus | 0,052 |
| | 3 ideas de logo | Sonnet | 0,024 |
| | 3 dibujos de logo | Recraft | 0,102 |
| | *Subtotal marca* | | ***0,34*** |
| **B · Contenidos** | Plan del mes + 6 piezas + correcciones (medido) | Sonnet | 0,165 |
| | ~10 fotos del feed | GPT Image 2 | 0,110 |
| | *Subtotal contenidos* | | ***0,28*** |
| **Web del cliente** | Entrevista de la web (~5 turnos) | Sonnet | 0,061 |
| | Armar la web | Sonnet | 0,046 |
| | 3 cambios por chat (0,059 cada uno) | Sonnet | 0,176 |
| | *Subtotal web* | | ***0,28*** |
| | **Total por cliente** | | **≈ USD 0,90** |

### Por combinación

| Lo que se lleva el cliente | USD |
|---|---|
| Solo la marca | 0,34 |
| Marca + web, sin cambios | 0,45 |
| Marca + web con 3 cambios | 0,62 |
| Marca + contenidos | 0,62 |
| **Marca + contenidos + web con 3 cambios** | **0,90** |
| Lo mismo, contando con audios | 0,90 + los créditos de ElevenLabs de esos minutos |
| Uso intenso: 2 vueltas de nombres, cambia de dirección, 5 cambios en la web y 2 "otra versión" de piezas | ≈ 1,35 |

### Lo que suma cada cosa extra

| Extra | USD |
|---|---|
| Una vuelta más de nombres | + 0,017 |
| Cambiar de dirección (identidad y logos otra vez) | + 0,23 |
| Un cambio más en la web | + 0,059 |
| "Otra versión" de una pieza, con su foto | + 0,03 |
| Contar el negocio con audios | + unos 19 créditos de ElevenLabs por minuto de audio |

### Qué no está incluido

- **Dominio de la web:** está "en construcción". Un `.com` cuesta unos USD 10 a 15 por año y un `.com.uy` se confirma con NIC.uy. Es un costo por año, no de IA.
- **Búsqueda de competencia y chequeo de dominios** de la web: todavía no están hechos; cuando entren, suman.
- **Publicar la web, Vercel y el plan de ElevenLabs:** son costos fijos del servicio, no por cliente.
- **Reintentos por fallas:** cuando un paso falla, se paga dos veces (+ 0,02 a 0,10 cada vez).

### Para el pitch

> Cada cliente, con su marca, su mes de contenidos y su web, le cuesta a BrandIA menos de **un dólar** de IA. Solo la marca: **34 centavos**.

## 8. Nueva auditoría, con costos reales por paso (sábado 17/10, 19:15)

Código al día: `main` mergeado en `web-cliente`. Desde la auditoría anterior cambiaron cosas que tocan el costo:

- **Se fue el agente de voz.** La entrevista es por chat, escrita o con audios que ElevenLabs Scribe pasa a texto (`/api/transcribir`, hasta 3 minutos por audio). Ya no hay costo por minuto de llamada.
- **La web del cliente tiene fotos generadas** con la marca (`/api/web/foto`, GPT Image 2, 1536×1024), una por sección que la pide.
- **BranderIA funciona:** la IA pone la marca en 12 productos (`/api/branderia`), una foto por producto.
- **La web se publica** (`/api/web/publicar`, página `/w/[slug]` con link y QR). Ese paso no usa IA.
- **Eze etiqueta cada llamada por paso** (`lib/ia/gastos.ts`). Por eso esta vez los números son **reales**, del Gateway (reporte agrupado por corrida), y no estimados.

### Saldo y gasto total

| | USD |
|---|---|
| Saldo del Gateway | **30,74** (ya se cargó crédito) |
| Gastado en total, todo el 17/10 | 81,09 (2.428 pedidos) |
| Gastado desde la auditoría anterior (16:00) | 6,47 |
| ↳ de la app, etiquetado por paso | 5,38 en 100 corridas |
| ↳ sin etiqueta (scripts de prueba y llamadas sueltas) | ≈ 1,09 |

No hubo otro loop: el gasto nuevo es el normal de probar la app.

### Costo real por paso

| Módulo | Paso | Corridas medidas | USD por corrida (real) | Lo que estimé antes |
|---|---|---|---|---|
| A | Entrevista por chat (conversación) | 10 | **0,048** | 0,061 |
| A | Nombres, 5 propuestas | 10 | **0,028** | 0,017 |
| A | 3 direcciones | 11 | **0,040** | 0,045 |
| A | Identidad (textos + isotipo con Opus) | 10 | **0,087** | 0,107 |
| A | 3 logos (ideas + dibujos) | 8 | **0,133** | 0,126 |
| B | Lote de contenidos con fotos | 5 | **0,288** | 0,275 |
| Web | Entrevista de la web (conversación) | 4 | 0,020 (1,5 turnos en promedio; ≈ 0,013 por turno) | 0,061 |
| Web | Armar la web | 4 | **0,020** | 0,046 |
| Web | Un cambio por chat | 4 | **0,037** | 0,059 |
| Web | Una foto de la web | 6 | **0,009** | — |
| C | Una foto de producto de BranderIA | 24 | **0,016** | — |

Qué se aprende:

- **La web sale más barata de lo estimado:** armarla y cambiarla casi no "piensa" (armar: 0 tokens de razonamiento).
- **Nombres sale más caro:** Sonnet piensa el doble de lo que escribe (15.600 tokens de razonamiento contra 7.400 de salida).
- **El logo es el paso más caro de la marca** (0,133), por los 3 dibujos de Recraft.
- Las pruebas de la entrevista de la web fueron cortas. Para una conversación completa de ~5 turnos se toma 0,013 × 5 ≈ 0,067.

### Precio unitario por cliente, con datos reales

| Módulo | Paso | USD |
|---|---|---|
| **A · Marca** | Entrevista por chat | 0,048 |
| | Nombres (1 vuelta; si ya tiene nombre, 0) | 0,028 |
| | 3 direcciones | 0,040 |
| | Identidad y brandbook | 0,087 |
| | 3 logos | 0,133 |
| | *Subtotal marca* | ***0,34*** |
| **B · Contenidos** | Lote: plan, 6 piezas y ~10 fotos | ***0,29*** |
| **Web** | Entrevista de la web (~5 turnos) | 0,067 |
| | Armar la web | 0,020 |
| | 3 cambios por chat | 0,111 |
| | ~4 fotos de las secciones | 0,036 |
| | *Subtotal web* | ***0,23*** |
| **C · BranderIA** | 12 fotos de productos con la marca | ***0,19*** |
| | **Total por cliente, los tres módulos y la web** | **≈ USD 1,05** |

| Lo que se lleva el cliente | USD |
|---|---|
| Solo la marca (ya tiene nombre) | 0,31 |
| Solo la marca (sin nombre) | 0,34 |
| Marca + web con 3 cambios | 0,57 |
| Marca + contenidos + web | 0,86 |
| **Marca + contenidos + web + BranderIA** | **1,05** |
| Cada cambio más en la web | + 0,037 |
| Cambiar de dirección (identidad y logos otra vez) | + 0,22 |
| Cada audio de la entrevista (hasta 3 min, ElevenLabs Scribe) | + ≈ 0,01 a 0,02 (a confirmar en ElevenLabs; no pasa por el Gateway) |

**No incluye:** el dominio de la web (USD 10 a 15 por año, "en construcción"), los costos fijos de Vercel y ElevenLabs, ni los reintentos cuando falla un paso.

### Para el pitch (actualizado)

> Con datos reales: cada cliente, con su marca, su mes de contenidos, su web y sus productos con la marca, le cuesta a BrandIA **alrededor de un dólar** de IA. Solo la marca: **34 centavos**.
