# Registro de entregas

## POC-01

- [Criterios](iterations.md#poc-01--landing-y-autenticación)
- Capacidad inicial a las 20:15 CET del 7 de noviembre de 2026. 85% de 5 h y 100% de 7 d.
- Biome, tipos y build local completados. El build funciona sin credenciales y resuelve la configuración al atender peticiones.
- La app tiene su propia base de datos y prefijo de cookies. La URL de retorno depende de la rama de Vercel. La preview y la sesión completa con Google se verifican después de publicar el commit.

## POC-02

- [Criterios](iterations.md#poc-02--selección-de-la-base-de-datos). Inicio a las 11:15 CET del 11 de noviembre de 2026, con 97 % de 5 h y 67 % de 7 d disponibles.
- La prueba reprodujo la selección fija de `damaca-pocs` y pasó después de aplicar `MONGODB_DB` al adaptador. La prueba observa el nombre de base solicitado al driver sin conectarse a MongoDB.
- Pasaron Biome, la prueba de regresión, los tipos y el build filtrados de Damaca POCs y `git diff --check`.

## POC-03

- [Criterios](iterations.md#poc-03--captura-desde-alexa). Capacidad inicial disponible del 90 % de 5 h y del 66 % de 7 d.
- Biome, tipos, pruebas y build de Damaca POCs pasaron en local. Las pruebas cubren el diálogo, la zona horaria y el filtro de rutas.
- Queda pendiente configurar la skill en Alexa Developer Console y verificar el simulador, el dispositivo y el panel privado en una preview accesible.

## POC-04

- [Criterios](iterations.md#poc-04--captura-desde-chatgpt). Capacidad inicial disponible del 87 % de 5 h y del 65 % de 7 d.
- Las pruebas locales ejercitan el intercambio OAuth con consentimiento y PKCE, el rechazo de tokens inválidos y las dos herramientas MCP por Streamable HTTP. También cubren deduplicación de Alexa, aislamiento de consultas y las excepciones geográficas.
- Las consolas de Alexa y ChatGPT solicitaron iniciar sesión. La preview aún carece de las variables de ambas integraciones. Falta verificar la disponibilidad de escritura en la cuenta de ChatGPT y completar el recorrido con los proveedores.
