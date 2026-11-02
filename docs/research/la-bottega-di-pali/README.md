# La Bottega di Pali: investigación de la web y su integración con billing

**Fecha:** 2 de noviembre de 2026, Europe/Madrid. **Estado:** investigación y recomendaciones; ninguna alternativa está aprobada para implementación. Código contrastado en `int`, commit `7f0f247ee184b0d550e9a0f9530cdc9e5026d1cd`.

## Recomendación principal

Crearía **una aplicación pública independiente dentro del monorepo**, con proyecto Vercel propio, y mantendría **billing como la única interfaz de administración del negocio**. Ambas usarían un único dominio de comercio y reservas, con un propietario de escritura claro. La web llamaría desde su servidor a una API limitada de ese dominio; no tendría las credenciales de Mongo ni acceso a las APIs administrativas actuales.

Inicialmente alojaría ese backend en billing, detrás de rutas de integración específicas y con autenticación propia para máquinas. Billing conservaría su acceso privado. Así se separan las publicaciones y la superficie pública sin empezar con varios microservicios. Esta separación no elimina la dependencia de disponibilidad del backend de billing: debe asumirse y probarse.

**Conservaría MongoDB en la primera sustitución**, añadiendo un modelo explícito de comercio, operaciones atómicas, transacciones cuando corresponda e índices verificados. No reutilizaría los modelos actuales sin adaptarlos. PostgreSQL sería mi primera opción para un sistema de reservas y comercio construido desde cero; aquí su ventaja debe compensar migrar o mantener otro almacenamiento. La decisión tiene una condición: demostrar que Mongo puede cumplir los invariantes de aforo, stock, canjes y cobros con el equipo y despliegue disponibles. Si no se demuestra, elegir PostgreSQL para todo el dominio de comercio antes de lanzar.

No basaría el cambio únicamente en ahorrar hosting. La integración puede ahorrar trabajo repetitivo, pero sustituir WooCommerce implica asumir pedidos, cobros, devoluciones, bonos, correos, seguridad y recuperación. El checkout actual usa **Redsys**; cambiarlo por Stripe sería una decisión adicional, no una consecuencia de usar Vercel. [Checkout](https://labottegadipali.es/finalizar-compra/), observado con carrito temporal sin formalizar pedido.

## Lectura del dossier

| Documento | Contenido |
| --- | --- |
| [01 — Inventario y cobertura](01-inventario-y-cobertura.md) | Las 39 URLs recorridas, procedencia, redirecciones, fichas y estados interactivos; límites de la revisión. |
| [02 — Auditoría de la web](02-auditoria-web.md) | Oferta, experiencia, problemas concretos, contenido, SEO, accesibilidad y dependencias visibles. |
| [03 — Billing actual](03-billing-actual.md) | Qué existe realmente, integración WooCommerce, reutilización y carencias, con referencias al código. |
| [04 — Arquitectura e interoperabilidad](04-arquitectura-e-integracion.md) | Comparación de aplicaciones, API y base compartida; propiedad de datos y flujos para evitar duplicación. |
| [05 — Datos y reservas](05-datos-y-reservas.md) | Mongo frente a PostgreSQL, entidades, aforo concurrente, clases, stock, bonos y estados de pago. |
| [06 — Riesgos y costes](06-riesgos-y-costes.md) | Riesgos priorizados, continuidad, datos personales, fiscalidad, Vercel y coste total. |
| [07 — Migración y criterios](07-migracion-y-validacion.md) | Estrategia de transición, reversión, criterios verificables y comprobaciones previas al lanzamiento. |
| [08 — Decisiones pendientes](08-decisiones-pendientes.md) | Preguntas ordenadas y condiciones que cambiarían la recomendación. |
| [09 — Fuentes](09-fuentes.md) | Referencias oficiales, evidencia local y limitaciones de acceso. |

## Hallazgos que condicionan el proyecto

1. La web vende experiencias con plazas y clases mensuales, además de bonos. No se ha encontrado venta pública de piezas físicas entre las nueve fichas descubiertas. No inferir que esa línea de negocio deba excluirse del futuro.
2. Billing ya consulta pedidos, actualiza estados y crea/gestiona cupones de WooCommerce. También importa datos de clientes mediante revisión manual. Falta unificar la operación; no se parte de cero.
3. Hay divergencias entre disponibilidad de listados y fichas, fechas sin año, información duplicada de servicios y bonos, y direcciones que deben aclararse. Conviene corregirlas aunque se conserve WordPress.
4. El control de aforo de billing compara una lectura con la capacidad y escribe después sin incluir el aforo en la condición atómica. No debe exponerse como motor de reservas concurrentes sin refuerzo. Es un hallazgo de código, no una incidencia de sobreventa observada en producción.
5. Los bonos se describen como cupones de una sola compra y emisión manual. Un monedero con saldo para varias compras cambiaría el producto y sus compromisos.
6. La web comercial debe presupuestar un plan Vercel que admita ese uso. Hobby está limitado al uso personal no comercial. [Política oficial](https://vercel.com/docs/limits/fair-use-guidelines).

## Cómo interpretar la evidencia

**Observado** significa visto en HTML público, navegador o código local. **Inferido** identifica una consecuencia razonada que todavía debe contrastarse. **Propuesto** describe una solución futura, no una función existente. **Pendiente** requiere datos del negocio, acceso administrativo o validación en un entorno de pruebas.

La cobertura pública es amplia y trazable: se agotaron los enlaces internos elegibles de menú, pie, listados, migas, relacionados y las dos búsquedas documentadas. No equivale a exportar todo WordPress, probar cuentas autenticadas, comprobar correos ni ejecutar un pago real. No se enviaron formularios, crearon cuentas o pedidos, ni se leyeron bases de producción. El único artículo añadido fue un bono sin aforo en un carrito temporal, posteriormente vaciado.

La entrega se registra en [AGW-16](../../../plan/iterations.md#agw-16--investigación-de-la-bottega-y-su-integración-con-billing), con [evidencia de cierre](../../../plan/iteration-log.md#agw-16-investigación-de-la-bottega-y-su-integración-con-billing). No se ha creado todavía una app ni un plan de implementación.
