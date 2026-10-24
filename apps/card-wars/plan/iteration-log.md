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
