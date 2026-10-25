# Plan de producto

## Estado actual

Card Wars es un contador local e instalable para partidas presenciales a dos jugadores de Card Wars, el juego de mesa de Hora de Aventuras. La experiencia se comparte en un dispositivo, conserva partidas en IndexedDB y requiere conexión para comprobar el acceso a través de Damaca Hub. Interfaz y mensajes en español; con identidad central del Hub, sin telemetría ni sincronización.

## Alcance

- Crear varias partidas con dos nombres distintos, 25 vidas iniciales y selección del «tío guay» que empieza.
- Al iniciar otra partida, precargar los jugadores de la última finalizada y preseleccionar su ganador. Si aún no hay partidas finalizadas, usar los nombres de la última creada y pedir quién empieza. Permitir cambiar el jugador inicial.
- Ajustar vidas en pasos de ±1 y ±5, sin bajar de cero. Permitir superar 25 con un aviso. Registrar cada movimiento y permitir deshacer el más reciente.
- Proponer confirmar al rival como ganador cuando un jugador llega a cero. Permitir cancelar la propuesta, elegir ganador manualmente o abandonar la partida sin ganador.
- Reanudar cualquier partida en curso. Conservar las partidas terminadas y abandonadas con resultado y movimientos.
- Mostrar la hora de inicio en partidas activas, historial, detalle y copias. Guardar el instante UTC y mostrarlo en la zona horaria del dispositivo.
- Exportar e importar un respaldo JSON versionado. Validar antes de escribir; añadir registros nuevos, omitir duplicados idénticos y conservar el registro local ante conflictos, informando el resultado.
- Priorizar pantalla móvil con márgenes mínimos, controles táctiles accesibles, diseño responsive y estética inspirada en Hora de Aventuras con recursos locales.

## Decisiones técnicas y límites

- Mantener Next.js 16 con servidor de identidad, PWA instalable, IndexedDB, Zod y el envoltorio `idb` del starter local.
- Partidas y preferencias permanecen en IndexedDB local al origen/dispositivo. Las copias son manuales; no hay sincronización ni recuperación automática.
- Cada partida almacena inicio UTC (`startedAt`), jugadores, vidas, primer jugador, estado, ganador opcional y cambios de vida. Sin reglas de cartas, turnos, mazos o efectos automatizados.
- Usar la base local generada como punto de partida. Crear un almacén de partidas mediante migración no destructiva; preservar preferencias y almacenamiento existente.
- El registro principal de esta entrega está en [iteration-log.md](iteration-log.md). El protocolo de rama, capacidad, validación y publicación es el [workflow raíz](../../../plan/workflow.md).

## Criterios de producto

Se pueden crear, reanudar, modificar, deshacer, finalizar y abandonar partidas con acceso vigente. Las vidas y movimientos persisten tras cerrar/abrir la app. Los respaldos válidos mantienen los instantes UTC y los inválidos no modifican datos. La app cabe en una pantalla móvil compacta sin desbordamiento horizontal y se puede operar con teclado y controles táctiles.

## Identidad y acceso — decisión vigente AGW-05

La petición posterior del usuario sustituye los límites de ausencia de cuentas, exportación estática y acceso offline descritos arriba: el producto requiere login Google y permiso vigente de damaca-hub. Se conserva IndexedDB sin migraciones ni sincronización; las partidas locales pertenecen al navegador y siguen compartidas entre sus cuentas. Instalación disponible, acceso con conexión obligatoria. La implementación compartida, estado y evidencia se registran en [AGW-05 raíz](../../../plan/iterations.md#agw-05--google-identity-and-hub-access-shared-package) y [su registro](../../../plan/iteration-log.md#agw-05-google-identity-and-hub-access).
