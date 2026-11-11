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
- En preview, Google devolvió el control a Damaca y el consentimiento respondió 200. El intercambio de tokens devolvió 400. Una prueba controlada reprodujo el rechazo de `client_secret_post` pese a que el servidor lo anunciaba. El cliente preconfigurado ahora admite ambos métodos de envío del mismo secreto. Pasaron las diez pruebas, los tipos y el build. Queda pendiente reintentar la conexión desde ChatGPT web.

## POC-05

- [Criterios](iterations.md#poc-05--iconos-de-damaca-pocs). Capacidad inicial disponible del 36 % de 5 h y del 57 % de 7 d.
- Se adaptó la marca `d.` de la portada a un favicon ICO con 16, 32 y 48 px, un icono Apple de 180 px y un PNG cuadrado de 512 px para carga manual.
- Se comprobaron las dimensiones y los fotogramas del ICO, se inspeccionó el PNG y se confirmó la generación de los iconos en el build. Pasaron Biome incremental, tipos, las diez pruebas y el build.

## POC-06

- [Criterios](iterations.md#poc-06--recuperación-del-diálogo-de-alexa). Capacidad inicial disponible del 25 % de 5 h y del 55 % de 7 d.
- El simulador abrió la skill y salió de ella tras interpretar «arroz» como un paso de recordatorio. La prueba local comprueba que Damaca mantiene abierta esa sesión y acepta la compra siguiente.
- Pasaron Biome incremental, tipos, once pruebas y build. El modelo actualizado añade variantes naturales de compra y recordatorio. Falta importarlo y compilarlo en Alexa Developer Console para verificar el reconocimiento real.
- El JSON de un intento real confirmó que Alexa devolvía `SetReminderTime` con el slot vacío al pedir una compra. Se quitaron los ejemplos de fecha y hora que consistían solo en el slot y se añadió una frase de compra con un prefijo y un contexto distintos. Pasaron la validación del JSON y Biome. Queda pendiente compilar el modelo en Alexa y comprobar el intent del simulador.
