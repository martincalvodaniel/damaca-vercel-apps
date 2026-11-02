# Registro de entregas

Archivo histórico: [BILL-01 y BILL-02](archive/2026-11-01/bill-01-02.md), [BILL-03](archive/2026-11-01/bill-03.md), [BILL-04](archive/2026-11-01/bill-04.md), [BILL-05](archive/2026-11-01/bill-05.md), [BILL-06](archive/2026-11-02/bill-06.md).

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

## BILL-13 — Reparar las pruebas de localización

- Inicio: 2026-11-01, 21:26 UTC, rama `int`, base `115a8b2`, árbol limpio y sin commits pendientes de publicar. Capacidad inicial: 77 % restante en 5 h y 62 % en 7 d; margen estimado suficiente para reparación, validación y publicación conservando reservas.
- Aceptación: [BILL-13](iterations.md#bill-13--reparar-las-pruebas-de-localización).
- Reproducción: `bun run test --filter=@damaca/billing-poc`: 977 pruebas, 963 correctas y 14 fallidas (2,51 s). Los asserts fallidos muestran expectativas en inglés frente a fechas/etiquetas españolas. La revisión identifica además el sufijo inglés de plural añadido a días españoles (`martess`) y textos accesibles que mezclan ambos idiomas. La señal es directa y determinista; no se necesita instrumentación adicional ni bisección.
- Regresión antes del arreglo: las expectativas de salida españolas y los siete casos de días recurrentes se ejecutaron contra la implementación anterior: 68 pruebas, 55 correctas y 13 fallidas. El fallo exacto de pluralización y los textos accesibles mixtos quedan cubiertos por estas pruebas.
- Implementado: expectativas de PaymentActions y formatos de fecha alineadas con español, conservando controles sobre botones deshabilitados, métodos reservados, apertura e importes. Fechas recurrentes con «los» y plurales correctos para los siete días; fallback «Sin fecha». Calendarios de ausencias/eventos con anuncios completos en español, incluyendo singular/plural de ausencia, recuperación y evento. Sin instrumentación temporal ni nuevas dependencias.
- Validación final: `bun run test --filter=@damaca/billing-poc`: 984 pruebas correctas, 0 fallos, 95 archivos y 1761 assertions (564 ms). `bun run type-check --filter=@damaca/billing-poc`: correcto. `bun run build --filter=@damaca/billing-poc -- --webpack`: correcto (14,425 s). La caché remota de Turbo no estaba disponible; comprobaciones locales completadas. Sin prueba de navegador: se verifican las cadenas exactas desde los helpers reales y el render estático de PaymentActions.
- Cierre técnico: `bun run lint --staged` comprobó 12 archivos sin hallazgos; `git diff --cached --check` y enlaces locales correctos. Los 14 fallos originales quedan resueltos y hay siete casos adicionales de regresión. Publicación y SHA remoto se verifican al cerrar.

## BILL-14 — Cabeceras y acciones de modales

- Inicio: 2026-11-01, rama `int`, base `b6c2f69`, árbol limpio y sin commits pendientes. Capacidad: 69 % restante en 5 h y 61 % en 7 d; estimación suficiente para implementación, validación y publicación conservando reservas.
- Aceptación: [BILL-14](iterations.md#bill-14--cabeceras-y-acciones-de-modales).
- Implementado: Modal fija siempre la cabecera fuera del área con scroll y elimina las opciones de pie/cabecera móviles. ConfirmAction comparte el tick verde con etiqueta accesible y estado pendiente. Formularios anidados envían sus controles a la cabecera mediante portal y conservan asociación nativa `form`, validación y estado propio; fuera de modales mantienen acciones de texto. Migrados pagos, plantillas, clientes, productos, eventos, encargos/cocciones, WordPress, facturas y confirmaciones de borrado. El borrado global de registros de alumno pasa a la cabecera, junto al tick al editar; se conserva cancelar el subformulario y volver desde la revisión del contador.
- Revisión React y accesibilidad: sin nuevas dependencias ni peticiones de datos; iconos decorativos, labels/title, disabled/aria-busy, IDs de formularios únicos y foco conservado en el diálogo. Cabecera flex no reducible y títulos truncados para reservar espacio de acciones; estilos claros/oscuros y scroll interno. Inventario residual sin `footer`, `ConfirmFooter`, `stickyHeader` ni `stickyFooter` en el código de billing.
- Validación: suite de billing, 984 pruebas correctas, 0 fallos y 1761 assertions; type-check correcto. Primera comprobación detectó props residuales de la migración; corregidas y repetida correctamente. Biome explícito sobre todos los TS/TSX editados/nuevos sin hallazgos tras corregir los avisos. Enlaces locales de planificación correctos. Se archiva BILL-04 para conservar diez entregas recientes.
- Limitación visual: el inventario de Computer Use informa «Local browser use is disabled in Work settings»; no se realizó verificación visual interactiva ni se modificó esa preferencia. La suite existente y la revisión estática no acreditan por sí solas la apariencia en un navegador.
- Build final `bun run build --filter=@damaca/billing-poc -- --webpack`: correcto; type-check final correcto. La caché remota de Turbo no estaba disponible y se completaron las comprobaciones localmente. El lint preparado detectó una línea vacía sobrante en el archivo histórico; corregida antes de repetirlo. Commit, push y SHA remoto se verifican al cerrar.

## BILL-15 — Página de cliente

- Inicio: 2026-11-01, rama `int`, base `dfd86c2`, árbol limpio y sin commits locales pendientes. Capacidad: 49 % restante en 5 h y 58 % en 7 d; margen estimado suficiente para la entrega completa con reservas.
- Aceptación: [BILL-15](iterations.md#bill-15--página-de-cliente).

- Implementado: ficha `/clients/[id]` con datos y edición mediante el modal existente. Resumen histórico reutilizando el cálculo mensual, tarjetas y gráficos de etiquetas; no suma de nuevo los importes de encargos/cocciones. Tres secciones nativas `details` cerradas por defecto, contadores completos y vacíos; pagos abren su detalle, encargos/cocciones enlazan al editor existente. Navegación desde listado de clientes y pagos, conservando copiar contactos y borrar.
- Datos: endpoint autenticado con validación de ID, 400/404/500 y consulta paralela de pagos/encargos/cocciones tras comprobar el cliente. Filtros Mongo por cliente e índices en las tres colecciones; sin límite temporal ni paginación parcial. SWR evita datos del cliente anterior e invalida actividad desde cambios de clientes, pagos, encargos/cocciones y facturas.
- Validación: `bun run test --filter=@damaca/billing-poc`: 992 pruebas correctas, 0 fallos, 98 archivos y 1802 assertions. Ocho pruebas nuevas de servicio, helpers de caché y render estático cubren historial entre años, filtros por cliente, trabajos pagados/pendientes, error sin totales parciales, ausencia de cliente, contadores/cierre inicial y enlace accesible con copia de contactos. `bun run type-check --filter=@damaca/billing-poc`: correcto. El primer type-check detectó que la configuración no excluye pruebas `.test.tsx`; convertida la prueba de render a `.test.ts` con `createElement`, siguiendo el patrón existente. `bun run build --filter=@damaca/billing-poc -- --webpack`: correcto (20,075 s); caché remota de Turbo no disponible.
- Revisión React/accesibilidad: consultas por SWR, imports de dominio solo de tipo en cliente, gráficos/modal de pago dinámicos, memoización del resumen, enlaces nativos y foco claro/oscuro. Controles `details/summary` con semántica expandible nativa; columnas de datos adaptables y textos largos con ajuste. Se archiva BILL-05 para conservar diez entregas recientes.
- Comprobación de navegador: el servidor no pudo escuchar en 3000/3100 dentro del entorno restringido (`EADDRINUSE`). El arranque autorizado fuera de ese entorno en 3100 fue correcto. La navegación a `/clients` redirigió a `/auth/signin`; sin sesión autenticada disponible, no se verifica visualmente la ficha con datos reales ni el flujo completo Mongo → navegador. No se modifica la autenticación. Pestaña temporal cerrada al terminar.
- Cierre técnico: Biome sobre los TS/TSX editados/nuevos sin hallazgos; enlaces locales correctos. El primer lint preparado detectó una línea vacía sobrante al archivar BILL-05; corregida. `bun run lint --staged` y `git diff --cached --check` se repiten antes del commit. Commit, push y SHA remoto se verifican al publicar.

## BILL-16 — Simplificar cabeceras y altas

- Inicio: 2026-11-02, rama `int`, árbol limpio y sin commits locales pendientes. Capacidad inicial: 98 % restante en 5 h y 54 % en 7 d; estimación suficiente para entrega completa conservando reservas.
- Aceptación: [BILL-16](iterations.md#bill-16--simplificar-cabeceras-y-altas).
- Alcance: altas de página en navegación; las altas contextuales dentro de modales y plantillas conservan su contexto. Mes conserva su alta local.

- Implementado: slot explícito de acciones PageLayout → NavigationBar; + principal en Clientes, Productos, Eventos, Encargos y Cocciones. Clientes comparte la barra con el buscador a su derecha. Navegación permite envolver enlaces en escritorio y conserva menú móvil. Eliminados títulos/subtítulos redundantes; controles de periodo y filtros conservados; Mes mantiene su + y usa Compacto/Todo. Año traduce desglose, saldo mensual, selector Año/Ir y estado vacío.
- Revisión React/accesibilidad: mismos callbacks y hooks SWR, sin efectos ni dependencias nuevos; + con aria-label; controles y estilos de foco/modo oscuro preservados. No se hizo comprobación visual interactiva en navegador; la revisión responsive es estática.
- Validación: `bun run test --filter=@damaca/billing-poc`: 992 pruebas correctas, 0 fallos, 1802 assertions. `bun run type-check --filter=@damaca/billing-poc`: correcto tras corregir un error temporal de edición de JSX detectado por Biome/tipos. `bun run build --filter=@damaca/billing-poc -- --webpack`: correcto (16,519 s). Caché remota de Turbo no disponible; comprobaciones locales completas. Biome explícito sobre los 14 TSX editados sin hallazgos; lint preparado y diff check se verifican al cerrar.
- Archivo de BILL-06 para conservar diez entregas recientes; enlaces nuevos de planificación comprobados. Capacidad antes de publicar: 96 % en 5 h y 54 % en 7 d. Commit, push y SHA remoto se verifican al cierre.
