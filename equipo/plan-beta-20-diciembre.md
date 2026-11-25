# Plan · Beta operativa y cobrando, el domingo 20 de diciembre

Borrador armado el miércoles 25/11/2026 para discutir entre los tres socios. Lo marcado **a decidir** o
**confirmar con el contador** todavía no está cerrado.

## La meta en una frase

El 20/12, cualquier persona entra a **app.brandiamos.com**, arma su marca gratis hasta un tope, **paga con su
tarjeta**, recibe su marca completa guardada en su cuenta y **le llega la factura electrónica por mail**, sin
que nadie del equipo toque nada.

**Está terminado cuando:**

1. Una persona de afuera del equipo hace el recorrido completo en el celular y paga con una tarjeta real.
2. El pago queda registrado, la marca se desbloquea sola y la factura (e-ticket) sale sola.
3. Puede cerrar el navegador, volver otro día con su mail y encontrar su marca.
4. El equipo ve en un panel quién pagó, cuánto, la factura emitida y lo que costó la IA de esa marca.
5. Se probó con **al menos 10 pagos reales** de personas de confianza antes de abrir.

## Por qué la plata va primero

Hoy la app genera marcas con IA real, pero **no cobra**: `/crear/planes` solo anota interesados y BranderIA solo
manda el pedido por WhatsApp. Para facturar hace falta una cadena que cruza lo legal, lo administrativo y el
código, y **lo lento es lo legal y lo administrativo, no el código**. Por eso esos trámites arrancan esta misma
semana, en paralelo con todo lo demás.

## Orden de prioridad

| # | Qué se cobra | Cómo | Para el 20/12 |
|---|---|---|---|
| 1 | **Tu marca** (pago único) | Mercado Pago Checkout Pro → aviso automático del pago a la app (webhook) → marca desbloqueada → factura automática | **Sí, obligatorio** |
| 2 | **Tu marca andando** (suscripción mensual de contenidos) | Suscripciones de Mercado Pago (cobro automático cada mes) → contenidos del mes habilitados → factura automática en cada cobro | **Sí, obligatorio** |
| 3 | **BranderIA** (productos con tu marca) | El equipo cotiza desde `/pedidos` y manda un link de pago de Mercado Pago; al pagar, se factura y pasa a "en producción" | **Sí**, con 1 o 2 proveedores y pocos productos. Es lo primero que se recorta si no da el tiempo |
| 4 | Pauta en Meta, Plus con humano, web con dominio | — | No. Siguen "en construcción" |

## Los ítems, por frente

### A · Empresa y facturación (lo más lento: arranca ya)

| # | Ítem | Notas |
|---|---|---|
| A1 | **Definir quién factura** | Si la empresa todavía no está constituida: constituirla (por ejemplo una SAS) y sacar el RUT. **Plan B** si no llega al 10/12: facturar desde una empresa o unipersonal que ya tenga uno de los socios, y pasar a la empresa en enero. **Confirmar con el contador** |
| A2 | **Contador** | Que defina: tipo de empresa, régimen de IVA, si los precios van con IVA incluido y en qué moneda se cobra (pesos o dólares) |
| A3 | **Facturación electrónica (CFE de la DGI)** | Contratar un proveedor habilitado que se conecte por API (cotizar 2 o 3). Para cada pago la app le pide el e-ticket y se lo manda al cliente por mail. La habilitación puede tardar: pedirla esta semana |
| A4 | **Cuenta de Mercado Pago de la empresa** | Cuenta de vendedor a nombre de quien factura (A1). **Pedir por escrito la comisión vigente** (el documento de costos usa 4,87 %, sin confirmar) y cuándo se acredita la plata |
| A5 | **Cuenta bancaria** | A nombre de quien factura, para retirar lo cobrado |
| A6 | **Textos legales** | Términos y condiciones, política de privacidad (ley 18.331 de datos personales), política de reembolso y de quién es la marca generada. Mercado Pago los pide en la web |

### B · Precios y oferta

| # | Ítem | Notas |
|---|---|---|
| B1 | **Cerrar precios** | Hoy `apps/web/src/lib/planes.ts` dice USD 19,99 la marca y USD 29/mes la suscripción. El documento de costos proponía USD 39–79 la marca. **A decidir los tres**, mirando la lista de espera y el costo real de `/costos` |
| B2 | **Qué es gratis y qué es pago** | Propuesta: gratis la entrevista, el nombre, la paleta y logos en baja resolución con marca de agua; pago el logo en alta, los archivos, el brandbook descargable y el feed. Hoy existe la prueba gratis por navegador (`prueba-gratis.ts`): pasa a ser el tope de la vista previa |
| B3 | **Precio de lanzamiento** | Por ejemplo, un descuento para los primeros 100 o para los anotados en la lista de espera. A decidir |
| B4 | **BranderIA: cómo se gana** | Margen sobre el costo del proveedor. Cerrar catálogo corto (4 a 6 productos) con 1 o 2 proveedores y su precio y plazo |

### C · Producto y código (lo que hay que construir)

| # | Ítem | Notas |
|---|---|---|
| C1 | **Cuentas de usuario** | Conectar `/ingresar` (código por mail, sin contraseña) con Supabase Auth. Hoy está solo la pantalla |
| C2 | **Guardar la marca en la cuenta** | Hoy todo vive en la pestaña del navegador. Tiene que quedar en Supabase, atada a la cuenta, para volver otro día |
| C3 | **Pantalla de pago** | Botón "Desbloquear mi marca" → Checkout Pro de Mercado Pago → vuelta a la app con la marca desbloqueada |
| C4 | **Aviso automático del pago (webhook)** | Mercado Pago le avisa a la app; la app lo verifica, guarda el pago (tabla `pagos`) y desbloquea. **Nunca se desbloquea solo por volver de la pantalla de pago**: siempre con el aviso verificado |
| C5 | **Factura automática** | Al confirmarse el pago, la app pide el e-ticket al proveedor de A3 y lo manda por mail. Si falla, queda marcado para reintentar y el equipo lo ve |
| C6 | **Panel de cobros del equipo** | En `/admin` (la rama `admin-2fa` ya trae el ingreso con doble factor): pagos, facturas, reintentos, devoluciones y costo de IA por cliente |
| C7 | **BranderIA cobrable** | En `/pedidos`: cargar el precio cotizado y generar el link de pago; al pagarse, factura y cambio de estado solo |
| C8 | **Mails** | Código de ingreso, pago recibido, factura y estado del pedido de BranderIA. Remitente `@brandiamos.com` |
| C9 | **Suscripción** (obligatoria) | Alta con Mercado Pago (cobro automático cada mes), qué incluye el mes (cuántos posteos, historias y reels: lo que define B1), contador de lo usado en el mes, baja desde la cuenta en un clic, qué pasa si el cobro falla (aviso y unos días de gracia antes de pausar) y factura automática en cada cobro mensual |
| C9b | **Renovación probada** | Mercado Pago no deja esperar un mes para ver el segundo cobro: probar la renovación en modo prueba con una frecuencia corta y, en la beta cerrada, revisar a mano que el aviso de cada cobro llegue y facture |
| C10 | **Límites de gasto para la beta paga** | Revisar el tope diario de USD 30 (`tope-diario.ts`): a quien pagó no se le puede cortar. Topes por cliente pago en vez de por navegador |

### D · Confianza y operación

| # | Ítem | Notas |
|---|---|---|
| D1 | **Pruebas del cobro** | Todo el recorrido en el modo de prueba de Mercado Pago (tarjetas de prueba), en compu y en celular, incluidos pago rechazado, pago pendiente y devolución |
| D2 | **Planes pagos de la infraestructura** | Supabase Pro (copias de seguridad) y revisar el plan de Vercel. ≈ USD 45–65 por mes según el documento de costos |
| D3 | **Soporte** | WhatsApp de BrandIA definitivo (hoy el provisorio en `WHATSAPP_BRANDIA`) y un mail de soporte. Quién contesta y en cuánto tiempo |
| D4 | **Devoluciones** | Regla clara (por ejemplo, devolución si la marca no se generó) y cómo se hace desde el panel |
| D5 | **Medición** | Cuántos entran, cuántos terminan la vista previa, cuántos pagan, cuánto cuesta la IA por venta. Lo de `/costos` más una tabla simple de conversión |

### E · Salida al mercado

| # | Ítem | Notas |
|---|---|---|
| E1 | **Beta cerrada** (14 al 18/12) | 10 a 20 personas de confianza y de la lista de espera pagan de verdad. Se les devuelve o se les regala BranderIA si hace falta |
| E2 | **Lanzamiento 20/12** | Mail a la lista de espera, posteos con la propia BrandIA y la portada con el botón "¿BrandIAmos?" apuntando al recorrido pago |
| E3 | **Pauta** | Pauta chica en Meta desde el 20/12 si la conversión de la beta cerrada da. Presupuesto a decidir |

## Cronograma

| Semana | Fechas | Objetivo de la semana | Ítems | Hito al cierre |
|---|---|---|---|---|
| **0** | mié 25/11 – dom 29/11 | **Arrancar todo lo lento** | A1, A2, A3 (pedir), A4 (pedir), B1, B2, B4 (contactar proveedores) | Contador elegido · quién factura definido · precios cerrados · trámites pedidos |
| **1** | lun 30/11 – dom 6/12 | **Cuentas y cobros en modo prueba** | C1, C2, C3, C4 en prueba, C9 alta en prueba, A6 (borradores), D2 | Una persona entra con su mail, arma la marca, "paga" la marca y se suscribe con tarjeta de prueba, y la encuentra al volver |
| **2** | lun 7/12 – dom 13/12 | **Cobros y facturas reales** | A4 y A3 activos, C5, C6, C9 completa (baja, cobro fallido, contador del mes), C9b, C8, D1, A6 publicados, C7 si da | **Jue 10/12: primer pago real de la marca y primera suscripción real, las dos con factura** (lo hace un socio). Si A1 no está, se activa el plan B |
| **3** | lun 14/12 – vie 18/12 | **Beta cerrada pagando** | E1, D3, D4, D5, C10, C7 | 10 pagos reales de la marca y al menos 5 suscripciones activas, sin intervención del equipo · **vie 18/12: se congela** (solo arreglos) |
| **Lanzamiento** | sáb 19/12 – dom 20/12 | **Ensayar y abrir** | Ensayo completo 3 veces, E2, E3 | **Dom 20/12: beta abierta y cobrando** |

**Fechas que no se mueven:** jue 3/12 (cobro de prueba de punta a punta), jue 10/12 (primer pago real
facturado, de la marca y de la suscripción), vie 18/12 (congelado). Si una se corre, se recorta alcance
(primero el cobro de BranderIA, que puede seguir como "pedí tu cotización"), no la fecha. La marca y la
suscripción no se recortan.

## Reparto propuesto (a confirmar)

| Quién | Qué |
|---|---|
| **Eze** | Cobro y webhook (C3, C4), factura automática (C5), suscripción (C9) y los merges a `main` |
| **Juan Pedro** | Pantallas de pago, cuenta e ingreso (diseño de C1, C2, C3), textos legales con el contador (A6) y salida al mercado (E) |
| **Rodrigo** | Panel de cobros en `/admin` (C6), BranderIA cobrable (C7), pruebas del cobro (D1) y beta cerrada (E1) |
| **Los tres** | Empresa, contador y cuentas (A1–A5), precios (B) y proveedores de BranderIA (B4). Las cuentas, contraseñas y autorizaciones las hace cada persona, no el agente |

## Riesgos y plan B

| Riesgo | Qué pasa si sale mal | Plan B |
|---|---|---|
| La empresa o el RUT no llegan | No se puede facturar a nombre de BrandIA | Facturar desde una empresa existente de un socio y pasar en enero (confirmar con el contador) |
| La habilitación de facturación electrónica tarda | Se cobra pero no sale la factura sola | Cobrar igual y emitir las facturas a mano desde el portal del proveedor durante la beta; la app marca las pendientes |
| Mercado Pago demora en aprobar la cuenta | No hay cobro real el 10/12 | Pedirla esta semana; mientras, todo en modo prueba |
| La IA cuesta más de lo calculado | Se pierde plata por venta | Mirar `/costos` cada día de la beta cerrada y ajustar los topes de la vista previa |
| BranderIA no tiene proveedores a tiempo | No se puede producir | Lanzar con "pedí tu cotización" como hoy y cobrar desde enero |
| La suscripción cobra pero la factura mensual o el aviso de renovación fallan | Clientes cobrados sin factura, o pausados por error | El panel marca cada cobro sin factura o sin aviso; durante la beta, revisión diaria y factura a mano si hace falta |
| El cliente no entiende qué incluye el mes | Bajas y reclamos | Mostrar en la cuenta lo usado y lo que queda del mes, y la baja a la vista |

## Pendientes para la reunión de esta semana

1. ¿La empresa está constituida? Si no, ¿quién factura en diciembre?
2. Precio de la marca y de la suscripción, y en qué moneda. Qué incluye cada mes de la suscripción (cuántos
   posteos, historias y reels) y si la marca va incluida al suscribirse.
3. Qué parte de la marca es gratis y qué parte es paga.
4. Quién es el contador y quién habla con Mercado Pago y con el proveedor de facturas.
5. Presupuesto para infraestructura y pauta de diciembre.
