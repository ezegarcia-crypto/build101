# Pruebas del cobro (D1)

La lista de casos que tienen que pasar **antes de que pague una persona real**. La lleva Rodrigo. Cada caso se
recorre **en la compu y en el celular**, con captura de cada uno. Plan completo en `equipo/plan-beta-20-diciembre.md`.

**Estado al 25/11/2026:** lista armada, nada recorrido todavía. Para empezar hace falta que el cobro de Eze funcione
en modo prueba (hito del **jueves 3/12**).

## Antes de empezar

1. El cobro está en modo prueba: en Vercel (Preview) están `MERCADOPAGO_ACCESS_TOKEN` del vendedor de prueba,
   `MERCADOPAGO_WEBHOOK_SECRET`, `MERCADOPAGO_PRUEBA=1` y `MERCADOPAGO_COMPRADOR_PRUEBA`. Lo configura Eze
   (ver `equipo/cobros.md` de su rama).
2. Se prueba en el **link de prueba de Vercel de la rama** donde esté el cobro, no en la compu: el aviso de
   Mercado Pago (webhook) no llega a `localhost`.
3. Se paga con el **comprador de prueba** de Mercado Pago y con las
   [tarjetas de prueba de Uruguay](https://www.mercadopago.com.uy/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards).
   **El nombre que se escribe como titular de la tarjeta elige el resultado:** `APRO` aprobado, `CONT` pendiente,
   `OTHE` rechazado, `FUND` rechazado por falta de saldo. Las contraseñas del comprador de prueba las maneja Eze.
4. Una cuenta de BrandIA nueva por caso (un mail distinto), para que un caso no ensucie al otro.
5. Cada caso se mira también en el panel **`/admin/cobros`** (pago, estado, factura) y en **Supabase** (tablas
   `suscripciones` y `cobros`).
6. Las capturas van en `equipo/capturas-cobro/`, con el número del caso: `01-compu.png`, `01-celular.png`.

## Los casos

Columnas: **Compu** y **Celular** se completan con ✅ (pasó), ❌ (falló, y qué pasó en "Notas") o — (sin probar).

### Tu marca (pago único)

| # | Caso | Cómo | Qué tiene que pasar | Compu | Celular | Notas |
|---|---|---|---|---|---|---|
| 01 | **Pago aprobado** | Armar una marca, "Comprar mi marca", pagar con titular `APRO` | Vuelve a la cuenta, la marca queda desbloqueada (logo en alta, archivos, brandbook). En el panel: pago "Aprobado" y factura emitida. Llega el mail del pago y el de la factura | — | — | |
| 02 | **Pago pendiente** | Igual, con titular `CONT` | Vuelve a la cuenta y dice que el pago está pendiente. **La marca sigue bloqueada.** En el panel: "Pendiente", sin factura | — | — | |
| 03 | **Pago rechazado** | Igual, con titular `OTHE` | Mercado Pago dice que se rechazó y deja probar con otra tarjeta. La marca sigue bloqueada. En el panel: "Rechazado" | — | — | |
| 04 | **Volver sin pagar** | Ir a pagar y tocar "Volver" en Mercado Pago, sin pagar | La marca sigue bloqueada. **Nunca se desbloquea solo por volver de la pantalla de pago** | — | — | |
| 05 | **Pago repetido** | Pagar con `APRO` y, en la misma marca, intentar pagar de nuevo (doble clic, o volver atrás y pagar otra vez) | No se cobra dos veces. Si igual entra un segundo cobro, aparece en "Para revisar" del panel | — | — | |
| 06 | **Aviso repetido** | Pedirle a Eze que reenvíe el mismo aviso de Mercado Pago (desde su panel de Webhooks) | El pago queda una sola vez en `cobros` y en el panel. No sale una segunda factura | — | — | |
| 07 | **Volver otro día** | Después del caso 01, cerrar el navegador, entrar en otro (o en el celular) con el mismo mail | Encuentra su marca, desbloqueada | — | — | |

### Tu marca andando (suscripción mensual)

| # | Caso | Cómo | Qué tiene que pasar | Compu | Celular | Notas |
|---|---|---|---|---|---|---|
| 08 | **Suscripción** | "Suscribirme", pagar con `APRO` | La cuenta dice "Activo (Modo prueba)" con la fecha del próximo cobro. Se habilitan los contenidos del mes. En el panel: suscripción activa, pago aprobado, factura | — | — | |
| 09 | **Baja** | Con la suscripción del caso 08, darse de baja desde la cuenta | Un solo clic (más la confirmación). Sigue activa hasta el fin del mes pago y no se cobra más. En el panel: "Dadas de baja" | — | — | |
| 10 | **Renovación** | Suscripción de prueba con frecuencia corta (la arma Eze, C9b) y esperar el segundo cobro | Entra el segundo cobro solo, la suscripción sigue activa con la fecha nueva y sale otra factura | — | — | |
| 11 | **Cobro mensual fallido** | Como el 10, pero la tarjeta rechaza el segundo cobro (pedirle a Eze cómo forzarlo en modo prueba) | En el panel: "Cobro fallido" en "Para revisar". La persona recibe un aviso y tiene unos días de gracia antes de que se pause (C9) | — | — | |
| 12 | **Suscribirse sin haber comprado la marca** | Cuenta nueva, suscribirse directo | La suscripción incluye la marca: queda desbloqueada también | — | — | |

### Devoluciones y facturas

| # | Caso | Cómo | Qué tiene que pasar | Compu | Celular | Notas |
|---|---|---|---|---|---|---|
| 13 | **Devolución** | Desde el panel, devolver el pago del caso 01 (cuando exista el botón, D4) | En el panel: "Devuelto". La marca se bloquea. Sale la nota de crédito y le llega un mail. La plata vuelve a la tarjeta de prueba | — | — | |
| 14 | **Factura que no sale** | Pedirle a Eze que apague el proveedor de facturas (por ejemplo, una clave mal puesta en Preview) y pagar con `APRO` | El pago igual se aprueba y desbloquea. En el panel: "Factura con error" con sus intentos. Al volver a poner la clave, se reintenta y sale | — | — | |

### BranderIA (si da el tiempo, C7)

| # | Caso | Cómo | Qué tiene que pasar | Compu | Celular | Notas |
|---|---|---|---|---|---|---|
| 15 | **Pedido cobrado** | Desde `/pedidos`, cargar un precio, generar el link de pago y pagarlo con `APRO` | El pedido pasa solo a "en producción" y sale la factura | — | — | |
| 16 | **Link de pago rechazado** | Igual, con `OTHE` | El pedido sigue "cotizado" | — | — | |

### Seguridad (sin tarjeta)

| # | Caso | Cómo | Qué tiene que pasar | Compu | Celular | Notas |
|---|---|---|---|---|---|---|
| 17 | **Aviso falso** | Mandar a `/api/cobros/aviso` un aviso inventado, sin firma (lo hace Claude con un comando) | Se rechaza y no cambia nada. **Ojo:** si falta `MERCADOPAGO_WEBHOOK_SECRET`, la app deja pasar el aviso (igual le pregunta a Mercado Pago antes de creerlo). Confirmar que la clave esté cargada en Preview y en Production | — | — | |
| 18 | **Panel cerrado** | Abrir `/admin/cobros` en una ventana privada, sin entrar | Lleva a `/admin`. No se ve ningún pago | — | — | |

## Resultado

| Fecha | Quién probó | Pasaron | Fallaron | Qué quedó pendiente |
|---|---|---|---|---|
| | | | | |

**Está terminado cuando** todos los casos (menos 15 y 16, si se recorta BranderIA) tienen ✅ en compu y en celular,
con su captura, en el link de prueba de Vercel. Después, los casos 01, 08 y 09 se repiten una vez con plata real
en `app.brandiamos.com` el **jueves 10/12** (primer pago real, lo hace un socio, y después se devuelve).
