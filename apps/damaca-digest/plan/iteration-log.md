# Registro de entregas de Damaca Digest

[Entregas archivadas el 2026-11-16](archive/2026-11-16/iteration-log.md).

## 03d — Deduplicar URLs con el parámetro utm

- El usuario mostró un duplicado de Proton al recapturar la URL con `?utm=fake`. La regla anterior eliminaba claves `utm_*` y conservaba la clave exacta `utm`. Una prueba con esa misma URL reprodujo el fallo antes del cambio.
- Se añadió `utm` como parámetro de tracking. La prueba HTTP de OAuth/MCP confirma que la recaptura devuelve `already_exists` y el mismo ID. Pasaron Biome, tipos, 42 pruebas, build y pruebas HTTP contra MongoDB desechable. La corrección se aplica a nuevas capturas y no modifica documentos existentes.

## 04 — Encontrar artículos en la biblioteca

- Inicio en `int`, base `bc133ee`, con capacidad del 26% en 5h y 47% en 7d.
- Búsqueda MongoDB ponderada y limitada por propietario, filtros en la URL, orden y páginas de 20 con desempate por ID. El filtro de topics usa las propuestas históricas hasta integrar IDs estables.
- Pasaron Biome, tipos, 42 pruebas, build y la prueba HTTP con dos páginas, filtros combinados, relevancia y datos aislados por propietario. Chrome verificó la biblioteca con filtros abiertos y sin desbordamiento horizontal a 320 y 1280 px.

## 04a — Editar y organizar artículos

- La ficha permite editar metadatos, resumen, puntos clave, notas, estado de lectura y favorito, y borrar con confirmación. Las mutaciones usan el propietario y una revisión optimista. Una recaptura conserva los campos corregidos y los datos personales.
- Pasaron Biome, 42 pruebas, build con tipos e integración HTTP de las Server Actions. La prueba rechazó edición y borrado desde otra cuenta y borrado sin confirmación, y verificó la conservación de cambios en una recaptura. La revisión de la biblioteca a dos anchos está en el corte 04.
- El siguiente corte es 04b, vocabulario de topics, alias, fusión y `list_topics`. Se difiere para respetar la reserva de capacidad de la ventana de cinco horas.

## 04b — Consolidar topics

- Inicio en `int`, base `eeebcf4`, tras renovar la ventana de 5 h. El despliegue Production `adc0093` de los cortes 04 y 04a quedó READY y verificado en el dominio estable.
- Topics con IDs estables por propietario, nombres, alias y fusiones. Las etiquetas históricas se resuelven sin una migración previa. La fusión conserva las referencias y cuenta cada artículo una vez. La edición de fichas admite temas manuales y una recaptura conserva esos cambios.
- Pasaron Biome, TypeScript, 45 pruebas, build e integración HTTP. Se verificaron descubrimiento de topics vía MCP, exclusión de otra cuenta, edición, alias, fusión, recuento y filtro por alias con artículos nuevos e históricos.
- Chrome comprobó los controles de temas y edición a 320 y 1280 px. Un backup de MongoDB de prueba se restauró en otra base y conservó el artículo, el vocabulario, sus referencias y el índice textual.

## 05 — Validar preproducción

- [CI del commit `0a8cb16`](https://github.com/martincalvodaniel/damaca-vercel-apps/actions/runs/43770107401) terminó correctamente, incluido `digest-capture`. La revisión a dos anchos y la restauración con MongoDB desechable constan en 04b.
- Verificado [Preview estable de int](https://damaca-digest-git-int-martincalvodaniels-projects.vercel.app) en READY, con origen `int@0a8cb16`. Los metadatos anunciaron el emisor y recurso del mismo host, scope `articles:write` y PKCE S256. MCP devolvió 401 sin token OAuth en una solicitud autenticada en Vercel mediante `vercel curl`.
- Una petición pública de descubrimiento recibió 302 a `vercel.com/sso-api`. La protección sigue activa. El cliente real de ChatGPT aún necesita una vía de acceso a Preview para completar la prueba OAuth.

## 06 — Refinar biblioteca y lectura

- Inicio en `int`, base `ffa9b0d`, con 70% en 5 h y 38% en 7 d. Se dejó Preview fuera del alcance por indicación del usuario.
- Biblioteca con resúmenes visibles, procedencia, niveles de acceso y filtros activos que se pueden quitar individualmente. Ficha con jerarquía de lectura, topics enlazados, llamadas a la acción claras y bloques para resumen, notas y referencias. Navegación y superficies coherentes en biblioteca, ficha, edición y topics.
- Pasaron Biome, tipos, 45 pruebas, build e integración HTTP de OAuth/MCP y acceso. Chrome revisó las cuatro pantallas y los controles desplegados a 320 y 1280 px, sin desbordamiento horizontal. Se inspeccionaron capturas de la biblioteca en claro y de la ficha en oscuro.

## 07 — Abrir Digest desde Compartir en Android

- Inicio en `int`, base `fd455de`, con 61% en 5 h y 36% en 7 d.
- Chrome documenta destinos Compartir para PWAs instaladas. OpenAI documenta seleccionar el conector con `@` en el compositor. No se encontró un enlace o intent documentado que preseleccione un MCP privado y envíe el mensaje. Digest registra `/share`, valida un enlace, prepara el prompt y lo copia antes de abrir ChatGPT. La pantalla es una vista de preparación sin persistencia.
- Pasaron Biome, tipos, 48 pruebas, build e integración HTTP. Los manifiestos servidos de `main` e `int` anuncian el destino. En Chrome a 320 px se verificaron preparación, apertura de ChatGPT (interceptada en la prueba) y modo de copia manual si falla el portapapeles. No hubo un dispositivo Android disponible.

## 08 — Encontrar relacionados y exportar fichas

- Artículos relacionados del mismo propietario, por coincidencia con topics activos, fusionados e históricos. Las fichas descargan una copia Markdown o JSON con las notas mediante un endpoint privado.
- Pasaron Biome, tipos, 49 pruebas, build e integración HTTP. Se verificaron relacionados tras fusionar topics, descarga de notas por su propietario, rechazo de otra cuenta y escapado de contenido en Markdown. Chrome confirmó la ficha a 320 y 1280 px.

## 09 — Consultar la biblioteca desde MCP

- `get_article` por ID o URL y `search_articles` con filtros y paginación comparten el repositorio de biblioteca. Las fichas devueltas excluyen notas personales. El permiso `articles:read` se pide por separado y el consentimiento muestra los permisos solicitados.
- Pasaron Biome, tipos, 49 pruebas, build y la integración HTTP. Con dos cuentas, se verificaron permisos de lectura y escritura separados, desafío para permisos insuficientes, búsqueda paginada y rechazo del ID de otra cuenta. El conector real necesitará actualizar sus herramientas y conceder el nuevo permiso tras el despliegue.

## 10 — Exportar la biblioteca

- La descarga privada de Ajustes transmite Markdown o JSON con los artículos y notas del propietario. Resuelve topics fusionados usando el vocabulario del propietario.
- Biome, tipos, 49 pruebas, build e integración HTTP con MongoDB pasaron. La integración verificó 23 artículos, el aislamiento entre dos cuentas, la respuesta privada y ambos formatos.
