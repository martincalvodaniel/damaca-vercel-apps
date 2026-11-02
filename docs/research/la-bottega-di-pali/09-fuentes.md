# Fuentes y calidad de la evidencia

Consulta: **2 de noviembre de 2026**. Los hechos observados pueden cambiar; precios, reglas, planes y normativa deben verificarse otra vez al implementar/contratar. Los enlaces web apuntan a fuentes propietarias u oficiales. Las recomendaciones originales se distinguen de sus fundamentos documentales.

## Web de La Bottega

La fuente primaria del funcionamiento comercial observado es la propia web. [01 — Inventario](01-inventario-y-cobertura.md) enlaza individualmente las 39 URLs y conserva origen, destino y resultado. Incluye la página adicional de bonos, aviso legal, cuenta y recuperación descubiertos a través de búsquedas normales.

El contenido se leyó mediante GET públicos y se contrastaron interacciones con navegador: menú, variante, carrito, checkout, cuenta, cookies y búsquedas. Las variantes se leyeron del HTML público entregado a visitantes. No se llamaron endpoints privados de WooCommerce ni se usaron credenciales del repositorio.

El extractor de la herramienta de búsqueda web devolvió timeout/error al abrir el dominio. Las consultas públicas desde red autorizada y el navegador sí funcionaron. No usar ese fallo del extractor como prueba de caída del sitio ni de desindexación. La captura HTTP inicial recibió 200 y recursos de WordPress/WooCommerce; las cabeceras o versiones declaradas no acreditan por sí solas la configuración interna ni su seguridad.

## Código del repositorio

Referencia fija: `7f0f247ee184b0d550e9a0f9530cdc9e5026d1cd` en `int`. [03 — Billing](03-billing-actual.md) enlaza rutas y líneas relevantes. Para localizar esa versión si el árbol cambia, consultar el commit antes de extrapolar los números de línea.

| Evidencia | Archivos primarios |
| --- | --- |
| Autenticación real | [auth.ts](../../../apps/billing-poc/src/lib/auth/auth.ts), [require-auth.ts](../../../apps/billing-poc/src/lib/auth/require-auth.ts), [proxy.ts](../../../apps/billing-poc/src/proxy.ts). |
| Modelos | [product.ts](../../../apps/billing-poc/src/lib/domain/entities/product.ts), [event.ts](../../../apps/billing-poc/src/lib/domain/entities/event.ts), [payment.ts](../../../apps/billing-poc/src/lib/domain/entities/payment.ts), [absence.ts](../../../apps/billing-poc/src/lib/domain/entities/absence.ts). |
| WooCommerce | [URLs](../../../apps/billing-poc/src/features/wordpress/server/urls.ts), [transporte](../../../apps/billing-poc/src/features/wordpress/server/transport.ts), [importación de clientes](../../../apps/billing-poc/src/features/wordpress/components/WordpressBillingClientModal.tsx), [cupones](../../../apps/billing-poc/src/lib/domain/services/wordpress-coupon.ts). |
| Aforo y stock | [Alta de asistente](../../../apps/billing-poc/src/features/events/server/attendees-route.ts), [repositorio de eventos](../../../apps/billing-poc/src/lib/db/repositories/mongo-event-repository.ts), [productos](../../../apps/billing-poc/src/lib/db/repositories/mongo-product-repository.ts), [alta de pagos](../../../apps/billing-poc/src/features/payments/server/payments-post-route.ts). |
| Persistencia e índices | [Cliente Mongo](../../../apps/billing-poc/src/lib/db/client.ts), [índices](../../../apps/billing-poc/src/lib/db/repositories/ensure-indexes.ts). |
| Decisiones vigentes | [Plan billing](../../../apps/billing-poc/plan/master.md), [workflow raíz](../../../plan/workflow.md), [plan raíz](../../../plan/master.md). |

No se inspeccionaron secretos, datos de clientes ni bases remotas. La existencia de código no acredita que una integración esté configurada o usada actualmente en producción. El análisis de carreras es estático; no se ejecutaron pruebas de carga ni sobreventa sobre la web real.

## Documentación oficial consultada

| Fuente | Afirmación que respalda / uso |
| --- | --- |
| [Vercel: Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines) | Hobby restringido a uso personal no comercial. No usar como catálogo vigente de todos los límites de cómputo. |
| [Vercel: Pro Plan](https://vercel.com/docs/plans/pro-plan) | Cuota de plataforma, asiento incluido, crédito y cobro de uso/asientos. Cifras sujetas a contratación/impuestos. |
| [MongoDB: Atomicity and Transactions](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/) | Atomicidad de escritura en un documento y necesidad de condiciones correctas; transacciones multidocumento. |
| [MongoDB: Transactions](https://www.mongodb.com/docs/manual/core/transactions/) | Capacidades/requisitos y consideraciones de transacciones; verificar topología del despliegue concreto. |
| [MongoDB: TTL Indexes](https://www.mongodb.com/docs/manual/core/index-ttl/) | Eliminación en segundo plano sin garantía de puntualidad exacta. |
| [PostgreSQL: Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html) | Bloqueos para coordinar operaciones concurrentes. |
| [PostgreSQL: Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) | Restricciones y exclusión; no equivalen a implementar un motor de aforo completo. |
| [WooCommerce REST API v3](https://woocommerce.github.io/woocommerce-rest-api-docs/) | Recursos de catálogo/variantes, pedidos, clientes, cupones y devoluciones; apoyo al inventario privado futuro. |
| [Google: cambio de hosting](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes) | Migración de infraestructura conservando URLs. |
| [Google: migración con cambios de URL](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) | Correspondencias, redirecciones permanentes, medios, sitemap y seguimiento. |
| [AEPD: cookies y protección de datos](https://www.aepd.es/preguntas-frecuentes/17-internet-y-redes-sociales/FAQ-1707-importancia-de-las-cookies-en-la-proteccion-de-datos) | Visibilidad de aceptar/rechazar y relevancia del tratamiento real. No demuestra incumplimiento de la web examinada. |
| [BOE: TRLGDCU](https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555#a103) | Excepciones de desistimiento del artículo 103; aplicación concreta pendiente de revisión. |
| [BOE: RD 1007/2023](https://boe.es/eli/es/rd/2023/12/05/1007) | Requisitos de sistemas de facturación; no se certifica cumplimiento ni calendario aplicable al negocio. |
| [BOE/DGT: tratamiento de bonos](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2018-18094) | Diferencia entre bonos univalentes/polivalentes y consecuencias de IVA. Clasificación concreta sin resolver. |
| [Stripe: Webhooks](https://docs.stripe.com/webhooks) | Referencia de diseño sobre entregas repetidas y procesamiento de notificaciones. No se presupone que Stripe esté contratado. |
| [Stripe: fulfillment de Checkout](https://docs.stripe.com/checkout/fulfillment) | Confirmación por servidor y operaciones idempotentes; referencia conceptual para evaluar alternativas. |

## Fuentes con acceso limitado y conclusiones que no se extraen

La búsqueda localizó un [manual oficial de integración por redirección de Redsys](https://pagosonline.redsys.es/download/1735/?tmstv=1741659740), pero la herramienta web no consiguió abrir el documento ni una página operativa intentada. Por ello no se fija versión del protocolo, algoritmo, política de reintentos ni contrato técnico definitivo. Debe obtenerse la documentación vigente correspondiente al comercio y validarla con su entorno de pruebas. La presencia de Redsys procede del checkout visible, no de ese manual.

La página EUR-Lex del RGPD presentó un control de acceso automatizado. No se usa como fuente de una conclusión jurídica específica ni se ha intentado superarlo. Las recomendaciones de minimización, proveedores, retención y aislamiento son requisitos de diseño a concretar con la política real y asesoramiento pertinente.

No se consultaron facturas de Webempresa, contrato bancario, Search Console, Google Analytics, panel WordPress, correo recibido, logs de producción ni panel de Vercel de este comercio. No hay medición de conversiones, Core Web Vitals, volumen de datos o coste total real. Tampoco existe una certificación de accesibilidad, legalidad o seguridad de ninguna de las aplicaciones.
