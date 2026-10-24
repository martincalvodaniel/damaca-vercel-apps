# Flujo de trabajo de Dalis Tasks & Events

El flujo agéntico común está en el [protocolo del monorepo](../../../plan/workflow.md) y es obligatorio. Esta guía conserva únicamente criterios propios de la aplicación.

## Criterios locales

- Antes de una entrega de producto, leer [master.md](master.md), [iterations.md](iterations.md), este documento, [iteration-log.md](iteration-log.md) y las instrucciones anidadas de las rutas afectadas.
- La aceptación física de dos dispositivos, las pruebas de integración contra recursos Mongo/Next aislados, los límites de sincronización, y los pasos de preparación de release son requisitos locales; registrar exactamente qué pruebas se ejecutaron y no inferir aceptación física o productiva a partir de simulaciones.
- Ejecutar las pruebas opt-in y escenarios Next/Mongo solo con sus runners y recursos propios descritos en [sync-test-environment.md](sync-test-environment.md). Nunca usar la base de datos del usuario o producción.
- Los pushes a `int` pueden activar el despliegue de preproducción configurado para esta app. Seguir [release-readiness.md](release-readiness.md) para preparación y aceptación; este hecho no autoriza despliegues ni cambios en producción.

El antiguo flujo detallado permanece en [workflow-history.md](workflow-history.md) como evidencia histórica sin autoridad normativa.
