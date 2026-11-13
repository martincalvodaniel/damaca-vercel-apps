# Iteraciones transversales

Este archivo es la única fuente de estado de cada iteración transversal. `validated` indica que se cumplieron los criterios documentados; publicación y SHA se verifican en Git y se evidencian en el registro.

## AGW-16 — Investigación de La Bottega y su integración con billing

- Estado: `validated`.
- Objetivo: auditar la navegación pública de La Bottega di Pali, contrastar billing con su código y comparar alternativas de sustitución de WordPress/WooCommerce e integración, sin implementar ni adoptar una arquitectura definitiva.
- Rutas: `docs/research/la-bottega-di-pali/**`, `docs/README.md`, planificación raíz y referencia desde `apps/billing-poc/plan/master.md`.
- Dependencias: acceso público de solo lectura a la web y documentación oficial; código local de billing. Trabajo secuencial, sin delegación ni acceso a datos de clientes o secretos.
- Aceptación: inventario trazable de páginas descubiertas por navegación y límites explícitos; análisis funcional, UX/SEO y dependencias; capacidades reales de billing; comparación de despliegues/API/base compartida, bases de datos y modelo de reservas/productos; riesgos, migración, costes y preguntas para planificar después. Documentos en español con fuentes y separación entre observaciones y propuestas.
- Validación prevista: revisar cobertura del inventario y fuentes, enlaces Markdown locales, coherencia con código y restricciones, `git diff --check`, revisión del diff, commit documental y publicación verificada en `origin/int`. Sin builds ni pruebas de producto por alcance documental.
- Capacidad inicial (2026-11-02, 11:22 CET aprox.): 63% de 5h y 49% de 7d restantes; estimación conservadora de entrega documental dentro de reservas de 7%/2%. Revisar antes de fases costosas y al cierre.
- Registro principal: [AGW-16](iteration-log.md#agw-16-investigación-de-la-bottega-y-su-integración-con-billing).

## AGW-14 — Audit Vercel deployment quota discrepancy

- Estado: `validated`.
- Objetivo: capturar y clasificar todos los deployments de 24 horas del equipo, contrastar las omisiones con la política oficial y preparar una consulta a soporte sin enviarla.
- Rutas: `docs/incidents/2026-11-01-vercel-deployment-limit.*`, `docs/deployment-and-caching.md` y planificación/archivo raíz.
- Dependencias: CLI Vercel autenticada; acceso de solo lectura al equipo actual; plan aprobado por el usuario. Capacidad inicial (2026-11-01): 56% de 5h y 59% de 7d restantes; corte documental secuencial dentro de reservas.
- Aceptación: captura con ventana UTC fija, paginación completa, IDs sin secretos, clasificación de cada cancelación y ajustes de los seis proyectos; informe con límites de la evidencia y borrador de soporte no enviado; guía distingue omisión automática de Ignored Build Step.
- Validación prevista: reconciliar captura/recuentos/informe, revisar enlaces locales y anclas, formato JSON, `git diff --check`, revisión de secretos y publicación verificada en `origin/int`. Sin cambios de apps, builds ni tests de producto.
- Evidencia: [registro AGW-14](iteration-log.md#agw-14-audit-vercel-deployment-quota-discrepancy).

## AGW-15 — Verify Vercel Preview recovery

- Estado: `pending`.
- Objetivo: comprobar la recuperación mediante un único Preview de billing después del desbloqueo.
- Dependencias: confirmación de desbloqueo de Vercel o evidencia equivalente; no asumir que un plazo anunciado demuestra recuperación.
- Aceptación: verificar equipo/proyecto/commit `int` pendiente antes de la prueba; un único intento Preview termina `READY`; volver a consultar registros y documentar resultado. No reintentos periódicos ni promoción a producción.
- Validación prevista: `vercel inspect` del Preview y listado de deployments del equipo. Si la prueba falla, registrar el error sin declarar recuperación ni repetir automáticamente.
- Contexto: [informe AGW-14](../docs/incidents/2026-11-01-vercel-deployment-limit.md). No enviado ningún mensaje a soporte.

## AGW-13 — Restore independent Tasks authentication and suspend database refresh

- Estado: `validated`.
- Objetivo: restaurar Google directo y la allowlist de Tasks; dejar el refresco de bases sin efecto en ningún entorno conservando su implementación para el futuro.
- Rutas: autenticación/configuración/pruebas/documentación de `apps/dalis-tasks-events/**`; cron/configuración/cliente Mongo de `apps/damaca-hub/**`; lockfile y planificación transversal.
- Dependencias: decisión explícita del usuario de retirar temporalmente AGW-11 y suspender AGW-12. Credenciales Google propias de Tasks por entorno para validar login alojado.
- Aceptación: Tasks no importa ni consulta Hub; autorización por sesión Mongo y `ALLOWED_EMAILS`; IDs/datos/offline preservados. Hub no programa cron, su endpoint no ejecuta refrescos ni recuperación y las funciones retenidas rechazan ejecución incluso con variables antiguas. El arranque Mongo no depende del manifiesto de refresco.
- Validación prevista: lint incremental y explícito, tipos, suites Tasks/Hub, builds filtrados, pruebas de denegación del refresco con configuración antigua, revisión de referencias/contratos y `git diff --check`; comprobar configuración alojada sin revelar secretos si está disponible.
- Registro principal: [AGW-13](iteration-log.md#agw-13-restore-independent-tasks-authentication-and-suspend-database-refresh).
- Capacidad inicial (2026-10-31): 97% de 5h y 100% de 7d restantes; corte secuencial estimado dentro de reservas.

## AGW-12 — Shared database refresh and Hub integration

- Estado: `pending`.
- Suspensión: decisión del usuario en AGW-13; no activar ni ejecutar el refresco. Código retenido para posible reanudación.
- Objetivo: implementar el motor compartido de copia producción→int con alineación exacta de índices e integrarlo solo en Damaca Hub, según [issue #3](https://github.com/martincalvodaniel/damaca-vercel-apps/issues/3).
- Alcance de esta entrega: paquete `@damaca/database-refresh`; cron diario y ruta protegida del Hub; copia del catálogo y grants; validación de índices en el arranque Hub `int`. No configurar conexiones, cron ni código en las otras aplicaciones.
- Rutas: `packages/database-refresh/**`, catálogos/manifiestos raíz, `apps/damaca-hub/**` y planificación raíz/Hub.
- Dependencias: credenciales Atlas con lectura solo de pro y escritura limitada a int; variables privadas y cron habilitado en Vercel. Los valores remotos no se guardan en Git.
- Aceptación: copiar las colecciones declaradas, conservar los datos propios del Hub `int`, replicar y verificar índices de origen, bloquear arranques Hub `int` con manifiesto ausente/divergente, rechazar invocación no autorizada o entorno distinto, y programar el cron del Hub diariamente. La entrega no cambia las otras apps.
- Validación prevista: pruebas unitarias e integración sobre Mongo local/desechable; lint, tipos, tests y build del paquete y Hub; enlaces y `git diff --check`. Atlas, credenciales Vercel y primera ejecución programada se comprobarán de forma separada cuando estén disponibles. Reanudación pospuesta por AGW-13; no configurar ni activar ejecuciones sin una nueva decisión del usuario.
- Evidencia: [registro AGW-12](iteration-log.md#agw-12-shared-database-refresh-and-hub-integration). Referencia desde [plan del Hub](../apps/damaca-hub/plan/master.md).
- Decisiones: refresco diario del Hub a las 00:00 UTC; política explícita de copiar catálogo/grants y conservar identidad/OIDC/secrets de int; los índices de aplicaciones en Hub int se validan exactamente contra el manifiesto de pro sin creación automática.

## AGW-11 — Dalis Tasks uses Hub identity

> Integración retirada por decisión del usuario en AGW-13; se conserva esta entrega como historial.
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
- Evidencia: [iteration-log.md#AGW-01](archive/2026-10-31/iteration-log.md#agw-01-centralizar-el-flujo-y-el-contrato-documental).

## AGW-02 — Generación de apps con Turborepo

- Estado: `validated`.
- Objetivo: generar apps Next.js independientes en modo `mongo-google` o `local-pwa`, conservando las capacidades y límites de sus bases actuales.
- Rutas: `turbo/generators/**`, manifiesto raíz, lockfile Bun, `README.md`, CI y planificación raíz.
- Dependencias: AGW-01 y autorización explícita en esta conversación.
- Aceptación: comando interactivo y por argumentos; validaciones impiden colisiones antes de escribir; ambos scaffolds tienen identidad, puerto, instrucciones y planes propios; conservan auth/Mongo o PWA/IndexedDB respectivamente; no hay secretos ni configuración Vercel local.
- Validación: generación interactiva y aislada con argumentos; errores para slug/nombre/puerto/directorio inválidos; lint, tipos y pruebas de cada app; build de producción de ambos modos; recarga offline de la PWA; enlaces y `git diff --check`.
- Siguiente corte: AGW-03 retira los workspaces de plantilla tras validar sus sustitutos y actualiza inventario y lockfile.
- Evidencia: [iteration-log.md#AGW-02](archive/2026-10-31/iteration-log.md#agw-02-generación-de-apps-con-turborepo).

## AGW-03 — Retirar workspaces de plantilla

- Estado: `validated`.
- Objetivo: retirar `apps/my-next-template` y `apps/my-next-local-template` tras validar las bases externas del generador.
- Rutas: los dos workspaces de plantilla, `README.md`, `docs/monorepo.md`, `docs/turbopack.md`, `docs/deployment-and-caching.md`, `plan/master.md`, `package.json` y `bun.lock`.
- Dependencias: AGW-02 validada.
- Aceptación: `apps/*` ya no contiene esos workspaces; README, inventario raíz y lockfile reflejan solo apps activas; ambos modos siguen generándose; ninguna dependencia de las apps activas queda rota.
- Validación: instalación Bun reproducible; pruebas del generador; lint, type-check y pruebas de todas las apps activas; enlaces y `git diff --check`.
- Evidencia: [iteration-log.md#agw-03-retirar-workspaces-de-plantilla](archive/2026-11-01/iteration-log.md#agw-03-retirar-workspaces-de-plantilla).

## AGW-04 — Incorporar Card Wars al inventario

- Estado: `validated`.
- Objetivo: registrar el nuevo workspace en la documentación general del monorepo y enlazar su plan de producto.
- Rutas: `README.md`, `docs/monorepo.md`, `docs/turbopack.md`, `docs/deployment-and-caching.md`, `plan/master.md`, `plan/iterations.md`, `plan/iteration-log.md` y `apps/card-wars/plan/**`.
- Dependencias: solicitud de crear Card Wars como app local PWA.
- Aceptación: inventario y conteos incluyen las cinco apps; el plan raíz enlaza el master de Card Wars; el registro del producto queda en la app.
- Validación: revisar enlaces y conteos; validaciones técnicas de Card Wars se registran en la iteración principal de la app.
- Evidencia: [iteration-log.md#agw-04-incorporar-card-wars-al-inventario](archive/2026-11-01/iteration-log.md#agw-04-incorporar-card-wars-al-inventario).

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

## AGW-17 — Manual Vercel deployments

- Estado: `validated`.
- Objetivo: desactivar deployments automáticos por Git en las seis apps restantes, como en LBDP-04.
- Rutas: `apps/*/vercel.ts` salvo LBDP y planes raíz; referencias en planes de las apps afectadas.
- Aceptación: `git.deploymentEnabled: false` en las siete apps; conservar comandos, regiones y reglas existentes. Publicación en int sin promoción ni deployment manual. Las ramas que no contienen este cambio conservan su configuración anterior.
- Validación: Biome incremental, tipos filtrados, inspección de las siete configuraciones y diff check. Cambio de configuración Git sin lógica de producto; no requiere pruebas de aplicación ni builds de producto.

## AGW-18 — Vercel deployment and alias skill

- Estado: `validated`.
- Objetivo/rutas: skill local `.agents/skills/vercel-deploy-alias/SKILL.md`, con selección de app/rama y despliegue manual seguido de alias verificado.
- Aceptación: opciones explícitas, SHA remoto, entorno separado de rama, READY previo al alias, parada por cuota y preservación de tráfico ante fallos.
- Validación: frontmatter y revisión de procedimiento contra CLI/API usada en esta sesión; diff y Biome staged. Sin deployment real para validar documentación.

## AGW-19 — Vercel deployment count skill

- Estado: `validated`.
- Objetivo/rutas: `.agents/skills/vercel-deployment-report/**`, script determinista de ventana móvil y registro raíz.
- Aceptación: ventana fija inclusiva/exclusiva, paginación, deduplicación, estados completos y desglose por proyecto; consulta de solo lectura.
- Validación: ejecución real del script, reconciliación de totales, revisión del frontmatter, formato y diff check.

## AGW-20 — Branch deployment environments

- Estado: `validated`.
- Objetivo/rutas: skill vercel-deploy-alias y registros raíz.
- Aceptación: main siempre Production e int siempre Preview; invocar main autoriza producción y dominios.
- Validación: revisión de coherencia, Biome staged y diff check. Sin deployment.

## AGW-21 — Manifiestos de instalación para Billing y Home Management

- Estado: `validated`.
- Rutas: `apps/{billing-poc,dalis-home-management}/src/app/manifest.ts` y planes vinculados.
- Dependencias: convención de metadatos de Next.js e iconos existentes de AGW-10.
- Aceptación: ambas apps publican un manifiesto con inicio en la raíz, modo independiente e iconos de 192 y 512 píxeles.
- Validación: Biome, tipos, pruebas, compilación y comprobación del manifiesto generado en ambas apps. Evidencia en el [registro](iteration-log.md#agw-21--manifiestos-de-instalación-para-billing-y-home-management).

## AGW-22 — Align Vercel configuration

- Estado: validated.
- Objetivo y rutas: aplicar una política uniforme en `apps/*/vercel.ts` y `turbo/generators/templates/*/vercel.ts`.
- Dependencias: Bun y dependencias locales del monorepo. Capacidad inicial: 99% de 5h y 98% de 7d restantes.
- Aceptación: los once archivos desactivan despliegues Git, deniegan solicitudes cuyo país no sea ES en todas las rutas y usan la instalación condicional con bunx.
- Validación prevista: comparación normalizada, Biome incremental, tipos, pruebas y builds de las apps modificadas, pruebas del generador y diff check.
- Evidencia: [registro AGW-22](iteration-log.md#agw-22--align-vercel-configuration).

## AGW-23 — Nombres de instalación de Dalis

- Estado: `validated`.
- Rutas: manifiestos, metadatos de Apple, configuración de nombre y caché de build de Home Management y Tasks.
- Dependencias: referencia Git de Vercel, siguiendo BILL-27.
- Aceptación: `dalis-home` y `dalis-tasks`, con sufijo `-int` exclusivamente en esa rama.
- Validación: Biome, tipos, pruebas, compilación y comprobación de nombres generados.
- Evidencia: [registro AGW-23](iteration-log.md#agw-23--nombres-de-instalación-de-dalis).


## AGW-24 — Diseño compacto en móvil

- Estado: `validated`.
- Rutas: `AGENTS.md`, `plan/` y `apps/ebrias-patanes-del-jurado/src/app/`.
- Dependencias: portada y dibujo sin marco de Ebrias.
- Aceptación: regla de diseño adaptable para todas las apps y portada de Ebrias con estética de dibujo animado, título, acceso y dibujo visibles en móvil.
- Validación: Biome, tipos, build y revisión en móvil y escritorio.

## AGW-25 — Retirar un workspace y actualizar el inventario

- Estado: `validated`.
- Objetivo: retirar la prueba de concepto solicitada y documentar todas las aplicaciones disponibles.
- Rutas: workspace retirado en `apps/*`, `bun.lock`, `README.md` y planificación raíz.
- Dependencias: Bun 1.4.4 y los manifiestos de los workspaces activos.
- Aceptación: retirar el workspace y sus referencias vigentes. El README enumera cada workspace activo con su ruta y puerto de desarrollo.
- Validación: instalación congelada, descubrimiento de workspaces en Turbo, contraste del README con los manifiestos, búsqueda de referencias y revisión del diff.

## AGW-26 — Verificar la selección de base MongoDB

- Estado: `validated`.
- Objetivo: asegurar que las aplicaciones con MongoDB y la plantilla `mongo-google` respeten `MONGODB_DB`.
- Rutas: configuración de Ebrias, ejemplos de entorno de Ebrias y Billing, README de Ebrias y planificación de la raíz, Ebrias y Billing.
- Dependencias: clientes MongoDB de cada app y generador de workspaces.
- Aceptación: la base indicada llega al driver y cada app conserva su valor predeterminado si la variable falta.
- Validación: ejecutar la selección con valores ficticios y sin conexión al clúster, probar el generador y ejecutar Biome, tipos y build en Ebrias.

## AGW-27 — Iconos de Damaca Secrets

- Estado: `validated`.
- Rutas: generador de iconos, recursos de Damaca Secrets y copia de catálogo del Hub.
- Aceptación: generar el favicon y los iconos de instalación, servir el manifiesto y verificar el avatar del proyecto de Vercel.
