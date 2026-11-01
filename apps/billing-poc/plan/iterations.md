# Iteraciones

El [workflow raíz](../../../plan/workflow.md) es el único protocolo. El contrato documental se estableció en [AGW-01](../../../plan/iteration-log.md#agw-01-centralizar-el-flujo-y-el-contrato-documental).

## BILL-01 — Commissions

- Estado: `validated`.
- Objetivo: CRUD de encargos y generación idempotente de un pago completo vinculado.
- Rutas: `src/features/commissions`, `src/app/(dashboard)/commissions`, `src/app/api/commissions`, entidades/puertos/servicios/adaptadores y esquemas correspondientes; integración de navegación, conceptos compartidos y pagos; glosario e índice raíz.
- Dependencias: clientes, productos, pagos y calculador financiero existentes; sin nuevas dependencias.
- Aceptación: campos, orden, triestado independiente, conceptos opcionales, productos sin stock; generación sin cliente y con conceptos; reintentos/concurrencia y recuperación sin duplicados; sincronización con protección de facturas; navegación bidireccional y limpieza de vínculos; móvil, escritorio y modo oscuro.
- Validación: tests herméticos de dominio, esquemas, repositorio y helpers SWR; lint incremental, tipos, tests y build de billing; comprobación visual cuando el entorno permita autenticación.
- Evidencia: [registro BILL-01](archive/2026-11-01/bill-01-02.md#bill-01--commissions).

## BILL-02 — Cohesión de Commissions

- Estado: `validated`.
- Objetivo: compartir los patrones de interacción existentes entre Commissions y el resto de billing.
- Rutas: componentes compartidos (`PaymentActions`, selector de producto y control segmentado/BinaryToggle), `features/commissions/components`, `features/events/components/AttendeeRow`, servicio/pruebas de pagos de encargos y documentación de billing.
- Dependencias: `AddButton`, `IconButton`, iconos y badge de Eventos, `ClientQueryInput`, SWR de productos y `BinaryToggle` existentes; sin nuevas librerías.
- Aceptación: alta/edición/borrado con iconos comunes; efectivo/tarjeta/transferencia y apertura del pago mediante un único componente compartido con Eventos; producto con búsqueda y elección inequívoca que añade conceptos sin stock; 0/50/100 visibles y seleccionables; tag `Encargo` en generación; cabecera/campos/estado vacío coherentes. Conservar eventos y todas las opciones del control binario, además de reservas/reintentos de pago.
- Validación: pruebas pertinentes y suite de billing, Biome incremental, tipos y build; navegador para búsqueda, triestado e iconos en móvil/escritorio y comparación con Eventos.
- Evidencia: [BILL-02](archive/2026-11-01/bill-01-02.md#bill-02--cohesión-de-commissions).

## BILL-03 — Alineación de acciones en tarjetas

- Estado: `validated`.
- Objetivo: edición/borrado en la fila del título y pagos en la fila del importe, también en móvil.
- Rutas: `src/features/commissions/components/CommissionCard.tsx` y planificación de billing.
- Dependencias: componentes de iconos y acciones de pago existentes.
- Aceptación: ambos grupos comparten su fila correspondiente, sin cambiar interacciones ni crear componentes.
- Validación: Biome incremental, tipos, suite existente y build de billing; revisión de la estructura y clases responsive.
- Evidencia: [BILL-03](archive/2026-11-01/bill-03.md#bill-03--alineación-de-acciones-en-tarjetas).

## BILL-04 — Prepaid y agrupación por pago

- Estado: `validated`.
- Objetivo: sustituir progreso porcentual por importe prepagado informativo y separar encargos con pago en una sección cerrada por defecto.
- Rutas: entidad/esquema/adaptador y pruebas de Commission; componentes y helpers de Commissions; glosario y planificación de billing.
- Dependencias: controles compartidos existentes. Sin nuevas librerías.
- Aceptación: Prepaid en EUR no negativo, con centavos e inicial 0; cambios de Prepaid no recalculan pagos, que siguen generándose por el total. Sin conversión automática del porcentaje antiguo; registros sin importe se muestran con 0. With payment cerrada por defecto agrupa por vínculo real; reservas pendientes fuera; orden y navegación conservados. Móvil en cuatro filas según la petición y etiqueta Deadline en lista/formulario.
- Validación: tests de esquema, persistencia, separación/orden y pagos; Biome incremental, tipos, suite y build de billing; navegador para importe, agrupación y cuatro filas móviles.
- Evidencia: [BILL-04](archive/2026-11-01/bill-04.md#bill-04--prepaid-y-agrupación-por-pago).

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

## BILL-09 — Instagram de clientes

- Estado: `validated`.
- Objetivo: añadir Instagram como campo opcional de Client, editable, persistido y visible en el listado.
- Rutas: entidad y puerto de Client, schema, repositorio Mongo, formulario y tabla de clientes, pruebas y planificación de billing.
- Dependencias: patrones actuales para campos opcionales de Client; sin nuevas dependencias ni migración.
- Aceptación: creación/edición aceptan y recortan Instagram, un valor vacío lo omite y permite borrar uno existente; Mongo no guarda nullish; los clientes existentes siguen cargando; el formulario y la tabla muestran el campo.
- Validación: pruebas de esquema pertinentes, type-check, suite de billing, lint incremental y diff check.
- Evidencia: [BILL-09](iteration-log.md#bill-09--instagram-de-clientes).

## BILL-10 — Copiar Instagram desde el listado

- Estado: `validated`.
- Objetivo: copiar Instagram al portapapeles al hacer clic en el valor de la tabla de clientes.
- Rutas: `src/features/clients/components/ClientTableRow.tsx` y planificación de billing.
- Dependencias: `CopyToClipboardButton` y toast de copia existentes.
- Aceptación: valor presente copiable, confirmación coherente con email y clic que no activa la edición de la fila; valor vacío conserva el marcador actual.
- Validación: Biome incremental, type-check y pruebas de billing pertinentes; revisión del manejo de propagación y `git diff --check`.
- Evidencia: [BILL-10](iteration-log.md#bill-10--copiar-instagram-desde-el-listado).

## BILL-11 — Traducción de la interfaz al español

- Estado: `validated`.
- Objetivo: traducir al español toda la interfaz visible de billing-poc, incluidos navegación, formularios, tablas, diálogos, estados, mensajes, accesibilidad y metadatos; usar localización española para fechas.
- Rutas: `src/app/`, `src/components/`, `src/features/`, utilidades compartidas de formato de UI y planificación de billing.
- Dependencias: componentes y flujos existentes; sin cambios de comportamiento ni nuevas dependencias. Nombre aprobado por el usuario: `Commissions` se presenta como `Encargos`.
- Aceptación: ninguna cadena inglesa dirigida a usuarios permanece en la UI, salvo marcas, nombres propios, códigos/términos técnicos necesarios y contenido introducido por los usuarios; textos accesibles y errores visibles también traducidos; idioma del documento y formatos coherentes con `es-ES`.
- Validación: inventario y búsqueda residual de cadenas UI inglesas; Biome en archivos editados, type-check y build de billing; diff check. No ejecutar pruebas salvo que el usuario las solicite.
- Evidencia: [BILL-11](iteration-log.md#bill-11--traducción-de-la-interfaz-al-español).

## BILL-12 — Cocciones y plantillas

- Estado: `validated`.
- Objetivo: gestionar cocciones y sus plantillas desde una nueva página equivalente a Encargos.
- Rutas: componentes/hooks/servidor de commissions compartidos, nueva página y API de firings, `features/firings`, entidad/puerto/adaptador/schema de plantillas; navegación, integración con pagos y planificación de billing.
- Dependencias: CRUD de Encargos, acciones de pago, controles, selectores y SWR existentes; sin nuevas dependencias.
- Aceptación: título obligatorio; cliente, fecha límite y descripción opcionales; conceptos libres o copiados de plantillas; IVA inicial 21 %. Sin anticipo en Cocciones. Plantillas con solo nombre/precio, CRUD al principio de la página cerrado por defecto. Listado y modal permiten generar/abrir pago con los botones compartidos; guardar cambios antes de convertir desde el modal. Pago único con tag `Cocción`, sincronización protegida de facturas, vínculo bidireccional y limpieza al eliminar pago; sin stock ni mezcla con encargos/productos. UI responsive y modo oscuro.
- Contrato: `/api/firings` reutiliza los payloads de Encargos y su respuesta interna (`commissions`/`commission`); GET/POST/PUT/DELETE autenticados, detalle `/:id`, conversión `/:id/payment` y consulta inversa `/payment/:paymentId`. `/api/firing-templates`: GET devuelve `{ templates }`; POST `{ name, price }`, PUT `{ id, name, price }`, DELETE `{ id }`; nombres recortados no vacíos, precio finito no negativo, IDs Mongo válidos.
- Validación: pruebas de dominio/reintentos/sincronización y contratos/helpers SWR/plantillas; Biome en archivos editados, tipos, suite y build de billing; revisión visual si hay sesión accesible.

- Evidencia BILL-12: [registro y limitaciones de la suite previa](iteration-log.md#bill-12--cocciones-y-plantillas).

## BILL-13 — Reparar las pruebas de localización

- Estado: `validated`.
- Objetivo: corregir los 14 fallos previos de la suite y los defectos de localización que exponen.
- Rutas: pruebas de `PaymentActions`, `lib/utils/formatters`, helpers y pruebas de `features/events/components/eventsUi` y calendarios de eventos/ausencias; planificación de billing.
- Dependencias: localización española aceptada en BILL-11 y pruebas existentes; sin nuevas dependencias.
- Aceptación: etiquetas de pago y fechas esperadas en español; calendarios accesibles completamente en español con singular/plural correcto; fechas recurrentes sin plurales inválidos para los siete días; ausencia de fecha en español; suite completa sin fallos conservando las comprobaciones de comportamiento.
- Validación: reproducción inicial de 977 pruebas con 14 fallos; tests de regresión antes del arreglo, suite completa, lint incremental, type-check y build de billing; diff check y enlaces locales.
- Evidencia: [BILL-13](iteration-log.md#bill-13--reparar-las-pruebas-de-localización).

## BILL-14 — Cabeceras y acciones de modales

- Estado: `validated`.
- Objetivo: fijar todas las cabeceras de modales y concentrar confirmación/cierre en la parte superior.
- Rutas: `src/components/ui`, formularios y modales de `src/features`, planificación de billing.
- Dependencias: Modal, iconos, formularios y mutaciones existentes; sin nuevas dependencias.
- Aceptación: cabecera siempre visible con scroll interno; sin aceptar/cancelar al pie; tick verde junto a papelera cuando exista y cruz roja arriba; conservar validación, envío nativo, estados pendientes, navegación y subformularios. Móvil y temas claro/oscuro.
- Validación: inventario de modales, lint, tipos, suite y build de billing; revisión de accesibilidad y formularios; comprobación visual si el entorno lo permite.
- Evidencia: [BILL-14](iteration-log.md#bill-14--cabeceras-y-acciones-de-modales).
