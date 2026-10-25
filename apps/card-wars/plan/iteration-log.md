# Registro de entregas

Registra evidencia observada por iteración; no anticipes cambios no realizados.

## 01 — MVP de partidas y marcador

- Generado el workspace `@damaca/card-wars` desde `local-pwa` en `apps/card-wars`, puerto 3004.
- Alcance y criterios de la entrega registrados en [master.md](master.md) y [iterations.md](iterations.md).
- Implementación: esquema de partidas y movimientos validado con Zod; IndexedDB versión 2 añade el almacén e índices de partidas y conserva preferencias. El repositorio usa revisiones, transacciones y fusión de copias sin sobrescritura.
- UI en español: crear con nombres recuperados del historial, seleccionar el jugador inicial, partidas abiertas, contador ±1/±5, aviso al superar 25, deshacer, finalización, abandono, historial y ajustes con exportación/importación JSON.
- `startedAt`, fechas de cambios y cierres se normalizan y persisten en UTC; las vistas usan `Intl.DateTimeFormat` del dispositivo. Prueba confirma conversión de `2026-10-24T11:00:00+02:00` a `2026-10-24T09:00:00.000Z`.
- Presentación compacta probada en navegador a 360×640 y escritorio 1280×720. Se ajustó el contraste de las tarjetas pastel en tema oscuro tras inspeccionar la captura móvil.
- Interacción de navegador: creación de partida Finn/Jake, persistencia al recargar, ajuste a 26 vidas con aviso, deshacer y comprobación visual de la hora local. La confirmación de ganador interrumpió la herramienta del navegador; la finalización manual quedó sin verificar en navegador. Las pruebas de dominio cubren ganador y abandono.
- `bun run test --filter=@damaca/card-wars`: 24 pruebas pasan; `bun run type-check --filter=@damaca/card-wars`: pasa; `bun run build --filter=@damaca/card-wars`: pasa, exporta `/`, `/history`, `/settings`, `/icon.svg` y un worker con 53 recursos.
- `bunx biome check apps/card-wars`: pasa en 58 archivos. `bun run lint --changed --since=HEAD` encontró 0 archivos rastreados; la app nueva se verificó directamente con Biome.
- `bun run test:generator`: 6 pruebas pasan. `git diff --check` y enlaces locales de los documentos de la app pasan.
- La vista previa indicó acceso sin conexión listo. Tras detener el servidor estático, se recargó Partidas y se abrió Historial y Ajustes desde la caché; la partida de prueba seguía en IndexedDB. La instalación nativa no se verificó. La caché remota de Turbo no estuvo accesible; las tareas locales terminaron correctamente.
- El cambio del inventario monorepo está registrado en [AGW-04](../../../plan/iteration-log.md#agw-04-incorporar-card-wars-al-inventario).

## 02 — Eliminar partidas

- Se añadió eliminación permanente con confirmación en el marcador activo, en cada partida en curso y en cada registro del historial. El texto identifica a ambos jugadores y avisa que la acción no se puede deshacer.
- IndexedDB elimina dentro de una transacción y exige que la revisión coincida; si otra pestaña modificó o eliminó la partida, informa el conflicto. Las exportaciones reflejan únicamente los registros existentes.
- `bun run test --filter=@damaca/card-wars`: 25 pruebas pasan (92 expectativas), incluida eliminación, conflicto de revisión, listado vacío y respaldo sin el registro borrado.
- `bun run type-check --filter=@damaca/card-wars`, Biome sobre los archivos cambiados y `bun run build --filter=@damaca/card-wars` pasan; la exportación estática sigue incluyendo Partidas e Historial y el worker incluye 53 recursos.
- Inspección visual de escritorio a 1280×720 confirma el botón «Eliminar partida» en el marcador; la vista previa mostró la confirmación con los nombres. Se canceló la eliminación del registro sintético y la herramienta del navegador dejó de responder después del diálogo; no se completó una interacción de eliminación ni se inspeccionó un historial poblado en navegador. El repositorio cubre la operación de borrado en IndexedDB.
- Turbo remoto no estuvo accesible; las tareas locales finalizaron correctamente.

## 03 — Contraste del resultado en tema oscuro

- El banner de resultado ahora fija texto `#21352d` sobre fondo `#fff0b6`, evitando heredar el texto claro del tema oscuro. Se aplica tanto al resultado abandonado como al ganador.
- `bunx biome check` sobre el componente y los documentos; `bun run test --filter=@damaca/card-wars` (25 pruebas), `bun run type-check --filter=@damaca/card-wars` y `bun run build --filter=@damaca/card-wars` pasan. La exportación estática conserva sus rutas y worker de 53 recursos.
- El contraste se corrigió explícitamente en el componente; no se repitió inspección visual del banner en navegador.
- Turbo remoto no estuvo accesible; las tareas locales finalizaron correctamente.

## Integración compartida AGW-05

Evidencia y limitaciones en [registro raíz](../../../plan/iteration-log.md#agw-05-google-identity-and-hub-access).
