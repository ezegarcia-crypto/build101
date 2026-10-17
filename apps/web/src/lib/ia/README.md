# La IA de BrandIA · cómo se conecta desde las pantallas

Esta carpeta la mantiene Eze (rama `ia`). Las pantallas solo la usan, no la cambian.

## 1. Entrevista por chat → ficha de la marca

**Ruta:** `POST /api/entrevista`, en `apps/web/src/app/api/entrevista/route.ts`.

En la pantalla se usa `useChat` de `@ai-sdk/react` (ya instalado):

```tsx
"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { Brief } from "@/lib/ia/brief";

const { messages, sendMessage, status } = useChat({
  transport: new DefaultChatTransport({ api: "/api/entrevista" }),
});
```

- La persona escribe primero. Un buen arranque en pantalla, fijo, es: "Contame tu negocio como se lo contarías a un amigo".
- Las respuestas de BrandIA llegan en partes de tipo `text`. Pueden traer listas numeradas y **negritas** en formato Markdown.
- **La ficha:** cuando la persona confirma el resumen, en el último mensaje de BrandIA aparece una parte de tipo `"tool-terminar_entrevista"`. Cuando su `state` es `"input-available"` o `"output-available"`, la ficha está en `part.input`, con el tipo `Brief` de `brief.ts`. Ahí se pasa a la pantalla siguiente (la generación de la identidad).
- **Tiempos medidos:** cada respuesta tarda de 3 a 8 segundos; el cierre con la ficha, unos 15. Mientras `status` sea `"submitted"` o `"streaming"`, mostrá un mensaje de progreso animado (ver `equipo/design-system.md`).
- Prueba de punta a punta sin pantalla: con la web corriendo, `node --env-file=.env.local scripts/probar-entrevista.mjs`. Simula 3 clientes distintos y muestra las fichas.

## 2. Tres direcciones visuales para elegir

**Ruta:** `POST /api/direcciones` con `{ brief }` (la ficha del paso 1). Devuelve JSON (no es un chat):

```ts
const r = await fetch("/api/direcciones", { method: "POST", body: JSON.stringify({ brief }) });
const { direcciones } = await r.json(); // 3: A (la esperada), B (la vecina), C (la que se anima)
```

Cada dirección (tipo `Direccion` de `direcciones.ts`) trae `nombre`, `idea` (una frase para el cliente), `palabras`, `paleta` (4 a 6 colores con `hex`, `nombre` y `rol`), `tipografias` (de Google Fonts), `formas`, `logo_sugerido` y, si la marca no tenía nombre, `nombre_marca`. Es lo que se muestra para que la persona elija. **Tarda unos 30 segundos.**

## 3. La identidad de la dirección elegida

**Ruta:** `POST /api/identidad` con `{ brief, direccion }` (la dirección que eligió la persona, tal cual vino). Devuelve `{ identidad }`:

- `nombre`, `eslogan`
- `esencia`: idea, propósito, promesa, posicionamiento, público y valores
- `voz`: resumen, rasgos (qué es y qué no es), palabras sí y no, y ejemplos (bio de Instagram, posteo, respuesta a un cliente, cartel)
- `estilo`: uso de colores, fotografía e íconos
- `brandbook`: introducción, usos correctos e incorrectos, aplicaciones
- `paleta` (ya con el contraste corregido si hacía falta) y `tipografias` (`titulos` y `texto`)
- `fuentes_url`: el link de Google Fonts. En la pantalla: `<link rel="stylesheet" href={identidad.fuentes_url} />` y después `font-family` con esos nombres
- `logo.isotipo_svg`: el símbolo en SVG (viewBox 100×100), ya limpio y seguro. Se muestra con `dangerouslySetInnerHTML`. El nombre se compone al lado con la tipografía de títulos
- `comprobaciones`: lista de `{ que, ok, detalle }` (contraste del texto, color principal, tipografías y logo). **Mostrarlas en el brandbook**: son la prueba de calidad que pide la rúbrica

**Tarda unos 30 segundos** (textos y logo se generan en paralelo). Mostrá progreso animado mientras tanto.

Prueba sin pantalla: `node scripts/probar-identidad.mjs salida.html [resultado-entrevistas.json]`. Genera 3 marcas fijas (más las de las entrevistas si se las pasás) y arma una página para mirarlas. La última corrida está en `equipo/identidades-de-prueba.html`.

## 4. Logos completos (símbolo + nombre)

**Ruta:** `POST /api/logo` con `{ brief, direccion }` (lo hizo la sesión "Logo de la marca generado con IA"; código en `logo.ts`). Devuelve `{ propuestas }`: 3 logos, el primero del tipo que sugiere la dirección. Cada uno trae `tipo`, `concepto` (para mostrarle al cliente), `colores`, `imagen` (una data URL lista para `<img src>`, 1024×1024, fondo blanco) y `pedido` (el texto en inglés que se le mandó a Recraft, para entender de dónde sale cada dibujo; no se muestra al cliente). Claude piensa las ideas y Recraft las dibuja; si Recraft falla, GPT Image. **Tarda unos 25 segundos.** Van al brandbook y al feed; el isotipo SVG de la identidad sirve para aplicar en todos lados.

Prueba sin pantalla: `node scripts/probar-logo.mjs`.

## 5. La entrevista por voz (lo hizo la sesión "Agente de voz de ElevenLabs para la entrevista")

- `GET /api/voz` devuelve `{ signedUrl }` para conectar la pantalla con el agente de ElevenLabs (`@elevenlabs/react`, ya instalado). La clave queda en el servidor.
- Cuando termina la llamada: `POST /api/voz/ficha` con `{ transcripcion: [{ rol: "usuario" | "agente", texto }] }` → `{ ficha }`, **la misma ficha que la entrevista por chat**. Probado: unos 5 segundos.
- El prompt del agente está en `voz.ts`. Se sube a ElevenLabs con `scripts/crear-agente-voz.ts`.
- **Falta para que hable de verdad:** `ELEVENLABS_API_KEY` y `ELEVENLABS_AGENT_ID` en `.env.local` y en Vercel (las saca Eze), y correr el script.
- `/api/voz/prueba`: página de prueba solo para desarrollo. En la web publicada no existe.

## 6. Contenidos · el motor elegido · `POST /api/contenidos/lote`

**Ruta principal:** `POST /api/contenidos/lote` con `{ brief, identidad }`: la ficha del paso 1 y la
identidad del paso 3, tal cual vinieron. Sale el plan del mes y las piezas (posteos, carrusel, historias y
reel), cada una dibujada en SVG con la marca del cliente por `componerPieza`. Todo el detalle (pasos,
eventos, cómo dibujar las piezas en pantalla, tiempos y costos) en `contenidos/README.md`.

**Es el motor elegido para el módulo B (decidido el 17/10).** Desde las pantallas: `POST /api/contenidos/lote` y `componerPieza` de `@/lib/ia/contenidos/componer`, como explica `contenidos/README.md`.

## 7. Lo que gasta la IA · panel `/costos`

**Panel del equipo:** `/costos` (en la web publicada, https://build101-bice.vercel.app/costos). Muestra el saldo del Gateway, lo gastado hoy, cuánto cuesta en promedio cada paso (y una marca completa), el gasto por modelo y por día, y una calculadora de margen para pensar precios. No tiene links desde la app y no lo indexan los buscadores.

**Toda ruta nueva que use IA tiene que anotarse**, si no su gasto aparece como "sin paso" (`gastos.ts`):

1. Sumá el paso a `PASOS`, en `gastos.ts`.
2. Envolvé la ruta: `export const POST = medir("mi-paso", async (req: Request) => { ... });`
3. En cada llamada a la IA: `providerOptions: etiquetar()`, o `etiquetar({ openai: {...} })` si ya tenía opciones.

No hace falta base de datos: el Gateway guarda el costo de cada llamada con esas etiquetas, y el panel se las pide.
