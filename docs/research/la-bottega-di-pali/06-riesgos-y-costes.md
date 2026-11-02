# Riesgos, operación y coste total

Evaluación de diseño, no auditoría de seguridad, dictamen fiscal ni verificación contractual del hosting. Prioridades cualitativas basadas en el impacto para un negocio pequeño; probabilidad pendiente de tráfico y operación reales.

## Registro de riesgos

| ID | Prioridad | Riesgo y consecuencia | Mitigación / evidencia exigible |
| --- | --- | --- | --- |
| R-01 | Crítica | Dos canales venden la última plaza o pieza. | Único escritor, operación atómica y pruebas concurrentes incluyendo venta manual. |
| R-02 | Crítica | Cobro confirmado sin reserva o repetido en billing. | Referencias únicas, idempotencia, estados separados, bandeja persistente y conciliación visible. |
| R-03 | Crítica | Robo de datos administrativos al ampliar la superficie pública. | API con proyecciones mínimas, permisos de máquina limitados, identidad de comprador separada y pruebas de acceso/aislamiento. |
| R-04 | Alta | Se invalidan bonos vigentes, se acepta dos veces un código o se altera su valor. | Migración de usos/fechas/restricciones, bloqueo de canje, pruebas neto/bruto y conciliación con ventas físicas. |
| R-05 | Alta | Retirar Webempresa rompe correo del dominio, DNS, históricos o imágenes. | Inventario contractual, copia externa, mantener MX/TXT correctos y comprobar envío/recepción antes de cancelar. |
| R-06 | Alta | Regresión SEO o pérdida de enlaces de campañas y redes. | Mantener rutas útiles, equivalencias, redirects precisos, medios migrados y seguimiento Search Console. |
| R-07 | Alta | Devolución o reclamación se marca resuelta sin operación bancaria/contable. | Estado de pasarela, importe pendiente, registro de acción y documento correspondiente. |
| R-08 | Alta | Fallo silencioso al enviar confirmaciones o bonos. | Cola/bandeja persistente, proveedor transaccional, estado y reenvío desde billing; alertar sin repetir el cobro. |
| R-09 | Alta | Preview escribe en producción o envía correos/cobros reales. | Bases/credenciales de prueba, pasarela de pruebas y destinatarios controlados; ningún refresco automático de pro. |
| R-10 | Alta | Dependencia de una persona para incidencias y publicación editorial. | Procedimientos de recuperación, copias restauradas, acceso de emergencia y edición desde billing según necesidad. |
| R-11 | Alta | Política de cancelación, IVA o emisión documental no aplicable a un producto. | Revisión con gestoría/asesoría por línea de negocio; versiones de términos y datos históricos preservados. |
| R-12 | Media/alta | Caída de billing impide comprar aunque la web pública esté operativa. | Backend comercial probado y monitorizado, escaparate cacheado, fallo de venta explícito y recuperación de notificaciones. |
| R-13 | Media/alta | Bots bloquean plazas con carritos o generan costes de correo/pasarela. | Holds breves, cuotas por operación, límites de cantidad, validación y protección de abuso; sin confiar solo en IP. |
| R-14 | Media | Caché enseña precio/plazas antiguos o datos de otro cliente. | Separación público/privado, revalidación del catálogo y recálculo autoritativo en compra. |
| R-15 | Media | Conexiones, funciones o gasto compartido saturan el backend. | Pool/región/carga dimensionados, límites de entrada, alertas y presupuesto; dos proyectos no aíslan un clúster. |
| R-16 | Media | El motor nuevo pierde reglas ocultas del tema hijo o plugins. | Exportación/configuración y checklist funcional; pruebas con ejemplos históricos revisados. |
| R-17 | Media | Códigos de bono o enlaces de compra aparecen en logs/analítica. | Redacción, tokens con alcance/caducidad, evitar PII en URLs y accesos a PDF limitados. |

La carrera de aforo de R-01 está sustentada por [el código revisado](03-billing-actual.md); el resto expresa escenarios a prevenir, no incidentes que se afirme que hayan ocurrido.

## Seguridad y datos personales

La aplicación pública no debe importar el cliente Mongo de billing ni disponer de un rol administrativo. Los endpoints públicos no aceptan un `clientId` como prueba de identidad; un comprador solo consulta sus propias compras mediante sesión o credencial opaca, limitada y revocable. Los webhooks se validan con el mecanismo de la pasarela y comprueban operación, comercio, cantidad y moneda.

Mantener logs de cambios de aforo, publicación, canjes, cobros y devoluciones, con acceso privado y retención definida. No guardar tarjetas ni códigos de seguridad: usar el flujo alojado/tokenizado del proveedor elegido y concretar las obligaciones aplicables con este. La observación de Redsys en pantalla no acredita el alcance PCI ni la configuración del comercio.

Para la migración, reducir y proteger exportaciones de clientes, pedidos y direcciones; mantenerlas fuera de Git y de previews públicas. Definir finalidades, acceso, retención, encargados, localización del tratamiento y posibles transferencias con los proveedores elegidos. La política actual deberá describir el flujo futuro real; copiar el texto WooCommerce puede dejar afirmaciones falsas.

No convertir una solicitud de presupuesto en permiso para campañas. Tampoco recoger alergias, salud u otros datos sensibles en un campo libre sin una necesidad y tratamiento definidos. La suscripción a avisos de talleres necesita un flujo propio que se pueda cancelar.

## Condiciones comerciales y fiscalidad

La web publica cancelación de talleres con antelación de 48 horas y condiciones diferentes para clases, bonos y encargos. Son observaciones del producto actual, **no una validación de su validez jurídica**. El [TRLGDCU](https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555#a103) contiene excepciones al desistimiento, entre ellas productos personalizados y determinados servicios de esparcimiento con fecha. No se debe extender automáticamente una excepción a todo bono sin fecha o a cualquier clase.

El [Real Decreto 1007/2023](https://boe.es/eli/es/rd/2023/12/05/1007) regula requisitos de sistemas de facturación. Antes de ampliar automatización, revisar aplicabilidad, obligaciones y calendario vigente de Pali con gestoría. No se ha auditado la conformidad fiscal de billing ni se fija aquí una fecha límite. Generar PDFs y numerarlos no basta para concluir conformidad.

El IVA de bonos merece una decisión específica, descrita en [05](05-datos-y-reservas.md). Preservar hechos de cobro y rectificación; no reemitir documentos históricos para adaptarlos al catálogo nuevo. Confirmar además obligaciones de publicidad de subvenciones antes de retirar logos, enlaces o textos institucionales de la web.

## Vercel y presupuesto

La [política oficial de uso](https://vercel.com/docs/limits/fair-use-guidelines) reserva Hobby al uso personal no comercial. La Bottega anuncia y vende servicios, por lo que **no presupuestaría su producción sobre Hobby**. Esto no exige contratar nada durante la investigación.

La [documentación Pro consultada](https://vercel.com/docs/plans/pro-plan) indica una cuota de plataforma de **20 USD/mes**, con un asiento de despliegue y 20 USD de crédito de consumo; asientos adicionales y excesos se tarifican aparte. Es una referencia verificada al 02/11/2026, no una oferta cerrada: confirmar precio, moneda, impuestos, región y condiciones al contratar. No interpretar los créditos como una segunda factura fija ni como consumo ilimitado.

Un usuario de negocio que entra a billing no es automáticamente un asiento adicional de despliegue Vercel. Dos proyectos tampoco implican por sí solos dos cuotas base; depende de cómo se organicen los equipos y recursos. La factura real debe simularse con el equipo elegido, sin asumir que la infraestructura privada actual ya cubre el uso comercial nuevo.

## Modelo de coste total

| Partida | Situación o cálculo necesario |
| --- | --- |
| Hosting actual | Pendiente factura/renovación y qué incluye Webempresa: web, correo, copias, dominio y soporte. |
| Vercel | Cuota/asientos + consumo de funciones, transferencia, imágenes y recursos; escenarios de carga y abuso. |
| MongoDB o PostgreSQL | Capacidad adicional, backups, retención y restauración; coste incremental frente al coste completo. |
| Fotos y documentos | Almacenamiento, transformaciones, transferencia y copia externa. |
| Correo de dominio | Buzón humano independiente del envío transaccional. Puede requerir migración y nueva cuota. |
| Correo transaccional | Confirmaciones, bonos, recordatorios, reintentos y reputación de entrega. |
| Pasarela | Contrato Redsys/banco actual frente a alternativa: fijo, porcentaje, devolución, disputa y medios admitidos. Sin tarifas privadas verificadas. |
| Monitorización/seguridad | Errores, alertas, retención de logs, medidas contra abuso y tiempo de respuesta. |
| Construcción/migración | Desarrollo, pruebas, datos, revisión legal/fiscal, convivencia y recuperación. |
| Mantenimiento | Actualizaciones, cambios de pasarela, incidencias, soporte y sustitución del mantenedor. |

Cálculo recomendado: coste anual nuevo = costes recurrentes + horas de mantenimiento valoradas + incidencias esperadas + parte amortizada de construcción/migración. Beneficio anual = coste antiguo realmente eliminado + horas de doble gestión evitadas + mejora de margen demostrable. No contar como ahorro una cuota que se mantiene para correo o dominio, ni sumar como ingreso el valor de una reserva y su cobro otra vez.

Como ejemplo de método, si se evitan diez minutos por operación, multiplicar por operaciones anuales y coste/hora acordado. Es una hipótesis para rellenar con datos, no una medición de Pali. Sin volumen, facturas y tiempo real de gestión, **no es defendible prometer que Vercel será más barato**.

## Operación y recuperación

Definir quién recibe una alerta y cómo puede resolver un cobro sin reserva, liberar una retención atascada, reenviar un bono o cerrar temporalmente ventas. Si se automatizan tareas, su fallo debe quedar visible. La plataforma de alojamiento no sustituye esos procedimientos.

Elegir objetivos de pérdida de datos y tiempo de recuperación acordes al negocio y probar una restauración. La copia no es una estrategia verificada hasta restaurarla y conciliarla con la pasarela. Mantener una exportación portable del catálogo y los históricos para reducir dependencia del proveedor.
