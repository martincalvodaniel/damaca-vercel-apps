# Billing POC — plan maestro

## Estado vigente

Commissions gestiona encargos con título obligatorio, cliente/descripción/fecha límite opcionales, conceptos libres o de productos e IVA (21 % inicial). Importe prepagado manual (`Prepaid`, EUR), inicial 0 e independiente del pago generado: no se descuenta del total. Listado por fecha límite ascendente, sin fecha al final y desempate por creación descendente e identificador.

Un encargo genera un solo ingreso completo con etiqueta `Encargo`, sin modificar stock. Navegación encargo ↔ pago. Los cambios de cliente, conceptos o IVA sincronizan el pago sin factura generada; los pagos facturados se conservan y se avisa. Eliminar el pago limpia el vínculo; eliminar el encargo conserva el pago. La generación reserva un identificador de forma atómica y reutilizable; mientras está pendiente se permite reintentar pero no editar/eliminar el encargo, evitando carreras y pagos huérfanos. No se puede vaciar un encargo con pago vinculado.

## Cohesión de interfaz

La navegación compartida permanece visible al hacer scroll vertical en todas las páginas, tanto en móvil como en escritorio. Conserva el ancho del contenido y una franja opaca con padding superior e inferior que oculta el contenido al pasar por detrás; menús y modales se muestran por encima.

Commissions reutiliza los botones de alta/edición/borrado, las acciones de pago de Eventos, el campo de búsqueda de clientes para seleccionar productos y los controles monetarios compartidos. El catálogo permite búsqueda y adición sucesiva sin alterar stock. Cabecera, estados vacíos, etiquetas y control de IVA siguen los componentes compartidos de billing. Las tarjetas móviles tienen cuatro filas: título y edición/borrado; cliente; Deadline y Prepaid; Total y acciones de pago. Los encargos con `paymentId` aparecen en una sección Paid cerrada por defecto; las reservas pendientes permanecen en la lista principal. Los datos de cada tarjeta se presentan en formato «Etiqueta: valor», sin salto de línea entre etiqueta y contenido. Ambas listas conservan el orden por fecha límite. La etiqueta de los pagos generados es `Encargo`; no hay migración ni compatibilidad con la etiqueta anterior.

## Límites aceptados

Sin anticipos, pagos múltiples, reservas de stock ni estados de producción/entrega. Conservar arquitectura, seguridad y despliegue de [AGENTS.md](../AGENTS.md). El [workflow común](../../../plan/workflow.md) rige la entrega. Términos: [glosario](../GLOSSARY.md).

## Dudas abiertas

Ninguna para BILL-05.

## Application icons

Browser and home-screen icons use local SVG sources, a 16/32/48-pixel ICO fallback, installation PNGs and an Apple Touch Icon. Existing PWA manifests also declare an opaque maskable variant. Regenerate with `bun run icons:generate` from the repository root. Shared status and evidence: [AGW-10](../../../plan/iterations.md#agw-10--application-favicons) and [delivery log](../../../plan/iteration-log.md#agw-10-application-favicons).
