# Plan maestro

## Estado vigente

Plantilla reutilizable para aplicaciones web puramente locales e instalables. La definición de un producto derivado sigue pendiente; no inventar dominio, roadmap ni progreso.

## Requisitos aceptados de la plantilla

- Sin cuentas, backend, base remota, sincronización ni servicios externos en runtime. Datos de producto en IndexedDB; `localStorage` solo para la preferencia síncrona del tema.
- Exportación estática, instalación PWA y funcionamiento offline tras preparar caché. Las actualizaciones no eliminan datos locales.
- UI en inglés; documentación puede estar en español. Stack y límites de seguridad se detallan en [AGENTS.md](../AGENTS.md) y las guías locales.
- La primera definición de producto (`01`) requiere petición humana. Respaldo y recuperación deben acordarse antes de almacenar datos irremplazables.

## Exclusiones y dudas abiertas

No se ha definido nombre, usuario, problema, MVP, criterios de éxito ni datos de producto. Backend, autenticación, sincronización y servicios externos requieren autorización explícita.
