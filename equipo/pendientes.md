# Pendientes de BrandIA · después de la hackathon

**La lista única del equipo.** Todo lo que falta hacer, con su rama y su responsable. Junta las anotaciones de
Juan Pedro (20/10), la lista "Después de la demo" de `plan-finde.md` y lo que seguía abierto en las listas de
pendientes del Drive.

**El reparto es una propuesta para la reunión del 21/10 a las 15:00:** ahí se confirma o se cambia.

## Cómo se usa

1. Cada tarea tiene un número que no cambia. Para hablar de una tarea, se dice el número ("la 4").
2. **Estado:** `por empezar`, `en curso`, `hecho (fecha)` o `frenada (por qué)`.
3. Cuando alguien empieza o termina una tarea, actualiza su fila en **su rama**, y la línea llega a `main` con el
   próximo merge.
4. Las tareas nuevas van al final de su sección, con el número que sigue (el último usado está abajo de todo).
5. **Nada privado acá: el repo es público.** Lo del registro de marca, los pilotos, los precios y los acuerdos
   entre socios queda en el Drive.

## Las ramas

| Rama | Quién | Qué toca |
|---|---|---|
| `ia` | Eze | El motor: prompts, rutas de la IA y costos (`apps/web/src/lib/ia/` y `apps/web/src/app/api/`) |
| `pantallas` | Juan Pedro | Lo que se ve: `/crear`, los componentes y la portada |
| `web-cliente` | Rodrigo | La web que BrandIA le arma a cada cliente |
| `pruebas` | Rodrigo | Casos de prueba y pantallas "en construcción" |
| Sin rama | A definir | Tareas del negocio que no son código |

Algunas tareas tocan dos ramas, por ejemplo, un cambio en el prompt y su pantalla. Ahí se anota primero la rama
que arranca y la otra entre paréntesis, y se coordina entre los dos.

---

## `ia` · el motor (Eze)

| # | Tarea | Estado |
|---|---|---|
| 1 | **Límites a las iteraciones:** un máximo de versiones cuando el cliente pide cambios, para que no se dispare el costo de cada identidad (hoy, unos USD 1,20). Definir qué pasos tienen límite y cuántas veces se repite cada uno | por empezar |
| 2 | **Iterar y combinar logos (muy importante):** que el prompt permita iterar sobre un logo, combinar dos o más sugerencias y buscar otras formas de generarlos. (Con `pantallas`: elegir más de una sugerencia en la pestaña que ya existe) | por empezar |
| 3 | **Chequear el nombre en Instagram:** cuando la persona elige un nombre, buscar si ya existe la cuenta, avisarle y recomendarle alternativas | por empezar |
| 23 | **Subir referencias en el logo:** que la IA use el logo actual de la persona o imágenes que le gustan como referencia. (Con `pantallas`: el lugar para subirlas) | por empezar |
| 24 | **Más estilos de diseño:** hoy el feed arranca con dos estilos para elegir. Sumar más, para que las marcas no salgan todas parecidas. (Con `web-cliente`: lo mismo en las webs) | por empezar |
| 25 | **BranderIA según lo que producimos:** que la IA elija productos para cada rubro, pero solo dentro de un catálogo de lo que BrandIA puede producir. Mientras tanto, el carrito avisa "Armá tu carrito y consultá por disponibilidad" | por empezar |

## `pantallas` · lo que se ve (Juan Pedro)

| # | Tarea | Estado |
|---|---|---|
| 4 | **Descargables pixelados:** el brandbook, los logos y los fondos de la estética salen pixelados al descargarlos. Revisar el tamaño y el formato (por ejemplo, el logo en SVG, que no pierde calidad) | por empezar |
| 8 | **Sección de artículos de BrandIA en nuestra web:** artículos nuestros, con noticias, contenido e información del rubro, para nuestros usuarios. (Los textos, con `ia` o escritos por el equipo) | por empezar |
| 10 | **Paso inicial "¿ya tenés marca propia?"** antes de los pasos, para separar rebranding, comprar productos con la marca o arrancar de cero. Hoy solo está en la lista de espera | por empezar |
| 11 | **Encabezado del marketplace en la portada:** todavía dice "marketplace de tu marca". Pasarlo a BranderIA, que produce y manda los productos | por empezar |
| 12 | **Scroll horizontal de la portada:** que el texto "BranderIA" no se superponga al logo | por empezar |
| 13 | **Suscripción y precios en la portada:** ubicarlos sin cortar la lectura | por empezar |
| 14 | **Lista de sugerencias de texto para la web** | por empezar |
| 15 | **Imagen para compartir el link** (og:image, 1200 × 630) con el logo v2, para que se vea bien en WhatsApp y redes | por empezar |

## `web-cliente` · la web del cliente (Rodrigo)

| # | Tarea | Estado |
|---|---|---|
| 5 | **Sugerir una sección de blog en la web del cliente,** con artículos o noticias que BrandIA también podría escribir | por empezar |
| 6 | **Auditoría del rubro:** mirar sitios de negocios del mismo rubro y recomendarle al cliente lo que está omitiendo (por ejemplo, el blog). (Con `ia`: la búsqueda y la comparación) | por empezar |
| 26 | **Íconos de la marca para la web:** los de las historias destacadas ya salen con el feed; faltan los de la web | por empezar |

## A definir en la reunión

| # | Tarea | Estado |
|---|---|---|
| 7 | **Mensaje de WhatsApp de cada pedido de BranderIA:** hoy llega un texto simple. Que traiga el nombre de la empresa o la razón social y más datos del cliente. Va junto con la 27 | por empezar |
| 27 | **Pedidos de BranderIA automáticos:** hoy el pedido se guarda y se manda por WhatsApp a mano. Después, que una automatización le escriba al cliente con la cotización | por empezar |

## Sin rama · negocio (a definir)

| # | Tarea | Estado |
|---|---|---|
| 9 | **Correos oficiales de BrandIA** con nuestro dominio (por ejemplo, hola@brandiamos.com). Definir cuáles y con qué servicio, y configurar el dominio para que no lleguen como spam (registros MX, SPF, DKIM y DMARC). Sirve también para la 27 | por empezar |
| 16 | **Cerrar el isotipo:** proporciones, grilla y versión compacta (menos de 32 px) | por empezar |
| 17 | **Rehacer favicon, badges, versiones de color y archivos para imprenta** con el logo nuevo | por empezar |
| 18 | **Plantillas de la marca:** post e historia de Instagram, presentación comercial, propuesta, firma de mail y factura | por empezar |
| 19 | **Aprobar la identidad v1.3** y sacarle el rótulo de "provisoria" al manual | por empezar |
| 20 | **Tomar los usuarios @brandiamos** en Instagram, TikTok y LinkedIn, y crear la página de Facebook e Instagram. Sin página no se puede pautar | por empezar |
| 21 | **Narrativa "usamos nuestra propia IA para crear nuestra marca"** para la web y el pitch | por empezar |
| 22 | **Campaña de lista de espera:** cuenta publicitaria de Meta, píxel, texto de privacidad, primeras piezas y presupuesto. Detalle en `brandia/referencias/landing-waitlist/` | por empezar |

## Siguiente etapa (ya decidida, sin fecha)

- **Pauta en Meta** y **medir el rendimiento de los contenidos.** Detalle en `plan-finde.md` → "Decisiones
  pendientes".

## Ya resueltas o que no aplican más

- Cuentas de GitHub y Supabase, y el "prompt maestro": se hicieron en la hackathon.
- Carrusel de los pasos en la portada: hecho en celular (se desliza con el dedo). Ver si en compu también hace
  falta.
- Rol de BranderIA ("solo conecta" o "produce y manda"): decidido el 17/10, produce y manda.

---

**Último número usado: 27.**
