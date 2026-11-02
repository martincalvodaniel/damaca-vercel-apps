# Migración y criterios para el futuro plan

Este documento organiza **condiciones y secuencia de decisión**, no iteraciones de implementación aprobadas ni una estimación cerrada. No se cambia DNS, hosting, pasarela o base de datos durante la investigación.

## Enfoque recomendado

Preparar la nueva web fuera de producción, ensayar una migración completa y hacer un corte controlado del comercio. Para este tamaño no compensa mantener indefinidamente dos sistemas aceptando reservas sobre el mismo aforo. Puede migrarse primero contenido, pero el instante en que cambia la autoridad de plazas, bonos y pedidos debe ser inequívoco.

Conservar WordPress como solución transitoria o mejorar su integración desde billing sigue siendo una opción si el retorno no justifica reemplazarlo. Una nueva fachada sobre WooCommerce facilita cambios visuales, pero no permite cancelar el backend ni el hosting que lo ejecuta.

## Qué conocer antes de elegir implementación

- Lista administrativa de plugins activos, personalizaciones del tema hijo y automatizaciones ajenas a billing. Los recursos públicos no bastan.
- Exportación de catálogo completo, variantes, categorías, medios, pedidos, devoluciones, cupones, clientes y configuración tributaria. La API [WooCommerce v3](https://woocommerce.github.io/woocommerce-rest-api-docs/) permite consultar recursos; elegir exportación/API según datos reales y permisos. No se han exportado datos privados aquí.
- Estados y antigüedad de pedidos pendientes de cobro, bonos físicos emitidos fuera de WooCommerce y casos corregidos manualmente.
- Relación con pagos/facturas ya presentes en billing: IDs externos, coincidencias y casos sin enlace. No importar ingresos históricos de nuevo sin conciliación.
- Contrato Redsys/banco, entorno de pruebas, medios de pago y proceso actual de devolución; no copiar secretos a documentos o tickets.
- Servicios Webempresa que se perderían, acceso al dominio y propietario de DNS, correo, certificados y copias.
- Tráfico orgánico, URLs de entrada y campañas para priorizar preservación. Search Console no se consultó en esta entrega.

## Secuencia orientativa y puertas de salida

| Etapa | Resultado verificable para poder continuar |
| --- | --- |
| 1. Acordar alcance | Respuestas críticas de [08](08-decisiones-pendientes.md), política de bonos y clases, responsables y presupuesto. |
| 2. Elegir modelo y motor | Invariantes y operaciones de aforo/stock/canje demostradas con concurrencia; decidir Mongo o PostgreSQL antes de construir todas las pantallas. |
| 3. Unificar gestión | Billing crea/publica datos canónicos y las ventas manuales usan el mismo dominio. Sin doble edición necesaria para dar de alta una convocatoria. |
| 4. Construir recorridos | Captación, compra invitada, checkout de pruebas, bonos, correo y administración/conciliación utilizables. |
| 5. Ensayar migración | Importación idempotente, reconciliación de cantidades/importes/usos y restauración comprobada en entorno aislado. |
| 6. Preparar corte | Copias, congelación/delta, DNS/correo, SEO, notificaciones de TPV y reversión definidos. |
| 7. Cambiar autoridad | Un solo sistema acepta nuevas ventas/canjes; monitorización y soporte activos. |
| 8. Retirar dependencias | Histórico consultable, operación estable y servicios restantes sustituidos antes de cancelar hosting/licencias. |

No hace falta resolver suscripciones, envíos físicos o agenda automática de horno si no forman parte del alcance acordado. Tampoco deben desaparecer funciones públicas existentes por haberlas dejado fuera sin decisión.

## Migración de datos y correspondencias

Conservar IDs de WordPress/WooCommerce y referencias de pasarela como origen, además de IDs nuevos. Usar una tabla/colección de correspondencias y un registro de ejecución. Reejecutar una importación no duplica clientes, pedidos, cobros, bonos ni plazas. No usar el nombre del cliente como clave.

Los clientes con mismo email o nombre pueden representar situaciones distintas: revisar duplicados y compradores que reservan para otras personas. Una cuenta WordPress no se convierte en cuenta administrativa. Elegir cómo recuperarán acceso los clientes históricos; no asumir compatibilidad de hashes/sesiones ni obligarlos a usar Google. Una estrategia de acceso por enlace o restablecimiento debe ser explícita y probada.

Migrar bonos con importe interpretado correctamente, fecha/zona de vencimiento, límite de uso, usos ya consumidos y restricciones por producto. Comparar ejemplos comprados online, vendidos físicamente y emitidos desde billing. No guardar sus códigos utilizables en Git, capturas públicas ni datos de pruebas compartidos.

Las fechas de variantes deben mapearse a convocatorias confirmadas por Pali: el texto sin año no permite hacerlo de manera fiable. Las clases mensuales deben conservar el conjunto de sesiones comprado y exclusiones, no deducirse del nombre de la variante únicamente.

Conservar los documentos fiscales existentes como histórico inmutable y sus referencias; importación y visualización no equivalen a reemisión. Las cancelaciones y devoluciones antiguas también afectan a aforo, saldo de bonos y conciliación.

## SEO, medios y contenido

Preparar un mapa de las URLs de [01](01-inventario-y-cobertura.md) más las descubiertas por exportación/Search Console. Clasificarlas como conservar, consolidar con equivalente o retirar con respuesta apropiada. No redirigir todo a portada ni declarar como migrada una página que solo muestra un error con HTTP 200.

Preservar rutas cuando sea razonable, títulos/contenido útil, canonical, indexación, enlaces internos, imágenes y textos alternativos. Si se consolidan las páginas de bonos o servicios, decidir destino y evitar cadenas de redirecciones. Para cambios de URLs, Google recomienda redirects permanentes y conservarlos generalmente al menos un año. [Guía oficial](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes). Si solo cambia infraestructura con mismas URLs, aplicar [la guía de hosting](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes).

Mantener subvenciones y publicidad institucional hasta confirmar obligaciones. No depender de `wp-content/uploads` servido por el hosting cancelado. Verificar sitemaps y que los bloqueos de indexación de pruebas no lleguen a producción; cuenta, carrito y compras privadas no son páginas de captación.

## Corte comercial seguro

1. Guardar copias verificadas y acordar una ventana breve con ventas/canjes suspendidos. Reducir TTL DNS con antelación si corresponde, sabiendo que los clientes pueden conservar cachés.
2. Obtener el delta final de pedidos, cobros, devoluciones y bonos desde el ensayo. Conciliarlo y resolver discrepancias.
3. Cerrar la escritura comercial antigua; no depender solo del cambio DNS para impedir que una caché antigua siga vendiendo.
4. Activar backend nuevo y rutas públicas; comprobar que el TPV notifica al sistema responsable. Los pagos iniciados antes del corte conservan tratamiento y referencias explícitos: drenar pendientes o recibir/enrutar sus notificaciones de forma idempotente.
5. Verificar compra/confirmación de prueba controlada conforme a la política que se acuerde, correo y reflejo en billing, sin inferir éxito únicamente de la pantalla de retorno.
6. Observar incidencias y conciliación. Mantener histórico antiguo accesible de forma restringida y nuevas ventas solo en el motor nuevo.

Dos sistemas pueden convivir para lectura, pero no actuar como dos autoridades de inventario o canje. Un diseño por fases que mantenga ambos vendiendo exige integración de reservas real y tiene más coste que un corte acotado.

## Reversión

Antes de la primera venta nueva puede bastar con restaurar rutas y configuración conservando el estado anterior. **Después de nuevas ventas, volver el DNS no revierte los datos ni el banco.** Hay que suspender operaciones, conciliar nuevos pedidos/cobros/bonos y trasladar sus compromisos o mantener el nuevo backend como autoridad mientras se recupera la fachada. No restaurar un snapshot que borre compras ya pagadas.

Las URLs de notificación y las referencias de operaciones pendientes deben seguir atendidas durante la reversión. Guardar un procedimiento para notificaciones recibidas tarde, devoluciones y correos pendientes. Recuperar aforo sin registrar esas operaciones puede provocar sobreventa.

## Matriz de aceptación propuesta

| Caso | Resultado esperado |
| --- | --- |
| Recorrido público | Todas las rutas inventariadas tienen destino correcto o consolidación aprobada; móvil/escritorio y enlaces de campañas revisados. |
| Última plaza, dos compradores | Solo uno obtiene hold/confirmación; el otro recibe alternativa, sin cargo huérfano. |
| Venta web y manual simultáneas | Mismo resultado que con dos compradores web; el aforo nunca se supera. |
| Varias plazas o varios productos | Se admiten todos los recursos o se rechaza la compra; no quedan retenciones parciales sin resolución. |
| Hold caducado | Se libera una vez y con trazabilidad; retraso del worker no permite sobreventa. |
| Cobro tardío | Recupera plazas atómicamente o genera incidencia/devolución sin afirmar reserva inexistente. |
| Doble clic/reintento | Un pedido, un efecto de cobro y un ingreso enlazado; misma clave con contenido distinto se rechaza. |
| Webhook repetido/desordenado | No duplica efectos ni retrocede un estado confirmado; se verifica pasarela y operación. |
| Timeout de pasarela | Resultado desconocido recuperable; no se lanza otro cobro sin comprobar el anterior. |
| Fallo de billing tras cobrar | Evento persistido; registro contable pendiente visible y reintentable. |
| Fallo de correo | Compra permanece confirmada; reenvío no emite otro bono ni otra reserva. |
| Mismo bono en dos carritos | Solo un canje confirmado; el bloqueo no deja el bono perdido tras abandono. |
| Bono antiguo | Mismo valor aplicable, vencimiento y usos ya consumidos; diferencias neto/bruto probadas. |
| Clase mensual | Un cobro del mes, sesiones correctas y relación con asistencia; no multiplicar el ingreso por sesión. |
| Devolución parcial | Importes/plazas/documentos coherentes, conservando el resto de la compra. |
| Acceso anónimo/otro cliente | No puede leer clientes, facturas, reservas ajenas ni endpoints administrativos. |
| Preproducción | Ninguna escritura/cobro/correo real; datos ficticios o anonimizados, aislados de producción. |
| Índice crítico ausente | La venta se bloquea explícitamente y alerta; no se continúa silenciosamente. |
| Migración repetida | Recuentos y sumas iguales; IDs/correspondencias sin duplicados. |
| Restauración/reversión | Se preservan compromisos pagados y se recupera servicio en el objetivo acordado. |

Estas pruebas no se han ejecutado: son criterios para el futuro plan. La validación de esta entrega es documental. Para implementación habrá que añadir tipos, lint, pruebas y builds exigidos por el workflow, además de ensayos con pasarela de pruebas y navegador.
