---
documento: Web BrandIA — cómo está construida y cómo editarla
version: v3 · borrador (2026-09-24) — copia de v2 (`../web/`, intacta) con las correcciones de Ezequiel
archivo: index.html (autocontenido)
publicada_en: artifact privado «BrandIA» (claude.ai) — se comparte desde el menú Share
dominio_destino: brandiamos.com (DNS pendiente)
---

# Web BrandIA · «De tus referencias a tu marca»

## Qué cambió en v3 (2026-09-24, pedido de Ezequiel)
- **Sin piloto en la web**: el piloto es privado (plan para gente cercana). Menú: Cómo funciona · Productos · Suscripción · **Brandería** · botón «BrandIAmos».
- **Brandería** (nombre propuesto para el marketplace, a confirmar): la sección de productos pasa a ser una tienda de muestra. Usás tu marca BrandIA o **subís tu logo** (se aplica a los 12 productos), elegís cantidades y «Pedir» explica que BrandIA manda el pedido al proveedor y él entrega. Demo, sin precios ni pedidos reales.
- Héroe sin el «brandiamos.com · app de marca con IA». Bajada nueva: «Vos elegís las referencias. Nosotros las convertimos en tu marca…».
- **Botones**: los textos invisibles del héroe tapaban los botones y se comían los clics (sobre todo en pantallas angostas). Ahora los textos ocultos no reciben clics y todos los links internos navegan por JS, con o sin Lenis.
- «Todo empieza en lo que ya sos» suma «¿No tenés nada armado? Arrancamos con unas preguntas».
- «BrandIA / encuentra el hilo.» + «Ordena todo y lo convierte en un sistema, pieza por pieza.» con los espacios ordenados.
- «Eso es BrandIAr»: botón «BrandIAmos →» + «o deslizá para ver más».
- Cuadro comparativo: una sola fila de rótulos, misma fuente y tamaño en todas las celdas, columnas alineadas (antes el nombre salía chico por un choque de estilos y la fila de BrandIA estaba corrida).
- «De tu historia a tu marca»: título más chico; Costa sin «inventada».
- Pasos: 1 Contanos → 2 **Elegí un estilo** (minimalista, con símbolo, tipográfico, emblema…) → 3 **Tu paleta, recomendada** (sugerida según las respuestas, después se ajusta) → 4 Listo, descargá todo + «Empezar a producir».
- Scroll horizontal más pesado: cada paso pide ~2 veces más recorrido y el scroll se asienta en el paso más cercano (no se saltea uno con un scroll de más).
- Sección Costa: texto nuevo («A partir de acá, la página deja de ser BrandIA y pasa a ser Costa…»).
- Suscripción: también genera merch de temporada, no solo piezas de contenido.
- Cierre: «¿Arrancamos con la tuya?» (sección `#empezar`, antes `#piloto`).

### Segunda vuelta (mismo día)
- **Sin formulario ni mail**: nadie contacta por mail salvo en Plus. Todos los botones «¿BrandIAmos?» (menú, héroe, B armada, cierre) van a la **plataforma**. Su dirección se pone en `APP_URL` (en el script); mientras esté vacía, bajan al cierre y avisan que la plataforma está en construcción.
- «BrandIAmos» siempre como pregunta: **«¿BrandIAmos?»**.
- Los 4 pasos: sin «snap» (que peleaba con el scroll). Ahora el recorrido tiene pausas: cada paso queda quieto un tramo y después se desliza al siguiente, suave.
- Paso 3 pasa a **«Paleta y tipografía»**: tipografía recomendada (titulares + textos) con alternativas para elegir.
- Sale «BrandIA es el taller, no la obra»; queda «Todo lo que ves acá sale de la plataforma, listo para descargar y usar».
- En celular, las tarjetas de la app se achican (menos detalles) para que entren en pantalla.

## Por qué hay una v2
El primer diseño (mañana del 23/9) repetía el lenguaje de la web de Brixia: fondo oscuro, grilla
de cuadrados, un objeto 3D rotando al centro, cursor propio y textos en mono. Ezequiel lo marcó
y se rehízo con un lenguaje propio. **Regla para adelante: esta web no comparte recursos visuales
con la de Brixia** (ni grilla de fondo, ni cursor, ni fuente mono, ni héroe oscuro).

## Concepto
Lo que hace BrandIAr, contado con el scroll: **tus referencias se convierten en tu marca.**
El héroe es un tablero de referencias en 3D (colores, palabras, fotos, tipografías) sobre papel
Hueso. Al bajar, la cámara lo atraviesa y cada tarjeta vuela a su lugar hasta formar la **B
modular hecha de módulos**; las dos piezas encastran (grafito arriba, naranja abajo).

## Recursos propios de esta web
| Sección | Recurso | Dónde se toca |
|---|---|---|
| `#hero` | Moodboard 3D → B de módulos (Three.js, pineado +430 %). Las casillas se calculan leyendo el SVG del logo v2 | Textos `.hrest`, `#c1`–`#c3`; timeline `tl`; texturas en `tex()` |
| `#hero h1` | Tipografía variable: Fraunces «se cocina» al cargar (peso 300→500, SOFT 0→50) | `hTitle` |
| `#generica` | «cualquiera» pasa de Arial gris a Fraunces itálica, letra por letra, con el scroll | `setFlip` |
| `#armar` | Recorrido **horizontal** por los 4 pasos de la app (versión clara de la app) | `.slide` |
| `#sistema` | **Retirada visual**: la sección se tiñe con los colores de Costa y titula con su tipografía | Timeline sobre `#sistema` |
| `#producir` | Carrusel 3D de las piezas del mes, gira con el scroll · interruptor Plus | Array `POSTS` |
| `#branderia` | Brandería: los 12 productos con cantidades, «Probá con tu logo» y carrito demo; el logo cae sobre cada producto | Array `P`, `STEPQ` (cantidades), `#lgFile` |
| `#planes` | Las cuatro capas en vista explotada: se separan con el scroll | `.plate` |
| `#empezar` | Cierre sobre naranja: 4 pasos y botón «¿BrandIAmos?» a la plataforma | `APP_URL`, `.go-app` |

Stack: un solo HTML. GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.14, Three.js r128. Fuentes: Fraunces
(variable, con ejes SOFT y WONK) + Instrument Sans; Young Serif + Karla solo para la marca de
ejemplo Costa (ficticia, del manual § 09).

## Reglas
- **El scrollytelling funciona en cualquier ancho** (celular, panel angosto, escritorio). Por debajo de 860 px cambia el encuadre (textos abajo, la B arriba, tarjetas de la app en una columna) pero no la película. Único cambio: en angosto el carrusel gira al pasar, sin clavarse. Lenis (scroll suave) solo con mouse. Antes, por debajo de 860 px se apagaba todo y la B se armaba sola: se veía en el panel de la app de escritorio y parecía que no había scrollytelling (corregido 23/9).
- `prefers-reduced-motion`: la B aparece armada y quieta.
- Botones grafito o naranja con texto grafito; naranja nunca como texto sobre claro.
- Sin precios hasta que los socios los cierren. Sin nombres de marcas ajenas (el vaso es «vaso térmico»).

## Pendientes
- [ ] Revisión de los tres socios.
- [ ] Portarla a Next.js como home de la app (día 3 del plan).
- [ ] Poner la dirección de la plataforma en `APP_URL` cuando esté publicada.
- [ ] Imagen para compartir (OG) y SEO básico.
