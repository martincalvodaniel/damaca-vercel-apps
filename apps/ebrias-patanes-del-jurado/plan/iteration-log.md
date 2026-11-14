# Registro de entregas

[Entregas EPJ-01 a EPJ-07 archivadas](archive/2026-11-08/iteration-log.md).

[Entregas EPJ-08 a EPJ-32 archivadas](archive/2026-11-14/iteration-log.md).

## EPJ-33 — Separación uniforme en Letux

- La ficha usa un único espacio entre sus cuatro controles. Disfraces recupera el enlace a la ficha con el mismo estilo y posición que Tapas.
- Maqueta en Chrome con los estilos reales: tres huecos iguales de 4,8 px a 320 y 1440 px, con el listado abierto y cerrado.
- Biome incremental, tipos, build y comprobación del diff correctos. El build mostró el aviso de DNS de MongoDB al inicializar índices.

## EPJ-34 — Separación en Disfraces y Tapas

- Capacidad inicial disponible: 35% en 5 h y 14% en 7 días.
- Las dos páginas usan la separación de la ficha entre el enlace de vuelta, los controles y las tarjetas.
- Maquetas con los estilos reales en Chrome: huecos de 4,8 px a 320 y 1440 px. Biome, tipos y build correctos.

## EPJ-35 — Control de creación junto al buscador

- Capacidad inicial disponible: 33% en 5 h y 14% en 7 días.
- El botón exclusivo del administrador comparte fila con la etiqueta y reutiliza el estilo de lacre. Se compacta el texto visible para que quepa en móvil.
- Biome, tipos y build correctos. En una maqueta de Chrome con los estilos reales, ambas opciones conservaron la posición del buscador y se alinearon con la etiqueta a 320 y 1440 px.

## EPJ-36 — Aviso flotante en Disfraces

- El mensaje de la acción aparece en un aviso de pergamino con botón de cierre y anuncio accesible.
- Capacidad inicial disponible de 30% en 5 h y 13% en 7 días. Biome, tipos y build correctos. Chrome verificó en maqueta con los estilos reales que el aviso cabe y el buscador no se mueve a 320 y 1440 px.

## EPJ-37 — Guía editable de Nochevieja en Letux

- Inicio a las 12:44 CET con un 27% disponible en 5 h y un 13% en 7 días. `int` llevaba cinco commits locales pendientes de push.
- [Criterios](iterations.md#epj-37--guía-editable-de-nochevieja-en-letux). Programa por días, notas y bloques administrables con control de revisión en MongoDB.
- Biome en los seis archivos de código, tipos, cinco pruebas de Ebrias, build y `git diff --check` correctos.
- Chrome con MongoDB desechable y sesiones ficticias: acceso privado, Lumos con la alternativa sin micrófono, guía vacía, alta, orden y borrado de bloques, lectura desde otra sesión, intento directo de guardado de miembro rechazado, guardado con revisión desactualizada y borrador conservado, desplegables de asistentes y coches y navegación a Tapas y Disfraces. Guía y editor sin desplazamiento horizontal a 320 y 1440 px.

## EPJ-38 — Coches junto a asistentes en Letux

- Inicio a las 13:02 CET con un 18% disponible en 5 h y un 11% en 7 días.
- [Criterios](iterations.md#epj-38--coches-junto-a-asistentes-en-letux). El desplegable de coches sigue al de asistentes en el orden de la ficha.
- Orden revisado en el diff. Biome, tipos, cinco pruebas de Ebrias, build y `git diff --check` correctos.

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
