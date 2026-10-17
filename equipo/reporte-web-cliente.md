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
| 1 | **Web del cliente con IA real: pasos 1, 3 y 4** (entrevista de la web → web generada con la marca → cambios por chat). **No hay código todavía.** Hoy `/crear/proximamente/web` es solo la pantalla "en construcción" | Alta |
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
