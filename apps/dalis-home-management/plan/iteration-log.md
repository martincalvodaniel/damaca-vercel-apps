# Registro de entregas

Evidencia observada por entrega. El estado de cada iteración se consulta en `iterations.md`.

## Archivo

- [HM-01 — Receta y observaciones opcionales](archive/2026-11-02/iteration-log.md#hm-01--receta-y-observaciones-opcionales).
- [HM-02 — Listas compactas y limpieza de búsquedas](archive/2026-11-02/iteration-log.md#hm-02--listas-compactas-y-limpieza-de-búsquedas).

- [HM-03 — Cabeceras y vista previa compactas](archive/2026-11-14/iteration-log.md#hm-03--cabeceras-y-vista-previa-compactas).
- [HM-04 — Corregir visibilidad responsive de títulos](archive/2026-11-14/iteration-log.md#hm-04--corregir-visibilidad-responsive-de-títulos).
- [HM-05 — Acceso compacto para copiar semana anterior](archive/2026-11-14/iteration-log.md#hm-05--acceso-compacto-para-copiar-semana-anterior).
- [HM-06 — Contador semanal compacto](archive/2026-11-14/iteration-log.md#hm-06--contador-semanal-compacto).
- [HM-07 — Ocultar barra horizontal de filtros](archive/2026-11-14/iteration-log.md#hm-07--ocultar-barra-horizontal-de-filtros).
- [HM-08 — Modales móviles adaptadas al teclado](archive/2026-11-14/iteration-log.md#hm-08--modales-móviles-adaptadas-al-teclado).
- [HM-09 — Modales de pantalla completa y acciones superiores](archive/2026-11-14/iteration-log.md#hm-09--modales-de-pantalla-completa-y-acciones-superiores).
- [HM-10 — Sistema de color cohesionado y accesible](archive/2026-11-14/iteration-log.md#hm-10--sistema-de-color-cohesionado-y-accesible).
- [HM-11 — Tareas recurrentes del hogar](archive/2026-11-14/iteration-log.md#hm-11--tareas-recurrentes-del-hogar).
- [HM-12 — Densidad móvil coherente en Tareas](archive/2026-11-14/iteration-log.md#hm-12--densidad-móvil-coherente-en-tareas).

## HM-22 — Clonar platos

- Inicio: 2026-11-14, 10:04 CET; rama `int` limpia, sin commits locales pendientes. Capacidad inicial: 99% de 5h y 24% de 7d, con margen sobre ambas reservas.
- [Alcance y aceptación](iterations.md#hm-22--clonar-platos). Acción central «Clonar» y formulario de creación precargado con el nombre, productos, cantidades y notas. Se reutiliza la acción existente de creación, que inserta un plato con un identificador propio.
- Tipos, 187 tests y build de la app con Webpack correctos. Biome comprobó los cinco TSX editados sin hallazgos tras aplicar su formato.
- Chrome con componentes reales, datos ficticios y acciones simuladas: 320, 390 y 1440 px en claro y oscuro. Confirmados orden, foco visible, ausencia de desbordamiento, valores precargados, cancelación sin escritura y envío a creación sin actualizar el original. Sin escrituras en MongoDB.
- Referencia remota previa a publicación: `4962cc364e5ea89e15960b2dac5a5ff2fb443fb7`, igual a la base local.

## HM-13 — Controles compactos y restauración de tareas

- Inicio 2026-11-02 sobre `int`, con HM-12 publicada como base y sin cambios fuera de Home Management. Alcance limitado a la nueva página y sus acciones de persistencia.
- Reordenada la barra superior para colocar el filtro de archivadas/activas y añadir antes del contador. Las tareas archivadas muestran acción de restaurar; el servidor valida la transición y la hace idempotente.
- El histórico alinea corrección y eliminación con la fecha en una única fila. En la lista diaria, el check queda a la izquierda del nombre y alterna completar/deshacer sin confirmación: completar genera la ejecución con hoy y deshacer elimina o devuelve a pendiente el registro correspondiente. Las programaciones pendientes muestran borrar inmediatamente antes del asa de arrastre al extremo derecho; se eliminan los textos redundantes de estado.
- `bunx biome check --write` y comprobación Biome final sobre los archivos editados: correctos. `bun run type-check --filter=@damaca/dalis-home-management`: correcto. `bun run test --filter=@damaca/dalis-home-management`: 182 pruebas correctas, 0 fallos, incluyendo restauración idempotente. Build y publicación se verifican al cierre.

## HM-14 — Estados de check y orden de controles

- Ajustado el orden de la cabecera para mostrar `Añadir` antes de activar la vista de archivadas/activas y del contador.
- Al restaurar una tarea archivada se vuelve automáticamente a la vista de activas. Las entradas completadas del día conservan únicamente el check verde; corrección y borrado siguen disponibles desde el histórico.
- Las asas de arrastre de las fichas padre se desplazan al extremo derecho, y se conserva la reprogramación junto al borrado en pendientes.

## HM-15 — Check pendiente y asa alineada

- Añadido icono circular vacío para eventos pendientes; el check verde se reserva para eventos completados.
- El asa de las fichas padre se agrupa con `margin-left: auto`, dejando el resto de acciones alineadas a la izquierda y el arrastre al borde derecho.

## HM-21 — Autoría uniforme y filtro sin sugerencias

- Ambos, Dani y Pali reutilizan el mismo verde primario con fondo suave en selector, lista diaria e histórico. Retiradas conexión list/datalist y useId del buscador; filtro normalizado y limpieza conservados.
- Archivo ajeno `apps/damaca-hub/delete.json` preservado.
- Chrome con componentes reales y servicios aislados confirma un único color para los tres radios, buscador con rol searchbox sin datalist y filtro SABANAS→Cambiar sábanas, edición y borrado desde día/histórico conservados. Reutilizadas las comprobaciones HM-19/HM-20 adaptadas al color y rol actuales.
- Biome, tipos y 187 tests correctos; sin nuevas pruebas unitarias para este cambio visual reversible. Build filtrado se verifica antes de publicar.
- Build Webpack filtrado correcto y cinco archivos staged verificados por Biome/diff. Entrega limitada a Home Management.

## HM-20 — Acciones diarias y búsqueda sin acentos

- Se añaden editar/eliminar a completadas del día, reutilizando diálogos y confirmaciones existentes. Autor como etiqueta con los colores comunes del selector e histórico.
- Búsqueda normalizada mediante NFD, eliminación de marcas Unicode y minúsculas españolas; prueba cubre entradas con acentos compuestos/descompuestos y mayúsculas.
- Existe archivo ajeno sin seguimiento `apps/damaca-hub/delete.json`; se preserva fuera de esta entrega.
- 187 tests correctos, sin fallos; tipos y Biome correctos. Chrome con componentes reales/servicios aislados verifica SABANAS→Cambiar sábanas, autor coloreado, corrección desde el día y borrado con confirmación devolviendo la programación a pendiente. Script local `/private/tmp/hm20-check.cjs`.
- Build Webpack filtrado correcto. Diff revisado y limitado a Home Management; archivo ajeno preservado.

## HM-19 — Autoría editable y colores por persona

- Implementación local: Ambos neutro, Dani verde primario y Pali terracota de acento, reutilizando tokens claros/oscuros. Nombres visibles y selección mediante radio/ring para no depender solo del color.
- Corrección permite editar autor con valor actual preseleccionado; servidor actualiza autor aunque la fecha se conserve y admite reintento idempotente.
- Petición adicional: lápiz y papelera en pendientes del histórico conectados a reprogramación/cancelación existentes y retorno al histórico. Primer build coincidió con ampliación de tipos del callback a estas acciones; versión final se valida después de integrar ambos extremos.
- 186 tests correctos, 0 fallos, incluido cambio de autor sin cambiar fecha y reintento idempotente. Tipos y Biome correctos. Chrome con componentes reales y datos aislados verifica tres colores distintos, cambio de autor desde histórico, preselección al reabrir, reprogramación y cancelación con retorno al histórico (`/private/tmp/hm19-check.cjs`).
- Build Webpack final correcto. Tokens existentes conservan contraste claro/oscuro; sin nuevas dependencias ni cambios fuera de Home Management. Biome staged verifica los nueve archivos de entrega y diff sin errores.

## HM-18 — Histórico con programaciones y sugerencias cubiertas

- Histórico incluye todas las ocurrencias, ordenadas por fecha real o prevista descendente; pendientes con círculo y etiqueta Programada, ejecuciones con check/autor y acciones de corrección existentes.
- Sugerencias fantasma ocultas ante cualquier programación pendiente desde hoy; los avisos de periodicidad conservan las reglas originales del plazo.
- Petición adicional: selector de autor sustituido por grupo de tres radios visibles en orden alfabético Ambos/Dani/Pali, con selección excluyente, teclado y validación obligatoria.
- Chrome a 320px verifica las tres opciones visibles en ese orden, rechazo de envío sin autor, exclusividad y envío de Ambos correcto (`/private/tmp/hm18-author.cjs`). Primer intento de build final detectó el build anterior todavía activo; se esperó a su cierre y se repitió secuencialmente.
- Chrome con componentes reales y datos aislados: histórico con ejecución y programación futura, acciones de corrección solo en ejecuciones y fantasma oculto tras programar después del límite correctos. Script local `/private/tmp/hm18-check.cjs`. Tipos, Biome y 185 tests correctos; build filtrado verificado al cierre.
- Build Webpack final correcto; diff limitado a Tareas y planificación de Home Management. Sin cambios de datos, dependencias o páginas ajenas.

## HM-17 — Contención del carrusel en móvil

- Inicio 2026-11-03 en int con árbol limpio. Capacidad: 98% de 5h y 26% semanal, suficiente para corrección y validación acotadas.
- Reproducción con componentes reales y viewport móvil/meta viewport: documentElement.scrollWidth=390 pero layoutViewport=1085; al solicitar escala 0,5 el área visible crecía a 780px. La comprobación previa basada solo en scrollWidth no detectaba este desbordamiento de layout móvil.
- Prueba aislada de contención inline-size/layout/paint en el carrusel: layoutViewport=390 y escala mínima efectiva=1, sin cambiar la configuración global del zoom. Corrección limitada al carrusel de Tareas.
- Chrome móvil con componentes reales: ancho de layout correcto a 320/390/412px; zoom-in hasta escala 2 conservado; carrusel desplazable. Flujo aislado HM-16 de búsqueda, programación sugerida, autoría y navegación mensual correcto. Script de reproducción `/private/tmp/hm17-check.cjs` falla antes y pasa después. Sin prueba física en Android.
- Petición adicional incorporada: se elimina la línea del aviso de periodicidad y se añade un icono con nombre accesible y tooltip a la derecha de la fecha límite.
- Buscador conectado a datalist nativo con nombres únicos de las tareas de la vista activa/archivada. Mantiene el filtro y la limpieza existentes, usando sugerencias del navegador sin dependencias nuevas.
- Biome incremental, tipos, 185 tests y build Webpack filtrado correctos. Verificación final en Chrome: icono dentro de la fecha límite sin párrafo redundante, datalist con tres sugerencias y filtro/limpieza correctos, arrastre al calendario conservado. Diff limitado a componentes de Tareas y planificación de la app, sin cambios globales de viewport ni otras páginas.

## HM-16 — Catálogo horizontal y planificación sugerida

- Implementación dentro de Home Management. Fechas fantasma derivadas del último histórico y plazo; confirmar o arrastrar usa la acción existente de programación, sin persistir sugerencias. El calendario muestra el indicador amarillo y el día seleccionado ofrece confirmación y asa de arrastre.
- Periodicidad opcional representada por null; autoría opcional en documentos históricos para compatibilidad, solicitada en el formulario de completar/registrar y visible en el día e histórico. Correcciones conservan autoría y desmarcar la elimina junto con la ejecución.
- SearchInput existente reutilizado; catálogo de una ficha con scroll horizontal y snap. Deslizamiento táctil horizontal del calendario cambia el mes, conservando los botones de teclado.
- Tipos y build Webpack filtrados correctos; 185 tests correctos y 0 fallos, incluyendo ausencia de plazo, autores válidos/inválidos y persistencia/eliminación de autoría. Biome incremental y diff revisados.
- Chrome headless con componentes reales y servicios aislados: búsqueda/limpieza, carrusel, confirmación de fantasma, formulario de autor, creación sin periodicidad, ausencia de desbordamiento a 320/390/1440px en temas claro/oscuro y gesto mensual simulado correctos, sin errores de ejecución. Sin dispositivo físico. Script local `/private/tmp/hm16-check.cjs`; el primer arranque requirió permisos de Chrome y se corrigió la construcción del evento táctil de QA.
