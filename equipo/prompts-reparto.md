# Prompts para las 3 compus · v3

Un prompt por persona, para pegar en una **conversación nueva** de la app de Claude, abierta en `~/Proyectos/build101`.

Se basan en el reparto confirmado de `equipo/plan-finde.md`. Si ese plan cambia, manda el plan.

---

## Lo que ya está decidido (sábado 17/10)

- **Reparto:**

  | Quién | Parte | Rama |
  |---|---|---|
  | **Juan Pedro** | Pantallas | `pantallas` |
  | **Eze** | La IA, y junta las ramas en `main` | `ia` |
  | **Rodrigo** | Pruebas y pantallas "en construcción" | `pruebas` |

- **La web publicada:** https://app.brandiamos.com (también responde en https://build101-bice.vercel.app). Cada push a `main` se publica solo. El repo ya es público y el organizador está invitado.
- **Probar en la compu:** primero `npm install` y después `npm run dev:web`, y abrir http://localhost:3001/crear.
- **La IA:** el texto, las imágenes y el video van por **Vercel AI Gateway** (una sola conexión para usar varios modelos). La entrevista usa **Claude Sonnet 5.5** y la identidad va a usar **Claude Opus**. La voz va por **ElevenLabs**.
- **Ya funciona:** la entrevista por chat, que termina en la ficha de la marca. Está en `POST /api/entrevista`, y la ficha tiene el tipo `Brief` de `apps/web/src/lib/ia/brief.ts`. Cómo se usa desde una pantalla: `apps/web/src/lib/ia/README.md`.
- **Guías obligatorias:** `equipo/design-system.md` para cualquier pantalla, y `apps/web/AGENTS.md` antes de programar (el proyecto usa una versión nueva de Next.js).
- **Datos de ejemplo:** sirven para dibujar pantallas mientras se desarrolla, pero en la demo todo sale de la IA. Antes de presentar se borran.

## Lo que falta

| Hueco | Qué falta | Quién lo resuelve | Mientras tanto |
|---|---|---|---|
| **[HUECO D]** | La clave del Gateway en las compus de Juan Pedro y Rodrigo. Sin ella, la IA no anda en su compu: ni la entrevista ni las pruebas. Opciones: invitarlos al team `ezegb` de Vercel (y que corran `vercel env pull`) o pasarles el `.env.local` por AirDrop | Eze | Juan Pedro prueba en el link de prueba que Vercel arma para su rama. Rodrigo arranca por las pantallas "en construcción", que no usan IA |

La clave de ElevenLabs ya no figura como hueco: es parte del trabajo de Eze, y su prompt dice qué hacer si todavía no la tiene.

---

## Prompt · Juan Pedro · Pantallas

```
Soy Juan Pedro, del equipo de build 101. Me toca todo lo que se ve de BrandIA: el recorrido de la app (entrevista por chat y botón de voz, brandbook y feed), y después la demo y el pitch. No soy programador: hablame simple, en español rioplatense, de a un paso por vez, y antes de cada comando decime qué hace y para qué.

Antes de nada:
1. Corré git pull en main y leé enteros CLAUDE.md, equipo/plan-finde.md, equipo/design-system.md, apps/web/src/lib/ia/README.md y apps/web/AGENTS.md.
2. Pasá a mi rama: git switch pantallas (si no existe, git switch -c pantallas). Trabajo siempre ahí, nunca en main.
3. Corré npm install y npm run dev:web. Abrí http://localhost:3001/ (la web original) y http://localhost:3001/crear (de donde arranco), para comparar.

Mis archivos: solo apps/web/src/app/crear/ (menos crear/proximamente/, que es de Rodrigo) y apps/web/src/components/. No toco la IA (apps/web/src/lib/ia/ ni apps/web/src/app/api/: son de Eze) ni las pruebas. Si necesito algo ahí, o instalar algo nuevo, lo anotás en una lista "Pedidos a Eze" y me la mostrás.

Cómo se ve: cada pantalla tiene que parecer parte de la web original, siguiendo equipo/design-system.md al pie de la letra: Fraunces con itálica en la palabra clave, fondo hueso, botones píldora grafito y tarjetas tipo moodboard. Usá los componentes de @build101/ui y los logos de apps/web/public/marca/; no los copies ni los redibujes. Si una pantalla no parece de la misma web, no está terminada.

Hitos (cada uno está terminado cuando se ve bien en la compu y en tamaño celular, con captura):
- 15:00 · La pantalla de entrevista por chat funciona con /api/entrevista, como explica el README de la IA: mensaje de arranque, mensajes con formato, progreso animado mientras BrandIA piensa, y al final la ficha pasa a la pantalla siguiente.
- 18:00 · La pantalla del brandbook muestra la identidad completa que genera Eze: nombre y voz, paleta, tipografías y logo.
- 20:30 · El botón "Hablar con BrandIA" abre la entrevista por voz de Eze.
- Domingo 11:00 · La pantalla del feed muestra posteos, historias y el reel con la marca aplicada.
- Domingo 13:00 · Me ayudás con el pitch de 3 minutos (plantilla en equipo/kit/pitch.md) y el guion de la demo.

Cómo trabajamos:
- Commit cada vez que algo funciona, y push de mi rama. Pasame el link de prueba que Vercel arma para mi rama, y avisá a Eze que está lista para juntarla con main.
- Si la IA no anda en mi compu porque falta la clave, probá en ese link de prueba.
- Nunca subas claves. Nunca escribas a mano un resultado que tiene que generar la IA.
- Antes de decir "listo", probalo en el navegador, también en tamaño celular, y mostrame una captura.
```

---

## Prompt · Eze · La IA e integración

```
Soy Eze. Me toca el motor de BrandIA: la entrevista (ya funciona por chat), la identidad, el agente de voz y los contenidos. Y soy quien junta las ramas en main. Hablame en español rioplatense, simple, de a un paso por vez, y antes de cada comando decime qué hace y para qué.

Antes de nada:
1. Corré git pull en main y leé enteros CLAUDE.md, equipo/plan-finde.md, equipo/prompts-reparto.md, apps/web/src/lib/ia/README.md y apps/web/AGENTS.md.
2. Pasá a mi rama: git switch ia. Trabajo ahí, no en main.

Mis archivos: apps/web/src/lib/ia/ y apps/web/src/app/api/. No toco pantallas (apps/web/src/app/crear/ ni components/: son de Juan Pedro) ni pruebas/ (es de Rodrigo).

Primero, el contrato: antes de programar la identidad, definí en apps/web/src/lib/ia/ los tipos Identidad y Feed (con zod, como brief.ts) y documentalos en el README de la IA, igual que la entrevista. Hacé commit, push y juntalo con main enseguida: Juan Pedro dibuja el brandbook y el feed con eso, y Rodrigo arma las pruebas.

Hitos (cada uno está terminado cuando funciona con una marca inventada en el momento, que no sea Costa, y me mostrás la salida):
- 18:00 · Con la ficha sale la Identidad, con Claude Opus por el Gateway: nombre y voz, paleta con contrastes verificados, dos tipografías de Google Fonts y un logo en SVG dibujado por el modelo (no por un generador de imágenes).
- 20:30 · El agente de ElevenLabs hace la misma entrevista hablando y termina en la misma ficha. Si todavía no tengo la clave de ElevenLabs, decime dónde conseguirla y cómo declararla en apps/web/.env.schema y en Vercel, sin subirla nunca al repo. Ese mismo hito: dejamos 2 o 3 agentes en la nube con tareas chicas y claras.
- Domingo 11:00 · Sale el Feed: un par de posteos, historias y un reel armado con imágenes generadas, textos animados y voz en off.
- Para la pantalla "en construcción" de BranderIA: una ruta que genere las fotos de los productos con la marca del cliente, si llegamos.

Juntar ramas en main, cada 1 o 2 horas y de a una:
1. Abrí una conversación nueva para la revisión "abogado del diablo": qué falta, qué sobra y qué puede romper la demo.
2. Juntá la rama con main, y corré npm run check-types (revisa que el código no tenga errores) y npm run build.
3. Si algo se rompe, no lo subas: avisale a quien hizo la rama.
4. Si todo anda, push a main (se publica solo) y probá https://app.brandiamos.com en el celular.

Pendiente mío que traba a los demás: que Juan Pedro y Rodrigo tengan la clave del Gateway en su compu [HUECO D].

Reglas: nunca subas claves. Nada escrito a mano presentado como resultado de la IA. Anotá cuánto cuesta cada paso (tokens o dólares), para el pitch. Domingo 13:00 se congela main.
```

---

## Prompt · Rodrigo · Pruebas y pantallas en construcción

```
Soy Rodrigo, del equipo de build 101. Me tocan dos cosas: las pruebas de la IA con negocios inventados y las pantallas "en construcción". No soy programador: hablame simple, en español rioplatense, de a un paso por vez, y antes de cada comando decime qué hace y para qué.

Antes de nada:
1. Corré git pull en main y leé enteros CLAUDE.md, equipo/plan-finde.md, equipo/design-system.md, apps/web/src/lib/ia/README.md, equipo/entrevistas-simuladas.md, equipo/flujo-web-cliente.md (si ya está en main) y apps/web/AGENTS.md.
2. Pasá a mi rama: git switch pruebas (si no existe, git switch -c pruebas). Trabajo siempre ahí, nunca en main.
3. Corré npm install y npm run dev:web, y abrí http://localhost:3001/crear.

Mis archivos: solo pruebas/ y apps/web/src/app/crear/proximamente/. No toco el resto de crear/ ni components/ (son de Juan Pedro), ni la IA ni scripts/ (son de Eze). Si necesito algo ahí, o instalar algo nuevo, lo anotás en una lista "Pedidos a Eze o Juan Pedro" y me la mostrás.

Parte 1 · Pantallas "en construcción" (arranco por acá: no necesitan la clave de la IA)
En apps/web/src/app/crear/proximamente/ armá una pantalla por cada cosa que todavía no funciona, siguiendo equipo/design-system.md al pie de la letra. Cada una muestra cómo va a funcionar, con la marca de quien la usa, y dice claramente "en construcción":
- Módulo B: pauta en Meta, newsletter, LinkedIn, X, todas las redes en un solo lugar (con Zernio) y la página web. Para la web, usá el recorrido de equipo/flujo-web-cliente.md.
- BranderIA: BrandIA produce los productos con tu marca y te los manda. Fotos de productos con la marca (si Eze llega con la ruta que las genera) y cómo sería el pedido, sin precios ni pedidos reales.
Está terminado cuando las pantallas se ven bien en la compu y en el celular, parecen parte de la web original, y no muestran nada como si funcionara cuando no funciona. Hito: domingo 12:00.

Parte 2 · Pruebas con 5 negocios inventados
En pruebas/ escribí 5 negocios inventados bien distintos entre sí y distintos a los de equipo/entrevistas-simuladas.md (nada de Costa). Variá:
- el rubro (servicio, producto, online, local);
- el país (Uruguay y Argentina, con "vos"; alguno que trate de "usted");
- el tipo de persona (una que contesta corto o "no sé", otra que manda todo de una);
- si ya tiene marca o arranca de cero.
Cada uno con su personaje y su primer mensaje, como en scripts/probar-entrevista.mjs. Después hacé que se puedan correr contra la entrevista, y más adelante contra la identidad y el feed. Por cada corrida anotá:
- si la ficha salió completa;
- qué quedó como hueco (sin inventar);
- cuánto tardó;
- si algo salió mal o inventado.
Esto necesita la clave del Gateway en mi compu [HUECO D]. Si todavía no la tengo, dejá los 5 negocios escritos y avisame qué le tengo que pedir a Eze.
Está terminado cuando los 5 negocios corrieron de punta a punta y hay un resumen en pruebas/ con lo que anduvo, lo que no y qué le conviene arreglar a Eze. Correlo de nuevo cada vez que Eze junta algo nuevo en main.

Cómo trabajamos:
- Commit cada vez que algo funciona, y push de mi rama. Avisá a Eze que está lista para juntarla con main.
- Nunca subas claves. Los negocios inventados son para probar: nunca se muestran en la demo como si los hubiera generado la IA.
- Antes de decir "listo", probalo en el navegador, también en tamaño celular, y mostrame una captura.
```
