# Registro histórico

## BILL-09 — Instagram de clientes

- Inicio: 2026-11-01, rama `int`, base `a697800`, árbol limpio. Capacidad inicial: 10 % en 5 h y 67 % en 7 d.
- Aceptación: [BILL-09](iterations.md#bill-09--instagram-de-clientes).
- Implementado: `instagram` opcional en entidad/formulario, validación, puerto y adaptador Mongo. Formulario de alta/edición y tabla muestran Instagram; los registros antiguos sin el campo siguen siendo válidos. En creación el texto se recorta y vacío se omite; en actualización el campo ausente no cambia y el vacío recortado se traduce a `$unset`.
- Validaciones: `bun run test --filter=@damaca/billing-poc`: 971 pruebas, 0 fallos; tras la limpieza de estilo, el test de schema ejecutó 33 pruebas, 0 fallos. `bun run type-check --filter=@damaca/billing-poc`: correcto. Build Turbopack estándar falló porque el entorno denegó abrir un puerto interno; `bun run build --filter=@damaca/billing-poc -- --webpack` completó correctamente. `bun run lint --staged`: 10 archivos, sin hallazgos; `git diff --cached --check`: correcto. Cache remota de Turbo no disponible.
- Sin migración ni dependencias nuevas. Commit `2ac52e8`; push a `origin/int` correcto y SHA remoto verificado (`2ac52e823891143c76baa9526763486f44b9290c`).
