# Reporte · rama `web-cliente` (Rodrigo) · sábado 17/10

Para chequear con Eze antes de seguir. Revisado en la compu de Rodrigo.

## Estado de la rama

- `web-cliente` estaba **atrasada** respecto de `main` y no tenía nada propio sin juntar: todo lo suyo ya estaba en `main`.
- Se juntó `main` en `web-cliente` (en la compu, **sin subir**). Ahora las dos son iguales.
- `npm run check-types` y `npm run build`: **pasan sin errores**.
- `apps/web/.env.local` tiene la clave del Gateway (`AI_GATEWAY_API_KEY`), así que la IA se puede probar en la compu.

## Lo de Rodrigo que ya está hecho

| Qué | Dónde | Estado |
|---|---|---|
| Recorrido completo de la web del cliente, con el ejemplo de Costa | `equipo/flujo-web-cliente.md` | Hecho, en `main` |
| Pantallas "en construcción" del módulo B (pauta, newsletter, LinkedIn, X, redes, web) y de BranderIA | `apps/web/src/app/crear/proximamente/` | Hechas, en `main` (`/crear/proximamente/...`) |
| Prompts del reparto | `equipo/prompts-reparto.md` | Hecho, en `main` |
| Chequeo real de dominios (`panaderiacosta.com`, `.net`, `.store` libres; `.uy` no se pudo) | En el flujo, paso 5 | Probado a mano, sin código |

## Lo que falta

| # | Qué | Prioridad |
|---|---|---|
| 1 | ~~Web del cliente con IA real: pasos 1, 3 y 4~~ **Hecho (17/10, tarde):** `/crear/web`. Ver "Actualización" abajo | Hecho |
| 2 | Paso 2 · competencia y opciones de diseño | Si llega |
| 3 | Paso 5 · sugerencias y chequeo de dominios en vivo | Si llega |
| 4 | Carpeta `pruebas/` con 5 negocios inventados bien distintos (no Costa) para probar la app | Pendiente (rama `pruebas`) |

## Qué se puede reusar de lo que ya hizo Eze

- La **ficha de la marca** y la **identidad** (paleta, tipografías, logo, voz) ya quedan guardadas en el navegador (`sessionStorage`) cuando alguien pasa por `/crear` y `/crear/marca`. La web las puede leer de ahí: así la entrevista de la web **no repite preguntas**.
- Los modelos y la forma de llamar a la IA están en `apps/web/src/lib/ia/` (por ejemplo `entrevistador.ts`, `identidad.ts`, `reintentar.ts`) y se explican en `apps/web/src/lib/ia/README.md`.

## Para acordar con Eze antes de escribir código

El plan dice "carpetas propias, a acordar con Eze". Propuesta, para no pisar a nadie:

- `apps/web/src/lib/ia/web/` → los prompts y la lógica de la web (entrevista, armado, cambios).
- `apps/web/src/app/api/web/` → las rutas de la IA (`/api/web/entrevista`, `/api/web/generar`, `/api/web/cambio`).
- `apps/web/src/app/crear/web/` y `apps/web/src/components/web/` → las pantallas.
- Al final, el botón de `/crear/proximamente/web` apunta a `/crear/web`.

## Siguiente paso propuesto

**Está terminado cuando:** alguien cuenta un negocio inventado en `/crear`, genera su marca y, en `/crear/web`, contesta 3 o 4 preguntas y ve **su web armada con su marca**, y la cambia pidiéndolo en palabras ("cambiá el título por…"). Todo sale de la IA, nada escrito a mano.

## Actualización · sábado 17/10 a la tarde

**Hecho, en la rama `web-cliente` (sin subir):** la web del cliente con IA real, pasos 1, 3 y 4, en `/crear/web`.

- **Carpetas:** `lib/ia/web/` (prompts y formato), `app/api/web/` (`entrevista`, `armar`, `cambio`), `app/crear/web/` y `components/web/`.
- **Cómo funciona:** la IA no escribe HTML. Devuelve la web como secciones con sus textos, y la pantalla la dibuja con los colores, las tipografías y el logo de la marca. Los datos de contacto (WhatsApp, dirección, horarios) salen de lo que contó la persona, nunca de la IA. Una revisión automática avisa si apareció un número o un mail que la persona no dio.
- **Probado con una marca inventada** (taller de bicis "Rayo", no Costa), de punta a punta en el navegador: entrevista en 3 tandas, web armada en unos 20 segundos, cambio por chat en unos 16 ("cambiá el título" y "los sábados también abro"). En celular (375 px) sin scroll de costado, en modo claro y oscuro, sin errores en la consola.
- **La pantalla "en construcción"** de la web ahora tiene el botón "Armar mi web".

**Falta / para revisar con Eze:**
- Merge a `main`, con una revisión antes.
- Un link a `/crear/web` desde el recorrido principal (por ejemplo, desde el feed). Esa pantalla es de Juan Pedro: no la toqué.
- Las fotos todavía no se generan: hay un bloque con el color de la marca que dice qué foto va.
- Los pasos 2 (competencia) y 5 (dominios), si llegan.
- WhatsApp: si el número empieza con 0 y no trae país, se toma como de Uruguay (+598).
