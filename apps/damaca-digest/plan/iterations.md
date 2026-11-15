# Iteraciones de Damaca Digest

Este archivo registra el estado de cada corte. Se aplica el [workflow común](../../../plan/workflow.md).

## 01 — Incorporar el workspace

- Estado: `validated`.
- Rutas: `apps/damaca-digest`, inventario raíz, CI y lockfile.
- Dependencia: starter `mongo-google`.
- Aceptación: workspace registrado, planes enlazados, instalación reproducible y manifiesto e iconos correctos para `main` e `int`.
- Validación: Biome, tipos, pruebas del starter y generador, build e inspección de instalación.

## 02 — Validar la viabilidad externa

- Estado: `blocked`. Falta un entorno HTTPS autorizado con Google, MongoDB y un conector privado de ChatGPT con escritura.
- Rutas: configuración aislada de Digest y pruebas de OAuth/MCP.
- Dependencias: workspace ChatGPT con escritura habilitada, un entorno Vercel autorizado y MongoDB aislado.
- Aceptación: validar descubrimiento, consentimiento, intercambio y llamada de prueba desde ChatGPT, con una fuente pública y datos desechables.

## 03 — Entregar captura y ficha en local

- Estado: `validated`.
- Rutas: autenticación, MCP, repositorio y ficha de Digest.
- Dependencia: starter y validación local de protocolos y persistencia con un MongoDB desechable.
- Aceptación: recorrido cliente OAuth/MCP de prueba → MongoDB → ficha para acceso completo, parcial y no disponible, con aislamiento entre cuentas y deduplicación concurrente. La aceptación con ChatGPT real queda en el corte 02.

## 04 — Entregar biblioteca y topics

- Estado: `pending`.
- Rutas: biblioteca, ficha, repositorios, topics y herramientas MCP.
- Dependencia: captura y ficha.
- Aceptación: búsqueda, filtros, paginación, edición, borrado, estados, favoritos, alias y fusión, con conservación de ediciones ante recaptura.

## 05 — Validar preproducción

- Estado: `pending`.
- Rutas: app, pruebas, documentación y CI.
- Dependencia: biblioteca y entorno de preproducción autorizado.
- Aceptación: CI, recorrido OAuth real, revisión móvil y escritorio y restauración de prueba en una base separada.
