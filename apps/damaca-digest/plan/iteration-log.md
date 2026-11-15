# Registro de entregas de Damaca Digest

## 01 — Incorporar el workspace

- [Aceptación](iterations.md#01--incorporar-el-workspace). Inicio en `int` con árbol limpio. Capacidad inicial del 14% en 5h y 59% en 7d.
- La CLI de Turbo devolvió EPERM. Se generó el workspace mediante la misma función del generador. Bun actualizó el lockfile usando su caché local.
- Biome sin hallazgos en la app y el inventario. Pasaron TypeScript, 37 pruebas de Digest y 6 del generador. Se ajustó la firma del mock del starter al driver MongoDB del catálogo.
- Builds Webpack con valores ficticios para Google y MongoDB. Se comprobaron por HTTP el manifiesto, los metadatos HTML y las dimensiones de los iconos para `main` e `int`. Una restauración desde caché llegó a servir el nombre de `main` para `int`; el build limpio de `int` sirvió el nombre correcto.
- Quedan pendientes OAuth real, MongoDB, ChatGPT y la instalación en Android. Los cortes 02 a 05 recogen las verificaciones y funcionalidades restantes.

## 03 — Entregar captura y ficha en local

- [Aceptación](iterations.md#03--entregar-captura-y-ficha-en-local). Inicio en `int`, árbol limpio y base `4953da4`. Capacidad inicial del 100% en 5h y 58% en 7d.
- OAuth con PKCE y consentimiento, cliente estático, sesiones persistidas, comprobación de identidad y grant vigente, escritura MCP con límite por propietario y ficha web privada. Los topics capturados quedan como propuestas hasta el corte 04.
- Pasaron Biome, tipos y 41 pruebas de Digest. La prueba HTTP arrancó Next compilado con MongoDB 8 desechable. Verificó descubrimiento, JWT, intercambio OAuth con credenciales Basic y en formulario, captura completa/parcial/no disponible, revocación con token vigente, aislamiento de dos propietarios y seis escrituras concurrentes a la misma URL. Pasó también la prueba HTTP de roles y solicitudes de acceso. Se añadió el runner a CI.
- El entorno de Digest carece de configuración Vercel y credenciales locales. El corte 02 queda bloqueado hasta disponer de un entorno HTTPS autorizado y de acceso a ChatGPT con escritura. Las pruebas locales usaron identidades y credenciales de prueba. Quedan por verificar Google y ChatGPT reales y el comportamiento geográfico en Vercel.
- Better Auth ya crea su índice único de correo. La prueba con MongoDB detectó un conflicto al registrar un segundo índice equivalente y se retiró ese registro redundante.
