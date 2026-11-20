# Armin Vit y Brand New: criterios de crítica de identidades (para un paso "crítico de marca" automático en BrandIA)

Convención: **"cita"** = texto literal de la fuente (siempre menos de 15 palabras). **Paráfrasis** = lo que dice la fuente en otras palabras. **Inferencia** = conclusión propia, no está en la fuente. Investigado en noviembre de 2026. Ojo: desde agosto de 2020 el cuerpo de las reseñas de Brand New está detrás de un muro de pago (paywall), así que no se pudo leer ninguna reseña completa. Las citas de reseñas puntuales salen de fuentes secundarias.

## 1. Estructura de una reseña de Brand New: qué mira primero y qué juzga con más dureza

### Takeaway
Las reseñas de Brand New tienen formato fijo: título "New Logo and Identity for [cliente] by [estudio]", un subtítulo con juego de palabras, imágenes del logo antes y después (o solo el "New") y aplicaciones de muestra. Después viene la opinión, que según Vit sigue siempre la misma estructura: la ejecución, cómo lo hace sentir el logo, el logo en sí, las aplicaciones y un resumen corto. Las encuestas a lectores existen, pero solo las ven los suscriptores. No pude confirmar en una fuente de primera mano el texto exacto de las opciones (Great/Fine/Bad).

### Cited Findings
- Categorías editoriales (cita y paráfrasis de la página About): **Reviewed** es "In-depth coverage and analysis of the most news-worthy projects", una por día. **Noted** es "Nominal coverage with a brief opinion on smaller clients or projects", una por día. **Spotted** registra rediseños sin opinión y con un solo link. **Linked** junta notas sobre historias curiosas o noticias de logos. Las Reviewed se eligen por "the size and notoriety of the client or the high quality of the design" — [Brand New About](https://www.underconsideration.com/brandnew/about)
- Tagline del sitio (cita): "A place for all who value opinion." — [Brand New](https://www.underconsideration.com/brandnew/)
- Anatomía de una reseña real (Base, agosto de 2025): etiqueta "Reviewed", un subtítulo con juego de palabras ("I'm all about that Base."), imágenes rotuladas "before" y "after", los pies de foto "Logo Before & After" y "Sample Application", rubro y etiquetas (tags) descriptivas como abstract, blue, rounded corners y square. También hay tipos de proyecto: Before-After, Follow-up, Friday Likes y New — [Brand New: Base](https://www.underconsideration.com/brandnew/archives/new_logo_and_identity_for_base_done_in_house.php)
- La suscripción incluye "full content, polls and comments" (paráfrasis de la lista del muro de pago). O sea, las encuestas y los comentarios son solo para suscriptores — [Brand New: Base](https://www.underconsideration.com/brandnew/archives/new_logo_and_identity_for_base_done_in_house.php)
- Hay muro de pago desde el 17 de agosto de 2020, después de casi 14 años abierto. Es un muro duro: el que no paga solo ve la imagen de antes y después. Quien no puede pagar puede pedir una cuenta gratis — [Anuncio del modelo de suscripción](https://www.underconsideration.com/brandnew/archives/brand_new_will_shift_to_subscription_model.php); [Pixel Envy](https://pxlnv.com/linklog/brand-new-subscription/)
- Estructura fija de la crítica (paráfrasis de una entrevista en Logo Geek): hace 3 o 4 años que usa la misma estructura de párrafos y dice que es la única forma de sacar tantas reseñas por año. Cubre **ejecución → cómo lo hace sentir → el logo → las aplicaciones → resumen corto**. Escribe corto: "people don't even read the short paragraphs" — [Logo Geek, entrevista a Armin Vit](https://logogeek.uk/?p=4525)
- Antes de escribir, separa la reacción de la reflexión (paráfrasis): la primera reacción es "esto es malo" o "esto es genial", y después se toma un rato para preguntarse por qué le gusta o no — resumen de búsqueda de [Logo Geek](https://logogeek.uk/?p=4525) y de entrevistas asociadas (no verificado palabra por palabra)
- No entrevista a los clientes. Reseña solo con lo que está publicado, para que no lo influyan explicaciones privadas (paráfrasis) — [Logo Geek](https://logogeek.uk/?p=4525)

### Inferences
- Para el crítico automático: el orden **ejecución → sensación o adecuación → logo → sistema y aplicaciones → veredicto corto** se puede usar directamente como estructura del resultado (JSON).
- Que no escuche las explicaciones del cliente es clave: el crítico tiene que juzgar **lo que se ve**, no la justificación que escribió el generador. Si el logo solo funciona con la explicación del concepto, es una falla.
- El veredicto de Brand New tiene tres niveles (bueno, correcto, malo). Vit dice que la mayoría de lo que ve es "fine", y eso sugiere una escala de 3 niveles donde "correcto pero genérico" es el caso más común.

### Gaps
- No pude verificar en una fuente de primera mano las opciones exactas de la encuesta. Por memoria de entrenamiento (sin confirmar): las reseñas nuevas votaban "Great / Fine / Bad" y las de antes y después votaban si el cambio era "Better / Equal / Worse". No hay que citarlo como dato confirmado.
- Las reseñas completas tienen muro de pago y no se pudieron leer.

## 2. Criterios y argumentos recurrentes

### Takeaway
Los ejes que más repite Vit: **ejecución y oficio** (interletrado, color, legibilidad, espaciado, reproducción en muchos medios), **adecuación emocional al cliente** ("¿se siente bien para esta empresa?"), **comparación con la competencia del rubro**, **duración más allá de la moda**, y la **fuerza del sistema y sus aplicaciones**. Le da igual si el estilo es minimalista u ornamentado, mientras sea fiel a la empresa. Critica con dureza la ola de logotipos en geométrica sin serifa, todos iguales.

### Cited Findings
- **Ejecución** (paráfrasis): mira interletrado (kerning), color, si se lee bien, si está bien espaciado y si se puede reproducir en muchos lugares — [Logo Geek](https://logogeek.uk/?p=4525)
- **Adecuación emocional** (cita): "Does it feel right for this company, product, or service?" Además se pregunta si le recuerda otra experiencia y cómo se relaciona con lo que vende la empresa (paráfrasis) — [Logo Geek](https://logogeek.uk/?p=4525)
- **Estilo neutro** (paráfrasis): que sea minimalista u ornamentado no importa, siempre que el logo se sienta fiel a la empresa — [Logo Geek](https://logogeek.uk/?p=4525)
- **Moda vs. duración** (paráfrasis): pregunta si un logo que sigue una tendencia puede durar más que ella. Da el ejemplo de un logotipo (Dream) que sigue la moda pero suma una onda que le queda bien al cliente. O sea, se acepta la tendencia si tiene un toque propio y pertinente — [Logo Geek](https://logogeek.uk/?p=4525)
- **Comparar con el rubro** (paráfrasis): compara el trabajo con otros trabajos y con lo que hace la competencia del mismo rubro, para no depender solo de su gusto — [Logo Geek](https://logogeek.uk/?p=4525)
- **La crítica a la geométrica sin serifa** (paráfrasis de un resumen de entrevista): para Vit, la peor tendencia en logos es que todos hagan lo mismo con la geométrica sin serifa, y Airbnb fue de los primeros — resumen de búsqueda sobre [How Brands Are Built](https://howbrandsarebuilt.libsyn.com/armin-vit-has-a-little-grid-in-his-mind) (el texto literal no está confirmado). En la página del episodio, el contexto (Airbnb, Google y la reacción en contra con Chobani) lo pone el conductor, no Vit — [How Brands Are Built](https://howbrandsarebuilt.libsyn.com/armin-vit-has-a-little-grid-in-his-mind)
- **Lo "fine" aburre** (paráfrasis): la mayoría de lo que ve es "fine", y eso le interesa menos que lo malo de verdad — [How Brands Are Built](https://howbrandsarebuilt.libsyn.com/armin-vit-has-a-little-grid-in-his-mind)
- **Paladar** (cita): "building your palate for identity design, how colors work, how typefaces work"; ver muchísimo trabajo, "not about copying anything" — [How Brands Are Built](https://howbrandsarebuilt.libsyn.com/armin-vit-has-a-little-grid-in-his-mind)
- **Genérico en moda** (paráfrasis secundaria): la reseña del Burberry de Peter Saville dijo que no era más distinto ni más interesante que cualquier otro logo de moda en sin serifa — resumen de búsqueda (fuente secundaria, la reseña original no fue verificada)
- **Corrección objetiva vs. cariño del público** (cita secundaria sobre Cracker Barrel, 2025): "there was nothing good about the old logo and there is nothing wrong with the new logo" — citado por Silvio Lorusso en [Dinamo, "Serif Populism"](https://abcdinamo.com/newsletter/silvio-lorusso-serif-populism-guest-essay), que justamente le discute ese planteo
- **Helvetica**: Vit escribió en Brand New por qué le desagrada la tipografía, a raíz del logo de University of the Arts London — [Gizmodo](https://gizmodo.com/why-i-hate-helvetica-5919546) (no leído completo)
- **Brand New Year in Review 2025** tiene partes dedicadas a "Recurring Trends", "Supporting Identity Elements", "Logo Evolutions, Logo Animations, Introduction Videos" y "Packaging". Eso muestra que juzga **elementos de apoyo, animación y video de presentación** como capas separadas del logo — [Year in Review 2025](https://www.underconsideration.com/brandnew/archives/tag/2025_year_in_review) (contenido con muro de pago)

### Inferences
- Lista de criterios para el modelo, en orden de peso aproximado según las fuentes:
  1. **Ejecución:** interletrado, curvas, espaciado, legibilidad, que funcione en chico y en una sola tinta.
  2. **Adecuación:** ¿se siente bien para este rubro, este cliente y este público?
  3. **Distinción en el rubro:** ¿se confunde con la competencia o con la moda del momento?
  4. **Duración:** si sigue una tendencia, ¿suma algo propio y pertinente?
  5. **Sistema y aplicaciones:** ¿la paleta, la tipografía, los elementos de apoyo y la animación están a la altura del logo, o lo superan?
  6. **Mejora** (solo en rediseños): ¿es mejor que lo anterior?
- La pregunta "¿mejora o no?" en los rediseños es central en Brand New por el formato antes/después. En BrandIA no hay "antes", salvo que el cliente tenga un logo previo. Si lo tiene, vale incluirla.
- Que se puedan reseñar por separado el sistema, las animaciones y los elementos de apoyo sugiere que Vit valora identidades donde **el sistema es más fuerte que el logo**. Que lo diga textualmente no está confirmado.

### Gaps
- No encontré citas literales sobre el ingenio (wit), los "swooshes" sin sentido o los conceptos sobreexplicados. Son críticas típicas del género, pero no hay fuente verificada de que Vit las use: tratarlas como inferencia.
- No se pudo leer "Graphic Design Referenced" (Vit y Gomez-Palacio, 2009). Es un libro de referencia histórica, no un manual de crítica.

## 3. Brand New Awards: criterios publicados y categorías

### Takeaway
El criterio publicado es corto: trabajo "conceptually strong, aesthetically flawless, and strategically smart". El jurado mezcla diseñadores y clientes, y se premia la colaboración entre cliente y diseñador. Se juzga solo la identidad, no el material del packaging.

### Cited Findings
- Criterio (cita): "conceptually strong, aesthetically flawless, and strategically smart." Ganan los proyectos bien conceptualizados, bien ejecutados y estratégicamente sólidos (paráfrasis) — [Brand New Awards FAQ](https://underconsideration.com/brandnewawards/faq.php)
- Jurado (paráfrasis): cinco personas en persona, "a seldom seen combination of designers and clients". En 2013 eran tres diseñadores y dos clientes — [FAQ](https://underconsideration.com/brandnewawards/faq.php); [Awards 2013](https://www.underconsideration.com/brandnewawards/online/2013/?p=8)
- Los premios distinguen la colaboración entre el cliente y su diseñador. Los ganadores debían presentar una declaración del cliente (paráfrasis) — [Awards 2013](https://www.underconsideration.com/brandnewawards/online/2013/?p=8)
- Querían un proceso más crítico, que premie lo que aguanta un análisis profundo y no solo fotos lindas de aplicaciones (paráfrasis) — resumen de búsqueda sobre las [reglas de los Awards](https://underconsideration.com/brandnewawards/rules.php)
- Alcance: "focus solely on identity design"; no se evalúa el material del envase ("the obscure plastic") — [FAQ](https://underconsideration.com/brandnewawards/faq.php)
- Un mismo proyecto puede competir en varias categorías, por ejemplo como logo solo y como programa de identidad. Hubo categorías como "comprehensive identity programs" y "salvage" — [FAQ](https://underconsideration.com/brandnewawards/faq.php); [2011, comprehensive identity programs](https://underconsideration.com/brandnewawards/online/2011/category/professional/comprehensive-identity-programs-professional); [2010, salvage](https://underconsideration.com/brandnewawards/online/2010/category/salvage)

### Inferences
- La tríada **concepto, estética y estrategia** sirve como las tres notas principales del crítico: idea, ejecución impecable y adecuación estratégica al negocio.
- Lo de "no premiar fotos lindas de aplicaciones" se traduce así: el crítico **no** tiene que dejarse llevar por maquetas (mockups) bonitas generadas por IA. Tiene que evaluar el logo y el sistema despojados.

### Gaps
- No hay una rúbrica con puntajes publicada. La información más completa que encontré es de 2010 a 2014. No verifiqué si los Awards siguen vigentes en 2026.

## 4. Fallas frecuentes que marca

### Takeaway
Con fuente verificada: mala ejecución (interletrado, espaciado, legibilidad), falta de adecuación al negocio, seguir la moda sin aporte propio (la geométrica sin serifa homogénea) y lo genérico e intercambiable con la competencia. El resto son inferencias razonables.

### Cited Findings
- Ejecución pobre, logo que no le queda al negocio y moda que no va a durar (paráfrasis de lo que señala en la entrevista) — [Logo Geek](https://logogeek.uk/?p=4525)
- Homogeneidad de la geométrica sin serifa (paráfrasis secundaria) — [How Brands Are Built](https://howbrandsarebuilt.libsyn.com/armin-vit-has-a-little-grid-in-his-mind)
- El debate sobre el "blanding" (marcas que se vuelven sosas e iguales) lo arma la crítica en general. No encontré que Vit haya inventado el término — [D&AD](https://www.dandad.org/insights/features/beyond-sans-serif-how-type-can-move-blanding-awards-insights); [The Fashion Law](https://www.thefashionlaw.com/?p=102198)

### Inferences
Checklist propuesto para un modelo de visión y lenguaje (VLM). Cada ítem es pasa, dudoso o falla, con una frase que lo justifique:
1. **Interletrado y espaciado:** ¿hay pares de letras desparejos o espacios ópticos desiguales en el logotipo?
2. **Curvas y trazos:** ¿hay nodos torcidos, grosores inconsistentes o uniones feas? (Típico de la IA: artefactos, letras deformes, texto mal escrito.)
3. **Equilibrio óptico:** ¿el símbolo y el logotipo pesan parecido? ¿El símbolo está centrado ópticamente?
4. **Legibilidad y reducción:** ¿se lee a 16 px y a una sola tinta? ¿Funciona en blanco y negro?
5. **Adecuación:** ¿transmite el rubro, el público y la personalidad que contó el cliente? ¿"Se siente bien" para este negocio?
6. **Distinción:** ¿podría ser de cualquier competidor? ¿Es una geométrica sin serifa genérica sin ningún gesto propio?
7. **Moda:** si sigue una tendencia actual, ¿tiene un detalle propio y pertinente que lo haga durar?
8. **Idea:** ¿hay una idea que se entiende sin explicación? Si solo funciona leyendo la justificación, se marca. (Esto es inferencia, a partir de que Vit no lee explicaciones privadas.)
9. **Sistema:** ¿la paleta, las tipografías y los elementos de apoyo son coherentes entre sí y con el logo? ¿El sistema suma más que el logo solo?
10. **Aplicaciones:** ¿funciona en el feed, en el perfil circular, en el packaging y en la web? Juzgarlo despojado, sin dejarse llevar por la maqueta.
11. **Lecturas no deseadas:** ¿se puede confundir con un símbolo ofensivo o con una marca conocida? (Viene de Bierut, sección 6.)
12. **Veredicto:** bueno, correcto o malo, con los 2 o 3 cambios concretos que más mejorarían el resultado.

### Gaps
- No hay fuente verificada de que Vit critique explícitamente los "swooshes" o los conceptos sobreexplicados.

## 5. Críticas al enfoque de Brand New y uso del contenido (copyright)

### Takeaway
El propio Vit reconoce que su crítica es subjetiva y que tiene sesgos. Los comentarios de Brand New tienen fama de agresivos y él mismo admite que en los hilos largos muchos no aportan. Hay críticos que le discuten su vara "objetiva" (el caso Cracker Barrel). El contenido tiene muro de pago y es propiedad de UnderConsideration: solo se parafrasean criterios.

### Cited Findings
- Sesgo admitido (cita): "I have biases, I am influenced by things that I like" (paráfrasis del resto: a veces es más suave con gente que conoce). Su objetivo (cita): "I don't want people to agree with me" — [Logo Geek](https://logogeek.uk/?p=4525)
- Sobre los comentarios: en Twitter a veces se dice que la peor gente del diseño está en los comentarios de Brand New (paráfrasis de un resumen de búsqueda). Vit escribió que en los hilos de más de 150 comentarios, la mitad no son los más constructivos (paráfrasis) — [Logo Geek](https://logogeek.uk/?p=4525); [Actualización del modelo de suscripción](https://www.underconsideration.com/brandnew/archives/subscription_model_updates.php)
- Lorusso discute su lectura "objetiva" del caso Cracker Barrel: los expertos aprobaban el logo nuevo mientras los clientes de siempre lo rechazaban — [Dinamo](https://abcdinamo.com/newsletter/silvio-lorusso-serif-populism-guest-essay). Una encuesta de UserTesting a 200 personas: el 69 % sintió más auténtico el logo viejo y la queja principal fue que el nuevo era aburrido — [UserTesting](https://www.usertesting.com/blog/cracker-barrel-logo-survey-reactions)
- Sesgo de selección (paráfrasis): prioriza clientes conocidos. Para los clientes chicos, el trabajo tiene que ser rompedor — [How Brands Are Built](https://howbrandsarebuilt.libsyn.com/armin-vit-has-a-little-grid-in-his-mind); [Logo Geek](https://logogeek.uk/?p=4525)
- Copyright: no encontré términos de uso públicos en las páginas leídas, y el pie de página no tiene aviso legal. El contenido de opinión es pago desde 2020 — [Brand New: Base](https://www.underconsideration.com/brandnew/archives/new_logo_and_identity_for_base_done_in_house.php); [Anuncio de suscripción](https://www.underconsideration.com/brandnew/archives/brand_new_will_shift_to_subscription_model.php)

### Inferences
- Para BrandIA: el crítico **no debe** presentarse como "Armin Vit" ni usar la marca Brand New (sería suplantación y riesgo legal). Se puede decir "inspirado en criterios de crítica de identidad publicados". No hay que copiar textos de reseñas ni el formato de la encuesta como si fuera de ellos.
- El caso Cracker Barrel enseña que la corrección técnica no alcanza: también hay que medir el apego emocional y la autenticidad para el público del cliente. El crítico debería pesar lo que contó el cliente en la entrevista por encima de la "corrección de diseñador".
- Como la crítica es subjetiva, conviene que el crítico automático justifique cada falla con algo **observable** (por ejemplo, "la 'a' y la 'r' están más juntas que el resto") y no con "no me gusta".

### Gaps
- No encontré términos de servicio formales de UnderConsideration. Asumir todos los derechos reservados.

## 6. Secundario: Michael Bierut y Steven Heller

### Takeaway
Para Bierut, el logo es un "recipiente vacío" que gana sentido con el uso. Lo que importa es que sea **apropiado** para su propósito y su público, y valora la simplicidad extrema. Sobre Heller no encontré criterios publicados concretos.

### Cited Findings
- Bierut (cita): "empty vessels into which meaning is poured"; "one of the few things that appreciate in value as they're used" — [99% Invisible, transcripción](https://99percentinvisible.org/episode/negative-space-logo-design-michael-bierut/transcript)
- Adecuación (cita): "really appropriate for its purpose – fits the team, fits the audience." Sobre The Met: algo limpio y simple no le haría justicia (paráfrasis). O sea, lo simple no siempre es lo correcto — [99% Invisible](https://99percentinvisible.org/episode/negative-space-logo-design-michael-bierut/transcript)
- Simplicidad (cita): "so simple that a first grader could do it with construction paper" — [99% Invisible](https://99percentinvisible.org/episode/negative-space-logo-design-michael-bierut/transcript)
- Lecturas no deseadas (paráfrasis): si alguien ve una esvástica en un diseño geométrico, ese logo no se presenta — [99% Invisible](https://99percentinvisible.org/episode/negative-space-logo-design-michael-bierut/transcript)
- Bierut (paráfrasis de un resumen del video de Vox): el debate público sobre logos nuevos se queda en la reacción estética inmediata, como si fuera una competencia de clavados; él separa los logos en logotipos, pictóricos y abstractos — [Vox / Rosetta](https://rosetta.to/u/vox/what-makes-a-truly-great-logo) (no verificado de primera mano)
- Heller: el origen de los logos se remonta a la antigüedad. El logo es ante todo un identificador que representa quién es la entidad (paráfrasis) — [Logo Design Love](https://www.logodesignlove.com/art-origins-logo-design)

### Inferences
- La idea del "recipiente vacío" le pone un límite al crítico: no hay que exigirle a un logo nuevo que "cuente toda la historia". Alcanza con que sea apropiado, distintivo y bien hecho.
- Del caso de The Met sale una regla: la simplicidad se evalúa en relación con el rubro. Un museo, un artesano o una marca de lujo pueden pedir más complejidad.

### Gaps
- El ensayo de Bierut en Design Observer ("Graphic Design Criticism as a Spectator Sport") dio error 404 y no se pudo leer. No hay criterios de Heller verificados.
