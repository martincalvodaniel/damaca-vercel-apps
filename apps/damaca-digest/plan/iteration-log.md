# Registro de entregas de Damaca Digest

[Entregas archivadas el 2026-11-16](archive/2026-11-16/iteration-log.md).

[Entregas archivadas el 2026-11-21](archive/2026-11-21/iteration-log.md).

[Entregas archivadas el 2026-11-22](archive/2026-11-22/iteration-log.md).

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

## 44 — Verificar respuestas MCP en clientes de solo texto

- [#24](https://github.com/martincalvodaniel/damaca-vercel-apps/issues/24): `fetch_article` devuelve el mismo JSON validado en texto y en `structuredContent`. La representación textual incluye la oferta cuando se emite. Las dos representaciones duplican el cuerpo en el transporte.
- Biome, tipos, 67 pruebas y build webpack aprobados. La integración HTTP con MongoDB temporal verificó la oferta de consentimiento en ambos formatos sin llamar a extractores. Una prueba MCP en memoria con recuperación simulada verificó cuerpo y diagnósticos en ambos formatos.

## 45 — Medir el coste del catálogo MCP

- [#25](https://github.com/martincalvodaniel/damaca-vercel-apps/issues/25): índice parcial `owner_legacy_topics` para la consulta de etiquetas históricas. La consulta conserva el criterio de artículos sin IDs de tema.
- Benchmark local de 30 consultas por escenario en MongoDB 8 aislado, con 50 etiquetas históricas, un alias fusionado y consultas alternas de alias e históricas. Con 2.000 artículos y 200 temas, la mediana pasó de 20,99 a 9,37 ms. Con 25.000 artículos y 2.000 temas, pasó de 187,25 a 19,33 ms y el p95 de 503,94 a 29,81 ms. La mediana del filtrado en memoria fue inferior a 1 ms. Son tiempos de repositorio y filtrado local.
- Se conservaron el alias fusionado, los temas históricos y el tamaño de página. Pasaron Biome, tipos, 68 pruebas, build webpack e integración HTTP OAuth/MCP con MongoDB aislado.
