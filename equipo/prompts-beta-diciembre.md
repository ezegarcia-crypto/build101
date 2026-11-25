# Prompts para la beta del 20/12

Un prompt por persona, para pegar en una **conversación nueva** de la app de Claude, abierta en
`~/Proyectos/build101`. Se basan en `equipo/plan-beta-20-diciembre.md`: si el plan cambia, manda el plan.

**Quién toca qué, para que dos agentes nunca pisen los mismos archivos:**

| Quién | Rama | Archivos suyos |
|---|---|---|
| **Eze** | `cobros` | Todo lo que conecta: `apps/web/src/app/api/pagos/`, `apps/web/src/app/api/suscripcion/`, `apps/web/src/app/ingresar/acciones.ts`, `apps/web/src/lib/pagos/`, `apps/web/src/lib/facturas/`, las tablas nuevas en `apps/web/supabase/` |
| **Juan Pedro** | `pantallas-cobro` | Lo que se ve: las pantallas de pago, de la cuenta y de la suscripción, `apps/web/src/app/crear/planes/`, los textos legales |
| **Rodrigo** | `admin-2fa`, después `panel-cobros` y `pedidos-cobro` | `apps/web/src/app/admin/`, `apps/web/src/app/pedidos/`, `apps/web/src/lib/admin/` |

Juan Pedro arma las pantallas con funciones de mentira que devuelven datos de ejemplo. Eze las reemplaza
por las de verdad. Así cada uno avanza sin esperar al otro.

---

## Prompt para Eze

```text
Leé CLAUDE.md, equipo/plan-beta-20-diciembre.md y apps/web/src/lib/ia/README.md. Hacé git pull y creá la rama `cobros` desde main.

Objetivo: que BrandIA cobre de verdad el domingo 20/12. Me tocan los ítems C1 (la conexión), C2, C3 (la conexión), C4, C5, C9, C9b y C10 del plan, más los merges a main.

En este orden, de a un paso, y avisame antes de cada uno qué vas a hacer:
1. Cuentas (C1): conectar /ingresar con Supabase Auth, con un código por mail y sin contraseña. Solo cambiás las dos funciones de apps/web/src/app/ingresar/acciones.ts. La pantalla no la tocás: es de Juan Pedro.
2. Marca guardada (C2): pasar la marca de la pestaña a Supabase, atada a la cuenta, sin romper el recorrido de hoy para quien todavía no entró.
3. Pago único de la marca (C3 y C4): Checkout Pro de Mercado Pago en modo prueba y un webhook (el aviso que Mercado Pago le manda a la app) que verifica el pago, lo guarda en una tabla `pagos` y recién ahí desbloquea. Nunca se desbloquea solo porque la persona volvió de la pantalla de pago.
4. Suscripción mensual (C9 y C9b): alta con las suscripciones de Mercado Pago, un contador de lo usado en el mes, la baja, unos días de gracia si el cobro falla y una prueba de la renovación con un cobro cada poco tiempo. Es obligatoria para el 20/12.
5. Factura automática (C5): en cada pago y en cada cobro mensual, pedir el e-ticket al proveedor de facturación electrónica y mandarlo por mail. Si falla, queda marcado para reintentar.
6. Topes (C10): a quien pagó no se le corta la IA por el tope diario de USD 30 ni por la prueba gratis.

Reglas:
- Las claves de Mercado Pago, del proveedor de facturas y del mail van en .env.local y en las variables de Vercel, nunca en el código. Las cuentas, las autorizaciones y las claves las saco yo: vos me guiás.
- Toda ruta nueva se anota en equipo/paginas.md. Si usa IA, también con medir() y etiquetar().
- Dejá funciones claras que las pantallas de Juan Pedro puedan llamar (por ejemplo empezarPago, estadoSuscripcion, darDeBaja) y anotalas en el README de apps/web/src/lib/pagos/.
- No toques apps/web/src/app/admin/ ni /pedidos: son de Rodrigo.
- Antes de dar algo por listo: lint, build, el recorrido entero con tarjetas de prueba en la compu y en tamaño celular, y una captura.

Está terminado cuando, en modo prueba, una persona entra con su mail, arma la marca, paga la marca, se suscribe, cierra el navegador, vuelve otro día, encuentra todo y tiene las dos facturas en el mail. Fechas que no se mueven: jueves 3/12 todo en modo prueba; jueves 10/12 el primer pago y la primera suscripción reales, con factura.
```

---

## Prompt para Juan Pedro

```text
Leé CLAUDE.md, equipo/plan-beta-20-diciembre.md, equipo/design-system.md y apps/web/AGENTS.md. Hacé git pull y creá la rama `pantallas-cobro` desde main.

Objetivo: que pagar en BrandIA se vea tan bien como el resto de la app para el domingo 20/12. Me tocan las pantallas de C1, C2, C3 y C9, los textos legales (A6) y la salida al mercado (E).

En este orden, de a un paso, y avisame antes de cada uno qué vas a hacer:
1. Lo gratis y lo pago (B2): donde hoy aparece "Ya usaste tu prueba gratis", la pantalla "Desbloqueá tu marca", con lo que incluye, el precio y el botón para pagar. Lo gratis se ve en baja resolución o con marca de agua.
2. Volver del pago: una pantalla para el pago aprobado, otra para el pendiente y otra para el rechazado, cada una con qué hacer ahora.
3. Mi cuenta: mis marcas, mi suscripción (qué incluye el mes, cuánto usé y cuánto me queda, la próxima fecha de cobro, el botón de baja bien a la vista) y mis facturas.
4. /crear/planes: que los botones pasen de "Quiero este plan" a pagar y suscribirse de verdad, con los precios que cerremos los tres.
5. Textos legales (A6): borradores de términos y condiciones, privacidad, reembolsos y de quién es la marca generada, en páginas simples con link en el pie. Los revisa el contador antes de publicarlos.
6. Lanzamiento (E2): el mail a la lista de espera y los posteos del 20/12, hechos con la propia BrandIA.

Reglas:
- Hasta que Eze conecte el cobro, las pantallas llaman a funciones de mentira que devuelven datos de ejemplo, en un solo archivo fácil de reemplazar. Avisale a Eze qué nombres usaste. Nada de datos de ejemplo cuando se publique.
- No toques la lógica de pagos, el webhook, apps/web/src/app/ingresar/acciones.ts ni nada de apps/web/src/lib/pagos/: es de Eze. Tampoco /admin ni /pedidos: son de Rodrigo.
- Toda página nueva o cambiada se anota en equipo/paginas.md.
- Antes de dar algo por listo: lint, build, navegador en compu y en tamaño celular, y una captura.

Está terminado cuando alguien que nunca vio BrandIA entiende, sin preguntar, qué es gratis, qué paga, cuánto, qué incluye la suscripción y cómo darse de baja, y todo se ve como parte de la misma web. Las pantallas tienen que estar listas el jueves 3/12, para que Eze las conecte antes del primer pago real del jueves 10/12.
```

---

## Prompt para Rodrigo

```text
Leé CLAUDE.md, equipo/plan-beta-20-diciembre.md, equipo/prompts-beta-diciembre.md y equipo/design-system.md. Hacé git pull.

Objetivo: que el equipo vea y controle cada peso que entra, que BranderIA cobre y que el cobro esté probado antes de que paguen personas reales. Me tocan C6, C7, D1, D4 y E1 del plan, y llevar el seguimiento del cronograma.

En este orden, de a un paso, y avisame antes de cada uno qué vas a hacer:
1. Terminar la rama `admin-2fa` (el ingreso a /admin con doble factor): revisarla, probarla y dejarla lista para que Eze la junte con main.
2. Desde main, crear la rama `panel-cobros`. Hacer el panel de cobros en /admin (C6): pagos, suscripciones activas y dadas de baja, cobros fallidos, facturas emitidas y pendientes, reintentos y costo de IA por cliente (lo que ya mide /costos). Hasta que Eze tenga la tabla `pagos`, uso datos de ejemplo en un solo archivo y le pregunto qué campos va a tener la tabla, para no inventarlos.
3. Devoluciones (D4): desde el panel, ver un pago y pedir la devolución. Proponer la regla de reembolso a los socios antes de construirla.
4. BranderIA con cobro (C7), en la rama `pedidos-cobro`: en /pedidos cargar el precio cotizado y generar el link de pago con la función que deje Eze en apps/web/src/lib/pagos/ (no la escribo yo). Al pagarse, el pedido pasa solo a "en producción". Es lo primero que se recorta si no da el tiempo.
5. Pruebas del cobro (D1): una lista de casos, recorrida en la compu y en el celular con tarjetas de prueba: pago aprobado, pendiente, rechazado, pago repetido, suscripción, baja, cobro mensual fallido, devolución y factura que no sale. Dejar el resultado en equipo/pruebas-cobro.md, con captura de cada caso.
6. Beta cerrada (E1, del 14 al 18/12): la lista de 10 a 20 personas, el mensaje para invitarlas y una tabla con lo que hizo y pagó cada una y lo que falló.

Reglas:
- No toco la lógica de pagos, el webhook, apps/web/src/lib/pagos/ ni apps/web/src/app/ingresar/acciones.ts: son de Eze. Tampoco las pantallas de pago, de la cuenta ni /crear/planes: son de Juan Pedro.
- Las claves van en .env.local y en Vercel, nunca en el código. Contraseñas y autorizaciones las hago yo.
- Toda página nueva o cambiada se anota en equipo/paginas.md.
- Antes de dar algo por listo: lint, build, navegador en compu y en tamaño celular, y una captura.

Está terminado cuando, el viernes 18/12, el panel muestra cada pago y cada suscripción de la beta cerrada con su factura, todos los casos de equipo/pruebas-cobro.md pasaron y BranderIA cobró al menos un pedido real (o quedó decidido recortarlo).
```

---

## Seguimiento diario (lo corre Rodrigo, cada mañana)

Para pegar en una conversación nueva. No cambia código: solo mira y avisa.

```text
Leé equipo/plan-beta-20-diciembre.md y la tabla "Quién toca qué" de equipo/prompts-beta-diciembre.md. Hacé git fetch y no cambies ningún archivo ni de rama.

Armame el parte del día:
1. Por cada rama del plan (cobros, pantallas-cobro, admin-2fa, panel-cobros, pedidos-cobro): los commits de las últimas 24 horas en una línea cada uno, y si ya entró a main.
2. Contra el cronograma de hoy: qué ítems están en tiempo, cuáles atrasados y cuáles en riesgo para el próximo hito (jueves 3/12 cobro de prueba, jueves 10/12 primer cobro real, viernes 18/12 congelado).
3. Choques: si dos ramas cambiaron los mismos archivos, o si alguien tocó archivos que la tabla le da a otro.
4. Lo que falta de afuera del código (contador, quién factura, Mercado Pago, proveedor de facturas, precios): qué sigue pendiente según el plan.
5. Un mensaje corto, listo para mandar por WhatsApp a Eze y Juan Pedro, con lo atrasado y lo que necesita cada uno del otro.

Escribilo simple y sin jerga. No mandes nada: el mensaje lo mando yo.
```
