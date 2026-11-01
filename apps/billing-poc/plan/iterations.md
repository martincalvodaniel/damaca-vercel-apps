# Iteraciones

El [workflow raíz](../../../plan/workflow.md) es el único protocolo. El contrato documental se estableció en [AGW-01](../../../plan/iteration-log.md#agw-01-centralizar-el-flujo-y-el-contrato-documental).

## BILL-01 — Commissions

- Estado: `validated`.
- Objetivo: CRUD de encargos y generación idempotente de un pago completo vinculado.
- Rutas: `src/features/commissions`, `src/app/(dashboard)/commissions`, `src/app/api/commissions`, entidades/puertos/servicios/adaptadores y esquemas correspondientes; integración de navegación, conceptos compartidos y pagos; glosario e índice raíz.
- Dependencias: clientes, productos, pagos y calculador financiero existentes; sin nuevas dependencias.
- Aceptación: campos, orden, triestado independiente, conceptos opcionales, productos sin stock; generación sin cliente y con conceptos; reintentos/concurrencia y recuperación sin duplicados; sincronización con protección de facturas; navegación bidireccional y limpieza de vínculos; móvil, escritorio y modo oscuro.
- Validación: tests herméticos de dominio, esquemas, repositorio y helpers SWR; lint incremental, tipos, tests y build de billing; comprobación visual cuando el entorno permita autenticación.
- Evidencia: [registro BILL-01](iteration-log.md#bill-01--commissions).
