# Técnicas de logo e identidad de los maestros → reglas para el motor de BrandIA

Notas de investigación (noviembre 2026). Convención: **"Cited Findings"** = dicho por una fuente enlazada. **"Inferences"** = conclusión propia o conocimiento previo del oficio **no verificado en línea en esta búsqueda** (marcado como tal). Muchas fuentes prácticas son blogs de estudios o de vendedores de herramientas: se indica cuando pesa.

---

## (a) Taxonomía de logos y métodos de construcción: cuándo usar cada uno

### Takeaway
La tipología más útil para pymes es la de Chaves y Belluccia (logotipo puro, logotipo con fondo, logotipo con accesorio, logotipo con símbolo, logo-símbolo, símbolo solo). El símbolo solo queda reservado a marcas con altísimo posicionamiento. Para una pyme nueva, la opción por defecto es un logotipo (wordmark) bien dibujado, con o sin símbolo separable.

### Cited Findings
- Chaves organiza los identificadores en tres grandes tipos: **símbolo solo** (reservado a marcas de altísimo posicionamiento: Cruz Roja, Mercedes-Benz, Lacoste), **logotipo con símbolo** (texto e ícono separables) y **logo-símbolo** (texto y símbolo forman una unidad inseparable) — [Platzi, curso sobre tipología marcaria según Chaves](https://platzi.com/cursos/estrategia-empresas/tipologia-marcaria-y-aplicaciones-en-dis/)
- La clasificación ampliada de Chaves separa **identificadores nominales** (logotipo puro, logotipo con fondo, logotipo con accesorio) de **identificadores simbólicos** (logo-símbolo, logotipo con símbolo) — [Artículo académico, ECA-USP](https://www.eca.usp.br/acervo/producao-academica/002450030.pdf)
- Chaves y Belluccia (2008) definen el identificador corporativo como el signo visual de cualquier tipo (logotipo, símbolo, monograma, mascota, etc.) cuya función es individualizar a una entidad — [búsqueda: varias tesis que citan La marca corporativa](https://dialnet.unirioja.es/descarga/articulo/9233609.pdf)
- **Logo responsive:** Joe Harrison (proyecto Responsive Logos, c. 2014) propone 5 o 6 niveles estructurados. Al achicarse, la marca **pierde elementos** en lugar de escalar: Disney pierde el castillo, después "Walt", hasta quedar solo la "D". En pantallas mínimas queda la D de Disney, la pipa de Nike o la estrella de Heineken. Técnica: sprites en un SVG con media queries — [Marketing Mag](https://www.marketingmag.com.au/news/intricacies-of-responsive-design-the-scalable-logo-study/); [Kottke](https://kottke.org/15/01/responsive-logos-and-abstraction-in-design); [JUST Creative](https://justcreative.com/the-designers-guide-to-responsive-logos/)
- **Identidad dinámica/generativa:** MIT Media Lab (E Roon Kang y Richard The) usó un algoritmo que remezcla focos de color en 40.000 formas y 12 combinaciones de color. Casa da Música (Sagmeister, 2007) tomó la forma del edificio como logo, que cambia de aplicación en aplicación — [Icon Eye](https://www.iconeye.com/?p=9420); [Sagmeister & Walsh](https://sagmeister.com/work/casa-da-musica/)

### Inferences
- *(Conocimiento previo, coincide con la terminología anglosajona de Wheeler/Airey; no verificado en esta búsqueda.)* Equivalencias: wordmark = logotipo puro; lettermark/monograma = logotipo reducido a iniciales; emblema/escudo = logotipo con fondo o logo-símbolo cerrado; combination mark = logotipo con símbolo; símbolo abstracto o pictórico = símbolo solo.
- **Regla de decisión para BrandIA (inferencia):**
  1. **Por defecto, logotipo puro o con accesorio mínimo.** Una pyme nueva no tiene la notoriedad que necesita un símbolo solo para funcionar (Chaves) y su nombre es su activo principal.
  2. **Logotipo + símbolo separable** cuando el negocio necesita avatar de redes, favicon o sello de producto (casi siempre en BrandIA, por el módulo B y BranderIA). El símbolo debe salir del nombre (inicial, letra modificada) o de una idea única del negocio, nunca del rubro genérico.
  3. **Monograma** solo si el nombre es largo (más de unas 12 letras) o tiene varias palabras.
  4. **Emblema/sello** cuando el rubro lo pide (cervecería, almacén, café, producto artesanal), porque se aplica bien en etiquetas y packaging. Siempre con una versión simplificada para tamaños chicos.
  5. **Identidad dinámica** no como logo cambiante, sino como un **sistema** de elementos (patrones, recortes, color) que varía alrededor de un núcleo fijo. Para pymes es más seguro que un logo que muta.
  6. **Siempre generar el juego responsive:** completo → horizontal/apilado → símbolo o monograma → favicon de 16 px.

### Gaps
- No pude leer el texto original de Chaves y Belluccia (*La marca corporativa*, Paidós 2003) ni de *Identify* (Chermayeff & Geismar & Haviv, 2011), *Logo* (Evamy) o *Logo Modernism* (Müller, Taschen): son libros pagos sin versión abierta. Las reglas de cuándo usar cada tipo son síntesis secundaria.

---

## Criterios de evaluación de los maestros (base del "crítico de marca")

### Takeaway
Hay coincidencia fuerte entre Rand, Chermayeff & Geismar & Haviv y Chaves: **apropiado, distintivo/memorable, simple, reproducible en un color y en tamaño mínimo, y duradero**. Chaves agrega un vocabulario fino que sirve como rúbrica para un crítico automático.

### Cited Findings
- Paul Rand ("Logos, Flags, and Escutcheons", AIGA 1991, texto completo y gratis en paulrand.design): el logo debe señalar y designar de la forma más simple posible. Los diseños intrincados tienen una debilidad de origen. Las cualidades que pide son distintividad, visibilidad, memorabilidad, durabilidad, usabilidad, universalidad y atemporalidad. El significado viene de lo que representa: "A logo derives its meaning from the quality of the thing it symbolizes". Su único requisito firme: atractivo y reproducible en un color y en tamaños muy chicos — [paulrand.design](https://www.paulrand.design/writing/articles/1991-logos-flags-and-escutcheons.html)
- Rand dice que la relación literal con el rubro no es necesaria. Pone como ejemplo las reacciones iniciales negativas a logos después famosos (las rayas de IBM, Westinghouse) — [paulrand.design](https://www.paulrand.design/writing/articles/1991-logos-flags-and-escutcheons.html)
- Sagi Haviv (Chermayeff & Geismar & Haviv): un buen logo es **apropiado** (la personalidad encaja; "apropiado" no significa "expresivo", porque un logo dice poco), **distintivo y memorable** (pasa el "doodle test": lo viste una o dos veces y podés dibujarlo de memoria) y **simple** (se puede reproducir en cualquier tamaño). Los tres se equilibran entre sí: simple y distintivo tiran en direcciones opuestas — [Medium, resumen de la charla "The 3 Rules of Good Logo Design"](https://medium.com/designorex/the-3-rules-of-good-logo-design-9ccc05567310); [Domestika](https://www.domestika.org/en/blog/5875-how-to-identify-a-good-logo); [TEDxPenn de Haviv, Logo Geek](https://logogeek.uk/en/sagi)
- Lista de parámetros de rendimiento atribuida a Chaves: calidad gráfica genérica, ajuste tipológico, corrección estilística, compatibilidad semántica, suficiencia, versatilidad, vigencia, reproducibilidad y legibilidad — [tesis UNAM (lista en búsqueda)](https://ru.dgb.unam.mx/bitstream/20.500.14330/TES01000317314/3/0317314.pdf). Un resumen secundario agrega singularidad y declinabilidad — [Scribd, resumen](https://es.scribd.com/document/1069122238/Marca)
- Chaves (ForoAlfa, 2011, "La marca: ¿vestimenta o disfraz?") critica que perseguir la novedad produjo marcas que se parecen entre sí, funcionan mal y tienen muy baja calidad gráfica — [resumen de la búsqueda; ForoAlfa](https://foroalfa.org)
- Armin Vit (Brand New): primero una reacción estética, de gusto. Un buen logo se entiende al instante y tiene una explicación sólida y simple. El error común es no destacarse. Valora el sistema completo, no solo el wordmark — [Creative Bloq](https://www.creativebloq.com/advice/5-expert-tips-to-design-the-perfect-logo)

### Inferences
- *(Definiciones de conocimiento previo de La marca corporativa; las tres últimas, pregnancia, vocatividad e inteligibilidad, no aparecieron en ninguna fuente en línea: verificar con el libro.)* Rúbrica de Chaves aplicable por un crítico IA:
  - **Calidad gráfica genérica:** oficio del dibujo, más allá del estilo (curvas, pesos, espaciado).
  - **Ajuste tipológico:** el tipo elegido (logotipo, símbolo, etc.) es el que conviene a esta organización.
  - **Corrección estilística:** el estilo corresponde al posicionamiento (no "lujo" para una ferretería barrial ni "infantil" para un estudio contable).
  - **Compatibilidad semántica:** no contradice lo que la marca es y evita connotaciones indeseadas (no tiene que "contarlo todo").
  - **Suficiencia:** tiene los signos necesarios y ni uno más.
  - **Versatilidad:** convive con distintos discursos y soportes.
  - **Vigencia:** durable, no atada a la moda del año.
  - **Reproducibilidad:** funciona en un color, en bordado, en sello, en 16 px.
  - **Legibilidad:** el nombre se lee bien.
  - **Inteligibilidad:** se entiende qué es (sobre todo los símbolos).
  - **Pregnancia:** se recuerda (el "doodle test" de Haviv).
  - **Vocatividad:** capacidad de llamar la atención, que debe ser la justa para el tipo de entidad.
  - **Singularidad:** distinto de la competencia del rubro.
  - **Declinabilidad:** permite armar un sistema (submarcas, iconos, variantes).
- Estos criterios cruzados con Rand y Haviv dan un núcleo de cinco preguntas no negociables: ¿apropiado?, ¿distinto del rubro?, ¿simple y dibujable de memoria?, ¿funciona en un color y a 16 px?, ¿se lee el nombre?

### Gaps
- No se encontró un texto público de Chaves con las 14 definiciones completas. Brand New no publica una rúbrica formal: su criterio es de opinión.

---

## (b) Técnicas concretas de refinamiento

### Takeaway
Lo que separa un logo profesional de uno amateur está en el último 10 %: correcciones ópticas (la vista manda sobre la geometría), espaciado manual del wordmark, versiones específicas por tamaño y fondo, y construcción con formas simples controladas. La "proporción áurea" en logos famosos es un mito.

### Cited Findings
- **Corregir a ojo:** la grilla es un punto de partida, no una regla. En la "G" de Google, la versión geométricamente perfecta se ve desbalanceada — [Logo Geek, "Optical corrections every logo designer should know"](https://logogeek.uk/?p=2617)
- **Overshoot:** las formas redondas se dibujan un poco más altas que las planas, por encima de la línea de mayúsculas y por debajo de la base. Un círculo de la misma altura que un cuadrado parece más chico. El concepto se acredita a Tobias Frere-Jones (*Typeface Mechanics*) — [Logo Geek](https://logogeek.uk/?p=2617); [LogoDesign.net](https://www.logodesign.net/blog/?p=2808)
- **Irradiación:** un logo blanco sobre fondo oscuro se ve más pesado que el mismo en negro sobre blanco. La versión invertida se adelgaza a ojo. No alcanza con cambiar el color — [Logo Geek](https://logogeek.uk/?p=2617); [LogoDesign.net](https://www.logodesign.net/blog/?p=2808)
- **Gestalt y espacio negativo:** cierre, proximidad, continuidad, semejanza y figura-fondo (ejemplo: el panda de WWF, armado con formas separadas que el ojo completa) — [Logo Geek](https://logogeek.uk/?p=2617)
- **Kerning manual en logos:** el kerning automático, por métricas u óptico, interpreta mal las formas personalizadas, así que en un logo el espaciado se ajusta a mano. Los trazos finos (como en Vogue) necesitan más aire para no perderse junto a los gruesos. Los números (por ejemplo "desde 1998") deben compartir peso, ángulo y curvas con las letras — [LogoDesign.net](https://www.logodesign.net/blog/?p=2808)
- **Mito de la proporción áurea:** David Cole mostró que el logo de Apple se dibujó prácticamente a mano y que la mayoría de sus curvas grandes no son arcos de círculo. Solo "cumple" la proporción áurea si se cambia la definición — [Core77](https://www.core77.com/posts/24920/quoras-david-cole-settles-the-apple-logo-golden-ratio-issue-once-and-for-all-24920); [Cult of Mac](https://www.cultofmac.com/227961/was-apples-logo-really-designed-using-the-golden-ratio/). Fast Company la llama "el mayor mito del diseño" — [Fast Company](https://www.fastcompany.com/3044877/the-golden-ratio-designs-biggest-myth)
- **Reducción:** ver el juego responsive de Harrison en (a). Rand pide un color y tamaño mínimo (arriba)
- **Vignelli Canon** (gratis en PDF, RIT Vignelli Center): sus principios son pocas tipografías, grilla, disciplina, apropiado y atemporal — [PDF oficial RIT](https://www.rit.edu/vignellicenter/sites/rit.edu.vignellicenter/files/documents/The%20Vignelli%20Canon.pdf); [UX Collective](https://uxdesign.cc/the-vignelli-canon-a-design-classic-from-the-last-of-the-modernists-74d6e7dc0169)

### Inferences
- *(Oficio conocido, no verificado en esta búsqueda.)* Otras técnicas para traducir a reglas:
  - **Ink traps / contraste de trazo:** en las uniones de trazos se abre una muesca para que, en tamaños chicos o impreso, no se "empaste". Los trazos horizontales se dibujan algo más finos que los verticales para que se vean iguales.
  - **Lettering propio vs. tipografía de catálogo:** el estándar profesional es partir de una tipografía y **modificarla** (una ligadura, un terminal, una letra clave intervenida). Así el wordmark es propio pero legible. Un nombre escrito en una fuente popular sin tocar, como Montserrat o Poppins, es lo más genérico posible.
  - **Primitivas geométricas:** círculo, cuadrado, triángulo y arcos, con pocos radios repetidos. Le da coherencia y hace que sea reproducible (Logo Modernism, Chermayeff & Geismar, Aicher).
  - **Modularidad:** un módulo que se repite y genera el símbolo, los iconos y los patrones (Wyman en México 68, pictogramas de Aicher en Múnich 72).
  - **Ingenio (Alan Fletcher) y expresión tipográfica (Paula Scher):** una sola idea visual inteligente vale más que muchos elementos.
  - **Bass:** reducir a una forma y una idea, con color plano.
  - **Crouwel:** construir con grilla como sistema, no como adorno.
- **Para el motor**, como los modelos de imagen no hacen kerning ni overshoot confiables, conviene que el logotipo **no salga del modelo de imagen**. Mejor componerlo en SVG con una tipografía real (con licencia libre, por ejemplo Google Fonts), con espaciado ajustado por código (tracking del wordmark, kerning de pares problemáticos como AV, LT, To y rn) y alguna intervención paramétrica. El símbolo se puede generar o vectorizar aparte y después pasar por pruebas de reducción.

### Gaps
- No se consultó *Typeface Mechanics* de Frere-Jones ni ensayos específicos de Bierut (Design Observer) sobre logos. Tampoco se encontró una fuente abierta que documente las técnicas de Bass, Fletcher, Scher, Aicher, Crouwel y Wyman con detalle técnico: lo de arriba es conocimiento general.

---

## (c) Fallas típicas de logos de IA o amateur y cómo las evitan los profesionales

### Takeaway
Las críticas se repiten: logos genéricos armados con íconos y fuentes de stock, motivos sobreusados (pipas, hojas en círculo, bombitas), cero estrategia, falla al reducir o pasar a un color, raster en vez de vector y riesgo legal. Casi todo se previene con pruebas mecánicas más un paso de crítica contra la rúbrica.

### Cited Findings
- Las herramientas de IA se apoyan en plantillas y patrones existentes y dan logos genéricos, de molde. "Kit-bashing" de íconos y fuentes de stock en lugar de diseño — [DEV Community](https://dev.to/techresolve/solved-please-stop-recommending-chatgpt-for-logo-design-5beg); [The Logo Company](https://thelogocompany.net/?p=129362)
- Un logo es débil si su identidad descansa en un recurso compartido por cientos de negocios (pipas genéricas, círculos de hojas) — [Renderforest](https://www.renderforest.com/blog/will-my-ai-logo-be-unique); motivos sobreusados — [Dribbble, "overused logos"](https://dribbble.com/stories/2021/08/18/overused-logos)
- Falta de estrategia: la IA genera lo que le pedís, el diseñador pregunta por qué. Soluciones de una dimensión para problemas de muchas — [Studio Sullivan](https://thestudiosullivan.squarespace.com/blog/5-reasons-not-to-use-an-ai-logo-generator)
- Fallan al cambiar de tamaño, al simplificarse o al adaptarse. Además se fechan rápido por seguir modas y salen en raster — [The Logo Company](https://thelogocompany.net/?p=129362); [HackerNoon](https://sia.hackernoon.com/why-your-ai-generated-logos-still-feel-off)
- Riesgo legal: los logos generados por IA pueden no tener protección de derechos de autor, y hay riesgo de cartas de intimación si se parecen a una marca existente — [resumen de la búsqueda, varias fuentes](https://www.renderforest.com/blog/will-my-ai-logo-be-unique)
- Contrapunto: una comparación de 2026 sostiene que la crítica de genericidad era cierta en 2023 y lo es mucho menos en 2026. La fuente es un vendedor de IA, así que tiene interés comercial — [Lovart](https://www.lovart.ai/it/blog/04-cluster-ai-logo-vs-human-designer)
- **Evaluación automática:** JN-Logo (MDPI *Electronics*, 2022) tiene 14.917 logos con puntajes estéticos de 0 a 5 votados por 150 estudiantes de posgrado. Los autores dicen que no hay bases de logos públicas de calidad. Un revisor señaló que el dataset no estaba disponible y que la precisión de clasificación era menor a 0,6 — [MDPI](https://www.mdpi.com/2079-9292/11/19/3248); [informe de revisión](https://www2.mdpi.com/2079-9292/11/19/3248/review_report)
- AesEval-Bench (ICLR 2026) evalúa si los modelos de visión y lenguaje pueden juzgar la estética de piezas gráficas y encuentra brechas claras frente a lo que exige una evaluación fina — [arXiv 2603.01083](https://arxiv.org/pdf/2603.01083); [Microsoft Research](https://www.microsoft.com/en-us/research/?p=1163852)

### Inferences
- **Lista de fallas para detectar (inferencia, síntesis):**
  1. Ícono literal del rubro (taza para café, diente para dentista, casita para inmobiliaria) sin giro propio.
  2. Pipa, hoja, gota, bombita, engranaje o globo terráqueo genéricos.
  3. Degradés, sombras, brillos y 3D en la versión principal.
  4. Exceso de detalle que desaparece a 16 px.
  5. Texto mal escrito o letras "derretidas" (típico de los modelos de imagen).
  6. Espaciado irregular entre letras.
  7. Dos o tres tipografías dentro del logo.
  8. Símbolo y texto de estilos incompatibles (pictograma detallado con texto geométrico fino).
  9. Más de tres colores.
  10. Raster con fondo y sin vector.
  11. Parecido a una marca famosa.
  12. Elementos centrados "flotando" sin relación de tamaño.
- Como los modelos de visión todavía juzgan mal la estética fina (AesEval-Bench), el crítico debería combinar **pruebas mecánicas medibles** con **juicio del modelo contra una rúbrica explícita**, sin pedirle un puntaje estético libre.

### Gaps
- No encontré estudios cuantitativos independientes sobre la frecuencia de cada falla en logos de IA. Casi todas las fuentes son de agencias o herramientas con interés comercial.

---

## (d) Más allá del logo: sistemas, activos distintivos e identidades flexibles

### Takeaway
La evidencia de marketing (Ehrenberg-Bass) dice que lo que importa es un set de **activos distintivos** (color, forma, tipografía, personaje, patrón, sonido) que sean **únicos** del rubro y que la gente **asocie** con la marca. La unicidad pesa más que la fama. Las identidades de los maestros son sistemas que se declinan.

### Cited Findings
- Romaniuk (*Building Distinctive Brand Assets*, Oxford UP, 2018): un activo distintivo tiene que ser **único** (evoca solo esa marca) y **famoso** (la gente lo asocia). De los dos, la unicidad es la más importante — [Ehrenberg-Bass, "Brands of Distinction"](https://marketingscience.info/brands-of-distinction)
- Grilla fama × unicidad, según un resumen secundario: alta-alta = proteger; fama alta y unicidad baja = señal compartida del rubro, a afinar; fama baja y unicidad alta = emergente, a invertir; baja-baja = no es activo — [Umbrex](https://umbrex.com/resources/frameworks/marketing-frameworks/distinctive-brand-assets-framework-ehrenberg-bass/)
- La fama se mide sin pistas: preguntar con pistas infla los puntajes hasta unos 20 puntos. La unicidad depende en gran parte de lo que hace la competencia — [Contagious, entrevista a Romaniuk](https://contagious.com/io/article/jenni-romaniuk-on-distinctive-assets)
- Romaniuk advierte que apoyarse en el "significado" puede debilitar los activos distintivos: lo que importa es el vínculo con la marca, no que el activo "comunique" algo — [Marketing Week](https://www.marketingweek.com/jenni-romaniuk-meaning-distinctive-assets/0/)
- Wheeler (*Designing Brand Identity*) enumera ideales de identidad: visión, significado, autenticidad, diferenciación, durabilidad (o sostenibilidad, según la edición), coherencia, flexibilidad, compromiso y valor. El método tiene cinco fases — [índice, Universität Liechtenstein](https://toc.uni.li/FLMF039378.pdf); [Ulster](https://blogs.ulster.ac.uk/emmg/2021/05/06/ixd103-literature-review-designing-brand-identity-alina-wheeler/)
- Identidades flexibles de referencia: MIT Media Lab (algoritmo con 40.000 variantes) y Casa da Música (la forma del edificio como núcleo que varía) — ver (a)
- Haviv, en "Visual Identities: More Than Just A Logo" (TEDxPenn): la identidad es más que el logo — [Logo Geek](https://logogeek.uk/en/sagi)

### Inferences
- **Para BrandIA:** el brandbook no debería ser "logo + paleta" sino un **kit de activos distintivos**:
  1. Un color propio poco usado en el rubro, como Uruguay: si todas las inmobiliarias son azules, no azul.
  2. Una tipografía de titulares con carácter.
  3. Un recurso gráfico declinable (patrón, recorte, forma derivada del símbolo, marco).
  4. Un estilo fotográfico o de ilustración.
  5. La voz.
  El motor puede chequear la unicidad comparando con la competencia que se detecte, por ejemplo con la librería de anuncios de Meta o con la búsqueda de competencia de la web del cliente.
- Que el feed (módulo B) **repita siempre los mismos 2 o 3 activos** es lo que construye la fama (Sharp/Romaniuk). Conviene fijarlos en el brief y prohibir al generador de contenidos inventar estilos nuevos.
- *(Conocimiento previo, no verificado aquí.)* Neumeier (*The Brand Gap*): la marca es lo que la gente siente que es, no lo que la empresa dice. Usa la "prueba del intercambio" (si cambiás tu nombre por el de un competidor y el mensaje sigue andando, no es distintivo). Olins (*On Brand*): producto, entorno, comunicación y comportamiento.

### Gaps
- No se leyeron en línea *How Brands Grow* (Sharp), *The Brand Gap* ni *On Brand*: son libros pagos.

---

## (e) Fuentes, acceso y licencias

### Takeaway
Hay pocas fuentes realmente libres. Las más valiosas y gratis son los ensayos de Rand, el Vignelli Canon (PDF de RIT), ForoAlfa (en español, con Chaves y Belluccia), Brand New, Design Observer y Logo Geek. Los libros canónicos son pagos.

### Cited Findings
- **Paul Rand**, ensayos completos y gratis en paulrand.design ("Logos, Flags, and Escutcheons", 1991; *Some Thoughts… Some Logos*; *Thoughts on Design*) — [Artículos](https://paulrand.design/writing/articles); [Some Thoughts…](https://www.paulrand.design/writing/books/some-thoughts-some-logos.html). También aparece en la antología *Looking Closer* (Allworth) — [resumen de la búsqueda](https://blog.jim-nielsen.com/2016/paul-rand-on-logos/)
- **The Vignelli Canon:** PDF gratis, ofrecido por RIT Press (sin fines de lucro), en el Vignelli Center. En papel lo edita Lars Müller (2010 y 2017). Evitar los espejos dudosos — [PDF RIT](https://www.rit.edu/vignellicenter/sites/rit.edu.vignellicenter/files/documents/The%20Vignelli%20Canon.pdf); [Lars Müller](https://www.lars-mueller-publishers.com/vignelli-canon)
- **Brand New (UnderConsideration):** reseñas de opinión de identidades, con archivo por industria (Reviewed / Noted / Spotted). Lectura libre, con algunas reseñas largas solo para socios (verificar) — [archivo](https://underconsideration.com/brandnew/archives/industry/technology/index.php?page=22)
- **ForoAlfa:** columnas de Chaves en español, por ejemplo "La marca: ¿vestimenta o disfraz?" (2011) — [ForoAlfa](https://foroalfa.org)
- **Logo Geek** (Ian Paget): artículos de correcciones ópticas y entrevistas (Haviv) — [Logo Geek](https://logogeek.uk/?p=2617)
- **Libros pagos (no abiertos):** Romaniuk, *Building Distinctive Brand Assets* (OUP 2018) — [OUP](https://www.oup.com.au/books/higher-education/management-and-marketing/9780190311506-building-distinctive-brand-assets); Wheeler, *Designing Brand Identity* (Wiley) — [Skillsoft](https://skillsoft.com/book/designing-brand-identity-an-essential-guide-for-the-whole-branding-team-fourth-edition-228536e0-f167-11e6-9684-0242c0a80902)
- **Investigación:** JN-Logo (MDPI, acceso abierto) — [MDPI](https://www.mdpi.com/2079-9292/11/19/3248); AesEval-Bench (arXiv) — [arXiv](https://arxiv.org/pdf/2603.01083)

### Inferences
- *(Conocimiento previo, no verificado en esta búsqueda.)* También valen: Design Observer (ensayos de Bierut, gratis); AIGA Eye on Design (gratis); el blog Logo Design Love de David Airey (gratis, y el libro es pago); Smashing Magazine; los canales de YouTube The Futur y Pentagram; Chermayeff & Geismar & Haviv (cghnyc.com, casos con explicación). Libros pagos: *Identify* (C&G&H), *Logo* (Evamy, Laurence King), *Logo Modernism* (Müller, Taschen), *Logo Design Love* (Airey), *La imagen corporativa* (Chaves, GG), *La marca corporativa* (Chaves y Belluccia, Paidós), *La marca país en América Latina* (Chaves).
- **Licencias:** ninguna de estas fuentes está bajo licencia abierta (Creative Commons). Se pueden **leer y resumir** para escribir reglas propias, pero no copiar textos ni imágenes de logos en el producto. Las tipografías que use el motor tienen que ser de licencia libre (OFL de Google Fonts) para que el cliente pueda usar su logo comercialmente.

### Gaps
- No confirmé el estado actual de pago o acceso libre de Brand New ni del blog de Airey en 2026.

---

## Cómo convertirlo en reglas de prompt y en un "crítico de marca" automático

### Takeaway
Conviene separar **generación**, **pruebas mecánicas** y **crítica con rúbrica** (Rand + Haviv + Chaves), con un ciclo de corrección. Para el logotipo, componer con tipografía real en SVG en lugar de dejar que el modelo de imagen "dibuje" letras.

### Cited Findings
- Los requisitos mínimos verificables vienen de Rand (un color, tamaño mínimo) — [paulrand.design](https://www.paulrand.design/writing/articles/1991-logos-flags-and-escutcheons.html) — y de Haviv (doodle test, simple, apropiado, distintivo) — [Medium](https://medium.com/designorex/the-3-rules-of-good-logo-design-9ccc05567310)
- Los modelos de visión muestran brechas para juzgar la estética fina de diseño — [arXiv AesEval-Bench](https://arxiv.org/pdf/2603.01083)

### Inferences (propuesta de diseño, no evidencia)
**Reglas de prompt para la generación:**
1. Antes de dibujar, el modelo escribe **una idea** en una frase: qué tiene de único este negocio y cómo se ve. Prohibido el ícono literal del rubro salvo con un giro explícito.
2. Lista negra de motivos: pipa genérica, hoja en círculo, bombita, engranaje, globo, gota, check, iniciales en círculo sin intervención, manos tomadas, casita con techo (en inmobiliarias).
3. Versión principal plana: 1 o 2 colores, sin degradés, sombras, brillos ni 3D.
4. Máximo una tipografía en el logo (dos en todo el sistema) y una intervención tipográfica propia como mínimo.
5. Construir con pocas primitivas y radios repetidos.
6. Entregar siempre el juego completo: principal, horizontal o apilado, símbolo o monograma, favicon, positivo, negativo (adelgazado) y un color.
7. Explicar en una línea por qué es apropiado (Haviv) y qué no intenta decir (Chaves: compatibilidad semántica sin literalidad).

**Pruebas mecánicas automáticas (código, sin IA):**
- Render del símbolo a 16, 32 y 64 px y comparación con la versión grande (por ejemplo, similitud estructural): si a 16 px se vuelve una mancha, falla.
- Umbralizado a 1 bit (un color): debe seguir reconocible.
- Conteo de colores (máximo 3) y detección de degradés.
- Conteo de nodos o complejidad del SVG (límite máximo).
- OCR del logotipo: el texto leído tiene que coincidir con el nombre (atrapa letras "derretidas").
- Medición de los espacios entre letras: avisa si la varianza es alta.
- Contraste de la paleta (WCAG) para textos.
- Similitud con logos conocidos o con la competencia detectada (búsqueda inversa o embeddings), como alerta de riesgo legal y de falta de unicidad.

**Crítico IA ("crítico de marca"), con rúbrica cerrada y puntaje de 1 a 5 más un motivo por criterio:**
- **Apropiado:** corrección estilística, compatibilidad semántica.
- **Distintivo:** singularidad frente a 3 competidores, sin clichés de la lista negra.
- **Simple y pregnante:** "¿se puede describir en una frase y dibujar de memoria?"
- **Legible:** ¿el nombre se lee bien?
- **Reproducible:** usa los resultados mecánicos.
- **Suficiente:** ¿sobra algún elemento?
- **Declinable:** ¿genera patrón, iconos y avatar?
- **Vigente:** ¿depende de una moda?

Si un criterio queda en 2 o menos, el crítico devuelve instrucciones concretas ("sacar el degradé", "el símbolo es una taza literal: buscar el giro en X") y se regenera, con un máximo de 2 vueltas para cuidar el costo. Los puntajes se guardan en la tabla `pruebas` para aprender.
- Mostrarle al usuario 2 o 3 direcciones distintas (no variantes de una misma idea), cada una con su justificación. Es la práctica de los estudios y suma valor percibido en la demo.

### Gaps
- No hay validación empírica de que este ciclo mejore la percepción de calidad: habría que medirlo con pruebas A/B o con un panel de diseñadores.
