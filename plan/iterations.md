# Iteraciones transversales

Este archivo es la única fuente de estado de cada iteración transversal. `validated` indica que se cumplieron los criterios documentados; publicación y SHA se verifican en Git y se evidencian en el registro.

## AGW-11 — Dalis Tasks uses Hub identity

- Estado: `validated`.
- Objetivo: centralizar el login Google y el permiso de Dalis Tasks en Damaca Hub, conservando las sesiones y los identificadores locales Mongo que sustentan la sincronización.
- Rutas: `packages/identity/**`, `apps/dalis-tasks-events/**`, `turbo.json`, `bun.lock` y planificación raíz/app.
- Dependencias: AGW-08 validada; callbacks exactos por entorno y cliente OIDC dinámico de Dalis Tasks en Hub. Los secretos deben permanecer en Vercel/local y seguir aislados por entorno.
- Aceptación: el consumidor reutiliza el paquete compartido y PKCE; Hub valida el permiso vigente para nuevas sesiones y operaciones remotas; IDs de usuario y datos Mongo existentes se conservan; la shell offline de Tasks mantiene su uso local; se retiran credenciales Google y allowlist del runtime de Tasks; callbacks usan URL explícita o alias estable `int`/producción.
- Validación prevista: pruebas OIDC y acceso compartidas; regresiones de sesión, aislamiento de IDs, sync, PWA offline, lint incremental, tipos, tests y build Tasks/identity; inspección responsive si la herramienta está disponible; revisión de documentación y `git diff --check`. El flujo Google real y la configuración de callbacks/secretos en Hub/Vercel se acreditan por separado.
- Evidencia: [registro](iteration-log.md#agw-11-dalis-tasks-uses-hub-identity).
- Capacidad inicial (2026-10-25): 90% de 5h y 74% de 7d restantes; estimación para implementación, pruebas y publicación dentro de las reservas mínimas.

## AGW-10 — Application favicons

- Estado: `validated`.
- Objetivo: crear favicons propios para juegos y Hub, actualizar sus iconos PWA y revisar los del resto de aplicaciones, según ampliación explícita del usuario.
- Rutas: iconos, manifiestos y metadatos de las seis apps, `scripts/generate-app-icons.ts`, configuración Bun, `.github/workflows/ci.yml` y planificación raíz/apps.
- Dependencias: recursos vectoriales locales; conservar las identidades existentes de Card Wars y ambas Dalis. Sharp ya está autorizado y presente en el catálogo; herramienta común en desarrollo. Capacidad inicial: 67% de 5h y 86% de 7d; corte dentro de reservas.
- Aceptación: cada app tiene favicon propio SVG y fallback ICO 16/32/48, Apple Touch Icon y recursos PNG de instalación; las tres PWA existentes declaran iconos normales y maskable seguros; Next.js publica los metadatos y recursos; generación compartida reproducible, sin cambios de almacenamiento ni funcionalidad offline.
- Validación prevista: inspección visual a tamaños de pestaña/instalación, estructura ICO y dimensiones/opacidad PNG, lint, tipos y builds de las seis apps; pruebas existentes del generador offline; comprobar iconos en exports y metadatos generados; `git diff --check`.
- Evidencia: [registro](iteration-log.md#agw-10-application-favicons).
- Seguimiento de despliegue: corregido TS2307 observado en Vercel con `6e9d659`: retirado el adaptador que importaba el generador raíz en la compilación de Dalis. Seis instalaciones filtradas limpias y sus tipos pasan; build de Dalis desde instalación filtrada validado con Webpack.
- Regresión: CI comprobará los tipos de cada app con una instalación filtrada independiente; las apps no deben importar herramientas de mantenimiento que dependan del entorno de desarrollo raíz.
- Ampliación del Hub: mostrar los iconos propios junto al nombre de las aplicaciones en catálogo y administración, desde copias SVG locales actualizadas por el generador común. Validar assets, render responsive, lint, tipos y build del Hub; conservar aislamiento de despliegues y permisos.

## AGW-09 — Restore global lint success

- Estado: `validated`.
- Objetivo: corregir los errores de formato que bloquean el lint global sin modificar reglas ni contenido funcional.
- Rutas: `docs/agents/triage-labels.md` y planificación raíz.
- Dependencias: autorización del usuario; rama `int` limpia. Capacidad inicial: 70% de 5h y 86% de 7d; entrega documental dentro de las reservas mínimas.
- Aceptación: `bun run lint` termina correctamente, sin errores; se conservan contenido y etiquetas.
- Validación prevista: lint global, revisión del diff, enlaces locales y `git diff --check`; sin builds ni tests por alcance exclusivamente documental.
- Evidencia: [registro](iteration-log.md#agw-09-restore-global-lint-success).

## AGW-08 — Public games and Hub-managed OIDC clients

- Estado: `validated`.
- Objetivo: restaurar Pocha Score y Card Wars como PWAs públicas offline y mover la gestión de clientes OIDC del entorno al Hub para apps existentes.
- Rutas: `packages/identity/**`, `apps/{damaca-hub,pocha-score,card-wars}/**`, `turbo.json`, documentación y planes raíz afectados.
- Dependencias: reversión explícita de login obligatorio; almacenamiento Mongo del Hub disponible para persistencia real; dominios de producción e int se confirman en cada cliente.
- Aceptación: sin login en juegos y con exportación estática/offline; catálogo Hub muestra enlaces públicos de juegos y rechaza solicitudes/grants; administración OIDC persistida por app+entorno con callback exacto, secreto en hash y cambios aplicados sin reinicio; migración acotada e idempotente preparada para clientes existentes que no sean juegos; `HUB_OIDC_CLIENTS` retirado del runtime; helper resuelve URL explícita o URL estable de Vercel por entorno.
- Validación: Biome, tipos, pruebas y builds de las cuatro workspaces; pruebas de persistencia/protocolo, worker/preview estático, links/documentación y `git diff --check`; inspección responsive si hay navegador. Google real, Mongo remoto, previews Vercel e instalación nativa se registran por separado.
- Evidencia: [registro](iteration-log.md#agw-08-public-games-and-hub-managed-oidc-clients).

## AGW-06 — Configure engineering skills

- Estado: `validated`.
- Objetivo: configurar GitHub Issues, etiquetas de triaje y documentación multi-contexto para las skills de ingeniería, conservando el workflow raíz.
- Rutas: `AGENTS.md`, `docs/agents/*.md` y los tres documentos de planificación raíz; etiquetas del repositorio GitHub configurado.
- Dependencias: propuesta aprobada por el usuario, bloque solicitado explícitamente en `AGENTS.md`; acceso a GitHub. Capacidad inicial: 96% de 5h y 90% de 7d; entrega documental estimada dentro de las reservas mínimas.
- Aceptación: configuración enlazada desde `AGENTS.md`; GitHub Issues con repositorio explícito; mapeo de las cinco etiquetas documentado sin modificar las existentes; layout multi-contexto con creación diferida de artefactos; compatibilidad explícita con planificación, delegación y Git del workflow raíz.
- Validación prevista: enlaces locales, coherencia, consulta de etiquetas remotas, Biome de los archivos editados, `git diff --check`, revisión del diff y publicación verificada en `int`. Sin builds ni tests de aplicaciones por alcance exclusivamente documental.
- Evidencia: [registro](iteration-log.md#agw-06-configure-engineering-skills).

## AGW-07 — Provision triage labels

- Estado: `validated`.
- Objetivo: crear las cuatro etiquetas de triaje ausentes en GitHub y conservar `wontfix`.
- Rutas: etiquetas de `martincalvodaniel/damaca-vercel-apps` y registro raíz.
- Dependencias: AGW-06; sesión personal renovada por el usuario y verificada como activa mediante `gh api user`. Capacidad al reanudar: 94% de 5h y 90% de 7d; corte estimado dentro de reservas.
- Aceptación: las cinco etiquetas configuradas existen; se conservan las etiquetas previas.
- Validación prevista: listar las etiquetas remotas tras crear únicamente las ausentes.
- Evidencia: [registro](iteration-log.md#agw-07-provision-triage-labels).

## AGW-01 — Centralizar el flujo y el contrato documental

- Estado: `validated`.
- Objetivo: centralizar el protocolo en la raíz, separar funciones de los tres documentos, reducir duplicación local y exigir el sistema a toda app actual y futura.
- Rutas: instrucciones raíz y de apps, `plan/**`, README y enlaces afectados.
- Dependencias: autorización del usuario en esta conversación.
- Aceptación: funciones documentales no duplicadas; workflows locales retirados; archivo histórico conservado donde había volumen; nueva app obligada a incluir estructura antes de trabajo no trivial; sin CI ni generador.
- Validación prevista: enlaces, coherencia, conservación del archivo, `git diff --check`.
- Evidencia: [iteration-log.md#AGW-01](iteration-log.md#agw-01-centralizar-el-flujo-y-el-contrato-documental).

## AGW-02 — Generación de apps con Turborepo

- Estado: `validated`.
- Objetivo: generar apps Next.js independientes en modo `mongo-google` o `local-pwa`, conservando las capacidades y límites de sus bases actuales.
- Rutas: `turbo/generators/**`, manifiesto raíz, lockfile Bun, `README.md`, CI y planificación raíz.
- Dependencias: AGW-01 y autorización explícita en esta conversación.
- Aceptación: comando interactivo y por argumentos; validaciones impiden colisiones antes de escribir; ambos scaffolds tienen identidad, puerto, instrucciones y planes propios; conservan auth/Mongo o PWA/IndexedDB respectivamente; no hay secretos ni configuración Vercel local.
- Validación: generación interactiva y aislada con argumentos; errores para slug/nombre/puerto/directorio inválidos; lint, tipos y pruebas de cada app; build de producción de ambos modos; recarga offline de la PWA; enlaces y `git diff --check`.
- Siguiente corte: AGW-03 retira los workspaces de plantilla tras validar sus sustitutos y actualiza inventario y lockfile.
- Evidencia: [iteration-log.md#AGW-02](iteration-log.md#agw-02-generación-de-apps-con-turborepo).

## AGW-03 — Retirar workspaces de plantilla

- Estado: `validated`.
- Objetivo: retirar `apps/my-next-template` y `apps/my-next-local-template` tras validar las bases externas del generador.
- Rutas: los dos workspaces de plantilla, `README.md`, `docs/monorepo.md`, `docs/turbopack.md`, `docs/deployment-and-caching.md`, `plan/master.md`, `package.json` y `bun.lock`.
- Dependencias: AGW-02 validada.
- Aceptación: `apps/*` ya no contiene esos workspaces; README, inventario raíz y lockfile reflejan solo apps activas; ambos modos siguen generándose; ninguna dependencia de las apps activas queda rota.
- Validación: instalación Bun reproducible; pruebas del generador; lint, type-check y pruebas de todas las apps activas; enlaces y `git diff --check`.
- Evidencia: [iteration-log.md#agw-03-retirar-workspaces-de-plantilla](iteration-log.md#agw-03-retirar-workspaces-de-plantilla).

## AGW-04 — Incorporar Card Wars al inventario

- Estado: `validated`.
- Objetivo: registrar el nuevo workspace en la documentación general del monorepo y enlazar su plan de producto.
- Rutas: `README.md`, `docs/monorepo.md`, `docs/turbopack.md`, `docs/deployment-and-caching.md`, `plan/master.md`, `plan/iterations.md`, `plan/iteration-log.md` y `apps/card-wars/plan/**`.
- Dependencias: solicitud de crear Card Wars como app local PWA.
- Aceptación: inventario y conteos incluyen las cinco apps; el plan raíz enlaza el master de Card Wars; el registro del producto queda en la app.
- Validación: revisar enlaces y conteos; validaciones técnicas de Card Wars se registran en la iteración principal de la app.
- Evidencia: [iteration-log.md#agw-04-incorporar-card-wars-al-inventario](iteration-log.md#agw-04-incorporar-card-wars-al-inventario).

## AGW-05 — Google identity and Hub access shared package

> Superseded for the games by [AGW-08](iterations.md#agw-08--public-games-and-hub-managed-oidc-clients); retained as delivery history.

> Superseded for Pocha Score and Card Wars by [AGW-08](iterations.md#agw-08--public-games-and-hub-managed-oidc-clients); retained as delivery history.
- Estado: `validated`.
- Objetivo: compartir Google OAuth y la comprobación de permisos de Hub e integrarlos obligatoriamente en Pocha Score y Card Wars.
- Rutas: `packages/identity/**`, manifiestos y lockfile raíz, configuración Turbo, `apps/{pocha-score,card-wars,damaca-hub}/**` y planes afectados.
- Dependencias: autorización del usuario para login obligatorio; credenciales Google, secretos propios y Hub/Mongo para verificación real. Capacidad inicial: 80% de 5h y 97% de 7d; corte estimado dentro de reservas (7%/2%).
- Aceptación: paquete workspace compartido; Google central en Hub, sesiones consumidoras independientes con email verificado; permisos actuales por app consultados servidor a servidor con credenciales aisladas; sin permiso, ante revocación o fallo no se abre el producto; no se comparten cookies; IndexedDB y copias existentes se conservan; instalación disponible y acceso offline retirado explícitamente; configuración documentada sin secretos.
- Decisión: Google OAuth y proveedor OIDC centralizados en Hub mediante Better Auth. Google solo se configura en Hub; consumidores usan código de autorización, S256 PKCE, state/nonce y validación de firma, emisor y audiencia. UserInfo comprueba el permiso vigente por cliente registrado; no se aceptan emails afirmados por consumidores. Hub adopta persistencia de identidad en MongoDB y rotación de claves.
- Validación prevista: contrato de API, tests de aislamiento, autenticación, rechazo, revocación, fallos y cliente HTTP; lint incremental, tipos/tests/build de las tres apps y paquete; navegación autenticada/no autenticada, móvil/escritorio y migración del worker según entorno disponible; diff, commit/push a int y SHA remoto.
- Evidencia: [registro](iteration-log.md#agw-05-google-identity-and-hub-access).
