# Auditoría funcional y de experiencia

Fecha y alcance: [índice](README.md) e [inventario reproducible](01-inventario-y-cobertura.md). Las prioridades de este documento son recomendaciones.

## Qué negocio representa la web

| Línea | Funcionamiento público observado | Implicación para la sustitución |
| --- | --- | --- |
| Talleres puntuales | Seis fichas de cerámica y una de cosmética; elección de fecha cuando existe variante comprable. | Separar experiencia reutilizable y convocatoria con fecha, precio y capacidad propios. |
| Clases regulares | Compra mensual; ficha del martes 10:30, con opción de noviembre y sesiones enumeradas. | Matrícula mensual, calendario de sesiones y relación con ausencias/recuperaciones; no asumir suscripción automática. |
| Bonos | Seis importes seleccionables, envío manual y canje de una sola compra. | Emisión trazable, caducidad, entrega y canje; preservar derechos de bonos vendidos anteriormente. |
| Celebraciones | Solicitud de disponibilidad, máximo diez personas y precios por grupo/temática. | Flujo de consulta y presupuesto; no convertirlo directamente en venta por plaza. |
| Cocciones y esmaltado | Tarifas por carga y temperatura; piezas sueltas por presupuesto. | Peticiones y cocciones desde billing; conservar requisitos de fichas técnicas de materiales y manipulación profesional, sin prometer agenda automática. |
| Restauración y encargos | Contacto y presupuesto, con proceso artesanal y plazos variables. | Convertir una consulta en encargo una sola vez; conservar comunicaciones y especificaciones. |

Fuentes: fichas y páginas enlazadas individualmente en [01](01-inventario-y-cobertura.md). Precios y reglas son una fotografía pública, no un catálogo aprobado para migrar.

## Lo que conviene conservar

La identidad verde, el protagonismo de las piezas, la historia familiar y la presencia local diferencian el negocio. La [portada](https://labottegadipali.es/) explica la conexión entre cerámica y cosmética y sitúa el taller en el Actur. Mantendría el lenguaje cercano y las fotografías originales. No trasladaría la estética administrativa de billing a la web de captación.

La separación entre talleres, clases y celebraciones es útil. También lo son el contacto por varios canales, los productos relacionados y la información sobre materiales y cancelación. La compra como invitado reduce la necesidad de mantener una cuenta para una experiencia puntual; está disponible en el checkout observado.

## Problemas concretos y prioridad

| ID | Prioridad | Evidencia observada | Recomendación |
| --- | --- | --- | --- |
| WEB-01 | Alta | La tarjeta de crema facial anuncia disponibilidad y la [ficha](https://labottegadipali.es/producto/crema-facial-personalizada/) informa que no hay existencias. | Derivar la tarjeta del estado comprable real; ofrecer aviso de nuevas fechas. |
| WEB-02 | Alta | [Taza/cuenco](https://labottegadipali.es/producto/crea-y-decora-tu-taza-o-cuenco/) aparece disponible en el listado, pero la variante publicada está agotada. | Disponibilidad por convocatoria, resumida de forma coherente en el listado. |
| WEB-03 | Alta | Selectores con fechas de septiembre/octubre, sin año; [maceta/jarrón](https://labottegadipali.es/producto/crea-y-decora-una-maceta-o-un-jarron/) mantiene una variante de 7 de octubre con stock en el HTML. | Guardar instantes reales, mostrar año y cerrar ventas al superar el inicio. El año de esas variantes no pudo verificarse. |
| WEB-04 | Alta | [Página de bonos](https://labottegadipali.es/bono-regalo/) enumera cuatro importes; [producto](https://labottegadipali.es/producto/bono-regalo/) habla de cinco aunque ofrece seis. | Un único catálogo de importes y componentes de contenido derivados; aclarar el remanente perdido en una compra. |
| WEB-05 | Alta | El pie/contacto presenta número 22 y CP 50018; textos legales usan número 24 y CP 50015; condiciones de recogida combinan 24/50018. | Confirmar local, domicilio fiscal y recogida por separado; publicar cada uno con su función. No asumir cuál es erróneo. |
| WEB-06 | Media | [Servicios](https://labottegadipali.es/servicios/) duplica información de las tres páginas específicas con redacción y temperaturas diferentes. | Una página resumen enlazada a fichas; tarifas administradas en un único lugar. |
| WEB-07 | Media | [Clases](https://labottegadipali.es/clases-de-ceramica-regulares/) comunica plazas mediante texto manual; ficha mensual y agenda son contenidos separados. | Disponibilidad publicada desde la matrícula y lista de espera opcional. |
| WEB-08 | Media | El calendario de próximos talleres se muestra en una imagen, visible en escritorio. | Calendario HTML derivado de convocatorias; que fecha, disponibilidad y enlaces sean legibles por lectores de pantalla. |
| WEB-09 | Media | Búsqueda amplia devuelve páginas de carrito, checkout y cuenta junto al contenido comercial. | Buscar experiencias/servicios; excluir utilidades y evitar resultados duplicados de bonos. |
| WEB-10 | Media | Bonos muestran la etiqueta «Plazas disponibles» incluso en carrito. | Distinguir disponibilidad de bonos, stock físico y plazas. |
| WEB-11 | Media | Checkout de un bono digital pide dirección, CP, población y provincia además de contacto. | Revisar con gestoría qué datos son necesarios en cada tipo de justificante; pedir el mínimo suficiente. |
| WEB-12 | Media | Cabecera accesible conserva «Search» y «Login»; algunas imágenes usan nombres técnicos, como `applyCuppon01`. | Etiquetas españolas y textos alternativos que expliquen la función real. |
| WEB-13 | Media | Banner ofrece «Aceptar» y ajustes; no se ve rechazo equivalente en primera capa. El panel revisado solo presenta cookies necesarias. | Inventariar cookies reales; ajustar consentimiento a lo que se instala. La apariencia por sí sola no demuestra instalación indebida. |

WEB-13 requiere contrastar la instalación efectiva antes/después de cada elección y revisar el criterio de la [AEPD](https://www.aepd.es/preguntas-frecuentes/17-internet-y-redes-sociales/FAQ-1707-importancia-de-las-cookies-en-la-proteccion-de-datos). No se ha hecho una auditoría legal ni de cookies de red completa.

## Recorridos y mejoras propuestas

### Descubrimiento y compra de taller

El recorrido actual pasa por un listado temático, una ficha con selector de variante, carrito y checkout. Propondría tarjetas con próxima fecha completa, duración, precio y estado real, y filtros sencillos por fecha/temática. La ficha debería enseñar primero las convocatorias futuras y después el detalle de la experiencia. Las agotadas pueden conservarse con lista de espera o alternativas, sin parecer comprables.

Para una compra de varias plazas, distinguir comprador y asistentes. No exigir que todos sean clientes administrativos. Aclarar ubicación, qué incluye, edades admitidas, accesibilidad física, cuándo se recogen las piezas y qué ocurre si no se alcanza el mínimo. Estas últimas cuestiones no están todas resueltas por la navegación revisada.

### Bonos

La automatización de mayor valor probable es emitir y entregar el bono tras confirmar el cobro, con reenvío desde billing y registro del envío. Mantener también la venta física. Mostrar vencimiento, restricciones y carácter de uso único antes del pago. Permitir canje parcial en distintas compras solo si Pali lo decide expresamente: cambia la contabilidad y la promesa al cliente.

### Consultas y servicios

El formulario actual solicita nombre, email, teléfono opcional, asunto, mensaje y aceptación de privacidad. Cosmética reutiliza un formulario general para avisos de nuevas fechas. Separaría consulta comercial y suscripción a avisos: finalidades y preferencias distintas. Las consultas podrían aparecer como solicitudes en billing con origen, estado y enlace al encargo/cocción creado. Evitar crear automáticamente clientes de facturación a partir de cualquier consulta.

## SEO y contenido

Se observan títulos, canonical, meta robots y datos estructurados generados por Rank Math, además de páginas de aterrizaje locales. No se dispone de Search Console, tráfico, conversiones o posiciones: no atribuir a esta estructura resultados de negocio no medidos.

En el HTML capturado hay páginas sin H1, por ejemplo Celebraciones, Contacto, Servicios, Subvenciones y la página informativa de bonos. Algunas carecen de meta descripción; ciertas fichas usan descripciones muy largas (bono: 1.556 caracteres). No garantiza un problema de posicionamiento, pero merece normalización editorial y revisión del snippet.

Conservar dominio y slugs útiles es preferible a cambiar todas las URLs por estética. Las categorías de cerámica/cosmética ya redirigen a las páginas temáticas. Mantener equivalencias y contenido local, con ubicación confirmada, datos estructurados adecuados y pruebas en buscadores. Las directrices de [cambio de hosting](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes) y [cambio de URLs](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) son distintas.

## Presentación, accesibilidad y rendimiento

Se inspeccionó Talleres de cerámica a 390×844 y 1440×1000: no se midió desbordamiento horizontal en esa página; móvil usa menú plegado y escritorio menú completo. En móvil, el primer pantallazo lo ocupan títulos e introducción, sin tarjetas comprables visibles. Propuesta: mantener contexto breve y acercar la próxima disponibilidad. Es una evaluación de ese recorrido, no una certificación responsive de todas las páginas.

Hay enlaces de salto y modales con nombres accesibles. Quedan por comprobar navegación completa por teclado, foco y retorno del foco, mensajes dinámicos, contraste medido y lectores de pantalla. La muestra verde/gris merece medición, no una declaración de incumplimiento basada en una captura.

La portada capturada contiene unos 159 kB de HTML sin comprimir y 62 etiquetas `script`; no son 62 solicitudes distintas. Hay recursos de Elementor, Blocksy, WooCommerce, Contact Form 7, Site Kit y otros complementos. Esto señala dependencias que habrá que sustituir, pero **no mide Core Web Vitals**. No se ejecutó Lighthouse ni se recogió CrUX. Una web Next.js también puede ser pesada si se lleva todo al cliente: usar HTML de servidor para captación y JavaScript solo para selección, carrito y compra.

## Dependencias visibles que deben tener sustituto

| Dependencia actual | Responsabilidad a preservar |
| --- | --- |
| WordPress, Elementor, Blocksy y tema hijo | Edición y diseño; inventariar personalizaciones no visibles. |
| WooCommerce y estados personalizados de stock | Variantes, precios, inventario, carrito, pedidos, cuentas y cupones. |
| Redsys, identificado en checkout | Cobro con tarjeta, notificación, devoluciones y conciliación. |
| Contact Form 7 | Validación y entrega de consultas; envío real no probado. |
| GDPR Cookie Compliance | Preferencias y consentimiento según integraciones reales. |
| Rank Math y Site Kit | Metadatos, datos estructurados y medición; configuración interna no auditada. |
| Correo, DNS, medios y copias del hosting | Servicios que pueden sobrevivir a la retirada de WordPress; comprobar contrato de Webempresa. |

Los recursos públicos permiten identificar componentes, no obtener un inventario exhaustivo de plugins, licencias, configuración ni código PHP personalizado.
