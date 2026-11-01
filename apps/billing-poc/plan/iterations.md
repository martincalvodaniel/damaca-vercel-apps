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

## BILL-02 — Cohesión de Commissions

- Estado: `validated`.
- Objetivo: compartir los patrones de interacción existentes entre Commissions y el resto de billing.
- Rutas: componentes compartidos (`PaymentActions`, selector de producto y control segmentado/BinaryToggle), `features/commissions/components`, `features/events/components/AttendeeRow`, servicio/pruebas de pagos de encargos y documentación de billing.
- Dependencias: `AddButton`, `IconButton`, iconos y badge de Eventos, `ClientQueryInput`, SWR de productos y `BinaryToggle` existentes; sin nuevas librerías.
- Aceptación: alta/edición/borrado con iconos comunes; efectivo/tarjeta/transferencia y apertura del pago mediante un único componente compartido con Eventos; producto con búsqueda y elección inequívoca que añade conceptos sin stock; 0/50/100 visibles y seleccionables; tag `Encargo` en generación; cabecera/campos/estado vacío coherentes. Conservar eventos y todas las opciones del control binario, además de reservas/reintentos de pago.
- Validación: pruebas pertinentes y suite de billing, Biome incremental, tipos y build; navegador para búsqueda, triestado e iconos en móvil/escritorio y comparación con Eventos.
- Evidencia: [BILL-02](iteration-log.md#bill-02--cohesión-de-commissions).

## BILL-03 — Alineación de acciones en tarjetas

- Estado: `validated`.
- Objetivo: edición/borrado en la fila del título y pagos en la fila del importe, también en móvil.
- Rutas: `src/features/commissions/components/CommissionCard.tsx` y planificación de billing.
- Dependencias: componentes de iconos y acciones de pago existentes.
- Aceptación: ambos grupos comparten su fila correspondiente, sin cambiar interacciones ni crear componentes.
- Validación: Biome incremental, tipos, suite existente y build de billing; revisión de la estructura y clases responsive.
- Evidencia: [BILL-03](iteration-log.md#bill-03--alineación-de-acciones-en-tarjetas).
