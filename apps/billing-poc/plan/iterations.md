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

## BILL-06 — Etiqueta de encargos pagados

- Estado: `validated`.
- Objetivo: llamar Paid a la sección colapsada de encargos con un pago vinculado.
- Rutas: `src/features/commissions/components/CommissionsPageContent.tsx` y planificación de billing.
- Dependencias: agrupación existente por `paymentId`.
- Aceptación: el encabezado muestra `Paid (n)` y conserva contador, contenido y comportamiento colapsable.
- Validación: Biome incremental, tipos y suite existente de billing.
- Evidencia: [BILL-06](iteration-log.md#bill-06--etiqueta-de-encargos-pagados).

## BILL-07 — Navegación fija al hacer scroll

- Estado: `validated`.
- Objetivo: mantener visible la navegación compartida durante el scroll vertical de cualquier página.
- Rutas: `src/components/shared/NavigationBar.tsx`, `src/components/shared/PageLayout.tsx` y planificación de billing.
- Dependencias: layout y navegación existentes; sin nuevas librerías.
- Aceptación: barra sticky en móvil y escritorio, conservando ancho, margen superior, colores y posición por debajo de menús y modales. El contenedor no debe interceptar el scroll sticky.
- Validación: Biome incremental, tipos, suite y build de billing; revisión de ancestros, cobertura de páginas y capas CSS.
- Evidencia: [BILL-07](iteration-log.md#bill-07--navegación-fija-al-hacer-scroll).

## BILL-08 — Márgenes opacos de navegación

- Estado: `validated`.
- Objetivo: mantener opaco el espacio superior e inferior de la barra durante el scroll.
- Rutas: `src/components/shared/PageLayout.tsx`, `src/components/shared/NavigationBar.tsx` y planificación de billing.
- Dependencias: navegación sticky de BILL-07; sin nuevas librerías.
- Aceptación: franja sticky con fondo de página en ambos temas y padding superior/inferior permanente; contenido oculto al pasar por detrás, ancho de barra conservado y overlays por encima.
- Validación: lint staged, tipos, suite y build de billing; revisión de estructura y capas.
- Evidencia: [BILL-08](iteration-log.md#bill-08--márgenes-opacos-de-navegación).
