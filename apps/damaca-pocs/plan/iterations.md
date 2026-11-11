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

## POC-03 · Captura desde Alexa

- Estado `in_progress`.
- Objetivo. Guardar compras y recordatorios de Alexa y mostrarlos en un panel privado.
- `target_paths`. `apps/damaca-pocs/**`, catálogo raíz y lockfile.
- Dependencias. MongoDB, Google, skill privada de Alexa y preview HTTPS.
- Aceptación. Captura en español, vencimientos de Madrid, aislamiento por cuenta y deduplicación de reintentos.
- Validación. Biome, tipos, pruebas, build y recorrido en preview.
- [Evidencia](iteration-log.md#poc-03)

## POC-04 · Captura desde ChatGPT

- Estado `in_progress`.
- Objetivo. Guardar enlaces y resúmenes desde una integración MCP privada.
- `target_paths`. `apps/damaca-pocs/**`, catálogo raíz y lockfile.
- Dependencias. POC-03, cliente OAuth y acceso a herramientas privadas de escritura en ChatGPT web.
- Aceptación. Las dos herramientas guardan entradas bajo la identidad del token OAuth.
- Validación. Biome, tipos, pruebas, build y recorrido en ChatGPT web.
- [Evidencia](iteration-log.md#poc-04)

## POC-05 · Iconos de Damaca POCs

- Estado `validated`.
- Objetivo. Dar a la app un favicon y un icono cuadrado reutilizable en Vercel y ChatGPT.
- `target_paths`. `apps/damaca-pocs/src/app/{favicon.ico,apple-icon.png}`, `apps/damaca-pocs/public/damaca-pocs-logo.png` y planificación de la app.
- Dependencias. Convenciones de metadatos de Next.js y archivos de imagen para carga manual.
- Aceptación. Favicon legible a 16 px, icono táctil y PNG cuadrado de 512 px basados en la marca de la portada.
- Validación. Inspección de los archivos, Biome, tipos, pruebas y build.
- [Evidencia](iteration-log.md#poc-05)

## POC-06 · Recuperación del diálogo de Alexa

- Estado `validated`.
- Objetivo. Mantener abierta la skill cuando una frase no coincide con el paso esperado.
- `target_paths`. Controlador y pruebas de Alexa, modelo español y planificación de Damaca POCs.
- Dependencias. Skill privada de Alexa y preview de `int`.
- Aceptación. Tras una frase fuera de contexto, Damaca indica cómo reformular y permite guardar una compra en la misma sesión.
- Validación. Prueba de regresión del diálogo, Biome, tipos y build.
- [Evidencia](iteration-log.md#poc-06)
