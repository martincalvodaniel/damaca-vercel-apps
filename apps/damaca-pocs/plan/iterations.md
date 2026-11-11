# Iteraciones

## POC-01 · Landing y autenticación

- Estado `in_progress`
- Objetivo. Crear damaca-pocs y publicar la preview de `int`.
- `target_paths`. `apps/damaca-pocs/**` y `bun.lock`.
- Dependencias. Google OAuth, clúster MongoDB del hub y proyecto Vercel.
- Aceptación. Landing adaptable, inicio y cierre de sesión con Google, sesiones persistentes en MongoDB aisladas del hub y preview de `int`.
- Validación. Biome incremental, tipos, build y comprobación HTTP y OAuth en preview.
- [Evidencia](iteration-log.md#poc-01)

## POC-02 · Selección de la base de datos

- Estado `validated`.
- Objetivo. Respetar `MONGODB_DB` al inicializar el adaptador de autenticación.
- `target_paths`. `apps/damaca-pocs/{.env.example,package.json,src/config/env.ts,src/lib/auth*,plan/**}`.
- Dependencias. Configuración de entorno de la app y adaptador MongoDB de Better Auth.
- Aceptación. Usar el nombre configurado y conservar `damaca-pocs` como valor predeterminado si falta o está vacío.
- Validación. Prueba de regresión en la inicialización de autenticación, Biome, tipos y build.
- [Evidencia](iteration-log.md#poc-02)
