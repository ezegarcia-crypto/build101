---
title: Modelo de negocio de BrandIA
version: 3.0.0
status: definido por los socios
date: 2026-09-22
definido_por: Juan Pedro Portas · Rodrigo Portas · Ezequiel García (reunión del 2026-09-22)
reemplaza: _archivo/descripcion-brandia.md · _archivo/verticales-de-servicio.md · _archivo/planes-y-precios.md · _archivo/2026-09-22_modelo-negocio-v2-propuesta-eze.md
---

# Modelo de negocio · BrandIA

**Fuente de verdad del modelo.** Si otro documento dice algo distinto, manda este.
Lo que no se definió en la reunión está marcado **a definir**: no se completa con supuestos.

## En una línea

BrandIA es una **plataforma que genera identidades de marca de forma masiva** y las conecta con
un **marketplace** donde la persona contrata los productos de su marca, que BrandIA hace producir
y entregar.

## Las cuatro capas

| # | Capa | Qué es | Cómo se cobra | Humano | Peso |
|---|---|---|---|---|---|
| 1 | **Identidad** | La persona genera en la app el logo y todo el branding de su marca | Pago inicial, directo en la app | **No** | **Foco** |
| 2 | **Suscripción** | Packs para redes sociales y otros contenidos, hechos con su marca | Suscripción | No | Segunda etapa |
| 3 | **Plus** | Una persona supervisa y le da un resultado más personalizado | a definir | **Sí** | Opcional |
| 4 | **Marketplace** | Tarjetas, folletería, merch (gorras, remeras, lapiceras) y cualquier producto de marca, contratado desde la página de BrandIA | a definir | Operación con proveedores | **Foco** |

### El foco

Las dos patas fuertes son la **1 y la 4**: generar marcas desde la plataforma a nivel masivo, y
conectar esas marcas con el marketplace. La 2 es la etapa siguiente y la 3 queda como opcional.

### Cómo funciona el marketplace

La persona elige el producto en la página de BrandIA, con su marca ya aplicada. **BrandIA se
encarga de que los proveedores lo ejecuten y le entreguen el producto terminado.** El cliente no
trata con el proveedor.

## A definir

- Precio del pago inicial de identidad.
- Precio y contenido de los packs de suscripción.
- Precio y alcance de Plus (qué supervisa la persona y cuántos clientes atiende).
- Cómo gana BrandIA en el marketplace (margen sobre el costo del proveedor, comisión u otro).
- Catálogo inicial del marketplace y primeros proveedores.
- Quién resuelve la logística y la calidad de cada pedido.

## Dónde vive cada capa

`/03-projects/01-identidad/` · `02-suscripcion/` · `03-plus/` · `04-marketplace/` · y la app en `00-plataforma/`.

## Qué cambió respecto de los documentos anteriores

- El modelo original (agosto) tenía 7 verticales, compra única + 4 planes de suscripción + marketplace de proveedores con comisión. Archivado en `_archivo/`.
- La propuesta v2 de Ezequiel (22/9, mañana) dejaba el marketplace afuera. **Se revirtió:** el marketplace pasa a ser una de las dos patas fuertes.
- Siguen vigentes como análisis el FODA (`2026-08-31_analisis-de-mercado-y-foda.md`) y el análisis de competencia (7/9). Los dos ya señalaban la producción física local como el diferencial defendible.
