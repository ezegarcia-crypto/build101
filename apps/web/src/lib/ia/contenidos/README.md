# Módulo B · los motores de contenido

Esta carpeta la mantiene Eze (rama `contenidos`, después `ia`). Las pantallas la usan, no la cambian.

Con la ficha de la marca (`Brief`, sale de la entrevista) y la identidad (`Identidad`, sale del
módulo A), genera un lote de contenidos para redes: el plan del mes y las piezas escritas con la voz
de la marca, con sus imágenes, y las dibuja con los colores, las tipografías y el logo del cliente.

## La idea: la IA escribe, el motor diseña

| Paso | Archivo | Entra | Sale | IA |
|---|---|---|---|---|
| 0 · Contrato | `../identidad.ts` | — | Lo mínimo que el módulo A tiene que entregar: voz, paleta con roles, 2 tipografías de Google Fonts, estilo de foto y logo | — |
| 1 · Registro de formatos | `formatos.ts` | — | Medidas, zona segura, límites y reglas de post, carrusel, historia y reel. Lo leen los prompts, el control y el compositor | — |
| 2 · Planificar | `motor.ts` → `planificar` | Ficha + identidad + mezcla | 3 o 4 pilares propios del negocio y las piezas con idea, objetivo, día y hora | Sonnet 5.5 |
| 3 · Redactar | `motor.ts` → `redactar` | Una pieza del plan | Las ranuras del formato (titular, bajada, láminas, pantallas, escenas…) y la escena de cada imagen | Sonnet 5.5 |
| 4 · Controlar | `control.ts` | La pieza | Observaciones `blocker` o `menor`: largos, cantidades, palabras prohibidas y frases gastadas, trato mezclado (vos/tú/usted), **datos inventados** (precios, porcentajes u horarios que el negocio no dio), una palabra de acento, hashtags, emojis | Sin IA |
| 4b · Corregir | `motor.ts` | Los blocker | Una sola vuelta más al redactor con los problemas anotados. Si sigue mal, la pieza sale `revisar` | Sonnet 5.5 |
| 5 · Imágenes | `imagen.ts` | La escena que escribió el redactor | El prompt con la marca aplicada (estilo de foto, clima de color, lo que nunca aparece, zona libre para el texto, sin texto ni logos) → la imagen | gpt-image-2 |
| 6 · Componer | `componer.ts` | Pieza + identidad + imágenes | Un SVG por lienzo (1 post, N láminas, N pantallas, N escenas) | Sin IA |

Reglas que el motor garantiza y no dependen de la IA:

- **La marca del cliente manda en su lienzo** (retirada visual): ni el naranja ni el logo de BrandIA.
- **El logo nunca lo dibuja una IA.** El compositor usa el SVG de la identidad tal cual; si todavía no hay logo, firma con el nombre en su tipografía de títulos.
- **Contraste:** si el color de texto o el de acento no se leen sobre el fondo, el compositor elige otro de la paleta (WCAG 4,5 para texto, 3 para el acento).
- **El texto entra siempre:** se achica y se parte en líneas; nunca se corta. Historias y reels respetan 250 px de zona segura arriba y abajo.
- **Nada inventado:** lo que falta va «[a confirmar]» y queda listado en `datos_a_confirmar`.
- **Variación sin azar:** la misma pieza siempre se dibuja igual; piezas distintas varían el encuadre.

Marcado mínimo en los textos de la imagen: `*palabra*` va en el color de acento.

## Cómo se usa desde las pantallas

### Todo el lote de una: `POST /api/contenidos/lote`

```ts
const res = await fetch("/api/contenidos/lote", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ brief, identidad, imagenes: true }), // mezcla opcional: { post: 2, carrusel: 1, historia: 2, reel: 1 }
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
| `progreso` | `mensaje` | Mostrarlo con la animación de carga |
| `plan` | `plan` (pilares y piezas) | Dibujar el calendario o el feed vacío con sus lugares |
| `pieza` | `pieza` | `componerPieza(pieza, identidad)` y mostrar los SVG (sin imágenes todavía, el lugar se pinta con un color de la marca) |
| `imagen` | `pieza`, `clave`, `url` (data URL jpeg) | Guardarla y volver a componer esa pieza con `componerPieza(pieza, identidad, imagenesDeEsaPieza)` |
| `error` | `donde`, `mensaje` | Esa pieza o imagen falló; las demás siguen |
| `fin` | `uso` (tokens y USD), `imagenes`, `segundos` | Cerrar la carga |

`componerPieza` (de `@/lib/ia/contenidos/componer`) no usa nada de servidor: se importa directo en
un componente de cliente. Devuelve `[{ clave, svg, ancho, alto, segundos? }]`. Para mostrar el SVG:
`<div dangerouslySetInnerHTML={{ __html: l.svg }} />` con el ancho que quieras (es responsive por
`viewBox`). Las tipografías: cargá en la página los links de `urlsGoogleFonts(identidad)`.

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

## Tiempos y costos medidos (17/10, por el Gateway)

| Qué | Tiempo | Costo |
|---|---|---|
| Plan del mes | ~18 s | incluido abajo |
| 6 piezas (2 posts, 1 carrusel, 2 historias, 1 reel), en paralelo | ~30 s después del plan | USD ~0,15 el lote, solo texto |
| Una imagen (gpt-image-2, 1024×1536, jpeg) | 10 a 25 s, en paralelo | se suma en `uso.usd` del evento `fin` |

## Probar sin pantalla

```bash
npx tsx --tsconfig apps/web/tsconfig.json --env-file=.env.local scripts/probar-contenidos.ts <carpeta> [--imagenes] [--solo=bicis|psicologa|parrilla]
```

Como el módulo A todavía no existe, para cada negocio de prueba otra IA inventa la ficha y la
identidad con los formatos reales. Deja, por negocio, `index.html` (piezas + JSON), `galeria.html`
(solo las piezas) y `resultado.json`. Ese banco es solo de prueba: nada de eso entra a la app.

## Lo que sigue

1. **Módulo A:** el motor de identidad tiene que devolver una `Identidad` (ver `../identidad.ts`).
   Con eso, la pantalla encadena entrevista → identidad → `/api/contenidos/lote`.
2. **Pantalla del feed** (Juan Pedro): consumir el lote como está arriba. Carrusel 3D de piezas.
3. **Reel con voz en off:** ElevenLabs lee `voz_en_off` de cada escena.
4. **Pauta en Meta, "qué funciona en tu rubro"** (siguiente formato del registro, `FORMATOS_PROXIMOS`):
   buscar en la librería de anuncios (Zernio, España), descartar lo que no es del rubro, sacar
   patrones de gancho, oferta y formato, y pasarlos como contexto al planificador y al redactor.
5. **Memoria por marca:** guardar qué ganchos y piezas aprobó o descartó el cliente y dárselos al
   planificador en el lote siguiente.
