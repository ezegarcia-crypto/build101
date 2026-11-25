# Beta cerrada · lunes 14 al viernes 18 de diciembre (E1)

Entre 10 y 20 personas de confianza **pagan de verdad** por BrandIA antes de abrirla al público el domingo 20/12.
Sirve para ver que el cobro, la factura y la marca funcionan sin que nadie del equipo toque nada, y para
aprender qué falla. La lleva Rodrigo. Plan completo en `equipo/plan-beta-20-diciembre.md`.

**La meta de la semana:** 10 pagos reales de la marca y al menos 5 suscripciones activas, sin intervención del equipo.

## Los datos personales no van en este repo

El repo puede ser público. **Los nombres, mails y teléfonos de las personas van en una planilla privada** (por
ejemplo, una hoja de Google compartida solo entre los tres socios). Acá cada persona es un código: **P01, P02…**
La planilla privada tiene el código al lado del nombre.

## A quién invitar

- **Mitad y mitad:** gente de confianza de los socios (amigos, familia, clientes de antes) y gente de la lista de
  espera de BrandIA que ya mostró interés.
- **Que tengan un negocio de verdad, o a punto de arrancar.** Si inventan uno, no sabemos si la marca les sirve.
- **Rubros distintos:** comida, servicios, comercio, profesionales, oficios. Así la IA se prueba con casos variados.
- **Al menos 5 que se suscriban** al plan mensual, no solo que compren la marca.
- **Al menos 5 que lo hagan solo desde el celular**, que es como va a entrar la mayoría.
- **Algunos que no se lleven bien con la tecnología.** Si ellos pueden, puede cualquiera.
- Que paguen con **su propia tarjeta o su cuenta de Mercado Pago**, no con la de un socio.

## Qué les ofrecemos a cambio

**A decidir los tres** (marcar uno o varios):

- [ ] Precio de lanzamiento, más bajo que el del 20/12.
- [ ] Si algo falla o no les gusta, **se les devuelve la plata sin preguntas** (lo dice el plan).
- [ ] Un producto de BranderIA de regalo con su marca (por ejemplo, tarjetas), si BranderIA está listo.
- [ ] Un mes de suscripción gratis a cambio de una charla de 15 minutos después de probar.

## El mensaje para invitarlos

Para mandar por WhatsApp, de a uno, desde el teléfono de quien conoce a la persona. Completar lo que está entre
corchetes. **Sin precios hasta que los socios los cierren.**

```text
¡Hola [nombre]! ¿Cómo andás?

Te escribo porque estamos por lanzar BrandIA, la app que te arma la marca de tu negocio con inteligencia
artificial: le contás tu negocio por chat (escribiendo o con audios) y en unos minutos te da el nombre, el logo,
los colores, las tipografías y el brandbook. Si te suscribís, también te hace los posteos del mes.

Antes de abrirla al público el 20 de diciembre, queremos que la prueben 15 personas de confianza, pagando de
verdad, para asegurarnos de que todo funciona. ¿Te sumás?

- Es del lunes 14 al viernes 18 de diciembre, cuando puedas. Te lleva unos 20 minutos.
- Tenés [lo que ofrecemos: precio de lanzamiento / devolución sin preguntas / ...].
- Lo único que te pido es que me cuentes qué te costó o qué no entendiste.

Si te copa, el lunes 14 te mando el link. ¡Gracias!
```

**El lunes 14 a la mañana**, a los que dijeron que sí:

```text
¡Arrancamos! Este es el link: https://app.brandiamos.com

1. Tocá "¿BrandIAmos?" y contale tu negocio.
2. Elegí el nombre, el camino y el logo que más te guste.
3. Para llevarte la marca entera, tocá "Comprar mi marca" y pagá con Mercado Pago.
4. Si querés los posteos del mes, suscribite a "Tu marca andando".

Cualquier cosa rara (algo que no carga, un error, algo que no se entiende), mandame captura por acá.
Te llega la factura por mail.
```

**El jueves 17**, a los que todavía no lo hicieron:

```text
¡Hola [nombre]! ¿Pudiste probar BrandIA? Tenés tiempo hasta mañana viernes.
Si te trabaste en algo, contame y lo vemos juntos.
```

**Después**, a todos:

```text
¡Gracias por probar BrandIA! Nos ayudó un montón.
¿Qué fue lo que más te gustó y qué cambiarías? Con una línea alcanza.
```

## El seguimiento

Una fila por persona. Se completa cada día de la semana, mirando el panel `/admin/cobros` y lo que cuenten por
WhatsApp. Lo que falle va también a `equipo/pruebas-cobro.md` si es del cobro.

| Código | De dónde viene | Rubro | Celu o compu | Invitada | Dijo que sí | Armó la marca | Pagó la marca | Se suscribió | Le llegó la factura | Qué falló | Devolución | Comentario |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P01 | | | | | | | | | | | | |
| P02 | | | | | | | | | | | | |
| P03 | | | | | | | | | | | | |
| P04 | | | | | | | | | | | | |
| P05 | | | | | | | | | | | | |
| P06 | | | | | | | | | | | | |
| P07 | | | | | | | | | | | | |
| P08 | | | | | | | | | | | | |
| P09 | | | | | | | | | | | | |
| P10 | | | | | | | | | | | | |
| P11 | | | | | | | | | | | | |
| P12 | | | | | | | | | | | | |
| P13 | | | | | | | | | | | | |
| P14 | | | | | | | | | | | | |
| P15 | | | | | | | | | | | | |

**Cómo se completa:** "De dónde viene" es *socio* o *lista de espera*. En "Invitada", la fecha. En "Pagó la
marca" y "Se suscribió", la fecha y el monto. En "Qué falló", una línea por problema, con el número del caso de
`pruebas-cobro.md` si corresponde.

## Cada día de la semana

1. A la mañana, mirar `/admin/cobros`: pagos nuevos, cobros fallidos y facturas que no salieron.
2. Mirar `/costos`: cuánto costó la IA de cada uno. Si alguien gasta mucho más que el resto, avisar.
3. Contestar los WhatsApp del día y pasar cada problema a la tabla.
4. A la tarde, un mensaje corto al grupo de los socios: cuántos pagaron, cuántos se suscribieron, qué falló.

## El viernes 18 (se congela)

- **Resumen:** cuántos invitados, cuántos pagaron, cuántos se suscribieron, cuántas facturas salieron solas y
  qué falló, ordenado de más grave a menos.
- **La decisión:** con eso, los tres deciden si el domingo 20 se abre o qué se arregla antes.

## Calendario

| Cuándo | Qué |
|---|---|
| Hasta el jueves 10/12 | Armar la lista (con los nombres en la planilla privada) y mandar la invitación |
| Viernes 11/12 | Confirmar quién dijo que sí. Si hay menos de 12, invitar a más |
| Lunes 14/12, 9 h | Mandar el link |
| Lunes 14 al viernes 18 | Seguimiento de cada día |
| Jueves 17/12 | Recordatorio a los que no probaron |
| Viernes 18/12 | Resumen y decisión. Se congela el código |
| Después del 20/12 | Mensaje de agradecimiento y pedido de comentario |
