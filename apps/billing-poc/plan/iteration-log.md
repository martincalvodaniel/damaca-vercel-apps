# Registro de entregas

## BILL-09 — Instagram de clientes

- Inicio: 2026-11-01, rama `int`, base `a697800`, árbol limpio. Capacidad inicial: 10 % en 5 h y 67 % en 7 d.
- Aceptación: [BILL-09](iterations.md#bill-09--instagram-de-clientes).
- Implementado: `instagram` opcional en entidad/formulario, validación, puerto y adaptador Mongo. Formulario de alta/edición y tabla muestran Instagram; los registros antiguos sin el campo siguen siendo válidos. En creación el texto se recorta y vacío se omite; en actualización el campo ausente no cambia y el vacío recortado se traduce a `$unset`.
- Validaciones: `bun run test --filter=@damaca/billing-poc`: 971 pruebas, 0 fallos; tras la limpieza de estilo, el test de schema ejecutó 33 pruebas, 0 fallos. `bun run type-check --filter=@damaca/billing-poc`: correcto. Build Turbopack estándar falló porque el entorno denegó abrir un puerto interno; `bun run build --filter=@damaca/billing-poc -- --webpack` completó correctamente. `bun run lint --staged`: 10 archivos, sin hallazgos; `git diff --cached --check`: correcto. Cache remota de Turbo no disponible.
- Sin migración ni dependencias nuevas. Commit, push y verificación del SHA remoto pendientes de cierre.

## BILL-01 — Commissions

- Inicio: 2026-11-01, rama `int`, base `96605a8`; árbol limpio y sin commits locales pendientes de publicación.
- Capacidad inicial: 94 % restante en 5 h y 80 % en 7 d; margen estimado suficiente para implementación, validación, reparación y publicación conservando las reservas del workflow.
- Alcance y aceptación: [BILL-01](iterations.md#bill-01--commissions).
- Implementado: CRUD autenticado en `/commissions` y `/api/commissions`, campos opcionales eliminables, orden determinista, progreso manual, catálogo sin stock, IVA y pago único con navegación bidireccional. Reserva Mongo atómica con ID de pago reutilizable, recuperación de inserción/enlace fallidos y bloqueo de edición/borrado mientras se completa. Sincronización protegida por facturas generadas; eliminación del pago limpia el vínculo y eliminación del encargo conserva el pago.
- Reutilización: `PageLayout`, modales, selector de clientes, editor de conceptos, SWR y calculador financiero. El editor permite lista vacía solo cuando corresponde y ahora muestra correctamente importes cero. La navegación pasa a menú compacto antes de `xl` para alojar Commissions sin recortes.
- Decisiones y terminología: [master](master.md), [Commission](../GLOSSARY.md) e [índice de contextos](../../../GLOSSARY-MAP.md). El progreso se envía como parche independiente; los campos opcionales vacíos conservan su intención de borrado al serializar JSON.
- Validaciones observadas: `bun run test --filter=@damaca/billing-poc`: 960 pruebas, 0 fallos en 89 archivos; `bun run type-check --filter=@damaca/billing-poc`: correcto. Biome explícito sobre los 35 archivos TypeScript nuevos/editados: sin hallazgos. Revisión React/Next.js: sin peticiones desde componentes, hooks con claves primitivas, carga diferida del detalle de pago, controles etiquetados y modales accesibles.
- API → Mongo real: base desechable `billing_commissions_qa_20261101`, sesión local con secreto exclusivo de prueba. Diez solicitudes simultáneas devolvieron un único pago. Verificados rechazo sin conceptos, generación sin cliente y cálculos, progreso independiente, eliminación de opcionales, sincronización, consulta inversa, limpieza y regeneración del vínculo, conservación del pago al borrar encargo y rechazo de autenticación inválida. Consulta directa a Mongo confirmó stock intacto, fecha persistida y pago facturado intacto con aviso `paymentSync: invoiced`. Base temporal eliminada al terminar; sin modificaciones a datos de billing ni credenciales del repositorio.
- Navegador real: alta con producto, edición y fecha límite, generación y apertura del pago y regreso al encargo con apertura automática. Comprobación a 390×844 y 1440×1000, modo oscuro, consola sin warnings/errores. El control de fecha usa `onInput` tras detectar que el cambio del control nativo no llegaba al estado con `onChange`. Evidencia: [móvil](evidence/commissions-mobile.jpg), [formulario móvil](evidence/commissions-form-mobile.jpg), [escritorio](evidence/commissions-desktop.jpg). El modo claro se ha revisado en las clases; no se alteró la preferencia global del sistema para capturarlo.
- Build: el comando estándar encontró restricciones del entorno (descarga inicial de Google Fonts; después Turbopack no pudo abrir un puerto interno). `bun run build --filter=@damaca/billing-poc -- --webpack` completó correctamente. Verificación final tras los ajustes de navegador: correcta (10,495 s, todas las rutas compiladas).
- `next dev` añadió automáticamente un bloque a `AGENTS.md`; se retiró esa modificación generada del diff. Sin nuevas dependencias ni migraciones de datos existentes.
- Capacidad antes del cierre: 71 % restante en 5 h y 76 % en 7 d. El resultado de commit, push y comprobación del SHA remoto se comunica al cerrar; este registro no anticipa su publicación.

- Cierre local: `git diff --check` correcto; enlaces locales de la documentación verificados. Lint final con `bun run lint --staged`: 40 archivos comprobados, sin hallazgos ni cambios.

## BILL-02 — Cohesión de Commissions

- Inicio: 2026-11-01, rama `int`, base `a34fc61`, árbol limpio. Capacidad inicial: 66 % en 5 h y 75 % en 7 d; margen suficiente para el corte completo y las reservas.
- Aceptación: [BILL-02](iterations.md#bill-02--cohesión-de-commissions).
- Implementado: `AddButton` para alta e `IconButton` con `PencilIcon`/`TrashIcon` para edición/borrado. Cabecera, `EmptyState`, `FormField`, asterisco obligatorio y `NumberStepperInput` reutilizados. Eliminado el estilo de botón exclusivo de Commissions.
- Componentes compartidos: las acciones de pago de `AttendeeRow` se extrajeron a `PaymentActions`; Eventos y Commissions usan los mismos iconos efectivo/tarjeta/transferencia y badge `€ ✓`. `BinaryToggle` delega en `SegmentedControl`, que conserva sus etiquetas, indicador, colores y leading, y permite tres porcentajes visibles. `ProductSelector` reutiliza `ClientQueryInput` y SWR de productos, con búsqueda filtrada, precios, adición por clic/Enter y estado sin resultados. La selección mantiene identidad de producto y no modifica stock.
- Corrección detectada en navegador: sustituido el cierre diferido del buscador por detección de foco dentro/fuera del control compartido; evita cerrar un desplegable recién enfocado y permite navegar entre sus sugerencias con teclado.
- Pagos nuevos de encargos: tag `Encargo`; sin migraciones ni compatibilidad con la etiqueta anterior. La reserva y recuperación de generación se conservan.
- Validación: `bun run test --filter=@damaca/billing-poc`: 966 pruebas, 0 fallos, 92 archivos. `bun run type-check --filter=@damaca/billing-poc`: correcto. Biome sobre los 16 archivos TypeScript nuevos/editados existentes: sin hallazgos; `bun run build --filter=@damaca/billing-poc -- --webpack`: correcto (13,009 s). `bun run lint --staged`: 19 archivos, sin hallazgos ni cambios; `git diff --check` y enlaces locales correctos.
- Navegador/API/Mongo: base temporal `billing_cohesion_qa_20261101`, sesión con secreto exclusivo de pruebas. Verificados alta por icono, selección 0/50/100, búsqueda que reduce tres productos a dos, búsqueda sin resultados, selección por clic y por Enter sin guardar el formulario, creación con dos conceptos, pago por tarjeta, tag `Encargo`, total y stock intactos. Comparado y generado un pago de efectivo desde Eventos con el mismo componente; confirmado el indicador para abrir el pago en ambos contextos. Consola sin warnings/errores. Revisados escritorio 1440×900 y móvil 390×844 en modo oscuro; la preferencia global no se modificó.
- Evidencia: [iconos y cabecera](evidence/commissions-cohesion-desktop.jpg), [buscador y triestado](evidence/commissions-cohesion-form.jpg), [móvil](evidence/commissions-cohesion-mobile.jpg). Base temporal eliminada y servidores de pruebas detenidos. El bloque de instrucciones generado por Next se retiró del diff; sin nuevas dependencias.
- Capacidad antes del cierre: 46 % en 5 h y 72 % en 7 d. Commit/push y SHA remoto se verifican al cerrar y se comunican en el cierre; este registro no anticipa publicación.

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
