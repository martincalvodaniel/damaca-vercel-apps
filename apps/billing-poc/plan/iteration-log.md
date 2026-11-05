# Registro de entregas

Archivo histórico: [BILL-01 y BILL-02](archive/2026-11-01/bill-01-02.md), [BILL-03](archive/2026-11-01/bill-03.md), [BILL-04](archive/2026-11-01/bill-04.md), [BILL-05](archive/2026-11-01/bill-05.md), [BILL-06](archive/2026-11-02/bill-06.md), [BILL-07](archive/2026-11-02/bill-07.md), [BILL-08](archive/2026-11-02/bill-08.md), [BILL-09](archive/2026-11-02/bill-09.md), [BILL-10](archive/2026-11-02/bill-10.md), [BILL-11](archive/2026-11-02/bill-11.md).

Archivo adicional: [BILL-12](archive/2026-11-05/bill-12.md), [BILL-13](archive/2026-11-05/bill-13.md).

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

## BILL-17 — Alta mensual, orden de cocciones y traducción de facturas

- Inicio: 2026-11-02, rama `int`, árbol limpio y sin commits pendientes de publicación. Capacidad: 87 % restante en 5 h y 53 % en 7 d; estimación suficiente para implementar, validar y publicar manteniendo reservas.
- Aceptación: [BILL-17](iterations.md#bill-17--alta-mensual-orden-de-cocciones-y-traducción-de-facturas).

- Implementado: Mes mantiene el + junto a plantillas y añade otro en navegación con el mismo callback. Cocciones sitúa Pagadas antes de las vigentes, preservando cierre inicial, contador, tarjetas y el orden de Encargos.
- Facturas: traducidos estado vacío, nombres de las cuatro series, numeración, listado, fecha del pago y todos los textos de revisión/reducción. Errores de carga en español; las cuatro causas de rechazo de reducción conservan su significado mediante mensajes españoles, sin mostrar mensajes internos ingleses. Fallbacks de mutación también en español; valores internos y prefijos sin cambios.
- Revisión React: slot compartido de navegación, callbacks y SWR existentes, sin dependencias ni efectos nuevos. La misma sección de pagadas se renderiza una sola vez según el contexto. Iconos etiquetados y estilos claros/oscuros conservados. Sin verificación visual interactiva; revisión estática de orden y callbacks.
- Se archiva BILL-07 para conservar diez entregas recientes. Validación y publicación se registran al cerrar.
- Validación final: `bun run type-check --filter=@damaca/billing-poc`, correcto; `bun run test --filter=@damaca/billing-poc`, 992 correctas, 0 fallos y 1802 assertions; `bun run build --filter=@damaca/billing-poc -- --webpack`, correcto (9,566 s). Biome explícito sobre los ocho TS/TSX editados sin hallazgos tras formato. Caché remota de Turbo no disponible; comprobaciones locales completas. Lint preparado, diff check, commit, push y SHA remoto se verifican al cierre.

## BILL-18 — Navegación de escritorio

- Inicio: 2026-11-02, rama `int`, árbol limpio y sin commits locales pendientes. Capacidad inicial: 81 % en 5 h y 52 % en 7 d; estimación suficiente para completar y publicar con reservas.
- Aceptación: [BILL-18](iterations.md#bill-18--navegación-de-escritorio).

- Implementado: identificación Billing/título con `xl:hidden`; menú de escritorio antes del slot de acciones en el DOM y controles en una fila inferior de ancho completo. En móvil, el menú de escritorio sigue oculto y se mantiene título → acciones → botón de menú. Se conservan eventos, sesión, estilos, navegación fija y breakpoints.
- Revisión React/accesibilidad: cambio limitado a estructura y clases responsive, sin hooks/efectos nuevos, elementos duplicados ni cambios de callbacks. Orden de tabulación de escritorio alineado con menú → controles. No se realizó comprobación visual interactiva; revisión estática.
- Se archiva BILL-08 para mantener diez entregas recientes.
- Validación: Biome del componente sin hallazgos; `bun run type-check --filter=@damaca/billing-poc` correcto; `bun run test --filter=@damaca/billing-poc`: 992 correctas, 0 fallos y 1802 assertions; `bun run build --filter=@damaca/billing-poc -- --webpack` correcto (10,044 s). Caché remota de Turbo no disponible; comprobaciones locales completas. Enlaces locales de planificación y diff check correctos. Lint preparado, commit, push y SHA remoto se verifican al cierre.

## BILL-19 — Controles de cabecera en navegación de escritorio

- Inicio: 2026-11-02, rama `int`, árbol limpio y sin commits pendientes. Capacidad: 78 % en 5 h y 51 % en 7 d; estimación suficiente para entrega completa con reservas.
- Aceptación: [BILL-19](iterations.md#bill-19--controles-de-cabecera-en-navegación-de-escritorio).

- Implementado: opción compartida de PageLayout para integrar la cabecera en el bloque fijo de escritorio. Activada en Ausencias, Eventos, Mes, Productos y Año. Navegación y controles comparten bordes continuos en escritorio; el bloque completo conserva franja opaca y posición fija.
- Móvil: contenedores de agrupación con `display: contents`; solo la navegación continúa fija y los controles siguen en el flujo de la página, con separación equivalente. CSS determina el layout: sin listeners de tamaño, portales, duplicación de controles ni remontajes al redimensionar. Los otros layouts no activan la opción. Los dos + de Mes se conservan.
- Revisión React/accesibilidad: solo composición y clases responsive; mismos hooks/callbacks, IDs, orden de controles y estado de formulario. Sin nuevas dependencias. Se archiva BILL-09 para mantener diez entregas recientes. Sin comprobación visual interactiva en navegador; revisión estática del árbol y clases.
- Validación: `bun run type-check --filter=@damaca/billing-poc` correcto; `bun run test --filter=@damaca/billing-poc`: 992 pruebas correctas, 0 fallos y 1802 assertions; `bun run build --filter=@damaca/billing-poc -- --webpack` correcto (16,48 s). Biome sobre los siete TSX editados sin hallazgos tras corregir un aviso de ternario; caché remota de Turbo no disponible y comprobaciones locales completas. Enlaces y diff check verificados. Lint preparado, commit, push y SHA remoto se verifican al cierre.

## BILL-20 — Una fila de controles en escritorio

- Inicio: 2026-11-02, rama `int`, árbol limpio y sin commits locales pendientes. Capacidad: 75 % en 5 h y 51 % en 7 d; estimación suficiente para completar y publicar con reservas.
- Aceptación: [BILL-20](iterations.md#bill-20--una-fila-de-controles-en-escritorio).

- Implementado: NavigationBar oculta en escritorio la fila de altas separada cuando hay cabecera integrada. Eventos incorpora su + junto al selector mensual; Productos junto al buscador y acciones, con filtros en la misma banda horizontal. Mes reutiliza el + ya existente junto a plantillas y oculta el superior solo en escritorio.
- Móvil: las altas superiores mantienen visibilidad y los botones adicionales de las cabeceras de Eventos/Productos se ocultan. Mes conserva sus dos +. Los controles con estado no se duplican; los botones de alta sin estado comparten exactamente sus callbacks. Sin cambios de datos, dependencias ni efectos.
- Revisión estática de clases responsive, árbol, labels y callbacks; no se realizó verificación visual interactiva en navegador. Se archiva BILL-10 para mantener diez entregas recientes.
- Validación: Biome sobre cinco TSX editados sin hallazgos; `bun run type-check --filter=@damaca/billing-poc` correcto; `bun run test --filter=@damaca/billing-poc`: 992 correctas, 0 fallos y 1802 assertions; `bun run build --filter=@damaca/billing-poc -- --webpack` correcto (10,676 s). Caché remota de Turbo no disponible; comprobaciones locales completas. Enlaces locales comprobados. Lint preparado, diff check, commit, push y SHA remoto se verifican al cerrar.

## BILL-21 — Ausencias localizadas y tabla de pagos del cliente

- Inicio: 2026-11-02, rama `int`, árbol limpio y sin commits pendientes. Capacidad: 72 % en 5 h y 50 % en 7 d; estimación suficiente para implementación, validación y publicación con reservas.
- Aceptación: [BILL-21](iterations.md#bill-21--ausencias-localizadas-y-tabla-de-pagos-del-cliente).

- Ausencias: columnas reducidas a Ausencias/Recuperaciones/Última ausencia; Mañana/Tarde, Alumno/a y Fecha, tipos y vacíos traducidos. Modales de día y alumno con stableHeight (100dvh menos márgenes), scroll interno y foco inicial en el contenedor; el controlador inline omite foco en el nombre al editar y conserva scroll/restauración de foco. Confirmaciones de estos modales en español.
- Calendarios: constantes compartidas lun/mar/mié/jue/vie/sáb/dom, orden lunes→domingo, reutilizadas por Ausencias y Eventos.
- Clientes: botón de lápiz antes de papelera, con stopPropagation y ClientFormModal existente; conserva enlace a ficha y copia de contactos. Actividad usa PaymentsView extraída de la vista mensual, sin nueva consulta mensual. Misma tabla/filtros/orden/columnas compacto-todo, exportación y modales de detalle/duplicado/borrado; fecha completa en modo historial y limpieza de deep links sin añadir parámetros de mes. Excel incluye todo el historial y nombre de archivo por cliente. Las mutaciones existentes invalidan actividad automáticamente.
- Regresiones: render de tabla con fechas de dos años, controles/filtros/acciones, fecha corta conservada en Mes, siete encabezados españoles y orden editar→borrar en clientes. Expectativas de etiquetas de ausencia actualizadas al español. Se archiva BILL-11 para mantener diez entregas recientes.
- Revisión React: SWR existente, sin fetch ni efectos de datos nuevos; modales de pago continúan diferidos; callbacks estables, fechas y moneda compartidas, foco de teclado y estilos claros/oscuros conservados. No hay verificación visual interactiva ni prueba del teclado virtual en dispositivo; el foco se revisa en la implementación y la traducción/tabla mediante render estático.
- Validación final: `bun run type-check --filter=@damaca/billing-poc`, correcto; `bun run test --filter=@damaca/billing-poc`: 995 correctas, 0 fallos, 100 archivos y 1824 assertions; `bun run build --filter=@damaca/billing-poc -- --webpack`, correcto (9,474 s). Biome de todos los TS/TSX editados/nuevos sin hallazgos después de corregir imports y estabilizar un callback. Caché remota de Turbo no disponible; comprobaciones locales completas. Enlaces y diff check correctos; lint preparado, commit, push y SHA remoto se verifican al cierre.

## BILL-22 — Fecha y hora de eventos y favicon original

- Inicio: 2026-11-05, rama `int`, base `3f6fd27`, árbol limpio y sin commits pendientes. Capacidad: 98 % en 5 h y 21 % en 7 d; estimación suficiente para una entrega pequeña completa con reservas.
- Aceptación: [BILL-22](iterations.md#bill-22--fecha-y-hora-de-eventos-y-favicon-original).

- Implementado: columnas Fecha y Hora independientes; recurrentes sin día de anclaje, puntuales con día semanal calculado en UTC y sin año visible, fechas parciales sin completar y hora ausente «—». Sin cambios de acciones, orden, estado ni consultas. Revisión React: reutiliza callbacks/memoización existentes; sin efectos ni dependencias nuevas.
- Favicon: ICO original recuperado de `6e9d659^`, verificado visualmente como sello rojo de La Bottega di Pali. SVG incorpora el PNG original de 48 px; regeneradas variantes Apple/instalación con la fuente recuperada. El ICO coincide byte a byte con el original. La resolución disponible del original limita la nitidez de las variantes grandes. Catálogo del hub fuera del alcance de esta entrega.
- Validación: tipos correctos; 998 pruebas correctas, 0 fallos, 1835 assertions; build webpack correcto (18,001 s). Biome explícito sobre los tres archivos de código correcto tras formato; el lint incremental sin preparar no seleccionó archivos, por lo que se valida además con lint preparado. Caché remota de Turbo no disponible; comprobaciones locales completas. No se realizó verificación interactiva de navegador.
- Se archiva BILL-12 para conservar diez entregas recientes. Capacidad antes de cierre: 96 % en 5 h y 21 % en 7 d. Publicación y SHA remoto se verifican al cerrar.

## BILL-23 — Menú de navegación en anchuras intermedias

- Inicio: 2026-11-05, rama `int`, base `0d524d0`, árbol limpio. Capacidad: 92 % en 5 h y 20 % en 7 d; margen suficiente para una entrega pequeña completa.
- Aceptación: [BILL-23](iterations.md#bill-23--menú-de-navegación-en-anchuras-intermedias).
- Reproducción estática antes del arreglo: el botón con `xl:hidden` está visible a 800/1100 px mientras el overlay con `sm:hidden` está oculto; a 390 px ambos visibles y a 1280 px ambos ocultos. Esto coincide con el síntoma aportado. No se añade una prueba que solo replique clases de implementación.

- Fix: `MobileMenuOverlay` cambia `sm:hidden` por `xl:hidden`, alineado con NavigationBar. Comparación posterior a 390/800/1100/1280 px correcta: ambos visibles por debajo de xl y ocultos desde xl. Sin cambios de hooks, foco, cierre, acciones ni datos; revisión React del cambio de CSS.
- Validación: Biome del componente correcto; tipos correctos; 998 pruebas correctas, 0 fallos; build webpack correcto (17,847 s). Caché remota no disponible; validación local completa. No se realizó comprobación interactiva en navegador. Se archiva BILL-13 para conservar diez entregas recientes.
- Prueba Vercel asociada: consulta previa al push confirma `enableAffectedProjectsDeployments: false` en card-wars y ningún Ignored Build Step configurado. No se modifica configuración remota. Los registros posteriores se consultan tras publicar; la ausencia de un registro no prueba por sí sola el contador interno de cuota.
