# Flujo agéntico del monorepo

Este documento rige el trabajo de agentes en todas las aplicaciones. Las restricciones de producto y tecnología de cada app complementan este flujo; no lo redefinen. El usuario revisa `int` y gestiona la promoción a `main`.

## Inicio y alcance

1. Leer este protocolo, la planificación y el registro principal pertinentes, el `AGENTS.md` raíz y las instrucciones de la app o rutas afectadas. Para trabajo transversal, leer el plan raíz; para trabajo de una sola app, usar su plan. Consultar también los `AGENTS.md` anidados aplicables.
2. Inspeccionar `git status`, rama, remoto y commits locales no publicados. Preservar todos los cambios del usuario; nunca resetear, stash, trasladar cambios implícitamente, rebasar ni force-pushear.
3. Trabajar exclusivamente en `int`. Si es necesario, obtener referencias actualizadas con `git fetch origin`; usar la rama local existente, seguir `origin/int` cuando solo exista la remota o crear `int` desde `origin/main` si no existe ninguna. Si el cambio seguro requiere resolver conflictos o cambios ajenos, detener la edición y comunicar el bloqueo.
4. Consultar las dos ventanas de capacidad de Codex y definir una entrega con objetivo, `target_paths`, dependencias, aceptación, validación y registro de destino antes de editar. Crear o actualizar la planificación antes de un cambio no trivial.
5. Mantener código, identificadores, comentarios y mensajes de commit en inglés. Hablar con el usuario en español. Resolver decisiones rutinarias dentro del alcance y documentar decisiones materiales y dudas pendientes.

El plan y log de la app son el registro principal para cambios exclusivos de esa app. Para cambios compartidos, usar `plan/master.md`, `plan/iterations.md` y `plan/iteration-log.md` de la raíz. Un mismo corte tiene un único registro principal; incluir enlaces desde los planes de las otras apps afectadas. No inventar roadmap o progreso.

## Capacidad de Codex

La herramienta de uso informa los límites actuales: consultar `mcp__codex_app__get_usage_limits` o su equivalente disponible. Identificar las ventanas por `windowDurationMins` (300 para 5h y 10080 para 7d), preferir el límite general aplicable en `rateLimitsByLimitId` y usar la alternativa disponible si falta. Calcular el restante como `max(0, min(100, 100 - usedPercent))`; registrar hora, porcentaje restante y reinicio solo si está disponible. Una lectura ausente no significa capacidad ilimitada.

Consultar al comenzar o reanudar, antes de cada iteración, antes de una fase costosa si la estimación o el saldo pueden haber cambiado, tras un fallo que amplíe la reparación, y después del cierre. Refrescar tras el reset previsto: el reloj por sí solo no demuestra que la ventana se haya renovado. No preguntar al usuario por datos que la herramienta puede devolver.

Conservar como mínimo **7% de 5h y 2% de 7d** al cerrar la entrega completa. Estas son reservas de trabajo del usuario, no límites ni recomendaciones oficiales de OpenAI. Evaluar las ventanas por separado; no intercambiar su capacidad. Antes de iniciar, estimar de forma conservadora análisis, implementación, validación requerida, reparaciones, documentación, revisión, commit, push, verificación remota y cierre en ambas ventanas. Si una entrega no cabe, dividirla antes de editar en cortes coherentes con aceptación propia. No omitir validaciones ni publicar trabajo roto para ajustarse al margen. Si no cabe ningún corte completo, dejar el estado y el punto de reanudación claros, sin abrir trabajo adicional. No comprar créditos, consumir reinicios ni programar continuaciones a partir de esta política.

El uso cambia según el modelo, el contexto, la complejidad y las herramientas; los porcentajes no se convierten con precisión en mensajes o tokens. Ver la [documentación oficial de uso de Codex](https://learn.chatgpt.com/docs/pricing#what-are-the-usage-limits-for-my-plan). No registrar identificadores de cuenta ni transcripciones completas de la herramienta.

## Implementación, validación y cierre

- Entregar el corte coherente más pequeño que satisfaga la petición y su aceptación. Trabajar secuencialmente por defecto. Delegar solo con autorización humana explícita aplicable al trabajo actual, margen suficiente, rutas disjuntas y una persona responsable de integración. La capacidad disponible no autoriza delegación.
- Ejecutar comandos desde la raíz. Código: `bun run lint --changed --since=<base>` para la comparación pertinente, o `bun run lint --staged` para lo preparado; `bun run type-check`, pruebas pertinentes y `bun run build` con `--filter=@damaca/<app>` para las apps afectadas. En un cambio transversal, identificar las apps alcanzadas y ejecutar los filtros correspondientes. La CI actual ejecuta Biome incremental, tipos y tests; no sustituye un build local cuando este sea aceptación necesaria. Corregir todos los hallazgos del Biome en cada archivo editado.
- No usar `bun run lint` sin filtro como sinónimo de lint incremental: ejecuta Biome en el repositorio. No ejecutar `lint:fix` sobre cambios ajenos.
- En cambios exclusivamente documentales, validar enlaces locales, coherencia y `git diff --check`; no ejecutar builds o pruebas que no correspondan.
- Anotar comandos y resultados reales, fallos, skips, límites y próximos pasos en el registro principal. `validated` significa que se cumplieron los criterios aplicables; un check bloqueado no pasa.
- Revisar el diff, los archivos exactos preparados, secretos, cambios ajenos y commits no publicados. Incluir cambios de código y su planificación en el mismo Conventional Commit por iteración validada, también documental.
- Publicar con `git push -u origin int` si `int` aún no tiene seguimiento, o `git push origin int` en otro caso. Verificar directamente que `refs/heads/int` remoto coincide con el SHA del commit local. Nunca publicar en `main`: el usuario mantiene, revisa e integra esa rama.
- Si falla commit, push o la comprobación remota, conservar los cambios, registrar el paso preciso pendiente y resolverlo antes de iniciar otra iteración. No declarar publicada una entrega local.
- Tras verificar publicación, consultar de nuevo capacidad y comunicar el cambio, comprobaciones, limitaciones, restante de ambas ventanas y el siguiente paso. No crear un commit adicional solo para añadir esa última lectura; puede incluirse en el siguiente registro.

La autorización de publicación se limita al remoto configurado y a `int`. No cambia remotos, aprovisiona infraestructura, despliega producción ni autoriza trabajo desatendido. Si publicar `int` activa una preproducción configurada por esa app, seguir sus reglas documentadas.

## Lint incremental

El script raíz `bun run lint` ejecuta Biome sobre el repositorio según sus reglas e ignores. Usa `bun run lint --staged` para comprobar lo preparado. Usa `bun run lint --changed --since=<base>` para comparar con una referencia Git, por ejemplo el SHA base del corte. Selecciona la base pertinente y revisa explícitamente archivos nuevos no cubiertos por la comparación.

## Interrupciones y bloqueos

Registrar estado, rutas tocadas, validaciones hechas y pendientes, motivo del bloqueo y siguiente paso. No marcar como validado ni publicado lo que no esté acreditado. Si la lectura de capacidad no está disponible tras un reintento ante un fallo transitorio, no iniciar una nueva entrega que dependa de ella y comunicar la limitación.
