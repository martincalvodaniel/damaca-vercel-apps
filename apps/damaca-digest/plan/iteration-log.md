# Registro de entregas de Damaca Digest

[Entregas archivadas el 2026-11-16](archive/2026-11-16/iteration-log.md).

[Entregas archivadas el 2026-11-21](archive/2026-11-21/iteration-log.md).

## 27 — Cambiar de pestaña con un gesto horizontal

- Las tres pestañas admiten gestos táctiles hacia la pestaña contigua, con límites en Library y Settings. La lupa de Topics queda centrada con el campo y el icono de gestión.
- Biome, tipos, 50 pruebas y build pasaron. Chrome verificó los gestos en ambas direcciones, los límites, el desplazamiento vertical, los controles y las pantallas excluidas. La alineación se comprobó en móvil y escritorio.

## 28 — Mover Captura a la navegación

- Capture ocupa el primer destino y Library usa un icono de libros. Se retira el botón de captura del buscador. Los gestos mantienen el recorrido entre las tres pestañas existentes.
- Biome, tipos, 50 pruebas y build pasaron. Chrome comprobó el orden, la apertura y selección de Capture a 320 y 1280 px y los gestos entre las tres pestañas.

## 29 — Incluir Capture en el gesto horizontal

- El gesto usa el mismo orden que la barra y ahora incluye Capture. El inicio sigue siendo Library.
- Biome, tipos, 50 pruebas y build pasaron. Chrome verificó Capture y Library en ambos sentidos, el límite en Capture y el recorrido previo.

## 30 — Alinear el diseño de Capture

- El formulario usa la misma fila y panel que los buscadores. Los encabezados quedan disponibles para lectores de pantalla y las acciones de captura y ChatGPT son iconos etiquetados.
- Biome, tipos, 50 pruebas y build pasaron. Chrome comprobó la alineación del panel y los iconos al preparar un enlace a 320 y 1280 px.

## 31 — Abrir artículos en otra pestaña y aclarar los iconos de ChatGPT

- Las fichas, originales y referencias abren otra pestaña. Capture usa la silueta de ChatGPT facilitada por el usuario y añade un distintivo de copia en la acción combinada.
- Biome, tipos, 50 pruebas y build pasaron. Chrome comprobó la nueva pestaña, el icono servido y ambas variantes a 320 y 1280 px.

## 32 — Recuperar fuentes de artículos desde MCP

- Pasaron tipos, 57 pruebas, build con Turbopack e integración HTTP con Webpack, OAuth y MongoDB 8 desechable. Las fixtures cubren caché de proveedor desactivada, redirección hacia metadata, DNS mixto y fijación de IP, longitud HTML descomprimida, páginas de bloqueo, cuotas y cancelación. MongoDB confirmó el diagnóstico persistido, la ausencia de escritura al recuperar y que las recapturas conservan las ediciones.
- El piloto externo requiere comprobar el tiempo efectivo en ChatGPT, la comparación con lectura nativa y Firecrawl con una clave de prueba. Los flags de fábrica quedan desactivados.

## 34 — Rechazar interfaces como contenido editorial

- Una fixture formada por controles de vídeo, publicidad y navegación reprodujo el falso positivo: el clasificador anterior devolvía `full` al superar doce palabras. La limpieza compartida ahora elimina controles y enlaces aislados antes del recorte y exige prosa editorial; los títulos y menús no cuentan como evidencia. Un resultado sin cuerpo útil deja disponible el parcial de un proveedor anterior.
- Pasaron Biome incremental, tipos, 60 pruebas y build con integración HTTP/OAuth sobre MongoDB 8 desechable. Se cubren artículo breve, referencias inline, controles de vídeo y cookies, navegación extensa antes del cuerpo y conservación del parcial.
- La URL pública exacta facilitada por el usuario se probó con Jina: 42.069 caracteres de entrada, 30.052 tras la limpieza, clasificados como `full` sin recorte. El cuerpo real de Firecrawl no estaba disponible para reproducirlo localmente; la regresión reproduce el contenido de interfaz descrito en la captura. Falta la comprobación en ChatGPT tras desplegar.

## 35 — Unificar las acciones de lectura y edición

- Lectura y edición comparten la secuencia de estados. El editor permite volver a la ficha sin guardar. La confirmación de borrado y el borrado de filtros usan botones de icono accesibles.
- Pasaron Biome, tipos, 60 pruebas y la integración HTTP con build y MongoDB desechable. La integración recorre las cuatro transiciones desde la vista de lectura.

## 36 — Borrar topics vacíos

- Topics muestra recuentos entre paréntesis y permite borrar los vacíos con confirmación. MongoDB serializa borrado y asignación mediante la revisión del vocabulario.
- Pasaron Biome, tipos, 60 pruebas y el build de integración HTTP con replica set. Se comprobó el borrado desde la acción web, el caso concurrente y la protección de referencias directas, fusionadas e históricas.

## 37 — Recordar filtros de Library y Topics

- Library y Topics recuerdan la última selección aplicada por cuenta y navegador. Los filtros múltiples de Library usan OR dentro de cada campo. Las tarjetas enlazan al estado de lectura y al idioma.
- Pasaron lint, tipos, 60 pruebas, build e integración HTTP con MongoDB desechable. La integración comprobó OR dentro del campo, AND entre campos, enlaces de tarjetas y el esquema escalar MCP. Chrome a 320 px comprobó teclado, descarte de cambios en el diálogo, restauración, limpieza, aislamiento por cuenta y navegación con almacenamiento bloqueado.

## 38 — Restaurar filtros antes de mostrar resultados

- Library y Topics consultan sus preferencias antes de consultar los resultados. La primera visita migra el almacenamiento anterior con un indicador de carga; navegación y gestos pueden ir directamente a la selección aplicada.
- Pasaron Biome, tipos, 62 pruebas, build e integración HTTP con MongoDB desechable. Chrome a 320 px comprobó migración, navegación, gesto, limpieza, teclado y aislamiento entre cuentas. La integración verificó la redirección antes de renderizar el listado, además de la prioridad de la URL.
