# Iteraciones de producto

Este archivo es la fuente única del estado de las iteraciones. Sigue el [workflow raíz](../../../plan/workflow.md).

## 01 — MVP de partidas y marcador

- Estado: `validated`.
- Objetivo: entregar el gestor de partidas offline con historial, movimientos, respaldos y una interfaz compacta inspirada en Card Wars.
- Rutas: `src/app/**`, `src/components/**`, `src/config/**`, `src/features/**`, `src/lib/storage/**`, `src/schemas/**`, recursos públicos y documentos de planificación de la app.
- Dependencias: starter `local-pwa` y decisiones de producto de esta conversación.
- Aceptación: creación con precarga de jugadores y preselección del ganador anterior; varias partidas abiertas; marcador con movimientos y deshacer; finalización, abandono, historial y persistencia local; fecha de inicio UTC visible en hora local; copias JSON validadas e importación sin sobrescritura; experiencia móvil accesible y PWA estática offline.
- Validación: tipos, Biome, pruebas de dominio y almacenamiento, build, generador, diff y revisión responsive de la vista previa estática; registrar por separado comprobaciones offline/nativas realizadas o pendientes.
- Evidencia: [registro](iteration-log.md#01--mvp-de-partidas-y-marcador).

## 02 — Eliminar partidas

- Estado: `validated`.
- Objetivo: permitir eliminar de forma explícita partidas activas y registros del historial.
- Rutas: `src/lib/storage/games.ts`, `src/lib/storage/games.test.ts`, `src/features/home/**`, `src/features/history/**`, `src/features/game/components/game-play.tsx` y este plan.
- Dependencias: repositorio IndexedDB y vistas de partidas e historial existentes.
- Aceptación: una confirmación precede la eliminación permanente desde Partidas, el marcador activo y el Historial; la partida desaparece de IndexedDB y de la vista; un registro concurrentemente modificado no se elimina; la exportación solo incluye partidas existentes.
- Validación: pruebas de repositorio para eliminar y revisión de conflicto, Biome, tipos, pruebas de app, build y comprobación UI responsive en vista previa.
- Evidencia: [registro](iteration-log.md#02--eliminar-partidas).

## 03 — Contraste del resultado en tema oscuro

- Estado: `validated`.
- Objetivo: mantener legibles los avisos de resultado sobre fondo amarillo independientemente del tema.
- Rutas: `src/features/game/components/game-play.tsx` y documentos de planificación de Card Wars.
- Dependencias: estilos del banner de resultado existentes.
- Aceptación: el texto del banner de partida abandonada y del ganador conserva contraste en tema oscuro y claro.
- Validación: Biome, tipos, pruebas de la app, build y revisión del estilo explícito.
- Evidencia: [registro](iteration-log.md#03--contraste-del-resultado-en-tema-oscuro).

## Integración transversal de identidad

La retirada del login y el retorno a la PWA pública offline se siguen en [AGW-08 raíz](../../../plan/iterations.md#agw-08--public-games-and-hub-managed-oidc-clients); AGW-05 queda como historial sustituido.
