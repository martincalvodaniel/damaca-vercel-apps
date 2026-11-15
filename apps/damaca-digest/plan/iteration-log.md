# Registro de entregas de Damaca Digest

[Entregas archivadas el 2026-11-16](archive/2026-11-16/iteration-log.md).

## 09 — Consultar la biblioteca desde MCP

- `get_article` por ID o URL y `search_articles` con filtros y paginación comparten el repositorio de biblioteca. Las fichas devueltas excluyen notas personales. El permiso `articles:read` se pide por separado y el consentimiento muestra los permisos solicitados.
- Pasaron Biome, tipos, 49 pruebas, build y la integración HTTP. Con dos cuentas, se verificaron permisos de lectura y escritura separados, desafío para permisos insuficientes, búsqueda paginada y rechazo del ID de otra cuenta. El conector real necesitará actualizar sus herramientas y conceder el nuevo permiso tras el despliegue.

## 10 — Exportar la biblioteca

- La descarga privada de Ajustes transmite Markdown o JSON con los artículos y notas del propietario. Resuelve topics fusionados usando el vocabulario del propietario.
- Biome, tipos, 49 pruebas, build e integración HTTP con MongoDB pasaron. La integración verificó 23 artículos, el aislamiento entre dos cuentas, la respuesta privada y ambos formatos.

## 11 — Consultar lecturas relacionadas desde ChatGPT

- `find_related_articles` reutiliza la consulta de la ficha y exige `articles:read`. La integración HTTP verificó resultados tras fusionar topics, el aislamiento entre propietarios y el rechazo de un token de solo escritura.

## 12 — Organizar una lectura desde su ficha

- La ficha permite añadir o quitar favoritos y marcar una lectura como leída o pendiente. La acción actualiza solo el campo elegido.
- Biome, tipos, build e integración HTTP pasaron. Se verificó que una cuenta distinta y un formulario con una revisión anterior no pueden aplicar el cambio. Chrome confirmó el diseño a 320 y 1280 px.

## 13 — Mostrar temas y enlaces originales en la biblioteca

- Cada tarjeta enlaza al original, muestra hasta dos temas que activan su filtro y añade la fecha de captura cuando se conoce la de publicación. El vocabulario de la página se resuelve una vez.
- Pasaron Biome, tipos, build e integración HTTP con topics fusionados. Chrome confirmó biblioteca, ficha, edición y topics sin desbordamiento a 320 y 1280 px.

## 14 — Consultar capturas de un periodo desde ChatGPT

- `get_reading_digest` agrupa capturas por fecha UTC con paginación y el permiso `articles:read`. Distingue fecha de captura de publicación y estado de lectura.
- La integración HTTP verificó dos páginas, el permiso y el aislamiento entre cuentas con MongoDB desechable. El build y la compilación de tipos pasaron.

## 15 — Copiar una captura para una sesión de ChatGPT abierta

- La recepción de enlaces permite copiar el prompt sin abrir otra sesión de ChatGPT y conserva la selección manual como alternativa.
- Biome, tipos, 49 pruebas y build pasaron. Chrome a 320 px verificó copia sin navegación, copia con apertura interceptada y mensaje cuando el portapapeles devuelve un error.

## 16 — Buscar en el vocabulario de la biblioteca

- Topics permite buscar por nombre o alias con el mismo filtro normalizado que MCP. Las operaciones y recuentos siguen disponibles.
- Biome, tipos y build pasaron. La integración HTTP buscó un alias fusionado en mayúsculas y un término sin coincidencias. Chrome verificó la vista a 320 y 1280 px.

## 17 — Recuperarse de errores de biblioteca

- El panel muestra un reintento seguro y la ficha inexistente ofrece volver a la biblioteca. Una ficha ajena responde con el mismo 404. Las acciones rápidas validan el selector con Zod.
- Biome, tipos, build e integración HTTP pasaron. En Chrome a 320 px, la búsqueda se recuperó al pulsar el reintento tras restaurar un índice eliminado del MongoDB desechable.

## 18 — Unificar la interfaz de acceso y conexión

- Inicio de sesión, solicitud de acceso y consentimiento usan paneles y controles acordes a la biblioteca.
- Biome, tipos, build, integración HTTP de acceso y OAuth pasaron. Chrome verificó las tres pantallas a 320 y 1280 px, los controles táctiles de al menos 44 px y el permiso de lectura visible en el consentimiento.
