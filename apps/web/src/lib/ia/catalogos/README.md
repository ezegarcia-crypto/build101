# Catálogos del motor de marca

Catálogos reales para que la IA elija con criterio en lugar de inventar (issue #2, propuesta de Juan Pedro).
Todo lo que está acá tiene licencia libre y se puede usar en el producto.

## Tipografías · `fuentes.json` y `fuentes.ts`

**Qué es:** unas 200 familias de Google Fonts, elegidas por calidad y variedad, cada una con:

| Campo | Qué dice |
|---|---|
| `categoria` | sans, serif, display, manuscrita o mono |
| `estilo` | El dibujo: «geométrica», «humanista», «didona, de alto contraste», «script informal»… |
| `caracter` | Lo que transmite: «calma», «solvente», «vintage», «juguetona»… (no todas lo tienen) |
| `usos` | Todas sirven para títulos; solo las marcadas con `texto` sirven para leer párrafos |
| `pesos`, `cursiva`, `variable` | Para armar el link de Google Fonts con los pesos que existen |
| `muy_vista` | Entre las 40 más usadas de Google Fonts: la IA las evita salvo que la ficha pida algo neutro |
| `licencia` | OFL-1.1 o Apache-2.0: se pueden usar gratis, también en productos comerciales |

**Cómo lo usa el motor:**

1. `/api/direcciones`: el catálogo va al final del prompt (`catalogoParaPrompt()`, unos 3.100 tokens) y la IA
   elige de ahí las dos tipografías de cada dirección. Después, `fuentesDelCatalogo()` revisa que estén y que la de
   texto sirva para texto. Si no, la cambia por una segura del mismo tipo y lo anota en `comprobaciones`.
2. `/api/identidad`: `tipografiasDeLaIdentidad()` arma el link de Google Fonts con los pesos del catálogo. Si la
   dirección es de antes del catálogo y trae otra fuente, la respeta mientras exista en Google Fonts (la persona
   ya la vio en su camino).

**Cómo se arma:** `node scripts/catalogo-fuentes.mjs` (desde la raíz del repo). Baja los datos, filtra y escribe
`fuentes.json`. No se edita a mano: si hay que cambiar un criterio, se cambia en el script y se vuelve a correr.

- **Datos:** [Fontsource](https://fontsource.org) (categoría, pesos, idiomas y licencia), las
  [etiquetas de Google Fonts](https://github.com/google/fonts/blob/main/tags/all/families.csv) (estilo, carácter y
  notas de calidad) y los metadatos de fonts.google.com (popularidad).
- **Filtros:** licencia OFL o Apache, con las letras del español, sin Noto ni fuentes de marca de Google, sin las
  de otro alfabeto (salvo unas pocas muy usadas con letras latinas, como Poppins), sin las de usos especiales ni
  las de aprender a escribir, y con una calidad promedio de 65 o más.
- **Selección:** de la más usada a la menos, con cupos por categoría (70 sans, 50 serif, 50 display,
  30 manuscritas y 6 mono) y un máximo de 14 del mismo estilo, para que haya variedad.
- **Para texto:** sans o serif no decorativa, con regular y negrita, buen espaciado y que no sea angosta, muy
  ancha ni solo de mayúsculas.

Se probó que las 206 familias cargan en Google Fonts con el link que arma `parametroFuente()`.

**Queda para después** (issue #2): sumar fuentes de Fontshare, Huerta Tipográfica u Omnibus-Type. No están en
Google Fonts, así que hay que alojarlas nosotros y cambiar cómo se cargan en el brandbook, el feed y la web del
cliente, que hoy usan el link de Google Fonts. Ojo con Fontshare: por lo que sabemos, usa una licencia propia
(ITF Free Font License) y no OFL. Hay que leerla antes de usarla.

## Estilos · `estilos.json` y `estilos.ts`

**Qué es:** las 15 familias de estilo del apéndice A de `reports/Estudios de branding referentes mundiales.md`. Lo que
las separa es el **mecanismo** (la decisión de diseño que manda: una retícula, el vacío, un personaje, la letra hecha a
mano, un bloque de color…), no un adjetivo. Cada familia tiene:

| Campo | Qué dice |
|---|---|
| `numero` y `nombre` | Por ejemplo «7. Vacío y calma» |
| `mecanismo` | La decisión de diseño que la define, en español |
| `rubros` | Para qué negocios suele servir. Orienta, no obliga |
| `descriptores` | De 5 a 12 descripciones en inglés, listas para el prompt (118 en total) |

El informe no da pareja tipográfica, paleta base ni regla de movimiento por familia, así que no están: las
tipografías salen del catálogo de fuentes y los colores, del negocio. **Ningún dato nombra estudios ni diseñadores.**

**Cómo lo usa el motor:**

1. `/api/direcciones`: el catálogo va en el prompt (`catalogoEstilosParaPrompt()`, unos 26.000 caracteres,
   aproximadamente 6.500 tokens) y la IA elige **una familia distinta para cada una de las 3 direcciones** según la
   ficha, más el número del descriptor que mejor le queda. Después, `estilosDelCatalogo()` revisa que cada familia
   exista y que no se repita, y lo anota en `comprobaciones` («Estilo»). No se corrige solo: para eso habría que volver
   a pedirle a la IA.
2. Cada dirección guarda `estilo`: familia, número, mecanismo, el descriptor en inglés y por qué. La tarjeta del camino
   muestra «Estilo: …», las vueltas de caminos le pasan a la IA las familias que la persona ya vio, y `/api/logo`
   recibe el mecanismo y el descriptor para que los logos sigan el mismo estilo.
3. Las direcciones guardadas antes del catálogo no tienen `estilo` y siguen funcionando (el campo es opcional).

**Cómo se arma:** `node scripts/catalogo-estilos.mjs` (desde la raíz del repo). Lee el apéndice A del informe y
escribe `estilos.json`. Frena si encuentra en los datos el nombre de alguno de los 177 estudios de las tablas del
informe. No se edita a mano: si cambia el apéndice, se vuelve a correr.

**Queda para después** (issue #2): los acentos regionales del mismo apéndice (filete, Torres García, chicha…), con la
intensidad regulable de 0 a 2. Están en el informe pero todavía no en los datos.

## Paletas

Pendiente (prioridad 2 del issue #2).
