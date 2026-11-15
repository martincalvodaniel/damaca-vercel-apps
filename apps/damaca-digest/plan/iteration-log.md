# Registro de entregas de Damaca Digest

## 01 — Incorporar el workspace

- [Aceptación](iterations.md#01--incorporar-el-workspace). Inicio en `int` con árbol limpio. Capacidad inicial del 14% en 5h y 59% en 7d.
- La CLI de Turbo devolvió EPERM. Se generó el workspace mediante la misma función del generador. Bun actualizó el lockfile usando su caché local.
- Biome sin hallazgos en la app y el inventario. Pasaron TypeScript, 37 pruebas de Digest y 6 del generador. Se ajustó la firma del mock del starter al driver MongoDB del catálogo.
- Builds Webpack con valores ficticios para Google y MongoDB. Se comprobaron por HTTP el manifiesto, los metadatos HTML y las dimensiones de los iconos para `main` e `int`. Una restauración desde caché llegó a servir el nombre de `main` para `int`; el build limpio de `int` sirvió el nombre correcto.
- Quedan pendientes OAuth real, MongoDB, ChatGPT y la instalación en Android. Los cortes 02 a 05 recogen las verificaciones y funcionalidades restantes.
