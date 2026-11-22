# Registro de entregas de Damaca Digest

[Entregas archivadas el 2026-11-16](archive/2026-11-16/iteration-log.md).

[Entregas archivadas el 2026-11-21](archive/2026-11-21/iteration-log.md).

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

## 39 — Compactar los filtros y organizar las tarjetas

- Library pliega los chips bajo un contador en móvil y muestra las tarjetas con filas separadas. Fuente y acceso se pueden filtrar desde la tarjeta. La cruz de limpieza guarda el estado vacío antes de redirigir.
- Pasaron Biome, tipos, 62 pruebas, build e integración HTTP. Chrome a 320 y 1280 px comprobó teclado, conservación del desplegable al quitar un valor, limpieza persistente y orden de las filas.

## 40 — Mostrar los enlaces mencionados en el artículo

- [Issue #4](https://github.com/martincalvodaniel/damaca-vercel-apps/issues/4). Las capturas nuevas deduplican las referencias del cuerpo accesible. La ficha separa referencias, sugerencias de IA y lecturas relacionadas por topic. Las fichas antiguas muestran los enlaces que ya tenían. Las recapturas conservan la lista.
- Pasaron Biome incremental, tipos, 63 pruebas, build Webpack e integración HTTP sobre MongoDB 8 desechable. El fixture verifica el guardado MCP, la deduplicación en la ficha y que una mejora de acceso conserve las referencias. Chrome comprobó las tres secciones, apertura en otra pestaña, recorrido con teclado y ausencia de desbordamiento a 320 y 1280 px.
- La extracción Markdown de los proveedores usa la limpieza editorial existente. Queda pendiente la comprobación con proveedores reales y ChatGPT en Vercel.
- Capacidad al inicio de la entrega, 91 % en 5 h y 57 % en 7 días.

## 41 — Confirmar la recuperación externa en ChatGPT

- Digest ofrece el envío de URLs públicas fuera de la lista si queda un proveedor habilitado y se cumplen las reglas de URL y DNS. El permiso dura diez minutos y se consume una vez. El flag viene apagado.
- Pasaron Biome incremental, tipos, 66 pruebas, build Webpack e integración HTTP con MongoDB 8 desechable. Los fixtures cubren oferta sin tráfico externo, envío confirmado simulado, aislamiento por URL y cuenta, caducidad, repetición y consumo concurrente.
- Queda por validar el diálogo de ChatGPT con el conector actualizado en Preview.
- Capacidad al inicio, 81 % en 5 h y 56 % en 7 días.

## 42 — Aclarar el contrato MCP para agentes

- [#22](https://github.com/martincalvodaniel/damaca-vercel-apps/issues/22): descripciones de las siete herramientas, instrucciones del servidor abreviadas y metadatos de campos para búsqueda y consentimiento.
- Biome en los cuatro archivos TypeScript editados, tipos, build y 66 pruebas de Digest aprobados. Un cliente MCP en memoria recibió las siete herramientas y la descripción de búsqueda en `tools/list`. Pendiente verificar la vista del conector publicado.

## 43 — Consultar temas con permiso de lectura

- [#23](https://github.com/martincalvodaniel/damaca-vercel-apps/issues/23): lectura y captura autorizan el catálogo del propietario.
- Biome, tipos, 67 pruebas y build webpack aprobados. La integración HTTP con MongoDB temporal verificó equivalencia entre ambos permisos y aislamiento de una segunda cuenta. La prueba MCP en memoria comprobó la denegación sin ninguno de los permisos.
