# Billing POC — plan maestro

## Estado vigente

Commissions gestiona encargos con título obligatorio, cliente/descripción/fecha límite opcionales, conceptos libres o de productos e IVA (21 % inicial). Estado de pago manual 0/50/100 %, independiente del pago generado. Listado por fecha límite ascendente, sin fecha al final y desempate por creación descendente e identificador.

Un encargo genera un solo ingreso completo con etiqueta `Encargo`, sin modificar stock. Navegación encargo ↔ pago. Los cambios de cliente, conceptos o IVA sincronizan el pago sin factura generada; los pagos facturados se conservan y se avisa. Eliminar el pago limpia el vínculo; eliminar el encargo conserva el pago. La generación reserva un identificador de forma atómica y reutilizable; mientras está pendiente se permite reintentar pero no editar/eliminar el encargo, evitando carreras y pagos huérfanos. No se puede vaciar un encargo con pago vinculado.

## Cohesión de interfaz

Commissions reutiliza los botones de alta/edición/borrado, las acciones de pago de Eventos, el campo de búsqueda de clientes para seleccionar productos y el control segmentado de Show/Hide con tres estados visibles. El catálogo permite búsqueda y adición sucesiva sin alterar stock. Cabecera, estados vacíos, etiquetas y control de IVA siguen los componentes compartidos de billing. En las tarjetas, edición y borrado comparten fila con el título y las acciones de pago comparten fila con el importe. La etiqueta de los pagos generados es `Encargo`; no hay migración ni compatibilidad con la etiqueta anterior.

## Límites aceptados

Sin anticipos, pagos múltiples, reservas de stock ni estados de producción/entrega. Conservar arquitectura, seguridad y despliegue de [AGENTS.md](../AGENTS.md). El [workflow común](../../../plan/workflow.md) rige la entrega. Términos: [glosario](../GLOSSARY.md).

## Dudas abiertas

Ninguna para BILL-03.

## Application icons

Browser and home-screen icons use local SVG sources, a 16/32/48-pixel ICO fallback, installation PNGs and an Apple Touch Icon. Existing PWA manifests also declare an opaque maskable variant. Regenerate with `bun run icons:generate` from the repository root. Shared status and evidence: [AGW-10](../../../plan/iterations.md#agw-10--application-favicons) and [delivery log](../../../plan/iteration-log.md#agw-10-application-favicons).
