# Decisiones pendientes para preparar la implementación

No es necesario responder todo a la vez. Este documento separa decisiones que condicionan arquitectura/producto de mejoras posteriores. Las recomendaciones del dossier siguen abiertas.

## Prioridad 1: decidir antes de cerrar alcance

| ID | Pregunta | Por qué cambia la solución | Propuesta inicial para discutir |
| --- | --- | --- | --- |
| D-01 | ¿Qué duplicaciones consumen más tiempo y cuántas operaciones se hacen al mes? | Determina retorno y automatizaciones prioritarias. | Medir una venta de taller, bono, clase y servicio con sus pasos reales. |
| D-02 | ¿Se busca ahorrar cuota, facilitar gestión, rediseñar o las tres cosas? | Si prima ahorro, sustituir comercio puede no compensar. | Priorizar operación única y fiabilidad; justificar ahorro con costes reales. |
| D-03 | ¿Se mantienen Redsys y el contrato bancario? ¿Qué medios deben conservarse? | Condiciona checkout, pruebas, notificaciones y costes. | Mantenerlo salvo motivo concreto para cambiar; obtener condiciones y documentación del comercio. |
| D-04 | ¿Los bonos seguirán siendo de una sola compra o tendrán saldo multicanje? | Cambia el modelo, devoluciones, fraude y fiscalidad. | Mantener compromisos de bonos antiguos; decidir nuevos por separado. |
| D-05 | ¿Cómo se concilian hoy pedidos web, pagos y facturas en billing? | Riesgo de duplicar ingresos/histórico al automatizar. | Revisar ejemplos anonimizados de compra, canje, diferencia y devolución. |
| D-06 | ¿Hay aforo compartido entre temáticas, turnos, clases y celebraciones? | Una sesión no basta si compite por espacio/profesora/material. | Modelar primero recursos reales; no asumir capacidades independientes. |
| D-07 | ¿Qué significa reservar una clase mensual y cómo se admiten recuperaciones? | Puede afectar a todas las sesiones del mes y a plazas de otro grupo. | Conservar compra mensual; relacionar matrícula, sesiones y ausencias sin automatizar reglas desconocidas. |
| D-08 | ¿Pali debe editar textos/fotos/precios/agenda sin intervención del desarrollador? | Decide necesidad de editor y publicación en billing o CMS adicional. | Billing para catálogo/agenda; editor sencillo de contenido si se necesita autonomía. |
| D-09 | ¿Qué incluye y cuesta Webempresa y cuándo renueva? | Cancelar puede retirar correo, DNS, dominio o copias necesarias. | Separar cada servicio y coste antes de presupuestar ahorro. |
| D-10 | ¿Quién atiende incidencias cuando el desarrollador no está disponible? | El mantenimiento propio requiere continuidad, acceso y procedimientos. | Responsable y procedimiento de emergencia antes del lanzamiento. |

## Prioridad 2: concretar antes de modelar y migrar

- **Calendario:** año real de variantes publicadas; cierre de inscripción; antelación; mínimos; festivos; duración; plazo de recogida; talleres cancelados por mínimo no alcanzado. ¿Se necesita lista de espera y cómo se ofrece una plaza liberada?
- **Participantes:** ¿se compra para uno mismo o para regalar varias plazas?, ¿se recogen nombres/edades?, ¿hay menores o necesidades de accesibilidad? Recoger solo lo necesario y revisar tratamiento cuando proceda.
- **Clases:** prioridad de renovación de alumnos actuales, cambio de grupo, mes empezado, faltas, recuperaciones y límites. ¿Puede un cliente comprar dos matrículas o varias plazas del mismo grupo?
- **Bonos:** caducidad exacta, transferibilidad, combinación de códigos, devolución, reactivación, importe de diferencia y ventas físicas no registradas en WooCommerce. ¿Se permite aplicarlos a todos los productos?
- **Productos físicos:** hoy no se descubren fichas vendibles de piezas; ¿se quiere tienda física online, recogida, envío, variantes y stock único con mercadillos? Añadir envíos es otro alcance.
- **Servicios:** ¿se quiere solo captar consultas o aceptar presupuestos y pagar anticipos? ¿Se gestionará reserva del horno o únicamente encargos de cocción? Billing no tiene que asumir contratos/pagos parciales por inferencia.
- **Contenido:** dirección correcta del local, dirección fiscal y recogida; importes vigentes; fotos/logos; condiciones de uso y subvenciones. Confirmar qué documentos requieren revisión profesional.
- **Clientes históricos:** ¿cuántas cuentas usan su área privada?, ¿deben conservar historial, descargas y acceso?, ¿cómo se vinculan los clientes de billing sin fusiones equivocadas?
- **Fiscalidad:** clasificación de bonos, tipos por servicio, justificante/factura, rectificaciones, numeración y aplicabilidad de requisitos de sistemas de facturación. Resolver con gestoría antes de automatizar.
- **Operación y datos:** configuración Mongo real (topología, índices, tamaño, backup/región/capacidad), protección de backend y aislamiento de preproducción. No hacen falta secretos dentro de este dossier.

## Prioridad 3: mejoras tras estabilizar el núcleo

Recordatorios y recogida de piezas, lista de espera automática, área de cliente, calendario descargable, reservas de celebraciones con presupuesto, avisos de cosmética, métricas de conversión y conciliación más avanzada. Evaluar cada una según valor; no agruparlas automáticamente en la primera versión.

No añadir suscripciones recurrentes, programa de fidelidad, stock de materiales, fabricación o logística porque parezcan extensiones naturales: hoy no están autorizadas como implementación.

## Qué cambiaría la recomendación técnica

| Condición descubierta | Ajuste |
| --- | --- |
| Casi no hay ventas web y el objetivo principal es ahorro de hosting. | Considerar conservar WooCommerce con mejor integración o una solución gestionada antes de construir motor propio. |
| La edición visual compleja por Pali es imprescindible. | Valorar CMS o editor dedicado; no obligar a editar Git ni recrear Elementor sin presupuesto. |
| Recursos complejos con solapamientos, múltiples locales y conciliación relacional creciente. | PostgreSQL gana peso como propietario del dominio comercial; decidirlo antes de consolidar el modelo Mongo. |
| Mongo disponible no admite las transacciones necesarias o el equipo no puede demostrar invariantes. | No lanzar ventas; resolver topología/diseño o elegir PostgreSQL. |
| El backend administrativo tiene ventanas frecuentes de indisponibilidad incompatibles con ventas. | Separar despliegue del backend comercial, además de la fachada pública. |
| Dos proyectos y API añaden una operación desproporcionada para el negocio. | Una app con áreas pública/privada puede ser mejor, manteniendo dominio y permisos bien separados. |
| WooCommerce ya resuelve numerosas reglas/plugins no descubiertos públicamente. | Priorizar integración incremental y medir coste real de sustitución antes de retirarlo. |

## Próxima sesión de trabajo sugerida

Resolver D-01 a D-10 con ejemplos reales, revisar las inconsistencias de contenido y acordar la autoridad de cada dato. Después convertir las decisiones aceptadas en alcance y criterios de una primera entrega. El presente dossier no crea compromisos de calendario ni aprueba infraestructura, proveedores o despliegues.
