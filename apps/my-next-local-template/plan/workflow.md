# Flujo agéntico por iteraciones

## Preparación

1. Leer el plan maestro, la iteración candidata, el registro reciente y los `AGENTS.md` aplicables.
2. Comprobar rama y estado de Git; preservar cambios ajenos. Trabajar exclusivamente en `int`: actualizar referencias con `git fetch origin` y cambiar a la rama local existente; si solo existe `origin/int`, crear su seguimiento. Si no existe ninguna, crear `int` desde `origin/main`. No resetear ni trasladar cambios ajenos implícitamente: si impiden el cambio seguro de rama, comunicar el conflicto antes de editar. Nunca implementar en `main`.
3. Definir objetivo, `target_paths`, dependencias, aceptación y validación en `iterations.md`. Dividir el trabajo si no permite una entrega coherente.
4. Leer la guía relevante del Next instalado antes de escribir código. Resolver elecciones rutinarias dentro del alcance; registrar dudas materiales y avanzar en el trabajo independiente.

## Invariantes de la plantilla local

Cada iteración conserva exportación estática, IndexedDB como fuente de datos, instalación y offline sin autenticación ni servicios externos. Revisar `src/lib/storage/AGENTS.md` al tocar persistencia. Definir migraciones no destructivas, errores y recuperación; no añadir datos irremplazables sin diseñar respaldo. Nuevas rutas y recursos entran en la caché del build. No usar Server Actions, proxy ni API remota; el usuario debe autorizar explícitamente cualquier cambio de ese alcance.

Validar PWA con `bun run build` y `bun run start`, no con `next dev`. Registrar por separado recarga offline, persistencia, actualización, inspección visual e instalación nativa. Pruebas simuladas no acreditan estas últimas.

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

## Capacidad de Codex: ventanas de 5h y 7d

Este flujo se ejecuta con Codex y planifica el consumo de dos ventanas: **5 horas** y **7 días**. La de 7d tiene un horizonte mucho más amplio y una capacidad mayor en el contexto previsto por este flujo; eso no permite ignorar la de 5h. Cada ventana tiene su propio saldo y reinicio: debe quedar capacidad suficiente en ambas para completar una iteración. No deducir cuotas ni una proporción de capacidad a partir de su duración; comprobar siempre lo que informa la cuenta actual.

### Consulta y seguimiento

- Consultar la herramienta de límites disponible en Codex, actualmente `mcp__codex_app__get_usage_limits`, al comenzar la sesión y **antes de iniciar cada iteración**. Usar una capacidad equivalente si el nombre cambia; no pedir al usuario información accesible mediante herramientas.
- Identificar las ventanas por `windowDurationMins`: `300` para 5h y `10080` para 7d; no depender del orden de `primary` y `secondary`. Preferir `rateLimitsByLimitId` para el límite aplicable al modelo; usar `rateLimits` como alternativa cuando no exista ese mapa. Si hay varios límites aplicables, respetarlos todos.
- Calcular `remainingPercent = max(0, min(100, 100 - usedPercent))`. `usedPercent` representa consumo, no capacidad restante. Conservar durante la sesión la hora de consulta, el saldo y `resetsAt` de ambas ventanas; expresar los reinicios al usuario en su zona horaria cuando sea relevante.
- Mantener conciencia de la capacidad durante todo el trabajo: actualizar la lectura antes de fases largas o costosas, después de imprevistos, reintentos o ampliaciones de alcance y antes de decidir la siguiente iteración. Consultar también al cierre para contrastar estimación y consumo. Una lectura anterior no es un contador en tiempo real; evitar consultas repetidas sin trabajo o cambios que las justifiquen.
- Los límites se comparten con otros chats y actividad de la cuenta; no atribuir toda variación a esta tarea ni asumir que el saldo permanecerá intacto. Si se aproxima una reserva, consultar de nuevo antes de continuar con trabajo adicional.
- Un campo ausente o `null`, una herramienta no disponible o una lectura fallida significan **capacidad desconocida**, nunca cero consumo ni cuota ilimitada. Comunicar la limitación; no iniciar una entrega costosa cuya viabilidad dependa de datos desconocidos. Cerrar el corte coherente ya abierto y dejar una continuación precisa.

### Reservas y decisión de iniciar

| Ventana | Reserva mínima al cerrar                    | Capacidad utilizable antes de iniciar         |
| ------- | ------------------------------------------- | --------------------------------------------- |
| 5h      | **7%** de la capacidad total de esa ventana | `max(0, remaining5h - 7)` puntos porcentuales |
| 7d      | **2%** de la capacidad total de esa ventana | `max(0, remaining7d - 2)` puntos porcentuales |

Estos márgenes son una política humana de este proyecto, no límites garantizados por Codex. Se calculan sobre el total de cada ventana, **no sobre su saldo restante**. No son presupuestos para consumir deliberadamente: se procura conservarlos al terminar, con la implementación, validación, documentación y cierre ya incluidos en la estimación.

Antes de lanzar una iteración:
1. Estimar de forma conservadora su consumo en **cada ventana**, incluyendo análisis, implementación, pruebas, posibles reparaciones, revisión y cierre documental/Git. Usar evidencia reciente de tareas comparables cuando exista, con margen de incertidumbre. No prometer una equivalencia exacta entre porcentajes, mensajes, tokens o minutos: el coste varía con modelo, contexto, razonamiento y herramientas. [Referencia oficial de uso](https://learn.chatgpt.com/docs/pricing?codex-pricing-plans=individual).
2. Iniciarla solo si el consumo estimado completo cabe en la capacidad utilizable de **ambas** ventanas: `estimated5h <= remaining5h - 7` y `estimated7d <= remaining7d - 2`. No asumir un reinicio futuro antes de completar el trabajo ni compensar el agotamiento de una ventana con saldo de la otra.
3. Si no cabe, elegir e implementar una entrega más pequeña, completa y verificable que sí quepa. Reducir alcance o dividir por dependencias, conservando criterios de aceptación y validación propios; dejar explícitamente pendiente el resto. No iniciar una entrega grande esperando resolver su cierre después del rate limit ni quitar pruebas necesarias para hacerla parecer viable.
4. Si ni siquiera cabe un corte pequeño con su cierre, no abrir otra implementación. Documentar estado, pendientes y punto de reanudación mientras quede capacidad. Si cambia la estimación durante una entrega, reducir el trabajo adicional y cerrar el menor resultado coherente que pueda validarse; no declarar completado el alcance restante ni validado trabajo incompleto.

### Aprovechamiento y continuación

Buscar el máximo avance útil **dentro del alcance autorizado**, utilizando ambas ventanas hasta sus reservas sin dejar trabajo abierto por rate limit. Si una entrega termina y queda capacidad, reevaluar una siguiente entrega autorizada o un corte menor; no detenerse por comodidad ni inventar funcionalidades para consumir cuota. Al alcanzar el margen de cualquiera de las ventanas, no iniciar más trabajo. Los márgenes y estimaciones reducen el riesgo, pero no garantizan evitar un límite ante consumo concurrente o cambios de coste.

Registrar en el plan el alcance elegido, el resto pendiente y la decisión de ajustar o detenerse, sin copiar instantáneas de cuenta, identificadores ni cuotas históricas como configuración de la plantilla. Si el usuario solicita varias iteraciones o trabajo desatendido, acordar alcance y condición de parada; estas reservas ya quedan establecidas salvo instrucción humana posterior.

Esta sección no autoriza compras de créditos, uso de reinicios, cambio de modelo, automatizaciones, esperas programadas ni trabajo fuera de la petición. Si hace falta capacidad adicional, informar del siguiente reinicio disponible y dejar el punto de continuación; no ejecutar un reinicio ni programar una reanudación sin autorización.

## Interrupciones

Dejar estado exacto, rutas modificadas, comandos ejecutados y pendientes, bloqueo y próximo paso. No marcar `validated` una entrega cuya aceptación está incompleta. Mantener las reglas vigentes aquí y la cronología en el registro; no convertir este protocolo en un historial de sesiones.
