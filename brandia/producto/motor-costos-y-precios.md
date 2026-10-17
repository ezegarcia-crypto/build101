---
documento: Motor v1 · costo real por marca y base para fijar precios
version: 0.1 · borrador
fecha: 2026-10-06
autor: Ezequiel García (con Claude)
estado: borrador para revisar con Juan Pedro y Rodrigo
reemplaza_en_parte: /03-projects/00-plataforma/docs/2026-09-23_ARQUITECTURA-APP.md § 10 (precios de API actualizados)
relacionado: /02-departments/finance/PENDIENTES-PRECIOS.md · /02-departments/finance/outputs/drafts/2026-08-28_costos-y-unit-economics.md
---

# Motor v1 · cuánto cuesta generar una marca y cómo llegamos a un precio

## En corto

1. **No hace falta la app entera para saber cuánto cuesta una marca.** Hace falta el **motor**:
   el encadenamiento brief → prompt maestro → logos → sistema → manual, corriendo como script y
   registrando el costo de cada llamada. Se arma en 3–5 días y se prueba con **marcas reales**.
2. **Estimación de escritorio (precios de API al 06/10):** ≈ **USD 1,20 por marca** en el caso base
   y ≈ **USD 2–5,50** con un cliente detallista. Cifra de planificación: **USD 3 por marca pagada.**
3. **El costo que más pesa no es la marca que se vende: es la vista previa gratis** de los que no
   compran. Con 5 % de conversión, cada venta carga ≈ USD 7,70 de vistas previas ajenas.
4. **Los precios no los fija el costo de IA** (es chico en cualquier escenario). Los fijan la
   disposición a pagar (la lista de espera la está midiendo), la competencia y el costo de
   adquirir al cliente.
5. **Todo lo de abajo es estimación.** Los números de verdad salen del banco de pruebas con
   ejemplos reales (§ 4). Hasta entonces, nada de esto se publica.

## 1. Precios de API usados (consultados el 06/10/2026)

| Servicio | Uso en el motor | Precio |
|---|---|---|
| Claude Sonnet 5.5 (Anthropic) | Entrevista, estrategia, logos en SVG, sistema, manual | USD 2 / millón de tokens de entrada · USD 10 / millón de salida · lectura de caché USD 0,20 |
| Claude Opus 5.5 (Anthropic) | Opción de mayor calidad para estratega y logos | USD 4 / USD 20 por millón (el doble que Sonnet) |
| Claude Haiku 4.5 (Anthropic) | Revisor automático (contraste, legibilidad, ortografía) | USD 1 / USD 5 por millón |
| Recraft V4.1 Vector | Alternativa para logos en vector nativo | USD 0,088 por imagen (Pro Vector: USD 0,33) |
| Recraft V4.1 / Flash (raster) + vectorizado | Exploración barata y vectorizado de finalistas | USD 0,035 / USD 0,007 por imagen · vectorizar USD 0,011 |
| GPT Image 2 (OpenAI) o FLUX.2 pro (fal.ai) | Imágenes de aplicación y piezas de redes | ≈ USD 0,03–0,05 por imagen |
| Mercado Pago Uruguay | Cobro | **Sin confirmar.** Se usa 4,87 % efectivo (3,99 % + IVA) del análisis de agosto |

Cambios respecto de septiembre: Sonnet bajó de USD 3/15 a USD 2/10; Recraft pasó a V4.1
(vector a USD 0,088, antes 0,055 en § 10 de la arquitectura); GPT Image 1 se apaga el 23/10 y
GPT Image 1.5 el 1/12, así que si usamos OpenAI va GPT Image 2.

## 2. Costo por marca (identidad, capa 1)

Supuestos: entrevista de 8 turnos, 12 caminos de logo, 3 rondas de ajustes, manual armado sobre
plantilla (la IA escribe el contenido, el PDF se renderiza sin IA), mockups de productos sobre
plantilla (costo cero), 3 imágenes de aplicación.

| Paso | Cómo | USD |
|---|---|---|
| Entrevista (brief) | Sonnet, con caché del prompt de sistema | 0,08 |
| Prompt maestro | Sonnet | 0,07 |
| 12 caminos de logo | Claude dibuja SVG (3 tandas de 4) | 0,48 |
| 3 rondas de ajustes | Claude sobre el SVG elegido | 0,23 |
| Sistema: paleta, tipografía, voz | Sonnet | 0,08 |
| Contenido del manual | Sonnet → plantilla PDF | 0,12 |
| 3 imágenes de aplicación | GPT Image 2 / FLUX | 0,12 |
| Revisor automático | Haiku 4.5 con las imágenes renderizadas | 0,03 |
| Almacenamiento y cómputo | Supabase | 0,02 |
| **Total caso base · logos con Claude** | | **≈ 1,22** |
| Total caso base · logos con Recraft Vector | 24 imágenes vector en vez de SVG de Claude | ≈ 2,63 |
| Cliente detallista · logos con Claude | 24 caminos + 8 rondas | ≈ 2,08 |
| Cliente detallista · logos con Recraft | 24 caminos + 20 ajustes vector | ≈ 5,44 |
| Si estratega y logos van con Opus 5.5 | | ≈ × 1,5 sobre el total |

**Cifra de planificación: USD 3 por marca pagada**, con tope de regeneraciones incluido en el
producto (propuesta de agosto: hasta 30 caminos y 3 rondas; más allá, se pasa a suscripción).

### La vista previa gratis

Si antes de pagar la persona ve entrevista + prompt maestro + 6 logos, eso cuesta ≈ USD 0,38 a
cada visitante que no compra. Cargado sobre cada venta:

| Conversión de vista previa a pago | Costo de vistas previas por venta |
|---|---|
| 5 % | USD 7,66 |
| 10 % | USD 3,83 |
| 20 % | USD 1,91 |

Esto responde en parte la pregunta abierta del 23/9 («qué ve el cliente antes de pagar»):
**la vista previa tiene que ser corta y con tope** (una por mail verificado, pocos logos, en
baja resolución o con marca de agua), y el resto del sistema se genera después del pago.

**Costo de IA por venta para calcular precios: USD 10** (3 de la marca + ≈ 7 de vistas previas,
escenario conservador del 5 %).

## 3. Costo de la suscripción (capa 2)

Cada pieza: copy con Sonnet (≈ USD 0,01) + 2 imágenes candidatas (≈ USD 0,08) + composición
sobre plantilla con la marca (sin IA). ≈ **USD 0,09 por pieza**. Con un 50 % extra por
regeneraciones y el calendario editorial del mes:

| Pack mensual (ejemplo para discutir) | Costo de IA por mes |
|---|---|
| 12 piezas (posts de feed) | ≈ USD 1,70 |
| 30 piezas (posts + historias + carruseles) | ≈ USD 4,10 |

**Queda afuera el video generado.** Cuesta de USD 0,05 a 0,50 por segundo según el modelo: un
reel de 15 s puede costar más que el pack entero. Si entra, va como agregado aparte y con precio
propio.

## 4. Banco de pruebas con ejemplos reales

Los números de §§ 2 y 3 son de escritorio. Para tener los reales hay que correr el motor con
marcas reales y medir. Propuesta:

**Qué se construye (3–5 días).** Un script en TypeScript (la misma base que la app futura, así
no se tira nada) que recibe un brief y produce: prompt maestro, 12 logos SVG, paleta con
contrastes verificados, par tipográfico, voz y manual en HTML/PDF. Cada llamada a una API queda
anotada con modelo, tokens o imágenes, costo en USD y duración. El código vive en GitHub,
fuera de Drive (regla del § 2 de la arquitectura).

**Con qué marcas (12 briefs reales, variados a propósito):**

| # | Quién | Para qué |
|---|---|---|
| 3 | Un proyecto real de cada socio | Calibrar el flujo y los prompts |
| 3 | Panel experto del piloto | Que auditen calidad y encaje con el cliente |
| 4–6 | Emprendedores reales: conocidos o anotados en la lista de espera que marcaron «quiero probarla antes» | El cliente de verdad: sin conocimiento de diseño |
| 1–2 | Casos de rebranding (ya tienen marca) | El paso inicial que se decidió el 25/9 |

**Qué se mide en cada marca:**

- Costo total y por paso (sale solo del registro).
- Cantidad de regeneraciones hasta quedar conforme.
- Tiempo total de la persona en el flujo.
- Calidad del logo y del sistema, de 1 a 5, puntuada por el panel con una rúbrica fija.
- «¿Pagarías por esto? ¿Cuánto?» a la persona dueña de la marca.

**Comparación de logos.** Los mismos 12 briefs se corren con Claude dibujando SVG y con Recraft
V4.1 Vector. Gana el que el panel puntúe mejor; si empatan, el más barato.

**Presupuesto del banco de pruebas: USD 60–100** (12 marcas × 2 métodos × varias corridas
mientras se ajustan los prompts). Tope de gasto en la consola de Anthropic y créditos chicos
prepagos en Recraft.

**Cómo se decide después:**

| Resultado | Lectura |
|---|---|
| Costo promedio ≤ USD 3 y el 90 % de las marcas ≤ USD 6 | La estimación se sostiene: los precios se fijan por valor, no por costo |
| Costo promedio > USD 6 | Revisar dónde se va (casi seguro, regeneraciones) y bajar topes antes de fijar precio |
| Calidad promedio < 3,5 según el panel | El problema no es el precio: es el producto. No se lanza |

## 5. Precios: escenarios para discutir (no son una propuesta cerrada)

Supuestos: precio con IVA incluido (a confirmar con el contador), comisión de cobro 4,87 %,
costo de IA de USD 10 por venta de identidad, y para la suscripción el pack más USD 0,50 de
infraestructura por cliente.

**Identidad (pago único):**

| Precio | Neto sin IVA | Comisión | Contribución | % del neto |
|---|---|---|---|---|
| USD 39 | 31,97 | 1,90 | 20,07 | 63 % |
| USD 49 | 40,16 | 2,39 | 27,78 | 69 % |
| USD 59 | 48,36 | 2,87 | 35,49 | 73 % |
| USD 79 | 64,75 | 3,85 | 50,91 | 79 % |

**Suscripción (mensual):**

| Precio | Pack | Contribución | % del neto |
|---|---|---|---|
| USD 19 | 12 piezas | 12,45 | 80 % |
| USD 29 | 30 piezas | 17,76 | 75 % |
| USD 39 | 30 piezas | 25,47 | 80 % |

**Costos fijos de la plataforma:** ≈ USD 65/mes (Supabase Pro 25, Vercel Pro 20, Workspace,
dominio) + ≈ USD 30 de pruebas y demos. Se cubren con 3 identidades a USD 59, o con 6–8
suscripciones, por mes.

**Lectura:** cualquier precio de la tabla deja margen bruto sano. Lo que define cuál elegir es:

- **Disposición a pagar:** la lista de espera pregunta < 50 / 50–100 / 100–200 / > 200. Si ≥ 40 %
  dice 50 o más, la franja USD 49–59 está respaldada.
- **Competencia:** Looka y similares fijan la expectativa en ≈ USD 60 por logo; BrandIA entrega el
  sistema completo y el puente al marketplace.
- **Costo de adquirir al cliente:** con USD 35 de contribución a USD 59, conseguir al cliente no
  puede costar más que eso si no pasa a suscripción. La pauta de la lista de espera da el primer dato.

## 6. Orden de trabajo propuesto

| Paso | Qué | Quién | Depende de |
|---|---|---|---|
| 1 | Cuenta de API de Anthropic con tope de gasto (USD 100) y créditos en Recraft (USD 10–20) | Ezequiel | — |
| 2 | Repo en GitHub y motor v1 en script, con registro de costos | Ezequiel (con Claude) | 1 |
| 3 | Juntar los 12 briefs reales y la rúbrica de calidad | Juan Pedro y Rodrigo | — (en paralelo con 2) |
| 4 | Correr el banco de pruebas y comparar Claude vs. Recraft | Los tres + panel | 2 y 3 |
| 5 | Fijar precios con costo real + lista de espera | Los tres | 4 y datos de la pauta |
| 6 | Envolver el motor en la app (Next.js + Supabase + Mercado Pago sandbox) | Ezequiel (con Claude) | 4 |

El plan de 10 días del 23/9 sigue sin arrancar (las cuentas de GitHub y Supabase siguen
pendientes en `PENDIENTES-PLATAFORMA.md`). Este orden lo reemplaza en la parte de costos:
primero el motor y la medición, después las pantallas.

## Fuentes

- Claude: precios de la API de Anthropic (Sonnet 5.5, Opus 5.5, Haiku 4.5), referencia vigente al 25/09/2026.
- Recraft: [recraft.ai/pricing?tab=api](https://www.recraft.ai/pricing?tab=api), consultado el 06/10/2026.
- OpenAI GPT Image: [pricepertoken.com/gpt-image-pricing](https://pricepertoken.com/gpt-image-pricing) y [aireiter.com · GPT Image 2](https://aireiter.com/blog/gpt-image-2-api-pricing) (fuentes secundarias; confirmar en openai.com antes de decidir).
- FLUX e Ideogram en fal.ai: [costbench.com · Flux vs Ideogram](https://costbench.com/compare/flux-vs-ideogram/) e [invideo.io · AI image model pricing](https://invideo.io/blog/ai-image-model-pricing/) (fuentes secundarias).
- Mercado Pago Uruguay: no se encontró la tarifa pública vigente; se usa la del análisis del 28/08. **Pedirla por escrito.**
- Cálculos: estimaciones de tokens por paso hechas con criterio propio, no medidas. Las corrige el banco de pruebas.
