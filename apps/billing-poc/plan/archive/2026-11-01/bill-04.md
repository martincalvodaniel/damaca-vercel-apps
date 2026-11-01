# Registro archivado

## BILL-04 — Prepaid y agrupación por pago

- Inicio: 2026-11-01, rama `int`, base `83bf72a`, árbol limpio. Capacidad inicial: 35 % en 5 h y 71 % en 7 d; margen estimado suficiente para el corte completo y las reservas.
- Decisión del usuario: Prepaid informativo; generar el pago por el total, sin descontar el anticipo.
- Aceptación: [BILL-04](../../iterations.md#bill-04--prepaid-y-agrupación-por-pago).
- Implementado: `prepaidAmount` reemplaza el porcentaje en entidad, esquema, persistencia, formulario y tarjetas. Importe EUR finito no negativo, con un máximo de dos decimales e inicial 0. Los registros sin importe se muestran con 0; el porcentaje antiguo no se convierte ni se expone, y se elimina al editar. Prepaid no participa en cálculos ni sincronización de pagos.
- Listado: separación por `paymentId`, conservando el orden por Deadline dentro de ambos grupos; las reservas pendientes permanecen en la lista principal. Sección nativa `details` With payment cerrada inicialmente, con contador y la misma tarjeta reutilizada; los enlaces siguen abriendo el detalle aunque el grupo esté cerrado.
- Móvil: cabecera título + iconos; cliente a ancho completo; Deadline y Prepaid en dos columnas; Total y acciones en una última fila completa. Deadline también renombrado en el formulario. Controles monetarios compartidos, sin nuevas dependencias.
- Validaciones: `bun run test --filter=@damaca/billing-poc`: 969 pruebas, 0 fallos, 93 archivos; tipos correctos. Biome explícito sobre los 12 archivos TypeScript nuevos/editados: sin hallazgos. Build final con `bun run build --filter=@damaca/billing-poc -- --webpack`: correcto. `bun run lint --staged`: 16 archivos, sin hallazgos; `git diff --cached --check`: correcto.
- Navegador/API reales: base desechable `billing_prepaid_qa_20261101`. Verificadas cuatro filas a 390×844 y escritorio a 1440×900, Prepaid con céntimos guardado desde formulario (35,75 €), generación por el total (121 €), traslado inmediato a With payment y apertura del pago, contador actualizado y sección cerrada tras recargar. Cambio posterior de Prepaid a 40,25 € por API devolvió `paymentSync: unchanged` y conservó total y timestamp del pago. Orden por fecha dentro de la sección expandida correcto. Consola sin warnings/errores. Base temporal eliminada y servidores detenidos.
- Evidencia: [cuatro filas móviles y sección cerrada](../../evidence/commissions-prepaid-mobile.jpg), [grupos en escritorio](../../evidence/commissions-prepaid-groups.jpg). El bloque generado por Next se retiró del diff.
- Capacidad antes del cierre: 24 % en 5 h y 69 % en 7 d. Commit, push y SHA remoto se verifican al cerrar y se comunican en el cierre; este registro no anticipa publicación.
