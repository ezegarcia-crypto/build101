---
project_name: BrandIA Kids (idea a futuro)
owner: Rodrigo Portas
socios: Juan Pedro Portas · Rodrigo Portas · Ezequiel García
status: beta (cerrada)
phase: prevista, no entra en la demo de build 101
rama: kids-beta (no se mergea a main hasta que los tres socios lo aprueben por escrito)
criticality: baja
confidentiality: int
last_updated: 2026-10-18
version: 0.1.0
---

# Qué es

Una versión de BrandIA para chicos: un **álbum virtual de stickers**. La IA genera el contenido (los stickers y las páginas del álbum) y los stickers los pueden **diseñar y generar otras personas**, para que los chicos los coleccionen, los cambien y completen su álbum.

Es la misma idea de BrandIA (la IA arma algo con identidad propia a partir de una charla) aplicada a algo que los chicos ya conocen: el álbum de figuritas.

# Cómo funcionaría

1. **El álbum.** Cada chico tiene uno o varios álbumes de un tema (animales, fútbol, dinosaurios, su escuela). La IA arma las páginas, los huecos y el orden de las figuritas.
2. **Los stickers.** Cada sticker es una imagen generada por IA con un nombre y un dato corto. Se consiguen abriendo sobres, cumpliendo desafíos o cambiándolos con amigos.
3. **Crear stickers.** Cualquiera habilitado (otro chico, un docente, un creador o una marca) le cuenta a la IA qué quiere ("un yaguareté jugando al fútbol") y la IA genera el sticker con el estilo del álbum, para que todos los stickers se vean de la misma colección.
4. **Colecciones de otros.** Los stickers aprobados se suman a una colección que otros pueden coleccionar.

# Dónde va la IA (la prueba de la consigna)

Sin IA no existe: la IA genera cada sticker, mantiene el estilo de la colección, arma el álbum según el tema y revisa que lo que crean otros sea apto para chicos.

# Modalidad beta

- **Beta cerrada.** Solo la usan familias invitadas, con un adulto que aceptó las condiciones de la beta. No hay registro abierto.
- **Nada para mergear.** Todo vive en la rama `kids-beta`. No se abre PR a `main` ni se mergea hasta que los tres socios lo aprueben por escrito y se haya hecho una revisión de seguridad completa.
- **Nada publicado.** La versión kids no aparece en https://app.brandiamos.com ni en ningún link público hasta esa aprobación.

# Permiso del adulto en cada sesión (obligatorio)

Cada vez que se va a usar la sesión de un chico, un adulto tiene que dar permiso **en ese momento**. No alcanza con un permiso dado una vez al crear la cuenta.

1. **Sin sesión guardada.** El chico nunca queda con la sesión abierta. Al cerrar la app, al cambiar de pestaña por un rato o a los 30 minutos sin uso, la sesión se cierra sola.
2. **Para abrirla, el adulto confirma cada vez.** Lo hace con su propia cuenta: un PIN que solo sabe el adulto o un aviso en su celular que tiene que aprobar. Si el adulto no confirma, la sesión del chico no arranca.
3. **El adulto ve qué se va a hacer.** Al aprobar ve cuánto dura la sesión y qué puede hacer el chico (abrir sobres, crear stickers, cambiarlos).
4. **Tiempo limitado.** Cada permiso vale para una sola sesión, con un tiempo máximo que elige el adulto. Al terminar, hay que pedir permiso de nuevo.
5. **Registro para el adulto.** El adulto ve el historial de cada sesión: cuándo empezó, cuánto duró y qué stickers se crearon o cambiaron.
6. **Si algo falla, se bloquea.** Si no se puede comprobar el permiso (sin conexión, error, PIN mal puesto varias veces), la sesión no se abre. Nunca se deja pasar "por las dudas".

# Prohibido usar fotos reales

- **Ninguna foto real, de nada ni de nadie.** No se pueden subir fotos de chicos, adultos, caras, casas, escuelas, mascotas ni lugares. Tampoco se pueden usar fotos reales como base o referencia para generar un sticker.
- **La app no pide ni acepta fotos.** La creación de stickers es solo por texto (o por voz pasada a texto). No hay botón de subir imagen ni acceso a la cámara o a la galería.
- **La IA tampoco las genera.** Las instrucciones de la IA prohíben imágenes fotorrealistas y personas reales reconocibles. Todos los stickers son ilustraciones con el estilo de la colección.
- **Doble chequeo.** Un filtro revisa cada imagen generada y descarta lo que parezca una foto o una persona real, antes de la revisión humana.

# Seguridad para chicos (obligatorio desde el día uno)

- **Revisión antes de publicar.** Todo sticker creado por otra persona pasa por un filtro de IA y por una revisión humana antes de llegar a un chico. Nada se publica directo.
- **Un adulto a cargo.** La cuenta del chico la abre y la controla un adulto (madre, padre o docente), que aprueba los cambios con otros chicos.
- **Mínimo de datos.** Del chico no se pide nombre real, foto, ubicación ni escuela. Sin chat libre entre chicos: los cambios de stickers se hacen con acciones predefinidas.
- **Publicidad.** Si participan marcas, sus stickers van identificados y sin compras dentro de la app para el chico. Revisar las normas de cada país sobre publicidad dirigida a chicos y protección de datos de menores (en Uruguay, la Ley 18.331).

# Preguntas abiertas

- ¿Es una línea aparte de BrandIA o una forma de que las marcas lleguen a familias y escuelas?
- ¿Quién paga: las familias (suscripción), las escuelas o las marcas que patrocinan colecciones?
- ¿Se pueden imprimir los stickers? Ahí se conecta con BranderIA (módulo C), que produce y manda productos físicos.
- ¿Quién hace la revisión humana y cuánto cuesta por sticker?

# Estado

Beta cerrada, solo en papel. No hay pantallas ni código. Cuando se empiece a construir, va en la rama `kids-beta` y respeta todo lo de arriba desde la primera línea de código: permiso del adulto en cada sesión y ninguna foto real.

# Reglas para la rama `kids-beta`

- No se mergea a `main` ni se abre PR sin la aprobación escrita de los tres socios.
- No se conecta a la base de datos de producción ni a la web publicada.
- Nunca se usan datos ni fotos de chicos reales, tampoco para probar. Las pruebas se hacen con perfiles inventados.
- Ninguna clave en el código, como en todo el repo.
