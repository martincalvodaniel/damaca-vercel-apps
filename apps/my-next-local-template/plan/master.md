# Plan maestro

## Estado y requisitos aceptados

Plantilla reutilizable mediante copia de archivos para webapps **puramente locales**, instalables en móvil y escritorio. La petición humana de la iteración `07` sustituye el modelo anterior de Google, roles y MongoDB. Las iteraciones `00`–`06` se conservan como evidencia histórica, no como arquitectura vigente.
- Sin cuentas, login, servidor de aplicación, base remota, sincronización ni servicios externos.
- Datos locales en IndexedDB mediante `idb`; esquemas y migraciones versionados. La preferencia de tema es el único dato funcional de la base.
- Next.js exporta archivos estáticos en `out/`. React resuelve la interacción local; no hay Server Actions, proxy ni rutas API.
- Manifest, iconos locales, instalación progresiva, service worker y caché offline de las rutas/recursos compilados. Actualizaciones ofrecidas al usuario, sin borrar IndexedDB.
- Tema System/Light/Dark, con caché mínima en localStorage para el arranque sin destello. IndexedDB es la persistencia principal.
- Fuentes del sistema; sin credenciales ni variables obligatorias. UI en inglés y `lang="en"`; documentación en español.
- Stack: Next/React/TypeScript/Tailwind/Bun/Biome/Zod; `idb` en producción, `fake-indexeddb` en pruebas. Versiones exactas en `package.json`/`bun.lock`.

La instalación necesita un navegador compatible y un origen HTTPS, salvo localhost para desarrollo. La primera visita y preparación de caché requieren conexión al host estático; después funciona offline. No es una aplicación que se ejecute abriendo `index.html` con `file://`, ni incluye distribución por tiendas.

## Decisiones de datos y actualización

- Cada aplicación copiada debe personalizar `src/config/app.ts`, la marca/iconos y su origen. Hosting en la raíz del origen; los subdirectorios requieren una adaptación explícita de rutas, manifest y service worker.
- IndexedDB conserva datos por origen, navegador, perfil y dispositivo. No ofrece copia de seguridad ni sincronización. Borrar datos del sitio, modo privado o políticas de cuota pueden perderlos. Antes de incorporar datos de producto irremplazables, acordar exportación/importación y recuperación.
- Los cambios de esquema suben la versión de IndexedDB y añaden migraciones no destructivas. Los fallos no se ocultan con almacenamiento volátil ni borrado de la base.
- Cada build genera una caché identificada por su contenido completo, incluido el código del worker. Se conserva la versión previa para pestañas abiertas; no se garantiza mantener pestañas con más de una versión de retraso. La actualización requiere pulsar Update and reload o cerrar las pestañas anteriores.
- Hosting debe servir todo `out/`, con MIME correcto y sin caché inmutable para `sw.js`, HTML y manifest. Publicar la salida de forma atómica para evitar mezclas de versiones. Configurar HTTPS. Se incluye `vercel.ts` como configuración declarativa opcional; no hay proyecto de hosting vinculado ni despliegue aprovisionado.

## Configuración Vercel aportada en 09

El fragmento humano se conserva en `vercel.ts`, tipado con `VercelConfig` y `@vercel/config` de desarrollo. La regla global deniega peticiones cuyo header de país por IP no coincida con `ES`, incluida su ausencia. `cdg1` configura París para funciones; esta base sigue siendo una exportación estática sin funciones. El uso local y otros proveedores no necesitan Vercel.

La regla solo controla peticiones que llegan al host. No autentica, no garantiza ubicación física y no impide usar una PWA previamente cacheada fuera de España. No se cambia el service worker ni se añade una consulta remota al abrir offline. El efecto real requiere validación en un despliegue autorizado; no se despliega ni se altera infraestructura en esta entrega.

## Definición del producto de destino

| Decisión                              | Estado                                             |
| ------------------------------------- | -------------------------------------------------- |
| Nombre, usuarios y problema           | Pendiente de petición humana                       |
| MVP, criterios de éxito y exclusiones | Pendientes                                         |
| Idioma de interfaz                    | Inglés por defecto                                 |
| Acceso                                | Local, sin identidad ni roles                      |
| Datos e invariantes de producto       | Pendientes; persistencia IndexedDB obligatoria     |
| Respaldo/recuperación                 | Diseñar antes de datos irremplazables              |
| Publicación                           | Host estático HTTPS; configuración opcional Vercel |

## Flujo y próximo paso

Seguir [AGENTS.md](../AGENTS.md), [workflow.md](workflow.md), [iterations.md](iterations.md) y [iteration-log.md](iteration-log.md). La base técnica corresponde a `07`; `08` añade la política de capacidad de Codex. Cada iteración consulta las ventanas de 5h/7d, estima su cierre completo y conserva reservas del 7%/2%; si no cabe, entrega un corte menor y deja el resto pendiente. `01` sigue pendiente hasta definir un producto real. No inventar un dominio de demostración.

Trabajo secuencial en `int`, commit/push y SHA remoto tras cada iteración validada. El usuario integra y publica `main`. Al copiar, configurar el remoto propio antes del primer push. Backend, autenticación, sincronización y servicios externos requieren autorización humana que revise explícitamente el alcance local.
