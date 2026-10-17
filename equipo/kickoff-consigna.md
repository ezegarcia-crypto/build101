# La consigna de build 101

Lo que dijeron en el kickoff del sábado 17/10, sacado de la grabación ([transcripción completa](kickoff-transcripcion.md)). El audio es malo: lo marcado con **(?)** no se entendió bien y hay que confirmarlo con la foto de la slide o con un mentor.

## El desafío, en una frase

Pueden construir **el producto que quieran**, siempre que su **función principal dependa de la IA**: elegir un problema y armar una solución donde la IA sea **indispensable**.

**La pregunta para saber si vale:** si tu producto puede cumplir su función principal igual de bien **sin IA**, no vale.

## Qué vale y qué no

| Vale | No vale |
|---|---|
| Modelos existentes, APIs, modelos multimodales o propios | Usar la IA solo para *programar* (Claude Code, ChatGPT, Copilot): tiene que estar **adentro** del producto |
| LLMs, extracción estructurada de datos, generación de texto, visión, machine learning, voz, agentes (no tienen preferencia; puede ser uno o varios) | Un chat genérico tipo ChatGPT |
| Un producto que automatice un proceso (lo preguntaron y dijeron que sí) | La IA como función secundaria |
| | Reglas armadas a mano ("no me pongan *if*"): eso no es IA |

## Qué esperan ver en la demo

1. Un **producto que funcione**: la función principal implementada y que se pueda probar.
2. La IA **integrada** al producto.
3. Que procese **casos distintos de los que prepararon** para la prueba: el jurado va a meter sus propios datos. Nada armado a mano para que la demo salga bien.
4. El flujo completo, de punta a punta.

## Cómo se evalúa

| Peso | Criterio |
|---|---|
| 35 % | Producto funcionando e implementado |
| 25 % | Problema y valor para el usuario |
| 20 % | Calidad de la aplicación de la IA |
| 10 % | Experiencia de usuario |
| 10 % | Originalidad |

Confirmado con el PDF oficial (`equipo/build101-consigna.pdf`): el último 10 % es **originalidad**. Cada criterio va de 1 a 5; en empate gana el producto funcionando y después el valor para el usuario. No suman puntos la complejidad ni la cantidad de funciones. Tiempo por equipo: 3 minutos de demo y 3 de preguntas. Las partes simuladas o pendientes se aceptan si se dicen claramente; simular la IA a propósito incumple la consigna.

Dijeron que muchos de estos puntos se resuelven pensando bien el problema y el alcance, y que no los subestimemos.

## Reglas para el repo (importante)

- **El repo tiene que ser público durante la hackathon.** Lo dijeron como "regla importante". **Ojo:** el PDF oficial dice "se solicita acceso de lectura al repositorio", lo que alcanzaría con invitar al mentor. Confirmar con un mentor antes de hacerlo público.
- Hay que **sumar como colaborador al organizador** en el repo. Su usuario de GitHub estaba en la slide; no se escucha en el audio **(?)**.
- Va a haber **revisión técnica**: miran el historial (los commits) y "se dan cuenta" si traés cosas hechas de antes. El material de BrandIA (idea, marca, pitch y prototipos sin IA) está en `brandia/`.

## Herramientas que da el evento

Quieren que todos los equipos tengan las mismas condiciones.

| Herramienta | Qué es | Cómo se consigue |
|---|---|---|
| **Claude Code** | Una cuenta por equipo | Correo `equipoN@mozart...` **(?)**. Pasan por la mesa, les llega un código a ese correo y nos lo dan. Es de un solo uso. **Hay que saber nuestro número de equipo.** |
| **Kiro** (AWS) | Un editor de código con IA, con Opus, Sonnet, GPT y otros modelos | Instalarlo por terminal, crear la cuenta, escanear el QR que está en la mesa |
| **Tenki** | USD 250 de infraestructura para agentes: entornos aislados ("sandboxes", donde un agente puede romper cosas sin tocar tu compu), máquinas para GitHub Actions y revisión de código | Iniciar sesión en el enlace que mostraron y elegir los servicios |

**No mencionaron créditos de API para la IA del producto** (la clave que usa la app, no el agente que programa). Hay que preguntarle a un mentor.

## Mentores

Recomendaron dedicar **las primeras dos horas a definir bien el problema, la idea y el alcance**. Los mentores pasan por las mesas: usarlos.

## Problema práctico detectado: el wifi bloquea SSH

En la sede, `git pull` y `git push` fallan con `ssh: connect to host github.com port 22: Operation timed out`. Por HTTPS funciona. Para pasar el repo a HTTPS (en cada compu, una sola vez):

```bash
gh auth setup-git
```

```bash
git remote set-url origin https://github.com/ezegarcia-crypto/build101.git
```
