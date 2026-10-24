> Archivo histórico cerrado el 2026-10-24. No usar como estado vigente, política normativa ni autorización; consultar el plan activo y el workflow raíz.

# Plan maestro

## Estado actual

Plantilla técnica sin dominio de negocio definido. Incluye Google OAuth con cookies de sesión, administradores en `ALLOWED_EMAILS`, usuarios normales autorizados en MongoDB y administración protegida en `/admin`. La colección `user_access` conserva permisos y solicitudes de acceso, con índice único por correo normalizado e índice de estado/correo para el listado paginado de pendientes. El inventario y la configuración se describen en [README.md](../../../README.md).

La autenticación no utiliza un adaptador persistente MongoDB. No existen funcionalidades offline, sincronización, PDF ni despliegue activo configurado. Existe `vercel.ts` con región `cdg1` y restricción de país `ES` solicitadas por el usuario; su aplicación efectiva requiere un despliegue Vercel. Estos elementos requieren alcance y decisiones propios si el producto los necesita.

## Definición del próximo producto

Completar al crear una aplicación a partir de esta base:

| Decisión                           | Estado                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| Nombre y objetivo                  | Pendiente de definición humana                                                                   |
| Usuarios y problema que resuelve   | Pendiente                                                                                        |
| MVP y criterios de éxito           | Pendiente                                                                                        |
| Fuera de alcance                   | Pendiente                                                                                        |
| Idioma de interfaz                 | Inglés; `lang="en"`, textos visibles y accesibles en inglés                                      |
| Acceso y roles                     | Google verificado; administradores por entorno, usuarios normales por permisos MongoDB           |
| Modelo de datos e invariantes      | Acceso: `user_access.email` único, normalizado, con fecha de alta; dominio de producto pendiente |
| Hosting y entornos                 | Pendiente; commit/push a `int` autorizado, promoción a `main` reservada al usuario               |
| Persistencia de identidad/sesiones | Base actual: sin adaptador persistente; evaluar según requisitos                                 |

## Decisiones de la plantilla

- Mantener el stack y las fronteras server/client establecidos en [AGENTS.md](../../../AGENTS.md).
- Usar Bun y un único lockfile; no conservar configuraciones de instalación divergentes.
- Organizar las funcionalidades por dominio cuando aparezcan requisitos reales; no crear módulos vacíos como demostración.
- Planificar entregas pequeñas con dependencias, aceptación y evidencias. El orden vive en [iterations.md](iterations.md), el protocolo en [workflow.md](../../../../../plan/workflow.md) y el historial en [iteration-log.md](iteration-log.md).
- Adaptar las reglas de idioma, navegación y presupuesto al proyecto de destino; no heredar decisiones del producto de origen.
- Trabajar en `int` y cerrar cada iteración validada con commit y push a `origin/int`, incluida documentación; el usuario revisa, fusiona en `main` y publica `main`. Configurar el remoto propio antes de reutilizar este flujo.

## Próximo paso

La preparación de la plantilla se registra como `00`. El siguiente trabajo de producto es `01`: concretar el MVP a partir de una petición humana. No implementar un dominio de ejemplo ni configurar servicios antes de esa definición.

## Acceso implementado en 02

La autorización humana redefine `ALLOWED_EMAILS` como lista de administradores. `/admin` permite dar de alta y revocar correos normales mediante acciones de servidor autorizadas y validadas con Zod. Las sesiones siguen sin adaptador persistente: se persisten permisos, no identidades ni sesiones Better Auth. Los roles se calculan en servidor por petición; la revocación deniega el siguiente acceso con cookies ya emitidas. La navegación de inicio muestra administración únicamente a administradores. La interfaz completa usa inglés por la decisión humana registrada en 05.

## Solicitudes implementadas en 03

Una identidad Google verificada sin permiso puede crear su propia solicitud desde `/auth/access`; no obtiene autorización de aplicación. Administración lista las pendientes y permite aceptar o rechazar. El estado vive junto al permiso en `user_access`, de modo que aceptar y conceder acceso normal es una única escritura condicional por correo/UUID/estado pendiente. Los registros anteriores sin estado siguen aprobados. Repetir una petición pendiente conserva su UUID; reenviar tras rechazo genera otro y una decisión antigua no puede aplicarse a él. No hay envío de correos ni promoción a administrador.

## Navegación y ajustes implementados en 04

Las rutas protegidas comparten una única navegación responsive: inferior con safe area en móvil y superior desde 768px. Ajustes es el único destino por ahora, con foto del perfil social (iniciales como respaldo) y estado activo. `/settings` muestra identidad y rol del servidor, cambio de cuenta, acceso a administración solo para administradores y selector Sistema/Claro/Oscuro. El tema es una preferencia local del navegador, validada y aplicada antes de hidratación; no introduce persistencia Mongo ni dependencias. Se toma el patrón de referencia autorizado sin copiar su dominio ni sus claves de almacenamiento.

## Idioma de interfaz en 05

Por petición humana, toda la UI usa inglés: navegación, cuenta, tema, acceso, solicitudes, administración, estados vacíos, errores y textos accesibles. El documento declara `lang="en"`. README y planificación pueden seguir en español; no se añade infraestructura de traducciones ni se modifican rutas, roles o valores persistidos.

## Home en navegación en 06

Por petición humana, el registro compartido incluye Home (`/`) y Settings (`/settings`) en ambas variantes responsive. Home utiliza un icono local de casa y solo se activa en la raíz; Settings conserva la foto del perfil social y el respaldo de iniciales.

## Capacidad agéntica en 07

El flujo gestiona las ventanas Codex de 5h y 7d con lecturas directas, estimación de cada entrega completa y reservas finales de 7%/2%, respectivamente. Si una iteración no cabe, se elige una subentrega útil más pequeña y se deja el resto pendiente. La política vigente y el tratamiento de lecturas/reinicios están centralizados en [workflow.md](../../../../../plan/workflow.md).
