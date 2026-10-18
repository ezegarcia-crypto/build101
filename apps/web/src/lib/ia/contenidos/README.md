# Módulo B · los motores de contenido

Esta carpeta la mantiene Eze (rama `contenidos`, después `ia`). Las pantallas la usan, no la cambian.

Con la ficha de la marca (`Brief`, sale de `/api/entrevista`) y la identidad (sale de
`/api/identidad`, módulo A), genera un lote de contenidos para redes: el plan del mes y las piezas escritas con la voz
de la marca, con sus imágenes, y las dibuja con los colores, las tipografías y el logo del cliente.

## La idea: la IA escribe, el motor diseña

| Paso | Archivo | Entra | Sale | IA |
|---|---|---|---|---|
| 0 · Kit | `kit.ts` → `armarKit` | Ficha + identidad del módulo A, tal cual | Lo que los motores necesitan de la marca: voz y trato, mensajes, paleta con roles, tipografías y su link, estilo de foto, isotipo. Si la identidad cambia de forma, solo se toca acá | Sin IA |
| 1 · Registro de formatos | `formatos.ts` | — | Medidas, zona segura, límites y reglas de post, carrusel, historia y reel. Lo leen los prompts, el control y el compositor | — |
| 2 · Planificar | `motor.ts` → `planificar` | Ficha + identidad + mezcla | 3 o 4 pilares propios del negocio y las piezas con idea, objetivo, día y hora | Sonnet 5.5 |
| 3 · Redactar | `motor.ts` → `redactar` | Una pieza del plan | Las ranuras del formato (titular, bajada, láminas, pantallas, escenas…) y la escena de cada imagen | Sonnet 5.5 |
| 4 · Controlar | `control.ts` | La pieza | Observaciones `blocker` o `menor`: largos, cantidades, palabras prohibidas y frases gastadas, trato mezclado (vos/tú/usted), **datos inventados** (precios, porcentajes u horarios que el negocio no dio), una palabra de acento, hashtags, emojis | Sin IA |
| 4b · Corregir | `motor.ts` | Los blocker | Una sola vuelta más al redactor con los problemas anotados. Si sigue mal, la pieza sale `revisar` | Sonnet 5.5 |
| 5 · Imágenes | `imagen.ts` | La escena que escribió el redactor | El prompt con la marca aplicada (estilo de foto, clima de color, lo que nunca aparece, zona libre para el texto, sin texto ni logos) → la imagen | gpt-image-2 |
| 6 · Componer | `componer.ts` (y `componer-editorial.ts`) | Pieza + identidad + imágenes | Un SVG por lienzo (1 post, N láminas, N pantallas, N escenas), en el estilo que eligió la persona | Sin IA |

Reglas que el motor garantiza y no dependen de la IA:

- **La marca del cliente manda en su lienzo** (retirada visual): ni el naranja ni el logo de BrandIA.
- **El logo nunca lo dibuja una IA de imágenes.** El compositor usa el isotipo SVG del módulo A tal cual, con el nombre al lado en la tipografía de títulos (como en el brandbook).
- **Contraste:** si el color de texto o el de acento no se leen sobre el fondo, el compositor elige otro de la paleta (WCAG 4,5 para texto, 3 para el acento).
- **El texto entra siempre:** se achica y se parte en líneas; nunca se corta. Historias y reels respetan 250 px de zona segura arriba y abajo.
- **Nada inventado:** lo que falta va «[a confirmar]» y queda listado en `datos_a_confirmar`.
- **Variación sin azar:** la misma pieza siempre se dibuja igual; piezas distintas varían el encuadre.

Marcado mínimo en los textos de la imagen: `*palabra*` va en el color de acento.

## Estilos de diseño (`estilos.ts`)

La IA escribe igual en todos; cambia cómo se dibuja. **La persona elige el estilo antes de generar**
(en `/crear/contenido`, `components/feed/elegir-estilo.tsx`): ve dos o tres piezas de muestra
compuestas en el momento con su marca (colores, letras, logo), con textos marcados "Ejemplo" y la
foto como una forma de color, sin IA. Así no se gasta en un estilo que no le gusta.

| Estilo | Grilla | Foto | Letra | Color |
|---|---|---|---|---|
| `impacto` (el de siempre, `componer.ts`) | Foto a sangre con un panel sólido arriba o abajo | Ocupa todo el lienzo; el texto va encima en panel o en cajas | Titular fuerte, botón píldora | Fondo de la marca; la última lámina invertida |
| `editorial` (`componer-editorial.ts`) | Papel con mucho aire: arco a la derecha, círculo centrado o píldora en columna | Recortada en una forma; el texto va afuera, en el papel | Titular grande y apretado, etiquetas en mayúsculas espaciadas, filetes, números de lámina calados, el llamado como link subrayado | Las tipográficas alternan papel y tinta (el principal lleno) |

- El estilo viaja como `estilo` en el cuerpo de `POST /api/contenidos/lote` (y `/pieza`), entra al
  kit (`kit.estilo`) y vuelve en el evento `kit`: queda **guardado con el lote** y `componerPieza`
  lo lee de ahí. Sin estilo, es `impacto`. Las pantallas no tienen que pasar nada más.
- En `editorial` el redactor recibe una nota (titular corto, escena con el sujeto centrado) y las
  fotos se piden con el sujeto centrado y aire alrededor, sin zona libre para texto
  (`promptImagen(..., "forma")`), porque se recortan en una forma.
- Para sumar un estilo: agregarlo en `estilos.ts`, dibujarlo en un `componer-<estilo>.ts` con las
  mismas garantías de abajo y despacharlo al principio de `componerPieza`.

## Cómo se usa desde las pantallas

### Todo el lote de una: `POST /api/contenidos/lote`

```ts
const res = await fetch("/api/contenidos/lote", {
  method: "POST",
  headers: { "content-type": "application/json" },
  // brief y identidad tal cual vinieron de /api/entrevista y /api/identidad
  body: JSON.stringify({ brief, identidad, imagenes: true, estilo: "editorial" }), // mezcla opcional: { post: 2, carrusel: 1, historia: 2, reel: 1 } · estilo opcional (estilos.ts)
});
// Responde una línea JSON por evento, apenas cada cosa está lista (NDJSON).
const lector = res.body!.pipeThrough(new TextDecoderStream()).getReader();
let resto = "";
for (;;) {
  const { value, done } = await lector.read();
  if (done) break;
  const lineas = (resto + value).split("\n");
  resto = lineas.pop()!;
  for (const l of lineas) if (l) manejar(JSON.parse(l) as Evento); // Evento, de lib/ia/contenidos/motor
}
```

Eventos, en este orden aproximado:

| `tipo` | Trae | Qué hacer en pantalla |
|---|---|---|
| `kit` | `kit` | Guardarlo: es lo que se le pasa a `componerPieza` |
| `progreso` | `mensaje` | Mostrarlo con la animación de carga |
| `plan` | `plan` (pilares y piezas) | Dibujar el calendario o el feed vacío con sus lugares |
| `pieza` | `pieza` | `componerPieza(pieza, kit)` y mostrar los SVG (sin imágenes todavía, el lugar se pinta con un color de la marca) |
| `imagen` | `pieza`, `clave`, `url` (data URL jpeg) | Guardarla y volver a componer esa pieza con `componerPieza(pieza, kit, imagenesDeEsaPieza)` |
| `error` | `donde`, `mensaje` | Esa pieza o imagen falló; las demás siguen |
| `fin` | `uso` (tokens y USD), `imagenes`, `segundos` | Cerrar la carga |

`componerPieza` (de `@/lib/ia/contenidos/componer`) no usa nada de servidor: se importa directo en
un componente de cliente. Devuelve `[{ clave, svg, ancho, alto, segundos? }]`. Para mostrar el SVG:
`<div dangerouslySetInnerHTML={{ __html: l.svg }} />` con el ancho que quieras (es responsive por
`viewBox`). Las tipografías: cargá en la página `identidad.fuentes_url` (o `kit.fuentes`).

- **Reel:** cada lienzo es una escena con sus `segundos`. La pantalla los pasa en secuencia (con
  la animación que quiera) y muestra `pieza.contenido.ganchos`, `voz_en_off`, `toma` y `musica`
  como el guion. La voz en off con ElevenLabs queda para después.
- **Historias:** el sticker se dibuja como se va a ver; en la red se reemplaza por el real.
- **`estado: "revisar"`** y `observaciones`: mostrarlas junto a la pieza ("revisá esto antes de publicar").
- **`datos_a_confirmar`:** mostrarlos como pendientes del cliente.

### Pasos sueltos

- `POST /api/contenidos/plan` → `{ plan, uso }`. Mismo cuerpo que el lote.
- `POST /api/contenidos/pieza` con `{ brief, identidad, plan, id }` → `{ pieza, uso }`. Para el botón "otra versión".
- `POST /api/contenidos/imagen` con uno de `pieza.imagenes` → `{ clave, url, usd }`.

## Tiempos y costos medidos (17/10, por el Gateway, 3 negocios distintos)

| Qué | Tiempo |
|---|---|
| Plan del mes | ~18 s |
| 6 piezas (2 posts, 1 carrusel, 2 historias, 1 reel), en paralelo | ~30 s después del plan (el reel es la más lenta) |
| 9 a 11 imágenes (gpt-image-2, 1024×1536, jpeg), en paralelo | 10 a 25 s cada una, empiezan apenas sale su pieza |
| **Lote completo con imágenes** | **~70 s** |

Costo del lote que informa el Gateway en `uso.usd` del evento `fin`: USD 0,15 a 0,18 solo texto y
USD ~0,25 con imágenes. Para el pitch conviene confirmar el costo de las imágenes en el panel de Vercel.

## Probar sin pantalla

```bash
npx tsx --tsconfig apps/web/tsconfig.json --env-file=.env.local scripts/probar-contenidos.ts <carpeta> [--imagenes] [--solo=bicis|psicologa|parrilla]
```

Otra IA inventa la ficha de cada negocio (como si saliera de la entrevista) y desde ahí corre lo
real: `/api/direcciones` (elige la A), `/api/identidad` y el lote. Deja, por negocio, `index.html`
(piezas y textos), `galeria.html` (solo las piezas) y `resultado.json`. Solo es banco de prueba.

## Lo que sigue

1. **Juntar con `ia` y después con `main`:** esta rama ya trae el módulo A mergeado y probado junto.
2. **Pantalla del feed** (Juan Pedro): consumir el lote como está arriba. Carrusel 3D de piezas.
3. **Reel con voz en off:** ElevenLabs lee `voz_en_off` de cada escena.
4. **Pauta en Meta, "qué funciona en tu rubro"** (siguiente formato del registro, `FORMATOS_PROXIMOS`):
   buscar en la librería de anuncios (Zernio, España), descartar lo que no es del rubro, sacar
   patrones de gancho, oferta y formato, y pasarlos como contexto al planificador y al redactor.
5. **Memoria por marca:** guardar qué ganchos y piezas aprobó o descartó el cliente y dárselos al
   planificador en el lote siguiente.
