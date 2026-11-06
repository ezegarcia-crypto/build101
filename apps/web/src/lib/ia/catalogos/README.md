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

## Paletas

Pendiente (prioridad 2 del issue #2).
