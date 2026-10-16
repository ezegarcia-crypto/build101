# Design system base

> Base para que la app no tenga la cara genérica de "hecho por IA". El sábado se ajusta el color de marca según el producto y se le pasa a Claude junto con el CLAUDE.md del proyecto.

## Color

- **Un solo color de marca**, para botones principales, links y lo que hay que mirar. Se elige el sábado según el producto. Arranque sugerido: azul cobalto `#2346D8`.
- **Neutros:** fondo `#F7F8FA`, tarjetas `#FFFFFF`, texto `#13161D`, texto secundario `#5A6172`, bordes `#DCE0E7`.
- **Estados:** bien `#1D7247`, cuidado `#8F530A`, error `#B42318`. Cada uno con un fondo suave del mismo tono.
- Modo oscuro solo si sobra tiempo.

## Tipografía

- Una sola familia, en dos pesos: regular y semibold. Sugerida: la de sistema, o Geist, que viene con Next.js.
- Títulos grandes y claros. Texto de 16 px como mínimo. Números en las tablas alineados.

## Estilo

- Mucho aire: espacios generosos, una idea por pantalla.
- Bordes redondeados suaves (8 a 12 px). Sombras casi nada.
- Las tarjetas, solo donde separan algo importante. No encajonar todo.
- **Mostrar a la IA trabajando:** qué está haciendo ("buscando propiedades…"), qué herramienta usa y con qué seguridad decidió (barra de porcentaje).
- Pensado primero para el celular (390 px de ancho) y probado también en la notebook o el proyector de la demo.

## Textos

- Español rioplatense, directo y amable. Botones que dicen exactamente lo que hacen ("Agendar visita", no "Enviar").
- Errores que explican qué pasó y qué hacer, sin culpar a nadie.
