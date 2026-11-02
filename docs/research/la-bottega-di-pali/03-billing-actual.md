# Billing: capacidades reales y puntos de integración

Revisión de código en `7f0f247ee184b0d550e9a0f9530cdc9e5026d1cd`. No se ha consultado MongoDB de producción ni ejecutado billing contra datos reales. Las conclusiones describen implementación local, no configuración remota efectiva.

## Arquitectura y autenticación observadas

Billing es una aplicación Next.js con dominio, puertos y adaptadores Mongo separados de las rutas y componentes. Esto permite extraer casos de uso sin reescribir la interfaz administrativa. Las decisiones vigentes están en su [plan maestro](../../../apps/billing-poc/plan/master.md).

**El código actual usa Better Auth**, Google y allowlist; no NextAuth. Algunas descripciones de `AGENTS.md` conservan referencias antiguas a NextAuth y fechas inglesas, mientras que el código y el plan reflejan cambios posteriores. Para diseñar la integración se ha priorizado lo ejecutable, sin modificar esas instrucciones en esta investigación.

[Configuración de autenticación](../../../apps/billing-poc/src/lib/auth/auth.ts), líneas 1–59; [guardia API](../../../apps/billing-poc/src/lib/auth/require-auth.ts), líneas 9–28; [proxy](../../../apps/billing-poc/src/proxy.ts), líneas 4–36. El proxy deja pasar por presencia de cookie; `requireAuth` comprueba sesión y allowlist. No constituye una auditoría completa de esa autenticación.

La web pública no puede consumir sin más las APIs actuales: requieren la sesión administrativa y el proxy redirige las rutas no exceptuadas. Tampoco hay que convertir a cada comprador en usuario de la allowlist. Una identidad comercial, un cliente de facturación y una identidad administrativa son conceptos diferentes.

## Qué ya se puede reutilizar

| Capacidad | Evidencia local | Reutilización y límite |
| --- | --- | --- |
| Productos | [Entidad](../../../apps/billing-poc/src/lib/domain/entities/product.ts), líneas 1–9 | Nombre, etiqueta, precio final y stock opcional. Faltan publicación, slug, fotos, descripción, SEO, SKU y variantes comerciales. |
| Eventos | [Entidad](../../../apps/billing-poc/src/lib/domain/entities/event.ts), líneas 1–27 | Fecha/recurrencia mensual, duración, aforo, IVA, precio por plaza y asistentes. No equivale a hold de checkout. |
| Clientes | [Entidad](../../../apps/billing-poc/src/lib/domain/entities/client.ts) y [repositorio](../../../apps/billing-poc/src/lib/db/repositories/mongo-client-repository.ts) | Ficha y actividad administrativa; hace falta resolver correspondencias con compradores históricos. |
| Pagos | [Entidad](../../../apps/billing-poc/src/lib/domain/entities/payment.ts), líneas 1–80 | Ingresos/gastos, conceptos e impuestos, método y referencias a facturas. `card` etiqueta un método: no procesa un cargo bancario. |
| Venta con stock | [Reserva de stock](../../../apps/billing-poc/src/features/payments/server/payment-stock-reservation.ts) y [alta de pago](../../../apps/billing-poc/src/features/payments/server/payments-post-route.ts), líneas 59–96 | Decrementos condicionales y compensación ante error. No es una transacción de pedido, bono, aforo y cobro externo. |
| Encargos y cocciones | [Servicio](../../../apps/billing-poc/src/lib/domain/services/commission-service.ts) y [alcance vigente](../../../apps/billing-poc/plan/master.md) | Conceptos, cliente y generación de pago con reintento; útil como patrón. No añadir estados o anticipos comerciales por inferencia. |
| Ausencias | [Entidad](../../../apps/billing-poc/src/lib/domain/entities/absence.ts), líneas 1–12 | Alumno identificado por nombre y franja; no vínculo estable a matrícula o cliente. Requiere diseño específico para automatizar recuperaciones. |
| Facturas | [Generación](../../../apps/billing-poc/src/features/invoices/server/routes/generate.ts) y [contadores](../../../apps/billing-poc/src/lib/db/repositories/mongo-invoice-counter-repository.ts) | Preservar documentos y numeración; emisión de PDF no acredita cumplimiento fiscal integral. |

## Integración WordPress/WooCommerce existente

No es una sincronización bidireccional completa. La página administrativa [WordPress](../../../apps/billing-poc/src/app/(dashboard)/wordpress/page.tsx) muestra pedidos y cupones; consume WooCommerce en el servidor.

- [URLs](../../../apps/billing-poc/src/features/wordpress/server/urls.ts), líneas 3–53: endpoints `wc/v3/orders` y `wc/v3/coupons`, paginados de cinco en cinco.
- [Transporte](../../../apps/billing-poc/src/features/wordpress/server/transport.ts), líneas 16–74: endpoint/usuario/contraseña en variables privadas, Basic Auth y peticiones sin caché. Se inspeccionaron nombres y uso, nunca sus valores.
- [Pedidos](../../../apps/billing-poc/src/features/wordpress/server/routes/orders.ts): lectura paginada autenticada. [Cambio de estado](../../../apps/billing-poc/src/features/wordpress/server/routes/order-by-id.ts): actualización explícita en WooCommerce.
- [Importación de cliente](../../../apps/billing-poc/src/features/wordpress/components/WordpressBillingClientModal.tsx), líneas 83–97 y 150–196: sugerencia por nombre normalizado, selección/revisión manual y copia de nombre, teléfono y email. No establece por sí sola una correspondencia persistente y única entre IDs de ambos sistemas.
- [Cupones](../../../apps/billing-poc/src/features/wordpress/server/routes/coupons.ts): lectura y creación; existen rutas de borrado y PDF. [Botones de pago](../../../apps/billing-poc/src/features/wordpress/components/CouponPaymentButtons.tsx): permiten preparar un pago en billing; no equivalen a capturar dinero en el TPV.
- [Construcción del cupón](../../../apps/billing-poc/src/lib/domain/services/wordpress-coupon.ts), líneas 28–49: descuento fijo de carrito, límite de uso uno, conversión de importe con IVA del 21 % a base y vencimiento a medianoche. La migración debe preservar semántica fiscal, zona horaria y momento exacto de vencimiento; no copiar solo el valor numérico.

No se ha localizado, en las rutas y servicios revisados, un proceso que reciba automáticamente cada venta web, reserve aforo, vincule de forma idempotente cliente/pedido/pago y concilie la devolución. La navegación administrativa conserva pasos manuales. La configuración de otros plugins o automatizaciones externas no se conoce.

## Hallazgos que impiden exponer los flujos actuales como API comercial

### Aforo: lectura y escritura separadas

La ruta de [alta de asistente](../../../apps/billing-poc/src/features/events/server/attendees-route.ts), líneas 38–73, lee el evento, suma plazas y rechaza excesos. El [repositorio](../../../apps/billing-poc/src/lib/db/repositories/mongo-event-repository.ts), líneas 135–153, escribe con condición de ID y ausencia del mismo cliente, pero sin condición de capacidad.

**Inferencia de concurrencia:** con una plaza libre, dos clientes distintos pueden leer simultáneamente esa disponibilidad, pasar la comprobación y ser insertados. La protección de duplicados del mismo cliente no evita esta carrera. La [edición de asistentes](../../../apps/billing-poc/src/features/events/server/attendee-route.ts), líneas 39–112, también comprueba sobre una lectura previa. No se ha reproducido contra producción ni observado un caso real: es un riesgo demostrado por la secuencia de código.

### Stock y pago no comparten una transacción completa

[Productos](../../../apps/billing-poc/src/lib/db/repositories/mongo-product-repository.ts), líneas 48–74 y 142–151, usa un decremento condicionado al stock suficiente. Es una buena base. Sin embargo, encadenar varios productos y después crear el pago con compensación no cubre un cierre del proceso entre pasos ni hace atómico el cobro externo. Tampoco se debe asumir que una nueva etiqueta de venta web activará la reserva: las [etiquetas admitidas](../../../apps/billing-poc/src/features/payments/server/product-sale-tags.ts) están enumeradas.

### Índices y referencias comerciales

Los [índices actuales](../../../apps/billing-poc/src/lib/db/repositories/ensure-indexes.ts), líneas 9–88, cubren consultas y unicidad de algunos vínculos administrativos. No incluyen IDs de transacción de pasarela, eventos entrantes, pedidos externos o canjes comerciales. El bootstrap registra errores de creación y continúa; para futuros invariantes de comercio, una comprobación explícita debe impedir ventas si falta un índice crítico.

### Modelo de cliente y recurrencia

Un comprador puede reservar varias plazas y volver a comprar para la misma convocatoria. El array de asistentes actual agrupa por cliente; no identifica cada reserva/pedido. Las clases de varias sesiones tampoco deben reducirse a cobrar varias veces el mismo bono mensual. Ausencias por nombre requieren correspondencia revisada antes de dar acceso público.

## Mapa de automatización para eliminar duplicaciones

| Acción | Trabajo manual actual o hueco | Objetivo propuesto |
| --- | --- | --- |
| Publicar taller | Catálogo web y evento administrativo separados. | Crear experiencia y convocatoria una vez en billing y publicar su proyección. |
| Venta online | Pedido WooCommerce y gestión administrativa sin vínculo integral localizado. | Crear reserva/pedido y enlazar el cobro confirmado con un único movimiento de billing. |
| Cliente | Importación revisada con coincidencia por nombre. | Identificador de origen y correspondencias explícitas; no fusionar por nombre. |
| Bono online | Emisión manual comunicada en la web. | Emisión tras cobro, envío reintentable y un único canje válido. |
| Venta física | Herramientas administrativas existentes. | Usar la misma operación de aforo/stock/bonos que la web. |
| Devolución | Cambiar estado de pedido no prueba reembolso bancario. | Solicitud y resultado de pasarela, reserva liberada y tratamiento contable vinculado. |
| Consulta | Formulario/contacto externo. | Solicitud en billing y conversión a encargo/cocción sin reintroducir datos. |

La aceptación futura debería medirse en pasos administrativos eliminados por venta y en discrepancias de conciliación, además de páginas construidas.
