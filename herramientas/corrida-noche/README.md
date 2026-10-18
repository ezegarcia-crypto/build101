# Corrida de noche · un video por caso

Recorre BrandIA solo, de punta a punta, con cada caso de `equipo/casos-demo.md`, y graba un video de cada uno.

- **Dónde corre:** en https://app.brandiamos.com, en un Chrome escondido (Chromium de Playwright).
- **Quién escribe:** otra IA hace de cliente. Arranca con los mensajes del caso y contesta lo que pregunta BrandIA con la ficha del personaje. Usa la misma clave del AI Gateway que la app (`apps/web/.env.local`).
- **Qué elige:** lo de "Qué elige en cada pantalla" de cada caso.
- **El recorrido:** entrevista → nombre (se queda el suyo) → camino → logo → brandbook → estilo del feed → feed (los datos "a confirmar" van como "No va") → BranderIA (agrega lo que falta, arma el kit y manda el pedido de prueba) → web (entrevista y un cambio por chat). La web no se publica.
- **El pedido de BranderIA** se guarda de verdad, con el nombre `PRUEBA NOCHE · <caso>`. El WhatsApp se cierra sin mandar nada. Al otro día, marcarlo como cancelado en `/pedidos`. Para no mandarlo, usá `--sin-pedido`.

Los casos se leen de `equipo/casos-demo.md`: si se cambia un caso ahí, la corrida lo toma sola. **Nada de esto va en la app**: los casos son solo para ensayar.

## Sin cortes, con portada y con WhatsApp real (18/10)

- **Cada video arranca en la portada:** la recorre entera (todas las animaciones) y aprieta "¿BrandIAmos?".
- **Sin límites:** con `CLAVE_EQUIPO=<contraseña de /costos de esa app>`, antes de grabar entra a `/costos` y el
  navegador queda como del equipo (sin prueba gratis ni tope diario). Si un caso se traba, se reintenta una vez.
- **El estilo del feed** sale del caso ("Estilo del feed | **Editorial**").
- **WhatsApp real:** `node correr.mjs --vincular-whatsapp` abre WhatsApp Web para escanear el QR una vez (la
  sesión queda en `perfil/`, fuera de git). Después, `--whatsapp` manda el mensaje del pedido de verdad al número
  de `WHATSAPP_BRANDIA` y graba ese momento en `whatsapp.webm`, dentro de la carpeta del caso.
- **La IA:** usa `AI_GATEWAY_API_KEY` o, si no está, el `VERCEL_OIDC_TOKEN` de `apps/web/.env.local`, que vence a
  las 12 horas de bajarlo con `vercel env pull`.

## Cómo correrlo

La primera vez, en esta carpeta (instala Playwright y su Chromium, unos 150 MB, solo en la compu):

```bash
cd ~/Proyectos/build101/herramientas/corrida-noche && npm install --workspaces=false && npx playwright install chromium
```

Para dejar los tres casos corriendo de noche, sin que la compu se duerma (`caffeinate` la mantiene despierta mientras corre):

```bash
cd ~/Proyectos/build101/herramientas/corrida-noche && caffeinate -i node correr.mjs
```

- Un solo caso: `node correr.mjs postrein` (o `frio`, `bañado`).
- Para mirar cómo lo hace: `node correr.mjs postrein --ver` abre la ventana.
- La compu tiene que quedar **enchufada y con la tapa abierta**.

Cada caso tarda entre 15 y 30 minutos (las fotos y el feed son lo que más tarda).

## Qué queda

En `salida/<fecha-hora>/` (fuera de git):

- `registro.txt`: qué hizo en cada paso, qué contestó el cliente y qué eligió.
- Una carpeta por caso con **el video** (`postrein.webm`, en tamaño computadora: 1440 × 900) y una captura de cada pantalla (`1-ficha.png`, `2c-marca.png`, `3b-feed.png`…).
- Si un caso se traba, sigue con el siguiente. El video de ese caso queda como `-incompleto.webm`, con una captura `error.png` de dónde quedó.

Lo que generó la IA también queda en `/pruebas` de la app, como cualquier prueba.

## Para el pitch

- El video tiene las esperas reales de la IA: hay que **acelerar o cortar** las esperas antes de mostrarlo. Se abre con QuickTime o se edita en iMovie o CapCut (aceptan `.webm`; si alguno no lo abre, pasarlo a `.mp4` con cualquier conversor).
- No se ve el puntero del mouse: los clics se notan porque la pantalla cambia.
- Las capturas `.png` están en buena calidad y sirven para las diapositivas.
