# Registro de entregas

Evidencia observada por entrega. El estado de cada iteración se consulta en `iterations.md`.

## Archivo

- [HM-01 — Receta y observaciones opcionales](archive/2026-11-02/iteration-log.md#hm-01--receta-y-observaciones-opcionales).
- [HM-02 — Listas compactas y limpieza de búsquedas](archive/2026-11-02/iteration-log.md#hm-02--listas-compactas-y-limpieza-de-búsquedas).

## HM-03 — Cabeceras y vista previa compactas

- Inicio: 2026-11-01. Rama `int`, árbol limpio y sin commits locales pendientes. Capacidad inicial: 90% de 5h y 92% de 7d. Estimación conservadora inferior a 7 y 2 puntos respectivamente; respeta reservas.
- Alcance y aceptación: [HM-03](iterations.md#hm-03--cabeceras-y-vista-previa-compactas).
- Reducido de 28–40px a 8px el padding superior de los gestores de Compra, Inventario y Platos. Ocultados visualmente en escritorio los bloques de presentación y títulos de lista redundantes; conservada su semántica accesible, títulos móviles y rango semanal.
- Acceso a vista previa reducido de al menos 80px a 46px, con contador numérico inmediatamente a la derecha del título y descripción accesible del número. Eliminada la segunda línea también cuando el contador es cero.
- Navegación y vaciado semanal en una fila, controles de 36px y texto «Esta semana» sin salto de línea a 320px. Se conserva la confirmación antes de vaciar. Separación sobre calendario y vista previa reducida a 8px.
- Corregidos avisos previos de callbacks en los archivos editados, sin cambiar la lógica de las acciones. La primera revisión detectó un `aria-label` en un span sin rol compatible; sustituido por texto `sr-only`. Revisadas las guías React ya aplicadas en HM-02: sin dependencias nuevas, sin peticiones añadidas, callbacks con dependencias completas y marcado accesible.
- `bun run type-check --filter=@damaca/dalis-home-management`: correcto. `bun run test --filter=@damaca/dalis-home-management`: 101 tests correctos, 0 fallos. Biome sobre los 12 TSX editados: sin hallazgos.
- Prueba temporal en Chrome con las cuatro páginas reales, datos ficticios y acciones/Next aislados: anchos de 320, 390, 768 y 1440px; separación exacta de 8px bajo el divisor; títulos visualmente ocultos en escritorio y conservados en móvil; vista previa de 46px con contador alineado; controles semanales en la misma fila; ningún desbordamiento ni error de ejecución; apertura y cierre del diálogo de vista previa. Capturas móvil y escritorio inspeccionadas. Sin acceso autenticado ni escrituras en datos reales.
- Enlaces locales de planificación y `git diff --check`: correctos. Capacidad refrescada antes del cierre: 85% de 5h y 91% de 7d.
- `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correcto sobre la versión final. Se utilizó Webpack por la limitación de puertos de Turbopack acreditada en HM-02, sin cambiar configuración. Una repetición del build iniciada antes de terminar la anterior devolvió código 1; se repitió secuencialmente con éxito.
- Referencia remota previa a publicación: `d54d01a6ff23bbc1e3a823420c5d8f4e7db5ca3d`, igual a la base local. Revisados diff, alcance y archivos: solo esta app, sin credenciales ni cambios ajenos. La coincidencia del commit publicado se verifica al cierre.
- Validación final de preparación: `bun run lint --staged` comprobó 15 archivos sin hallazgos; `git diff --cached --check` correcto.

## HM-04 — Corregir visibilidad responsive de títulos

- Inicio: 2026-11-01. Rama `int`, árbol limpio. Capacidad inicial: 83% de 5h y 91% de 7d. Estimación conservadora inferior a 4 y 1 puntos; respeta reservas.
- Alcance y aceptación: [HM-04](iterations.md#hm-04--corregir-visibilidad-responsive-de-títulos).
- Corrección de la interpretación anterior: el usuario confirma títulos visibles en escritorio y ocultos en móvil.
- Invertida la visibilidad responsive de cabeceras: títulos y presentación visibles desde `sm` (640px), ocultos por debajo. Restauradas las cabeceras de las tres listas en escritorio. Conservados rango semanal, botones compactos, contador de vista previa y buscadores.
- `bun run type-check --filter=@damaca/dalis-home-management`: correcto. `bun run test --filter=@damaca/dalis-home-management`: 101 tests correctos, 0 fallos. Biome de los siete TSX modificados y `git diff --check`: correctos.
- Chrome sobre las cuatro páginas con datos ficticios y acciones aisladas: títulos ocultos en 320/390px y visibles en 768/1440px; buscadores a 8px del divisor en móvil; controles semanales en una fila, vista previa compacta con contador y diálogo funcional, sin desbordamiento ni errores. Captura móvil inspeccionada. Sin acceso autenticado ni escrituras sobre datos reales.
- Incorporadas las dos indicaciones posteriores del usuario: eliminado el texto sobre arrastrar y su contenedor vacío; se conserva el estado «Moviendo…». «Vaciar semana» se renderiza siempre y usa `disabled` cuando `slots.length === 0`, además del estado de guardado.
- Repetidas comprobaciones de tipos y los 101 tests tras estos ajustes: correctas. Biome de los nueve TSX modificados: sin hallazgos.
- Repetida la prueba de Chrome sobre la versión final: ausencia del texto de ayuda y botón de vaciado visible y deshabilitado con semana vacía; resto de comprobaciones responsive correctas.
- `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correcto sobre la versión final, sin cambiar configuración. `bun run lint --staged`: 12 archivos sin hallazgos; enlaces locales de planificación y `git diff --cached --check`: correctos.
- Capacidad antes del cierre: 80% de 5h y 90% de 7d. Revisados diff y alcance: sin credenciales ni cambios ajenos. Base remota de `int` comprobada: `d48c7dc298f9c841c14ace8fa3a1d886558b6086`, igual a la base local; la coincidencia del commit publicado se verifica al cierre.

## HM-05 — Acceso compacto para copiar semana anterior

- Inicio: 2026-11-01. Rama `int`, árbol limpio. Capacidad inicial: 78% de 5h y 90% de 7d. Estimación conservadora inferior a 3 y 1 puntos; respeta reservas.
- Alcance y aceptación: [HM-05](iterations.md#hm-05--acceso-compacto-para-copiar-semana-anterior).
- Eliminados el contenedor decorativo, el título y la descripción del panel de copia. Queda el botón de ancho completo con los colores, borde, radio, sombra y altura de vista previa, con flecha a la izquierda y texto a la derecha. Los errores siguen mostrándose como aviso independiente y se conserva el estado «Copiando…».
- Conservadas las condiciones existentes: copia en semanas vacías con platos disponibles y vista previa cuando hay comidas planificadas. Ambos accesos son mutuamente excluyentes. Sin cambios en la acción de copia ni nuevas dependencias.
- Biome del componente, `bun run type-check --filter=@damaca/dalis-home-management` y `bun run test --filter=@damaca/dalis-home-management`: correctos, 101 tests y 0 fallos. Callback estabilizado para cumplir Biome.
- Chrome con componentes reales, datos ficticios y acciones aisladas en 320/390/768/1440px: coincidencia exacta de altura, ancho, colores, borde, radio y sombra entre copia y vista previa; flecha izquierda, alineación derecha, ausencia del panel anterior, exclusión mutua y ningún desbordamiento. Clic de copia aislado sin errores. Captura móvil inspeccionada. Sin escrituras sobre datos reales.
- `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correcto. Enlaces locales de planificación y `git diff --check`: correctos.
- Capacidad previa al cierre: 76% de 5h y 90% de 7d. Base remota de `int` comprobada: `d593476ae0c3fe5317ea5da85d580e044a20e016`, igual a la base local. Revisado diff: solo componente y planificación de esta app, sin credenciales ni cambios ajenos; publicación se verifica al cierre.
- Validación final: `bun run lint --staged` comprobó 4 archivos sin hallazgos; `git diff --cached --check` correcto.

## HM-06 — Contador semanal compacto

- Inicio: 2026-11-01. Rama `int`, árbol limpio. Capacidad inicial: 74% de 5h y 89% de 7d. Estimación conservadora inferior a 3 y 1 puntos; respeta reservas.
- Alcance y aceptación: [HM-06](iterations.md#hm-06--contador-semanal-compacto).
- Sustituida la frase visible por una etiqueta redondeada `X/14` junto al rango semanal. La descripción completa permanece solo para lectores de pantalla. Sin cambios en el cálculo ni en datos.
- Biome del componente, `bun run type-check --filter=@damaca/dalis-home-management` y `bun run test --filter=@damaca/dalis-home-management`: correctos, 101 tests y 0 fallos.
- Chrome con datos ficticios en 320/390/768/1440px: etiquetas `0/14` y `1/14` visibles, descripción accesible fuera de la presentación visual y ningún desbordamiento. Se conserva disposición y comportamiento de los accesos de copia/vista previa. Captura móvil inspeccionada; sin escrituras sobre datos reales.
- `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correcto. `bun run lint --staged`: 4 archivos sin hallazgos. `git diff --cached --check` y enlaces locales de planificación correctos.
- Base remota de `int` comprobada: `e0cef10cf2b66364fbf20502877c13376ed0d5f1`, igual a la base local. Revisado diff: solo componente y planificación de esta app, sin credenciales ni cambios ajenos; publicación se verifica al cierre.

## HM-07 — Ocultar barra horizontal de filtros

- Inicio: 2026-11-01. Rama `int`, árbol limpio. Capacidad inicial: 71% de 5h y 89% de 7d. Estimación conservadora inferior a 3 y 1 puntos; respeta reservas.
- Alcance y aceptación: [HM-07](iterations.md#hm-07--ocultar-barra-horizontal-de-filtros).
- Ocultada la barra del filtro compartido de lugares de compra mediante `scrollbar-width: none` y `::-webkit-scrollbar`, conservando `overflow-x: auto`. Sin cambios de lógica ni dependencias.
- Biome del componente, `bun run type-check --filter=@damaca/dalis-home-management`, `bun run test --filter=@damaca/dalis-home-management` y `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correctos; 101 tests y 0 fallos.
- Chrome con componentes reales, datos ficticios y 24 lugares de compra: en ambas páginas a 320/390/1440px, reglas estándar y WebKit ocultan la barra; rueda horizontal y navegación con Tab desplazan el filtro; Space mantiene la selección y no hay desbordamiento de página ni errores. Sin escrituras sobre datos reales.
- Enlaces locales de planificación y `git diff --check`: correctos. Base remota de `int` comprobada: `3cdd63ea6aeb024478adbeef3bde195cdf599b43`, igual a la base local. Revisado diff: componente compartido de esta app y sus planes, sin credenciales ni cambios ajenos; publicación se verifica al cierre.
- Validación final: `bun run lint --staged` comprobó 4 archivos sin hallazgos; `git diff --cached --check` correcto.

## HM-08 — Modales móviles adaptadas al teclado

- Inicio: 2026-11-01. Rama `int`, árbol limpio. Capacidad inicial: 68% de 5h y 88% de 7d. Estimación conservadora inferior a 10 y 3 puntos; respeta reservas.
- Alcance y aceptación: [HM-08](iterations.md#hm-08--modales-móviles-adaptadas-al-teclado).
- Referencia primaria: [MDN VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport); el teclado puede reducir el viewport visual manteniendo el de layout.
- Añadido hook compartido que mide `VisualViewport.height` y `offsetTop` mientras cada diálogo está abierto, con alternativa `innerHeight`, actualización por resize/scroll, limpieza de listeners y variables al cerrar, y desplazamiento del campo enfocado al reducirse el área móvil. No añade estado ni rerenders por cambios de viewport.
- Regla CSS móvil común: margen superior seguro de al menos 8px y altura máxima según área visible. Aplicada a modal genérica, confirmación y creación de producto. Vista previa y ejecución de comidas heredan la misma altura para mantener sus pies accesibles. Escritorio conserva centrado y dimensiones previas.
- Corregidos avisos previos de callbacks en archivos editados. La primera comprobación de tipos y build detectó el tipo incorrecto del evento de cancelación; corregido a `SyntheticEvent<HTMLDialogElement>`. Tipos posteriores correctos.
- La prueba de diálogos anidados detectó que Escape cerraba ambos por propagación del evento de cancelación; añadido `stopPropagation` en los tres diálogos. Tras corregirlo, Escape cierra solo el superior y el bloqueo del fondo se conserva hasta cerrar el último.
- Chrome con componentes reales y acciones aisladas: formularios de Compra, Inventario y Platos, catálogo anidado y confirmación alineados arriba; viewport visual simulado de 844→390→350px con desplazamiento superior de 40px y restauración; foco y campos visibles, textarea de receta sin obstrucción, pies de vista previa y ejecución por encima del área de teclado simulada; escritorio de 1440px centrado; Escape y restauración del scroll de fondo correctos, sin errores de ejecución. Captura del viewport reducido inspeccionada. Sin prueba en dispositivo físico ni escrituras sobre datos reales.
- `bun run type-check --filter=@damaca/dalis-home-management` y `bun run test --filter=@damaca/dalis-home-management`: correctos sobre la versión final, 101 tests y 0 fallos. Biome sobre todos los siete archivos de código editados/nuevos: sin hallazgos.
- Capacidad refrescada durante la validación final: 63% de 5h y 88% de 7d, por encima de reservas.
- `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correcto sobre la versión final. Enlaces locales de planificación y `git diff --check`: correctos. Base remota de `int` comprobada: `aaf63d69266889f616599e626a71f3d8567f1cd3`, igual a la base local. Revisado diff: solo esta app, sin credenciales ni cambios ajenos; publicación se verifica al cierre.
- Validación final: `bun run lint --staged` comprobó 10 archivos sin hallazgos; `git diff --cached --check` correcto.

## HM-09 — Modales de pantalla completa y acciones superiores

- Inicio: 2026-11-01. Rama `int`, árbol limpio. Capacidad inicial: 60% de 5h y 87% de 7d. Estimación conservadora inferior a 15 y 4 puntos; respeta reservas.
- Alcance y aceptación: [HM-09](iterations.md#hm-09--modales-de-pantalla-completa-y-acciones-superiores).
- Referencia inspeccionada, sin modificar Tasks: `apps/dalis-tasks-events/src/components/ui/item-editor-header.tsx` y `src/config/item-editor.ts`.
- Todas las modales pasan a pantalla completa tanto en móvil como en escritorio, conservando el ajuste al viewport visual de HM-08. Eliminados tamaños y márgenes de diálogo anteriores; cabecera y cuerpo separados mediante flex, con scroll exclusivamente en el cuerpo y protección de zonas seguras.
- Nuevo `DialogHeader` compartido, inspirado en Tasks: cruz roja izquierda, título centrado y tick verde derecha; iconos con nombres accesibles, tooltips, controles de 44px, deshabilitado y estado pendiente anunciado. No se modificó Tasks ni se añadieron dependencias.
- Migrados inventario, compra, platos, catálogo anidado, confirmaciones, vista previa y ejecución. Eliminados los botones inferiores. Formularios asociados al tick mediante `form` e IDs únicos o submit dentro del formulario, conservando validación nativa; mensajes de resultado de vista previa/ejecución visibles bajo la cabecera. Confirmaciones conservan etiquetas de acción, aviso de peligro y opción secundaria.
- Corregidos todos los avisos previos de callbacks en archivos editados. Revisión con las guías React ya aplicadas: componente compartido extraído, sin nuevas peticiones, estado ni efectos para las acciones de cabecera, handlers y tipos comprobados.
- `bun run type-check --filter=@damaca/dalis-home-management`, `bun run test --filter=@damaca/dalis-home-management` y `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correctos sobre versión final, 101 tests y 0 fallos. Biome sobre los 11 archivos de código editados/nuevos y `git diff --check`: correctos.
- Chrome sobre las páginas reales con datos y acciones aisladas: pantalla completa a 320/390/1440px; cabecera invariable al recorrer nueve ingredientes y 24 filas de vista previa/ejecución; ausencia de pies duplicados; validación de nombre obligatorio; envío desde tick de inventario, compra, catálogo y platos (incluidas notas); bloqueo de ambas acciones durante guardado; guardado de vista previa, confirmación de ejecución y vaciado semanal conectados a sus acciones; Escape y catálogo anidado; teclado simulado con altura de 390px y offset superior de 20px. Sin errores de ejecución, sin escrituras reales ni prueba física de teclado. Captura con cabecera visible y cuerpo desplazado inspeccionada.
- El script de QA requirió precisar selectores para excluir diálogos anidados cerrados y servir la fixture bajo un origen HTTPS interceptado para `crypto.randomUUID`, como requiere el formulario de ingredientes. Prueba final completa correcta, sin cambios de producto motivados por la fixture.
- Capacidad refrescada tras validación: 48% de 5h y 85% de 7d; margen suficiente para cierre y reservas.
- Enlaces locales de planificación y `git diff --check` correctos. Base remota de `int` comprobada: `00346ffe495218218124c02e52c5cdaef9be567e`, igual a la base local. Revisados archivos y diff: solo Home Management, sin credenciales, cambios ajenos ni modificaciones en Tasks; publicación se verifica al cierre.
- Validación final: `bun run lint --staged` comprobó 14 archivos sin hallazgos; `git diff --cached --check` correcto.

## HM-10 — Sistema de color cohesionado y accesible

- Inicio: 2026-11-01. Antes de implementar, promoción explícitamente autorizada de `int` a `main`: avance fast-forward desde `dd3e7e3` hasta `c94856cb6b52dd413001ff746fc34e81fc8443ce`; push normal de `main` correcto y SHA remoto verificado. Vuelta a `int` con árbol limpio y sin commits locales pendientes. No se ejecutó un despliegue manual de Vercel.
- Capacidad al iniciar esta iteración: 36% de 5h y 83% de 7d. Estimación conservadora máxima de 24 y 6 puntos respectivamente para implementación, reparación, validación y publicación; conserva reservas de 7%/2%. Se refresca en cada fase relevante por petición del usuario.
- Alcance y aceptación: [HM-10](iterations.md#hm-10--sistema-de-color-cohesionado-y-accesible).
- Implementados tokens semánticos claros/oscuros para fondo, superficies, campos, texto, bordes, foco, acción principal, acentos y estados. Fondo global y de página alineados; `color-scheme` declarado; sombras centralizadas. Migrados los componentes, páginas, acceso, vacíos, errores, navegación y modales a estos roles; solo se conservan literales oficiales del logo de Google.
- Modales/tarjetas con superficies comunes y opacas; acciones principales verdes con foreground y hover apropiados en ambos temas; foco uniforme; cantidad y búsqueda con aspecto y límites comunes. Eliminadas las antiguas variantes cromáticas locales de los steppers y selectores de producto.
- Comprados conservan texto y controles legibles sin opacidad de grupo. Día actual usa selección primaria y agotados advertencia; errores/eliminación rojo y confirmación/éxito verde; acentos de sección limitados a pequeños indicadores.
- Contrato obligatorio en `docs/design-system.md`, enlazado desde `AGENTS.md` con disparadores explícitos y desde el plan maestro. Valores pertenecen únicamente a CSS; la documentación fija propósito, excepciones, contraste, temas y criterios de extensión.
- Añadida prueba de paleta que valida pares de texto normal a 4,5:1, límites de campo a 3:1 y centralización de hexadecimales en componentes. Primera ejecución detectó tres pares insuficientes (muted sobre selección clara, accent sobre fondo suave claro y primary sobre selección oscura); ajustados y aprobados sin redondear umbrales.
- Corregidos todos los avisos previos de Biome en archivos tocados mediante callbacks con dependencias completas; en listas de lugares, handlers estables identifican la opción mediante `data-place`. Sin cambios de esquema, consultas o acciones de negocio ni dependencias nuevas.
- Validación final: `bun run type-check --filter=@damaca/dalis-home-management`, `bun run test --filter=@damaca/dalis-home-management` y `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correctos; 159 tests, 0 fallos, 401 aserciones. Biome sobre los 47 archivos de código modificados/nuevos: sin hallazgos.
- Chrome con componentes reales y datos/servicios aislados: navegación, cuatro páginas, vacíos, acceso y errores en claro/oscuro, 390/1440px; contraste de texto visible calculado sobre fondos compuestos, sin hallazgos; modales neutras, fondo global y `color-scheme` coherentes; comprados sin atenuación de grupo. Capturas de modales y Compra revisadas en ambos temas.
- Prueba de interacción Chrome final a 320/390/1440px: cabecera fija, scroll largo, validación nativa, estados pendientes, creación en Inventario/Compra/Platos/Catálogo, notas, vista previa, ejecución, vaciado, Escape, catálogo anidado y viewport de teclado simulado correctos; sin errores de ejecución. Sin prueba física de teclado ni escrituras reales.
- Capacidad consultada en cada fase: 36→35→33→32→30→29→28→27→25→24→23% de 5h, con saldo semanal de 83→81%. Todas las fases mantienen margen para cierre y reservas.
- Enlaces locales entre AGENTS, contrato de diseño, plan y prueba de paleta correctos; `git diff --check` correcto. Revisión final: cambios limitados a Home Management y sus instrucciones, sin secretos ni cambios de datos. El estado final de `main`/`int` y la publicación se verifican antes del cierre.
- Referencias remotas previas al commit verificadas: `main` e `int` en `c94856cb6b52dd413001ff746fc34e81fc8443ce`. La paleta se publica solo en `int`. Validación final preparada: `bun run lint --staged` comprobó 52 archivos sin hallazgos; `git diff --cached --check` correcto. Capacidad antes de commit/publicación: 21% de 5h y 81% de 7d, por encima de reservas.

## HM-11 — Tareas recurrentes del hogar

- Inicio de HM-11: plan aprobado registrado e implementación parcial inicial, todavía sin validar ni publicar.
- Añadidas funciones puras de fechas civiles, estados de periodicidad y agregación diaria, con seis pruebas.
- `bun run test --filter=@damaca/dalis-home-management`: 165 pruebas correctas, cero fallos. Biome aplicado únicamente al nuevo módulo; `git diff --check` correcto.
- En la primera pausa quedaban pendientes: persistencia, esquemas y acciones autenticadas, página, calendario, histórico, navegación y validación/cierre; completados durante la reanudación descrita a continuación.
- Capacidad inicial observada: 90% restante de 5h y 38% de 7d. Sin modificaciones fuera de Home Management ni cambios en páginas existentes.
- Reanudación 2026-11-02: rama `int`, base `ec6be6372259a8952efb3ff14075749b68cada4e`, sin commits locales pendientes; solo cambios parciales propios de HM-11. Capacidad: 89% de 5h y 38% de 7d. Estimación conservadora de la entrega restante: hasta 35/12 puntos respectivamente, manteniendo reservas. Persistencia: dos colecciones nuevas, transacciones MongoDB y revisión de tarea para serializar archivo, programación y ejecución concurrentes. Sin cambio en conexiones, consultas ni documentos de páginas existentes.

- Comprobación de compatibilidad: `hello` contra MongoDB informó instancia standalone con sesiones y sin replica set. Se sustituyó la estrategia inicial de transacciones por operaciones condicionales atómicas por documento, índices únicos y limpieza convergente al archivar, sin modificar infraestructura ni conexión compartida. No se ejecutaron transacciones en la base del hogar.
- Implementada ruta protegida, catálogo activo/archivado, calendario mensual, arrastre por puntero y alternativa por fecha, histórico corregible y modales completas con confirmación. Revalidación limitada a `/household-tasks`. La navegación conserva orden y funciones previas y añade Tareas al final; cinco columnas en móvil.
- Prueba real del repositorio con MongoDB standalone en base temporal exclusiva: creación e histórico inicial idempotentes, ocho completados concurrentes sin duplicados, unicidad tarea/día, correcciones, eliminación, cancelación y doce carreras de archivo contra programación/completado: correctos. Base temporal eliminada al terminar; sin escrituras en la base del hogar. Script de QA local: `/private/tmp/hm11-qa/persistence.ts`.
- Chrome headless con componentes reales y servicios aislados: programar, completar con fecha real distinta de la prevista, corregir/eliminar desde histórico y restaurar pendientes, arrastrar desde catálogo y mover una programación, puntero táctil simulado, registrar sin programación, editar, cancelar, archivar y consultar archivadas: correctos. Validación nativa, error recuperable conservando formulario, bloqueo durante guardado y Escape: correctos.
- QA visual en 320/390/1440px, claro/oscuro: cinco enlaces de navegación, sin desbordamiento horizontal, modales completas y texto visible con contraste mínimo aplicable. Capturas revisadas. La fixture requirió restringir selectores a botones y resolver colores CSS modernos mediante Canvas; la comprobación final no detecta errores de ejecución ni de contraste. Capturas y script: `/private/tmp/hm11-qa/`. Sin prueba en dispositivo táctil físico.
- Pruebas añadidas para fechas inválidas/futuras, intervalos, umbral del 80%, avisos cubiertos y vencidos, meses/años/bisiestos/cambio horario, recálculo de histórico, referencias, idempotencia, fallos parciales de creación y limpieza, autenticación, mensajes de error y revalidación exclusiva. `bun run test --filter=@damaca/dalis-home-management`: 181 tests correctos, 0 fallos, 488 aserciones. Tipos correctos con `bun run type-check --filter=@damaca/dalis-home-management`.
- Revisión React según `vercel-react-best-practices` y `vercel:react-best-practices`: componentes separados y locales, consultas paralelas, tipos compartidos sin runtime del servidor, callbacks estables y límites cliente/servidor conservados. Sin nuevas dependencias, variables de entorno persistidas, migraciones ni despliegue.
- Archivo documental: HM-01 movida a `archive/2026-11-02/iteration-log.md` y referencias actualizadas, manteniendo las diez entregas recientes en este registro.
- Build final `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correcto, sin fugas cliente/servidor; nueva ruta dinámica protegida incluida. La caché remota de Turbo no estuvo disponible; los checks se ejecutaron localmente.
- Biome inicial sobre archivos preparados detectó únicamente una línea vacía final en el archivo histórico trasladado; corregida antes de repetir la comprobación. Enlaces locales y `git diff --check` correctos. Revisión del alcance: solo Home Management, navegación autorizada y registros de persistencia nuevos; sin cambios en Tasks ni otras aplicaciones, secretos, credenciales o páginas de negocio existentes. Publicación en `int` pendiente de verificar al cierre.
- Referencias remotas comprobadas antes del commit: `int` en `ec6be6372259a8952efb3ff14075749b68cada4e`, coincidente con la base local; `main` no se modifica. Capacidad antes del cierre: 71% restante de 5h y 35% de 7d, manteniendo reservas.
- Validación final preparada: `bun run lint --staged` comprobó 26 archivos sin hallazgos; `git diff --cached --check` correcto. Revisados los 26 archivos exactos de entrega, todos dentro de Home Management.

## HM-12 — Densidad móvil coherente en Tareas

- Inicio 2026-11-02: rama `int`, árbol limpio y base `7b5bd4b329daaf42fca000928ebc64dda2ae363b`, sin commits pendientes de publicar. Capacidad: 66% de 5h y 34% de 7d. Estimación conservadora de entrega completa: hasta 15/5 puntos; mantiene reservas.
- Alcance y aceptación: [HM-12](iterations.md#hm-12--densidad-móvil-coherente-en-tareas). Referencias de solo lectura: cabeceras y controles de Inventario/Menú, tarjetas de Inventario/Platos; implementación restringida a Tareas y documentación de diseño de la app. El usuario pide explícitamente acciones por iconos cuando tengan sentido.
- Cabecera móvil sustituida por barra de contador, añadir y alternar archivadas; nombre de página accesible y presentación de escritorio conservados. Retirado el título duplicado del catálogo. Fichas con periodicidad en etiqueta, tres columnas de fechas compactas con año y valor completo accesible, controles de 32px e iconos; iconos y texto en escritorio. Conservados nombres, fechas, advertencias y confirmaciones.
- Ajustados calendario, lista del día e histórico: menos padding/separación, celdas de 36px, controles compactos y leyenda accesible sin espacio visual en móvil. Los campos y la cabecera funcional de las modales mantienen sus dimensiones y acciones. Ningún cambio de datos ni negocio.
- Contrato de densidad móvil añadido al sistema de diseño, con referencia obligatoria en `AGENTS.md`: consulta de ejemplos existentes antes de editar, título/presentación solo desde `sm`, iconos identificables con `aria-label`/`title`, superficies compactas sin sacrificar legibilidad/foco, comprobación de densidad y contraste a 320/390px y escritorio. Documento mantenido mediante `writing-for-agents`; revisión React aplicada a los componentes locales y callbacks estables.
- Comparación Chrome con los mismos tres registros y viewport de 844px: a 320px, alturas de fichas 290/270/242 → 152/136/116px y comienzo del calendario 1054 → 492px; a 390px, 290/270/242 → 136/136/116px y calendario 1054 → 476px. Calendario de 542/510 → 314px. Capturas antes/después y scripts locales en `/private/tmp/hm12-qa/`; capturas móviles finales inspeccionadas.
- QA Chrome final con componentes reales y servicios aislados: interacción completa de HM-11 conservada (programación, ejecución, histórico/correcciones, archivo, cancelación, errores recuperables, guardado pendiente y Escape), arrastre con ratón y puntero táctil simulado. Iconos operables con Enter/Espacio y nombres accesibles; controles visibles de al menos 32×32px; claro/oscuro a 320/390/1440px sin desbordamiento, errores de ejecución ni fallos de contraste de texto. Sin prueba en dispositivo físico.
- `bun run test --filter=@damaca/dalis-home-management`: 181 pruebas correctas, 0 fallos, 491 aserciones. `bun run type-check --filter=@damaca/dalis-home-management`: correcto. Sin pruebas unitarias nuevas para este ajuste visual reversible; validación específica realizada en navegador.
- HM-02 archivada junto a HM-01 en `archive/2026-11-02/iteration-log.md`, manteniendo diez entregas recientes y los enlaces a evidencia.
- Build final `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correcto. Turbo no pudo usar caché remota; comprobaciones ejecutadas localmente. Enlaces del contrato, instrucciones y planificación correctos; `git diff --check` correcto. Revisión de alcance: solo componentes de Tareas y documentación de Home Management; navegación y páginas existentes sin cambios. Publicación en `int` se verifica al cierre.
- Formato Markdown del contrato ajustado a Biome tras la comprobación preparada. Capacidad antes de commit/publicación: 57% restante de 5h y 33% de 7d; mantiene reservas. Base remota `int` verificada igual a la local `7b5bd4b329daaf42fca000928ebc64dda2ae363b`; sin cambios en `main`.
- Validación final preparada: `bun run lint --staged` comprobó 16 archivos sin hallazgos; `git diff --cached --check` correcto. Revisados los 16 archivos exactos de la entrega, todos dentro de Home Management.

## HM-13 — Controles compactos y restauración de tareas

- Inicio 2026-11-02 sobre `int`, con HM-12 publicada como base y sin cambios fuera de Home Management. Alcance limitado a la nueva página y sus acciones de persistencia.
- Reordenada la barra superior para colocar el filtro de archivadas/activas y añadir antes del contador. Las tareas archivadas muestran acción de restaurar; el servidor valida la transición y la hace idempotente.
- El histórico alinea corrección y eliminación con la fecha en una única fila. En la lista diaria, el check queda a la izquierda del nombre y alterna completar/deshacer sin confirmación: completar genera la ejecución con hoy y deshacer elimina o devuelve a pendiente el registro correspondiente. Las programaciones pendientes muestran borrar inmediatamente antes del asa de arrastre al extremo derecho; se eliminan los textos redundantes de estado.
- `bunx biome check --write` y comprobación Biome final sobre los archivos editados: correctos. `bun run type-check --filter=@damaca/dalis-home-management`: correcto. `bun run test --filter=@damaca/dalis-home-management`: 182 pruebas correctas, 0 fallos, incluyendo restauración idempotente. Build y publicación se verifican al cierre.

## HM-14 — Estados de check y orden de controles

- Ajustado el orden de la cabecera para mostrar `Añadir` antes de activar la vista de archivadas/activas y del contador.
- Al restaurar una tarea archivada se vuelve automáticamente a la vista de activas. Las entradas completadas del día conservan únicamente el check verde; corrección y borrado siguen disponibles desde el histórico.
- Las asas de arrastre de las fichas padre se desplazan al extremo derecho, y se conserva la reprogramación junto al borrado en pendientes.
