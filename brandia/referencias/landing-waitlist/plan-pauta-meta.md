---
documento: Plan de pauta en Meta · lista de espera
version: v1 · borrador (2026-10-06)
owner: Ezequiel García (con Claude)
estado: borrador — revisión humana obligatoria antes de cargar o gastar nada (CLAUDE.md, regla 6)
---

# Plan de pauta en Meta · lista de espera

> Las cifras de costo marcadas **[estimación]** son hipótesis para arrancar, no datos de
> BrandIA: no hay historial de pauta. Se recalibran con los números reales de los primeros 3 días.

## 1. Qué queremos saber (y qué no)

El objetivo **no es juntar la lista más grande**: es aprender rápido y barato si hay demanda.
Un mail es una señal débil (anotarse es gratis), por eso el éxito se mide con cuatro números,
no con uno:

| Métrica | Qué dice | Dónde se ve |
|---|---|---|
| **CPL** (costo por anotado) | Cuánto cuesta el interés | Administrador de anuncios |
| **Conversión de la landing** (anotados / visitas) | Si la promesa convence | Anuncios + Supabase |
| **% que completa el perfil** | Si el interés es en serio | Supabase |
| **Precio declarado y % «quiero probarla antes»** | Disposición a pagar y a involucrarse | Supabase |

## 2. Antes de gastar un peso — bloqueantes

- [ ] **Página de Facebook y cuenta de Instagram de BrandIA.** Sin página no se puede pautar.
      Los handles (@brandiamos) siguen pendientes (`/02-departments/legal/PENDIENTES-MARCA.md`).
      Con una grilla mínima de 6 a 9 posteos: mucha gente toca el perfil antes de anotarse.
- [ ] **Portfolio comercial (Meta Business Suite) y cuenta publicitaria en USD**, con medio de pago.
      Decidir de quién es la tarjeta y cómo se reparte el gasto entre los socios.
- [ ] **Píxel/dataset creado** y su ID en la landing (`CONFIG.pixelId`).
- [ ] **Dominio `brandiamos.com` verificado** en el portfolio (registro TXT en GoDaddy, cuenta de Juan Pedro).
- [ ] **Landing publicada** en `brandiamos.com` con el formulario conectado (Supabase o n8n).
- [ ] **Prueba punta a punta:** anotarse desde el celular y ver el `Lead` en el Administrador de
      eventos (pestaña «Probar eventos») y la fila en la base.
- [ ] **Política de privacidad revisada** y `hola@brandiamos.com` recibiendo mails.

## 3. A quién le hablamos

Sale del análisis de mercado (§ 3.1) y del manual (§ 03). En esta etapa se prueban los dos
segmentos con más volumen y menos fricción:

| Segmento | Qué siente | Qué le prometemos | Ángulos que le hablan |
|---|---|---|---|
| **Emprendedor que arranca o está por abrir** (el de más volumen) | Miedo a quedar amateur y gastar mal la primera plata | Arrancá con la marca ya hecha | marca · historia · velocidad |
| **Emprendedor o PyME que ya funciona** | La marca le quedó chica; quiere productos con su marca | Que se note que creciste · de la pantalla a la remera | fisico · alternativa |

**Fuera de esta prueba:** empresas establecidas (ciclo de venta largo) y proveedores gráficos (el
otro lado del marketplace; se captan aparte, no por esta landing).

**Perfil demográfico para arrancar:** 22 a 50 años, todos los géneros, español. El cliente
probable es joven (CLAUDE.md), pero no se corta por edad: lo decide el algoritmo con los datos.

## 4. Geografía

- **Fase 1 (semanas 1–2): Uruguay entero.** Es el laboratorio: CPM bajo, red propia, cualquier
  anotado se puede entrevistar en persona.
- **Fase 2 (semanas 3–4): sumar Argentina** (AMBA, Córdoba, Rosario, Mendoza) en un conjunto
  aparte, **solo si** la fase 1 da señal. El análisis de mercado es claro: Uruguay solo no da
  para una plataforma, y AR es el siguiente mercado natural (mismo idioma, mismo voseo).
- Nunca mezclar países en un mismo conjunto de anuncios: los costos son muy distintos y uno se come al otro.

## 5. Públicos

Tres conjuntos de anuncios que compiten entre sí, con los **mismos anuncios** adentro, para
saber qué público rinde mejor:

**A · Abierto (Advantage+ audience).** Solo país, edad mínima 22 e idioma. Se le dan como
«sugerencias» los intereses del público B. Hoy el algoritmo de Meta suele encontrar mejor que
nosotros a quien se anota; este conjunto es el control.

**B · Emprendimiento y negocio propio** (segmentación detallada, con expansión de Advantage prendida):
- Intereses: Emprendimiento · Pequeña empresa · Marketing digital · Comercio electrónico ·
  Instagram para empresas · Tiendanube · Mercado Libre · Shopify.
- Comportamientos: Propietarios de pequeñas empresas · Administradores de páginas de empresa.

**C · Rubros donde nace la mayoría de los emprendimientos** (lo que BrandIA ve todos los días: la
panadería, el café, la tienda de ropa):
- Intereses: Repostería · Pastelería · Cafeterías · Indumentaria / moda · Artesanías ·
  Estética y belleza · Fotografía · Diseño de interiores · Pinterest · Canva · Diseño gráfico.

> Los nombres exactos se buscan en el Administrador al cargar: Meta cambia y fusiona intereses
> seguido. Si alguno no aparece, se usa el más parecido y se anota acá.

**Exclusión:** desde el día 3, excluir a quienes ya se anotaron (público personalizado con el
evento `Lead` del píxel, últimos 30 días).

**Más adelante, con datos:**
- **Remarketing**: visitas a la landing en los últimos 7 días que no se anotaron (recién tiene
  sentido con unas 1.000 visitas).
- **Similar (lookalike) 1 %** de los anotados, cuando haya 100 o más.

## 6. Estructura de la campaña

```
Campaña  BIA | Waitlist | Clientes potenciales | UY | 2026-10
│  Objetivo: Clientes potenciales · conversión en el sitio web · evento: Lead
│  Presupuesto por conjunto (ABO) para que los tres públicos tengan la misma plata
│
├── Conjunto  UY | A Abierto      | USD 6/día
├── Conjunto  UY | B Emprendedor  | USD 6/día
└── Conjunto  UY | C Rubros       | USD 6/día
      └── Los mismos 6 anuncios en los tres:
          marca-reel · historia-reel · fisico-reel · velocidad-estatico ·
          alternativa-estatico · demo-reel (grabación de la demo de la landing)
```

- **Ubicaciones:** Advantage+ (automáticas). Cada anuncio con versión **9:16** (Reels e
  Historias) y **4:5** (Feed).
- **Botón:** «Registrarte».
- **Optimización:** evento `Lead` desde el día 1. Si en 72 h un conjunto no llega a 5 anotados,
  se cambia temporalmente a «Visitas a la página de destino» para que junte datos.
- **Advantage+ creative:** apagar las mejoras que cambian el texto o la imagen (traducciones,
  música, retoques). La marca no se toca sola.

### URL de cada anuncio (UTM)

```
https://brandiamos.com/?a=<ángulo>&utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}
```

`<ángulo>` es `marca`, `historia`, `fisico`, `velocidad` o `alternativa` (ver
`anuncios-y-cinematicas.md`). Las llaves `{{…}}` las completa Meta solo.

### Nombres

`BIA | <Qué> | <Objetivo o público> | <País> | <Fecha o versión>`, igual en campaña, conjunto
y anuncio. Así el `utm_content` de cada anotado dice qué anuncio lo trajo.

## 7. Presupuesto

| Opción | Diario | Duración | Total | Para qué alcanza |
|---|---|---|---|---|
| Mínima | USD 12 (3 × 4) | 14 días | **≈ USD 170** | Ver si hay señal en UY. Poca plata por conjunto: el algoritmo aprende lento |
| **Recomendada** | **USD 18 (3 × 6)** | 14 días + 14 de fase 2 | **≈ USD 250 UY + 250 AR** | Comparar públicos y ángulos con números que se pueden leer |
| Ambiciosa | USD 35 | 28 días | **≈ USD 1.000** | Lista grande para el lanzamiento + lookalike + AR en paralelo |

**[estimación]** Con la recomendada, y un CPL de entre USD 0,80 y 2,50 en Uruguay, la fase 1
junta **entre 100 y 300 anotados**. Alcanza para tomar decisiones y entrevistar a 10 o 15
personas de la fase 2 del piloto.

## 8. Calendario

| Día | Qué se hace |
|---|---|
| −7 a −1 | Bloqueantes (§ 2). Grilla mínima en IG. Producir las piezas (ver anuncios) |
| 0 | Carga de la campaña **con revisión de los tres socios antes de prenderla** |
| 1–3 | Aprendizaje. **No tocar nada**. Solo mirar que el `Lead` llegue bien |
| 4 | Primer corte: apagar los anuncios con CTR de enlace menor a 0,6 % o CPL más del doble que el promedio |
| 7 | Segundo corte: la plata del público peor va al mejor. Excluir anotados. Primeras 5 entrevistas |
| 10–14 | Nuevas versiones del ángulo ganador (otro gancho, otro formato) |
| 14 | **Informe de fase 1** y decisión (§ 9). Si da, arranca la fase 2 con Argentina |
| 28 | Informe final, lista lista para el lanzamiento |

## 9. Reglas de decisión

**[estimación]** Umbrales de partida. Se ajustan en la reunión con lo que se vea en la semana 1.

| Lo que pasa | Lectura | Qué hacemos |
|---|---|---|
| CTR de enlace bajo (< 0,6 %) | El anuncio no frena el scroll | Cambiar el gancho de los primeros 2 segundos, no el público |
| CTR bien pero landing < 10 % | El anuncio promete otra cosa, o la landing no convence | Revisar que título y anuncio coincidan; probar otro título |
| Landing > 20 % y CPL ≤ USD 1,50 | **Hay interés, y barato** | Escalar y abrir Argentina |
| Mucha lista pero < 30 % completa el perfil | Interés liviano, curiosos | Probar la pre-reserva (§ 10) antes de concluir nada |
| ≥ 40 % declara pagar USD 50 o más | Hay disposición a pagar en el rango del análisis | Insumo directo para precios |
| Un ángulo saca el doble que los demás | Ese es el mensaje | Llevarlo al héroe de la web v3 y a la plataforma |

## 10. Después de la lista: la prueba que vale más

Una lista dice «me interesa». No dice «pago». Si la fase 1 da señal, el paso siguiente es una
**pre-reserva paga** (por ejemplo, reservar la identidad con un monto simbólico, reembolsable,
por Mercado Pago). Cuántos pagan de cada 100 anotados es el dato más honesto que se puede
conseguir antes de lanzar. Necesita los precios cerrados (`/02-departments/finance/PENDIENTES-PRECIOS.md`).

**La lista se enfría.** Si entre el anuncio y la apertura pasan más de 6 a 8 semanas, buena
parte se olvida de por qué se anotó. Hay que mandarle algo cada 2 o 3 semanas (avances, una
marca BrandIAda de ejemplo, la invitación a probar). Eso necesita el mail del dominio configurado.

## 11. Reglas de Meta que hay que cuidar

- **Atributos personales:** no afirmar ni insinuar cosas de la persona («¿Estás con deudas?»,
  «Vos, que tu negocio no vende»). Hablar del negocio y de la marca, no de su situación.
- **No prometer resultados** («vas a vender el doble»). También es regla del manual (tono, punto 5).
- **Antes y después:** permitido para marcas y productos. Para personas, no.
- **Política de privacidad visible** en la landing: está, en el pie y junto al formulario.
- **Texto en la imagen:** sin límite formal, pero con poco texto rinde mejor. Una idea por pieza.
