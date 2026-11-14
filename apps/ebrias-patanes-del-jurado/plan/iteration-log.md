# Registro de entregas

[Entregas EPJ-01 a EPJ-07 archivadas](archive/2026-11-08/iteration-log.md).

[Entregas EPJ-08 a EPJ-38 archivadas](archive/2026-11-14/iteration-log.md).

## EPJ-39 — Orden de Tapas y Disfraces en la guía

- Inicio a las 14:03 CET con un 16% disponible en 5 h y un 11% en 7 días.
- [Criterios](iterations.md#epj-39--orden-de-tapas-y-disfraces-en-la-guía). «Subir» y «Bajar» permiten cruzar la actividad de cada día. Se conserva el orden inicial de los documentos anteriores.
- Biome, tipos, siete pruebas y build correctos. Chrome con MongoDB aislado confirmó ambos órdenes tras guardar y recargar, sin desbordamiento de la guía a 320 y 1440 px.

## EPJ-40 — Edición compacta de la guía de Letux

- Inicio a las 14:07 CET con un 14% disponible en 5 h y un 11% en 7 días.
- [Criterios](iterations.md#epj-40--edición-compacta-de-la-guía-de-letux). Cada nota se edita en su actividad. Campos más bajos e iconos junto al título de cada bloque.
- Biome, tipos, siete pruebas y build correctos. Chrome con MongoDB aislado verificó el guardado de ambas notas, la reordenación, los iconos alineados de 34 px y el ancho del editor a 320 y 1440 px.

## EPJ-41 — Títulos editables y alta desde la cabecera

- Inicio a las 14:09 CET con un 11% disponible en 5 h y un 10% en 7 días.
- [Criterios](iterations.md#epj-41--títulos-editables-y-alta-desde-la-cabecera). El título se edita en la cabecera, el alta usa un icono «+» por sección y las descripciones y notas mantienen únicamente el nombre accesible.
- Biome, tipos, siete pruebas y build correctos. Chrome con MongoDB aislado verificó foco y edición al pulsar el título, alta desde los encabezados, ausencia de etiquetas visibles, lectura de nombres accesibles y persistencia tras guardar y recargar. El editor cabe a 320 y 1440 px.

## EPJ-42 — Nombres editables para Tapas y Disfraces

- El usuario autorizó continuar pese a la reserva de capacidad.
- [Criterios](iterations.md#epj-42--nombres-editables-para-tapas-y-disfraces). Los títulos se guardan con la guía y se usan en los enlaces. Los campos vacíos recuperan el nombre original.
- Biome, tipos, ocho pruebas y build correctos. No se hizo una comprobación adicional en navegador.

## EPJ-43 — Títulos y botones de las actividades

- Capacidad inicial disponible de 100% en 5 h y 9% en 7 días.
- [Criterios](iterations.md#epj-43--títulos-y-botones-de-las-actividades). Los títulos se muestran como encabezados y los botones conservan sus etiquetas fijas con flecha.
- Biome, tipos, ocho pruebas y build correctos.

## EPJ-44 — Reabrir las inscripciones de tapas

- Capacidad inicial disponible de 98% en 5 h y 9% en 7 días.
- La reapertura exige administrador y confirmación, conserva las tapas y reinicia el censo y las papeletas. Se rechazan papeletas abiertas antes del reinicio.
- Biome, tipos, seis pruebas de Tapas y build correctos.

## EPJ-45 — Gestión de inscripciones por el administrador

- Inicio con 93% de 5 h y 8% de 7 días disponibles. La administración permite altas, cambios de nombre y autoría y borrado con confirmación durante la inscripción.
- Biome, tipos, siete pruebas de Tapas y build correctos. Las pruebas verifican permisos, autores duplicados y el bloqueo fuera de inscripción.

## EPJ-46 — Retirar la publicación del concurso

- Capacidad inicial de 90% en 5 h y 8% en 7 días. La retirada devuelve el resultado a la vista privada y conserva las papeletas.
- Biome, tipos, ocho pruebas de Tapas y build correctos. La prueba cubre el permiso, la confirmación, la visibilidad y la republicación.

## EPJ-47 — Rúbrica compacta

- Capacidad inicial de 86% en 5 h y 7% en 7 días. La papeleta usa dos filas y campos de 44 px.
- Maqueta en Chrome a 320 y 1440 px con los estilos reales: dos filas alineadas sin desbordar y rechazo de 11. Biome, tipos, ocho pruebas de Tapas y build correctos.

## EPJ-48 — Inscripciones secretas y vista de miembro

- Capacidad inicial de 82% en 5 h y 6% en 7 días. El listado oculta los nombres y Ajustes permite al administrador alternar su rol efectivo en ese navegador.
- Biome, tipos, ocho pruebas de Tapas y build correctos. La vista de miembro no se comprobó en un navegador autenticado.
