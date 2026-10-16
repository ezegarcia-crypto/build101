# Notas del warm up — build 101

Notas crudas, slide por slide, tomadas durante el AI Coding Warm Up (15/10/2026). La versión ordenada para leer está en `warmup-explicado.pdf` y `machete-build101.html`.

## Evento (build101.dev)
- Sáb 17/10 09–21 · Dom 18/10 09–16 · UM FIUM, LATU. Sin noche en la sede.
- Equipos de 3. Consigna se revela en el kickoff.
- Se evalúa: producto de IA funcionando (IA ADENTRO del producto, no solo para construirlo) + pitch en vivo.
- Jurado: founders e inversores → importan problema, demo que funcione y pitch.
- Llevar: notebook, cargador, documento.

## Slide 3 — "Ya no escribís código. Dirigís agentes."
- Varios agentes en paralelo, cada uno en una tarea; vos coordinás.
- Aplicación: una sola herramienta (Claude Code), cada integrante con su frente, dos agentes nunca tocan los mismos archivos, GitHub desde el minuto uno, 2–3 frentes máximo.

## Slide 4 — Qué es un harness
- Modelo = cerebro. Harness = programa que le da herramientas (read, edit, bash, grep, web).
- Aplicación: pedirle que pruebe en el navegador, mandar capturas, pegar errores completos.
- Para el producto: modelo + 2–3 herramientas propias del problema = agente que hace trabajo real.

## Slide 5 — El loop del harness
- Tool call → el harness ejecuta → resultado (+4 −1) → el modelo decide el siguiente paso. Se repite = loop agéntico.
- Aplicación: mirar qué archivos toca; Esc para frenar.
- Para el producto: "tool use" de la API de Claude; mostrar en pantalla qué herramienta usa el agente (impacta en la demo).

## Slide 6 — Mismo modelo, mejor harness
- "Armá el login" a un modelo pelado: no sigue tus reglas, no sabe cómo hacerlo, no ve tus datos, no respeta tu diseño → resultado pobre (2/8).
- Cómo se arregla cada ✗: reglas → CLAUDE.md · saber cómo → skills/docs · ver datos → MCP/conectores · diseño → design system, referencias, capturas.
- Aplicación: al definir la idea el sábado, 15 min para un CLAUDE.md compartido en el repo (idea, stack, reglas, diseño). Los 3 agentes siguen las mismas reglas.

## Slide 6 (completa) — Las capas del harness
- De adentro hacia afuera: Modelo → System prompt (reglas, CLAUDE.md) → Skills (cómo hacer cosas) → MCPs (acceso a datos/sistemas) → Design system (cómo se ve). Con todas: 8/8.
- Aplicación 1: antes del sábado dejar armada una plantilla genérica de CLAUDE.md + mini design system (no es código del producto, se puede llevar).
- Aplicación 2: las mismas capas sirven para el agente DENTRO del producto: system prompt bien escrito + herramientas (tool use) + datos reales.

## Slide 7 — Para elegir (harnesses)
- Claude Code (Anthropic, modelos Claude) · Codex (OpenAI, modelos GPT) · OpenCode y Pi (open source, cualquier modelo).
- Decisión: Claude Code. Ya lo usamos, con skills y CLAUDE.md. No cambiar de herramienta a 2 días.
- Ojo: la herramienta para construir ≠ el modelo dentro del producto. Los créditos del evento probablemente sirvan para la API del producto.
- Plan B por límites de uso: revisar el plan de cada integrante y tener Codex instalado de respaldo.

## Slide 8 — ¿Qué es un ADE? (Agentic Development Environment)
- Panel para manejar varios agentes a la vez: cada uno en su rama (feat/login, fix/api…) y su worktree propio (copia separada del proyecto); te avisa cuando uno te necesita.
- Ya lo tenemos: la app de escritorio de Claude (pestaña Code) = sesiones en la barra lateral + worktree por sesión + avisos.
- Aplicación: cada integrante en su notebook ya está separado; worktrees sirven cuando uno corre 2+ agentes. Máx. 2 agentes por persona.
- Juntar el trabajo seguido (cada 1–2 h): "mergeá mi rama a main y resolvé conflictos". Si se junta todo al final, explota.

## Slide 9 — Algunos ADEs
- TUI (dentro de la terminal, todo texto): Herder, cmux. GUI (ventanas y botones): Orca, Superset, T3 Code.
- El orador usa Orca (GUI).
- Decisión: no instalar nada nuevo. Usamos la app de escritorio de Claude (GUI) que ya tiene sesiones, worktrees y avisos. Para vibe coders, GUI > TUI.

---
## Material propio
- Eze tiene plantillas y experiencia propias (pitch para inversores, agentes con herramientas, design systems) que se adaptan el sábado. Las plantillas genéricas para el equipo están en `kit-equipo/`.
- Ojo: llevar métodos y plantillas, NO producto hecho (la consigna se revela en el kickoff y "lo que construyas es 100% de tu equipo").

## Slide 10 — Skills (progressive disclosure)
- Ventana de contexto = la "memoria de trabajo" del agente en una conversación; es limitada.
- La skill se carga por niveles: nombre + descripción siempre (~100 tokens c/u) → SKILL.md solo al usarla (<5k) → scripts y docs solo si hacen falta. Por eso se pueden tener muchas sin llenar la memoria.
- Aplicación: la DESCRIPCIÓN es lo que hace que el agente elija la skill → escribirla con las frases que va a usar el equipo.
- Contexto limpio: una sesión nueva por tarea; las conversaciones larguísimas rinden peor.
- Para el finde: apagar conectores que no se usan (Meta Ads, Canva, Higgsfield, etc.); cada uno ocupa memoria y distrae al agente.
- Viernes: armar 1–2 skills de equipo (p. ej. "subir y publicar" y "chequeo antes de la demo").

## Slide 11 — skills.sh (tienda de skills)
- Directorio público de skills. Se instalan con: npx skills add <dueño/repo> (necesita Node.js).
- Repos populares: Matt Pocock (grill-me, tdd, handoff · 28M installs) · pstack (poteto-mode, arena, interrogate) · HumanLayer (show-me).
- Las que nos sirven:
  - grill-me: el agente te interroga sobre la idea/plan, decisión por decisión, hasta que esté clara. Usar el sábado antes de construir.
  - handoff: resume la conversación en un documento para seguir en una sesión nueva sin perder nada (contexto lleno, o del sábado al domingo).
  - show-me: explica visualmente (diagramas, pseudocódigo) lo que se construyó. Ideal para entender sin leer código.
- Saltear: tdd (tests, más de programador), arena e interrogate (comparan varios modelos, requieren configurar), poteto-mode.
- Seguridad: una skill son instrucciones (y a veces scripts) que el agente sigue con tus permisos → leer antes de instalar, solo de repos conocidos. Instalar jueves/viernes, no el sábado.

## Slide 12 — MCP: el USB-C de los agentes
- MCP = enchufe estándar: un mismo conector sirve en cualquier harness (Claude Code, Codex, OpenCode, Cursor). Tera, el CRM, Drive y Trello ya son MCPs que usamos.
- Los de la slide y qué hacer con cada uno:
  - Playwright (browser): el agente abre el navegador, hace clics y saca capturas → prueba la app solo. Ya lo tenemos: navegador integrado de la app de Claude.
  - Supabase: base de datos + login + archivos. El MCP deja al agente crear tablas y ver datos. Conectar SOLO a un proyecto nuevo de la hackathon, nunca a una base real.
  - Docs actualizadas (p. ej. Context7): documentación al día de las librerías → evita que el agente escriba código viejo. Vale la pena.
  - Figma: saltear (nadie diseña en Figma).
  - Linear / Notion: saltear. Tareas en un TAREAS.md dentro del repo (o Trello, que ya está conectado).
- Recordar slide 10: cada MCP ocupa memoria → conectar solo lo que se usa.
- Slide 12 (completa) — "cada uno se enchufa una vez": sin MCP harían falta 4×5 = 20 integraciones a medida; con MCP, cada servicio hace un solo conector y cada harness lo soporta una sola vez.
  - Aplicación 1: el plan B (Codex) usa los mismos MCPs → si se cambia de herramienta, no se pierde nada.
  - Aplicación 2 (bonus, solo si el producto ya funciona): que el producto tenga su propio MCP → se puede usar desde Claude o ChatGPT. Buena frase para inversores: "nuestro producto se enchufa a cualquier IA".

## Slide 13 — MCPs que más usa el orador
- MCP local = corre en tu compu (p. ej. para buscar en tus archivos). MCP remoto = corre en un servidor, te conectás con una URL (como Tera).
- fff (local): búsqueda de archivos rápida para agentes. Tolera errores de tipeo, prioriza los archivos que estás tocando. → Saltear: el repo de la hackathon va a ser chico y la búsqueda que trae Claude Code alcanza.
- executor (remoto): todas tus APIs detrás de UN solo MCP; el agente busca la herramienta por intención ("github issues") y la usa. Permite marcar cada herramienta como permitida / pide aprobación / bloqueada. → Saltear para el finde: Claude Code ya hace algo parecido de fábrica (carga solo los nombres de las herramientas y las busca cuando las necesita).
- Corrección a la slide 10: apagar los conectores de negocio (Meta Ads, Gmail, CRM, Drive de Gary+) más que nada por SEGURIDAD: que ningún agente gaste plata, mande un mail o toque datos reales por error.

## Slide 15 — CLI
- CLI = programa que se usa escribiendo comandos en la terminal (git, gh, vercel, supabase, npm).
- El agente las usa con su herramienta "bash" igual que una persona, y NO ocupan memoria hasta que las usa (un MCP sí). Las populares ya las sabe usar.
- Regla práctica: GitHub y Vercel por CLI; Supabase por MCP (más cómodo para ver datos y crear tablas).
- El login de cada CLI lo hace la persona UNA vez; después el agente las usa solo.
- Checklist de instalación (los 3 integrantes):
  - Eze ya tiene: git, node/npm/npx, supabase, claude.
  - Falta instalar: gh (brew install gh), vercel (npm i -g vercel), codex de plan B (npm i -g @openai/codex).
  - Logins: gh auth login · vercel login · codex (con la cuenta de ChatGPT).
- Con todo listo, una sola frase: "creá el repo en GitHub, subí el código y publicalo en Vercel".
- Slide 15 (completa) — CLIs que usa el orador y qué hacer:
  - Imprescindibles: git (versiones y ramas) ✓ · npm (instala dependencias y corre la app) ✓ · gh (GitHub) FALTA · vercel (publicar) FALTA · supabase (base de datos) ✓.
  - jq (lee JSON, el formato de datos de las APIs, sin cargar todo en la memoria) ✓ ya instalado.
  - aws (nube de Amazon; Bedrock = usar Claude y otros modelos a través de Amazon): solo si en el kickoff dan créditos de AWS.
  - Saltear: orca (usamos la app de Claude) y agent-browser (la app ya trae navegador).

## Slide 16 — Loops: un loop tiene tres cosas
- Loop = dejar que el agente trabaje solo, paso a paso, hasta llegar a la meta (como un laberinto).
- 1. Objetivo (el prompt): a dónde querés llegar. Incluir cómo se sabe que está terminado ("el usuario entra con Google y ve su nombre arriba"), no solo "armá el login".
- 2. Restricciones (paredes que no puede atravesar):
  - Hooks: reglas automáticas que el programa ejecuta antes/después de cada acción del agente. No se pueden "olvidar".
  - Permisos: qué puede hacer solo y qué tiene que preguntar (borrar, publicar).
  - Lint: corrector automático del código, como el corrector ortográfico.
  - Clave: el CLAUDE.md es un cartel de "no pasar" (el agente puede olvidarlo); hooks y permisos son paredes de verdad.
- 3. Validaciones (¿llegó de verdad?): tests (pruebas automáticas) y browser check (abrir la app y probarla).
- "¿listo? → corre la validación": nunca creerle el "listo" sin prueba. Las paredes también evitan trampas (p. ej. borrar una prueba que falla para decir que pasa).
- Aplicación:
  - En el CLAUDE.md: "antes de decir listo: lint + tests + probar en el navegador + mostrar captura".
  - Pedir UN test del recorrido exacto de la demo y correrlo antes de cada merge → la demo no se rompe el domingo.
  - Permisos: modo Auto para ir rápido (pregunta solo lo riesgoso); modo Plan para arrancar cada tarea grande.
  - Hooks: opcional, se pueden dejar armados el viernes (p. ej. correr el lint solo después de cada cambio).

## Slide 18 — Itera hasta que todo pase
- El loop de la slide 16 en acción: objetivo "login con Google en mobile" → vuelta 1: el agente edita → el hook de lint lo frena con 2 errores (restricción) → el agente recibe los errores y los corrige solo en la vuelta 2 → repite hasta que todo pase.
- Iterar = dar vueltas: intentar → chequear → corregir → volver a chequear. Nadie tuvo que leer el código: el chequeo automático avisó y el agente se corrigió.
- Aplicación:
  - Rol del equipo: poner el objetivo y los chequeos, no arreglar código.
  - Frase para el finde: "Hacé X. No pares hasta que el lint y los tests pasen y lo hayas probado en el navegador, también en tamaño celular."
  - Si después de ~3 vueltas da vueltas en círculo: frenar (Esc), pegarle el error completo o una captura, pedirle que primero explique el problema, o sesión nueva con handoff.
- Slide 18 (completa), las 3 vueltas:
  - Vuelta 1: lint ✗ (2 errores) → frena la restricción.
  - Vuelta 2: lint y types ✓, pero browser a 390px (ancho de celular) ✗ "el botón no se ve" → frena la validación.
  - Vuelta 3: lint y types ✓ + npm test ✓ + en el navegador a 390px llega a /dashboard (la pantalla después de entrar) ✓ → objetivo cumplido.
- types = otro chequeo automático: que las piezas del código encajen entre sí.
- Lección clave (vuelta 2): el código puede estar "correcto" y la app igual no servirle al usuario. Restricciones atajan errores de escritura; validaciones atajan "no funciona para la persona". Hacen falta las dos.
- Patrón: la validación copia el objetivo. "En mobile" → se prueba a 390px; "login" → se prueba que llega al dashboard. Escribir objetivos que se puedan comprobar.
- Para la demo: validar también en el tamaño en que se va a mostrar (notebook/proyector) además del celular.

## Slide 20 — Decision models (Decisions API)
- Modelos que NO escriben texto: les das una situación ("state") y preguntas con opciones fijas; eligen una y te dicen qué tan seguros están (probabilidad).
  - Ej.: "El pago falló y el cliente está furioso" → área: billing / técnico / ventas · urgente: sí / no.
  - Respuesta: área = billing (86% seguro) · urgente = sí (99% seguro).
- Opciones de la slide: Jev (TypeSafe, ~US$0,042 por millón de tokens de entrada), GPT-6 Luna (Decisions API de OpenAI, ~US$0,10), Laya (abierto, corre en tu compu con Ollama), Clef (Cloudflare Workers AI). Jev y Luna no cobran la salida.
- Son nuevos (salieron sep/oct 2026, la de OpenAI está en beta): rapidísimos, baratísimos y la respuesta siempre es una de las opciones → la app no se rompe por una respuesta rara.
- La probabilidad sirve para decidir: muy seguro → automático; dudoso → lo revisa una persona.
- Aplicación al producto: clasificar y derivar (leads, reclamos, pedidos) con un decision model + Claude para redactar respuestas + herramientas. Es lo que hace el setter de Gary+ (clasifica en 6 categorías).
- Para la demo: mostrar en pantalla la decisión con su porcentaje ("billing 84%") → el jurado ve a la IA "pensar".
- Cuidado: son APIs nuevas. Plan B: Claude también clasifica (más lento y caro). Preguntar en el kickoff si hay créditos para alguna.

## Slide 21 — Adversarial review ("y agrega de más")
- El dibujo: bloques sólidos = lo que pediste · huecos en azul = lo que el agente dejó sin hacer o hizo mal · bordes punteados alrededor = lo que agregó sin que se lo pidieras.
- Adversarial review = una revisión cuyo trabajo es encontrar problemas (abogado del diablo), no aprobar. Mejor si la hace OTRO agente (sesión nueva, ojos frescos) y mejor aún otro modelo (p. ej. Codex revisa lo de Claude).
- Por qué "agregar de más" es un problema en la hackathon: más cosas que se pueden romper, pisa archivos de compañeros, gasta tiempo.
- Aplicación:
  - Antes de cada merge y antes de congelar el domingo: revisión en una sesión NUEVA con este pedido: "Sos un revisor exigente. Compará lo que se pidió con lo que se hizo. Listá: 1) lo que falta o está mal, 2) lo que se agregó sin pedirlo, 3) qué podría romper la demo. No arregles nada, solo reportá, en lenguaje para no programadores."
  - Comandos que ya trae Claude Code: /code-review (busca errores) y /simplify (limpia lo que sobra).
  - Prevención en el CLAUDE.md: "Hacé solo lo que te pido. No agregues funciones, archivos ni cambios extra. Si ves una mejora, proponela pero no la hagas."

## Slide 22 — Templates: para no arrancar de cero
- Template = esqueleto de proyecto ya armado (carpetas, configuración, conexiones) para no empezar de una hoja en blanco.
- Better-T-Stack (el proyecto entero): menú para armar el proyecto completo eligiendo las piezas → npm create better-t-stack@latest
- shadcn/ui (la UI): piezas visuales listas y prolijas (botones, formularios, tablas, ventanas) → npx shadcn@latest init. Ojo: es tan usado que se ve "genérico"; aplicarle nuestros colores y tipografía (slide 6).
- create-convex (backend y datos): Convex = base de datos + lógica del servidor, con datos que se actualizan en vivo en pantalla → npm create convex@latest. Es alternativa a Supabase: elegir UNO solo.
- Son públicas y las recomiendan los propios organizadores → válido usarlas el sábado (no es "producto hecho").
- Aplicación:
  - Que elija Claude las piezas técnicas: "creá el proyecto con Better-T-Stack: web con Next.js, base de datos [Supabase o Convex], login con Google y shadcn".
  - Base de datos: Supabase (ya instalado, login con Google listo, se ven los datos como planilla). Convex si un mentor/sponsor lo empuja.
  - Viernes: ensayo general en una carpeta de prueba (crear desde el template → publicar en Vercel → que ande el login) y después borrarlo. Va a la checklist del final.

## Frameworks de agentes (stack para el producto)
- Framework de agentes = kit de código para armar el agente ADENTRO del producto (modelo + herramientas + loop de las slides 4–5) sin programarlo a mano: llama al modelo, ejecuta herramientas, reintenta, muestra la respuesta en pantalla.
- Opciones: Eve de Vercel (TypeScript) · LangChain (TypeScript y Python) · Pydantic AI (Python). "Elegí por el lenguaje del equipo."
- Para nosotros "el lenguaje del equipo" = el del resto del proyecto. Con Next.js + Vercel todo es TypeScript → Eve. Un solo lenguaje = menos problemas (Python pediría un servidor aparte).
- Eve (salió en junio 2026, en beta): cada agente es una CARPETA de archivos: instrucciones en markdown, herramientas, skills, subagentes, tareas programadas, aprobaciones humanas. Es la misma lógica que usamos (personalidad del bot en .md en gary.uy + skills). Se publica directo en Vercel.
- Cuidados: es nuevo → el modelo puede no conocerlo bien y hay guías de terceros con datos viejos o equivocados. Usar el MCP de docs actualizadas o pasarle la documentación oficial (vercel.com/eve). Plan B: el AI SDK de Vercel (maduro) o tool use directo con la API de Claude.
- Saltear LangChain (grande y complejo para un finde) y Pydantic AI (Python).

## Slide 24 — Vector DBs
- Embedding = convertir un texto en coordenadas que representan su SIGNIFICADO. Textos que quieren decir lo mismo quedan cerca en el "mapa" aunque usen otras palabras ("reembolso", "devolución", "reintegro" juntos; "contraseña" y "borrar cuenta" juntos; "envío" y "seguimiento" juntos).
- Vector DB = base de datos que guarda esas coordenadas y encuentra rápido las más cercanas a una pregunta → búsqueda por significado, no por palabras exactas.
- Uso típico: antes de que la IA responda, buscar en tus documentos los pedazos más relevantes y dárselos → responde con TU información y no inventa (se llama RAG).
- Opciones: pgvector (viene en Supabase / Neon) · Convex (incluido) · Pinecone / Qdrant / turbopuffer (servicios aparte).
- Aplicación:
  - Con Supabase ya lo tenemos (pgvector incluido) → no sumar otro servicio. Saltear Pinecone/Qdrant/turbopuffer.
  - Usarlo solo si el producto busca entre MUCHOS textos (fichas, manuales, contratos, reseñas). Si la información entra en unas pocas páginas, pegarla directo en las instrucciones del agente: más simple.
  - Ejemplo inmobiliario para la demo: "algo luminoso cerca del mar para una familia con perro" → encuentra "soleado, a 2 cuadras de la playa, con jardín" sin palabras en común.

## Slide 25 — Deploy desde la primera hora
- Deploy = publicar la app en internet con un link público.
- "git push origin main" = subir la última versión guardada a la rama principal de GitHub. Si GitHub está conectado a Vercel, cada push publica solo una versión nueva → el link siempre está al día.
- Opciones: Vercel (la web, mi-app.vercel.app) · Railway (servidores aparte, p. ej. en Python) · AWS Amplify (Amazon).
- Por qué en la primera hora, aunque sea un "hola mundo": los problemas de publicación (claves, configuración, errores de armado) aparecen cuando la app es chica y fácil de arreglar, no el domingo a las 13 h. Además siempre hay un link funcionando para mentores, celulares y la demo.
- Aplicación:
  - Solo Vercel (todo es TypeScript, sin servidor aparte). AWS solo si hay créditos.
  - Sábado, paso 1 después del template: repo en GitHub → conectar a Vercel → publicar → abrir el link en el celular. Antes de la primera hora.
  - "main es sagrado": main = lo que ve el público. Cada uno en su rama; a main solo se junta lo validado (tests + revisión). Vercel da un link de prueba para cada rama → cada uno ve lo suyo sin tocar main.
  - SEGURIDAD: las claves (API de Claude, Supabase) van en las "variables de entorno" de Vercel, NUNCA en el código ni en GitHub. Pedirle a Claude: "asegurate de que ninguna clave quede en el código ni en GitHub".

## Slide 26 — Worktrees
- De main salen 3 ramas, cada una con su copia del proyecto: AUTH (login y usuarios) · UI (pantallas y diseño) · API (lógica, datos y la IA). Después vuelven a juntarse en main.
- Es lo de la slide 8 dibujado. Cada integrante en su notebook ya tiene su copia; los worktrees sirven cuando UNA persona corre varios agentes a la vez.
- Reparto sugerido para el equipo (una rama por persona, cada una con sus archivos):
  - Persona 1 → UI: pantallas, diseño, que se vea bien en celular. Después: demo y pitch.
  - Persona 2 → API/IA: el agente del producto (instrucciones, herramientas, decision model).
  - Persona 3 → datos + publicación: Supabase, Vercel, tests del recorrido de la demo, revisiones antes de juntar.
- ¿Hace falta login (AUTH)? Si no es central para el producto, saltearlo o dejarlo para el final: come horas y el jurado no lo valora. Usar usuarios de prueba.
- Juntar ramas seguido (cada 1–2 h) y en pedazos chicos; cuanto más se separan, más conflictos al juntar.
- Slide 26 (animación): cada rama avanza en paralelo con varios cuadraditos = commits (puntos de guardado). El cuadrado azul lleno al final = esa parte terminada y validada, lista para volver a main.
  - Commit seguido: cada pasito que funciona se guarda. Si el agente rompe algo, se vuelve al último cuadradito bueno. Regla para el CLAUDE.md: "hacé commit cada vez que algo funcione".
  - Las 3 ramas avanzan al mismo tiempo: esa es la velocidad de dirigir agentes.
  - El cuadrado azul se "pinta" solo cuando pasó tests + navegador + revisión → recién ahí se junta.
- Slide 26 (final de la animación) — MERGE → MAIN ✓: las 3 ramas se juntan en main, que ahora tiene login + pantallas + lógica juntos. Con Vercel conectado, cada merge a main = nueva versión pública.
  - Conflicto = dos ramas cambiaron la misma parte del mismo archivo y git no sabe cuál dejar. Pedido: "mergeá mi rama a main, resolvé los conflictos y explicame qué decidiste".
  - Juntar DE A UNA rama y validar después de cada una (tests + navegador). Si se juntan las 3 a la vez y algo se rompe, no se sabe cuál fue.
  - Una sola persona "integradora" hace los merges (la persona 3 del reparto).
  - Después de cada merge: los demás traen lo último de main a su rama ("actualizá mi rama con main") y alguien abre el link público para chequear.

## Slide 27 — Cloud agents: le mandás una tarea, te devuelve una PR
- Cloud agent = agente que trabaja en una computadora en la nube (VM = máquina virtual, una por tarea), no en tu notebook. Le das la tarea, trabaja solo (podés cerrar la compu) y te devuelve una PR.
- PR (pull request) = propuesta de cambios en GitHub: "esto es lo que hice en mi rama, ¿lo juntamos a main?". Una persona revisa y aprueba → el agente nunca toca main directo.
- Opciones de la slide: Cursor Cloud Agents (@cursor en una PR) · Copilot coding agent (le asignás una tarea en GitHub) · Codex cloud (chatgpt.com/codex). Claude también: Claude Code en la web (claude.ai/code) y la app puede mandar una sesión a la nube.
- Aplicación:
  - LA jugada para la noche del sábado: la sede cierra a las 21 h → dejar 2–3 agentes en la nube con tareas bien definidas y revisar las PRs el domingo a la mañana.
  - Solo tareas chicas, claras e independientes, con "cómo se sabe que está terminado": tests del recorrido de la demo, mejorar textos, versión en inglés, arreglos visuales. Nada vago ni grande.
  - Revisar cada PR antes de juntar (revisión adversarial) y que no toquen los mismos archivos que las personas.
  - Usar lo que ya tenemos (Claude; Codex como plan B), sin suscripciones nuevas. Requisito: repo en GitHub + claves cargadas en el entorno de la nube. Probarlo el viernes → checklist.

## Slide 28 — Voice agents: tu producto escucha y habla
- Agente de voz = el agente del producto conversa hablando, como una llamada: escucha → entiende → piensa → responde con voz, en tiempo real.
- ElevenLabs (ElevenAgents): se arma desde un panel web (voz, personalidad, conocimiento, herramientas) casi sin código + un kit (SDK) para meterlo en la app. El más fácil para nosotros.
- OpenAI (Realtime API, gpt-realtime-2.1): un modelo que escucha y habla directo, muy rápido; requiere más programación.
- Experiencia propia: el buscador de gary.uy ya usa Whisper para audios y existe "Mía" (avatar con voz clonada).
- Aplicación:
  - Usar voz SOLO si la consigna lo pide (llamadas, atención, manos libres, accesibilidad). Primero que funcione lo central.
  - En la demo, la voz impacta mucho (hablarle al producto en vivo y que conteste). Ej. inmobiliario: agente que atiende al interesado por teléfono, lo califica y agenda la visita.
  - Riesgos en vivo: ruido de la sala, micrófono, wifi, demoras → usar auricular con micrófono, tener respaldo en texto y un video grabado de la demo.
  - Probar que la voz suene natural en español rioplatense.
  - Cuenta de ElevenLabs y preguntar si hay créditos en el kickoff → checklist.
