# Flujo agéntico por iteraciones

## Preparación

1. Leer el plan maestro, la iteración candidata, el registro reciente y los `AGENTS.md` aplicables.
2. Comprobar rama y estado de Git; preservar cambios ajenos. Trabajar exclusivamente en `int`: actualizar referencias con `git fetch origin` y cambiar a la rama local existente; si solo existe `origin/int`, crear su seguimiento. Si no existe ninguna, crear `int` desde `origin/main`. No resetear ni trasladar cambios ajenos implícitamente: si impiden el cambio seguro de rama, comunicar el conflicto antes de editar. Nunca implementar en `main`.
3. Definir objetivo, `target_paths`, dependencias, aceptación y validación en `iterations.md`. Dividir el trabajo si no permite una entrega coherente.
4. Leer la guía relevante del Next instalado antes de escribir código. Resolver elecciones rutinarias dentro del alcance; registrar dudas materiales y avanzar en el trabajo independiente.

## Ejecución

Trabajar secuencialmente por defecto. La delegación solo se activa con autorización aplicable, contratos claros y archivos disjuntos; asignar un responsable de integración. No revertir cambios de otros agentes o del usuario.

Continuar hasta satisfacer la petición autorizada. Una nueva instrucción humana puede ajustar el alcance: actualizar aceptación y dependencias sin perder trabajo válido. Una iteración pendiente del plan no equivale por sí sola a autorización para iniciar nuevas funcionalidades o trabajo desatendido.

Los cambios de arquitectura, dependencias base o seguridad requieren una decisión humana concreta. Preparar antes la evidencia y las alternativas que puedan analizarse sin esa decisión. No pedir permiso repetidamente para una acción ya autorizada.

## Validación y cierre

1. Comprobar aceptación. Para código/configuración: `bun run lint`, `bun run type-check`, pruebas pertinentes con `bun run test` y `bun run build`. Añadir interacción y revisión visual si cambia la UI.
2. Para documentación exclusivamente: comprobar enlaces locales, consistencia y `git diff --check`. No crear pruebas que solo reproduzcan texto.
3. Diferenciar pruebas unitarias, integración, interacción, QA visual y despliegue. Registrar skips, fallos y restricciones; una prueba simulada no acredita un servicio real.
4. Revisar el diff y ausencia de secretos o cambios ajenos. Actualizar `iterations.md` y `iteration-log.md` con evidencias y siguiente paso.
5. Crear obligatoriamente un Conventional Commit en `int` después de cada iteración validada, incluidas las de planificación o documentación. Incluir el plan y el registro de la entrega; revisar los archivos preparados y excluir cambios ajenos. No introducir un hash futuro en el mismo commit ni confirmar trabajo que se sabe roto. Esta autorización es permanente para el flujo: no pedir permiso de nuevo en cada entrega.
6. Hacer push obligatorio a `origin/int`: `git push -u origin int` en la primera publicación y `git push origin int` en las siguientes. Consultar el SHA remoto de `refs/heads/int` y comprobar que coincide con el commit local antes de declarar la entrega publicada. Nunca usar force-push. Si falla el commit, push o la verificación, conservar los cambios, comunicar el paso pendiente y resolverlo antes de acumular otra iteración sin publicar.
7. Comunicar resultado, comprobaciones, limitaciones y punto de continuación.

Estados: `pending` (sin iniciar), `in_progress` (trabajo abierto), `blocked` (dependencia o comprobación requerida no disponible), `validated` (aceptación y comprobaciones requeridas aprobadas). El estado de publicación se registra por separado; una entrega local validada no implica despliegue.

## Integración humana y permisos

El usuario revisa `int` y, cuando lo considera correcto, hace el merge de `int` en `main` y el push de `main`. Los agentes no implementan, hacen commit, merge, push, reset ni rebase sobre `main`. La creación o selección de `int` y su commit/push por iteración quedan autorizados por esta política.

La autorización se limita al remoto configurado del proyecto actual. Al copiar la plantilla, configurar el remoto de destino antes de publicar. No autoriza producción, provisión, cambios de remoto ni automatizaciones. Si un proyecto configura despliegue de integración al publicar `int`, documentar su política específica; esta plantilla no tiene ese despliegue configurado.

## Gestión de capacidad de Codex: ventanas de 5h y 7d

### Dos ventanas independientes

Este flujo se ejecuta en Codex y debe gestionar las dos ventanas de uso de esta cuenta: **5 horas** (300 minutos) y **7 días** (10 080 minutos). La semanal tiene un horizonte mucho más amplio, pero ambas pueden limitar la siguiente entrega. No son presupuestos separados por chat o agente: otras sesiones pueden consumir la misma capacidad. Si cambia la disponibilidad de límites del plan, verificarlo en la herramienta y comunicar la diferencia; no inventar una ventana ausente.

Consultar directamente `get_usage_limits` de la app (actualmente `mcp__codex_app__get_usage_limits`, o su equivalente disponible). Preferir `rateLimitsByLimitId` y seleccionar el límite general de Codex; no confundirlo con una cuota específica de revisión. Identificar cada ventana por `windowDurationMins`, no por su posición o nombre. Calcular **restante = max(0, min(100, 100 - usedPercent))** y conservar la fecha de lectura y `resetsAt` si están disponibles. Un valor ausente no equivale a cero ni a capacidad ilimitada. No registrar identificadores de cuenta, credenciales ni el resultado completo de la herramienta.

Mantener siempre una lectura vigente como referencia de decisión: consultar al empezar o reanudar una sesión, **antes de cada nueva iteración y después de su cierre**, incluidas las documentales. Durante una entrega larga, refrescarla antes de fases costosas (pruebas integradas, reparación amplia, delegación autorizada) y cuando cambie el alcance o el consumo observado. Tras una interrupción o pérdida de contexto, obtener una lectura nueva antes de continuar trabajo relevante. No tratar una observación antigua como medición continua ni hacer consultas sin necesidad en cada llamada de herramienta.

### Reservas obligatorias

| Ventana | Reserva que debe quedar al cerrar | Capacidad utilizable para la siguiente entrega |
| ------- | --------------------------------- | ---------------------------------------------- |
| 5h      | **7%**                            | Restante de 5h menos 7 puntos porcentuales     |
| 7d      | **2%**                            | Restante de 7d menos 2 puntos porcentuales     |

Son márgenes elegidos por el usuario para este proyecto, no límites oficiales de OpenAI. Evaluar ambas ventanas por separado: un punto porcentual de 5h no es intercambiable con uno de 7d. Si alguna está en su reserva o por debajo, no iniciar otra iteración. Reservar primero el coste de cierre; no usar estos márgenes para abrir trabajo adicional.

### Decisión antes de iniciar una iteración

1. Obtener ambas lecturas y definir una entrega útil con objetivo, `target_paths`, dependencias y aceptación verificable.
2. Estimar por separado el consumo de cada ventana para **análisis, implementación, pruebas, posibles reparaciones, documentación, revisión del diff, commit, push, verificación remota y lectura de cierre**. Usar el extremo conservador de entregas comparables y añadir margen para incertidumbre. Conservar observaciones comparables antes/después cuando existan; no mezclar lecturas a través de un reinicio ni atribuir automáticamente consumo de otros chats a esta entrega.
3. Comprobar que el coste estimado completo cabe en la capacidad utilizable de **ambas** ventanas. Si el margen es dudoso, la tarea no se considera acotada: dividirla antes de editar, siguiendo dependencias y manteniendo aceptación propia para cada subentrega.
4. Si no cabe la iteración prevista, buscar una subiteración más pequeña que sí pueda terminarse y publicarse. Aprovechar al máximo la capacidad disponible para trabajo útil y autorizado; no detenerse solo porque la tarea grande no cabe, ni crear trabajo de relleno para consumir cuota.
5. Dejar explícito qué parte se entrega y cuál queda pendiente. Si ninguna entrega coherente cabe conservando las reservas, detener nuevas iteraciones con un punto de reanudación claro, evitando quedar a mitad por rate limit.

Las estimaciones son heurísticas, no garantías ni conversiones a tokens o número de mensajes. El coste cambia con modelo, contexto, herramientas y complejidad; la [documentación oficial de uso](https://learn.chatgpt.com/docs/pricing#what-are-the-usage-limits-for-my-plan) confirma esta variabilidad. No asumir que una ventana se ha renovado solo por el reloj: volver a consultar después del reset previsto. Por defecto, trabajo secuencial; la capacidad disponible no autoriza por sí sola delegación.

### Seguimiento y cierre

Si aparece consumo o incertidumbre superior a lo previsto, reducir el alcance futuro y priorizar cerrar el corte actual coherentemente. No rebajar aceptación, omitir validaciones necesarias, publicar código roto ni declarar una iteración terminada para aparentar cumplimiento de la reserva. Si una reserva se cruza de forma imprevista, comunicarlo y evitar abrir más trabajo; conservar el estado y las comprobaciones pendientes.

Después del commit/push y la verificación de `origin/int`, consultar de nuevo ambas ventanas y comunicar el restante junto con la entrega y su siguiente paso. Registrar la lectura inicial y la decisión de alcance en la entrada de iteración cuando aporte evidencia; la lectura posterior al commit puede comunicarse al usuario e incorporarse a la siguiente entrada, sin crear un commit extra solo para guardar una cifra ni un ciclo de commits/consultas.

No pedir al usuario datos que la herramienta puede obtener. Si falta una lectura necesaria, reintentar una vez ante fallo transitorio; si sigue sin estar disponible, no inventar datos ni abrir otra entrega dependiente de ellos. Preservar/cerrar el trabajo en curso hasta donde sea comprobable, comunicar la limitación y solicitar únicamente la lectura que no se puede obtener.

La política se aplica tanto al trabajo interactivo como a lotes expresamente autorizados. No amplía el alcance de la petición ni autoriza trabajo desatendido, créditos, reinicios de cuota, automatizaciones o continuaciones programadas. Si el usuario solicita un lote, acordar su alcance y condición de parada; las reservas 7%/2% siguen vigentes salvo cambio humano explícito.

## Interrupciones

Dejar estado exacto, rutas modificadas, comandos ejecutados y pendientes, bloqueo y próximo paso. No marcar `validated` una entrega cuya aceptación está incompleta. Mantener las reglas vigentes aquí y la cronología en el registro; no convertir este protocolo en un historial de sesiones.
