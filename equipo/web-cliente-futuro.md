# La web del cliente: de la maqueta de la demo a las webs completas · BORRADOR

Qué se muestra el domingo, qué queda para el primer cliente real y cómo se llega después a webs más completas y técnicas. El recorrido paso a paso está en `equipo/flujo-web-cliente.md`.

---

## Las tres etapas en una mirada

| Etapa | Qué es | Para quién | Cuándo |
|---|---|---|---|
| **1 · Maqueta de la demo** | Web de una sola página, armada por IA, publicada en `app.brandiamos.com/w/...` con link y QR | El jurado, con una marca inventada en el momento | Domingo 18/10 |
| **2 · Web del cliente real** | La misma web, con dominio propio comprado por BrandIA, cobro y la web que sigue viva | Los primeros clientes de BrandIA | Después de la hackathon |
| **3 · Webs completas** | Varias páginas, catálogo, turnos, blog y código propio del cliente | Clientes que necesitan más que una vidriera | Más adelante, según la demanda |

---

## Etapa 1 · La maqueta de la demo (lo que se presenta)

**Qué ve el jurado:** cuenta un negocio inventado → BrandIA arma su marca → "Armar mi web" → contesta 3 o 4 preguntas → ve su web con su marca, en celular y compu → pide un cambio en palabras → "Me gusta, quiero publicarla" → recibe un link y un QR, y la abre en su celular.

**Cómo está hecha:**
- La IA no escribe código: arma la web como datos (secciones y textos) y la app la dibuja con la identidad de la marca. Así no se rompe y siempre respeta la marca.
- Una sola app sirve todas las webs, cada una en `app.brandiamos.com/w/su-nombre`.
- Las webs se guardan en Supabase (rama `publicar-web`, de Eze).

**Lo que se muestra "en construcción":** elegir y comprar un dominio propio, el pago, la dirección `marca.brandiamos.com` y las visitas.

**Está lista cuando:** alguien del jurado arma una web con su marca inventada y la abre en su propio celular con el link o el QR, en menos de 10 minutos.

**Plan B para la demo:** una web ya publicada, armada con la app el sábado, para mostrar si falla internet o la IA. Se dice que es un ejemplo armado antes.

---

## Etapa 2 · La web del cliente real

Lo que falta para venderle una web a un cliente de verdad. Diseño en `equipo/flujo-web-cliente.md`, pasos 5 a 9.

| # | Qué | Cómo | Depende de |
|---|---|---|---|
| 1 | **Dominio propio** | Paso 6b: la API de Vercel busca, cobra el precio real y compra a nombre del cliente. Los `.uy`, con un registrador uruguayo | Mercado Pago, la clave de Vercel y la tarjeta de BrandIA |
| 2 | **Cobro** | Mercado Pago: primero se cobra y después se compra | La cuenta de Mercado Pago de BrandIA |
| 3 | **Que cada dominio muestre su web** | `proxy.ts` (el archivo de Next que mira cada pedido): si llega por el dominio del cliente, muestra su web | El dominio sumado al proyecto de Vercel |
| 4 | **Dirección gratis `marca.brandiamos.com`** | Comodín `*.brandiamos.com` en Vercel, o sumar cada subdominio por la API sin mover el DNS | Decidir cuándo tocar el DNS (este finde no) |
| 5 | **La web sigue viva** | Los cambios por chat se republican solos. Visitas y toques en WhatsApp, sin datos personales | — |
| 6 | **Renovación** | Aviso 30 días antes. BrandIA cobra antes de que Vercel renueve | El precio decidido |
| 7 | **Cuenta del cliente** | Que la web no viva en el navegador: inicio de sesión para volver a editarla | Supabase (login) |
| 8 | **Lo legal** | Términos, privacidad y que el dominio es del cliente (código de traspaso) | Un abogado |

---

## Etapa 3 · Webs completas, con desarrollo más técnico

Cuando una página no alcanza. Se ofrecen por partes, según lo que pida el rubro, y la IA recomienda cuáles suma.

**Qué se puede sumar:**
- **Varias páginas:** inicio, servicios, nosotros, contacto y una página por producto.
- **Catálogo o tienda:** productos con fotos, precio y stock; carrito y cobro con Mercado Pago.
- **Turnos y reservas:** calendario con horarios libres y aviso por WhatsApp o mail.
- **Blog o novedades:** que se llena solo con los contenidos que BrandIA ya genera para las redes.
- **Formularios** que llegan al mail o a una planilla del cliente.
- **Google bien hecho:** mapa del sitio, ficha del negocio con su dirección y horario en el formato que lee Google, y alta en Google Maps.
- **Varios idiomas,** para turismo o para vender afuera.
- **Accesible y rápida,** medida en cada cambio.

**Dos caminos técnicos (a decidir con la demanda):**

| Camino | Cómo funciona | A favor | En contra |
|---|---|---|---|
| **A · Bloques** (sigue lo de hoy) | La IA elige y llena bloques ya construidos (catálogo, turnos, blog). Una sola app sirve a todos los clientes | Seguro, barato de mantener y siempre con la marca | Hace solo lo que los bloques permiten |
| **B · Código propio** | Una IA que programa (Claude Code o la API de v0) arma un proyecto de Next.js para cada cliente, en su propio repo, y lo publica en Vercel | Puede hacer cualquier cosa, y el cliente se puede llevar el código | Más caro, más lento y cada web hay que mantenerla aparte |

**Recomendación:** empezar por **A** y sumar bloques a medida que los pidan los clientes. Usar **B** solo para clientes que pagan un plan "a medida", revisado por una persona antes de publicar.

**Para tener en cuenta en el camino B:**
- Un repo y un proyecto de Vercel por cliente, creados por la API.
- La marca entra como `tokens.css` y el brandbook, igual que hoy.
- Siempre se prueba antes de publicar: que compile, que se vea bien en celular y que no haya datos inventados.
- El cliente puede pedir el código y llevárselo.

---

## Decisiones pendientes

1. **Precios** de las tres etapas, y si la web entra en la suscripción de BrandIA.
2. **Registrador para `.uy`.**
3. **Cuándo se mueve el DNS de `brandiamos.com`** para las direcciones gratis.
4. **Qué bloques van primero** en la etapa 3: preguntarles a los primeros clientes.
5. **Camino B:** si se ofrece, con qué herramienta y quién revisa cada web antes de publicarla.
