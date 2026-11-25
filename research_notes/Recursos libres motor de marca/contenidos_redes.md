# Recursos libres para el diseño de contenidos en redes (motor de BrandIA)

Investigado el 20/11/2026. Alcance: plantillas, conocimiento sobre layouts, librerías de anuncios, fotos y video gratis, y guías de estrategia, más sus términos de servicio (uso comercial, uso automatizado en SaaS, uso en prompts, entrenamiento de IA). Se consultaron alrededor de 20 fuentes. Algunas páginas primarias bloquearon el acceso (Meta Ad Library web, la página de licencias de Freepik/Magnific), y en esos casos se marca. Todo lo que no tiene fuente va en Gaps.

## 1. Fuentes de plantillas (Figma, Penpot, Canva, Freepik, motores open source)

### Takeaway
La fuente de plantillas más segura para uso comercial y automatizado son los **archivos gratis de Figma Community (CC BY 4.0 por defecto, pide atribución)** y los **motores de render propios** (Satori, con licencia MPL-2.0, y Remotion, gratis solo para equipos de hasta 3 personas). **Canva prohíbe extraer o scrapear contenido para cualquier fin, IA incluida.** Polotno no es gratis para uso comercial. La forma práctica de variar layouts es inspirarse en las estructuras y reimplementarlas como plantillas de código propias. Copiar los archivos no conviene.

### Cited Findings
- **Figma Community, licencia de los archivos gratis:** se publican por defecto bajo CC BY 4.0, que "isn't a public domain license". Permite compartir y adaptar para cualquier fin, también comercial. Hay que dar crédito al creador, y el creador puede sumar otras licencias. Para entrenamiento de IA la página no dice nada. — [Figma Help: Community copyright and licensing](https://help.figma.com/hc/en-us/articles/360042296374-Figma-Community-copyright-and-licensing)
- **Figma, archivos pagos:** van bajo la Community Paid Resource License, y el creador no puede ofrecerlos con otros términos. — [Figma Help](https://help.figma.com/hc/en-us/articles/360042296374-Figma-Community-copyright-and-licensing)
- **Figma "Community Free Resource License":** es la licencia por defecto de los **plugins y widgets gratis, no de los archivos**. Es restrictiva:
  - no se puede transferir ni sublicenciar, ni dejar que terceros usen los recursos;
  - prohíbe modificarlos y hacer obras derivadas, y prohíbe la ingeniería inversa para descubrir su "structure, ideas, know-how";
  - el uso queda atado a la plataforma Figma.

  Para el motor, entonces: los archivos (plantillas) sí se pueden usar, y los plugins no. — [Figma Community Free Resource License](https://www.figma.com/legal/community-free-resource-license/); [Figma Help](https://help.figma.com/hc/en-us/articles/360042296374-Figma-Community-copyright-and-licensing)
- **Canva, prohibición de extracción (confirmada en parte):** según un registro de terceros de los Terms of Use, Canva prohíbe "any form of data mining, extraction, or scraping on the Service and its contents for any purpose, including AI, machine learning, and data science purposes". La Acceptable Use Policy también prohíbe bots o spiders que superen un uso humano normal. — [ConductAtlas: Canva ToU, scraping](https://conductatlas.com/platform/canva/canva-terms-of-use/prohibition-on-data-scraping-and-mining/); [ConductAtlas: AUP](https://conductatlas.com/platform/canva/canva-terms-of-use/acceptable-use-policy/)
- **Canva, términos para desarrolladores:** restringen scrapear o exportar en masa contenido, plantillas, fuentes, fotos de stock o datos de usuarios más allá de lo que permite la API. También prohíben usar Outputs, el contenido de Canva o la API para "train, fine-tune, distil, evaluate or improve" modelos de machine learning sin permiso escrito. — [Canva Dev: restricted uses](https://www.canva.dev/docs/apps/restricted-uses/); [Canva Dev: MCP prohibited use](https://www.canva.dev/docs/mcp/prohibited-use/)
- **Polotno SDK** (editor tipo Canva para la web): la licencia gratis cubre solo uso no comercial o desarrollo local, y para uso comercial hay que comprar una. Los precios que dan las fuentes no coinciden (un agregador habla de USD 249/mes y otro de USD 899). — [Polotno license](https://polotno.com/license); [Polotno pricing](https://polotno.com/pricing)
- **Remotion** (video con React): gratis, con uso comercial ilimitado, para personas y organizaciones de **hasta 3 personas**. Desde 4 personas se necesita una Company License, desde USD 100/mes. El LICENSE.md avisa que la licencia "will slightly change" en Remotion 5.0. — [Remotion LICENSE.md](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md); [Remotion pricing](https://www.remotion.dev/docs/license/pricing)
- **Satori** (Vercel, pasa HTML/JSX a SVG; es la base de `@vercel/og`): licencia MPL-2.0. Es copyleft débil: solo hay que compartir los cambios a los archivos de Satori, no el proyecto entero. — [vercel/satori en GitHub](https://github.com/vercel/satori/); [Ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com%2Fvercel%2Fsatori)
- **Freepik:** el artículo de soporte sobre atribución ahora redirige a `magnific.com/ai/docs/licenses-attribution` (posible cambio de marca o de dominio), y esa página devolvió 403. No se pudieron verificar las reglas de atribución. — [redirección de support.freepik.com, observada el 20/11/2026](https://support.freepik.com/s/article/Attribution-How-when-and-where)

### Inferences
- **Remotion:** BrandIA tiene hoy 3 socios, así que entra en el tramo gratis. Si suman una cuarta persona, o si la empresa crece, necesitan pagar la Company License. Conviene vigilarlo.
- **Satori + Remotion como motor propio de plantillas:** el motor puede describir un "layout" en JSON (grilla, jerarquía, posición del texto y de la foto) y renderizarlo con Satori (imágenes estáticas, carruseles) o con Remotion (reels). Así los layouts son código propio y se esquivan los problemas de licencia de las plantillas de terceros.
- **Figma CC BY:** sirve para estudiar y reproducir estructuras (grilla, márgenes, jerarquía). Si se copia un archivo concreto, hay que atribuirlo al creador, lo que no es práctico dentro de un post de cliente. La recomendación es inspirarse sin copiar. Las ideas de layout no tienen copyright, pero la expresión concreta de un archivo sí.
- **Canva:** no conviene usarlo como fuente para el motor, ni scrapeando ni metiendo sus plantillas en prompts.

### Gaps
- **Penpot** (open source, MPL-2.0 según lo que se sabía antes de esta investigación): no se verificó la licencia de las librerías y plantillas de su hub. Probablemente cada una tiene la suya.
- **Kittl, Creative Market (free goods), Envato (free):** no se verificaron sus términos. Lo esperable, sin confirmar, es que sean licencias de uso final que prohíben redistribuir y usar las plantillas en productos o servicios que generan plantillas.
- **Placid, Bannerbear, Templated:** no se verificaron sus galerías ni términos. Son SaaS pagos. Sus galerías probablemente sirven solo como inspiración.
- **Motion Canvas:** no se verificó la licencia. Se cree MIT, sin confirmar.
- **Canva:** no se pudo leer el texto oficial de los Terms of Use. La cita sale de un registro de terceros (ConductAtlas) y de los términos para desarrolladores.
- **Freepik/Magnific:** no se pudieron verificar las reglas de atribución ni las restricciones para IA.

## 2. Datasets abiertos de layouts gráficos

### Takeaway
**Crello** (CyberAgent, en Hugging Face) es el dataset más útil: unos 23.300 diseños reales de VistaCreate con canvas, tipo de elemento, posición, fuente, color e industria. La licencia del dataset es **CDLA-Permissive-2.0**, pero la tarjeta aclara que **el distribuidor no tiene los derechos de las plantillas originales** y pide aceptar el acuerdo de VistaCreate. Para extraer estadísticas de layout (proporciones, ubicaciones, tamaños de texto) parece razonable. Para reproducir plantillas, no.

### Cited Findings
- **`cyberagent/crello`:**
  - Tamaño: 23.3k filas (19,5k de entrenamiento, 1,85k de validación y 1,97k de prueba), en Parquet.
  - Campos: `canvas_width`, `canvas_height`, `category`, `industries`, `keywords`, `suitability`, `type`, `left`, `top`, `width`, `height`, `angle`, `opacity`, `color`, `text`, `font`, `font_size`, `text_align`, `line_height`, `letter_spacing`, `preview` y otros.
  - Licencia en la tarjeta: `cdla-permissive-2.0`.

  — [HF cyberagent/crello](https://huggingface.co/datasets/cyberagent/crello)
- **Crello, derechos de las plantillas:** versiones anteriores de la tarjeta dicen que el distribuidor "do[es] not own the copyrights of the original design templates" y que hay que aceptar los acuerdos de licencia de VistaCreate. Una versión todavía más vieja tenía la licencia marcada como "other". — [Crello README, revisión](https://huggingface.co/datasets/cyberagent/crello/blob/d9bbb4739d24eac118cc9c8349700642771c8758/README.md); [README raw](https://huggingface.co/datasets/cyberagent/crello/raw/bb08fbf455ca5fbae6345abfd0111768209e2860/README.md)
- **OpenCOLE (`cyberagent/opencole`):** licencia Apache 2.0. Son anotaciones sobre Crello v4.0.0, así que la licencia cubre solo esas anotaciones y no cambia los términos de las plantillas de Crello. — [HF cyberagent/opencole README](https://huggingface.co/datasets/cyberagent/opencole/raw/main/README.md)
- **Papers de referencia que cita la tarjeta de Crello:** arXiv 2108.01249 (CanvasVAE) y 2509.25134. — [HF cyberagent/crello](https://huggingface.co/datasets/cyberagent/crello)

### Inferences
- **Uso concreto 1, estadísticas para el prompt:** se pueden sacar números agregados de Crello, por `category` (por ejemplo, posteo de Instagram o historia) y por `industries`:
  - dónde va el título;
  - qué parte del canvas ocupa la foto;
  - cuántos elementos de texto hay;
  - qué proporción hay entre el tamaño del título y el del cuerpo.

  Con eso se arma un catálogo de 15 a 30 "arquetipos de layout" que el motor elige según el rubro. Estadísticas como esas son hechos, no reproducen plantillas.
- **Uso concreto 2, few-shot:** meter en los prompts JSON de layouts reales de Crello como ejemplos, con las posiciones normalizadas. Es un uso más gris por los derechos de VistaCreate. Si se hace, que sea solo con la geometría, sin imágenes ni textos.
- **Entrenamiento de un modelo propio:** la licencia CDLA-Permissive-2.0 en sí permite usar los resultados libremente. El riesgo está en los derechos de VistaCreate. Para un SaaS comercial, mejor no hacer fine-tuning sin una revisión legal.

### Gaps
- **PubLayNet** (layouts de documentos médicos, IBM): se cree CDLA-Permissive-1.0, pero no se verificó. Además sirve poco para redes sociales.
- **RICO** (pantallas de apps móviles): no se verificó la licencia. Sirve poco para posteos.
- **Magazine layout dataset, DesignBench, datasets de LayoutGPT y COLE:** no se verificaron sus licencias. COLE/OpenCOLE se apoyan en Crello.
- **Versión de Crello:** la tarjeta no muestra el número de versión actual. OpenCOLE dice que usa v4.0.0, y el pedido de investigación mencionaba "v5".
- **Acuerdo de VistaCreate:** no se leyó.

## 3. Librerías de anuncios (Meta, TikTok, Google, LinkedIn)

### Takeaway
**La API de la Ad Library de Meta casi no sirve para Uruguay y LatAm:** los anuncios que no llegaron a ningún lugar de la UE solo se devuelven si son de temas sociales, elecciones o política. Un anuncio comercial de un negocio uruguayo no aparece por API, aunque sí en la web de la Ad Library. **Google Ads Transparency no tiene API oficial**: hay una tabla pública en BigQuery que cubre el EEE y Turquía. **TikTok Creative Center** se scrapea mucho, pero sin permiso claro, y su API oficial (Commercial Content API) cubre la UE bajo la DSA. Ninguna librería da una fuente limpia y automatizable de "qué funciona en tu rubro" para Uruguay.

### Cited Findings
- **Meta `ads_archive`:** "Ads that did not reach any location in the EU will only return if they are about social issues, elections or politics."
  - Valores de `ad_type`: ALL, EMPLOYMENT_ADS, FINANCIAL_PRODUCTS_AND_SERVICES_ADS, HOUSING_ADS, POLITICAL_AND_ISSUE_ADS.
  - Busca por palabras clave en el texto, las imágenes, el audio de los videos y los botones de llamada a la acción, o por hasta 10 IDs de páginas (`search_page_ids`).
  - Las palabras clave no se traducen.
  - Se pide un `access_token`.

  — [Meta Graph API: ads_archive](https://developers.facebook.com/docs/graph-api/reference/ads_archive/)
- **Meta, campos de la UE:** para los anuncios que llegan a la UE, la Ad Library y su API muestran quién se beneficia y quién paga (según Meta, 2023). Un blog de terceros lista campos como eu_total_reach, target_ages y target_locations. — [Meta for Developers blog, 2023](https://developers.facebook.com/blog/post/2023/05/16/new-marketing-mpa-api-requirements-for-facebook-and-instagram-ads-targeting-eu/); [adlibrary.com, secundario](https://adlibrary.com/posts/eu-dsa-ad-repositories-developers)
- **Meta, anuncios políticos en la UE:** según una fuente secundaria, Meta dejó de aceptarlos en octubre de 2025. — [adlibrary.com, secundario](https://adlibrary.com/posts/meta-ad-library-eu-political-ads)
- **Meta, la página de la Ad Library API** (facebook.com/ads/library/api) devolvió 403 a la consulta automatizada. — observación propia, 20/11/2026
- **Google Ads Transparency Center:**
  - Existe la tabla pública `bigquery-public-data.google_ads_transparency_center.creative_stats`. El listado del marketplace dice que cubre el Espacio Económico Europeo o Turquía, mientras que la web permite buscar en todo el mundo.
  - Un usuario del foro reportó datos incompletos.
  - Hay además un dataset aparte de anuncios políticos, desde 2018.

  — [Google Cloud Community, foro](https://discuss.google.dev/t/querying-public-google-ads-transparency-center-table-doesnt-show-all-the-needed-data/177804); [Google Cloud blog, political ads dataset](https://cloud.google.com/blog/topics/developers-practitioners/how-get-started-political-ads-transparency-report-dataset)
- **Google, scrapers:** hay scrapers de terceros en Apify que extraen creativos de la web. Uno dice que Google limita a unos 1.000 creativos por anunciante. Cobran entre USD 0,35 y 1,00 cada 1.000 resultados. Son afirmaciones de los vendedores. — [Apify: google-ads-transparency-scraper](https://apify.com/fetch_cat/google-ads-transparency-scraper.md)
- **TikTok:**
  - Los scrapers de Top Ads del Creative Center dicen usar un "browser-computed authenticated API" o interceptar un endpoint interno, y le dejan al usuario la responsabilidad de cumplir los términos de TikTok.
  - Según esos vendedores, la Commercial Content API oficial pide aprobación de desarrollador, tiene límites estrictos, cubre la librería de contenido comercial de la UE bajo la DSA y no expone el texto de los anuncios.

  — [Apify: TikTok Ads Library Scraper (Commercial Content API)](https://apify.com/bovi/tiktok-ads-library-scraper); [Apify: datapeak tiktok-creative-center](https://apify.com/datapeak/tiktok-creative-center.md)

### Inferences
- **Para "qué funciona en tu rubro" en Uruguay**, las opciones legítimas son tres:
  1. que la persona mire la web de la Ad Library de Meta (búsqueda manual por país UY y palabra clave) y le pase a BrandIA capturas o links para analizar;
  2. que el motor consulte la API con `ad_reached_countries` de la UE, para anuncios de marcas globales del mismo rubro que también pautan en Europa;
  3. usar los propios datos de rendimiento del cliente (la Graph API de Instagram), con su permiso.
- **Scrapear** la web de la Ad Library, el Creative Center o el Transparency Center choca con los términos de servicio y es riesgoso para un SaaS. Aunque terceros como Apify lo ofrezcan, no conviene basar el producto en eso.
- **Lo que un motor puede aprender de los anuncios:**
  - qué ganchos se repiten en la primera línea;
  - qué llamadas a la acción usa cada rubro;
  - qué formatos dominan (video o imagen fija, carrusel);
  - cuánto duran activos los anuncios, como señal de que funcionan.

  Vale aprender patrones, no copiar creativos.

### Gaps
- **LinkedIn Ad Library:** no se investigó, por el límite de consultas. Existe la librería web, pero no se verificó si tiene API ni sus términos.
- **Meta:** no se pudo leer el texto de los términos de la Ad Library API sobre scraping y uso comercial (la página dio 403).
- **TikTok:** no se leyeron los términos oficiales del Creative Center.
- **Google:** no se confirmó en la página de BigQuery si la tabla incluye las imágenes de los creativos ni cómo queda la cobertura fuera de la UE.

## 4. Fotos y videos gratis con API

### Takeaway
**Pexels** (200 pedidos por hora y 20.000 por mes, gratis y comercial, con link visible a Pexels) y **Unsplash** (las fotos se muestran desde sus URLs, hay que registrar las descargas y atribuir) son las mejores opciones para un SaaS. **Pixabay** obliga a guardar en caché 24 h, prohíbe el hotlinking permanente y "automated bulk querying". Ninguna de las tres menciona explícitamente el entrenamiento de IA en las páginas leídas. Unsplash dice que su API es para experiencias "non-automated", un punto gris para un motor que elige fotos solo.

### Cited Findings
- **Unsplash API:**
  - las imágenes se muestran desde `photo.urls` (hotlinking obligatorio);
  - cuando la app hace algo parecido a una descarga, hay que avisar al endpoint `download_location`;
  - hay que atribuir al fotógrafo y a Unsplash, con links con UTM;
  - no se puede usar el nombre ni el logo de Unsplash;
  - no se pueden vender fotos sin alterar, por ejemplo en productos impresos;
  - no se puede replicar Unsplash;
  - "The API is meant for non-automated, high-quality, authentic experiences";
  - los usuarios no tienen que necesitar su propia cuenta de desarrollador.

  La página no da números de límites de uso. — [Unsplash API Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines)
- **Unsplash, licencia:** uso comercial y no comercial, gratis y sin permiso; la atribución "is appreciated". Prohíbe vender sin "significant modification" y juntar imágenes para crear un servicio similar o competidor. No menciona la IA. — [Unsplash License](https://unsplash.com/license)
- **Pexels API:**
  - hay que poner un link visible a Pexels ("Photos provided by Pexels" o el logo) y acreditar a los fotógrafos cuando se pueda;
  - el límite es de 200 pedidos por hora y 20.000 por mes, y se puede pedir más, incluso ilimitado y gratis si se cumplen los términos;
  - el contenido se puede usar "for anything you'd like";
  - no se puede replicar la funcionalidad central de Pexels;
  - tiene endpoints de video (`/v1/videos/`);
  - no menciona la IA.

  — [Pexels API docs](https://www.pexels.com/api/documentation/)
- **Pixabay API:**
  - 100 pedidos cada 60 s por clave;
  - caché obligatoria de 24 h;
  - "Automated bulk querying and systematic mass downloads are prohibited";
  - no se permite el hotlinking permanente: hay que bajar las imágenes al servidor propio;
  - los videos se pueden incrustar;
  - las URLs en resolución completa requieren aprobación;
  - hay que mostrar de dónde viene el contenido;
  - el contenido se rige por la Pixabay Content License.

  — [Pixabay API docs](https://pixabay.com/api/docs/)
- **Openverse:**
  - permite filtrar por `license` y por `license_type=commercial` o `modification`;
  - hay límites más bajos sin autenticación y más altos con token, y al pasarse devuelve 429;
  - según unos términos archivados de 2024, se reserva el derecho a "charge fees for commercial uses... and/or for heavy usage".

  Los números exactos de límites salen de terceros y no están verificados. — [Openverse ToS, archivo 2024](https://webcf.waybackmachine.org/web/20240518175049/https://docs.openverse.org/terms_of_service.html); [Jentic: Openverse API](https://jentic.com/apis/openverse.org/openverse); [Make WordPress Openverse: out-of-terms usage](https://make.wordpress.org/openverse/2022/06/17/mitigating-out-of-terms-api-usage/)

### Inferences
- **Uso concreto para el motor:** cuando la IA no genera la foto (por costo o realismo), el motor busca en Pexels o Unsplash con palabras clave del brief y de la paleta, y la monta en el layout de la marca.
  - **Unsplash:** no se descarga la foto; se usa la URL (el texto se puede superponer en el render), se avisa al endpoint de descarga al publicar y se guarda el crédito.
  - **Pexels:** es la opción más simple para video (reels de fondo).
- **Tensión con Unsplash:** la frase "non-automated" choca con un motor 100 % automático. Pexels es más permisivo. Conviene preguntarle a Unsplash antes de pedir el acceso de producción.
- **Openverse:** mezcla licencias CC, así que hay que filtrar siempre con `license_type=commercial,modification` y guardar la atribución de cada imagen.

### Gaps
- **Unsplash:** no se verificaron los límites actuales de la API (el demo, que se recordaba en unos 50 pedidos por hora, sin confirmar).
- **Coverr y Mixkit** (video), **Wikimedia Commons** (licencias mezcladas, por imagen), **Smithsonian Open Access y Met Open Access** (CC0 según lo que se sabía antes, sin confirmar): no se verificaron, por el límite de consultas.
- **Entrenamiento de IA:** ninguna página leída de Unsplash, Pexels o Pixabay lo menciona. No se leyeron los términos de servicio completos, donde puede haber cláusulas.

## 5. Referencias de estrategia de contenido y especificaciones de Instagram 2026

### Takeaway
En las fuentes de 2026 que se consultaron, el estándar para feed es **1080×1350 (4:5)**. La grilla del perfil ahora recorta a **3:4**: el contenido importante tiene que ir en el centro, y 1080×1440 llena la grilla exacta. Historias y reels van en **1080×1920 (9:16)**, con márgenes de seguridad para los controles de la app. Sobre esos márgenes hay dos reglas distintas que no se verificaron en una fuente oficial de Meta: 250 px arriba y abajo, o 14 % arriba, 35 % abajo y 6 % a cada costado.

### Cited Findings
- **Feed:** la mayoría recomienda 1080×1350 (4:5) con una zona segura centrada en 3:4. También se acepta 1080×1440 (3:4), que llena la grilla exacta. Según una fuente, el área de un post 4:5 que sobrevive al recorte de la grilla es de unos 1012×1350. — [Oktopost: Instagram grid size guide 2026](https://www.oktopost.com/blog/instagram-grid-size-guide/); [Buffer: Instagram image size 2026](https://buffer.com/library/instagram-image-size); [Linearity](https://www.linearity.io/blog/instagram-size-guide/); [Metricool](https://metricool.com/instagram-image-size/)
- **Historias y reels:** 1080×1920 (9:16). Las fuentes no coinciden en los márgenes de seguridad:
  - una dice dejar 250 px arriba y abajo;
  - otra, citando las especificaciones de Meta, da para reels 14 % arriba, 35 % abajo y 6 % a cada costado, y dice que las especificaciones de anuncios en historias usan la misma zona.

  — [PostEverywhere: Instagram aspect ratios](https://posteverywhere.ai/blog/instagram-aspect-ratios); [Buffer](https://buffer.com/library/instagram-image-size)

### Inferences
- **Para el motor:**
  - generar el feed en 1080×1350 con un "contenedor seguro" de 1012×1350 centrado para el texto y el logo;
  - en historias y reels, el texto principal no baja del 65 % de la altura ni sube del 14 %, y quedan 6 % de margen a cada costado (la regla más conservadora).
- **Validación automática:** se pueden poner estos números como restricciones en el JSON de layout y controlarlos solos al renderizar. Así ningún título queda tapado por la interfaz de Instagram.

### Gaps
- **Especificaciones oficiales de Meta y Instagram** (Meta Business Help Center, Instagram Creators): no se consultaron directamente. Todas las medidas salen de blogs de herramientas (Buffer, Oktopost, Metricool).
- **Guías de estrategia:** no se investigaron, por el límite de consultas:
  - las de Meta Business e Instagram Creators sobre buenas prácticas y ganchos;
  - las plantillas gratis de HubSpot;
  - las guías de formatos y ganchos de Later y Buffer;
  - el informe Social Trends 2026 de Hootsuite.

  Sus licencias de contenido suelen ser de "lectura": sirven para que el equipo destile reglas propias para los prompts, no para copiar textos.
- **Newsletter:** no se investigaron medidas ni buenas prácticas.
