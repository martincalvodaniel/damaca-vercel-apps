# Registro histórico

## BILL-07 — Navegación fija al hacer scroll

- Inicio: 2026-11-01, rama `int`, base `51617ca`, árbol limpio y sin commits locales pendientes. Capacidad inicial: 12 % en 5 h y 67 % en 7 d; cambio CSS acotado con margen estimado suficiente para validación y cierre conservando reservas.
- Aceptación: [BILL-07](iterations.md#bill-07--navegación-fija-al-hacer-scroll).
- Implementado: `sticky top-2 z-30` en la barra compartida y `overflow-x-clip` en PageLayout para conservar el recorte horizontal sin crear un ancestro de scroll que impida sticky. Conservados colores, ancho y margen superior; overlays y modales existentes usan `z-50`.
- Validación: `bun run type-check --filter=@damaca/billing-poc` correcto; `bun run test --filter=@damaca/billing-poc`: 969 pruebas, 0 fallos; `bun run build --filter=@damaca/billing-poc -- --webpack` correcto. `bun run lint --changed --since=51617ca` no seleccionó archivos sin preparar; `bun run lint --staged` comprobó los cinco archivos sin hallazgos. `git diff --cached --check` correcto.
- Revisión estática: páginas bajo PageLayout comparten el ajuste; sticky conserva espacio en el flujo y queda bajo los overlays. Revisión React sin lógica adicional, efectos ni dependencias. Sin prueba visual en navegador ni nuevos tests que reproduzcan clases CSS.
- La preparación inicial encontró la restricción de escritura de `.git`; repetida con permisos ampliados correctamente. Commit, push y SHA remoto se verifican al cerrar.
