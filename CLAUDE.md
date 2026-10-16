# CLAUDE.md · Equipo build 101

Contexto para el Claude de cualquiera de los tres integrantes del equipo. Leelo entero antes de ayudar.

## Qué es este repo

Es el repo del equipo para **build 101**, la hackathon de IA de Montevideo (sábado 17 y domingo 18 de octubre de 2026). Cada integrante lo tiene en su compu en `~/Proyectos/build101` y lo abre en la app de Claude.

- **Hasta el kickoff** tiene solo contexto, guías y plantillas, en `equipo/`.
- **Desde el sábado** se construye acá el producto. Cada push a `main` se publica solo en Vercel.

## Quiénes somos y cómo hablarnos

- Equipo de 3, **ninguno es programador** ("vibe coders"): **Eze** (Ezequiel García), **Juan Pedro Portas** y **Rodrigo Portas**, los socios de **BrandIA**. Coordina Eze, que usa Claude Code todos los días.
- En la hackathon se construye un **producto nuevo, desde cero**, según la consigna. De BrandIA se puede aprovechar la experiencia y las plantillas (por ejemplo, el pitch para inversores), pero no su código ni su producto.
- Hablanos en **español rioplatense** (voseo), simple y sin jerga. Si usás un término técnico, explicalo en la misma frase.
- Pasos cortos y numerados, de a uno. Antes de hacer algo, decí qué vas a hacer y para qué.

## El evento

- **Sábado 17:** 9 a 21 h. **Domingo 18:** 9 a 16 h. Universidad de Montevideo, FIUM (LATU). De noche la sede cierra.
- La consigna se revela en el kickoff del sábado. Se evalúa el **producto de IA funcionando** (la IA tiene que ir *adentro* del producto) y el **pitch en vivo** ante un jurado de fundadores e inversores.
- **Regla clave:** el producto se construye recién después del kickoff. Antes solo se preparan herramientas, cuentas, plantillas y métodos. No adelantes nada del producto.

## Archivos

| Archivo | Qué es |
|---|---|
| `equipo/EMPEZA-ACA.md` | Guía para las personas: qué leer y qué hacer hoy |
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
- Vercel: la app de Vercel está instalada en GitHub solo para esos dos repos. El ensayo está publicado en https://ensayo-build101.vercel.app y se comprobó que cada push se publica solo.

**Pendiente:**
- Usuarios de GitHub de Juan Pedro y Rodrigo, para invitarlos a los dos repos. Ya tienen Claude: falta confirmar que el plan sea pago.
- Supabase: que Eze inicie sesión (`supabase login`).
- Probar un agente en la nube con una tarea chica en `ensayo-build101`.
- Skills opcionales: grill-me, handoff y show-me.

## Si sos el Claude de Juan Pedro o de Rodrigo: verificar que la compu esté lista

Si llegaste hasta acá, la persona ya tiene git, `gh` y este repo. Falta comprobar que todo funcione:

1. `npm --version` tiene que ser 11.16 o más nuevo. Si no, `npm install -g npm@latest`.
2. Si `gh auth status` no muestra la sesión iniciada:
   - corré `gh auth login --hostname github.com --git-protocol https --web` y después `gh auth setup-git`;
   - el código de 8 caracteres lo genera GitHub para su propia compu y vence a los 15 minutos: se pega en https://github.com/login/device.
3. **Prueba final:** `cd ~/Proyectos && gh repo clone ezegarcia-crypto/ensayo-build101 && cd ensayo-build101 && npm install && npm run dev`. Abrí http://localhost:3001: si se ve la página, la compu está lista. Después cortá con Ctrl+C. Si el clon falla, falta aceptar la invitación de Eze a ese repo: llega por mail, o se acepta en https://github.com/ezegarcia-crypto/ensayo-build101/invitations.
4. **Opcional, skills:**
   - `npx skills add https://github.com/mattpocock/skills --skill grill-me`
   - `npx skills add https://github.com/mattpocock/skills --skill handoff`
   - `npx skills add https://github.com/humanlayer/skills --skill show-me`
5. Recomendale leer `equipo/warmup-explicado.pdf` (20 minutos).

## Sábado: arranque (para el Claude de Eze o de quien integre)

1. Después del kickoff, afinar la idea con preguntas (grill-me) y definir la demo con "está terminado cuando…".
2. `git pull`. Crear el proyecto con la plantilla en una carpeta temporal y copiarlo a este repo, para no pisar `CLAUDE.md`, `equipo/` ni `.gitignore`. Ajustá base de datos y login según la idea:
   `cd /tmp && npx create-better-t-stack@latest create build101-app --frontend next --backend self --runtime none --api none --database none --orm none --auth none --payments none --addons none --examples none --web-deploy vercel --server-deploy none --package-manager npm --no-git --no-install --disable-analytics --no-render-title`
   Después copiá su contenido a la raíz del repo, sin pisar estos archivos. Al `.gitignore` sumale las líneas de la plantilla, sin borrar las de `.env*`. Por último, `npm install`.
3. Copiar `equipo/kit/CLAUDE-proyecto.md`, completarlo y sumarlo a este CLAUDE.md en una sección "El producto". Commit y push.
4. Publicar en la primera hora:
   - `vercel link --yes --project build101`, después `vercel git connect --yes` y `vercel deploy --prod --yes`.
   - En Vercel → Settings → Deployment Protection, desactivar "Vercel Authentication", para que los links de prueba de cada rama los vean todos.
   - Abrir el link en el celular.
5. Una rama por persona. Cada uno, en su compu: `git pull` y después `git switch -c <su-parte>`.
6. Claves: en `.env.local` (fuera de git) y en las variables de entorno de Vercel. A los compañeros se les pasan por AirDrop.

## Comandos útiles

- Invitar a alguien a un repo: `gh api -X PUT repos/ezegarcia-crypto/build101/collaborators/USUARIO -f permission=push` (lo mismo con `ensayo-build101`)
- Ver las publicaciones: `vercel ls build101`
