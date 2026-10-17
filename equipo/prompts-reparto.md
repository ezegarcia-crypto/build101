# Prompts para las 3 compus · BORRADOR v2

Un prompt por persona, para pegar en una **conversación nueva** de la app de Claude, abierta en `~/Proyectos/build101`.

**Estado: borrador.** Lo que falta está marcado como `[HUECO X]`. Antes de pegar un prompt, completá sus huecos y borrá las marcas. Si un hueco no se puede completar, dejá la frase que dice qué hacer mientras tanto.

---

## Ya resuelto (sábado, con lo que subió Eze a `main`)

- **La web base** (el esqueleto) ya está en `main` y publicada en **https://build101-bice.vercel.app**. Cada push a `main` se publica solo. Ojo: `build101.vercel.app` es de otra persona.
- **Probar en la compu:** primero `npm install` y después `npm run dev:web`, y abrir http://localhost:3001.
- **Las carpetas:**
  - las páginas van en `apps/web/src/app/` (la de entrada es `/crear`);
  - los componentes de la app, en `apps/web/src/components/`;
  - los componentes visuales compartidos (shadcn) y el design system de BrandIA, en `packages/ui/`;
  - las variables de entorno (las claves) se declaran en `apps/web/.env.schema`.
- **La IA:** el texto, las imágenes y el video van por **Vercel AI Gateway**, con el paquete `ai` (una sola conexión para usar varios modelos). La voz va por **ElevenLabs**, con el paquete `@elevenlabs/react`.
- **La clave del Gateway:** en la compu se baja con `vercel env pull` y queda en `.env.local`, fuera de git. En la web publicada no hace falta.
- **Atención:** el proyecto usa una versión nueva de Next.js. Antes de programar, Claude tiene que leer `apps/web/AGENTS.md`.

## Lo que falta

| Hueco | Qué falta | Quién lo resuelve | Mientras tanto |
|---|---|---|---|
| **[HUECO A]** | Quién es cada persona (1 pantallas, 2 IA, 3 datos e integración) | Los tres, en la reunión de arranque | Sugerencia: la persona 3 es Eze, porque Vercel y Supabase están en su cuenta y además coordina |
| **[HUECO B]** | Qué modelo de texto se usa en el Gateway (Claude Sonnet u Opus) y si hay créditos del evento | Mentor y Eze | Arrancar con Claude Sonnet; cambiarlo es una línea |
| **[HUECO C]** | La clave de ElevenLabs y el agente de voz creado | Eze o la persona 2 | Primero el chat; la voz va recién después de las 18:00 |
| **[HUECO D]** | Cómo consiguen la clave del Gateway Juan Pedro y Rodrigo para probar en su compu: invitarlos al team `ezegb` de Vercel o pasarla por AirDrop | Eze | Probar la IA en el link de prueba que Vercel arma para cada rama |
| **[HUECO E]** | Si el repo tiene que ser público y si hay que sumar al organizador | Mentor | Nada cambia en los prompts |

---

## El contrato entre las tres partes

Para que cada uno pueda avanzar sin esperar a los otros, primero se acuerdan los **formatos de los datos** que van de una parte a otra. Estos formatos son el contrato.

| Formato | Qué tiene | Base | Quién lo escribe |
|---|---|---|---|
| `Ficha` | Lo que sale de la entrevista | `brandia/motor-ia/brief.schema.json` (ya existe) | Persona 2 lo pasa a código (con zod, que ya está instalado) |
| `Identidad` | Nombre y voz, paleta (con contrastes), dos tipografías de Google Fonts, logo en SVG y textos del brandbook | Arquitectura § 5, agentes 2 a 4 | Persona 2 la define en la **primera hora** |
| `Feed` | Posteos, historias y reel, cada uno con su texto, imagen y formato | Plan del finde, parte 2 | Persona 2, antes del domingo |

- **Dónde viven:** en `apps/web/src/lib/contratos/`, una carpeta nueva. Los escribe solo la persona 2; los otros dos los leen pero no los cambian.
- **Ejemplos para trabajar sin IA:** la persona 2 sube un ejemplo de cada formato en `apps/web/src/lib/contratos/ejemplos/`. Sirven para que la persona 1 arme pantallas y la persona 3 arme pruebas sin esperar a la IA.
- **Los ejemplos nunca se muestran en la demo** como si los hubiera generado la IA. La consigna lo prohíbe.

## Quién toca qué archivos

| Persona | Sus archivos | Comparte con aviso |
|---|---|---|
| 1 · Pantallas | `apps/web/src/app/` (menos `api/`), `apps/web/src/components/`, `packages/ui/` | — |
| 2 · IA | `apps/web/src/lib/contratos/`, `apps/web/src/lib/ia/`, `apps/web/src/app/api/ia/` | Suma sus claves a `apps/web/.env.schema` |
| 3 · Datos e integración | `apps/web/src/lib/datos/`, la carpeta de Supabase, las pruebas, `package.json`, `vercel.json` | Junta las ramas en `main` |

---

## Prompt · Persona 1 · Pantallas y diseño

**Quién:** [HUECO A]

```
Soy [HUECO A: nombre], del equipo de build 101. Me toca la parte 1: pantallas y diseño, y después la demo y el pitch. No soy programador: hablame simple, en español rioplatense, de a un paso por vez, y antes de cada comando decime qué hace y para qué.

Antes de nada:
1. Corré git pull en main y leé enteros CLAUDE.md, equipo/plan-finde.md, equipo/kickoff-consigna.md, equipo/prompts-reparto.md y apps/web/AGENTS.md (el proyecto usa una versión nueva de Next.js).
2. Creá mi rama: git switch -c pantallas. Trabajo siempre en esa rama, nunca en main.
3. Corré npm install y npm run dev:web, y abrí http://localhost:3001/crear para ver de dónde arranco.

Qué construyo: todo lo que se ve de BrandIA, a partir de la página /crear. Uso los componentes de packages/ui/ y el design system de BrandIA que ya está ahí (packages/ui/src/styles/globals.css). Como ideas de diseño y textos tengo brandia/referencias/ y brandia/marca/.

Mis archivos: apps/web/src/app/ (menos api/), apps/web/src/components/ y packages/ui/. No toco apps/web/src/lib/ ni apps/web/src/app/api/: son de mis compañeros. Si necesito un cambio ahí, lo anotás en una lista "Pedidos a compañeros" y me la mostrás.

Los datos: las pantallas usan los formatos Ficha, Identidad y Feed de apps/web/src/lib/contratos/. Mientras la IA no esté lista, usá los ejemplos de contratos/ejemplos/, pero nunca los dejes como si fueran el resultado real.

Hitos (cada uno está terminado cuando se ve bien en la compu y en tamaño celular, con captura):
- 15:00 · La pantalla de entrevista por chat está hecha y conectada a la IA de la persona 2 (o lista para conectarla).
- 18:00 · La pantalla del brandbook muestra la identidad completa: nombre y voz, paleta, tipografías y logo.
- 20:30 · El botón "Hablar con BrandIA" abre la entrevista por voz de la persona 2.
- Domingo 11:00 · La pantalla del feed muestra posteos, historias y el reel con la marca aplicada.
- Domingo 12:00 · Las pantallas de newsletter, web y BranderIA (el marketplace de merch) están hechas y marcadas "en construcción". BranderIA muestra ejemplos de productos con la marca de quien la usa.
- Domingo 13:00 · Me ayudás con el pitch de 3 minutos (plantilla en equipo/kit/pitch.md) y el guion de la demo.

Cómo trabajamos:
- Commit cada vez que algo funciona, y push de mi rama. Vercel arma un link de prueba para cada rama: pasámelo. Después avisás que está lista para que la persona 3 la junte con main.
- Nunca subas claves. Nunca escribas a mano un resultado que tiene que generar la IA.
- Antes de decir "listo", probalo en el navegador, también en tamaño celular, y mostrame una captura.
```

---

## Prompt · Persona 2 · La IA

**Quién:** [HUECO A]

```
Soy [HUECO A: nombre], del equipo de build 101. Me toca la parte 2: la IA de BrandIA, que es el corazón del producto. No soy programador: hablame simple, en español rioplatense, de a un paso por vez, y antes de cada comando decime qué hace y para qué.

Antes de nada:
1. Corré git pull en main y leé enteros CLAUDE.md, equipo/plan-finde.md, equipo/kickoff-consigna.md, equipo/prompts-reparto.md, apps/web/AGENTS.md y todo brandia/motor-ia/ (README, los tres prompts y brief.schema.json). Leé también la sección 5 de brandia/producto/arquitectura-app.md.
2. Creá mi rama: git switch -c ia. Trabajo siempre en esa rama, nunca en main.
3. Corré npm install.

Primera hora, antes que nada: definí el contrato. En apps/web/src/lib/contratos/ escribí con zod los formatos Ficha (a partir de brief.schema.json), Identidad y Feed, más un ejemplo de cada uno en contratos/ejemplos/. Hacé commit y push enseguida, y avisá: mis compañeros arrancan con eso.

Qué construyo: los pasos de IA, del lado del servidor (el código que corre en Vercel, no en el navegador), en apps/web/src/lib/ia/ y apps/web/src/app/api/ia/. Los prompts parten de brandia/motor-ia/.

Modelos y claves:
- Todo pasa por Vercel AI Gateway con el paquete ai, que ya está instalado. Texto: [HUECO B: modelo; si no se definió, Claude Sonnet].
- La clave del Gateway: en la web publicada no hace falta. En mi compu, [HUECO D: cómo la consigo]. Si todavía no la tengo, probá en el link de prueba de mi rama.
- Si sumo una clave nueva, la declaro en apps/web/.env.schema (sin el valor) y aviso a la persona 3 para cargarla en Vercel.
- Voz: ElevenLabs, con @elevenlabs/react, que ya está instalado [HUECO C: clave y agente]. Recién después de que funcione el chat.
- Imágenes y video: por el Gateway. El logo sale en SVG (dibujo hecho con código) que escribe el modelo de texto, no un generador de imágenes.

Hitos (cada uno está terminado cuando funciona con una marca inventada en el momento, que no sea Costa, y me mostrás la salida):
- 15:00 · La entrevista por chat hace preguntas en tandas cortas y al final devuelve una Ficha válida. Lo que la persona no contestó va a "huecos", nunca inventado.
- 18:00 · Con la Ficha sale la Identidad: nombre y voz, paleta con contrastes verificados, dos tipografías de Google Fonts y un logo en SVG.
- 20:30 · El agente de voz hace la misma entrevista y devuelve la misma Ficha [HUECO C]. Si no hay clave, queda marcado como pendiente.
- Domingo 11:00 · Sale el Feed: un par de posteos, historias y un reel armado con imágenes, textos animados y voz en off.

Reglas:
- Nada escrito a mano presentado como resultado de la IA: el jurado va a probar con sus propios datos.
- Nunca subas claves: van en .env.local y en Vercel.
- No toco pantallas (apps/web/src/app/ fuera de api/ia/, components/ ni packages/ui/) ni datos: son de mis compañeros. Si necesito algo ahí, lo anotás en "Pedidos a compañeros".
- Commit cada vez que algo funciona, y push de mi rama. Después avisás que está lista para juntarla con main.
- Anotá en un archivo cuánto cuesta cada paso (tokens o dólares), para el pitch.
```

---

## Prompt · Persona 3 · Datos, pruebas e integración

**Quién:** [HUECO A] (sugerencia: Eze)

```
Soy [HUECO A: nombre], del equipo de build 101. Me toca la parte 3: que todo ande junto. Eso es publicar, guardar las marcas, probar y juntar las ramas en main. No soy programador: hablame simple, en español rioplatense, de a un paso por vez, y antes de cada comando decime qué hace y para qué.

Antes de nada:
1. Corré git pull en main y leé enteros CLAUDE.md, equipo/plan-finde.md, equipo/kickoff-consigna.md, equipo/prompts-reparto.md y apps/web/AGENTS.md.
2. Creá mi rama: git switch -c datos.
3. Corré npm install.

Qué construyo:
- Guardar las marcas generadas (Ficha, Identidad y Feed) en Supabase, solo si hace falta para la demo. Cada tabla nace con permisos (RLS: reglas de quién puede ver qué). Mis archivos: apps/web/src/lib/datos/ y la carpeta de Supabase.
- Pruebas automáticas que corren la IA con varias marcas distintas inventadas (ninguna Costa) y comprueban que las salidas respetan los formatos de apps/web/src/lib/contratos/.
- Las claves en Vercel: cuando un compañero declara una clave nueva en apps/web/.env.schema, la cargo en Vercel [HUECO C: la de ElevenLabs]. También resuelvo cómo consiguen Juan Pedro y Rodrigo la clave del Gateway para su compu [HUECO D].
- No toco pantallas ni la IA: son de mis compañeros. Si veo algo para cambiar, lo anotás en "Pedidos a compañeros".

Integración: soy la única persona que junta ramas en main. Cada 1 o 2 horas, de a una rama:
1. Abrí una conversación nueva para la revisión "abogado del diablo": qué falta, qué sobra y qué puede romper la demo.
2. Juntá la rama con main y corré npm run check-types (revisa que el código no tenga errores de tipos) y npm run build.
3. Si algo se rompe, no lo subas: avisá a quien hizo la rama.
4. Si todo anda, push a main (se publica solo en https://build101-bice.vercel.app) y probá el link en el celular.

Hitos (cada uno está terminado cuando funciona en el link publicado, también en el celular):
- Primera hora · Los tres tienen el link de la web, y cada rama tiene su link de prueba en Vercel.
- 15:00 · La entrevista de la persona 2 y la pantalla de la persona 1 andan juntas en main.
- 18:00 · Una marca inventada en el momento llega de la entrevista al brandbook en el link publicado.
- 20:30 · Dejar 2 o 3 agentes en la nube con tareas chicas y claras para la noche.
- Domingo 13:00 · Se congela main. Ensayo 3 veces y grabación del video de respaldo.

Reglas:
- Nunca subas claves: van en .env.local y en las variables de entorno de Vercel.
- main es sagrado: solo entra lo que funciona.
- Antes de decir "listo", probalo en el link publicado y mostrame una captura.
- [HUECO E] Si el mentor confirma que el repo tiene que ser público: antes de cambiarlo, revisá que en el historial de git (todos los cambios guardados, también los viejos) no haya ninguna clave.
```
