# Iteraciones de Damaca Digest

Este archivo registra el estado de cada corte. Se aplica el [workflow común](../../../plan/workflow.md).

## 01 — Incorporar el workspace

- Estado: `validated`.
- Rutas: `apps/damaca-digest`, inventario raíz, CI y lockfile.
- Dependencia: starter `mongo-google`.
- Aceptación: workspace registrado, planes enlazados, instalación reproducible y manifiesto e iconos correctos para `main` e `int`.
- Validación: Biome, tipos, pruebas del starter y generador, build e inspección de instalación.

## 02 — Validar la viabilidad externa

- Estado: `validated`. El usuario confirmó la captura MCP desde ChatGPT en producción y aportó fichas de los tres niveles de acceso.
- Rutas: configuración aislada de Digest y pruebas de OAuth/MCP.
- Dependencias: workspace ChatGPT con escritura habilitada, un entorno Vercel autorizado y MongoDB aislado.
- Aceptación: validar descubrimiento, consentimiento, intercambio y llamada de prueba desde ChatGPT, con una fuente pública y datos desechables.

## 03 — Entregar captura y ficha en local

- Estado: `validated`.
- Rutas: autenticación, MCP, repositorio y ficha de Digest.
- Dependencia: starter y validación local de protocolos y persistencia con un MongoDB desechable.
- Aceptación: recorrido cliente OAuth/MCP de prueba → MongoDB → ficha para acceso completo, parcial y no disponible, con aislamiento entre cuentas y deduplicación concurrente. La aceptación con ChatGPT real queda en el corte 02.

## 03a — Corregir la carga de MongoDB en desarrollo

- Estado: `validated`.
- Rutas: comando de desarrollo, documentación y registro de Digest.
- Dependencia: Node instalado junto a Bun.
- Aceptación: el comando habitual de desarrollo carga la pantalla de acceso tras redirigir desde `/`, sin errores de resolución del driver de MongoDB.
- Validación: comparar Bun y Node con Turbopack y repetir el recorrido HTTP con el comando corregido.

## 03b — Recuperar autenticación tras un fallo de MongoDB

- Estado: `validated`.
- Rutas: inicialización de MongoDB, autenticación y entradas que la consumen.
- Aceptación: una consulta de sesión durante el fallo inicial devuelve 503 y se recupera tras arrancar MongoDB sin reiniciar Next.
- Validación: prueba bajo Next local con MongoDB detenida y restaurada, más Biome, tipos, tests y recorrido OAuth/MCP.

## 03c — Aclarar fallos de inicio de sesión en local

- Estado: `validated`.
- Rutas: pantalla de acceso y guía de arranque local.
- Aceptación: un 503 de autenticación muestra indisponibilidad temporal y la guía explica cómo arrancar MongoDB en loopback.
- Validación: ping al MongoDB local, inicio del flujo OAuth, Biome, tipos y pruebas.

## 03d — Deduplicar URLs con el parámetro utm

- Estado: `validated`.
- Rutas: normalización de URL, pruebas y registro de Digest.
- Aceptación: una recaptura con `?utm=fake` conserva el ID de la URL limpia y se mantiene el tratamiento de parámetros funcionales.

## 04 — Encontrar artículos en la biblioteca

- Estado: `validated`.
- Rutas: página de biblioteca, esquema de consulta, repositorio e índices.
- Dependencia: captura y ficha.
- Aceptación: búsqueda ponderada, filtros combinables y paginación con desempate por ID. Las consultas y los resultados quedan acotados al propietario.
- Validación: Biome, tipos, tests, build, prueba HTTP con MongoDB y revisión responsive.

## 04a — Editar y organizar artículos

- Estado: `validated`.
- Aceptación: editar metadatos, notas, favoritos y estado, y borrar la ficha. Proteger cambios manuales ante recapturas y comprobar el propietario en cada mutación.

## 04b — Consolidar topics

- Estado: `validated`.
- Aceptación: IDs estables, alias y fusión por propietario, recuentos, edición de asignaciones y herramienta MCP `list_topics`.

## 05 — Validar preproducción

- Estado: `blocked`. CI, build Preview, comprobaciones responsive y restauración local completados. La protección SSO de Vercel intercepta el descubrimiento desde ChatGPT en Preview.
- Rutas: app, pruebas, documentación y CI.
- Dependencia: biblioteca y entorno de preproducción autorizado.
- Aceptación: CI, recorrido OAuth real, revisión móvil y escritorio y restauración de prueba en una base separada.

## 06 — Refinar biblioteca y lectura

- Estado: `validated`.
- Rutas: navegación, biblioteca, filtros, ficha y estilos globales de Digest.
- Aceptación: jerarquía de lectura clara, resumen y procedencia fáciles de escanear, filtros activos visibles y removibles, y controles accesibles en móvil y escritorio.
- Validación: Biome, tipos, pruebas, build, integración HTTP y revisión real de la interfaz a 320 y 1280 px.

## 07 — Abrir Digest desde Compartir en Android

- Estado: `validated`.
- Rutas: documentación, manifiesto y ruta de recepción de enlaces.
- Aceptación: verificar la oferta oficial de ChatGPT y Android. Si procede, permitir que la PWA instalada reciba un enlace y prepare su captura en ChatGPT con una acción explícita del usuario.

## 08 — Encontrar relacionados y exportar fichas

- Estado: `validated`.
- Rutas: ficha, consultas de topics y endpoint de exportación.
- Aceptación: una ficha muestra otras lecturas del propietario con topics en común, incluidas equivalencias fusionadas. El propietario puede exportar su ficha en Markdown y JSON con descarga privada.
- Validación: Biome, tipos, pruebas, build, integración HTTP de acceso y comprobación responsive de la ficha.

## 09 — Consultar la biblioteca desde MCP

- Estado: `validated`.
- Rutas: permisos OAuth, metadatos, herramientas MCP de lectura, repositorio y documentación.
- Aceptación: buscar y recuperar artículos del propietario por ID o URL. Las herramientas exigen un permiso de lectura separado. Los clientes con solo escritura conservan su captura y no pueden leer fichas. Las respuestas excluyen notas personales.
- Validación: tipos, pruebas, build e integración OAuth/MCP con tokens de lectura y escritura de dos cuentas.

## 10 — Exportar la biblioteca

- Estado: `validated`.
- Rutas: ajustes, exportación de artículos y repositorios de biblioteca y topics.
- Aceptación: descargar todos los artículos y notas del propietario en Markdown o JSON. Conservar los nombres de topics resueltos y enviar la descarga sin cargar la biblioteca completa en memoria ni cachear datos privados.
- Validación: Biome, tipos, pruebas, build e integración HTTP de las dos descargas con propietarios aislados.

## 11 — Consultar lecturas relacionadas desde ChatGPT

- Estado: `validated`.
- Rutas: herramientas MCP y pruebas de captura HTTP.
- Aceptación: resolver por ID los mismos artículos relacionados que muestra la ficha, con el permiso de lectura y el aislamiento por propietario.

## 12 — Organizar una lectura desde su ficha

- Estado: `validated`.
- Rutas: ficha, acciones de artículo y repositorio.
- Aceptación: cambiar favorito y estado leído desde la ficha, sin abrir el editor. Las acciones respetan el propietario y la revisión.

## 13 — Mostrar temas y enlaces originales en la biblioteca

- Estado: `validated`.
- Rutas: biblioteca, tarjetas y pruebas HTTP.
- Aceptación: filtrar por los temas visibles en una tarjeta y abrir la fuente directamente. Mostrar también la fecha de captura cuando exista fecha de publicación. Mantener la vista legible a 320 px.

## 14 — Consultar capturas de un periodo desde ChatGPT

- Estado: `validated`.
- Rutas: contrato y herramientas MCP de lectura.
- Aceptación: consultar capturas por intervalo UTC inclusivo, paginadas y agrupadas por día. Exigir permiso de lectura, aislar por propietario y excluir notas personales.
