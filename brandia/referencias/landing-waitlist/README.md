---
documento: Campaña de lista de espera · validación con pauta en Meta
version: v1 · borrador (2026-10-06)
owner: Ezequiel García (con Claude)
estado: borrador para revisión de los tres socios — nada publicado
---

# Campaña de lista de espera · octubre 2026

**Para qué.** Antes de terminar la plataforma, medir si hay demanda real: mandar pauta de Meta
a una landing simple, juntar una lista de espera y aprender quién se anota, qué quiere resolver
y cuánto pagaría. Idea sugerida por un conocido que vende productos con IA; los socios la toman
como el paso siguiente (ver `/DECISIONES.md`, 2026-10-06).

**Qué responde.** Las tres preguntas que el análisis de mercado dejó abiertas
(`/06-knowledge/estrategia/2026-08-31_analisis-de-mercado-y-foda.md` § 2.2):
1. ¿Cuánto cuesta conseguir a alguien interesado? (CPL: costo por anotado)
2. ¿Quién es? (etapa, si ya tiene marca, qué quiere resolver primero)
3. ¿Cuánto pagaría? (rango de precio declarado; insumo para `/02-departments/finance/PENDIENTES-PRECIOS.md`)

**Para verla:** borrador publicado como página privada en https://claude.ai/artifact/8EqnjAh4EAA4kTdJ71u9Sq
(se comparte desde el menú Share; el formulario todavía no guarda datos). El archivo fuente es `landing/index.html`.

## Qué hay en esta carpeta

| Archivo | Qué es |
|---|---|
| `landing/index.html` | La landing. Un solo HTML, sin librerías, pensado primero para celular. Ver § Landing |
| `landing/supabase-waitlist.sql` | Las dos tablas del formulario en Supabase, con seguridad (la web solo puede insertar) |
| `plan-pauta-meta.md` | Público, segmentación, estructura de campaña, presupuesto, métricas y reglas de decisión |
| `anuncios-y-cinematicas.md` | Ángulos, copys listos para cargar, piezas estáticas y guiones de las cinemáticas |

## Landing

**Por qué no la web v3.** La web v3 (`/03-projects/00-plataforma/outputs/drafts/web-v3/`) es una
experiencia inmersiva para recorrer con calma. A la landing se llega desde un anuncio, en el
celular, y se decide en segundos: una sola acción (anotarse), el formulario arriba de todo y la
explicación en una demo de 28 segundos, en los mismos 4 pasos que la página.

**Intro «¿BrandIAmos?» (agregada el 2026-10-06 a pedido de Ezequiel).** Al abrir, la misma
escena del héroe de la web v3: el tablero de referencias de Costa (colores, palabras, fotos,
tipografías) vuela y se arma en la B de módulos —casillas leídas del SVG del logo v2—, las dos
piezas encastran (grafito arriba, naranja abajo) y aparece «¿BrandIAmos?». Después se abre la
landing. En la v3 avanza con el scroll; acá corre sola, **≈ 4 segundos**.
- **Se saltea** tocando la pantalla, con el botón «Saltar», con la rueda o con cualquier tecla.
- **Una vez por visita** (si vuelve a la página en la misma sesión, entra directo).
- Sin animación para quien tiene activado «reducir movimiento». Sin WebGL, versión liviana: la B
  se encastra sola en 2,4 s.
- **Para apagarla:** `INTRO_ON=false` en el `<head>`, o `?intro=0` en la URL de un anuncio.
  **Para volver a verla al revisar:** `?intro=1`.
- Costo: suma Three.js (≈ 150 KB comprimido, desde cdnjs) y unos segundos antes del formulario.
  Si en la pauta la conversión de la landing queda por debajo de lo esperado, la primera prueba
  es apagarla en la mitad de los anuncios (`?intro=0`) y comparar.

**Recorrido.** Intro de la B → **primero el video** «Así va a funcionar» (en celular y en
escritorio, pedido de Ezequiel) → abajo el claim, la bajada y el formulario de mail → cómo va a
funcionar en 4 pasos → BranderIA (productos) → ni agencia ni plantilla → para quién es →
preguntas → cierre naranja con el formulario otra vez. La barra fija «Anotarme» queda visible
mientras el formulario no está en pantalla.

**El video (demo animada, v3 del 2026-10-06).** Cuenta el **flujo real de la plataforma**, en los
mismos 5 pasos de la sección «Cómo va a funcionar», con Costa (la panadería de ejemplo del manual):
1. **Contanos qué hacés** — unas preguntas simples (qué hacés, para quién, cómo querés que se sienta).
   La persona **no sube referencias ni Pinterest**: cuenta, y BrandIA propone.
2. **Elegí tu logo** — BrandIA muestra ideas con el porqué de cada una; la persona elige.
3. **Paleta y tipografía** — sugeridas; la persona elige o propone algo distinto («Sugerir otra»).
4. **Descargá tu marca** — logo, manual y plantillas.
5. **Producí en BranderIA** — productos con la marca aplicada y cantidades; **le llegan a quien
   contrata BrandIA**, no a sus clientes. Es una de las dos patas fuertes del negocio.

Cierra con «¿BrandIAmos la tuya?». Arriba tiene pestañas (la activa muestra el nombre; se tocan para
saltar) y cada escena abre con el número y el título grandes. Dura 32 s.
*Historia:* la v1 tenía 7 escenas en 26 s con la explicación afuera; la v2, 4 pasos con referencias
y Pinterest en el paso 1, que no es como funciona el producto (corregido por Ezequiel).

**El formulario en dos pasos.**
1. **Solo el mail.** Es el «Lead» que mide Meta. Mientras menos se pide, más se anotan.
2. **Perfil (opcional, 30 s):** nombre, país, si ya tiene marca (el paso inicial que pidió la
   reunión del 25-09), en qué etapa está, qué quiere resolver primero, **cuánto pagaría** y si
   quiere probarla antes (charla de 20 min + WhatsApp). Esto último recluta la **fase 2 del
   piloto**: gente sin conocimiento de diseño (ver `/04-clients/Piloto/`).

Al final ofrece compartir por WhatsApp (con `utm_source=whatsapp` para medir los referidos).

**Los ángulos se conectan con los anuncios.** Cada anuncio linkea con `?a=<ángulo>` y el título
de la landing repite la promesa del anuncio que la persona acaba de ver:

| `?a=` | Título |
|---|---|
| *(nada)* o `marca` | Que se vea tan bien como lo que hacés. |
| `historia` | Contás qué hacés. Elegís. Tenés marca. |
| `fisico` | Tu marca, de la pantalla a la remera. |
| `velocidad` | Tu marca, sin la espera. |
| `alternativa` | Ni agencia, ni plantilla. |

**Lo que mide (píxel de Meta):** `PageView`, `Lead` (mail), `CompleteRegistration` (perfil),
y como eventos propios `DemoVista`, `DemoCompleta`, `Compartir`. Cada fila guarda UTM, `fbclid`
y ángulo, así se cruza qué anuncio trajo a quién.

**Reglas de marca respetadas.** Logo v2 en curvas (isotipo y logotipo con el +80 d–I), sin
redibujar. Fraunces + Instrument Sans. Naranja nunca como texto sobre claro; botón naranja con
texto grafito. Sin precios. Sin nombres de marcas ajenas en la web (en el formulario tampoco).
Marketplace con su nombre decidido: **BranderIA**.

### Cómo dejarla lista para publicar

Todo se configura en el bloque `CONFIG` al principio del `<script>`:

1. **Base de datos.** Crear el proyecto en Supabase (pendiente de plataforma), correr
   `supabase-waitlist.sql` y pegar `supabaseUrl` y `supabaseAnonKey`. *Alternativa sin Supabase:*
   un webhook de n8n que escriba en una Google Sheet, en `webhookUrl`.
   Mientras no haya ninguno, la página muestra la etiqueta «Demo · formulario sin conectar».
2. **Píxel.** Crear el píxel/dataset en el Administrador de eventos y pegar el ID en `pixelId`.
3. **Video real (opcional).** Si se graba un video, se pone el `.mp4` en `videoUrl` y reemplaza
   a la demo animada. La demo ya cumple el rol de video.
4. **Imagen para compartir (og:image)** de 1200×630 con el logo v2: falta.
5. **Mail de contacto** `hola@brandiamos.com`: figura en la política de privacidad; el correo del
   dominio todavía no está configurado (`/02-departments/legal/PENDIENTES-MARCA.md`).
6. **Texto de privacidad**: borrador, a revisar antes de publicar (Ley 18.331).
7. **Publicarla en `brandiamos.com`** (Vercel, Netlify o GitHub Pages; DNS en GoDaddy). Mientras
   la plataforma no esté, la landing puede ocupar la raíz del dominio.

### Para revisar en la reunión
- [ ] La intro: duración (≈ 4 s) y si va para todos o se prueba con y sin.
- [ ] Copy general y los cinco títulos por ángulo.
- [ ] «Lo que tardás en contarnos tu historia» como tiempo de BrandIA (no compromete un plazo).
- [ ] La pregunta de precio y sus rangos (USD < 50 / 50–100 / 100–200 / > 200).
- [ ] «Coordinamos con quien la produce y te llega» describe bien el marketplace (decisión del
      23-09 todavía en propuesta: BrandIA conecta, no produce).
- [ ] Ofrecer o no condiciones de lanzamiento a la lista. Hoy la landing **no promete descuentos**.
