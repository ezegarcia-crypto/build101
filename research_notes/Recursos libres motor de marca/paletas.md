# Paletas y teoría del color: datasets y herramientas libres para BrandIA

Estado: investigado el 20/11/2026. Licencias de repos de GitHub tomadas de la API de GitHub (`gh api repos/...`, campo `license.spdx_id`) ese mismo día. "Usable en producto" = se puede meter en el código, en prompts o servir a clientes de un producto comercial. "Solo referencia" = sirve para inspirarse o para leer, no para redistribuir o usar comercialmente sin permiso.

## 1. Datasets de paletas y colores con licencia abierta (Sanzo Wada, color-names, Radix, Open Color, Tailwind, Simple Icons)

### Takeaway
Hay un núcleo sólido y comercialmente usable (MIT/CC0): Sanzo Wada (348 combinaciones), meodai/color-names (32.004 nombres + API), xkcd (949 nombres CC0), Radix, Open Color, Tailwind, culori/poline. Simple Icons es CC0 como proyecto, pero los hex son colores de marcas registradas: sirve para *evitar* parecerse a marcas famosas o para ver tendencias por rubro, no para copiarlos.

### Cited Findings
- **Sanzo Wada, A Dictionary of Colour Combinations (mattdesl)**: JSON de 348 combinaciones (de 2, 3 y 4 colores) sobre 159 colores únicos; cada color trae nombre (ej. "Burnt Sienna"), CMYK, Lab, RGB, hex, capítulo (swatch 0 a 5) y los IDs de combinaciones en las que aparece. Paquete npm `dictionary-of-colour-combinations`. Licencia del repo: MIT; 548 estrellas; último push 27/04/2024. Datos originalmente compilados por Dain M. Blodorn Kim (dblodorn/sanzo-wada) y corregidos por mattdesl. — [GitHub mattdesl/dictionary-of-colour-combinations](https://github.com/mattdesl/dictionary-of-colour-combinations)
- **meodai/color-names**: 32.004 nombres de color únicos, curados a mano, licencia MIT ("requiring only simple attribution"), sin nombres de marcas protegidas ni insultos; el README desaconseja nombres generados por IA y se presenta como "AI-ready"; tiene lista completa, lista "best of" y lista de nombres cortos; paquete npm `color-name-list`. Último push 19/11/2026 (muy activo, 3.110 estrellas). — [GitHub meodai/color-names](https://github.com/meodai/color-names)
- **API de color-names (api.color.pizza)**: `GET https://api.color.pizza/v1/?values=aa0000` devuelve nombre ("Heartbeat"), un tagline descriptivo, RGB/HSL/Lab, luminancia, luminancia WCAG y `bestContrast` (blanco/negro). Probado en vivo el 20/11/2026. — [api.color.pizza](https://api.color.pizza/v1/?values=aa0000)
- **xkcd color survey**: `rgb.txt` con 949 nombres de color más votados y su hex; primera línea del archivo: "License: https://creativecommons.org/publicdomain/zero/1.0/" (CC0). — [xkcd.com/color/rgb.txt](https://xkcd.com/color/rgb.txt)
- xkcd además publicó los datos crudos como dump SQLite (84 MB .tar.gz), anonimizado; no encontré licencia explícita para ese dump. — [xkcd blog, Color survey results](https://blog.xkcd.com/2010/05/03/color-survey-results/)
- **Radix Colors**: "A gorgeous, accessible color system", MIT, 1.742 estrellas, push 17/12/2025. Escalas de 12 pasos pensadas para UI accesible. — [GitHub radix-ui/colors](https://github.com/radix-ui/colors)
- **Open Color**: "Color scheme for UI design", MIT, 5.584 estrellas, sin cambios desde 10/12/2023 (estable/abandonado). — [GitHub yeun/open-color](https://github.com/yeun/open-color)
- **Tailwind CSS (paleta por defecto)**: el repo es MIT (98.711 estrellas, activo 20/11/2026), así que la paleta incluida en el código es MIT. — [GitHub tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)
- **Simple Icons**: repo CC0-1.0, 26.240 estrellas, versión npm 16.38.0. Su DISCLAIMER aclara: "Simple Icons is released under CC0 - though that doesn't mean to imply that all icons within the project are also CC0", y "Simple Icons cannot be held responsible for any legal activity raised by a brand… We ask that our users seek the correct permissions". Cada ícono trae el hex de marca, link a la fuente y, cuando existe, a las brand guidelines. — [Simple Icons DISCLAIMER.md](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md)
- **nice-color-palettes (Experience-Monks)**: JSON con las 100/200/500 paletas top de COLOURlovers (5 hex cada una), MIT, "Last updated Oct 14 2018". — [GitHub Experience-Monks/nice-color-palettes](https://github.com/Experience-Monks/nice-color-palettes)
- **dariusk/corpora** (incluye listas de colores entre muchos corpus): datos en CC0 ("anyone can use the data for any reason without attribution in perpetuity"). — [GitHub dariusk/corpora](https://github.com/dariusk/corpora)

### Inferences
- El MIT de mattdesl cubre el código y la compilación; los valores de color en sí son datos fácticos (muy probablemente no protegibles). Sanzo Wada murió en 1967: bajo la regla japonesa previa de vida+50, su obra habría pasado a dominio público a fines de 2017, antes de la extensión a vida+70 (dic. 2018), que no revivió derechos vencidos. Riesgo legal bajo; aun así, no hay que reproducir las páginas del libro (la edición de Seigensha tiene su propio copyright de diseño).
- Uso concreto en BrandIA: (a) **variedad**: sortear como "semilla" una de las 348 combinaciones de Wada o de las 500 de nice-color-palettes según el mood, y pedirle al modelo que la adapte en vez de inventar desde cero (eso rompe el sesgo de la IA hacia los mismos azules, corales y verdes salvia); (b) **nombres**: color-names/xkcd para bautizar cada color del brandbook ("Terracota Costa" en vez de "#C2643B"); (c) **anti-plagio**: comparar en Lab/OKLCH la paleta generada contra los hex de Simple Icons y avisar si la marca nueva queda demasiado cerca de una marca famosa del mismo rubro.
- Los nombres de color-names están en inglés; para el español rioplatense habría que traducirlos o pedirle al modelo que los adapte.
- Simple Icons está sesgado a marcas de tecnología y software; no representa bien a pymes, gastronomía o moda.

### Gaps
- No verifiqué el archivo exacto ni el formato (OKLCH vs hex) de la paleta de Tailwind v4 en el repo actual.
- No confirmé la licencia del repo original dblodorn/sanzo-wada.

## 2. Plataformas comunitarias y APIs de paletas (COLOURlovers, Adobe Color, Coolors, Color Hunt, Lospec, Kuler/O'Donovan, Colormind, Huemint)

### Takeaway
Casi ninguna de las grandes plataformas sirve para el producto tal cual: Coolors permite usar paletas sueltas pero prohíbe redistribuirlas como compilación; Colormind y Huemint son gratis solo para uso no comercial; el dataset académico de O'Donovan (Kuler + COLOURlovers + MTurk) es CC BY-NC-SA. Son "solo referencia" o requieren pedir permiso comercial.

### Cited Findings
- **COLOURlovers API**: el sitio `colourlovers.com/api` devolvió HTTP 403 al intentar leerlo (20/11/2026). Un directorio de terceros lo lista "alive", verificado el 12/11/2026. El cliente R `colourlovers` en CRAN no se actualiza desde dic. 2020 (v0.3.6). — [API Bouncer](https://apibouncer.com/apis/55/colourlovers); [CRAN colourlovers](https://search.r-project.org/CRAN/packages/colourlovers/index.html)
- **Coolors**: sus términos dicen que todas las paletas están disponibles para uso comercial y no comercial, en productos impresos y digitales, sin atribución; pero el usuario no puede "sell, distribute, lease, license, sub-license or offer our palettes to any third party" ni redistribuirlas "on a stand-alone basis or as a compilation". No encontré API pública ni cláusula sobre scraping. — [Coolors Terms of Service](https://coolors.co/terms-of-service)
- **Adobe Color (ex Kuler)**: en 2013 Adobe dejó de emitir claves nuevas para la API de Kuler; un usuario dijo en 2023 que el acceso es "a pedido" (no confirmado por Adobe). El panel de temas de Adobe Color se desactivó en Photoshop, Illustrator, InDesign y After Effects el 14/07/2021. No hay dataset público oficial. — [Adobe Community, Request for Kuler API](https://community.adobe.com/t5/adobe-color-discussions/request-for-kuler-api/m-p/13550955); [Adobe Help, End of support for Adobe Color Themes panel](https://helpx.adobe.com/illustrator/using/kuler-panel.html)
- **O'Donovan, Agarwala y Hertzmann, "Color Compatibility from Large Datasets"** (ACM TOG 30(4), SIGGRAPH 2011): publican `colorCode.zip` (datasets y código para entrenar y probar un modelo de compatibilidad), `weights.csv` (pesos del modelo LASSO), suplemento y slides. Licencia: **Creative Commons BY-NC-SA 2.5 Canada**. El modelo puntúa qué tan bien funcionan juntos 5 colores ("color theme"), mejora temas existentes y extrae temas de imágenes. — [Proyecto, dgp.toronto.edu/~donovan/color](https://dgp.toronto.edu/~donovan/color)
- El paper aclara que los datasets publicados tienen solo ratings agregados, no por usuario. Hay un port a JavaScript en npm (`colorcompatibility`), traducido desde Scala, a su vez desde Matlab. — [Paper PDF](https://www.dgp.toronto.edu/~donovan/color/colorcomp.pdf); [npm colorcompatibility](https://www.npmjs.com/package/colorcompatibility)
- **Colormind**: "The API is free for personal and non-commercial use"; para uso comercial hay que escribirle por mail al autor. Modelos "default" y "ui" siempre disponibles; los demás cambian cada día ("refreshed every day at +8 UTC"). No dice nada sobre la propiedad de las paletas generadas ni sobre los datos de entrenamiento. — [Colormind API access](http://colormind.io/api-access/)
- Colormind funciona por POST a `/api/` con 5 posiciones que se pueden fijar con un RGB o dejar libres ("N"); según una fuente de terceros, sirve por HTTP sin cifrar. — [Colormind en ClawHub](https://clawhub.ai/colormind); [rdrr.io colormind](https://rdrr.io/github/dmi3kno/colormind/f/README.md)
- **Huemint**: su página "About" lo describe como un sistema de machine learning que genera colores según el contexto y que sabe cuáles van de fondo, de texto y de acento. Varias fuentes de terceros dicen que la API pública (`api.huemint.com/color`) es gratis solo para uso no comercial, "as-is", sin garantía de disponibilidad. — [About Huemint](https://huemint.com/about/); [Huemint en 10web](https://10web.io/ai-tools/huemint/)
- **Lospec**: API oficial solo para bajar una paleta por su slug, en JSON (`name`, `author`, `colors` hex) o CSV, en `https://lospec.com/palette-list/<slug>.json`; no hay API de búsqueda. La página de la API no menciona licencia de los datos. Las paletas son para pixel art (pocas colores, muy saturadas). — [Lospec Palette API](https://lospec.com/palettes/api)
- Un scraper de terceros etiqueta como CC0 las paletas que baja de Lospec, pero esa es su propia clasificación, no la de Lospec. — [gagath/lospec-palette-scrapper](https://github.com/gagath/lospec-palette-scrapper)

### Inferences
- Para BrandIA (producto comercial), O'Donovan, Colormind y Huemint son **solo referencia** salvo licencia comercial. El *método* de O'Donovan (features de tono, saturación y luminosidad + regresión LASSO) se puede reimplementar con datos propios o abiertos sin usar sus datos NC.
- Coolors: mostrarle a un cliente una paleta inspirada está bien según sus términos, pero meter un volcado de paletas de Coolors en el código o en prompts sería "redistribuir como compilación": evitarlo.
- nice-color-palettes (MIT) son paletas de COLOURlovers, que históricamente licenciaba sus contenidos bajo CC BY-NC-SA; el MIT del repo cubre el código, no necesariamente los datos. Tratarlo como riesgo medio.

### Gaps
- No pude leer los términos actuales de COLOURlovers (403); no pude confirmar si sus datos siguen bajo CC BY-NC-SA.
- No encontré los términos de Color Hunt ni de Lospec (enlace "Terms and Conditions" no leído).
- No encontré el texto oficial de los términos de la API de Huemint; lo de "no comercial" viene de fuentes secundarias.
- No encontré el tamaño de los datasets de O'Donovan en la página del proyecto (el paper menciona Kuler, COLOURlovers y MTurk, pero no confirmé las cifras).

## 3. Investigación y datasets de color-emoción y color-rubro (Jahanian, Lindner, NRC, Schloss, xkcd, NCS/Munsell)

### Takeaway
No hay un dataset abierto, listo y con licencia comercial clara que diga "este color = esta emoción/este rubro". Lo disponible es: papers (Jahanian, Lindner, Schloss) cuyo método se puede reimplementar, el léxico NRC (gratis para investigación, comercial con licencia paga "nominal") y nombres CC0 de xkcd. Para el producto conviene que el propio modelo de lenguaje haga el mapeo, usando estos papers como guía de prompt.

### Cited Findings
- **Jahanian et al., "Colors — Messengers of Concepts: Visual Design Mining for Learning Color Semantics"** (arXiv 1505.06532): modela color y concepto a partir de 2.654 tapas de revistas de 71 títulos y 12 géneros, validado con crowdsourcing. No encontré dataset descargable. — [arXiv 1505.06532](https://arxiv.org/abs/1505.06532v1)
- **Lindner, Bonnier y Süsstrunk, "What is the Color of Chocolate? – Extracting Color Values of Semantic Expressions"** (CGIV 2012): marco estadístico para asignar un color a cualquier expresión semántica, comparado con los datos del experimento online de Moroney. Solo paper, sin dataset aparte. — [EPFL Infoscience](https://infoscience.epfl.ch/record/175185)
- **NRC Word-Colour Association Lexicon** (Saif Mohammad): las lexicones del NRC son gratis para investigación; para uso comercial hay una licencia perpetua por una tarifa única "nominal"; no se permite redistribuir los datos; en productos piden reconocerlo en "About" y documentación. — [NRC, Sentiment and Emotion Lexicons](https://nrc.canada.ca/en/research-development/products-services/technical-advisory-services/sentiment-emotion-lexicons); [Saif Mohammad, lexicons](https://www.saifmohammad.com/WebPages/lexicons.html)
- Paper del léxico de colores de NRC: "Colourful Language: Measuring Word–Colour Associations". — [arXiv 1309.5942](https://arxiv.org/pdf/1309.5942)
- **Schloss lab (UW-Madison), asociaciones color-concepto**: Rathore, Leggon, Lessard y Schloss estiman asociaciones color-concepto a partir de estadísticas de imágenes; el código, el dataset de imágenes, notebooks y datos están en GitHub (enlazado desde la página de recursos del lab). — [Schloss Lab resources](https://schlosslab.discovery.wisc.edu/resources); [Rathore et al. (preprint)](https://ar5iv.labs.arxiv.org/html/1908.00220)
- Revisión de Schloss (2024) sobre asociaciones color-concepto en Current Directions in Psychological Science. — [Schloss 2024 PDF](https://schlosslab.discovery.wisc.edu/wp-content/uploads/2024/06/Schloss2024.pdf)
- Dataset de 79 palabras fuertemente asociadas a color en 11 categorías, validado con tarea Stroop ("Is 'sky' bluer than 'grass' is green?", Behavior Research Methods vol. 58, art. 202, julio 2026). No confirmé autores ni licencia. — [HUJI CRIS](https://cris.huji.ac.il/en/publications/is-sky-bluer-than-grass-is-green-wordcolor-associations-dataset-f/)

### Inferences
- Uso recomendado: en el prompt de paleta, pasarle al modelo los adjetivos de la entrevista (ej. "cálido, artesanal, playero") y pedirle que razone asociaciones color-concepto al estilo de Schloss/Lindner, y luego **elegir semillas de paletas abiertas (Wada, xkcd, color-names) que coincidan**, en vez de confiar en tablas de "psicología del color" sin fuente.
- El NRC es la única opción con licencia comercial explícita, pero no permite redistribución y tiene costo; para una hackathon no vale la pena.

### Gaps
- No encontré un dataset abierto de colores de marca por rubro (industria → paleta). Un estudio tipo "colores de los logos de las 500 marcas top" no apareció con datos descargables.
- No investigué datos abiertos de NCS o Munsell: NCS es propietario (notación comercial); para Munsell existen tablas de renotación (1943) que circulan en librerías de color, pero no verifiqué su licencia.

## 4. Accesibilidad y algoritmos para generar paletas (WCAG, APCA, OKLCH, culori, Leonardo, poline)

### Takeaway
Para chequear contraste y generar escalas hay herramientas abiertas y comerciales: culori y color.js (MIT) para OKLCH, Leonardo de Adobe (Apache-2.0) para generar colores a partir de un contraste objetivo, poline (MIT) para paletas "raras". APCA tiene una licencia restrictiva (solo para uso con WCAG/W3C y con condiciones): usar WCAG 2 como chequeo principal.

### Cited Findings
- **culori**: "A comprehensive color library for JavaScript", MIT, push 04/11/2026. — [GitHub Evercoder/culori](https://github.com/Evercoder/culori)
- **color.js**: librería de conversión y manipulación de color "by the editors of the CSS Color specifications", MIT, push 16/11/2026. — [GitHub color-js/color.js](https://github.com/color-js/color.js)
- **Adobe Leonardo**: "Generate colors based on a desired contrast ratio", Apache-2.0, push 08/07/2026. — [GitHub adobe/leonardo](https://github.com/adobe/leonardo)
- **poline (meodai)**: "Esoteric Palette Generator… Interpolating HSL Color in cartesian space", MIT, push 28/06/2026. — [GitHub meodai/poline](https://github.com/meodai/poline)
- **APCA (apca-w3)**: la licencia dice que los archivos están "licensed to the W3/AGWG… for use with WCAG accessibility guidelines for web-delivered and web-based content only, and not for any other use", con patente(s) pendiente(s); usar los nombres "APCA" está permitido solo con código correctamente implementado y al día, y una implementación no compatible "shall be deemed in breech of license and a copyright violation". GitHub la marca NOASSERTION (no es una licencia estándar). — [Myndex/apca-w3 LICENSE](https://github.com/Myndex/apca-w3/blob/master/LICENSE.md)
- La API de color-names ya devuelve luminancia WCAG y el mejor contraste (blanco/negro) para cada color. — [api.color.pizza](https://api.color.pizza/v1/?values=aa0000)

### Inferences
- Para BrandIA: generar la paleta con la IA, convertir con culori a OKLCH, y (1) exigir distancia mínima entre colores de la paleta (más variedad interna), (2) exigir distancia mínima con las últimas N marcas generadas (más variedad entre marcas, que es el problema planteado), (3) chequear contraste WCAG 2 (4,5:1 texto) de cada par texto/fondo y corregir la luminosidad L en OKLCH si falla. Leonardo sirve para derivar escalas de 10 a 12 pasos de cada color base (como Radix/Tailwind).
- APCA: mejor no implementarlo ni nombrarlo en el producto; si se muestra, que sea como referencia, no como marca.

### Gaps
- No verifiqué el estado de WCAG 3 en 2026 (si APCA quedó adoptado o no).

## 5. Referencias históricas de dominio público (Werner, Ridgway, Vanderpoel, Bauhaus)

### Takeaway
Werner (1814) y Ridgway (1912) son de dominio público y están digitalizados; sirven para nombres de color con historia y paletas "naturalistas" distintas de las que suele proponer la IA. Vanderpoel (1903) es dominio público por fecha, pero no encontré un dataset en hex. Bauhaus: no encontré datos abiertos.

### Cited Findings
- **Werner's Nomenclature of Colours** (Syme, 1814): Syme sumó 31 colores a los 79 de Werner, total 110. — [Public Domain Review](https://publicdomainreview.org/collection/werner-s-nomenclature-of-colours-1814/)
- Nicholas Rougeux recreó la obra en c82.net con referencias cruzadas, ejemplos fotográficos y posters, extrayendo los datos de los escaneos gratis de Internet Archive, y compiló los colores con hex en un Google Doc público. — [c82.net/werner](https://www.c82.net/werner); [Fast Company](https://www.fastcompany.com/90239248/a-200-year-old-guide-to-color-redesigned-for-the-internet-age)
- **Ridgway, Color Standards and Color Nomenclature** (1912, publicado por el autor, Washington D.C.): la copia de la Smithsonian figura como CC0; Project Gutenberg tiene edición con imágenes "for the use of anyone anywhere at no cost". — [Smithsonian Libraries](https://library.si.edu/digital-library/book/colorstandardsco00ridg); [Project Gutenberg #63087](https://www.gutenberg.org/ebooks/63087); [BHL](https://www.biodiversitylibrary.org/bibliography/62375)

### Inferences
- Vanderpoel, *Color Problems* (1903) está en dominio público en EE. UU. por ser anterior a 1931 (inferencia por regla de fecha, no verificada con una fuente específica).
- El hex de Werner vía Rougeux es una interpretación moderna de pigmentos escaneados; no encontré licencia del Google Doc. Los nombres y la obra original son de dominio público.
- Uso en BrandIA: un "modo herencia" que nombre colores con Werner/Ridgway ("Verde Celedón", "Ocre de Ridgway") da originalidad (10 % de la rúbrica) y una historia para el pitch.

### Gaps
- No encontré un dataset abierto de Bauhaus (Itten, Albers): sus libros de teoría del color siguen con copyright (Itten murió en 1967, Albers en 1976).
- No encontré un JSON de Ridgway en hex listo para usar (hay que extraerlo de los escaneos o buscar proyectos de terceros).
- No verifiqué la licencia del Google Doc ni del sitio c82.net de Rougeux.
