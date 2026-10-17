# Prompts para las 3 compus · BORRADOR

Un prompt por persona, para pegar en una **conversación nueva** de la app de Claude, abierta en `~/Proyectos/build101`.

**Estado: borrador.** Lo que falta está marcado como `[HUECO X]`. Antes de pegar un prompt, completá sus huecos y borrá las marcas. Si un hueco no se puede completar, dejá la frase que dice qué hacer mientras tanto.

---

## Antes de pegar los prompts: qué tiene que estar listo

| Hueco | Qué falta | Quién lo resuelve | Mientras tanto |
|---|---|---|---|
| **[HUECO A]** | Quién es cada persona (1 pantallas, 2 IA, 3 datos e integración) | Los tres, en la reunión de arranque | Sugerencia: la persona 3 es Eze, porque Vercel y Supabase están en su cuenta y además coordina |
| **[HUECO B]** | El esqueleto de la web copiado en `main` y publicado en Vercel (pasos 2 y 4 de "Sábado: arranque" en `CLAUDE.md`) | Persona 3 | Los otros dos leen el material y preparan su parte sin programar |
| **[HUECO C]** | Las rutas reales de las carpetas una vez copiado el esqueleto (abajo se asume `apps/web/src/...`) | Persona 3, al terminar el [HUECO B] | Usar las rutas asumidas |
| **[HUECO D]** | El modelo de texto y su clave (Claude Sonnet u Opus) | Mentor y créditos del evento | La persona 2 deja todo listo para enchufar la clave |
| **[HUECO E]** | La voz (ElevenLabs) y su clave | Mentor y créditos del evento | Primero el chat; la voz va recién después de las 18:00 |
| **[HUECO F]** | El modelo de imágenes y su clave (para los posteos y el reel) | Mentor y créditos del evento | El logo no lo necesita: sale en SVG (dibujo hecho con código) |
| **[HUECO G]** | Si el repo tiene que ser público y si hay que sumar al organizador | Mentor | Nada cambia en los prompts |
| **[HUECO H]** | El link publicado de Vercel | Persona 3, al terminar el [HUECO B] | Probar en la propia compu (`http://localhost:3001`) |

---

## El contrato entre las tres partes

Para que cada uno pueda avanzar sin esperar a los otros, primero se acuerdan los **formatos de los datos** que van de una parte a otra. Estos formatos son el contrato.

| Formato | Qué tiene | Base | Quién lo escribe |
|---|---|---|---|
| `Ficha` | Lo que sale de la entrevista | `brandia/motor-ia/brief.schema.json` (ya existe) | Persona 2 lo pasa a código |
| `Identidad` | Nombre y voz, paleta (con contrastes), dos tipografías de Google Fonts, logo en SVG y textos del brandbook | Arquitectura § 5, agentes 2 a 4 | Persona 2 la define en la **primera hora** |
| `Feed` | Posteos, historias y reel, cada uno con su texto, imagen y formato | Plan del finde, parte 2 | Persona 2, antes del domingo |

- **Dónde viven:** en `apps/web/src/lib/contratos/` [HUECO C]. Los escribe solo la persona 2; los otros dos los leen pero no los cambian.
- **Ejemplos para trabajar sin IA:** la persona 2 sube un ejemplo de cada formato en `apps/web/src/lib/contratos/ejemplos/`. Sirven para que la persona 1 arme pantallas y la persona 3 arme pruebas sin esperar a la IA.
- **Los ejemplos nunca se muestran en la demo** como si los hubiera generado la IA. La consigna lo prohíbe.

---

## Prompt · Persona 1 · Pantallas y diseño

**Quién:** [HUECO A]

```
Soy [HUECO A: nombre], del equipo de build 101. Me toca la parte 1: pantallas y diseño, y después la demo y el pitch. No soy programador: hablame simple, en español rioplatense, de a un paso por vez, y antes de cada comando decime qué hace y para qué.

Antes de nada:
1. Corré git pull en main y leé enteros CLAUDE.md, equipo/plan-finde.md y equipo/kickoff-consigna.md.
2. Creá mi rama: git switch -c pantallas. Trabajo siempre en esa rama, nunca en main.

Qué construyo: todo lo que se ve de BrandIA, usando shadcn (los componentes visuales de la plantilla) y la marca de BrandIA de brandia/marca/tokens.css para la app. Como ideas de diseño y textos tengo brandia/referencias/ (los prototipos y la plataforma web).

Mis archivos: las páginas de apps/web/src/app/ y los componentes de apps/web/src/components/ [HUECO C]. No toco apps/web/src/lib/ia/, apps/web/src/lib/contratos/ ni nada de datos: son de mis compañeros. Si necesito un cambio ahí, lo anotás en una lista "Pedidos a compañeros" y me la mostrás.

Los datos: las pantallas usan los formatos Ficha, Identidad y Feed de apps/web/src/lib/contratos/. Mientras la IA no esté lista, usá los ejemplos de contratos/ejemplos/, pero nunca los dejes como si fueran el resultado real.

Hitos (cada uno está terminado cuando se ve bien en la compu y en tamaño celular, con captura):
- 15:00 · La pantalla de entrevista por chat está hecha y conectada a la IA de la persona 2 (o lista para conectarla).
- 18:00 · La pantalla del brandbook muestra la identidad completa: nombre y voz, paleta, tipografías y logo.
- Domingo 11:00 · La pantalla del feed muestra posteos, historias y el reel con la marca aplicada.
- Domingo 12:00 · Las pantallas de newsletter, web y BranderIA (el marketplace de merch) están hechas y marcadas "en construcción". BranderIA muestra ejemplos de productos con la marca de quien la usa.
- Domingo 13:00 · Me ayudás con el pitch de 3 minutos (plantilla en equipo/kit/pitch.md) y el guion de la demo.

Cómo trabajamos:
- Commit cada vez que algo funciona, y push de mi rama. Después avisás que está lista para que la persona 3 la junte con main.
- Nunca subas claves. Nunca escribas a mano un resultado que tiene que generar la IA.
- Antes de decir "listo", probalo en el navegador, también en tamaño celular, y mostrame una captura.
```

---

## Prompt · Persona 2 · La IA

**Quién:** [HUECO A]

```
Soy [HUECO A: nombre], del equipo de build 101. Me toca la parte 2: la IA de BrandIA, que es el corazón del producto. No soy programador: hablame simple, en español rioplatense, de a un paso por vez, y antes de cada comando decime qué hace y para qué.

Antes de nada:
1. Corré git pull en main y leé enteros CLAUDE.md, equipo/plan-finde.md, equipo/kickoff-consigna.md y todo brandia/motor-ia/ (README, los tres prompts y brief.schema.json). Leé también la sección 5 de brandia/producto/arquitectura-app.md.
2. Creá mi rama: git switch -c ia. Trabajo siempre en esa rama, nunca en main.

Primera hora, antes que nada: definí el contrato. En apps/web/src/lib/contratos/ [HUECO C] escribí los formatos Ficha (a partir de brief.schema.json), Identidad y Feed, más un ejemplo de cada uno en contratos/ejemplos/. Hacé commit y push enseguida, y avisá: mis compañeros arrancan con eso.

Qué construyo: los pasos de IA, del lado del servidor (el código que corre en Vercel, no en el navegador), en apps/web/src/lib/ia/ y apps/web/src/app/api/ia/ [HUECO C]. Los prompts parten de brandia/motor-ia/.

Modelos y claves:
- Texto: [HUECO D: modelo]. La clave va en .env.local con el nombre [HUECO D: nombre de la variable]. Si todavía no la tengo, dejá todo listo para enchufarla y mostrame cómo cargarla.
- Voz: [HUECO E]. Recién después de que funcione el chat.
- Imágenes: [HUECO F]. El logo sale en SVG dibujado por el modelo de texto, no de un generador de imágenes.

Hitos (cada uno está terminado cuando funciona con una marca inventada en el momento, que no sea Costa, y me mostrás la salida):
- 15:00 · La entrevista por chat hace preguntas en tandas cortas y al final devuelve una Ficha válida. Lo que la persona no contestó va a "huecos", nunca inventado.
- 18:00 · Con la Ficha sale la Identidad: nombre y voz, paleta con contrastes verificados, dos tipografías de Google Fonts y un logo en SVG.
- 20:30 · El agente de voz hace la misma entrevista [HUECO E]. Si no hay clave, queda marcado como pendiente.
- Domingo 11:00 · Sale el Feed: un par de posteos, historias y un reel armado con imágenes, textos animados y voz en off.

Reglas:
- Nada escrito a mano presentado como resultado de la IA: el jurado va a probar con sus propios datos.
- Nunca subas claves: van en .env.local y en Vercel. Las paso yo, por AirDrop.
- No toco pantallas (apps/web/src/app/ fuera de api/ia/, ni components/) ni datos: son de mis compañeros. Si necesito algo ahí, lo anotás en "Pedidos a compañeros".
- Commit cada vez que algo funciona, y push de mi rama. Después avisás que está lista para juntarla con main.
- Anotá en un archivo cuánto cuesta cada paso (tokens o dólares), para el pitch.
```

---

## Prompt · Persona 3 · Datos, pruebas e integración

**Quién:** [HUECO A] (sugerencia: Eze)

```
Soy [HUECO A: nombre], del equipo de build 101. Me toca la parte 3: que todo ande junto. Eso es publicar, guardar las marcas, probar y juntar las ramas en main. No soy programador: hablame simple, en español rioplatense, de a un paso por vez, y antes de cada comando decime qué hace y para qué.

Antes de nada:
1. Corré git pull en main y leé enteros CLAUDE.md, equipo/plan-finde.md y equipo/kickoff-consigna.md.
2. Si el esqueleto de la web todavía no está en main [HUECO B], seguí los pasos 2 y 4 de "Sábado: arranque" en CLAUDE.md: copiar el esqueleto del ensayo, comprobar que anda y publicarlo en Vercel. Avisame cuando esté el link [HUECO H] para pasárselo al equipo.
3. Después creá mi rama: git switch -c datos.

Qué construyo:
- Guardar las marcas generadas (Ficha, Identidad y Feed) en Supabase, solo si hace falta para la demo. Cada tabla nace con permisos (RLS: reglas de quién puede ver qué). Mis archivos: apps/web/src/lib/datos/ y la carpeta de Supabase [HUECO C].
- Pruebas automáticas que corren la IA con varias marcas distintas inventadas (ninguna Costa) y comprueban que las salidas respetan los formatos de apps/web/src/lib/contratos/.
- No toco pantallas ni la IA: son de mis compañeros. Si veo algo para cambiar, lo anotás en "Pedidos a compañeros".

Integración: soy la única persona que junta ramas en main. Cada 1 o 2 horas, de a una rama:
1. Abrí una conversación nueva para la revisión "abogado del diablo": qué falta, qué sobra y qué puede romper la demo.
2. Junta la rama con main, corré el lint (el revisor automático de código), las pruebas y npm run build.
3. Si algo se rompe, no lo subas: avisá a quien hizo la rama.
4. Si todo anda, push a main (se publica solo en Vercel) y probá el link en el celular.

Hitos (cada uno está terminado cuando funciona en el link publicado, también en el celular):
- Primera hora · El esqueleto está publicado y los tres pueden abrir el link [HUECO H].
- 15:00 · La entrevista de la persona 2 y la pantalla de la persona 1 andan juntas en main.
- 18:00 · Una marca inventada en el momento llega de la entrevista al brandbook en el link publicado.
- 20:30 · Dejar 2 o 3 agentes en la nube con tareas chicas y claras para la noche.
- Domingo 13:00 · Se congela main. Ensayo 3 veces y grabación del video de respaldo.

Reglas:
- Nunca subas claves: van en .env.local y en las variables de entorno de Vercel.
- main es sagrado: solo entra lo que funciona.
- Antes de decir "listo", probalo en el link publicado y mostrame una captura.
- [HUECO G] Si el mentor confirma que el repo tiene que ser público: antes de cambiarlo, revisá que en el historial de git (todos los cambios guardados, también los viejos) no haya ninguna clave.
```
