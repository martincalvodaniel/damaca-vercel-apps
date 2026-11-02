# Registro histórico

## BILL-10 — Copiar Instagram desde el listado

- Inicio: 2026-11-01, rama `int`, base `d61361e`, árbol limpio. Capacidad inicial: 9 % en 5 h y 66 % en 7 d.
- Aceptación: [BILL-10](iterations.md#bill-10--copiar-instagram-desde-el-listado).
- Implementado: Instagram usa `CopyToClipboardButton` con el mismo toast y confirmación que email; `stopPropagation` evita abrir la edición de la fila al copiar. Sin valor se conserva `—`.
- Validación: `bunx biome check apps/billing-poc/src/features/clients/components/ClientTableRow.tsx`: correcto; `bun run type-check --filter=@damaca/billing-poc`: correcto; `bun run test --filter=@damaca/billing-poc`: 971 pruebas, 0 fallos; `bun run build --filter=@damaca/billing-poc -- --webpack`: correcto; `git diff --check`: correcto. Sin prueba de navegador; el comportamiento reutiliza el componente de copia ya usado por email.
- Commit `d480743`; push a `origin/int` correcto y SHA remoto verificado (`d480743dfd30fbc60358768cd2c4b4e8f615b0e6`).
