# Damaca Digest

Biblioteca privada de lecturas para consultar y corregir desde la web. ChatGPT prepara una captura estructurada según el contenido al que pudo acceder. La app registra la procedencia como declaración del cliente.

## Estado de la app

La captura MCP, la biblioteca con búsqueda ponderada, filtros y paginación, la ficha editable y el vocabulario de topics funcionan contra Next.js compilado y MongoDB local. Better Auth persiste usuarios, cuentas, sesiones y estado OAuth en MongoDB. El usuario persistido conserva el mismo ID en web y MCP. Se comprueba el grant vigente al autorizar y al invocar el MCP, incluso si el token sigue vigente.

## Alcance aprobado

- Una app Next.js generada con `mongo-google`, en el puerto 3009, con Bun, Tailwind, Zod, Better Auth y MongoDB nativo.
- Google y OAuth MCP con PKCE, consentimiento, cliente estático y credenciales aisladas por entorno. El usuario persistido identifica al propietario tanto en web como en MCP. Comprobar el permiso vigente en cada operación.
- `save_article` acepta capturas completas, parciales y no disponibles. Mantiene URL original y normalizada, distingue referencias de sugerencias y deduplica por propietario y URL. Una mejora de acceso conserva ediciones y datos personales.
- Biblioteca con búsqueda ponderada mediante `$text`, filtros, orden y paginación. Ficha con edición, notas, favoritos, estado de lectura y borrado. Vocabulario por propietario con IDs estables, alias y `list_topics`.
- Instalación web con manifiesto e iconos locales. Configuración de Vercel independiente y excepciones geográficas limitadas a endpoints MCP y OAuth de máquina.

## Entregas de la segunda fase

La biblioteca y la ficha incluyen temas, enlaces al original, acciones rápidas de lectura, relacionados y descargas en Markdown y JSON. Ajustes permite exportar toda la biblioteca. Las herramientas MCP permiten recuperar, buscar y relacionar fichas y agrupar capturas por periodo con el permiso OAuth `articles:read`.

En la ficha, `Related articles` muestra hasta tres lecturas del mismo propietario que comparten algún topic, ordenadas por captura reciente. `Mentioned links` muestra referencias del cuerpo editorial accesible, y las sugerencias de IA tienen su propia sección. Las capturas nuevas guardan hasta 50 enlaces en el contrato existente. Las recapturas conservan la lista guardada.

La PWA recibe enlaces de Compartir y prepara un prompt para ChatGPT. El usuario selecciona el conector y confirma el envío en el compositor. La copia puede abrir ChatGPT o dejar que el usuario vuelva a una sesión ya abierta.

## Recuperación de fuentes

`fetch_article` añade respaldo de lectura a ChatGPT mediante HTTP directo, Jina Reader y Firecrawl. Mantiene el permiso de captura, los límites de red y el presupuesto de cada entorno. `save_article` admite diagnósticos opcionales declarados por el cliente sin conservar el cuerpo recuperado. La adopción de proveedores depende de las pruebas de recuperación y latencia en `int`.

## Verificaciones pendientes

El usuario confirmó la escritura MCP desde ChatGPT en producción con fuentes de acceso completo, parcial y no disponible. Tras publicar la segunda fase, queda comprobar que el destino aparezca en Compartir en un Android real y que el enlace llegue a la ficha desde una sesión de ChatGPT con el conector actualizado. Quedan también por verificar el aislamiento entre entornos y la restauración de backups de infraestructura. Embeddings e integraciones de publicación quedan para entregas posteriores.

Consultar las [iteraciones](iterations.md), el [registro](iteration-log.md) y las [reglas de la app](../AGENTS.md).
