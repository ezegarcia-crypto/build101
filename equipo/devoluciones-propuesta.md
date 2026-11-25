# Devoluciones · propuesta para los socios (D4)

Borrador de Rodrigo, 25/11/2026, para decidir en la reunión de esta semana. **Nada de esto está construido:** el
botón de devolución del panel (`/admin/cobros`) se hace recién cuando los tres estén de acuerdo con la regla.
Lo marcado **confirmar** lo tiene que ver el contador (o un abogado) antes de publicarlo en los textos legales (A6).

## La idea en una frase

**Si BrandIA falló, devolvemos siempre. Si la persona se arrepiente, devolvemos dentro de los primeros 5 días
hábiles. Después, no se devuelve, pero se le ofrece rehacer.** Durante la beta cerrada, devolvemos a pedido.

## Por qué así

- **Lo pide la ley (confirmar).** La ley de defensa del consumidor (17.250, artículo 16) da 5 días hábiles para
  arrepentirse de una compra hecha a distancia, como por internet, sin dar explicaciones. Hay que confirmar si
  aplica igual a algo digital que ya se entregó (la marca generada y descargada).
- **Da confianza para pagar** a alguien que no nos conoce, y nos cuesta poco: lo que se pierde en una devolución es
  la IA de esa marca (hoy unos USD 1 a 4, se ve en `/costos`) y, quizás, la comisión de Mercado Pago (confirmar).
- **Es simple de explicar y de construir:** pocos motivos y pocas cuentas.

## La regla, plan por plan

### Tu marca (pago único)

| Caso | ¿Se devuelve? | Cuánto | Qué pasa con la marca |
|---|---|---|---|
| Pagó y la marca no se desbloqueó, o falló la generación y no lo pudimos arreglar en 48 h | **Sí, siempre** | Todo | Se bloquea de nuevo |
| Le cobraron dos veces | **Sí, siempre** | El cobro de más | Sigue desbloqueada |
| Se arrepiente dentro de los 5 días hábiles | **Sí** | Todo | Se bloquea; lo que ya descargó queda en su compu |
| Pide después de los 5 días hábiles | No | — | Se le ofrece una vuelta más gratis (rehacer nombres, logo o paleta) |

**A decidir:** si se arrepiente y ya descargó los archivos, ¿devolvemos igual? La propuesta es que **sí durante la
beta** (es poca plata y gana confianza) y revisarlo en enero con los números.

### Tu marca andando (suscripción mensual)

| Caso | ¿Se devuelve? | Cuánto | Qué pasa |
|---|---|---|---|
| Se da de baja | No | — | Sigue activa hasta el fin del mes pago y no se le cobra más |
| Se arrepiente dentro de los 5 días hábiles **del primer cobro** | **Sí** | Todo el primer mes | Se cancela la suscripción |
| Le cobraron después de darse de baja, o dos veces el mismo mes | **Sí, siempre** | El cobro de más | Queda como corresponde |
| Falló el servicio del mes (no se generaron sus contenidos y no lo arreglamos en 48 h) | **Sí** | La parte del mes que no tuvo, o el mes entero si no tuvo nada | Sigue activa si quiere |
| Pide en el segundo mes o después, sin falla | No | — | Puede darse de baja en un clic |

**A decidir:** la suscripción incluye la marca. Si se le devuelve el primer mes, ¿la marca se bloquea o se la
queda? La propuesta es **bloquearla**, como si no hubiera pagado (si quiere la marca sola, la compra aparte).

### BranderIA (productos)

| Caso | ¿Se devuelve? | Cuánto |
|---|---|---|
| Pagó y todavía no entró en producción | **Sí** | Todo |
| Ya está en producción | No por arrepentimiento: son productos hechos con su marca (confirmar) | — |
| Llegó fallado o distinto a la foto que aprobó | **Sí:** se le rehace o se le devuelve, como elija | Lo de los productos fallados |
| No llegó en el plazo prometido | **Sí**, si lo pide | Todo |

### Cuentas piloto y beta cerrada

- **Piloto** (`/pilotos`): no pagan, así que no hay nada que devolver.
- **Beta cerrada (14 al 18/12):** son personas de confianza que pagan para probar. Si alguna pide la plata, se le
  devuelve sin preguntas, como dice el plan (E1).

## Cómo se hace (para construir después de decidir)

1. En `/admin/cobros`, cada pago aprobado tiene **"Pedir devolución"**. Solo lo ven los administradores, que ya
   entraron con doble factor.
2. Se elige el **motivo** (no se generó · cobro doble · arrepentimiento · falla del servicio · BranderIA fallado ·
   otro) y, si hace falta, se escribe una nota. Total o parcial: **parcial solo en cobro doble, falla parcial del
   mes y BranderIA**.
3. El panel muestra lo que va a pasar ("Se devuelven $ 800 a Fulano, la marca se bloquea, sale la nota de
   crédito") y pide confirmar. **Las devoluciones no se pueden deshacer.**
4. La app le pide la devolución a Mercado Pago con la función que deje Eze en `apps/web/src/lib/pagos/` (no la
   escribo yo). Mercado Pago avisa por el webhook y el pago pasa a "Devuelto" en el panel.
5. Sale sola la **nota de crédito** (la "factura al revés" que anula la factura del pago, confirmar con el
   proveedor de facturas) y le llega un mail a la persona.
6. Queda anotado **quién la pidió, cuándo y por qué**, para revisarlo después.

**Plazo para contestar un pedido de devolución:** 2 días hábiles. Lo atiende quien esté de soporte (D3).

## Lo que hay que decidir en la reunión

1. ¿Están de acuerdo con la regla general (falla: siempre · arrepentimiento: 5 días hábiles · después: rehacer)?
2. ¿Devolvemos al que se arrepiente aunque ya descargó los archivos? (propuesta: sí, en la beta)
3. Si se devuelve el primer mes de la suscripción, ¿la marca se bloquea? (propuesta: sí)
4. ¿Cualquiera de los tres puede aprobar una devolución, o hacen falta dos? (propuesta: cualquiera, hasta el
   precio de un plan; más que eso, dos)
5. ¿Quién le pregunta al contador lo marcado **confirmar**: el artículo 16 de la ley 17.250 con algo digital, la
   nota de crédito y lo de BranderIA ya en producción?
6. ¿Quién le pregunta a Mercado Pago si devuelve la comisión cuando devolvemos un pago, y hasta cuántos días
   después del cobro se puede devolver?

## Lo que necesito de Eze para construirlo

- Una función en `apps/web/src/lib/pagos/` para pedir la devolución (total o parcial) de un cobro.
- Que el webhook, al recibir un pago devuelto, bloquee la marca o cancele la suscripción según esta regla. Para la
  marca ya lo hace en la rama `claude/cuentas-y-cobros` (`actualizarPago` en `lib/mercadopago.ts`); falta la
  suscripción.
- Que la factura automática (C5) también saque la nota de crédito de una devolución.
