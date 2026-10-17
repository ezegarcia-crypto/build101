# Plan del finde · BrandIA en build 101

Qué construimos y en qué orden. El alcance está en `CLAUDE.md` → "El producto: BrandIA".

**La regla:** primero que ande la parte 1 de punta a punta, después la 2 y recién después la 3. Un flujo chico que funciona suma más que muchos a medias: la rúbrica no da puntos por cantidad de funciones.

## Ahora · antes de programar (todos juntos, 1 hora)

1. Confirmar con un mentor: si el repo tiene que ser público y qué créditos o claves de IA da el evento.
2. Elegir las piezas de IA (ver "Decisiones pendientes") y conseguir las claves. Van en `.env.local` y en Vercel, nunca en el repo.
3. Copiar al repo el esqueleto de la web que ya está probado (ver "Sábado: arranque" en `CLAUDE.md`) y publicarlo en Vercel.
4. Abrir el link en el celular. Cada persona: `git pull` y su propia rama.

## Reparto (a confirmar)

| Persona | Parte | Qué hace |
|---|---|---|
| 1 · Pantallas y diseño | Todo lo que se ve | El recorrido de la app, la pantalla del brandbook, el feed, las pantallas "en construcción" (newsletter, web, BranderIA). Después, la demo y el pitch |
| 2 · La IA | El motor | La entrevista por chat que arma la ficha de la marca (partiendo de `brandia/motor-ia/`), la identidad, el agente de voz y los contenidos |
| 3 · Datos, pruebas e integración | Que todo ande junto | Guardar las marcas generadas, la publicación, probar con marcas distintas de Costa y juntar las ramas en `main` |

## Hitos

| Cuándo | Está terminado cuando… |
|---|---|
| Sábado 15:00 | La entrevista por chat genera la ficha de una marca nueva (no Costa) |
| Sábado 18:00 | Con esa ficha sale la identidad completa: paleta, tipografías, logo y brandbook en pantalla |
| Sábado 20:30 | El agente de voz hace la entrevista. Se dejan 2 o 3 agentes en la nube con tareas chicas |
| Domingo 11:00 | Sale el feed: un par de posteos, historias y un reel con la marca aplicada |
| Domingo 12:00 | Las pantallas "en construcción" de newsletter, web y BranderIA están hechas |
| Domingo 13:00 | Se congela. Ensayo 3 veces, video de respaldo y pitch de 3 minutos |

## Decisiones pendientes

- **Modelo de texto** para entrevista, identidad y textos: Claude (Sonnet u Opus). Depende de los créditos.
- **Voz:** agente de voz de ElevenLabs (natural, con voces en español). Depende de los créditos.
- **Imágenes** para logo, posteos y merch: modelo de imágenes por API (a elegir según los créditos).
- **Reel:** la opción más segura es armarlo con imágenes generadas, textos animados y voz en off, en vez de un modelo de video (más caro y lento).
- **Publicar en redes:** Zernio (una sola conexión para Instagram, Facebook, TikTok; gratis para 2 cuentas). Opcional, para el final.

## Herramientas que nos recomendaron

| Herramienta | ¿La usamos? | Por qué |
|---|---|---|
| n8n | No | Es otra plataforma para aprender y conectar, y otro lugar donde puede fallar la demo. Los pasos de la IA viven adentro de la app |
| v0 de Vercel | Solo para pantallas | Dibuja pantallas rápido con lo mismo que usamos (Next.js y shadcn). No sirve para la IA ni para la lógica |
| Zernio | Opcional, al final | Publica y programa posteos en varias redes desde una sola conexión. También tiene publicidad paga |
| Try Halo | A definir | No la pudimos identificar: falta el link |
