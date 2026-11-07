# Registro de entregas

## 01 — Base web y recordatorios

[Aceptación](iterations.md#01--base-web-y-recordatorios)
- Se generó la app con el starter Google y MongoDB y se actualizó el lockfile raíz mediante `bun install --offline`.
- El inicio permite guardar texto y listar los 50 recordatorios más recientes de la cuenta autorizada.
- Pasaron Biome, TypeScript y 38 pruebas Bun con el filtro de la app.
- Pasó el build con `--webpack` y variables ficticias de compilación. Turbopack no pudo abrir un puerto local en este entorno.
- Quedan pendientes la prueba con credenciales reales de Google y del clúster de Hub y la vinculación con Alexa.
- Capacidad inicial a las 15:12 UTC. 98 % de 5 h y 6 % de 7 días.
- La revisión automática bloqueó la publicación a `origin/int` por falta de autorización explícita para enviar el código al remoto.
