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

## BILL-04 — Prepaid y agrupación por pago

- Estado: `validated`.
- Objetivo: sustituir progreso porcentual por importe prepagado informativo y separar encargos con pago en una sección cerrada por defecto.
- Rutas: entidad/esquema/adaptador y pruebas de Commission; componentes y helpers de Commissions; glosario y planificación de billing.
- Dependencias: controles compartidos existentes. Sin nuevas librerías.
- Aceptación: Prepaid en EUR no negativo, con centavos e inicial 0; cambios de Prepaid no recalculan pagos, que siguen generándose por el total. Sin conversión automática del porcentaje antiguo; registros sin importe se muestran con 0. With payment cerrada por defecto agrupa por vínculo real; reservas pendientes fuera; orden y navegación conservados. Móvil en cuatro filas según la petición y etiqueta Deadline en lista/formulario.
- Validación: tests de esquema, persistencia, separación/orden y pagos; Biome incremental, tipos, suite y build de billing; navegador para importe, agrupación y cuatro filas móviles.
- Evidencia: [BILL-04](iteration-log.md#bill-04--prepaid-y-agrupación-por-pago).

## BILL-05 — Etiquetas e importes en línea

- Estado: `validated`.
- Objetivo: mostrar Client, Deadline, Prepaid y Total como «Etiqueta: valor» en las tarjetas.
- Rutas: `src/features/commissions/components/CommissionCard.tsx` y planificación de billing.
- Dependencias: estilos y componentes existentes.
- Aceptación: etiquetas con dos puntos y valores en línea; conservar las cuatro filas móviles, iconos y sección de encargos con pago.
- Validación: Biome incremental, tipos, suite y build de billing; revisión estática del marcado inline.
- Evidencia: [BILL-05](iteration-log.md#bill-05--etiquetas-e-importes-en-línea).
