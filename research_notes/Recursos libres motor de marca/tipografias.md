# Tipografías libres más allá de Google Fonts para el motor de marca de BrandIA

Contexto: BrandIA hoy elige entre 206 familias de Google Fonts vía Fontsource. Pregunta: ¿qué otras fuentes libres sirven para un **SaaS que sirve la fuente a webs, PDFs e imágenes de clientes**? El criterio decisivo es la licencia: la OFL permite este uso, pero varias licencias "free" propietarias lo prohíben de forma explícita.

## 1. Fontshare (Indian Type Foundry): términos de la ITF Free Font License, uso SaaS y API

### Takeaway
Fontshare tiene exactamente 100 familias: 64 bajo la ITF FFL propietaria y 36 OFL. La **ITF FFL v2.0 (17 ago 2026) prohíbe en forma explícita lo que hace BrandIA**: servir la fuente o ofrecerla como fuente seleccionable a terceros desde un SaaS, una herramienta de diseño, un editor de plantillas o un generador. Así que las fuentes "Closed Source" de Fontshare (Satoshi, Clash Display, General Sans, Cabinet Grotesk, Zodiak, Erode, etc.) **no se pueden usar en BrandIA**. Solo sirven las 36 OFL, y casi todas ya están en Google Fonts.

### Cited Findings
- Hay dos tipos de fuente. "Closed Source" son freeware propietario de ITF, bajo la FFL y exclusivas de Fontshare. "Open Source" pertenecen a sus diseñadores y van bajo SIL OFL. La página de licencias está en "Version 2.0 - 17 Aug 2026" — [Fontshare Licenses](https://www.fontshare.com/licenses/itf-ffl)
- La FFL, Sección 01, permite el uso personal y comercial en "Print, Websites, Mobile or Desktop Applications, Digital Images, Digital Advertising, Social Media…". También permite el autoalojamiento (self-hosting) para los "own websites and applications" del licenciatario y crear logos registrables como marca — [Fontshare Licenses](https://www.fontshare.com/licenses/itf-ffl)
- **La prohibición clave**, Sección 02: "You may not host, serve, embed or otherwise make the Font Software available for use by third parties through any website, application, online service, SaaS platform, design tool, template editor or similar service. This includes making the Font Software available as a selectable font for third-party users to create, edit, customize or generate their own content, even where such users cannot download or extract the Font Software itself." — [Fontshare Licenses](https://www.fontshare.com/licenses/itf-ffl)
- Tampoco se puede redistribuir ("through another font website, font library, marketplace, repository… application or platform") ni dar los archivos a "external designers, agencies, contractors". Cada tercero tiene que bajarla él mismo desde Fontshare — [Fontshare Licenses](https://www.fontshare.com/licenses/itf-ffl)
- No se puede modificar, subsetear ni convertir de formato sin permiso escrito ("subsetting, format conversion" cuentan como Derivative Work) — [Fontshare Licenses](https://www.fontshare.com/licenses/itf-ffl)
- Embedding en PDF: se permite para los usos propios del licenciatario, siempre que la fuente no se pueda extraer — [Fontshare Licenses](https://www.fontshare.com/licenses/itf-ffl)
- El FAQ lo confirma: con las fuentes Closed Source, "If your client wants to use a font that you have downloaded, they must download it themselves… You may not share the font files with them". Con las Open Source, "Yes, you can" — [Fontshare FAQ](https://www.fontshare.com/faq)
- El FAQ dice además que las Closed Source solo se modifican "at the artwork level", es decir, convertidas a contornos para un logo. Eso está permitido — [Fontshare FAQ](https://www.fontshare.com/faq)
- La API existe y no está documentada. `GET https://api.fontshare.com/v2/fonts?offset=0&limit=100` devuelve JSON con `count_total: 100`. Cada fuente trae los campos `category`, `font_tags` (p. ej. Branding/Logos/Poster/Websites), `axes`, `styles`, `designers`, `publisher` y `license_type` (`itf_ffl` o `sil_ofl`). El CSS sale de `https://api.fontshare.com/v2/css?f[]=satoshi@400&display=swap` y apunta a `cdn.fontshare.com` (probado en vivo el 20/11/2026) — [Fontshare API](https://api.fontshare.com/v2/fonts?offset=0&limit=100); también aparece en un [issue de nuxt/fonts](https://github.com/nuxt/fonts/issues/714)
- Las categorías del catálogo son: Sans 55, Display 14, Serif 14, Script 5, Sans+Display 4, Slab 3, Handwritten 2, más algunas mixtas. Hay 64 `itf_ffl` y 36 `sil_ofl`. Las OFL incluyen Archivo, Anton, Poppins, Bebas Neue, Outfit, Manrope, Plus Jakarta Sans, Space Grotesk, Sora, Literata y otras que ya están en Google Fonts — [Fontshare API](https://api.fontshare.com/v2/fonts?offset=0&limit=100)
- Según la licencia, la API es "a convenience", sin garantías, y ITF puede cortarla "for any particular user, website or application" — [Fontshare Licenses](https://www.fontshare.com/licenses/itf-ffl)

### Inferences
- Para BrandIA, Fontshare como fuente de variedad no suma casi nada: lo distintivo es FFL, y la FFL está prohibida para nuestro caso. Las OFL de Fontshare ya están casi todas en Google Fonts.
- Hay un caso borde que conviene consultar con un abogado antes de usarlo: que el **cliente** baje la fuente FFL él mismo y la use en su propia web. Igual, generarle a ese cliente el logo o las imágenes con la fuente desde nuestro servidor sigue siendo "make available… to generate their own content", o sea, prohibido.
- La redacción de la v2.0 apunta de forma explícita a los generadores. Es probable que otras foundries "free" vayan en la misma dirección.

### Gaps
- No encontré la versión 1.x de la FFL para comparar qué cambió el 17/08/2026.
- No hay documentación oficial de la API: los endpoints se dedujeron probándolos.

## 2. Foundries libres e indie (Velvetyne, Collletttivo, Uncut, League, etc.)

### Takeaway
La fuente más fuerte de tipografía distintiva y **realmente libre (OFL)** son las foundries libres europeas: Velvetyne (34 proyectos en GitLab, display experimental), Collletttivo (16 familias OFL, grotescas y display italianas) y The League of Moveable Type (clásicos display). Uncut.wtf es un **catálogo**, no una licencia: hay que revisar cada fuente. Fontsource ya expone 119 familias no-Google (type `other`), 115 de ellas OFL. Es la vía más barata de integrar, porque BrandIA ya usa Fontsource.

### Cited Findings
- **Fontsource**: `GET api.fontsource.org/v1/fonts` lista 2.103 familias: 1.984 `google` y 119 `other` (consultado el 20/11/2026). Cada entrada trae `family`, `subsets`, `weights`, `styles`, `variable`, `category`, `license` y `type`. Límite: 2.500 requests cada 10 s, y piden sponsoreo si se usa la API — [Fontsource API docs](https://fontsource.org/docs/api/introduction); datos en vivo de [api.fontsource.org/v1/fonts](https://api.fontsource.org/v1/fonts)
- Licencias de las 119 no-Google: 115 OFL-1.1, 1 CC0-1.0, 1 Apache-2.0, 1 MIT y 1 Unlicense — [api.fontsource.org/v1/fonts?type=other](https://api.fontsource.org/v1/fonts?type=other)
- Las no-Google de Fontsource con valor para marcas incluyen: Apfel Grotezk (Collletttivo), Bagnard y Bagnard Sans, Bluu Next, Chunk Five, Cooper Hewitt, Junction, League Mono, Ostrich Sans, Norwester, Metropolis, Open Sauce Sans/One/Two, Redaction (7 variantes), Uncut Sans, Karmilla, Peace Sans, Geist Sans, Hauora Sans, Pitagon Sans/Serif, Commit Mono, iA Writer y Monaspace. Muchas otras son técnicas o CJK (DSEG, Fusion Pixel, YakuHan, Iosevka) y no sirven para marca — [api.fontsource.org/v1/fonts](https://api.fontsource.org/v1/fonts)
- **Velvetyne**: dice que "all the fonts hosted on Velvetyne are libre and open-source", y sus repos muestran OFL-1.1 — [Velvetyne FAQ (resultado de búsqueda)](https://velvetyne.fr/about/faq/); [LICENSE de Format 1452](https://gitlab.com/velvetyne/format-1452/-/blob/master/LICENSE.txt)
- El grupo de Velvetyne en GitLab tiene 34 proyectos, entre ellos Avara, BackOut, Basteleur, Cantique, Façade, Feroniapi, Format 1452, Gulax, Interlope, Le Murmure, Lineal, Mess, Mourier, Ouroboros, Sligoil, Sporting Grotesque, Trickster, Kaerukaeru, Pilowlava, VG5000 y Fungal — [GitLab API grupo velvetyne](https://gitlab.com/api/v4/groups/velvetyne/projects?per_page=100)
- Al 20/11/2026, velvetyne.fr redirige a una página "EN GRÈVE" (en huelga, de apoyo político) y no muestra el catálogo — [velvetyne.fr](https://velvetyne.fr/greve/)
- **Collletttivo**: "an Open-Source type foundry". Muestra "16 Open Source Typefaces" (Borges, Ronzino, Aujournuit, Absans, Coconat, Apfel Grotezk, Sinistre…) y también tiene "a whole new retail catalogue" pago, aparte — [Collletttivo](https://www.collletttivo.it/)
- **Uncut.wtf**: "free typeface catalogue… free for commercial use" con 163 tipografías (66 sans, 27 serif, 23 mono y 47 display). Avisa: "All fonts copyright of their respective creators" — [Uncut.wtf](https://uncut.wtf/)
- **The League of Moveable Type**: "the open-source font foundry", desde 2009. El catálogo es "free to use however and wherever you need, to build on and learn from" e incluye The Neue Black (Tré Seals), Blackout, Chunk, Fanwood, Goudy Bookletter 1911, Junction, Knewave, League Gothic, League Mono, League Script, League Spartan, Linden Hill, Orbitron, Ostrich Sans, Prociono, etc. — [The League of Moveable Type](https://www.theleagueofmoveabletype.com/)
- **Pangram Pangram**: NO es libre para uso comercial. "All of our fonts are free to try for personal use as long as it is not used in a commercial project". Las licencias comerciales se venden por uso (social media, apps, video games) y por entidad — [Pangram Pangram FAQ](https://pangrampangram.com/faq); [About](https://pangrampangram.com/pages/about)
- **Bunny Fonts**: CDN "drop-in replacement for Google Fonts" con el mismo formato de API (`fonts.bunny.net/css`), sin logs ni cookies según el proveedor. Es un espejo de Google Fonts y no agrega familias nuevas: una comparación contó 1.492 en Bunny contra 1.508 en Google — [Bunny Fonts FAQ](https://fonts.bunny.net/faq); [mkdocs-material discussion](https://github.com/squidfunk/mkdocs-material/discussions/5475)
- **OFL (marco general)**: se puede redistribuir y embeber, y vender dentro de un paquete de software, pero no la fuente sola. Los derivados tienen que seguir bajo OFL "even if they are part of a service for which you charge fees". Embeber la fuente en un documento no cambia la licencia del documento — [OFL FAQ](https://openfontlicense.org/ofl-faq/)

### Inferences
- Lo más rápido: **sumar al catálogo de BrandIA las ~40 familias "other" de Fontsource que sirven para marca**. Usan el mismo pipeline (`@fontsource/...`) y la licencia ya viene en el JSON.
- Segundo paso: autoalojar fuentes OFL de Velvetyne y Collletttivo. Se bajan desde sus repos de GitLab/GitHub, se convierten a woff2 (la OFL lo permite) y se sirven desde Vercel.
- Uncut.wtf sirve para descubrir fuentes, pero no se puede usar en bloque como catálogo: hay que leer la licencia de cada fuente, porque algunas son "free for commercial" pero no OFL y pueden tener cláusulas anti-redistribución.
- Pangram Pangram, la parte FFL de Fontshare y cualquier "free for personal use" quedan descartadas.
- Las fuentes OFL con Reserved Font Name no se pueden renombrar si se modifican. Subsetear o convertir a woff2 en principio cuenta como modificación según el FAQ de la OFL (verificar cada caso). Lo más seguro es servir los archivos oficiales tal cual.

### Gaps
- No verifiqué con fuentes primarias en esta ronda: Open Foundry (open-foundry.com), Badass Libre Fonts by Womxn, Use & Modify (usemodify.com, catálogo curado de fuentes libres de Raphaël Bastide), Tunera Type Foundry, Fontain, Free Faces (freefaces.gallery, catálogo curado: cada fuente tiene su propia licencia), Departure Mono (de memoria, OFL; sin verificar), Atipo Foundry (de memoria, tiene fuentes "pay what you want" con licencia propia; sin verificar si permite SaaS). Hay que revisar la licencia de cada una antes de usarla.
- Collletttivo: no confirmé la licencia de cada una de las 16 familias.
- No conté con exactitud cuántas de las 119 de Fontsource sirven para marca: el ~40 es una estimación a ojo sobre la lista.

## 3. Foundries latinoamericanas y diseñadores uruguayos con trabajo OFL

### Takeaway
El aporte libre latinoamericano está **casi todo dentro de Google Fonts**: Huerta Tipográfica (Alegreya), Omnibus-Type (Archivo, Asap, Faustina) y varios uruguayos (Económica, Chau, Rufina, Rambla, Gafata, Sedán, Fénix). No sumarían familias nuevas, pero sí sirven para **curar y destacar tipografías "de la región"** dentro del catálogo actual. Latinotype, Sudtipos y TipoType son foundries comerciales: no encontré un catálogo libre verificable.

### Cited Findings
- Google Fonts lista a Huerta Tipográfica como desarrolladora de fuentes "with libre, proprietary, or exclusive licenses". Alegreya es una superfamilia (serif y sans) bajo OFL-1.1, y Alegreya Sans es de Juan Pablo del Peral para HT Fonts — [Google Fonts Alegreya](https://fonts.google.com/specimen/Alegreya/about); [openSUSE fontinfo](https://fontinfo.opensuse.org/fonts/AlegreyaSansBold.html)
- Omnibus-Type tiene una serie en Google Fonts: Archivo y Asap Condensed se basan en Archivo Narrow y Asap, y el desarrollo de Faustina siguió en Omnibus-Type — [Google Fonts & Omnibus-Type](https://googlefonts.github.io/omnibus)
- Diseñadores uruguayos en Google Fonts: Vicente Lamónaca (Económica, la primera uruguaya, y Chau), Martín Sommaruga (Rufina, Rambla; Clarina), Lautaro Hourcade (Gafata), Sebastián Salazar (Sedán) y Fernando Díaz (Fénix). La nota es de hace varios años — [El Observador](https://www.elobservador.com.uy/nota/-tipos-uruguayos-en-google-2012371800); [ORT Uruguay](https://www.ort.edu.uy/16182/32/una-tipografia-elegante-para-los-titulares.html)
- La página `/free-fonts` de Latinotype da 404 (20/11/2026). El sitio muestra "70 Typefaces" comerciales — [Latinotype](https://www.latinotype.com/free-fonts/)

### Inferences
- Un "origen: Uruguay / Latinoamérica" en la metadata del catálogo sería un diferencial de relato para el pitch. Las familias ya se pueden servir con Fontsource.
- Hay que revisar cuáles de estas uruguayas ya están entre las 206 que usa BrandIA.

### Gaps
- No verifiqué si Sudtipos, TipoType, Typemade o Latinotype tienen hoy fuentes gratuitas, ni bajo qué licencia (posible "free for personal use", que no sirve).
- No encontré una lista actualizada de diseñadores uruguayos con OFL fuera de Google Fonts.
- No confirmé que Económica, Chau, Gafata, Sedán y Fénix sigan publicadas en Google Fonts con esos nombres exactos.

## 4. Datos de pairing y metadatos para la IA, y datasets académicos

### Takeaway
El mejor dato para una IA, y libre, es el **registro de tags de Google Fonts** (`tags/all/families.csv` en el repo google/fonts): unas 34 mil filas familia → tag → puntaje 0–100, con tags "expresivos" (Business, Calm, Playful, Sophisticated, Vintage, Futuristic…) que mapean directo a la personalidad de una marca. Para fuentes fuera de Google, el dataset académico de O'Donovan et al. (2014) da 31 atributos para 200 fuentes de Google. Fonts In Use, Typewolf y fontpair.co sirven solo como referencia humana: no verifiqué que sus términos permitan reutilizar los datos.

### Cited Findings
- El CSV `tags/all/families.csv` del repo google/fonts tiene 34.467 líneas con el formato `Familia,,/Categoría/Tag,puntaje`, p. ej. `ABeeZee,,/Expressive/Business,75` — [google/fonts tags](https://raw.githubusercontent.com/google/fonts/main/tags/all/families.csv)
- Tags más frecuentes (familias): /Expressive/Rugged 2016, Vintage 1832, Awkward 1666, Loud 1534, Business 1465, Playful 1366, Sincere 1329, Calm 1235, Competent 1201, Stiff 1019, Happy 881, Childlike 792, Futuristic 546, Excited 539, Active 504, Cute 452, Artistic 300, Innovative 299, Fancy 166, Sophisticated 99. Estructurales: /Sans/Humanist 471, Geometric 192, Grotesque 118, Rounded 103, Neo 126, Superellipse 93; /Serif/Transitional 163, Old 67, Modern 46, Humanist 49; /Script/Handwritten 286, Formal 83. Temas: Wacky, Techno, Brush, Distressed, Pixel. También hay tags /Quality/* (~1.939 familias) — [google/fonts tags](https://raw.githubusercontent.com/google/fonts/main/tags/all/families.csv)
- Proceso de tagging: cada fuente recibe "between 2 and 6 tags", con un porcentaje "to rank the font relative to others in the same category". Los grupos son Feeling, Appearance, Calligraphy, Serif, Sans Serif, Technology y Seasonal — [GF Guide: Tagging](https://googlefonts.github.io/gf-guide/tags.html)
- La Developer API de Google Fonts expone un campo `tags` por familia, solo si se pide — [Google Fonts Developer API](https://developers.google.com/fonts/docs/developer_api)
- El crate Rust `gf-metadata` lee `tags/all` y `tags/tags_metadata.csv` — [gf-metadata docs](https://docs.rs/gf-metadata)
- **O'Donovan, Lībeks, Agarwala y Hertzmann (SIGGRAPH 2014)**, "Exploratory Font Selection Using Crowdsourced Attributes": 31 atributos (p. ej. formal, friendly, legible) sobre 200 fuentes de Google Web Fonts. Se descargan gwfonts.zip, attribute.zip y similarity.zip — [Proyecto](https://www.dgp.toronto.edu/~donovan/font/); [Paper](https://www.dgp.toronto.edu/~donovan/font/fontSelection.pdf). Trabajos posteriores citan 37 atributos y 148 fuentes etiquetadas, una discrepancia a verificar en attribute.zip — [Attribute2Font](https://arxiv.org/pdf/2005.07865)
- Fontshare trae `font_tags` de uso (Branding, Logos, Poster, Websites), pero sirve de poco porque esas fuentes no se pueden usar (sección 1) — [Fontshare API](https://api.fontshare.com/v2/fonts?offset=0&limit=100)

### Inferences
- Mapear la "voz" que sale de la entrevista a los tags expresivos de Google Fonts, con sus puntajes, da una elección tipográfica **guiada por datos y no hardcodeada**. Encaja con la regla de la hackathon y con el 20 % de "calidad del uso de la IA".
- Para las fuentes no-Google (Velvetyne, Collletttivo, League), habría que etiquetarlas nosotros con el mismo esquema de tags, a mano o con un modelo de visión sobre muestras.
- El dataset de O'Donovan está pensado para investigación y su licencia no está clara (ver Gaps). Conviene usarlo solo como inspiración para definir los atributos.

### Gaps
- No verifiqué la licencia del directorio `tags/` del repo google/fonts. El repo mezcla licencias por carpeta (OFL, Apache, UFL), y los datos de tags podrían caer bajo la licencia general del repo. Hay que revisarlo antes de redistribuirlos.
- No verifiqué la licencia del dataset de O'Donovan ni los términos de fontpair.co, Typewolf y Fonts In Use sobre scraping o reutilización de datos. Lo prudente es asumir "solo referencia" y no scrapear.
- No busqué otros datasets académicos de atributos (p. ej. los de Attribute2Font o los derivados de MyFonts tags) más allá de lo citado.
