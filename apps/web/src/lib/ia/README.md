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

## 2. Contenidos (módulo B): plan, piezas e imágenes con la marca

**Ruta principal:** `POST /api/contenidos/lote`. Todo el detalle (pasos, eventos, cómo dibujar las
piezas en pantalla, tiempos y costos) en `contenidos/README.md`.

Entra la ficha (`Brief`) más la identidad (`Identidad`, contrato en `identidad.ts`), y sale el
plan del mes y las piezas (posteos, carrusel, historias y reel), cada una dibujada en SVG con la
marca del cliente por `componerPieza`.

## Lo que viene

- La identidad: con la ficha, Claude Opus genera estrategia, voz, paleta, tipografías y logo. Tiene que devolver, como mínimo, el formato de `identidad.ts`: es lo que necesitan los contenidos.
- La voz: el agente de ElevenLabs hace la misma entrevista hablando y termina en la misma ficha.
