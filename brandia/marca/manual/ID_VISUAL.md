# ID_VISUAL · BrandIA
> Identidad visual. Fuente de verdad editable.
> Transcripción fiel del *Manual de marca v1.3 · provisorio* (sept 2026), sin correcciones.
> ⚠️ **Estado declarado en el original: HIPÓTESIS DE TRABAJO.** Paleta Taller, isotipo de la B modular
> y Fraunces + Instrument Sans se eligieron para poder avanzar con piezas reales.
> **Nada se imprime ni se registra hasta que el owner lo apruebe.**
> Decisiones posteriores al manual: `/DECISIONES.md`. **Logo vigente: v2, en `../logo/v2/`** (2026-09-22).

---

## 11 · Logo

Un logotipo con la "IA" destacada en color, y como isotipo la B armada con dos piezas que se traban en la cintura. No es una metáfora prestada: es nuestra propia inicial, construida. Dice lo que hacemos —encastrar las piezas de una marca— y dice cómo lo hacemos —con el cliente poniendo la suya—. La costura es deliberadamente visible: la marca no esconde que está hecha de partes.

**Versiones**
- Logotipo principal (solo texto)
- Horizontal con isotipo
- Apilado con descriptor ("Estudio creativo con IA")
- Sobre grafito
- Sobre naranja · monocromo
- Isotipo solo · avatar y favicon

**Reglas de uso**
- **Área de resguardo:** el alto de la "B" en todos los lados. Nada entra ahí.
- **Tamaño mínimo:** 90 px de ancho en pantalla, 22 mm en impresión. Isotipo solo: 24 px / 8 mm.
- **Sobre foto:** solo en versión monocromo blanco, y con una capa oscura al 40% debajo.
- **El isotipo va solo** cuando la marca ya se reconoce: avatar, favicon, sello, aplicación pequeña.
- **Dos versiones por tamaño.** Estándar por encima de 32 px y de 22 mm; compacta por debajo, y siempre en bordado, serigrafía chica y grabado. Nunca las dos en una misma pieza.

**Usos incorrectos:** no deformar · no recolorear · ni otra tipografía ni otra grafía · sin sombras ni contornos.

**Variante compacta** — Misma silueta, corregida ópticamente: más masa (78 unidades de 100 en vez de 50), el doble de costura y la lengüeta un 36% más grande. A 16 px la estándar deja una costura de un píxel que el antialiasing borra; la compacta deja dos. Para favicon y avatar se usa dentro de un badge: cuadrado de color con radio del 22%, marca al 60% del lado.

> 📌 **Actualización 2026-09-22:** el isotipo oficial pasó a ser la B modular con lengüeta recta,
> en `01-corporate/branding/logo/v2/` (logo v2). Los vectoriales que describe esta sección (encastre redondo)
> quedaron archivados en `01-corporate/branding/_archivo/assets-v1.3/`.

---

## 12 · Color

Grafito, naranja de señalización y gris cemento: la paleta de un taller. Habla de oficio y de cosas que se fabrican, que es exactamente lo que dice el isotipo. Y evita el violeta-azul con el que se ve toda marca de IA — no queremos parecer una herramienta, queremos parecer un estudio que produce.

| Nombre | Hex | Rol |
|---|---|---|
| **Grafito** | `#1E1E1C` | Color base. Textos, fondos oscuros, el isotipo en su versión principal. El 70% de la superficie de cualquier pieza. |
| **Naranja Señal** | `#FF5C1A` | Color de marca. La "IA", botones, énfasis, la pieza que encastra. Uno por pieza, nunca dos. |
| **Cemento** | `#C9C6BE` | Neutro medio cálido. Fondos de bloque, separadores, la pieza "todavía sin armar" en ilustración. |
| **Hueso** | `#EDECE8` | Fondo claro. Papel, no pantalla: descansa la vista y liga con el grafito sin el frío del blanco puro. |
| **Piedra** | `#5C5A54` | Texto secundario, bajadas, metadatos. Neutro de la misma familia cálida, nunca gris azulado. |
| **Naranja Tinta** | `#B23B0A` | Variante del naranja para texto y links sobre fondo claro, donde el Señal no llega a contraste. |

**Combinaciones aprobadas** (ratios como figuran en el original)
Grafito + blanco 16.7 AAA · Hueso + Grafito 14.1 AAA · Naranja + Grafito 5.4 AA · Grafito + Naranja 6.5 AA · Cemento + Grafito 9.8 AAA
> ℹ️ Verificado con WCAG 2.1 (2026-09-22): Grafito + Naranja da **5.41** en los dos sentidos. Piedra sobre Cemento da 4.04 y no llega a AA. Los valores vigentes están en `../design-system/tokens.css`.

**Prohibido:** Naranja sobre Cemento · Naranja Señal como texto sobre Hueso (para eso está Naranja Tinta) · cualquier degradé entre los colores. El degradé solo existe como halo difuso de fondo, nunca sobre tipografía ni sobre el logo.

---

## 13 · Tipografía

Una serif con carácter para lo que se ve, un sans neutro para lo que se lee. Las dos son de licencia abierta, condición no negociable: entregamos archivos que el cliente después edita solo.

**Titulares · Fraunces** — Serif variable, contemporánea pero apoyada en una tradición vieja. Es la que le da a BrandIA cara de estudio con oficio en vez de herramienta. Pesos 600 y 700. Tiene eje óptico: usar `opsz` alto en tamaños grandes y bajo en chicos, o los titulares se ven blandos.

**Texto · Instrument Sans** — Se corre del medio a propósito. Frente a una serif con personalidad, el texto tiene que ser legible y callado: dos tipografías con carácter se pelean en cualquier documento largo. Pesos 400 y 600.

### Escala tipográfica

| Uso | Familia / peso | Tamaño | Tracking | opsz |
|---|---|---|---|---|
| Display | Fraunces 700 | 56–72 px | -1.8% | 144 |
| Título 1 | Fraunces 600 | 36 px | -1.6% | 96 |
| Título 2 | Fraunces 600 | 26 px | -1.4% | 96 |
| Título 3 | Fraunces 600 | 18 px | -0.8% | 40 |
| Cuerpo | Instrument 400 | 16–17 px | 0 | — |
| Bajada | Instrument 400 | 15 px · color Piedra | 0 | — |
| Etiqueta | Instrument 600 · versalitas | 10–11 px | +14% | — |

**Sustitutos de sistema** cuando no hay web fonts: Iowan Old Style o Georgia para titulares, Helvetica o Arial para texto. Ambas familias están en Google Fonts, así que funcionan en Google Workspace y en Canva sin instalar nada.

**Regla dura:** el tracking negativo de una grotesca no se le aplica a una serif. Fraunces ya trae el espaciado resuelto; apretarla más le come las serifas.

---

## 14 · Sistema

- **Grilla y espacio** — Base de 8 px. Todo el espaciado es múltiplo: 8 / 16 / 24 / 40 / 64. Márgenes generosos: el aire es parte del valor percibido.
- **Radios** — 4 px en elementos chicos, 14 px en tarjetas y contenedores, píldora completa en botones y etiquetas. Nunca esquinas vivas, nunca radios intermedios.
- **Iconografía** — Trazo de 1.75 px, puntas redondeadas, sin relleno. El isotipo es el único elemento sólido del sistema, y por eso destaca.
- **Fotografía** — Gente real haciendo cosas reales: manos, talleres, mostradores, luz natural. Nada de stock con apretones de manos ni oficinas vacías. Si no hay foto buena, va color plano.
- **La costura** — Recurso gráfico auxiliar: la lengüeta y la muesca del isotipo, ampliadas, como separador entre bloques o como corte de una imagen. Uno por pieza. Nunca decorativa: siempre marca una unión real entre dos cosas.
- **Antes de publicar** — Tres chequeos: ¿el cliente es el protagonista? ¿hay una sola idea? ¿se lee a 30 cm de un celular? Si alguno falla, no sale.

---

## 15 · Aplicaciones

Tres piezas de muestra en el original: cartel ("Tu producto ya es bueno. Que se note." + brandiamos.com; en el original decía brandia.uy), tarjeta personal y firma de mail.

---

## 16 · Qué falta cerrar (según el original, en orden de urgencia)

1. **Verificar disponibilidad del nombre** — buscar "BrandIA" en la base de marcas de la DNPI (Uruguay) antes de imprimir nada. Hay riesgo real de coincidencia: es un nombre construible por cualquiera.
2. **Registrar la marca** — clases 35 (publicidad) y 42 (diseño y software).
3. **Dominios** — `brandiamos.com` principal (registrado 2026-09-22); brandia.uy y brandia.com.uy defensivos. brandia.studio descartado (tomado).
4. **Tomar los handles** — alineados con brandiamos.com (p. ej. @brandiamos) en Instagram, TikTok y LinkedIn.
5. **Vectorizar el logotipo** — a curvas en SVG y exportar el paquete: SVG, PNG en tres tamaños, PDF vectorial y favicon.
6. **Completar el paquete de assets** — faltan los raster (favicon 16 y 32, apple-touch-icon, avatar 1024) y el EPS de una tinta para imprenta y bordado.
7. **Probar el isotipo impreso** — la costura de la B es lo primero que se pierde en serigrafía y en bordado. Imprimir a 15 mm y mirarlo en papel.
8. **Armar las plantillas** — post y story de Instagram, presentación comercial, propuesta y factura.
9. **Definir precios públicos** — el valor "nadie queda afuera" obliga a publicarlos.

---

## Anexo · Laboratorio de isotipo (ronda 2, 28 ago 2026)

Seis rutas exploradas, ninguna con la pieza de rompecabezas literal (símbolo sobre-usado en identidad corporativa y fuertemente asociado a la concientización sobre el autismo).

| Ruta | Idea | Gana | Arriesga |
|---|---|---|---|
| **A · El encastre** | Dos piezas, una lengüeta, una muesca. Nosotros y el cliente. | Se entiende en un segundo y aguanta cualquier tamaño. | Es la más obvia; sin buen logotipo al lado queda fría. |
| **B · La pila** | Capas que se apilan y se traban: identidad, web, contenidos, pauta. | Explica el modelo de negocio, no solo el concepto. | Horizontal y ancha: como avatar cuadrado pierde presencia. |
| **C · La B modular** ← *elegida en v1.3* | La inicial armada con dos piezas que se traban en la cintura. | Es propiedad nuestra: nadie más tiene esta B. | A 14 px la costura se cierra y se lee como una B común. |
| **D · El módulo** ← *recomendada por el autor* | Caja y espiga, como en carpintería. Encastra consigo misma infinitamente. | Un solo dibujo da marca, patrón y textura de fondo. | Sola puede leerse como app genérica; vive de la repetición. |
| **E · La marca armada** | Cuatro módulos en un cuadrado; cada cuadrante una vertical. | Se anima solo: las piezas entran una a una. | El más denso: a 14 px se convierte en mancha. |
| **F · La ranura** | El marco somos nosotros; la pieza que entra es el cliente. | Cuenta la relación, no solo el objeto. | Dos elementos y un contorno fino: el más frágil en chico. |

**Paletas exploradas**
- *Chispa* — `#0E1633` `#DE2A60` `#FFC24A` `#F2F3F7` (ronda 1)
- *Taller* — `#1E1E1C` `#FF5C1A` `#C9C6BE` `#EDECE8` ← **elegida**
- *Bloque* — `#12244B` `#1F62E8` `#F03E2F` `#FFC400` (lógica Bauhaus, modular)

**Tipografías exploradas**
- Bricolage Grotesque + Instrument Sans (ronda 1)
- Syne + Manrope (arquitectónica, sube el techo de precio percibido)
- Fraunces + Karla (editorial y cálida) ← **la familia elegida, con Instrument en vez de Karla**

**Lo que el autor recomendó y no se siguió:** ruta D con paleta Bloque y Syne, o ruta D con Taller y Fraunces. En v1.3 se cerró la ruta C con Taller y Fraunces + Instrument Sans.
