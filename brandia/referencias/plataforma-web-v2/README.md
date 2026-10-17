---
documento: Web BrandIA — cómo está construida y cómo editarla
version: v2 · borrador (2026-09-23) — reemplaza el primer diseño del mismo día
archivo: index.html (autocontenido)
publicada_en: artifact privado «BrandIA» (claude.ai) — se comparte desde el menú Share
dominio_destino: brandiamos.com (DNS pendiente)
---

# Web BrandIA · «De tus referencias a tu marca»

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
| `#productos` | Los 12 productos iniciales; el logo del cliente cae sobre cada uno | Array `P` (nombre, detalle, dibujo, posición del logo) |
| `#planes` | Las cuatro capas en vista explotada: se separan con el scroll | `.plate` |
| `#piloto` | Cierre sobre naranja con la lista de espera (todavía no guarda: va a `waitlist` en Supabase) | `#wl` |

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
- [ ] Conectar la lista de espera a Supabase.
- [ ] Imagen para compartir (OG) y SEO básico.
