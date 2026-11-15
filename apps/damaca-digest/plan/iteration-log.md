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

## 03a — Corregir la carga de MongoDB en desarrollo

- [Aceptación](iterations.md#03a--corregir-la-carga-de-mongodb-en-desarrollo). Inicio en `int`, base `3639e81`, con una edición local ajena en `.env.example`. Capacidad inicial del 87% en 5h y 56% en 7d.
- En el servidor local, `/` redirigía con 307 y `/auth/signin` devolvía 500 al resolver `mongodb-339f4168658c3edd`. Con los mismos módulos instalados y salidas nuevas, Next 16.4.6 reprodujo el 500 bajo Bun y Turbopack. Node y Turbopack devolvieron 200, al igual que Bun y Webpack.
- Digest arranca Next con Node en desarrollo. El comando corregido se verificó en una copia aislada con credenciales ficticias y un puerto alternativo. `/` devolvió 307 y la página de acceso devolvió 200 con el botón de Google. Pasaron Biome, TypeScript y 41 pruebas. La prueba cubrió la carga de la pantalla de acceso.

## 03b — Recuperar autenticación tras un fallo de MongoDB

- [Aceptación](iterations.md#03b--recuperar-autenticación-tras-un-fallo-de-mongodb). Inicio en `int`, base `00225a0`, con un cambio local ajeno en `.env.example`. Capacidad inicial del 82% en 5h y 55% en 7d.
- Se reprodujo el fallo en Next local con una cookie firmada de prueba. Antes del cambio, la consulta devolvió 500 con MongoDB detenida y siguió devolviendo 500 al arrancarla, con `MongoTopologyClosedError`.
- Better Auth espera al cliente conectado, comparte una inicialización y descarta los intentos fallidos. Después del cambio, el fallo inicial produjo HTTP 503 y las tres consultas siguientes devolvieron 200 en el mismo proceso tras arrancar MongoDB. La prueba usó MongoDB 8 desechable.
- Pasaron Biome, TypeScript, 41 pruebas, el build y las integraciones HTTP locales de OAuth/MCP y control de acceso. El servidor y la configuración local del usuario quedaron fuera de la prueba.
