# Datos, productos y reservas

Propuesta conceptual, no esquema definitivo ni migración autorizada. La situación real de billing está en [03](03-billing-actual.md); responsabilidades y canales, en [04](04-arquitectura-e-integracion.md).

## Recomendación de base de datos

**Para este proyecto, mantendría MongoDB inicialmente.** Ya sostiene billing y evita cambiar simultáneamente escaparate, checkout, integración y persistencia. El volumen público descubierto no demuestra necesidad de sustituirla. Su uso queda condicionado a índices críticos verificados, despliegue que soporte transacciones y pruebas concurrentes del dominio comercial.

**Para un desarrollo completamente nuevo elegiría PostgreSQL** por las relaciones entre pedidos, líneas, reservas, cobros, bonos, devoluciones y movimientos; facilita expresar restricciones y realizar consultas de conciliación. No garantiza por sí solo un aforo correcto: el patrón de transacción y bloqueo también debe diseñarse.

| Criterio | MongoDB | PostgreSQL |
| --- | --- | --- |
| Reutilización actual | Alta; adaptadores, operación y conocimiento existentes. | Implica nueva persistencia y operación; o migración más amplia. |
| Catálogo editorial | Documentos flexibles, fotos/atributos embebidos. | Relaciones y JSON cuando se necesite flexibilidad. |
| Última plaza/stock | Actualización condicional atómica; transacción para varios documentos. | UPDATE condicionado o bloqueo de fila dentro de transacción. |
| Reservas de recursos con solapamiento | Requiere modelado y coordinación específicos. | Rangos y restricciones de exclusión resultan útiles para recursos exclusivos. |
| Referencias entre entidades | Validación del dominio y transacciones; sin asumir claves foráneas relacionales. | Claves foráneas, unicidad y restricciones declarativas. |
| Conciliación/informes | Viable mediante agregaciones; más cuidado con duplicación y referencias. | SQL y joins encajan bien con la naturaleza relacional. |
| Operación en Vercel | Reutilizar conexiones y dimensionar pool/latencia/región. | También requiere conexión y pool adecuados. |
| Coste | No es necesariamente cero por existir ya; backups y carga importan. | Otra base tampoco es necesariamente cara; requiere presupuesto real. |

Fuentes técnicas: [atomicidad MongoDB](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/), [transacciones MongoDB](https://www.mongodb.com/docs/manual/core/transactions/), [bloqueos PostgreSQL](https://www.postgresql.org/docs/current/explicit-locking.html) y [restricciones PostgreSQL](https://www.postgresql.org/docs/current/ddl-constraints.html). La preferencia por una u otra es juicio de diseño aplicado al repositorio.

No propondría Redis como fuente canónica de reservas ni una base independiente editable para cada canal. Tampoco una segunda base PostgreSQL solo para duplicar los productos de Mongo. Si se decide PostgreSQL, debe ser propietario de un dominio completo; billing consumiría sus hechos, conservando el histórico contable que corresponda y asumiendo consistencia eventual entre dominios.

## Modelo conceptual mínimo

Los nombres técnicos siguientes están en inglés por convención del monorepo. Son entidades propuestas, no tablas o colecciones ya implementadas.

| Entidad | Responsabilidad y campos importantes |
| --- | --- |
| `Experience` | Taller reusable: título, slug, descripción, fotos, categoría, duración orientativa, inclusiones, publicación y política. |
| `Session` | Convocatoria concreta: experiencia, inicio/fin, zona horaria, capacidad, mínimos, precio/IVA vigentes y estado de venta. |
| `ClassEnrollment` | Matrícula de un alumno en un grupo/mes; sesiones concretas incluidas, precio del conjunto y estado. |
| `Product` / `ProductVariant` | Artículo físico vendible: SKU, atributos, precio, stock controlado o no, publicación. No usar stock de piezas como aforo. |
| `Order` / `OrderLine` | Compromiso comercial, canal, comprador, referencias de origen, moneda y copia inmutable de conceptos/precios/impuestos/política. |
| `Reservation` | Plazas o unidades comprometidas por una línea; cantidad, estado, vencimiento del hold y relación con pedido. |
| `PaymentAttempt` | Intento en pasarela, ID externo único, cantidad/moneda y estado conocido. Puede haber varios intentos por pedido. |
| `Refund` | Importe/líneas/plazas afectados, intento/cobro de origen y resultado de devolución. |
| `GiftVoucher` / `VoucherRedemption` | Importe emitido, vencimiento, restricciones, código protegido y operación de canje; política de uso único o saldo explícita. |
| `CustomerLink` | Correspondencia entre comprador, cliente billing e identidad anterior de WooCommerce, sin fusionar por nombre. |
| `IncomingEvent` | Notificación de pasarela persistida y deduplicada; resultado del procesamiento. |
| `OutboxJob` | Trabajo pendiente: enlace contable, envío, reembolso o reconciliación; reintentos y último error. |
| `ContentPage` / `MediaAsset` | Texto/fotos públicos con borrador/publicación; originales y derivados. |
| `Inquiry` | Consulta de contacto o presupuesto y conversión a encargo/cocción, si se incluye esa automatización. |

Un pedido puede contener varias reservas; un comprador puede reservar para varios asistentes. Un cliente puede repetir compra para la misma sesión. Un bono mensual puede incluir varias sesiones pero un solo precio. No imponer el array de asistentes actual como identidad de todas esas operaciones.

## Tiempo, moneda e histórico

Guardar inicio/fin como instantes inequívocos y conservar `Europe/Madrid` para presentación y recurrencia. Expandir calendarios mensuales con fechas concretas y festivos/exclusiones; comprobar cambios de horario de verano. Las cadenas actuales de WooCommerce sin año requieren revisión humana antes de convertirlas.

Para nuevos importes, preferir céntimos enteros en EUR; cálculos de IVA y descuentos con regla de redondeo definida y distribución determinista por línea. Conservar snapshots de nombre, precio, IVA, descuento y términos aceptados. Editar el precio del catálogo no modifica un pedido histórico. El modelo actual de billing usa números en euros: diseñar un adaptador explícito y no reinterpretar sus registros como céntimos.

Separar fecha de compra, fecha de cobro, fecha del servicio y fecha de factura. Las métricas de venta, caja y facturación no se deducen del mismo campo.

## Reserva concurrente y vencimiento

Invariante principal: **plazas confirmadas + holds activos ≤ capacidad**. También se aplica a ventas manuales, cambios, cancelaciones y reducción de aforo. No basta con validar el formulario ni contar primero y escribir después.

Propuesta para Mongo: transacción que actualice condicionalmente el contador/documento de la sesión y cree el hold/pedido, con comprobación de versión o disponibilidad dentro de la propia escritura. Concurrencia sobre la misma sesión debe provocar conflicto/reintento o rechazo, nunca dos éxitos sobre una última plaza. Para varias sesiones/productos/bono en el carrito, transacción local que comprometa todos o ninguno. Ordenar recursos de forma determinista, limitar reintentos y no mantener abierta la transacción durante el pago.

La liberación es una transición idempotente de hold activo a vencido/cancelado y actualización de contadores en la misma transacción. Si se usan contadores, cada cambio debe preservar el invariante; no recalcularlos con escrituras concurrentes sin protección. Un worker persistente procesa vencimientos y los comandos de compra reconcilian holds vencidos de los recursos que van a usar. Los retrasos deben poder reducir temporalmente disponibilidad, nunca aumentar capacidad por duplicado.

**No usar TTL como reloj de negocio.** Mongo elimina documentos caducados en segundo plano y no garantiza la eliminación inmediata. TTL puede limpiar datos efímeros ya resueltos; no liberar una plaza mediante la desaparición de su único registro de auditoría. [Documentación TTL](https://www.mongodb.com/docs/manual/core/index-ttl/).

En PostgreSQL, la alternativa sería una transacción que bloquee/actualice los recursos correspondientes, cree reservas y confirme los cambios conjuntamente. Para un horno o espacio exclusivo por franja podría usarse una restricción de no solapamiento; no resuelve automáticamente capacidad mayor que uno ni calendarios de clase.

## Pago, reserva y contabilidad: estados separados

| Objeto | Estados conceptuales posibles | Regla |
| --- | --- | --- |
| Pedido | Borrador, pendiente, confirmado, cancelado, devolución parcial/completa. | Conserva historial; no representa directamente el estado del banco. |
| Reserva | Hold, confirmada, vencida, cancelada. | Una devolución puede implicar o no liberar plaza según el caso acordado. |
| Intento de pago | Creado, pendiente, confirmado, fallido, resultado desconocido. | Un timeout no prueba un fracaso. |
| Devolución | Solicitada, pendiente, confirmada, fallida. | No declarar dinero devuelto al solicitarlo. |
| Registro en billing | Pendiente de vincular, registrado, error de conciliación. | Una notificación repetida no genera otro ingreso. |
| Entrega del bono/email | Pendiente, enviado, error, reintentado. | El fallo de entrega no borra el cobro. |

Cuando el pago llega después de vencer un hold, no asignar la plaza a ciegas. Intentar una nueva asignación atómica; si ya no hay capacidad, dejar incidencia visible y aplicar devolución o alternativa acordada. El reintento de checkout debe recuperar el pedido/intento existente cuando corresponda.

No hay transacción ACID que abarque Mongo/PostgreSQL y el banco. Persistir las intenciones y referencias, verificar notificaciones, reintentar y conciliar. Como referencia de comportamiento asíncrono, Stripe documenta que un evento puede recibirse más de una vez y que la redirección no sustituye la confirmación de servidor; eso no demuestra la configuración actual de Redsys. [Webhooks](https://docs.stripe.com/webhooks), [fulfillment](https://docs.stripe.com/checkout/fulfillment).

## Bonos: decisión de producto y fiscalidad

El comportamiento publicado es de un solo canje: comprar algo más barato no deja saldo utilizable en otra compra. Una frase del producto menciona usar el restante para otro taller, pero lo limita a una sola compra. Debe aclararse en la interfaz antes de automatizarlo.

Un bono nuevo se emite solo una vez por línea comprada y cobrada. El canje debe reservar su aplicación durante el checkout y consumirse atómicamente con la confirmación. Si dos personas usan el mismo código, como máximo un pedido puede consumirlo. Definir qué ocurre con cancelación, devolución y expiración durante un pago. Los códigos físicos y online comparten la misma autoridad.

Si se quiere saldo multicanje, usar un libro de movimientos y saldo derivado/validado, sin sobrescribir simplemente un importe. No migrar cupones netos a saldo bruto copiando cifras. La configuración actual convierte importe con IVA a descuento neto con un tipo fijo; su equivalencia debe probarse por carrito y tratamiento fiscal.

La [resolución de la DGT sobre bonos](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2018-18094) distingue univalentes y polivalentes. Clasificación, devengo y reflejo contable de estos bonos concretos quedan pendientes de gestoría: no asumir que todo canje es un nuevo ingreso cobrado ni que la venta del bono usa siempre el mismo tratamiento.

## Índices e invariantes a validar antes del lanzamiento

- Unicidad de referencia de pedido de origen por sistema y entorno; de operación externa de pasarela; de evento entrante y de clave de idempotencia dentro de su alcance.
- Clave de idempotencia ligada a un hash del contenido: repetir clave y contenido devuelve el resultado; repetir clave con contenido distinto se rechaza.
- Unicidad de emisión por línea de bono; unicidad de canje cuando la política sea uso único; protección de secreto/código en logs y en consultas públicas.
- Cantidades positivas, importes válidos, capacidad no negativa y transiciones permitidas; moneda/importe/comercio verificados en la confirmación del cobro.
- Identificador estable entre pedido, reserva, cobro, devolución y movimiento billing; referencias históricas conservadas aunque se despublique el catálogo.
- Verificación de índices antes de aceptar ventas; alarma y cierre de escritura comercial si falta uno crítico.
- Pruebas con dos compradores para la última plaza, mismo bono, reintentos y cambios manuales concurrentes. Los casos están en [07](07-migracion-y-validacion.md).

Fotos y documentos no necesitan vivir dentro de las colecciones de reservas. Un almacenamiento de objetos con copia y política de acceso permite separar catálogo público y justificantes privados; proveedor y coste quedan por seleccionar.
