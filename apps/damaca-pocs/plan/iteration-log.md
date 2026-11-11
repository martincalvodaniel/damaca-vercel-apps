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
