# Iteraciones

## POC-01 · Landing y autenticación

- Estado `in_progress`
- Objetivo. Crear damaca-pocs y publicar la preview de `int`.
- `target_paths`. `apps/damaca-pocs/**` y `bun.lock`.
- Dependencias. Google OAuth, clúster MongoDB del hub y proyecto Vercel.
- Aceptación. Landing adaptable, inicio y cierre de sesión con Google, sesiones persistentes en MongoDB aisladas del hub y preview de `int`.
- Validación. Biome incremental, tipos, build y comprobación HTTP y OAuth en preview.
- [Evidencia](iteration-log.md#poc-01)
