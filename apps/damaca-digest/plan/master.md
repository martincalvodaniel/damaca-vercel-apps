# Damaca Digest

Biblioteca privada de lecturas para consultar y corregir desde la web. ChatGPT prepara una captura estructurada según el contenido al que pudo acceder. La app registra la procedencia como declaración del cliente.

## Estado de la app

La captura MCP, la biblioteca con búsqueda ponderada, filtros y paginación y la ficha privada funcionan contra Next.js compilado y MongoDB local. Better Auth persiste usuarios, cuentas, sesiones y estado OAuth en MongoDB. El usuario persistido conserva el mismo ID en web y MCP. Se comprueba el grant vigente al autorizar y al invocar el MCP, incluso si el token sigue vigente.

## Alcance aprobado

- Una app Next.js generada con `mongo-google`, en el puerto 3009, con Bun, Tailwind, Zod, Better Auth y MongoDB nativo.
- Google y OAuth MCP con PKCE, consentimiento, cliente estático y credenciales aisladas por entorno. El usuario persistido identifica al propietario tanto en web como en MCP. Comprobar el permiso vigente en cada operación.
- `save_article` acepta capturas completas, parciales y no disponibles. Mantiene URL original y normalizada, distingue referencias de sugerencias y deduplica por propietario y URL. Una mejora de acceso conserva ediciones y datos personales.
- Biblioteca con búsqueda ponderada mediante `$text`, filtros, orden y paginación. Ficha con edición, notas, favoritos, estado de lectura y borrado. Vocabulario por propietario con IDs estables, alias y `list_topics`.
- Instalación web con manifiesto e iconos locales. Configuración de Vercel independiente y excepciones geográficas limitadas a endpoints MCP y OAuth de máquina.

## Verificaciones pendientes

El usuario confirmó el flujo de escritura MCP desde ChatGPT en producción con fuentes de acceso completo, parcial y no disponible. Quedan por verificar el aislamiento entre entornos y la restauración de backups. La captura directa desde Android, herramientas de lectura, exportación, embeddings e integraciones de publicación quedan para entregas posteriores.

Consultar las [iteraciones](iterations.md), el [registro](iteration-log.md) y las [reglas de la app](../AGENTS.md).
