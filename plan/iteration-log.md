# Registro de entregas transversales

Las evidencias AGW-01 y AGW-02 están en el [archivo del 31 de octubre](archive/2026-10-31/README.md); AGW-03 y AGW-04, en el [archivo del 1 de noviembre](archive/2026-11-01/README.md).

Los hechos de publicación se verifican en Git. El estado normativo está en [iterations.md](iterations.md); este registro conserva evidencia, límites e incidentes observados.

<a id="agw-01-centralizar-el-flujo-y-el-contrato-documental"></a>
<a id="agw-02-generación-de-apps-con-turborepo"></a>
Evidencias históricas [AGW-01 y AGW-02](archive/2026-10-31/iteration-log.md) archivadas; estas anclas conservan los enlaces anteriores.

<a id="agw-03-retirar-workspaces-de-plantilla"></a>
<a id="agw-04-incorporar-card-wars-al-inventario"></a>
Evidencias históricas [AGW-03 y AGW-04](archive/2026-11-01/iteration-log.md) archivadas; estas anclas conservan los enlaces anteriores.

<a id="agw-16-investigación-de-la-bottega-y-su-integración-con-billing"></a>
<a id="agw-16--investigación-de-la-bottega-y-su-integración-con-billing"></a>
- [AGW-16 — Investigación de La Bottega y su integración con billing](archive/2026-11-14/iteration-log.md#agw-16--investigación-de-la-bottega-y-su-integración-con-billing).

<a id="agw-14-audit-vercel-deployment-quota-discrepancy"></a>
<a id="agw-14--audit-vercel-deployment-quota-discrepancy"></a>
- [AGW-14 — Audit Vercel deployment quota discrepancy](archive/2026-11-14/iteration-log.md#agw-14--audit-vercel-deployment-quota-discrepancy).

<a id="agw-13-restore-independent-tasks-authentication-and-suspend-database-refresh"></a>
<a id="agw-13--restore-independent-tasks-authentication-and-suspend-database-refresh"></a>
- [AGW-13 — Restore independent Tasks authentication and suspend database refresh](archive/2026-11-14/iteration-log.md#agw-13--restore-independent-tasks-authentication-and-suspend-database-refresh).

<a id="agw-12-shared-database-refresh-and-hub-integration"></a>
<a id="agw-12--shared-database-refresh-and-hub-integration"></a>
- [AGW-12 — Shared database refresh and Hub integration](archive/2026-11-14/iteration-log.md#agw-12--shared-database-refresh-and-hub-integration).

<a id="agw-11-dalis-tasks-uses-hub-identity"></a>
<a id="agw-11--dalis-tasks-uses-hub-identity"></a>
- [AGW-11 — Dalis Tasks uses Hub identity](archive/2026-11-14/iteration-log.md#agw-11--dalis-tasks-uses-hub-identity).

<a id="agw-10-application-favicons"></a>
<a id="agw-10--application-favicons"></a>
- [AGW-10 — Application favicons](archive/2026-11-14/iteration-log.md#agw-10--application-favicons).

<a id="agw-09-restore-global-lint-success"></a>
<a id="agw-09--restore-global-lint-success"></a>
- [AGW-09 — Restore global lint success](archive/2026-11-14/iteration-log.md#agw-09--restore-global-lint-success).

<a id="agw-07-provision-triage-labels"></a>
<a id="agw-07--provision-triage-labels"></a>
- [AGW-07 — Provision triage labels](archive/2026-11-14/iteration-log.md#agw-07--provision-triage-labels).

<a id="agw-06-configure-engineering-skills"></a>
<a id="agw-06--configure-engineering-skills"></a>
- [AGW-06 — Configure engineering skills](archive/2026-11-14/iteration-log.md#agw-06--configure-engineering-skills).

<a id="agw-05--google-identity-and-hub-access"></a>
- [AGW-05 — Google identity and Hub access](archive/2026-11-14/iteration-log.md#agw-05--google-identity-and-hub-access).

<a id="agw-17--manual-vercel-deployments"></a>
- [AGW-17 — Manual Vercel deployments](archive/2026-11-14/iteration-log.md#agw-17--manual-vercel-deployments).

<a id="agw-18--vercel-deployment-and-alias-skill"></a>
- [AGW-18 — Vercel deployment and alias skill](archive/2026-11-14/iteration-log.md#agw-18--vercel-deployment-and-alias-skill).

## AGW-19 — Vercel deployment count skill

- Script Python sin dependencias externas: consulta CLI paginada, ventana fija de creación [inicio, fin), deduplicación y totales por estado/proyecto; admite end ISO con zona y duración configurada.
- Ejecución real: 2026-11-01T19:22:34.038Z a 2026-11-02T19:22:34.038Z, 94 registros: 59 CANCELED, 34 READY, 1 ERROR; una página cubre el límite inferior. Corrige el recuento conversacional anterior que usó un epoch mal convertido y omitió el límite superior.
- Revisión de campos, suma de estados, formato, diff check y publicación en int comprobados al cierre. No se muta Vercel; no se infiere fuente del trigger ni cuota interna.

## AGW-20 — Branch deployment environments

- Actualizada la skill: main autoriza Production y sus dominios; int usa Preview. Ajustadas selección, target API y asignación de alias para coherencia.
- Revisión documental y diff check; Biome staged al cierre. Sin deployment real. Capacidad inicial: 79% de 5h y 29% semanal.

## AGW-21 — Manifiestos de instalación para Billing y Home Management

- Capacidad inicial disponible: 99% de 5 h y 14% de 7 d.
- Ambos manifiestos usan los PNG existentes, incluida la variante maskable. Inicio y alcance en la raíz, con apertura en modo independiente.
- Biome en ambos archivos nuevos, comprobación de tipos y 1.212 pruebas superadas. El build normal encontró restricciones de acceso a Google Fonts y de apertura de puertos de Turbopack en este entorno. El build con `-- --webpack` pasó en ambas apps.
- Verificados el JSON generado en `/manifest.webmanifest`, el enlace en el HTML compilado y las dimensiones reales de los PNG. Pendiente comprobar la instalación en Chrome Android tras desplegar.

## AGW-22 — Align Vercel configuration

- [Aceptación](iterations.md#agw-22--align-vercel-configuration). Los once archivos coinciden al normalizar el nombre del paquete. Las dos ramas del comando de instalación se verificaron con un sustituto local de bunx.
- Biome comprobó explícitamente los once archivos y la prueba actualizada del Hub. Pasaron los tipos, la suite del Hub, las seis pruebas del generador y `git diff --check`.
- Builds de Hub, Damaca POCs y LBDP completados.
- La regla geográfica incluye los endpoints OAuth/OIDC del Hub. Las llamadas servidor a servidor clasificadas fuera de España o sin país quedan bloqueadas. Sin verificación de tráfico en Vercel.

## AGW-23 — Nombres de instalación de Dalis

- Inicio: 2026-11-08, rama `int` limpia, 94 % de 5 h y 98 % de 7 d restantes. [Aceptación](iterations.md#agw-23--nombres-de-instalación-de-dalis).
- Ambos manifiestos y títulos de Apple usan el nombre configurado por rama. Turbo separa la caché por referencia Git en cada app.
- Verificados ambos manifiestos con `int`, `main` y valor vacío. La compilación webpack de `int` produjo los dos manifiestos y títulos Apple esperados. El primer intento local falló al descargar Geist y Geist Mono; la compilación con acceso a red pasó.
- Biome y tipos correctos. Home Management: 187 pruebas correctas. Tasks: 1392 correctas y 225 omitidas por su configuración de pruebas. Cero fallos. Sin instalación en dispositivo ni despliegue.


## AGW-24 — Diseño compacto en móvil

Inicio: 75% de 5 h y 95% de 7 d disponibles (10:10 CET).
- Biome, tipos y build de Ebrias correctos.
- En Chrome a 320 × 568, 390 × 844 y 1440 × 900, el título, el botón y el dibujo completo se ven sin desplazamiento horizontal ni vertical para alcanzarlos.

## AGW-25 — Retirar un workspace y actualizar el inventario

- Inicio el 11 de noviembre de 2026 a las 11:00 CET, con 99 % de 5 h y 67 % de 7 d disponibles. [Aceptación](iterations.md#agw-25--retirar-un-workspace-y-actualizar-el-inventario).
- Retirado el workspace solicitado y regenerado `bun.lock`. La comprobación del README confirmó las nueve aplicaciones, sus puertos y los enlaces locales. La búsqueda de referencias al workspace retirado quedó vacía.
- Pasaron `bun install --frozen-lockfile`, `bun run turbo ls`, las seis pruebas de `bun run test:generator` y `git diff --check`. Biome incremental terminó con cero archivos aplicables. El código de las aplicaciones activas queda fuera del alcance de las comprobaciones de tipos y builds de este corte.

## AGW-26 — Verificar la selección de base MongoDB

- [Criterios](iterations.md#agw-26--verificar-la-selección-de-base-mongodb). Inicio a las 11:18 CET del 11 de noviembre de 2026, con 95 % de 5 h y 66 % de 7 d disponibles.
- Ebrias seleccionaba su valor predeterminado incluso con `MONGODB_DB` configurado. Tras el cambio, se verificaron el override y el valor predeterminado en desarrollo, integración y producción. Better Auth, los repositorios y los scripts usan la misma conexión.
- Confirmados el override y el valor predeterminado en Billing, Dalis Home, Dalis Tasks, Hub y una app generada con `mongo-google`. Pasó la regresión de Damaca POCs. Las comprobaciones observaron la base seleccionada en el driver con configuración ficticia y sin conexión a MongoDB.
- Pasaron las seis pruebas del generador, los tipos y el build de Ebrias, Biome y `git diff --check`.

## AGW-27 — Iconos de Damaca Secrets

- Capacidad inicial de Codex de 59 % en 5 horas y 33 % en 7 días.
- El generador compartido produce el favicon ICO, los PNG de 192 y 512 px, la variante maskable, el icono de Apple de 180 px y el SVG del Hub. El manifiesto y los recursos de instalación forman parte de la interfaz disponible sin conexión.
- Pasaron Biome, TypeScript y el build Webpack. Se verificaron los tres tamaños del ICO, las dimensiones PNG, los metadatos de la página de acceso y HTTP 200 para cada recurso y el manifiesto.
- La API de Vercel confirmó la carga y la lectura posterior del avatar de Damaca Secrets. La instalación en un dispositivo real sigue pendiente.
- El commit queda local porque `int` contiene el commit ajeno sin publicar `44e6431`.

## AGW-28 — Instalación uniforme de webapps

- [Alcance y aceptación](iterations.md#agw-28--instalación-uniforme-de-webapps). Inicio en `int`, árbol limpio y base remota `f3830f7`. Capacidad inicial del 89% en 5h y 23% en 7d.
- Diez manifiestos con los nombres acordados y sufijo de integración. Metadatos de instalación alineados, arte local para los manifiestos nuevos y referencia Git incluida en la clave de caché. La regla se aplica en las dos bases del generador y está documentada en AGENTS.md.
- Biome, tipos, pruebas de los 10 workspaces con suites y seis pruebas del generador correctos. Las integraciones que requieren MongoDB aislado conservaron sus exclusiones. El primer pase restringido no pudo abrir el puerto local que usa la suite de identidad y pasó al ejecutarla con acceso a ese puerto.
- Compiladas las diez apps para cada rama y contrastados los 20 manifiestos generados. Se usó Webpack donde Turbopack falló por fuentes o puertos locales. Las rutas de inicio y los identificadores existentes se conservaron.
- Por HTTP local con el build de `int` se verificaron en las diez apps los manifiestos e iconos públicos y el enlace al manifiesto, `application-name` y título Apple en el HTML. Los procesos que sirven rutas dinámicas recibieron la misma referencia Git que el build. No se realizó una instalación en un dispositivo Android.
