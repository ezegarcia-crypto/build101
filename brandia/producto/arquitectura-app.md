---
documento: Arquitectura de la app BrandIA + plan de 10 días al piloto interno
version: 0.2 · propuesta
fecha: 2026-09-23
autor: Ezequiel García (con Claude)
estado: propuesta para revisar con Juan Pedro y Rodrigo
modelo: /06-knowledge/estrategia/modelo-de-negocio.md (cuatro capas, foco 1 y 4)
web: ../outputs/drafts/web/ (ver README ahí)
---

# App BrandIA · arquitectura v0.2

> **v0.2 (23/9, tarde):** cuentas de Ezequiel, proveedor de pagos investigado, presupuesto estimado
> y catálogo inicial de 12 productos. Cambios en § 3, 5, 7 y 8; § 9, 10 y 11 nuevos.

Propuesta para arrancar la construcción. Todo lo que dependa de una decisión de los socios está
marcado **a decidir** y no se completa con supuestos.

## 1. Qué tiene que existir en 10 días

Una app funcionando en `brandiamos.com` donde **nosotros tres podamos armar marcas reales de
punta a punta** y pedir un producto con esa marca. No es el lanzamiento: es el piloto interno.

| Entra en los 10 días | Queda para después |
|---|---|
| Web pública + lista de espera guardada en la base | Suscripción cobrando de verdad |
| Registro e ingreso | Plus con cola de curadores y métricas por curador |
| Flujo Armar completo: brief → caminos de logo → ajustes → sistema de marca | Publicar en redes (verbo v2) |
| Descarga del sistema de marca (SVG, PNG, PDF del manual) | Integración con proveedores por API |
| Catálogo de 12 productos con la marca aplicada y pedido registrado | Pagos en producción |
| Pagos en modo prueba (sandbox) | Panel de métricas para socios |
| Registro de costo por marca generada (tokens, imágenes) | Multi-idioma |

## 2. Principios (aprendidos del CRM de Gary y de la web de Brixia)

1. **Producto primero, infraestructura mínima.** El CRM de Gary pasó semanas en la base antes de
   tener pantallas. Acá la base se arma en un día y el resto del tiempo va al flujo.
2. **Seguridad desde la primera tabla.** Toda tabla nace con RLS (row level security) y su prueba
   de acceso permitido / denegado. Regla heredada del CRM, que funcionó.
3. **El código no vive en Drive.** Repo en GitHub, clonado fuera de la carpeta sincronizada
   (Drive rompe `node_modules` y expone secretos). En Drive quedan los documentos.
4. **Secretos solo en variables de entorno** (Vercel y Supabase). Nunca en el repo ni en Drive.
5. **Retirada visual como regla de producto.** El chrome de la app lleva la marca BrandIA; el
   lienzo, las exportaciones y los productos del cliente, no.
6. **Todo cambio deja registro** (`/CHANGELOG.md`), como ya está acordado.

## 3. Stack propuesto

| Capa | Elección | Por qué |
|---|---|---|
| App y web | **Next.js (App Router) + TypeScript** | Es la misma base del CRM de Gary: ya sabemos operarla. La web v1 se porta como la home. |
| Animación web | GSAP + ScrollTrigger + Lenis + Three.js | Lo que usa la web actual. Solo en la parte pública. |
| Base, auth y archivos | **Supabase** (Postgres, Auth, Storage, RLS, Edge Functions) | Una sola pieza para usuarios, datos y archivos del cliente. |
| Hosting | **Vercel** + dominio `brandiamos.com` (DNS desde GoDaddy) | Deploy por rama, previews para revisar entre los tres. |
| Mails | Resend | Confirmaciones, lista de espera, avisos de pedido. |
| IA de texto | Claude (API de Anthropic) | Entrevista, estrategia, voz, prompts maestros, SVG de logos. |
| IA de imagen | fal.ai (FLUX) o Ideogram para piezas de redes; Recraft como opción vectorial para logos | El logo no depende de un generador de imágenes (ver § 5). |
| Pagos | **Mercado Pago Uruguay** (piloto) · **dLocal Go** (LATAM, después) | Ver § 9. En los 10 días, solo sandbox. |

## 4. Cómo se usa la app (flujo)

```
Web pública ──► Registro ──► Proyecto nuevo
                                  │
   ARMAR (capa 1, pago único)     ▼
   1 Contanos ─► 2 Caminos de logo ─► 3 Ajustá ─► 4 Sistema de marca ──► Pago ──► Descargas
                                                           │
   PRODUCIR (capa 2, suscripción)                          ├──► Lote mensual de piezas
   PLUS (capa 3, opcional)                                 │      └─► Revisión humana (si Plus)
   PRODUCTOS (capa 4, por pedido)                          └──► Catálogo con la marca aplicada ──► Pedido
```

Pantallas del piloto: Home · Registro/Ingreso · Mis marcas · Brief (chat) · Caminos · Ajustes ·
Sistema de marca · Productos · Carrito/pedido · Mi cuenta. Panel interno (solo equipo): pedidos,
lista de espera, costos por marca.

## 5. Los agentes y el «prompt maestro»

La idea: el brief del cliente se convierte en **un documento estructurado —el prompt maestro—**
que alimenta a todos los agentes. Cambia el brief, se regenera todo en cadena.

| # | Agente | Entra | Sale |
|---|---|---|---|
| 1 | **Entrevistador** | Chat con el cliente, referencias, fotos | `brief` (qué hace, para quién, 3 palabras, gustos, rechazos, referencias) |
| 2 | **Estratega** | `brief` | **Prompt maestro**: esencia, promesa, personalidad, voz, léxico sí/no, dirección visual |
| 3 | **Diseñador de logo** | Prompt maestro | 6–20 caminos de logo **en SVG**, cada uno con su razón en una línea |
| 4 | **Sistema** | Camino elegido + prompt maestro | Paleta (con contrastes verificados) + par tipográfico (de un catálogo curado de Google Fonts) |
| 5 | **Aplicador** | Sistema de marca | Manual PDF, plantillas, versiones del logo, mockups de productos |
| 6 | **Productor** (capa 2) | Sistema + calendario | Lote mensual de piezas para redes |
| 7 | **Revisor automático** | Todo lo anterior | Chequeos: contraste AA, legibilidad a 16 px, que el logo no copie marcas conocidas, ortografía |

**La decisión técnica más importante: el logo sale en vector.** Los generadores de imagen dan
píxeles, y una marca necesita SVG para imprimir y bordar. Propuesta para v1: el agente 3 dibuja
SVG directamente siguiendo una gramática de formas (monograma, signo, sello, logotipo), con la
tipografía pasada a curvas. Es controlable, liviano y producible. Los generadores de imagen
quedan para piezas de redes.

**Opción a probar en el día 5:** Recraft tiene una API que devuelve SVG nativo (desde USD 0,055 por
imagen). Se prueba contra el SVG dibujado por Claude con los mismos briefs y se queda el que dé mejores
logos. **Los mockups de productos no usan IA:** cada producto es una plantilla con su «zona de logo» y el
logo del cliente se coloca encima (como en la web). Es gratis, instantáneo y exacto para producción.

Los prompts de cada agente se guardan versionados en el repo (`/agents/<nombre>/prompt.md`) y
cada ejecución queda registrada con su costo, para saber cuánto cuesta cada marca.

## 6. Modelo de datos (Supabase)

Todo cuelga de una **cuenta** (`account`): un emprendedor, una PyME o una agencia con varias
marcas. RLS por pertenencia a la cuenta.

| Tabla | Qué guarda | Quién la ve |
|---|---|---|
| `profiles` | Datos de la persona (1:1 con `auth.users`) | La propia persona |
| `accounts` · `account_members` | Cuenta y sus miembros con rol (`owner`, `member`) | Miembros |
| `brands` | Cada marca: nombre, rubro, estado (`brief`, `caminos`, `ajustes`, `lista`, `pagada`) | Miembros |
| `brand_briefs` | Respuestas del brief + referencias | Miembros |
| `master_prompts` | El prompt maestro versionado (JSON) | Miembros (lectura) |
| `logo_options` | Cada camino: SVG, razón, elegido sí/no | Miembros |
| `brand_versions` | Foto del sistema de marca (logo, paleta, tipos, voz) — cada ajuste es versión nueva | Miembros |
| `assets` | Archivos en Storage (exportaciones, fotos, mockups) | Miembros |
| `agent_runs` | Cada ejecución: agente, modelo, tokens, costo, duración, error | Solo equipo |
| `payments` | Pago único de identidad y sus estados | Miembros + equipo |
| `subscriptions` | Suscripción y Plus (on/off) | Miembros + equipo |
| `content_batches` · `content_items` | Lotes mensuales de piezas | Miembros |
| `plus_reviews` | Revisión humana de identidad o lote: curador, estado, notas | Miembros + curador |
| `products` · `product_variants` | Catálogo: producto, variantes, precio, zona de logo, requisitos de archivo | Público (lectura) |
| `suppliers` | Proveedores y condiciones | Solo equipo |
| `orders` · `order_items` | Pedidos del marketplace y su estado (`pedido`, `pagado`, `en producción`, `enviado`, `entregado`) | Miembros + equipo |
| `waitlist` | Lista de espera de la web | Solo equipo (inserción pública) |

Roles de equipo en una tabla aparte (`staff`: `admin`, `curator`, `ops`), para que un curador
de Plus vea solo las marcas asignadas.

## 7. Marketplace en el piloto

Simple a propósito: catálogo cargado a mano en Supabase, cada producto con su «zona de logo» para
el mockup automático, precio final fijo, y el pedido llega por mail al equipo. Los proveedores se
gestionan fuera del sistema al principio.

**Catálogo inicial (definido por Ezequiel, 23/9) · 12 productos:**

| Impresos | Merch | Mesa y escritorio |
|---|---|---|
| Tarjetas | Gorros | Vasos térmicos (con tapa y sorbito) |
| Folletos | Remeras | Termos para mate |
| Carpetas | Tote bags | Mates |
| | Lapiceras | Tazas de café |
| | | Soportes de celular para videollamadas |

En la web los vasos se describen como «vaso térmico con tapa y sorbito», sin nombrar la marca que los
puso de moda. Falta por producto: proveedor, costo, precio final, mínimo de unidades, tiempo de entrega
y requisitos de archivo (en `04-marketplace/catalogo/`). Sigue a definir cómo gana BrandIA, y quién
resuelve la logística y la calidad.

## 8. Plan de 10 días

| Día | Fecha | Entrega | Cómo sabemos que está |
|---|---|---|---|
| 1 | jue 24/9 | Repo, proyecto Supabase, deploy en Vercel, `brandiamos.com` apuntando | La home carga en el dominio |
| 2 | vie 25/9 | Esquema de datos con RLS y pruebas de acceso · registro e ingreso | Un usuario no ve la marca de otro |
| 3 | sáb 26/9 | Web v1 portada a Next · lista de espera guardando en la base | Una inscripción aparece en `waitlist` |
| 4 | dom 27/9 | Brief (agente 1) y prompt maestro (agente 2) | Un brief real genera su prompt maestro |
| 5 | lun 28/9 | Caminos de logo en SVG (agente 3) | 6 caminos con razón, en menos de 2 min |
| 6 | mar 29/9 | Ajustes: paleta, tipografía, tono · versiones | Cambiar la paleta actualiza todo |
| 7 | mié 30/9 | Sistema de marca y exportación (SVG, PNG, manual PDF) | Descargamos un zip usable |
| 8 | jue 1/10 | Catálogo de 12 productos con mockup automático + pedido | Un pedido llega por mail al equipo |
| 9 | vie 2/10 | Pagos en sandbox de Mercado Pago · registro de costos por marca | Un pago de prueba desbloquea descargas |
| 10 | sáb 3/10 | **Piloto interno**: los tres armamos marcas reales, lista de arreglos | 3 marcas completas + costo promedio por marca |

## 9. Pagos · qué sirve en Uruguay (investigado el 23/9)

| Proveedor | Pago único | Suscripción | Productos físicos | Para BrandIA |
|---|---|---|---|---|
| **Mercado Pago Uruguay** | Sí | Sí (suscripciones / preapproval, documentado para Uruguay) | Sí | **Recomendado para el piloto**: el más usado en Uruguay, API y SDK para Node, webhooks y sandbox, liquida en banco local |
| **dLocal Go** | Sí | Sí (pagos recurrentes) | Sí | **Para LATAM después**: un solo contrato para varios países |
| Handy / Plexo | Sí | Sí | Sí | Uruguayos, buena alternativa; integración menos directa, requieren contacto comercial |
| Stripe | — | — | — | **No abre cuentas en Uruguay.** Solo con una empresa en EE. UU. (Stripe Atlas) |
| Paddle / Lemon Squeezy | Sí | Sí | **No** | Prohíben productos físicos: no sirven para el marketplace |
| PayPal | Sí | Sí | Sí | Solo como método extra para tarjetas del exterior |

**Pendiente:** no se pudo confirmar el porcentaje exacto de comisión de Mercado Pago Uruguay ni de
dLocal Go para tarjeta uruguaya. Pedirlo a los dos antes de fijar precios al público.

Fuentes: [MP UY · suscripciones](https://www.mercadopago.com.uy/developers/es/docs/subscriptions/integration-configuration/subscription-associated-plan) ·
[dLocal Go · recurrentes](https://dlocalgo.com/es/pagos-recurrentes) · [Stripe · países](https://stripe.com/global) ·
[Paddle · qué no se vende](https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle) ·
[Lemon Squeezy · prohibidos](https://docs.lemonsqueezy.com/help/getting-started/prohibited-products) ·
[Handy](https://handy.uy/productos/pasarela-de-pago/) · [Plexo](https://www.plexo.com.uy/productos/suscripciones)

## 10. Presupuesto estimado

Precios publicados consultados el 23/9 (USD). Son estimaciones para decidir, no cotizaciones.

**Fijo mensual**

| Servicio | Plan | USD/mes | Nota |
|---|---|---|---|
| Supabase | Pro | 25 | Los 10 días pueden hacerse en el plan gratis; Pro antes de tener usuarios reales (backups diarios) |
| Vercel | Pro | 20 | El plan gratis no permite uso comercial |
| Resend | Gratis | 0 | 3.000 mails/mes; Pro (20) cuando se pase |
| Google Workspace | Starter (opcional) | 7 por casilla | Para `hola@brandiamos.com` |
| **Total fijo** | | **≈ 45–65** | |

**Variable: cuánto cuesta cada marca**

| Paso | Cómo | USD por marca |
|---|---|---|
| Entrevista + prompt maestro | Claude Sonnet | ≈ 0,10–0,15 |
| 12 caminos de logo | SVG por Claude (≈ 0,35) o Recraft vector (≈ 0,65) | ≈ 0,35–0,65 |
| Sistema, voz y manual | Claude Sonnet | ≈ 0,15 |
| Mockups de 12 productos | Plantillas, sin IA | 0 |
| Margen por regeneraciones (× 2) | | |
| **Total** | | **≈ 1–2 por marca** |

Suscripción: un lote de 20 piezas por mes cuesta ≈ USD 1–2 por cliente (texto + imágenes a
USD 0,03–0,06 cada una).

**Primer mes (construcción + piloto interno): USD 150–200 en total.** ≈ 45 fijos + 100–150 de IA,
porque durante el desarrollo se generan muchas más pruebas que marcas reales. Propuesta: poner un
tope de gasto de USD 200 en la consola de Anthropic y cargar créditos prepagos chicos (USD 25) en
los servicios de imagen.

Fuentes: [Claude · precios](https://platform.claude.com/docs/en/about-claude/pricing) ·
[Recraft API](https://www.recraft.ai/pricing?tab=api) · [fal.ai FLUX](https://fal.ai/models/fal-ai/flux-2-pro) ·
[Supabase](https://supabase.com/pricing) · [Vercel](https://vercel.com/pricing) · [Resend](https://resend.com/pricing)

## 11. Decisiones antes del día 1

1. ~~Cuentas y dueños~~ → **Se usan las cuentas de Ezequiel** (GitHub, Supabase, Vercel y demás).
   Hay que sumar a Juan Pedro y Rodrigo como miembros, y conseguir acceso al DNS de GoDaddy.
2. ~~Presupuesto~~ → **Estimado en § 10: USD 150–200 el primer mes.** Falta el OK de los socios.
3. ~~Proveedor de pagos~~ → **Mercado Pago Uruguay** para el piloto (§ 9). Falta la cotización de comisiones.
4. ~~Catálogo~~ → **12 productos** (§ 7). Faltan proveedores y precios.
5. **Abierto:** qué ve el cliente antes de pagar, todo el sistema de marca o una vista previa. Define
   dónde va el cobro en el flujo.
