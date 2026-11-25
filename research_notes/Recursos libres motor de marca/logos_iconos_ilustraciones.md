# Recursos libres para el motor de marca de BrandIA: logos, símbolos, íconos, ilustraciones, patrones y texturas

Notas de investigación al 20/11/2026. Convención de marcas:
- **[V]** = verificado en esta sesión contra la fuente primaria (o su resumen oficial).
- **[NV]** = no verificado en esta sesión: viene de conocimiento previo (hasta mediados de 2026). Se cita la URL primaria donde confirmarlo. Para el informe final, tratarlo como "a confirmar".

Separación que pide el encargo:
- **USABLE COMO ASSET EN EL PRODUCTO** = se puede meter en logos o posteos que se entregan al cliente (comercial ok).
- **SOLO REFERENCIA / ENTRENAMIENTO** = sirve para inspirar prompts, evaluar o investigar, pero no se debe entregar ni (a veces) ni siquiera entrenar.
- **PROHIBIDO para IA** = la licencia prohíbe expresamente entrenar, fine-tunear o meter en datasets.

---

## 1. Datasets de logos para investigación (LLD, Logo-2K+, FlickrLogos, OpenLogo, LogoDet-3K, WiRLD, con etiquetas de estilo)

### Takeaway
Todos los datasets académicos de logos son de logos de marcas reales, recolectados de la web, y en general **solo para investigación académica**. Para BrandIA sirven, como mucho, de referencia interna o para evaluar (por ejemplo, medir si un logo generado se parece demasiado a uno existente). No sirven como assets ni para un fine-tune comercial. El único con etiquetas parecidas a "estilo" es LLD, y son clusters sintéticos, no estilos con nombre.

### Cited Findings
- **LLD (Large Logo Dataset, ETH Zúrich)**: LLD-icon tiene 548.210 favicons de 32×32 (486.377 en la versión "clean"), sacados de la lista Alexa 1M en abril de 2017. LLD-logo tiene 122.920 logos de Twitter (agosto de 2017), de 64 a 400 px, la mayoría de 400×400. **[V]** — [LLD, ETH](https://data.vision.ee.ethz.ch/sagea/lld/)
- LLD: licencia "made available for academic research purposes only". Las imágenes son de sus dueños originales y la remoción se pide a los autores. **[V]** — [LLD, ETH](https://data.vision.ee.ethz.ch/sagea/lld/)
- LLD trae etiquetas de clustering sintéticas (clusters AE en escala de grises y clusters RC de 16 a 128), no etiquetas de estilo explícitas. **[V]** — [LLD, ETH](https://data.vision.ee.ethz.ch/sagea/lld/)
- **LogoDet-3K**: 3.000 clases y 194.261 objetos anotados para detección de logos, alojado en GitHub. El paper lo presenta como un recurso para la investigación de logos a gran escala. En lo que se encontró no hay un texto de licencia claro. **[V parcial]** — [arXiv 2008.05359](https://arxiv.org/abs/2008.05359v1); [PapersWithCode](https://cs.paperswithcode.com/dataset/logodet-3k)
- **QMUL-OpenLogo**: benchmark abierto de detección de logos que junta 7 datasets existentes, en qmul-openlogo.github.io. No se encontró la licencia. **[V parcial]** — [Open Logo Detection Challenge, arXiv 1807.01964](https://arxiv.org/pdf/1807.01964)
- **FlickrLogos-47**: usa el mismo corpus de imágenes que FlickrLogos-32, con clases nuevas (logo y texto separados) y anotaciones completadas. Se baja desde el sitio del grupo Multimedia Computing (Univ. Augsburg). No se encontró la licencia en los resultados. **[V parcial]** — [Survey Deep Learning for Logo Detection, arXiv 2210.04399](https://arxiv.org/pdf/2210.04399)
- FlickrLogos-32 se baja con un formulario de pedido y es para uso de investigación. Sus imágenes vienen de Flickr, con licencias de cada autor. **[NV]** — [FlickrLogos, Univ. Augsburg](https://www.uni-augsburg.de/en/fakultaet/fai/informatik/prof/mmc/research/datensatze/flickrlogos/)
- **Logo-2K+** (2.341 categorías y ~167 mil imágenes, organizadas en 10 rubros como comida, ropa o autos). Uso académico. **[NV]** — [Logo-2K+, arXiv 1911.07924](https://arxiv.org/abs/1911.07924)
- **WiRLD**: no se encontró ninguna fuente confiable en esta sesión. **[sin datos]**

### Inferences
- Lo útil es que Logo-2K+ está organizado **por rubro** (comida, ropa, autos, etc.). Como referencia interna sirve para estudiar las convenciones de cada rubro, pero son marcas registradas: no se pueden usar como few-shot visual en un producto que genera logos comerciales, porque arrastran el riesgo de que el resultado imite la marca.
- Un uso legítimo y valioso: un **chequeo anti-parecido** (similitud de embeddings, por ejemplo CLIP, contra LLD-logo o LogoDet-3K) para avisar si el logo generado se parece a uno real. Es uso interno, no se redistribuye y se acerca a "investigación", pero BrandIA es comercial: hay que confirmar con un abogado si eso entra en "academic research only". Lo más probable es que **no** entre.
- Ninguno de estos datasets da permiso para entrenar un modelo comercial.

### Gaps
- Las licencias formales de LogoDet-3K, QMUL-OpenLogo y FlickrLogos-47 no aparecieron en los resultados: hay que mirar el README o LICENSE de cada repo.
- WiRLD: no se encontró nada.
- No se encontró ningún dataset de logos con etiquetas de estilo con nombre (monograma, emblema, mascota, abstracto, etc.) y licencia comercial.

---

## 2. Colecciones de logos de marcas en SVG y APIs de logos (Simple Icons, svgl, gilbarbara/logos, Wikimedia, Brandfetch, Logo.dev, Clearbit)

### Takeaway
Son **logos de terceros (marcas registradas)**. El código o la colección puede ser CC0 o MIT, pero **la licencia de la colección no da derecho sobre la marca**. Para BrandIA sirven solo para **mostrar logos de otros como referencia** (por ejemplo, "la competencia de tu rubro" o íconos de redes en el mockup de un posteo), nunca como base del logo del cliente. Clearbit Logo API ya no existe. Brandfetch y Logo.dev tienen planes gratis con condiciones distintas.

### Cited Findings
- **Simple Icons**: el proyecto es CC0, pero "no significa que cada ícono sea CC0": algunos íconos tienen su propia licencia, indicada en su JSON. El proyecto aclara que no se hace responsable de reclamos de las marcas, que el usuario tiene que conseguir los permisos y que hay que seguir las guías de marca enlazadas. **[V]** — [Simple Icons DISCLAIMER](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md)
- Simple Icons: más de 3.000 íconos de marcas, en npm (`simple-icons`) y por CDN. **[NV: cantidad]** — [simpleicons.org](https://simpleicons.org)
- **svgl**: "A beautiful library with SVG logos", con licencia MIT (el código del repo) y una API en svgl.app/api. No tiene aviso de marcas; solo pide a quien sube un logo que se asegure de tener derecho a hacerlo. **[V]** — [GitHub pheralb/svgl](https://github.com/pheralb/svgl)
- **gilbarbara/logos (ex svgporn)**: más de 1.000 logos de empresas tech en SVG, con repo CC0. Los logos siguen siendo marcas de sus dueños. **[NV]** — [GitHub gilbarbara/logos](https://github.com/gilbarbara/logos)
- **Wikimedia Commons**: la plantilla `PD-textlogo` marca logos que se consideran de dominio público por ser solo texto o formas simples (no alcanzan el umbral de originalidad). Commons aclara que siguen protegidos como marca registrada (plantilla `Trademarked`). **[NV]** — [Commons: Template PD-textlogo](https://commons.wikimedia.org/wiki/Template:PD-textlogo)
- **Clearbit Logo API**: se dio de baja. Primero se anunció para el 1/12/2025; Logo.dev dice que el cierre fue el 8/12/2025. HubSpot recomendó Logo.dev como reemplazo. **[V]** — [HubSpot Community](https://community.hubspot.com/t/clearbit-logo-api-will-be-sunset-on-december-1-2025/134244); [Logo.dev, migración desde Clearbit](https://docs.logo.dev/migrations/clearbit)
- **Logo.dev**: lo armó el equipo que hizo la Logo API de Clearbit. El plan gratis **exige atribución a Logo.dev** donde se muestren los logos; sacarla requiere un plan pago desde USD 300 por año. Los límites del plan gratis se contradicen: 500.000 pedidos por mes según el README de GitHub y 5.000 por día según un posteo del fundador. **[V, con conflicto de cifras]** — [GitHub logo-dev/logo-api](https://github.com/logo-dev/logo-api); [logo.dev/clearbit](https://www.logo.dev/clearbit)
- **Brandfetch Logo API**: es gratis con un client ID gratuito y **sin atribución**. Las cifras se contradicen: las docs dicen 1.000.000 de pedidos por mes y el marketing dice 500.000. **[V, con conflicto de cifras]** — [Brandfetch Logo API overview](https://docs.brandfetch.com/logo-api/overview); [brandfetch.com/developers/logo-api](https://brandfetch.com/developers/logo-api.md)
- Brandfetch: la API es para usarla **dentro del propio producto**, no para licenciar los logos a los usuarios. Brandfetch aclara que usar el logo de un tercero en productos o servicios propios **no** es fair use; lo permitido es referirse a la marca. Lo que se guarda en caché tiene una licencia de 30 días. **[V]** — [Brandfetch guidelines](https://docs.brandfetch.com/logo-api/guidelines); [Brandfetch logo fair use](https://docs.brandfetch.com/guides/logo-fair-use)

### Inferences
- **Uso concreto en BrandIA (permitido):** (a) en la entrevista, mostrar los logos de la competencia que nombre el cliente ("¿te gusta más el estilo de X o de Y?"), con Brandfetch, sin atribución y respetando la caché de 30 días; (b) poner íconos de redes (Instagram, TikTok, WhatsApp) en mockups y posteos con Simple Icons, siguiendo las guías de cada marca.
- **No hacer:** meter logos reales como few-shot visual para generar el logo del cliente. El riesgo es la confusión marcaria (que el logo nuevo se parezca a una marca registrada), algo que el cliente podría no poder registrar después. Tampoco sirve como base de entrenamiento.
- Para un producto white-label, la atribución que exige el plan gratis de Logo.dev es un problema; Brandfetch encaja mejor.

### Gaps
- Las cifras exactas y actuales de los planes gratis de Logo.dev y Brandfetch se contradicen entre fuentes: hay que mirar las páginas de precios.
- No se verificó la cantidad actual de logos en svgl ni en gilbarbara/logos.

---

## 3. Librerías de símbolos e íconos para armar logos (Noun Project, Iconify, Phosphor, Lucide, Tabler, Heroicons, Remix, Material Symbols, Game-icons, OpenMoji, Twemoji, Fluent Emoji)

### Takeaway
Las librerías de íconos open source (MIT, ISC, Apache) se pueden usar comercialmente en el producto. Ojo: **un ícono genérico sin modificar como logo no es registrable y no es distintivo**. Conviene usarlas como piezas (glifos de apoyo, íconos de posteos, highlights de historias) o como "semillas" que la IA transforma, no como el logo final. La Noun Project **prohíbe usar su API para entrenar IA** y no deja registrar íconos sin modificar como marca. OpenMoji es CC BY-SA (share-alike, contagia la licencia).

### Cited Findings
- **Noun Project API**: prueba gratis de 30 días (1.000 llamadas de servicio por día, 150 llamadas de íconos). Pago por uso: USD 0,0025 por llamada de servicio y USD 0,0095 por ícono, con un mínimo de USD 25 por mes. El plan Custom tiene un mínimo de USD 300 por mes. Los íconos vienen con licencia "royalty-free" para uso comercial. **[V]** — [Noun Project Developers](https://thenounproject.com/developers/)
- Noun Project: usar los íconos o imágenes de la API para **entrenar IA está prohibido** sin aprobación previa. **[V]** — [Prohibited Use Cases for Noun Project API](https://help.thenounproject.com/hc/en-us/articles/47964341999131-Prohibited-Use-Cases-for-Noun-Project-API); [API Getting Started](https://api.thenounproject.com/getting_started.html)
- Noun Project: no se pueden registrar como marca íconos sin modificar. **[V vía resumen de búsqueda; confirmar el texto]** — [Noun Project Legal](https://thenounproject.com/legal/)
- **Iconify**: agregador de más de 200 sets y más de 200.000 íconos, con API pública (api.iconify.design) y paquetes npm `@iconify/json` y `@iconify-json/*`. **Cada set tiene su propia licencia**, que figura en los metadatos del JSON (`info.license`). **[NV]** — [Iconify](https://iconify.design/); [icon-sets.iconify.design](https://icon-sets.iconify.design/)
- **Phosphor**: MIT, unos 9.000 íconos (1.500 base × 6 pesos: thin, light, regular, bold, fill, duotone). **[NV]** — [GitHub phosphor-icons](https://github.com/phosphor-icons/homepage)
- **Lucide**: ISC, más de 1.500 íconos de trazo. **[NV]** — [lucide.dev/license](https://lucide.dev/license)
- **Tabler Icons**: MIT, más de 5.000 íconos de trazo y relleno. **[NV]** — [GitHub tabler/tabler-icons](https://github.com/tabler/tabler-icons)
- **Heroicons**: MIT, unos 300 íconos (Tailwind Labs). **[NV]** — [GitHub tailwindlabs/heroicons](https://github.com/tailwindlabs/heroicons)
- **Remix Icon**: más de 2.800 íconos. Pasó de Apache-2.0 a una "Remix Icon License" propia (v4.x, en 2024) que, según se recuerda, restringe usarlos como logo o marca y venderlos como paquete. **[NV, importante confirmar]** — [GitHub Remix-Design/RemixIcon, License](https://github.com/Remix-Design/RemixIcon/blob/master/License)
- **Material Symbols / Material Icons (Google)**: Apache-2.0, más de 3.000 símbolos, fuente variable con ejes de relleno, peso, grado y tamaño óptico. **[NV]** — [GitHub google/material-design-icons](https://github.com/google/material-design-icons)
- **Game-icons.net**: más de 4.000 íconos de un solo color (estilo heráldico, fantasía, objetos), CC BY 3.0, **exige atribución**. **[NV, no apareció en la búsqueda]** — [game-icons.net/about](https://game-icons.net/about.html)
- **OpenMoji**: los gráficos son **CC BY-SA 4.0** y el código LGPL-3.0. Pide el crédito "All emojis designed by OpenMoji – the open-source emoji and icon project. License: CC BY-SA 4.0". **[V]** — [OpenMoji FAQ](https://openmoji.org/faq); [GitHub hfg-gmuend/openmoji](https://github.com/hfg-gmuend/openmoji)
- **Fluent Emoji (Microsoft)**: MIT, en estilos 3D, color, flat y high-contrast. Hay que conservar el aviso de licencia. **[V vía fuentes secundarias]** — [Emojipedia Licenses](https://shop.emojipedia.org/pages/licenses); [allsvgicons, emoji](https://www.allsvgicons.com/collections/emoji/)
- **Twemoji** (hoy jdecked/twemoji): gráficos CC BY 4.0, código MIT, con atribución. **[NV]** — [GitHub jdecked/twemoji](https://github.com/jdecked/twemoji)

### Inferences
- **Como asset en el producto (usable):** Phosphor, Lucide, Tabler, Heroicons y Material Symbols (MIT, ISC o Apache, sin atribución visible) para la UI, los íconos dentro de posteos y carruseles, las portadas de historias destacadas y las piezas del brandbook. Fluent Emoji (MIT) sirve para posteos descontracturados.
- **Con atribución:** Game-icons (CC BY) y Twemoji (CC BY) se pueden usar comercialmente, pero hay que acreditarlos en algún lado. En un logo eso es incómodo. Mejor usarlos en contenidos y no en el logo.
- **Evitar en logos:** OpenMoji (share-alike: el logo derivado tendría que quedar CC BY-SA, incompatible con que el cliente sea dueño de su marca) y Remix Icon (posible cláusula anti-logo, a confirmar).
- **Como semilla para la IA (lo más valioso para que no salga genérico):** con Iconify se pueden buscar 2 o 3 glifos por concepto del rubro (por ejemplo "ola", "taza", "hoja") y pasárselos al modelo como **punto de partida que transforma** (combinar, recortar, monograma, espacio negativo). Se filtra por `info.license` y solo entran MIT, ISC, Apache, CC0 u OFL. Así el logo no sale de la nada ni es una copia del ícono.
- **Entrenamiento:** con MIT o Apache en principio se puede, pero Noun Project está prohibido expresamente.

### Gaps
- La licencia actual de Remix Icon (si prohíbe el uso como logo) hay que confirmarla en el archivo License del repo.
- Las cantidades exactas de íconos de cada set no se verificaron en esta sesión.
- No se encontró el texto completo de la licencia de la Noun Project sobre usar íconos dentro de logos de clientes (solo el FAQ de que no se registran sin modificar).

---

## 4. Ilustraciones (unDraw, Open Peeps, Humaaans, Open Doodles, DrawKit, Blush, Storyset, IRA Design, Absurd, Manypixels)

### Takeaway
Varias "gratis para uso comercial" **prohíben armar un servicio parecido o competidor y redistribuirlas**, y unDraw **prohíbe explícitamente el entrenamiento de IA, los datasets de ML y el fine-tuning**, además del scraping. Para un generador automático como BrandIA, las más seguras son las de **dominio público (CC0)** de Pablo Stanley: Open Peeps, Humaaans y Open Doodles. Las demás conviene tratarlas como referencia o pedir permiso.

### Cited Findings
- **unDraw**: uso comercial gratis sin atribución, con modificaciones permitidas. Prohíbe "replicate a similar or competing service", redistribuirlas "in packs or otherwise", y linkearlas, embeberlas, scrapearlas o bajarlas de forma automática sin consentimiento. **La IA y el ML están prohibidos explícitamente**: entrenar IA generativa, meterlas en datasets o fine-tunear modelos requiere un permiso escrito de unDraw. **[V]** — [unDraw License](https://undraw.co/license)
- **Blush**: se pueden usar gratis en proyectos comerciales y no comerciales, modificarlas y combinarlas, sin atribución obligatoria. Prohíbe revender o redistribuir, compilarlas para replicar un servicio competidor y usarlas como base de merchandising (por ejemplo, estamparlas en una remera). Los artistas conservan la propiedad. No dice nada sobre entrenar IA. **[V]** — [Blush License](https://blush.design/license)
- **Storyset (Freepik)**: según un sitio que compara licencias (que se presenta como "Not Legal Advice"), el uso gratis exige atribución a Storyset o Freepik y no permite redistribuir. No se encontró una cláusula propia sobre IA. **[V parcial, fuente secundaria]** — [licenseorg, Storyset](https://licenseorg.com/guide/design-graphics/storyset)
- **Open Peeps** (más de 584.000 combinaciones de personajes armables), **Humaaans** y **Open Doodles**, de Pablo Stanley: CC0, dominio público. **[NV]** — [openpeeps.com](https://www.openpeeps.com/); [humaaans.com](https://www.humaaans.com/); [opendoodles.com](https://www.opendoodles.com/)
- **DrawKit**: tiene packs gratis y pagos con una licencia propia; los gratis permiten uso comercial y prohíben redistribuir. **[NV]** — [drawkit.com/license](https://www.drawkit.com/license)
- **IRA Design** (Creative Tim): ilustraciones armables con gradientes, gratis para uso comercial. **[NV]** — [iradesign.io](https://iradesign.io/)
- **Absurd Design**: ilustraciones surrealistas en blanco y negro. El plan gratis exige atribución y limita la cantidad de usos por proyecto. **[NV]** — [absurd.design](https://absurd.design/)
- **Manypixels Gallery**: ilustraciones gratis con color editable para uso comercial, con licencia propia que prohíbe redistribuir. **[NV]** — [manypixels.co/gallery](https://www.manypixels.co/gallery)

### Inferences
- **Usable como asset (bajo riesgo):** Open Peeps, Humaaans y Open Doodles (CC0). Se les cambia el color con la paleta de la marca, en el código, y se usan en posteos, en la web del cliente y en el brandbook. Open Peeps además es "armable" (cabezas, cuerpos y caras), así que la IA puede elegir las combinaciones y **variar mucho** sin generar imágenes, a costo cero.
- **Riesgo para BrandIA:** un generador de marca que inserta ilustraciones de forma automática en contenidos de miles de clientes puede leerse como "replicar un servicio competidor" o "redistribuir", lo que choca con unDraw, Blush, DrawKit y Manypixels. unDraw además prohíbe el acceso automatizado y la IA. **No usar unDraw en el motor.**
- **Storyset** exige atribución en el plan gratis: no conviene en contenidos de cliente.
- **Solo referencia de estilo (texto en prompts):** se pueden nombrar estilos genéricos ("flat con formas orgánicas", "personajes dibujados a mano en blanco y negro") sin usar los archivos.

### Gaps
- Las licencias de Open Peeps, Humaaans, Open Doodles, DrawKit, IRA, Absurd y Manypixels no se verificaron en esta sesión.
- No se encontró la postura oficial de Storyset ni de Blush sobre entrenar IA.

---

## 5. Patrones, texturas, formas y archivos de ornamentos de dominio público

### Takeaway
Hay buenas opciones: generadores de SVG de licencia abierta (Hero Patterns CC BY 4.0, Haikei, Pattern Monster MIT, SVG Backgrounds, Blobmaker) y archivos históricos de **dominio público** (Grammar of Ornament de Owen Jones, de 1856, en Internet Archive; Biodiversity Heritage Library; Old Book Illustrations). Para BrandIA, lo mejor es **generar los patrones y las formas por código** con la paleta de la marca (sin depender de licencias de imágenes) y usar los ornamentos de dominio público como textura o motivo de rubros "artesanales o clásicos".

### Cited Findings
- **Hero Patterns** (Steve Schoger): unos 90 patrones SVG repetibles, CC BY 4.0 (con atribución). **[NV]** — [heropatterns.com](https://heropatterns.com/)
- **Pattern Monster**: generador de patrones SVG, MIT. **[NV]** — [GitHub catchspider/pattern.monster](https://github.com/catchspider/pattern.monster)
- **Haikei**: generador web de formas SVG (olas, blobs, gradientes de malla, capas); lo que se genera es libre para uso comercial. No tiene API pública. **[NV]** — [haikei.app](https://haikei.app/)
- **SVG Backgrounds** (svgbackgrounds.com): tiene fondos gratis con atribución y fondos pro pagos. **[NV]** — [svgbackgrounds.com/license](https://www.svgbackgrounds.com/license/)
- **Blobmaker**: generador de blobs SVG; las formas son libres. Es trivial reproducirlo por código (por ejemplo con el paquete npm `blobs`). **[NV]** — [blobmaker.app](https://www.blobmaker.app/)
- **Grainy gradients**: es una técnica (filtro SVG `feTurbulence` sobre un gradiente CSS), no un asset con licencia. **[NV]** — [CSS-Tricks, Grainy Gradients](https://css-tricks.com/grainy-gradients/)
- **Transparent Textures**: texturas PNG repetibles, muchas originalmente de Subtle Patterns (CC BY-SA 3.0). Licencia mixta. **[NV]** — [transparenttextures.com](https://www.transparenttextures.com/)
- **The Grammar of Ornament (Owen Jones, 1856)**: es de dominio público por antigüedad y hay escaneos en Internet Archive. **[NV]** — [Internet Archive, Grammar of Ornament](https://archive.org/details/grammarofornamen00jone)
- **Biodiversity Heritage Library**: tiene muchas de sus imágenes en Flickr con la marca de dominio público o "No known copyright restrictions" (las ilustraciones botánicas y zoológicas son muy útiles para marcas de alimentos, cosmética o jardinería). **[NV]** — [BHL en Flickr](https://www.flickr.com/photos/biodivlibrary/)
- **Old Book Illustrations**: grabados de libros viejos de dominio público. El sitio aclara que el dominio público depende del país y pide no redistribuir sus escaneos en bloque. **[NV]** — [oldbookillustrations.com, términos](https://www.oldbookillustrations.com/terms-of-use/)

### Inferences
- **Generar por código, no bajar:** patrones geométricos (puntos, rayas, cuadrículas, ondas), blobs y ruido (grain) se hacen en SVG o canvas con la paleta y la forma del logo como motivo. Es 100 % original, sin licencias, y sigue la regla de la consigna de "nada armado a mano para la demo" (lo genera el motor para cualquier marca).
- **La IA puede elegir el tipo de patrón** según la personalidad de la marca (por ejemplo, geométrico y prolijo para un estudio contable, orgánico con grano para una panadería). Es una función de la IA real y barata.
- **Ornamentos de dominio público:** sirven como capa de textura o marco para rubros clásicos (vinos, barberías, cafés, herboristerías). Se deben guardar como copias propias y confirmar el dominio público en Uruguay (allá el plazo es la vida del autor más 70 años). Para obras de 1856 es seguro.
- Hero Patterns pide atribución (CC BY): en contenidos del cliente es incómodo, así que mejor regenerarlos por código.

### Gaps
- Ninguna de estas licencias se verificó en esta sesión (las búsquedas se priorizaron para lo de mayor riesgo).
- No se confirmó el estado actual de Transparent Textures ni de Subtle Patterns.

---

## 6. Teoría de diseño de logos y papers o datasets de generación de logos y SVG con IA (Logo Modernism, LogoLounge, StarVector, OmniSVG/MMSVG, IconShop, LogoSticker, Text-to-Vector)

### Takeaway
Los datasets de SVG grandes y recientes son MMSVG (OmniSVG), con licencia **CC BY-NC-SA 4.0 (no comercial)**, y SVG-Stack (StarVector, unas 2,28 millones de filas), que **no declara licencia** aunque dice venir de repos permisivos. Ninguno sirve con seguridad para un fine-tune comercial. Los **modelos** (código y pesos) sí son Apache-2.0. Los libros de referencia (Logo Modernism) y LogoLounge sirven solo como inspiración conceptual (estilos y tendencias con nombre en los prompts), no como imágenes.

### Cited Findings
- **OmniSVG**: el código y el modelo son Apache-2.0. El dataset **MMSVG es CC BY-NC-SA 4.0**. Hay modelos publicados en Hugging Face (por ejemplo OmniSVG1.1_4B). **[V]** — [Hugging Face OmniSVG](https://huggingface.co/OmniSVG/OmniSVG); [OmniSVG1.1_4B](https://huggingface.co/OmniSVG/OmniSVG1.1_4B)
- MMSVG: se publicaron los subconjuntos MMSVG-Icon y MMSVG-Illustration (9/4/2025). MMSVG-Character figuraba como pendiente, así que el MMSVG-2M completo podría no estar entero. **[V]** — [GitHub OmniSVG](https://github.com/OmniSVG); [arXiv 2504.06263](https://arxiv.org/abs/2504.06263)
- **SVG-Stack (StarVector)**: 2.283.875 filas (2,17 M de entrenamiento, 108 mil de validación y 5,71 mil de prueba) y 3,01 GB. **La tarjeta de Hugging Face no tiene campo de licencia.** **[V]** — [HF starvector/svg-stack](https://huggingface.co/datasets/starvector/svg-stack)
- El paper de StarVector dice que SVG-Stack sale de repos de GitHub "open and license-permissive" (filtrado de The Stack). El código de StarVector es Apache-2.0. **[V]** — [arXiv 2312.11556](https://arxiv.org/abs/2312.11556); [colección StarVector en HF](https://huggingface.co/collections/starvector/starvector-svg-datasets-svg-bench)
- **IconShop** (Wu et al., 2023): genera íconos SVG desde texto con un transformer autoregresivo. Se entrenó con FIGR-8-SVG, derivado de íconos de la Noun Project (ver la prohibición de IA de la sección 3). **[NV]** — [arXiv 2304.14400](https://arxiv.org/abs/2304.14400)
- **Text-to-Vector / SVG por optimización**: VectorFusion y SVGDreamer generan SVG optimizando con un modelo de difusión, sin dataset propio. **[NV]** — [VectorFusion arXiv 2211.11319](https://arxiv.org/abs/2211.11319); [SVGDreamer arXiv 2312.16476](https://arxiv.org/abs/2312.16476)
- **LogoSticker**: inserta logos en modelos de difusión (personalización). Es investigación y no da un dataset con licencia comercial. **[NV]** — [arXiv 2407.13752](https://arxiv.org/abs/2407.13752)
- **Logo Modernism** (Jens Müller, Taschen, 2015): unos 6.000 logos de 1940 a 1980, organizados en 3 capítulos (geométricos, efecto y tipográficos) con subcategorías. Es un libro con copyright, **solo referencia conceptual**. **[NV]** — [Taschen, Logo Modernism](https://www.taschen.com/en/books/graphic-design/02147/logo-modernism/)
- **LogoLounge**: el informe anual de tendencias se publica gratis en su sitio y en Logo Lounge; la base de logos con búsqueda es por suscripción paga. **[NV]** — [logolounge.com/trends](https://www.logolounge.com/trends)

### Inferences
- **No hacer un fine-tune comercial con MMSVG** (es no comercial y share-alike). SVG-Stack no tiene licencia declarada y es una mezcla de licencias de GitHub: es riesgoso y requiere una revisión legal.
- **Sí se puede probar un modelo** OmniSVG o StarVector (Apache-2.0) para **vectorizar** el logo que genera el modelo de imágenes (imagen → SVG limpio), útil para el brandbook. Hay que revisar si los pesos heredan restricciones del dataset; la tarjeta dice Apache-2.0 para el modelo.
- **Lo más rentable para la demo, sin datasets:** armar en el prompt una **taxonomía de estilos de logo** con nombre, inspirada en Logo Modernism (geométrico, monograma, espacio negativo, emblema, wordmark, mascota, abstracto, letra modular) y en las tendencias de LogoLounge, y que la IA **elija y combine** según el brief. Eso da variedad sin copiar imágenes: es teoría, no se copia contenido protegido.

### Gaps
- La licencia formal de SVG-Stack no se encontró; hay que mirar el README de GitHub joanrod/star-vector.
- No se confirmó si los pesos de OmniSVG tienen restricciones heredadas del dataset NC.
- No se verificó el acceso actual a los informes de LogoLounge (gratis o de pago).

---

## Resumen operativo para el motor (síntesis de lo anterior)

**Usable como asset en el producto (comercial, sin atribución visible):** Phosphor, Lucide, Tabler, Heroicons y Material Symbols (íconos MIT, ISC o Apache [NV]); Fluent Emoji (MIT, conservar el aviso de licencia) [V]; Open Peeps, Humaaans y Open Doodles (CC0 [NV]); patrones, blobs y grano generados por código; ornamentos de dominio público (Owen Jones, BHL) [NV].

**Usable con atribución (mejor en contenidos que en logos):** Game-icons (CC BY 3.0), Twemoji (CC BY 4.0), Hero Patterns (CC BY 4.0) [NV]; OpenMoji (CC BY-SA 4.0, evitar en logos por el share-alike) [V].

**Solo para mostrar logos de terceros como referencia (marcas registradas):** Simple Icons [V], svgl [V], gilbarbara/logos [NV], Brandfetch API (gratis, sin atribución, uso dentro del producto) [V], Logo.dev (atribución en el plan gratis) [V]. Clearbit está cerrado [V].

**Solo referencia o investigación (no entregar ni entrenar comercialmente):** LLD [V], LogoDet-3K, OpenLogo, FlickrLogos y Logo-2K+ [V parcial o NV]; MMSVG (CC BY-NC-SA) [V]; SVG-Stack (sin licencia declarada) [V]; Logo Modernism y LogoLounge (conceptual) [NV].

**Prohibido para IA o automatización:** unDraw (IA, ML, datasets, fine-tuning y scraping prohibidos) [V]; Noun Project API (entrenamiento de IA prohibido) [V]. Riesgo de "servicio competidor" o "redistribución": Blush [V], DrawKit, Manypixels y Storyset [NV].
