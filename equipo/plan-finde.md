# Plan del finde · BrandIA en build 101

Qué construimos y en qué orden. El alcance está en `CLAUDE.md` → "El producto: BrandIA".

**La regla:** primero que ande la parte 1 de punta a punta, después la 2 y recién después la 3. Un flujo chico que funciona suma más que muchos a medias: la rúbrica no da puntos por cantidad de funciones.

## Hecho (sábado a la mañana)

- Consigna leída, material de BrandIA en `brandia/`, repo público y organizador invitado.
- Web publicada en Vercel (https://build101-bice.vercel.app); `app.brandiamos.com` en camino (falta el registro en GoDaddy).
- Design system de BrandIA cargado en la app y la web original como portada. **Guía obligatoria: `equipo/design-system.md`.**
- Decidido: la IA va por Vercel AI Gateway (texto, imágenes y video) y la voz por ElevenLabs.

## Reparto (confirmado)

Cada uno en su rama y en sus carpetas: dos agentes nunca tocan los mismos archivos. Para instalar algo nuevo, avisarle a Eze.

| Quién | Rama | Parte | Toca solo | Qué hace |
|---|---|---|---|---|
| **Juan Pedro** | `pantallas` | Todo lo que se ve | `apps/web/src/app/crear/` y `apps/web/src/components/` | El recorrido de la app: entrevista (chat y botón de voz), brandbook y feed, con el diseño de la web original. Después, la demo y el pitch |
| **Eze** | `ia` | El motor | `apps/web/src/lib/ia/` y `apps/web/src/app/api/` | La entrevista que arma la ficha de la marca (partiendo de `brandia/motor-ia/`), la identidad, el agente de voz y los contenidos. Junta las ramas en `main` |
| **Rodrigo** | `pruebas` | Pruebas y pantallas en construcción | `pruebas/` y `apps/web/src/app/crear/proximamente/` | 5 negocios inventados bien distintos para probar (no Costa) y las pantallas "en construcción" del módulo B (pauta en Meta, newsletter, LinkedIn, X, redes centralizadas y web) y de BranderIA (producimos y te mandamos) |

**Datos de ejemplo:** sirven para dibujar pantallas mientras se desarrolla, pero en la demo todo sale de la IA. Antes de presentar se borran.

## Hitos

| Cuándo | Está terminado cuando… |
|---|---|
| Sábado 15:00 | La entrevista por chat genera la ficha de una marca nueva (no Costa) |
| Sábado 18:00 | Con esa ficha sale la identidad completa: paleta, tipografías, logo y brandbook en pantalla |
| Sábado 20:30 | El agente de voz hace la entrevista. Se dejan 2 o 3 agentes en la nube con tareas chicas |
| Domingo 11:00 | Sale el feed: un par de posteos, historias y un reel con la marca aplicada |
| Domingo 12:00 | Las pantallas "en construcción" del módulo B y de BranderIA están hechas |
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
