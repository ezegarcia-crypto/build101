# Brandbooks, libros de diseño y archivos/APIs libres para el motor de marca de BrandIA

Leyenda de uso para el motor:
- **ENTRENAR/INCRUSTAR OK**: dominio público o CC0. Se puede copiar, resumir, meter en prompts, usar en RAG o entrenar, también con fines comerciales.
- **ADAPTAR CON ATRIBUCIÓN**: CC BY, MIT, Apache 2.0 u OGL. Se puede reutilizar comercialmente si se da crédito.
- **NO COMERCIAL**: CC BY-NC. Uso comercial dudoso; para BrandIA, mejor solo "inspiración estructural", sin copiar texto.
- **SOLO REFERENCIA**: todos los derechos reservados aunque se pueda ver gratis. Se estudia a mano y se extraen patrones (qué secciones tiene un brandbook, qué reglas fija) escritos con palabras propias. No se copian textos ni imágenes al prompt ni a un dataset.

---

## 1. Manuales de dominio público o libres (agencias de gobierno, olímpicos, corporativos históricos)

### Takeaway
Los manuales del gobierno federal de EE. UU. (NASA 1975/76, NPS Unigrid) son de dominio público en EE. UU. y la propia agencia los publica en PDF, así que son la mejor base "limpia" para enseñarle al motor la estructura clásica de un manual de normas gráficas. Las reediciones de Standards Manual son productos con copyright aparte. Los manuales europeos y olímpicos (British Rail, Lufthansa/Aicher, Múnich 72, México 68) no tienen un estado de dominio público confirmado: son solo referencia.

### Cited Findings
- **NASA Graphics Standards Manual (NHB 1430.2, enero de 1976; diseño de Danne & Blackburn, 1975)**: PDF oficial en nasa.gov, https://www.nasa.gov/wp-content/uploads/2015/01/nasa_graphics_manual_nhb_1430-2_jan_1976.pdf (hay una copia espejo en /sites/default/files/atoms/files/...). — [NASA PDF](https://www.nasa.gov/wp-content/uploads/2015/01/nasa_graphics_manual_nhb_1430-2_jan_1976.pdf)
- NASA publicó el PDF gratis en 2015, en respuesta a la campaña de Kickstarter de la reedición. — [It's Nice That](https://www.itsnicethat.com/news/nasa-releases-1970s-brand-guidelines-free-pdf)
- Wikimedia Commons lo marca como dominio público en EE. UU. por ser obra hecha solo por la NASA (según el resultado de búsqueda; el uso del logotipo "worm" igual está sujeto a las reglas de NASA para sus insignias). — [Commons, vía resultados de búsqueda](https://download.osmand.net/wiki/File:NASA_Graphics_Standards_Manual.pdf); también en [Stanford PURL](https://purl.stanford.edu/dm266rq3266)
- Standards Manual vende una "Remastered Edition", una reedición facsímil con copyright propio (fotos y ensayos nuevos). — [Standards Manual](https://standardsmanual.com/products/nasa-graphics-standards-manual-remastered-edition) (la página devolvió 429; existencia del producto confirmada por los resultados de búsqueda y por [Design Milk](https://design-milk.com/nasas-1975-graphics-standards-manual-reissued/))
- **NPS Unigrid (Massimo Vignelli, 1977)**: la propia NPS publica las especificaciones del Unigrid, con un PDF. El sistema se basa en el análisis que hizo Vignelli de los folletos de la NPS. — [NPS Park History](https://www.nps.gov/parkhistory/online_books/brochures/unigrid/index.htm)
- El NPS UniGuide (señalética) es un documento distinto, que circula en un PDF de terceros. — [generalstaff.org PDF](https://www.generalstaff.org/BBOW/Colors/NPS_uniguide_standards.pdf)
- **Manuales del gobierno de Uruguay en gub.uy** (relevante para el mercado local de BrandIA). Son manuales de marca de organismos públicos que se pueden ver libremente:
  - Manual de marca del MEC (2021) — [PDF](https://www.gub.uy/ministerio-educacion-cultura/sites/ministerio-educacion-cultura/files/2021-05/Manual_marca_0.pdf)
  - Manual de la DNC — [PDF](https://www.gub.uy/ministerio-educacion-cultura/sites/ministerio-educacion-cultura/files/2021-10/Manual-marca_DNC_v1.pdf)
  - Sistema de Cuidados 2020 — [PDF](https://www.gub.uy/sistema-cuidados/sites/sistema-cuidados/files/documentos/publicaciones/Manual%20de%20identidad%20Sistema%20de%20Cuidados%202020_resumen.pdf)
  - Marca País Uruguay — [manual](https://www.uruguayxxi.gub.uy/public/docs/marca_pais/manual-marca-pais-uruguay.pdf) y [Manual de Identidad 2024](https://www.uruguayxxi.gub.uy/public/docs/marca_pais/Manual-de-Identidad_2024.pdf)
  - Arquitectura de Marca ANEP 2026 — [PDF](https://www.anep.edu.uy/sites/default/files/images/logos/manual-2026/manuales/Manual%20Arquitectura%20de%20Marca%20ANEP%20v2%202026.pdf)
  - Montevideo — [PDF](https://montevideo.gub.uy/sites/default/files/biblioteca/manualimconcurso.pdf)
- Agesic tiene modelos de diseño de servicios en línea (no un manual de marca): el Modelo de Trámites en Línea y el Modelo de interfaz de usuario (estándares HTML/CSS y accesibilidad WCAG 2.0). — [Modelo interfaz](https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/sites/agencia-gobierno-electronico-sociedad-informacion-conocimiento/files/documentos/publicaciones/Modelo_interfazusuario.pdf); [Trámites v1.7](https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/sites/agencia-gobierno-electronico-sociedad-informacion-conocimiento/files/documentos/publicaciones/Modelo%20de%20tramites%20en%20linea%20v1.7.pdf)

### Inferences
- NASA y Unigrid entran como **ENTRENAR/INCRUSTAR OK** para la estructura y las reglas: retícula, espacio de protección del logo, usos incorrectos, paleta con especificaciones, tipografía (Helvetica), aplicaciones a vehículos, papelería y señalética. Las marcas en sí (el "worm", la punta de flecha) no se reproducen en las marcas de los clientes.
- Los manuales de gub.uy son el mejor ejemplo de **cómo se escribe un brandbook en español rioplatense** y de arquitectura de marca con sub-marcas (ANEP, Marca País). No encontré una licencia explícita. Por la Ley 9.739 de Uruguay, una obra pública no es automáticamente de dominio público: tratarlos como **SOLO REFERENCIA** (estudiar la estructura, no copiar el texto).
- Para resumir en un prompt: una "plantilla de índice de brandbook" sacada de NASA (introducción, logotipo, color, tipografía, formatos, aplicaciones) da al motor un esqueleto probado de 50 años.

### Gaps
- **NYCTA Graphics Standards Manual (1970, Unimark)**: no confirmé un PDF oficial gratis. La MTA es una autoridad estatal de Nueva York, no federal, así que no hay presunción de dominio público. La reedición de Standards Manual tiene copyright. → SOLO REFERENCIA.
- **EPA Graphic Standards System (1977, Chermayeff & Geismar)**: no lo encontré en esta ronda. Al ser un organismo federal, probablemente es de dominio público, pero no está verificado.
- **FAA**: sin datos.
- **British Rail Corporate Identity Manual (1965)**, **Lufthansa 1962 (Aicher/HfG Ulm)**, **Múnich 1972**, **México 68 (Lance Wyman)** y **Unternehmenserscheinungsbild**: no encontré fuentes primarias de licencia ni de acceso en esta ronda. Tratarlos todos como SOLO REFERENCIA, con derechos vigentes (Aicher murió en 1991; en Alemania los derechos duran 70 años desde la muerte del autor).
- Manual de marca central del Estado uruguayo (gub.uy) y sistema de diseño unificado de Agesic: no encontré uno publicado.

---

## 2. Sistemas de diseño de gobierno abiertos (código y documentación)

### Takeaway
USWDS (EE. UU.) es de dominio público y CC0 en todo el mundo: es la fuente más limpia para que el motor aprenda tokens, componentes y documentación de uso. GOV.UK Frontend es MIT. Poncho (Argentina) es código abierto por disposición oficial, pero su licencia exacta se confirmó solo con una fuente secundaria.

### Cited Findings
- **USWDS**: "As a work of the United States government, this project is in the public domain within the United States", y además "we waive copyright and related rights in the work worldwide through the CC0 1.0 Universal public domain dedication". Excepciones: las marcas de GSA, Material Icons (Apache 2.0), las fuentes Source Sans Pro, Merriweather, Public Sans y Font Awesome (SIL OFL 1.1), Roboto Mono (Apache 2.0) y partes de normalize (MIT/CC0). — [USWDS LICENSE.md](https://raw.githubusercontent.com/uswds/uswds/develop/LICENSE.md)
- **GOV.UK Frontend**: licencia MIT, "Copyright (C) 2017 Crown Copyright (Government Digital Service)". El archivo de licencia no dice nada de la OGL para los textos del sitio de documentación. — [govuk-frontend LICENSE](https://github.com/alphagov/govuk-frontend/blob/main/LICENSE.txt)
- **Poncho (Argentina)**: la Disposición 24/2019 ordenó publicar el código en el repositorio oficial de software público, github.com/argob/poncho. Es un framework HTML/CSS basado en Bootstrap. — [Disposición 24/2019](https://www.argentina.gob.ar/normativa/nacional/norma-332833/texto)
- Una guía de terceros dice que el código de Poncho es MIT y que la identidad, los logos y los contenidos del gobierno van aparte. También dice que está basado en Bootstrap 3.4.1 y que sus tipografías serían Lora y Montserrat (sin confirmar). — [open-design.ai](https://open-design.ai/es/design-system/poncho/); paquete en [Packagist](https://packagist.org/packages/argob/poncho)

### Inferences
- USWDS → **ENTRENAR/INCRUSTAR OK**. Le enseña al motor a escribir "tokens" de diseño (escalas de color con grados y contraste garantizado, escalas tipográficas y de espaciado) y la sección "Cuándo usar / Cuándo no usar" de cada componente. Es ideal para la parte web del brandbook (módulo 2d, la web del cliente).
- GOV.UK → **ADAPTAR CON ATRIBUCIÓN**. Su documentación de estilo de contenido ("plain English") se puede usar como referencia de voz clara. Supongo que los textos de gov.uk están bajo OGL v3.0 (compatible con CC BY), pero no lo verifiqué en una fuente primaria.
- Poncho → código **ADAPTAR CON ATRIBUCIÓN** (verificar el LICENSE). Los escudos y la identidad oficial argentina no se tocan.

### Gaps
- No leí el LICENSE de argob/poncho directamente.
- No verifiqué la OGL de la documentación de GOV.UK ni el estado de gob.mx (México) en una fuente primaria.

---

## 3. Colecciones de brandbooks y guías corporativas publicadas

### Takeaway
Casi todas las guías de marca corporativas (Spotify, Uber, Atlassian, Medium, Slack, Tesla) y los directorios que las juntan son **SOLO REFERENCIA**. La excepción importante es la Content Style Guide de Mailchimp, que es CC BY-NC 4.0: se puede adaptar con atribución, pero no para uso comercial, y BrandIA es comercial.

### Cited Findings
- **Mailchimp Content Style Guide**: "It's completely public and available under a Creative Commons Attribution-NonCommercial 4.0 International license." Secciones: Writing Goals and Principles, Voice and Tone, Writing About People, Grammar and Mechanics, Web Elements, Email Newsletters, Social Media, Accessibility, Translation, Structured Content, Word List, entre otras. — [styleguide.mailchimp.com](https://styleguide.mailchimp.com/)
- **Logo Design Love** mantiene una lista curada de guías de identidad (universidades, gobiernos, empresas; por ejemplo Boston University y Boy Scouts of America). — [logodesignlove.com](https://logodesignlove.com/brand-identity-style-guides)
- Hay recopilaciones como "Top 100 style guides" (Slack, NASA, Tesla) en Medium. — [Medium/ebaqdesign](https://medium.com/ebaqdesign/top-100-style-guides-of-best-brands-39152ebde62c)
- Dribbble tiene colecciones y una "brand style guide checklist". — [Dribbble Stories](https://dribbble.com/stories/2020/06/16/brand-style-guide-checklist)

### Inferences
- Mailchimp sirve de **modelo estructural** para la sección "Voz y tono" del brandbook de BrandIA: rasgos de voz ("somos X, pero no Y"), tono según el contexto, palabras sí y no, y reglas por canal (newsletter, redes). Como es NC, conviene **no copiar sus textos** en los prompts de producción. Hay que reescribir el patrón con palabras propias (la estructura de un documento no se protege, el texto sí).
- Las guías corporativas en PDF (Spotify, Uber y otras) sirven para armar a mano una **taxonomía de secciones** y un catálogo de "reglas típicas": espacio de protección, tamaño mínimo, usos incorrectos, co-branding, proporción de colores, fotografía y iconografía. Es SOLO REFERENCIA: ni textos ni imágenes en un dataset.

### Gaps
- No pude verificar en esta ronda el estado ni las condiciones de **brandingstyleguides.com**, del archivo "Brand Manuals", de **Logobook** ni de Behance (las búsquedas no devolvieron los sitios). Por defecto, son SOLO REFERENCIA, y las Condiciones de Behance (Adobe) reservan los derechos a cada autor.
- No verifiqué individualmente las condiciones de las guías de Spotify, Atlassian, Uber y Medium. Atlassian Design System tiene partes de código abierto (sin verificar).

---

## 4. Libros y textos de diseño gratuitos

### Takeaway
El único libro de texto de diseño gráfico abierto que confirmé es **Graphic Design and Print Production Fundamentals** (BCcampus, CC BY 4.0). Las guías de Material Design 3 están bajo Apache 2.0 o CC BY 4.0, a elección. Practical Typography de Butterick se lee gratis, pero no tiene una licencia de reutilización. Los clásicos (Müller-Brockmann, Bringhurst, Wheeler, Lupton) son de solo referencia.

### Cited Findings
- **Graphic Design and Print Production Fundamentals** (Graphic Communications Open Textbook Collective: Collins, Hass, Jeffery, Martin, Medeiros, Tomljanovic): BCcampus, CC BY 4.0 "except where otherwise noted", hecho con Pressbooks y con descarga en EPUB. Los primeros capítulos (historia y proceso de diseño) tienen buenas reseñas. — [opentextbc.ca](https://opentextbc.ca/graphicdesign/); [Open Textbook Library](https://open.umn.edu/opentextbooks/textbooks/344); [LibreTexts](https://workforce.libretexts.org/Bookshelves/Arts_Audio_Visual_Technology_and_Communications/Book%3A_Graphic_Design_and_Print_Production_Fundamentals)
- **Material Design 3**: "all Material 3 content, guidelines, imagery, and resources are available under the Apache 2.0 or CC BY 4.0 license". — [m3.material.io/get-started](https://m3.material.io/get-started)
- **Butterick's Practical Typography**: se sostiene con lectores ("This book has no ads. It's supported by readers like you"), no hay PDF y el sitio no indica ninguna licencia de reutilización. — [practicaltypography.com](https://practicaltypography.com/how-to-pay-for-this-book.html)
- **Bauhausbücher** (diseño de la serie: Moholy-Nagy): circulan escaneos en Monoskop y en bauhaus-bookshelf.org, que difunde Open Culture. — [Open Culture](https://www.openculture.com/2015/10/download-original-bauhaus-books-journals-for-free.html); [bauhaus-bookshelf.org](https://bauhaus-bookshelf.org/bauhaus-original-sources-for-pdf-download.html); [Bauhaus Kooperation](https://bauhauskooperation.com/knowledge/publications/publikationen-zum-bauhaus/bauhaus-books)

### Inferences
- BCcampus → **ADAPTAR CON ATRIBUCIÓN**, apto para RAG o resúmenes en los prompts: teoría del color, tipografía, maquetación y retícula, y producción para imprenta (útil para BranderIA, módulo C: archivos listos para producir).
- Material 3 → **ADAPTAR CON ATRIBUCIÓN**. Sus capítulos de color (tonos generados desde un color semilla, roles de color), tipografía (escala por roles) y forma son directamente traducibles a reglas para que el motor genere paletas y escalas coherentes. Es la fuente más "algorítmica".
- Butterick → **SOLO REFERENCIA**. Se pueden resumir con palabras propias sus reglas prácticas (largo de línea, interlineado, jerarquía), que son hechos y no expresión protegida, pero sin citar textos.
- Bauhausbücher: los autores murieron entre 1944 y 1969 (Kandinsky 1944, Klee 1940, Moholy-Nagy 1946, Gropius 1969), así que el dominio público depende del país (70 años desde la muerte en la UE). Los de Klee, Kandinsky y Moholy-Nagy probablemente ya están libres en la UE; los de Gropius, no. Esto es una inferencia: verificar volumen por volumen. Los escaneos de Monoskop no son una fuente con licencia.

### Gaps
- No verifiqué: el sitio complementario de *Thinking with Type* (Lupton), los ensayos de Paul Rand, Tschichold (murió en 1974, con derechos vigentes), los libros gratis de Smashing ni Apple HIG (el uso del sitio de Apple está bajo sus términos, todos los derechos reservados). Müller-Brockmann (*Grid Systems*), Bringhurst y Wheeler (*Designing Brand Identity*) son obras con derechos vigentes → SOLO REFERENCIA.
- No encontré un libro de OpenStax sobre diseño gráfico.

---

## 5. Archivos de museos, APIs y bases de diseño

### Takeaway
Para darle al motor un repertorio visual real (carteles, tipografía, marcas, objetos de diseño), las mejores APIs son las del Met (metadatos CC0 e imágenes de dominio público, sin clave), Smithsonian Open Access (CC0, clave gratis de api.data.gov), Cooper Hewitt (museo de diseño: metadatos CC0) y Rijksmuseum (CC0, clave gratis). Letterform Archive y Fonts In Use son de solo referencia.

### Cited Findings
- **Met Collection API**: endpoints Objects, Object, Departments y Search. Search v1 se retira el 1/10/2026 y lo reemplaza v1.1, paginado (limit de hasta 500, offset+limit ≤ 10.000). Sin clave ni registro, hasta 80 pedidos por segundo. Los datos son "Creative Commons Zero" y las imágenes de alta resolución son de dominio público. El dataset también incluye obras con copyright (ver el campo `rightsAndReproduction`). — [metmuseum.github.io](https://metmuseum.github.io/)
- **Smithsonian Open Access**: la base es https://api.si.edu/openaccess/api/v1.0, pide una clave gratis de api.data.gov y se actualiza todas las semanas. Algunos objetos con copyright tienen metadatos CC0 pero no traen la imagen. Pueden aplicar restricciones de terceros. — [si.edu/openaccess/devtools](https://www.si.edu/openaccess/devtools); [FAQ](https://dashboard.si.edu/openaccess/faq)
- **Cooper Hewitt** (Smithsonian Design Museum): API REST en https://api.collection.cooperhewitt.org/rest/, con un límite de pedidos que se levanta con una clave propia. Los metadatos son CC0 y piden atribución como guía, no como obligación. También hay un volcado completo en GitHub. — [apidocs.cooperhewitt.org](https://apidocs.cooperhewitt.org/); [github.com/cooperhewitt/collection](https://github.com/cooperhewitt/collection)
- **Rijksmuseum**: imágenes, metadatos y datos bibliográficos sin restricciones de reutilización, bajo CC0. Las obras libres de derechos se marcan como "Public domain" en los metadatos. Un catálogo de terceros dice que las obras modernas pueden ser CC BY. La clave se obtiene gratis con una cuenta de Rijksstudio. También hay OAI-PMH con el set `subject:EntirePublicDomainSet`. — [Rijksmuseum data policy](https://www.rijksmuseum.nl/en/data/policy); [harvest](https://data.rijksmuseum.nl/object-metadata/harvest)
- **Letterform Archive**: ver y usar las imágenes de referencia para fines personales, de investigación o educativos es gratis. Cualquier otro uso se paga por imagen, con licencias promocionales por un año. Una versión de la página decía que las respuestas estaban en pausa hasta septiembre de 2026. El archivo online es de acceso abierto y gratis. — [Rights & Repro](https://letterformarchive.org/rights-repro); [Online archive abierto](https://letterformarchive.org/news/the-online-archive-is-now-open-to-all)
- **Fonts In Use**: licencia de uso del sitio "personal, non-commercial". Se prohíbe reproducir, distribuir o hacer obras derivadas sin permiso. El sitio reproduce contenido amparándose en el "Fair Use". — [Términos de Fonts In Use](https://fontsinuse.com/terms-and-conditions-of-use/)

### Inferences
- Met, Smithsonian, Cooper Hewitt y Rijksmuseum: los metadatos son **ENTRENAR/INCRUSTAR OK**, y las imágenes también, **solo cuando el registro dice dominio público o CC0** (hay que filtrar con `isPublicDomain` del Met o el equivalente de cada museo). Ideas de uso: (a) un "tablero de referencias" por rubro (por ejemplo, carteles de cafés o etiquetas antiguas para una marca gastronómica); (b) paletas extraídas de obras de dominio público como inspiración de color; (c) Cooper Hewitt para buscar por "logo", "poster" o "packaging" y por diseñador.
- Fonts In Use es una gran fuente de **combinaciones tipográficas reales por rubro**, pero sus términos prohíben extraer y reutilizar: SOLO REFERENCIA manual. Las combinaciones del motor conviene sacarlas de Google Fonts (OFL).
- Letterform Archive: SOLO REFERENCIA. Sirve para que el equipo estudie el diseño a mano, no para el motor.

### Gaps
- No pude leer la documentación del Art Institute of Chicago (403). Por lo que sé, sus datos son CC0 y sus imágenes de dominio público van por IIIF, pero no lo verifiqué en esta ronda.
- No verifiqué: Wellcome Collection, Europeana (los metadatos son CC0 según su política conocida; la licencia de cada objeto varía), carteles de la Library of Congress (muchos sin restricciones conocidas, a verificar ítem por ítem), Internet Archive (la licencia depende de cada ítem) ni Design Reviewed (escaneos de diseño de mediados del siglo XX, sin licencia clara).

---

## Resumen operativo para el motor (prioridad)

| Prioridad | Recurso | Licencia | Uso en BrandIA |
|---|---|---|---|
| 1 | Manual NASA 1976 (nasa.gov) | Dominio público en EE. UU. | Esqueleto del índice del brandbook y reglas del logo |
| 1 | USWDS | CC0 / dominio público | Tokens de color, tipografía y espaciado; reglas "cuándo usar" |
| 1 | Material Design 3 | Apache 2.0 / CC BY 4.0 | Paletas desde un color semilla, roles de color y escala tipográfica |
| 1 | BCcampus Graphic Design Fundamentals | CC BY 4.0 | RAG de teoría: color, tipo, retícula, imprenta |
| 2 | Met / Smithsonian / Cooper Hewitt / Rijks | CC0 (filtrando lo de dominio público) | Tableros de referencias visuales y paletas por rubro |
| 2 | GOV.UK Frontend | MIT | Componentes y voz clara (verificar la OGL de los textos) |
| 2 | NPS Unigrid | Dominio público (NPS) | Retícula modular como ejemplo de sistema |
| 3 | Mailchimp Content Style Guide | CC BY-NC 4.0 | Solo la estructura de "Voz y tono", reescrita |
| 3 | Manuales de gub.uy y Marca País | Sin licencia explícita | SOLO REFERENCIA: brandbooks en español local |
| 4 | Standards Manual (reediciones), British Rail, Lufthansa, Múnich 72, México 68, Butterick, Fonts In Use, Letterform, directorios de brandbooks, Behance, libros clásicos | Todos los derechos reservados | SOLO REFERENCIA |
