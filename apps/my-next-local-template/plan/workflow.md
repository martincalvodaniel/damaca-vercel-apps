# Flujo local de My Next Local Template

El protocolo de ramas, planificación, capacidad, validación, commit y publicación está centralizado en el [flujo del monorepo](../../../plan/workflow.md).

## Restricciones del producto

- Mantener exportación estática, datos de producto en IndexedDB, instalación y uso offline; no introducir backend, autenticación, sync ni solicitudes de red en tiempo de ejecución sin autorización humana explícita.
- Para cambios de almacenamiento o PWA, consultar las instrucciones de `src/lib/storage/AGENTS.md` y validar migraciones no destructivas, recuperación, persistencia, actualización y recarga offline según aplique.
- Las pruebas simuladas, interacción de navegador, QA visual e instalación nativa acreditan aspectos distintos; registrar cada resultado por separado.
