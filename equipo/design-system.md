# Design system de BrandIA y BranderIA · obligatorio para los tres

Todo lo que se ve en la app sigue este documento. Si tu Claude va a crear o cambiar una pantalla, lo lee antes. Si algo no está acá, se mira la fuente (`brandia/marca/` y `brandia/referencias/`) y no se inventa.

## 0. La referencia es la web que ya teníamos

- **La portada de la app es la web original de BrandIA, tal cual:** `apps/web/public/brandia.html`, que se ve en `/`. No se rehace ni se "mejora": se usa así.
- **La landing de lista de espera, también tal cual:** `apps/web/public/lista-de-espera.html`, en `/lista-de-espera`. Su formulario todavía no guarda datos: falta conectarlo a Supabase con `brandia/referencias/landing-waitlist/landing/supabase-waitlist.sql`.
- Las dos conservan todas sus animaciones (GSAP, ScrollTrigger, Lenis y Three.js). Si se cambia un texto o un link, se cambia solo eso.
- **La app donde se crea la marca vive en `/crear`** (y lo que cuelgue de ahí). Cada pantalla nueva **tiene que parecer parte de esa web**: misma tipografía (Fraunces con itálica en la palabra clave, como "lo que *hacés*"), mismo fondo hueso, botones píldora grafito con flecha, tarjetas tipo moodboard, mismo movimiento.
- Ante la duda, abrí `/` en el navegador y compará. Si una pantalla nueva no parece de la misma web, no está terminada.

## 1. Ya está cargado en el código: usalo, no lo copies

| Qué | Dónde vive | Cómo se usa |
|---|---|---|
| Colores, radios, modo oscuro | `packages/ui/src/styles/globals.css` | Clases de Tailwind: `bg-background`, `text-foreground`, `bg-primary` (grafito; el botón principal), `bg-secondary` (naranja, el único punto naranja), `text-muted-foreground` (piedra) y los colores de marca `bg-grafito`, `bg-naranja`, `bg-hueso`, `bg-cemento`, `text-piedra`, `text-accent-text` |
| Tipografías | `apps/web/src/app/layout.tsx` | **Fraunces** en títulos: `h1`, `h2`, `h3` y `.display` ya la usan, o la clase `font-display`. **Instrument Sans** en el texto: ya es la de todo el cuerpo |
| Logo | `apps/web/public/marca/` | `<img src="/marca/logo-horizontal.svg">` y la versión `-sobre-grafito` en modo oscuro. **El logo nunca se recrea ni se redibuja:** se usan esos SVG |
| Componentes | `packages/ui/src/components/` | Botones (píldora grafito como en la web; `variant="secondary"` es el naranja), tarjetas, campos, chat (`bubble`, `message`). Se importan de `@build101/ui/components/...` |
| Recursos de marca | `globals.css` | `.label` (etiqueta en mayúsculas), `.lead` (bajada), `.costura` (separador con el módulo naranja) |
| Animación | Ya instalados: `gsap`, `lenis`, `three` | Ver punto 4 |

**Si necesitás instalar algo nuevo, avisale a Eze antes**: dos ramas que instalan cosas distintas se pisan.

## 2. Paleta Taller y reglas duras

| Color | Hex | Uso |
|---|---|---|
| Grafito | `#1E1E1C` | Base, el 70 % de la superficie |
| Naranja Señal | `#FF5C1A` | La marca: **un solo punto naranja por pantalla**, sin contar el logo |
| Cemento | `#C9C6BE` | Bloques, neutro cálido |
| Hueso | `#EDECE8` | Fondo claro (papel, no pantalla) |
| Piedra | `#5C5A54` | Texto secundario sobre hueso o blanco |
| Naranja Tinta | `#B23B0A` | El naranja cuando es texto o link sobre claro |

Prohibido:
- Naranja Señal como texto sobre hueso o cemento (no se lee). Para texto, `text-accent-text`.
- Texto blanco sobre naranja. Sobre naranja, siempre grafito.
- Piedra sobre cemento.
- Degradés entre colores de la paleta. Solo se permite un halo difuso de fondo, nunca sobre texto ni logo.
- Dos puntos de naranja en la misma pantalla.
- Radios intermedios: 4 px en cosas chicas, 14 px en tarjetas, píldora en botones y etiquetas.

## 3. Voz

Español rioplatense, con voseo. Profesional pero fresco, cálido y directo. Frases cortas. "BrandIAr" es el verbo propio. Sin precios en pantalla hasta que los socios los cierren. Sin nombres de marcas ajenas (es "vaso térmico", no la marca).

## 4. Movimiento: el mismo de la web de BrandIA

La referencia es `brandia/referencias/plataforma-web/index.html` (y su `README.md`, que explica cada recurso). Se mantiene ese lenguaje:

- **Librerías:** GSAP con ScrollTrigger para animar, Lenis para el scroll suave (solo con mouse, `lerp: 0.09`) y Three.js solo para el 3D.
- **Curva:** `ease-brandia`, que es `cubic-bezier(.22,.8,.24,1)`. En GSAP: `power2.out` al entrar y `back.out(1.6)` para cosas que "caen en su lugar".
- **Tiempos:** 0,3 s en botones y detalles, 0,5 s al entrar elementos y 1,6 s en momentos de marca.
- **Recursos propios a reutilizar:**
  - La **B modular que se arma** con piezas: para la carga y para "estamos armando tu marca".
  - **Fraunces "se cocina"** (el peso pasa de 300 a 500 al cargar): para el título del brandbook.
  - **Letra por letra**, de genérico a Fraunces: para mostrar que la marca toma forma.
  - **Retirada visual:** la pantalla se tiñe con los colores y la tipografía del cliente.
  - **Carrusel 3D** de piezas: para el feed.
  - **El logo cae sobre el producto**: para BranderIA.
  - **El recorrido por pasos**, horizontal (sección `#armar` de la web): para la entrevista y la generación.
- **Celular:** las animaciones se ven en cualquier ancho. Por debajo de 860 px cambia el encuadre, no la película.
- **Menos movimiento:** si la persona lo pide en su sistema, todo aparece quieto y armado (ya resuelto en `globals.css`; en GSAP, chequear `prefers-reduced-motion`).
- **Mientras la IA trabaja**, siempre hay un mensaje de progreso animado, nunca una pantalla quieta.

## 5. Retirada visual: la marca del cliente manda en su lienzo

La app (barra, menús, botones) es BrandIA. **Todo lo que se genera para el cliente usa SU marca, no la nuestra:** el brandbook, los posteos, el reel, la web, el newsletter y los productos. Ahí no va el naranja de BrandIA ni nuestro logo. La pantalla "se retira" y le deja lugar a la marca del cliente.

Esos colores y tipografías salen de lo que generó la IA para esa marca, nunca escritos a mano en el código.

## 6. BranderIA (el marketplace)

- **Nombre:** BranderIA, sin espacio, "IA" en mayúsculas, sin tilde.
- **Catálogo inicial (12):** tarjetas, folletos, carpetas, lapiceras, gorros, remeras, tote bags, vasos térmicos, termos para mate, mates, tazas de café y soportes de celular para videollamadas.
- **En la demo:** está "en construcción", pero muestra cómo funciona. El logo del cliente cae sobre cada producto, la IA genera la foto del producto con su marca, y al tocar "Pedir" se explica que BranderIA le manda el pedido al proveedor y él lo entrega. Sin precios ni pedidos reales.
- **Referencia:** la sección Brandería de `brandia/referencias/plataforma-web/index.html` (en el código, el array `P` y la sección `#branderia`).

## 7. Costa: el ejemplo

Costa es la marca ficticia del manual: tipografías Young Serif y Karla. Sirve para ensayar y para el pitch. **En la demo todo tiene que funcionar también con una marca que invente el jurado**, así que nada de Costa puede quedar escrito en el código como resultado.

## 8. Antes de dar una pantalla por terminada

1. Se ve bien en la compu, en el celular (375 px de ancho) y en modo oscuro.
2. No hay scroll horizontal.
3. Hay un solo punto naranja.
4. Los textos se leen (contraste).
5. Las animaciones usan la curva y los tiempos de arriba.
6. Captura de pantalla para mostrarle al equipo.
