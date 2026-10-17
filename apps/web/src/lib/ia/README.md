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

## Lo que viene

- La voz: el agente de ElevenLabs hace la misma entrevista hablando y termina en la misma ficha.
