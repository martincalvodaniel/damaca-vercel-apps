# Registro de entregas

Archivo histórico: [BILL-01 y BILL-02](archive/2026-11-01/bill-01-02.md).

## BILL-10 — Copiar Instagram desde el listado

- Inicio: 2026-11-01, rama `int`, base `d61361e`, árbol limpio. Capacidad inicial: 9 % en 5 h y 66 % en 7 d.
- Aceptación: [BILL-10](iterations.md#bill-10--copiar-instagram-desde-el-listado).
- Implementado: Instagram usa `CopyToClipboardButton` con el mismo toast y confirmación que email; `stopPropagation` evita abrir la edición de la fila al copiar. Sin valor se conserva `—`.
- Validación: `bunx biome check apps/billing-poc/src/features/clients/components/ClientTableRow.tsx`: correcto; `bun run type-check --filter=@damaca/billing-poc`: correcto; `bun run test --filter=@damaca/billing-poc`: 971 pruebas, 0 fallos; `bun run build --filter=@damaca/billing-poc -- --webpack`: correcto; `git diff --check`: correcto. Sin prueba de navegador; el comportamiento reutiliza el componente de copia ya usado por email.
- Commit `d480743`; push a `origin/int` correcto y SHA remoto verificado (`d480743dfd30fbc60358768cd2c4b4e8f615b0e6`).

## BILL-09 — Instagram de clientes

- Inicio: 2026-11-01, rama `int`, base `a697800`, árbol limpio. Capacidad inicial: 10 % en 5 h y 67 % en 7 d.
- Aceptación: [BILL-09](iterations.md#bill-09--instagram-de-clientes).
- Implementado: `instagram` opcional en entidad/formulario, validación, puerto y adaptador Mongo. Formulario de alta/edición y tabla muestran Instagram; los registros antiguos sin el campo siguen siendo válidos. En creación el texto se recorta y vacío se omite; en actualización el campo ausente no cambia y el vacío recortado se traduce a `$unset`.
- Validaciones: `bun run test --filter=@damaca/billing-poc`: 971 pruebas, 0 fallos; tras la limpieza de estilo, el test de schema ejecutó 33 pruebas, 0 fallos. `bun run type-check --filter=@damaca/billing-poc`: correcto. Build Turbopack estándar falló porque el entorno denegó abrir un puerto interno; `bun run build --filter=@damaca/billing-poc -- --webpack` completó correctamente. `bun run lint --staged`: 10 archivos, sin hallazgos; `git diff --cached --check`: correcto. Cache remota de Turbo no disponible.
- Sin migración ni dependencias nuevas. Commit `2ac52e8`; push a `origin/int` correcto y SHA remoto verificado (`2ac52e823891143c76baa9526763486f44b9290c`).



## BILL-03 — Alineación de acciones en tarjetas

- Inicio: 2026-11-01, rama `int`, base `e56ef56`, árbol limpio; capacidad 41 % en 5 h y 71 % en 7 d, suficiente para este ajuste y su cierre.
- Aceptación: [BILL-03](iterations.md#bill-03--alineación-de-acciones-en-tarjetas).
- Implementado: cabecera flex sin salto de línea para título e iconos de edición/borrado; grupo de importe y acciones de pago dentro del mismo `dd` flex. Se conservan los componentes, etiquetas accesibles, bloqueo durante generación y callbacks existentes. El título puede ocupar varias líneas sin desplazar los iconos a otra fila; los metadatos completos pueden distribuirse en varias filas en móvil.
- Validación: Biome del componente correcto; `bun run type-check --filter=@damaca/billing-poc` correcto; `bun run test --filter=@damaca/billing-poc`: 966 pruebas, 0 fallos; `bun run build --filter=@damaca/billing-poc -- --webpack` correcto. Revisión estática de grupos flex y anchos móviles; no se han añadido pruebas que reproduzcan el JSX ni repetido la prueba funcional de pagos. `bun run lint --staged`: 4 archivos, sin hallazgos; `git diff --cached --check`: correcto.
- Commit/push y SHA remoto se verifican al cerrar y se comunican en el cierre; este registro no anticipa publicación.

## BILL-04 — Prepaid y agrupación por pago

- Inicio: 2026-11-01, rama `int`, base `83bf72a`, árbol limpio. Capacidad inicial: 35 % en 5 h y 71 % en 7 d; margen estimado suficiente para el corte completo y las reservas.
- Decisión del usuario: Prepaid informativo; generar el pago por el total, sin descontar el anticipo.
- Aceptación: [BILL-04](iterations.md#bill-04--prepaid-y-agrupación-por-pago).
- Implementado: `prepaidAmount` reemplaza el porcentaje en entidad, esquema, persistencia, formulario y tarjetas. Importe EUR finito no negativo, con un máximo de dos decimales e inicial 0. Los registros sin importe se muestran con 0; el porcentaje antiguo no se convierte ni se expone, y se elimina al editar. Prepaid no participa en cálculos ni sincronización de pagos.
- Listado: separación por `paymentId`, conservando el orden por Deadline dentro de ambos grupos; las reservas pendientes permanecen en la lista principal. Sección nativa `details` With payment cerrada inicialmente, con contador y la misma tarjeta reutilizada; los enlaces siguen abriendo el detalle aunque el grupo esté cerrado.
- Móvil: cabecera título + iconos; cliente a ancho completo; Deadline y Prepaid en dos columnas; Total y acciones en una última fila completa. Deadline también renombrado en el formulario. Controles monetarios compartidos, sin nuevas dependencias.
- Validaciones: `bun run test --filter=@damaca/billing-poc`: 969 pruebas, 0 fallos, 93 archivos; tipos correctos. Biome explícito sobre los 12 archivos TypeScript nuevos/editados: sin hallazgos. Build final con `bun run build --filter=@damaca/billing-poc -- --webpack`: correcto. `bun run lint --staged`: 16 archivos, sin hallazgos; `git diff --cached --check`: correcto.
- Navegador/API reales: base desechable `billing_prepaid_qa_20261101`. Verificadas cuatro filas a 390×844 y escritorio a 1440×900, Prepaid con céntimos guardado desde formulario (35,75 €), generación por el total (121 €), traslado inmediato a With payment y apertura del pago, contador actualizado y sección cerrada tras recargar. Cambio posterior de Prepaid a 40,25 € por API devolvió `paymentSync: unchanged` y conservó total y timestamp del pago. Orden por fecha dentro de la sección expandida correcto. Consola sin warnings/errores. Base temporal eliminada y servidores detenidos.
- Evidencia: [cuatro filas móviles y sección cerrada](evidence/commissions-prepaid-mobile.jpg), [grupos en escritorio](evidence/commissions-prepaid-groups.jpg). El bloque generado por Next se retiró del diff.
- Capacidad antes del cierre: 24 % en 5 h y 69 % en 7 d. Commit, push y SHA remoto se verifican al cerrar y se comunican en el cierre; este registro no anticipa publicación.

## BILL-05 — Etiquetas e importes en línea

- Inicio: 2026-11-01, rama `int`, base `d0213cc`, árbol limpio. Capacidad inicial: 19 % en 5 h y 68 % en 7 d; margen suficiente para el ajuste completo conservando reservas.
- Aceptación: [BILL-05](iterations.md#bill-05--etiquetas-e-importes-en-línea).
- Implementado: Client, Deadline y Prepaid usan `dt`/`dd` inline con dos puntos y espacio; Total comparte contenedor flex con importe y botones. Se conserva la estructura de cuatro filas móviles y el grupo de acciones del título. La distribución de escritorio empieza en `lg` para evitar comprimir los valores en línea en anchuras intermedias.
- Validaciones observadas: `bun run type-check --filter=@damaca/billing-poc` correcto; `bun run test --filter=@damaca/billing-poc`: 969 pruebas, 0 fallos. Revisión estática del marcado semántico y de las clases responsive. Sin nuevos tests para reproducir este cambio de presentación. `bun run lint --staged`: 4 archivos, sin hallazgos; `git diff --cached --check` y enlaces locales correctos; `bun run build --filter=@damaca/billing-poc -- --webpack`: correcto (10,959 s).
- Commit, push y SHA remoto se verifican al cerrar y se comunican en el cierre; este registro no anticipa publicación.

## BILL-06 — Etiqueta de encargos pagados

- Inicio: 2026-11-01, rama `int`, base `3887644`, árbol limpio. Capacidad inicial: 13 % en 5 h y 67 % en 7 d; cambio acotado a una etiqueta y su planificación.
- Aceptación: [BILL-06](iterations.md#bill-06--etiqueta-de-encargos-pagados).
- Implementado: el encabezado de la sección pasa de `With payment (n)` a `Paid (n)`; se conserva el conteo de pagos vinculados y el comportamiento cerrado por defecto.
- Validación: Biome sobre los cuatro archivos modificados correcto; `bun run type-check --filter=@damaca/billing-poc` correcto; `bun run test --filter=@damaca/billing-poc`: 969 pruebas, 0 fallos. `git diff --check` correcto. Se verificó por inspección que el contador y el `<details>` permanecen intactos.
- Commit/push y SHA remoto se verifican al cerrar.

## BILL-07 — Navegación fija al hacer scroll

- Inicio: 2026-11-01, rama `int`, base `51617ca`, árbol limpio y sin commits locales pendientes. Capacidad inicial: 12 % en 5 h y 67 % en 7 d; cambio CSS acotado con margen estimado suficiente para validación y cierre conservando reservas.
- Aceptación: [BILL-07](iterations.md#bill-07--navegación-fija-al-hacer-scroll).
- Implementado: `sticky top-2 z-30` en la barra compartida y `overflow-x-clip` en PageLayout para conservar el recorte horizontal sin crear un ancestro de scroll que impida sticky. Conservados colores, ancho y margen superior; overlays y modales existentes usan `z-50`.
- Validación: `bun run type-check --filter=@damaca/billing-poc` correcto; `bun run test --filter=@damaca/billing-poc`: 969 pruebas, 0 fallos; `bun run build --filter=@damaca/billing-poc -- --webpack` correcto. `bun run lint --changed --since=51617ca` no seleccionó archivos sin preparar; `bun run lint --staged` comprobó los cinco archivos sin hallazgos. `git diff --cached --check` correcto.
- Revisión estática: páginas bajo PageLayout comparten el ajuste; sticky conserva espacio en el flujo y queda bajo los overlays. Revisión React sin lógica adicional, efectos ni dependencias. Sin prueba visual en navegador ni nuevos tests que reproduzcan clases CSS.
- La preparación inicial encontró la restricción de escritura de `.git`; repetida con permisos ampliados correctamente. Commit, push y SHA remoto se verifican al cerrar.

## BILL-08 — Márgenes opacos de navegación

- Inicio: 2026-11-01, rama `int`, base `e1ffcb2`, árbol limpio. Capacidad inicial: 11 % en 5 h y 67 % en 7 d; margen estimado suficiente para este ajuste CSS y cierre conservando reservas.
- Aceptación: [BILL-08](iterations.md#bill-08--márgenes-opacos-de-navegación).
- Implementado: posición sticky trasladada a una franja de PageLayout con fondo opaco claro/oscuro, padding superior e inferior y ancho completo del viewport. Barra centrada con el ancho máximo existente; contenido principal a continuación sin duplicar el espacio inferior. Menú y barra comparten la capa de navegación, por debajo de modales.
- Validación: `bun run lint --staged` comprobó cinco archivos sin hallazgos; `bun run type-check --filter=@damaca/billing-poc` correcto; `bun run test --filter=@damaca/billing-poc`: 969 pruebas y 0 fallos; `bun run build --filter=@damaca/billing-poc -- --webpack` correcto. `git diff --cached --check` correcto. La caché remota no estaba disponible; los comandos locales completaron correctamente.
- Revisión estática de anchura, padding, fondos y capas en ambos temas; sin nuevos efectos, listeners ni dependencias. Sin comprobación visual en navegador. Commit, push y SHA remoto se verifican al cerrar.

## BILL-11 — Traducción de la interfaz al español

- Inicio: 2026-11-01, rama `int`, base `36ccd49`; árbol limpio. Capacidad inicial: 100 % en 5 h y 66 % en 7 d.
- Aceptación: [BILL-11](iterations.md#bill-11--traducción-de-la-interfaz-al-español).
- Decisión del usuario: mostrar `Commissions` como `Encargos`.
- Implementado: navegación y las secciones de autenticación, clientes, encargos, eventos, facturas, pagos mensuales/anuales, productos, ausencias y WordPress traducidas. Incluidos formularios, tablas, botones, mensajes y errores, estados vacíos, placeholders, etiquetas accesibles y metadatos. Documento con `lang="es"`; fechas y meses con `es-ES`; marcas y valores internos de API conservan su identidad.
- Validación: Biome explícito en los 122 archivos TSX modificados y `bun run lint --staged` (124 archivos): correcto. `bun run type-check --filter=@damaca/billing-poc`: correcto. `bun run build --filter=@damaca/billing-poc`: Turbopack no pudo enlazar un puerto interno (`Operation not permitted`); `bun run build --filter=@damaca/billing-poc -- --webpack`: correcto, con todas las rutas compiladas. `git diff --check`: correcto. No se ejecutaron pruebas.
- La opción semántica de “Commissions” fue confirmada como “Encargos”. Los valores de factura/recibo de la API se conservaron, traduciendo solo las etiquetas visibles.
- Publicación: commit `ccab1a73340fe1bdb5537ddf4c9bfdcd20a58960` en `int`; `git ls-remote origin refs/heads/int` confirmó el mismo SHA.
- Capacidad al cierre: 97 % restante en 5 h y 66 % en 7 d.

## BILL-12 — Cocciones y plantillas

- Inicio: 2026-11-01, rama `int`, base `46ba740`, árbol limpio y sin commits pendientes de publicar. Capacidad: 96 % restante en 5 h y 65 % en 7 d; estimación conservadora suficiente para implementación, comprobaciones, reparaciones y publicación manteniendo reservas.
- Aceptación: [BILL-12](iterations.md#bill-12--cocciones-y-plantillas).

- Implementado: página `/firings` y navegación Cocciones, almacenamiento independiente, CRUD autenticado y flujo de pagos compartido con Encargos. La factory de rutas recibe colección/tag desde el servidor; el cliente no puede elegirlos. El adaptador reutiliza las reservas atómicas y el servicio genera tag `Cocción`. Sin nuevas dependencias.
- UI: título y opcionales, conceptos/IVA, selector de plantillas que copia valores, sin campo de anticipo. Plantillas al inicio cerradas por defecto; CRUD de nombre y precio con tabla, iconos y modal comunes. Listado y modal comparten las acciones efectivo/tarjeta/transferencia y apertura. El modal persiste antes de convertir y conserva el ID guardado para reintentar sin crear otro registro. Se mantienen sincronización, protección de facturas, grupos con pago, navegación bidireccional y limpieza de vínculos. Etiquetas de conceptos compartidas en español.
- Tipos: `bun run type-check --filter=@damaca/billing-poc`, correcto. Build: `bun run build --filter=@damaca/billing-poc -- --webpack`, correcto (13,41 s en la compilación final). Revisión React/Next.js: SWR con claves primitivas por recurso, sin peticiones desde componentes, lista de plantillas con carga diferida hasta expandir; modales, campos y controles etiquetados y estilos claros/oscuros.
- Suite: `bun run test --filter=@damaca/billing-poc` ejecutó 977 pruebas: 963 correctas y 14 fallidas. Comparación hermética con `git archive 46ba740` en `/tmp` y las mismas dependencias: 971 pruebas, 957 correctas y exactamente los mismos 14 fallos. Son expectativas previas en inglés de PaymentActions, formatters, eventsUi y calendarios; ningún fallo nuevo. Las seis pruebas añadidas pasan (tags/concurrencia/reintentos/protección de facturas, aislamiento SWR, validación y copia de plantillas). La suite completa sigue sin estar verde por estos fallos previos; no se modificaron tests ajenos para ocultarlos.
- API → Mongo real: instancia local de la compilación con secreto y usuario ficticios exclusivos de QA; base temporal `billing_firings_qa_20261101`. Verificados CRUD de plantillas, precio cero, validación, conversión sin conceptos rechazada, diez solicitudes concurrentes con un pago único, tag `Cocción`, cálculo 121/100/21 sin cliente, aislamiento de Encargos/productos, consulta inversa, eliminación real de opcionales sin nulls, sincronización, protección de factura, limpieza de vínculo, regeneración, conservación del pago al borrar cocción y rechazo de autenticación inválida en ambas APIs. Se eliminan la base y procesos temporales al terminar.
- Navegador real, tema oscuro: creación de plantilla y cocción, búsqueda/selección, pago por tarjeta desde el modal, enlace inverso, edición/apertura del pago, alta con fecha/descripción y pago en efectivo desde listado. Recarga confirma plantillas y pagadas cerradas por defecto. Verificado viewport 390×844 sin desbordamiento horizontal (`scrollWidth = clientWidth = 390`) y escritorio 1440×900. Evidencia: [listado y plantillas](evidence/firings-desktop.jpg), [formulario móvil](evidence/firings-form-mobile.jpg).
- Comprobación focalizada final: `bun run --filter @damaca/billing-poc test src/features/commissions src/features/firings src/lib/domain/services/commission-service.test.ts src/lib/domain/entities/commission.test.ts src/lib/db/repositories/mongo-commission-repository-helpers.test.ts src/lib/db/repositories/ensure-indexes.test.ts src/schemas/commission-validator.test.ts src/schemas/firing-template-validator.test.ts`: 41 pruebas, 0 fallos. Enlaces locales de planificación y `git diff --check` correctos. Base temporal eliminada y procesos de prueba detenidos.
- Cierre técnico: `bun run lint --staged` comprobó 40 archivos sin hallazgos; `git diff --cached --check` correcto. Durante implementación se corrigieron la inferencia genérica de SWRMutation y los avisos Biome; `turbo run start` no está definido y la instancia se arrancó mediante el filtro Bun desde raíz. La conexión loopback necesitó permisos fuera del sandbox. Capacidad antes de publicar: 78 % restante en 5 h y 63 % en 7 d. Commit, push a `origin/int` y SHA remoto se verifican al cerrar; este registro no anticipa publicación.
