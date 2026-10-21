# Pendientes de BrandIA · después de la hackathon

**La lista única del equipo.** Todo lo que falta hacer, con su rama y su responsable. Junta las anotaciones de
Juan Pedro (20/10), la lista "Después de la demo" de `plan-finde.md` y lo que seguía abierto en las listas de
pendientes del Drive.

**En la reunión del 21/10 se fijaron las prioridades** (abajo). No se repasó el reparto tarea por tarea: sigue
como propuesta y se cambia en la próxima reunión.

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
| `cuentas` | Eze y Rodrigo | Cuentas, ingreso y cobro. Hoy está en `claude/cuentas-y-cobros-cc7592` |
| Sin rama | A definir | Tareas del negocio que no son código |

Algunas tareas tocan dos ramas, por ejemplo, un cambio en el prompt y su pantalla. Ahí se anota primero la rama
que arranca y la otra entre paréntesis, y se coordina entre los dos.

## Prioridades (reunión del 21/10)

Las tres con bandera roja, en este orden:

1. **Cuentas de usuario** (la 28, con la 29 a la 32). Lo primero de todo. Hay que pensarlo bien: no es una tarea
   para largarle a un agente solo.
2. **Cobro** (la 33 y la 34).
3. **Más contenido:** el feed del mes completo al suscribirse (la 36) y que la persona pueda cargar sus logos o
   contenidos (la 23).

Después, en el día a día: la **biblioteca de referencias** para nuevos estilos (la 37).

---

## `ia` · el motor (Eze)

| # | Tarea | Estado |
|---|---|---|
| 1 | **Límites a las iteraciones:** un máximo de versiones cuando el cliente pide cambios, para que no se dispare el costo de cada identidad (hoy, unos USD 1,20). Definir qué pasos tienen límite y cuántas veces se repite cada uno | por empezar |
| 2 | **Iterar y combinar logos (muy importante):** que el prompt permita iterar sobre un logo, combinar dos o más sugerencias y buscar otras formas de generarlos. (Con `pantallas`: elegir más de una sugerencia en la pestaña que ya existe) | por empezar |
| 3 | **Chequear el nombre en Instagram:** cuando la persona elige un nombre, buscar si ya existe la cuenta, avisarle y recomendarle alternativas | por empezar |
| 23 | **Subir logos, referencias y contenidos propios (prioridad 3):** que la persona cargue su logo actual, imágenes que le gustan o contenidos que ya tiene, y que la IA los use como referencia. (Con `pantallas`: el lugar para subirlos) | por empezar |
| 24 | **Más estilos de diseño:** hoy el feed arranca con dos estilos para elegir. Sumar más, para que las marcas no salgan todas parecidas. (Con `web-cliente`: lo mismo en las webs) | por empezar |
| 25 | **BranderIA según lo que producimos:** que la IA elija productos para cada rubro, pero solo dentro de un catálogo de lo que BrandIA puede producir. Mientras tanto, el carrito avisa "Armá tu carrito y consultá por disponibilidad" | por empezar |
| 36 | **Feed del mes completo (prioridad 3):** cuando la persona se suscribe, que salga el contenido de todo el mes y no solo de 7 días. Más contenido, no más opciones de feed | en curso (Eze) |
| 37 | **Biblioteca de referencias para nuevos estilos (segunda etapa):** los tres mandan al grupo capturas y links de cuentas de Instagram, WhatsApp o webs que les gusten. Después Claude analiza ese material (la meta es llegar a unas 50 referencias) y saca ideas para nuevos motores y estilos. Va junto con la 24 | por empezar |

## `pantallas` · lo que se ve (Juan Pedro)

| # | Tarea | Estado |
|---|---|---|
| 4 | **Descargables pixelados:** el brandbook, los logos y los fondos de la estética salen pixelados al descargarlos. Revisar el tamaño y el formato (por ejemplo, el logo en SVG, que no pierde calidad) | por empezar |
| 8 | **Sección de artículos de BrandIA en nuestra web:** artículos nuestros, con noticias, contenido e información del rubro, para nuestros usuarios. (Los textos, con `ia` o escritos por el equipo) | por empezar |
| 10 | **Paso inicial "¿ya tenés marca propia?"** antes de los pasos, para separar rebranding, comprar productos con la marca o arrancar de cero. Hoy solo está en la lista de espera | por empezar |
| 11 | **Encabezado del marketplace en la portada:** todavía dice "marketplace de tu marca". Pasarlo a BranderIA, que produce y manda los productos | hecho (21/10) |
| 12 | **Scroll horizontal de la portada:** que el texto "BranderIA" no se superponga al logo | hecho (21/10) |
| 13 | **Suscripción y precios en la portada:** ubicarlos sin cortar la lectura | por empezar |
| 14 | **Lista de sugerencias de texto para la web** | por empezar |
| 15 | **Imagen para compartir el link** (og:image, 1200 × 630) con el logo v2, para que se vea bien en WhatsApp y redes | hecho (21/10) |

## `web-cliente` · la web del cliente (Rodrigo)

| # | Tarea | Estado |
|---|---|---|
| 5 | **Sugerir una sección de blog en la web del cliente,** con artículos o noticias que BrandIA también podría escribir | por empezar |
| 6 | **Auditoría del rubro:** mirar sitios de negocios del mismo rubro y recomendarle al cliente lo que está omitiendo (por ejemplo, el blog). (Con `ia`: la búsqueda y la comparación) | por empezar |
| 26 | **Íconos de la marca para la web:** los de las historias destacadas ya salen con el feed; faltan los de la web | por empezar |

## `cuentas` · cuentas, ingreso y cobro (Eze y Rodrigo)

| # | Tarea | Estado |
|---|---|---|
| 28 | **Cuentas de usuario (prioridad 1):** la persona se registra antes de empezar y su marca queda guardada en su cuenta, en Supabase. Los clientes entran con un **código que llega por mail**, sin contraseña ni app de autenticación. El registro también arma la base para mails, WhatsApp y remarketing | en curso (rama `claude/cuentas-y-cobros-cc7592`: código por mail o Google, marcas guardadas y `cuentas.sql`) |
| 29 | **Seguridad del ingreso:** averiguar si entrar con un código por mail alcanza para una app así o qué capa falta. Ver también si entrar con Google conviene para nuestro público | por empezar |
| 30 | **Ingreso de los socios:** tres mails fijos de administrador, cada uno con su contraseña y un código de 6 números de una app del celular (Google Authenticator o Contraseñas del iPhone). Reemplaza la contraseña compartida de `/costos`, `/pruebas` y los pedidos. La sesión vence sola a las 12 h | por empezar |
| 31 | **Mandar los mails del código:** un servicio de envío (se nombró Resend) con nuestro dominio, para que no lleguen como spam. Va con la 9 | por empezar |
| 32 | **Pantalla de ingreso:** correo, código de 6 números, "cambiar correo" y "mandarme otro código", con la identidad de BrandIA (ideas del ingreso del CRM de Gary+, sin copiarlo). (Juan Pedro, en `pantallas`) | en curso: `/ingresar` está en `main` (21/10) sin conectar y marcada "en construcción"; falta ajustar el celular. Ojo: la rama de cuentas trae su propia pantalla en `/crear/cuenta`, hay que quedarse con una |
| 33 | **Cobro (prioridad 2):** conectar el medio de pago. La comparación de Mercado Pago y Stripe está en `equipo/cobros.md` de la rama de cuentas y recomienda Mercado Pago | en curso (comparación hecha) |
| 34 | **"No pagás nada hasta ver tus archivos":** la persona se suscribe al empezar y se le cobra recién cuando ve o descarga sus archivos, como hace Looka. Un aviso claro al arrancar ("creá el espacio de tu marca"). Falta definir el momento exacto del cobro. (Con `pantallas`: el aviso) | por empezar |
| 35 | **Proteger la marca antes de pagar:** que no se la lleven con una captura de pantalla. En una web no se puede bloquear del todo una captura; lo que sí se puede es mostrarla con marca de agua o en baja resolución hasta que pague | por empezar |

## A definir en la reunión

| # | Tarea | Estado |
|---|---|---|
| 7 | **Mensaje de WhatsApp de cada pedido de BranderIA:** hoy llega un texto simple. Que traiga el nombre de la empresa o la razón social y más datos del cliente. Va junto con la 27 | por empezar |
| 27 | **Pedidos de BranderIA automáticos:** hoy el pedido se guarda y se manda por WhatsApp a mano. Después, que una automatización le escriba al cliente con la cotización | por empezar |

## Sin rama · negocio (a definir)

| # | Tarea | Estado |
|---|---|---|
| 9 | **Correos oficiales de BrandIA** con nuestro dominio (por ejemplo, hola@brandiamos.com). Definir cuáles y con qué servicio, y configurar el dominio para que no lleguen como spam (registros MX, SPF, DKIM y DMARC). Sirve también para la 27 y para mandar los códigos de ingreso (la 31) | por empezar |
| 16 | **Cerrar el isotipo:** proporciones, grilla y versión compacta (menos de 32 px) | por empezar |
| 17 | **Rehacer favicon, badges, versiones de color y archivos para imprenta** con el logo nuevo | por empezar |
| 18 | **Plantillas de la marca:** post e historia de Instagram, presentación comercial, propuesta, firma de mail y factura | por empezar |
| 19 | **Aprobar la identidad v1.3** y sacarle el rótulo de "provisoria" al manual | por empezar |
| 20 | **Tomar los usuarios @brandiamos** en Instagram, TikTok y LinkedIn, y crear la página de Facebook e Instagram. Sin página no se puede pautar | por empezar |
| 21 | **Narrativa "usamos nuestra propia IA para crear nuestra marca"** para la web y el pitch | por empezar |
| 22 | **Campaña de lista de espera:** cuenta publicitaria de Meta, píxel, texto de privacidad, primeras piezas y presupuesto. Detalle en `brandia/referencias/landing-waitlist/` | por empezar |
| 38 | **Oferta para quien no paga:** un aviso con una oferta por tiempo limitado si alguien armó su marca y no la pagó, y la idea de los "Brand Fridays" (el primer viernes de cada mes, más barato). Los precios se definen en el Drive | por empezar |
| 39 | **Una cuenta de Vercel para cada uno**, cuando haya más volumen, para no depender de Eze para las claves y la configuración. Hoy Juan Pedro y Rodrigo son Viewer (gratis) | por empezar |

## Siguiente etapa (ya decidida, sin fecha)

- **Pauta en Meta** y **medir el rendimiento de los contenidos.** Detalle en `plan-finde.md` → "Decisiones
  pendientes".

## Ya resueltas o que no aplican más

- Cuentas de GitHub y Supabase, y el "prompt maestro": se hicieron en la hackathon.
- Carrusel de los pasos en la portada: hecho en celular (se desliza con el dedo). Ver si en compu también hace
  falta.
- Rol de BranderIA ("solo conecta" o "produce y manda"): decidido el 17/10, produce y manda.
- Pasar `build101` al team de Vercel de BrandIA y repartir la clave nueva de la IA: hecho el 21/10.

---

**Último número usado: 39.**
