# Cobros de BrandIA: Mercado Pago o Stripe

Comparación hecha el 21/10/2026 para cobrar los planes de `/crear/planes`: **Tu marca** USD 19,99 una vez,
**Tu marca andando** USD 29 por mes y **BranderIA** a cotizar (este no se cobra desde la app).

## La recomendación: Mercado Pago, cobrando en pesos

| | Mercado Pago (Uruguay) | Stripe |
|---|---|---|
| **¿Lo puede abrir una empresa uruguaya?** | **Sí.** Cuenta de vendedor uruguaya, cobra a la cuenta bancaria de acá | **No.** Uruguay no está en los [51 países de Stripe](https://stripe.com/global). Solo con una empresa en EE. UU. (Stripe Atlas, USD 500 de entrada, más contador y declaraciones allá todos los años) |
| **Cobro en dólares** | Dudoso: el cobro normal en Uruguay es en **pesos**. Para que te liquiden en dólares existe "Cross Border", pero el cliente igual paga en pesos. Se prueba en el modo prueba antes de decidir | Sí, en dólares nativo |
| **Cobro en pesos** | Sí | Sí, pero liquidado en EE. UU. |
| **Suscripción mensual que se cobra sola** | **Sí** (suscripciones de Mercado Pago: se cobra solo cada mes) | Sí, la mejor del mercado (Stripe Billing) |
| **Cómo paga el cliente** | Tarjeta de crédito o débito, dinero en su cuenta de Mercado Pago, y en el pago único también Abitab y Red Pagos. Lo conoce todo el mundo en Uruguay y la región | Solo tarjeta (y billeteras como Apple Pay). Nada de Abitab ni Red Pagos |
| **Comisión** | **5,99 % + IVA** si el dinero está al instante (≈ 7,3 % en total) o **4,99 % + IVA** a 21 días (≈ 6,1 %). Sin costo fijo ni mensualidad | 2,9 % + USD 0,30, más 1,5 % por tarjeta del exterior, más 1 % si hay cambio de moneda, más 0,7 % de Billing en las suscripciones (≈ 6 % en un cliente uruguayo). A eso se suma el costo de la empresa en EE. UU. |
| **Cuánto cuesta integrarlo** | Medio. Una página de pago de Mercado Pago (no hay que armar el formulario de la tarjeta) y un aviso (webhook) que nos dice cuándo se pagó. Sin instalar nada: se habla con su API | Bajo en código (lo más prolijo), **alto en trámites**: hay que crear y mantener la empresa en EE. UU. antes de cobrar el primer peso |

**Por qué Mercado Pago:** es lo único que hoy podemos abrir con la empresa de acá, es lo que usa el cliente
uruguayo y del resto de la región, cobra suscripciones solas y la comisión termina parecida a la de Stripe sin el
costo de una empresa afuera. Además, `/crear/planes` ya dice "por Mercado Pago".

**Lo que cambia:** el cobro va en **pesos uruguayos**. En pantalla se puede seguir mostrando el precio en dólares
y al lado lo que se cobra en pesos. Los precios en pesos de la base son provisorios (USD a unos 40 pesos:
**$ 800** la marca y **$ 1.190 por mes** la suscripción) y los fijan los socios.

**Cuándo mirar Stripe de nuevo:** si BrandIA vende sobre todo fuera de América Latina, o si se arma la empresa
en EE. UU. por otra razón (inversión, por ejemplo). El código queda preparado para sumar otro cobrador.

**Otra opción que no elegimos:** dLocal Go (empresa uruguaya, cobra en muchos países). No encontramos que tenga
suscripciones para vender en Uruguay ni sus comisiones publicadas.

## Cómo funciona con Mercado Pago

1. La persona entra a su cuenta y toca "Suscribirme" (o "Comprar mi marca") en `/crear/planes`.
2. BrandIA anota la suscripción como **pendiente** y la manda a la página de pago de Mercado Pago.
3. Paga. Mercado Pago la devuelve a `/crear/cuenta` y, aparte, le avisa a nuestro servidor (webhook).
4. El webhook le pregunta a Mercado Pago si es cierto y recién ahí marca la suscripción **activa** en Supabase.
5. Cada mes Mercado Pago cobra solo y vuelve a avisar: la suscripción sigue activa hasta el próximo mes. Si el
   cobro falla o la persona la cancela, deja de estar activa.

## Fuentes

- [Stripe: países donde se puede abrir una cuenta](https://stripe.com/global)
- [Mercado Pago Uruguay: suscripciones](https://www.mercadopago.com.uy/developers/es/docs/subscriptions/overview)
- [Mercado Pago Uruguay: Cross Border (liquidar en dólares)](https://www.mercadopago.com.uy/developers/en/docs/resources/localization/crossborder-integration)
- [Mercado Pago Uruguay: link de pago y comisiones](https://www.mercadopago.com.uy/herramientas-para-vender/link-de-pago)
- [Comisiones reales de Mercado Pago en Uruguay (firox.uy, julio 2026)](https://firox.uy/blog/como-cobrar-con-mercadopago-en-tu-tienda-online)
