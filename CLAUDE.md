# CLAUDE.md · Equipo build 101

Contexto para el Claude de cualquiera de los tres integrantes del equipo. Leelo entero antes de ayudar.

## Qué es este repo

Es el repo del equipo para **build 101**, la hackathon de IA de Montevideo (sábado 17 y domingo 18 de octubre de 2026). Cada integrante lo tiene en su compu en `~/Proyectos/build101` y lo abre en la app de Claude.

- **Hasta el kickoff** tiene solo contexto, guías y plantillas, en `equipo/`.
- **Desde el sábado** se construye acá el producto. Cada push a `main` se publica solo en Vercel.

## Quiénes somos y cómo hablarnos

- Equipo de 3, **ninguno es programador** ("vibe coders"): **Eze** (Ezequiel García), **Juan Pedro Portas** y **Rodrigo Portas**, los socios de **BrandIA**. Coordina Eze, que usa Claude Code todos los días.
- **El producto de la hackathon es BrandIA** (decidido el sábado 17/10, después del kickoff). Lo que BrandIA tenía antes (idea, marca, pitch, landing y prototipos sin IA) está en `brandia/`. El producto que funciona se construye acá, durante el evento.
- Hablanos en **español rioplatense** (voseo), simple y sin jerga. Si usás un término técnico, explicalo en la misma frase.
- Pasos cortos y numerados, de a uno. Antes de hacer algo, decí qué vas a hacer y para qué.

## El evento

- **Sábado 17:** 9 a 21 h. **Domingo 18:** 9 a 16 h. Universidad de Montevideo, FIUM (LATU). De noche la sede cierra.
- La consigna se revela en el kickoff del sábado. Se evalúa el **producto de IA funcionando** (la IA tiene que ir *adentro* del producto) y el **pitch en vivo** ante un jurado de fundadores e inversores.
- **Regla clave:** la parte que funciona (pantallas, IA, datos) se construye durante el evento, en este repo.

## La consigna (kickoff del sábado 17/10)

Detalle en `equipo/kickoff-consigna.md`. Lo esencial:

- Producto libre, pero su **función principal tiene que depender de la IA**. Prueba: si funciona igual sin IA, no vale. No vale un chat genérico, ni la IA como función secundaria, ni reglas armadas a mano.
- En la demo, el jurado prueba con **casos propios**, no con los que preparamos. Nada armado a mano para que la demo salga bien.
- Evaluación: 35 % producto funcionando, 25 % problema y valor, 20 % calidad del uso de la IA, 10 % experiencia de usuario, 10 % originalidad (confirmado en `equipo/build101-consigna.pdf`). Demo de 3 minutos y 3 de preguntas.
- En el kickoff dijeron que **el repo tiene que ser público**; el PDF oficial habla de "acceso de lectura". Confirmar con un mentor. Hay que sumar al organizador como colaborador y hay revisión técnica del historial.
- **Prohibido hardcodear:** nada de resultados escritos a mano en el código presentados como si los generara la IA. Costa sirve para ensayar, pero todo tiene que funcionar con cualquier marca que invente el jurado. Lo que todavía no funciona se muestra marcado como "en construcción".
- El evento da Claude Code (una cuenta por equipo), Kiro de AWS y USD 250 de Tenki. **No se habló de créditos de API para la IA del producto**: preguntar.
- En la sede el wifi bloquea SSH: usar git por HTTPS (ver el final de `equipo/kickoff-consigna.md`).

## El producto: BrandIA

Una persona le cuenta su negocio a BrandIA **hablando (agente de voz) o por chat**. La IA le hace preguntas, arma su identidad de marca y después le genera los contenidos con esa marca. Contexto completo en `brandia/`.

**Está terminado cuando** alguien del jurado cuenta un negocio inventado en el momento y, en pocos minutos, ve su brandbook y su feed generados.

Lo que se muestra en la presentación:

| # | Parte | Estado en la demo |
|---|---|---|
| 1 | **Generación de marca:** entrevista por voz o chat → ficha de la marca → nombre y voz, paleta, tipografías, logo y brandbook | **Funciona**, con IA real |
| 2 | **Contenido:** un feed completo con un par de posteos, historias y al menos un reel, con la marca aplicada | **Funciona**, con IA real |
| 2b | Piezas de pauta | Opcional: se generan si llegamos; publicar en Meta queda para después |
| 2c | Newsletter y web | Pantallas que muestran cómo va a funcionar, marcadas "en construcción" |
| 3 | **BranderIA** (marketplace de merch) | "En construcción": ejemplos de productos con la marca y cómo funcionaría con proveedores, sin proveedores reales |

Plan de tareas y reparto: `equipo/plan-finde.md`.

## Archivos

| Archivo | Qué es |
|---|---|
| `equipo/EMPEZA-ACA.md` | Guía para las personas: qué leer y qué hacer hoy |
| `equipo/build101-consigna.pdf` | **La consigna oficial**: consigna, rúbrica y cómo se evalúa (3 páginas) |
| `equipo/kickoff-consigna.md` | La consigna, la evaluación y las reglas, resumidas del kickoff |
| `equipo/plan-finde.md` | Plan de tareas y reparto para el finde |
| `brandia/negocio/` | Contexto de BrandIA, decisiones, modelo de negocio, mercado y competencia |
| `brandia/producto/` | Qué hace cada capa (identidad, suscripción, plus, marketplace), arquitectura y costos |
| `brandia/motor-ia/` | Borrador de los prompts del motor (entrevista, referencias, direcciones) y `brief.schema.json` |
| `brandia/marca/` | Logo v2 (SVG), `tokens.css` (colores y tipografías) y manual en texto |
| `brandia/referencias/` | Prototipos, plataforma web, landing de lista de espera y copy: ideas de diseño y textos |
| `equipo/kickoff-transcripcion.md` | Transcripción automática del kickoff (con errores) |
| `equipo/warmup-explicado.pdf` | El warm up explicado para no programadores (28 páginas) |
| `equipo/machete-build101.html` | Resumen del warm up, plan del finde y frases para pedirle al agente (abrir en el navegador) |
| `equipo/checklist.md` | Checklist de preparación, por persona |
| `equipo/notas-warmup.md` | Notas crudas, slide por slide |
| `equipo/kit/` | Plantillas para el sábado: `CLAUDE-proyecto.md`, `design-system.md`, `pitch.md` |
| `equipo/fuentes/` | Fuente HTML de la presentación (para regenerar el PDF) |

## Reglas para Claude en este repo

1. **Antes de empezar, traé lo último:** `git pull`. Así ves lo que hicieron los demás.
2. **Nunca subas claves, contraseñas ni tokens.** Las claves van en `.env.local` (el `.gitignore` lo deja afuera) y en las variables de entorno de Vercel. Entre compañeros se pasan por AirDrop, en persona.
3. **El repo vive en `~/Proyectos/build101`**, nunca dentro de Google Drive ni de iCloud: sincronizar `node_modules` y repos de git los rompe.
4. **Hasta el sábado, los documentos de `equipo/` los actualiza Eze.** Si otro integrante quiere cambiar algo, avisale a Eze o hacelo en una rama propia.
5. **Contraseñas, inicios de sesión, autorizaciones y pagos los hace la persona.** Vos la guiás.
6. Antes de instalar algo, decí qué es y para qué sirve.

## Decisiones tomadas

| | Usamos | Plan B |
|---|---|---|
| Herramienta para construir | Claude Code, en la app de escritorio de Claude | Codex (OpenAI) |
| Código | Este repo: `ezegarcia-crypto/build101`, privado | |
| Web | Next.js, desde la plantilla Better-T-Stack, con shadcn para lo visual | |
| Publicar | Vercel (cuenta de Eze, team `ezegb`), conectado a GitHub: cada push a `main` se publica solo | |
| Datos | Supabase (cuenta de Eze), solo si el producto guarda datos | |
| IA del producto | Se decide después del kickoff: Eve de Vercel, AI SDK o tool use de la API de Claude; modelos de decisión; voz con ElevenLabs si la consigna lo pide | Claude para clasificar |

**Salteamos:** Cursor, OpenCode, Orca, LangChain, Pinecone, Figma, Linear, Notion.

Las claves de la IA dependen de los créditos que dé el evento. Hoy no hay ninguna.

## Cómo trabajamos

1. Una sola herramienta: Claude Code.
2. Dos agentes nunca tocan los mismos archivos. Cada persona trabaja en su rama y en su parte.
3. Todo pedido dice "está terminado cuando…".
4. Nunca dar algo por "listo" sin probarlo: lint, pruebas, navegador (también en tamaño celular) y captura.
5. Commit cada vez que algo funciona. `main` es sagrado: solo entra lo validado.
6. Merge cada 1 o 2 horas, de a una rama. Los hace una sola persona, la integradora.
7. Antes de cada merge, una revisión "abogado del diablo" en una conversación nueva: qué falta, qué sobra y qué puede romper la demo.
8. Publicar en la primera hora.
9. Sábado 20:30: dejar 2 o 3 agentes en la nube con tareas chicas y claras. Domingo: congelar, ensayar 3 veces y grabar un video de respaldo.

Reparto sugerido, a confirmar el sábado: persona 1 pantallas y diseño (y después demo y pitch); persona 2 la IA del producto; persona 3 datos, publicación, pruebas y merges.

## Estado al viernes 16/10

**Hecho (en la compu de Eze):**
- Herramientas: git, Node 24 con npm 12.2, `gh` (sesión iniciada), `vercel` (sesión iniciada), `codex`, CLI de Supabase.
- GitHub: este repo y `ensayo-build101` (plantilla de prueba, en `~/Proyectos/ensayo-build101` de Eze).
- Vercel: la app de Vercel está instalada en GitHub solo para esos dos repos. El ensayo está publicado en https://ensayo-build101.vercel.app y se comprobó que cada push se publica solo. El proyecto `build101` de Vercel se crea el sábado.
- Repo: Juan Pedro (`juanpeportas`) y Rodrigo (`rportas-pixel`) aceptaron la invitación. Al ensayo no se los invita: solo lo usa Eze.
- Supabase: sesión iniciada. Hay lugar para un proyecto activo más en el plan gratis.
- Skills grill-me (con grilling, que es la que usa por dentro), handoff y show-me, instaladas y revisadas.

**Pendiente:**
- Juan Pedro y Rodrigo: confirmar que su plan de Claude sea pago, bajar el repo y verificar su compu (sección siguiente).
- Opcional: probar un agente en la nube con una tarea chica en `ensayo-build101` (lo hace Eze).

## Si sos el Claude de Juan Pedro o de Rodrigo: verificar que la compu esté lista

Si llegaste hasta acá, la persona ya tiene git, `gh` y este repo. Falta comprobar que todo funcione:

1. `npm --version` tiene que ser 11.16 o más nuevo. Si no, `npm install -g npm@latest`.
2. Si `gh auth status` no muestra la sesión iniciada:
   - corré `gh auth login --hostname github.com --git-protocol https --web` y después `gh auth setup-git`;
   - el código de 8 caracteres lo genera GitHub para su propia compu y vence a los 15 minutos: se pega en https://github.com/login/device.
3. **Prueba final**, con la misma plantilla que se usa el sábado, en una carpeta de prueba que no se sube a ningún lado:
   - Corré `cd ~/Proyectos && npx -y create-better-t-stack@latest create prueba-build101 --frontend next --backend self --runtime none --api none --database none --orm none --auth none --payments none --addons none --examples none --web-deploy none --server-deploy none --package-manager npm --no-git --install --disable-analytics --no-render-title && cd prueba-build101 && npm run dev`.
   - Abrí http://localhost:3001. Si se ve una página con el título grande "BETTER T STACK", la compu está lista.
   - Cortá con Ctrl+C y, con el OK de la persona, borrá la carpeta `~/Proyectos/prueba-build101`.
4. **Opcional, skills** (con `-g` quedan para el usuario y no dentro del repo; grill-me necesita también grilling):
   - `npx skills add https://github.com/mattpocock/skills --skill grill-me -g -a claude-code -y`
   - `npx skills add https://github.com/mattpocock/skills --skill grilling -g -a claude-code -y`
   - `npx skills add https://github.com/mattpocock/skills --skill handoff -g -a claude-code -y`
   - `npx skills add https://github.com/humanlayer/skills --skill show-me -g -a claude-code -y`
   - Aparecen en la próxima conversación.
5. Recomendale leer `equipo/warmup-explicado.pdf` (20 minutos).

## Sábado: arranque (para el Claude de Eze o de quien integre)

1. Después del kickoff, afinar la idea con preguntas (grill-me) y definir la demo con "está terminado cuando…".
2. `git pull`. **Plan acordado con Eze:** copiar a este repo el esqueleto que ya está probado en `~/Proyectos/ensayo-build101`.
   - **No copiar** `.git`, `node_modules`, `.env.local` (tiene una clave de Vercel) ni `.vercel`.
   - **No pisar** `CLAUDE.md`, `README.md`, `equipo/` ni `.gitignore`. Al `.gitignore` sumale las líneas del ensayo, sin borrar las de `.env*`.
   - Cambiar `ensayo-build101` por `build101` en los `package.json` y en los nombres de paquetes (`@ensayo-build101/...`). Devolver el título de `apps/web/src/app/layout.tsx` a algo genérico.
   - Ajustar base de datos y login según la idea. Por último, `npm install` y `npm run build` para comprobar que anda.

   Alternativa, si la idea pide otras piezas: generar uno nuevo con la plantilla, que tarda un minuto (mismo comando que el ensayo, con `--no-git` y en una carpeta temporal), y copiarlo con las mismas reglas.
3. Copiar `equipo/kit/CLAUDE-proyecto.md`, completarlo y sumarlo a este CLAUDE.md en una sección "El producto". Commit y push.
4. Publicar en la primera hora:
   - `vercel link --yes --project build101`, después `vercel git connect --yes` y `vercel deploy --prod --yes`.
   - En Vercel → Settings → Deployment Protection, desactivar "Vercel Authentication", para que los links de prueba de cada rama los vean todos.
   - Abrir el link en el celular.
5. Una rama por persona. Cada uno, en su compu: `git pull` y después `git switch -c <su-parte>`.
6. Claves: en `.env.local` (fuera de git) y en las variables de entorno de Vercel. A los compañeros se les pasan por AirDrop.

## Comandos útiles

- Invitar a alguien al repo: `gh api -X PUT repos/ezegarcia-crypto/build101/collaborators/USUARIO -f permission=push`
- Ver las publicaciones: `vercel ls build101 --scope ezegb`
- **La web publicada:** https://build101-bice.vercel.app (proyecto `build101` del team `ezegb`, conectado a GitHub: cada push a `main` se publica solo). Ojo: `build101.vercel.app` es de otra persona.
- Probar en la compu: `npm install` y después `npm run dev:web` → http://localhost:3001
- La IA va por **Vercel AI Gateway** (texto, imágenes y video) y la voz por **ElevenLabs**. En la compu, la clave del Gateway se baja con `vercel env pull` (queda en `.env.local`, fuera de git); publicada en Vercel no hace falta clave.
