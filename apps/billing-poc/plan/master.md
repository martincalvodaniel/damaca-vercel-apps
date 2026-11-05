# Billing POC — plan maestro

## Estado vigente

Commissions gestiona encargos con título obligatorio, cliente/descripción/fecha límite opcionales, conceptos libres o de productos e IVA (21 % inicial). Importe prepagado manual (`Prepaid`, EUR), inicial 0 e independiente del pago generado: no se descuenta del total. Listado por fecha límite ascendente, sin fecha al final y desempate por creación descendente e identificador.

Un encargo genera un solo ingreso completo con etiqueta `Encargo`, sin modificar stock. Navegación encargo ↔ pago. Los cambios de cliente, conceptos o IVA sincronizan el pago sin factura generada; los pagos facturados se conservan y se avisa. Eliminar el pago limpia el vínculo; eliminar el encargo conserva el pago. La generación reserva un identificador de forma atómica y reutilizable; mientras está pendiente se permite reintentar pero no editar/eliminar el encargo, evitando carreras y pagos huérfanos. No se puede vaciar un encargo con pago vinculado.

## Cohesión de interfaz

Todas las modales conservan la cabecera visible y desplazan solo su contenido. La confirmación usa un tick verde en la cabecera, junto a la papelera si existe; el cierre usa la cruz roja superior. No hay botones de aceptar/cancelar al pie. Se mantienen validación, estados pendientes y acciones específicas de cada flujo.

La navegación compartida permanece visible al hacer scroll vertical en todas las páginas, tanto en móvil como en escritorio. Conserva el ancho del contenido y una franja opaca con padding superior e inferior que oculta el contenido al pasar por detrás; menús y modales se muestran por encima.

Commissions reutiliza los botones de alta/edición/borrado, las acciones de pago de Eventos, el campo de búsqueda de clientes para seleccionar productos y los controles monetarios compartidos. El catálogo permite búsqueda y adición sucesiva sin alterar stock. Cabecera, estados vacíos, etiquetas y control de IVA siguen los componentes compartidos de billing. Las tarjetas móviles tienen cuatro filas: título y edición/borrado; cliente; Deadline y Prepaid; Total y acciones de pago. Los encargos con `paymentId` aparecen en una sección Paid cerrada por defecto; las reservas pendientes permanecen en la lista principal. Los datos de cada tarjeta se presentan en formato «Etiqueta: valor», sin salto de línea entre etiqueta y contenido. Ambas listas conservan el orden por fecha límite. La etiqueta de los pagos generados es `Encargo`; no hay migración ni compatibilidad con la etiqueta anterior.

## Límites aceptados

Sin anticipos, pagos múltiples, reservas de stock ni estados de producción/entrega. Conservar arquitectura, seguridad y despliegue de [AGENTS.md](../AGENTS.md). El [workflow común](../../../plan/workflow.md) rige la entrega. Términos: [glosario](../GLOSSARY.md).

## Dudas abiertas

Ninguna para BILL-14.

## Application icons

Browser and home-screen icons use local SVG sources, a 16/32/48-pixel ICO fallback, installation PNGs and an Apple Touch Icon. Existing PWA manifests also declare an opaque maskable variant. Regenerate with `bun run icons:generate` from the repository root. Shared status and evidence: [AGW-10](../../../plan/iterations.md#agw-10--application-favicons) and [delivery log](../../../plan/iteration-log.md#agw-10-application-favicons).

## Cocciones

Cocciones (`/firings`) comparte los patrones de Encargos con datos separados: título, cliente/fecha límite/descripción opcionales, conceptos e IVA (21 % inicial). No muestra anticipo. Plantillas independientes con nombre y precio en EUR (IVA incluido), gestionadas en una sección al inicio cerrada por defecto. Los conceptos copian los valores de la plantilla sin referencia a productos ni efectos de stock. Editar/eliminar plantillas no modifica cocciones previas.

La conversión genera un pago completo único con etiqueta `Cocción`, con las mismas garantías de reintento, sincronización y protección de facturas de Encargos. Acciones compartidas en listado y modal; el modal guarda antes de convertir. Alcance y aceptación: [BILL-12](iterations.md#bill-12--cocciones-y-plantillas).

## Localización y pruebas

La UI usa español y fechas `es-ES`. Los calendarios anuncian ausencias, recuperaciones y eventos en español, con singular/plural; las fechas recurrentes muestran «los lunes», «los martes», …, «los sábados» y «los domingos». Un evento sin fecha muestra «Sin fecha». Las pruebas deben verificar estas salidas sin volver a introducir textos ingleses. Reparación: [BILL-13](iterations.md#bill-13--reparar-las-pruebas-de-localización).

## Ficha de cliente

La ruta `/clients/[id]` muestra los datos del cliente y permite editarlos. Los listados de clientes y pagos navegan a esta ficha. Sobre tres secciones de actividad cerradas por defecto, con contadores de pagos, encargos y cocciones, se muestra el resumen financiero de todo el historial del cliente (ingresos, gastos, saldo y desglose por etiqueta). Los encargos y cocciones incluyen los ya pagados; sus importes no se suman de nuevo a los pagos. Alcance: [BILL-15](iterations.md#bill-15--página-de-cliente).

## Cabeceras y altas de página

Las altas principales se presentan mediante el botón + compartido en la navegación. Clientes coloca el + a la izquierda de su buscador, también en navegación. Mes conserva el + junto a sus controles y también lo ofrece en la navegación; ambos abren el mismo formulario. Las páginas no repiten títulos/subtítulos descriptivos bajo la navegación; mantienen selectores y filtros. Los controles mensuales usan «Compacto» y «Todo», y Año se presenta en español. Las altas contextuales de modales y plantillas conservan su ubicación. Alcance: [BILL-16](iterations.md#bill-16--simplificar-cabeceras-y-altas).

En Cocciones, la sección Pagadas permanece cerrada por defecto y se sitúa antes de las vigentes. Encargos conserva su orden. Facturas presenta sus listados y el flujo de reducción de numeración en español. Alcance: [BILL-17](iterations.md#bill-17--alta-mensual-orden-de-cocciones-y-traducción-de-facturas).

En escritorio (`xl`), la navegación oculta Billing y el título de página y muestra el menú antes de los controles propios de la página, en una fila inferior cuando existen. En móvil conserva la disposición de título, acciones y menú. Alcance: [BILL-18](iterations.md#bill-18--navegación-de-escritorio).

Ausencias, Eventos, Mes, Productos y Año integran sus controles iniciales en el bloque fijo de navegación en escritorio (`xl`), debajo del menú y las altas. Incluye filtros/acciones de productos, selector de plantillas de Mes y controles de periodos/gráficos. En móvil, esos controles permanecen bajo la navegación y se desplazan con el contenido. Se mantiene una sola instancia de cada control. Alcance: [BILL-19](iterations.md#bill-19--controles-de-cabecera-en-navegación-de-escritorio).

En escritorio, las altas de Eventos y Productos comparten fila con sus controles iniciales; los filtros de Productos se integran en esa misma banda. Mes muestra solo el + de su fila de controles en escritorio. Las altas superiores permanecen visibles en móvil y el + local de Mes se conserva, manteniendo los dos botones móviles. Alcance: [BILL-20](iterations.md#bill-20--una-fila-de-controles-en-escritorio).

## Ausencias y actividad de cliente

Ausencias usa los encabezados «Ausencias», «Recuperaciones» y «Última ausencia». Los calendarios de Ausencias/Eventos muestran lun/mar/mié/jue/vie/sáb/dom. Los modales de ausencias aprovechan la altura disponible; editar no enfoca el nombre del alumno ni solicita el teclado. Campos, franjas y confirmaciones en español.

El listado de clientes ofrece edición mediante lápiz antes de la papelera. La ficha reutiliza la tabla de pagos mensual sobre todo el historial del cliente: fecha completa, mismas columnas, filtros, orden y acciones; la exportación incluye ese historial completo. Las secciones de actividad siguen cerradas inicialmente. Alcance: [BILL-21](iterations.md#bill-21--ausencias-localizadas-y-tabla-de-pagos-del-cliente).

## Investigación de integración con La Bottega

La investigación de la web pública, la integración WooCommerce existente y las alternativas futuras se registra de forma transversal en [AGW-16](../../../plan/iterations.md#agw-16--investigación-de-la-bottega-y-su-integración-con-billing). Consultar [el dossier](../../../docs/research/la-bottega-di-pali/README.md) antes de definir alcance de implementación. No modifica las decisiones aceptadas ni las capacidades actuales de billing.

La publicación Vercel pasa a ser manual bajo petición mediante `git.deploymentEnabled: false`. Registro transversal: [AGW-17](../../../plan/iterations.md#agw-17--manual-vercel-deployments).

## Fechas de eventos y favicon

El listado de eventos separa Fecha y Hora (HH:mm). Fecha usa tres letras del día semanal y mes, con día numérico solo para eventos puntuales; el día semanal se calcula con el año real, que no se muestra. Los recurrentes ignoran su fecha de anclaje. Los datos parciales no inventan día semanal. Billing recupera el sello rojo original de La Bottega di Pali desde Git; la fuente SVG incorpora el original recuperado para conservarlo al regenerar iconos. Alcance: [BILL-22](iterations.md#bill-22--fecha-y-hora-de-eventos-y-favicon-original).

El menú desplegable usa el mismo breakpoint `xl` que su botón: disponible también en tablet/escritorio estrecho, por debajo de 1280 px. Alcance: [BILL-23](iterations.md#bill-23--menú-de-navegación-en-anchuras-intermedias).
