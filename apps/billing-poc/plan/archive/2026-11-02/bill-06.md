# Registro histórico

## BILL-06 — Etiqueta de encargos pagados

- Inicio: 2026-11-01, rama `int`, base `3887644`, árbol limpio. Capacidad inicial: 13 % en 5 h y 67 % en 7 d; cambio acotado a una etiqueta y su planificación.
- Aceptación: [BILL-06](iterations.md#bill-06--etiqueta-de-encargos-pagados).
- Implementado: el encabezado de la sección pasa de `With payment (n)` a `Paid (n)`; se conserva el conteo de pagos vinculados y el comportamiento cerrado por defecto.
- Validación: Biome sobre los cuatro archivos modificados correcto; `bun run type-check --filter=@damaca/billing-poc` correcto; `bun run test --filter=@damaca/billing-poc`: 969 pruebas, 0 fallos. `git diff --check` correcto. Se verificó por inspección que el contador y el `<details>` permanecen intactos.
- Commit/push y SHA remoto se verifican al cerrar.
