> Archivo histórico cerrado el 2026-10-24. No usar como estado vigente, política normativa ni autorización; consultar el plan activo y el workflow raíz.

# Iteraciones

El estado de aceptación es independiente de commit, publicación y despliegue. Consultar [workflow.md](../../../../../plan/workflow.md).

La arquitectura vigente es la plantilla local de `07`, autorizada expresamente por el usuario. Las entregas `00`–`06` documentan el sistema anterior; sus requisitos de Google, roles, MongoDB y rutas protegidas quedan sustituidos. `01` sigue pendiente para el producto que nazca de la copia.

## 00 — Preparar la plantilla reutilizable

- Estado: `validated`.
- Objetivo: neutralizar referencias heredadas, documentar la base real y preparar un flujo agéntico reutilizable.
- `target_paths`: `README.md`, `AGENTS.md`, `plan/**`, `src/lib/auth/AGENTS.md`, `src/lib/auth/callback-url.test.ts`, `src/lib/db/ensure-indexes.test.ts`, `package.json`, `bun.lock`, `package-lock.json` (retirada), `public/*.svg` (retirada de ejemplos sin uso).
- Dependencias: inventario del repositorio y revisión de las convenciones de referencia.
- Aceptación: ejemplos sin dominio heredado; un solo lockfile; comando de índices compatible con `server-only`; documentación que distinga capacidades presentes y extensiones futuras; reglas de entrega sin permisos heredados.
- Validación: búsqueda de referencias, enlaces locales, `git diff --check`, lint, tipos, suite unitaria y build. Resultados en [iteration-log.md](iteration-log.md).

## 01 — Definir el producto de destino

- Estado: `pending`; requiere una petición de producto.
- Objetivo: concretar usuarios, problema, MVP, idioma, acceso, datos y criterios de éxito.
- `target_paths`: `plan/master.md`, `plan/iterations.md`, `plan/iteration-log.md`; añadir otras rutas solo si la petición incluye personalización técnica.
- Dependencias: cierre de `00` y requisitos humanos del nuevo producto.
- Aceptación: alcance y exclusiones explícitos, decisiones pendientes identificadas y primeras entregas ordenadas por dependencia con aceptación verificable.
- Validación: consistencia, enlaces locales y `git diff --check`; aplicar validación de código si la petición amplía el alcance.

Las siguientes iteraciones se definen a partir del producto real. No hay una hoja de ruta de funcionalidades implícita en la plantilla.

## 00a — Establecer integración agéntica en int

- Estado: `validated`.
- Objetivo: aplicar la instrucción humana de trabajar siempre en `int` y cerrar cada iteración con commit/push, reservando la promoción a `main` al usuario.
- `target_paths`: `AGENTS.md`, `README.md`, `plan/{AGENTS,master,workflow,iterations,iteration-log}.md`.
- Dependencias: `00` y autorización humana explícita de este flujo.
- Aceptación: regla consistente en todos los documentos vigentes; documentación incluida en el cierre obligatorio; verificación del SHA remoto; recuperación explícita ante fallo; `main` exclusivamente humano.
- Validación: enlaces locales, consistencia de reglas y `git diff --check`. Sin cambios de código que requieran repetir la suite.
- Publicación: commit y push de esta entrega en `int`; resultado y SHA comunicados al cierre.

## 02 — Administración y acceso de usuarios

- Estado: `validated`.
- Objetivo: reservar `ALLOWED_EMAILS` a administradores y gestionar usuarios normales desde `/admin` con persistencia MongoDB.
- `target_paths`: `src/lib/auth/**`, `src/lib/db/**`, `src/schemas/**`, `src/types/**`, `src/features/admin/**`, `src/features/home/**`, `src/app/(dashboard)/**`, `.env.example`, `README.md`, `AGENTS.md`, `plan/**`, `test/**`.
- Dependencias: autenticación Google existente y autorización humana explícita del nuevo modelo de acceso.
- Aceptación: administradores solo desde entorno; usuarios normales con alta/listado/revocación persistente; correos normalizados e índice único; denegación por defecto; autorización de servidor en cada operación y ruta; revocación aplicada en el siguiente acceso incluso con sesión abierta; errores saneados y UI accesible.
- Validación: pruebas de permisos/contratos/mutaciones, evaluación de índice y persistencia, lint, tipos, build y revisión UI móvil/escritorio. Distinguir integración real de dobles de prueba.
- Cierre: commit y push en `int`, verificación del SHA remoto; `main` exclusivamente humano.

## 03 — Solicitudes de acceso

- Estado: `validated`.
- Objetivo: permitir solicitar acceso a una cuenta Google verificada sin permiso y resolver solicitudes pendientes en administración.
- `target_paths`: `src/lib/auth/**`, `src/lib/db/**`, `src/features/auth/**`, `src/features/admin/**`, `src/schemas/**`, `src/types/**`, `src/app/(auth)/**`, `test/access-http.ts`, `README.md`, `AGENTS.md`, `plan/**`.
- Dependencias: `02`, separación entre identidad verificada y autorización de aplicación.
- Aceptación: correo obtenido exclusivamente de sesión verificada; solicitud idempotente; pantalla de estado sin acceso al producto; listado admin paginado; aceptación/rechazo autorizados y atómicos; decisiones obsoletas no afectan nuevas solicitudes; permisos anteriores compatibles; pruebas de rutas y acciones reales.
- Diseño: extender `user_access` con estado y UUID de solicitud. Un solo documento hace atómica la aceptación y la concesión, sin exigir transacciones multirregistro ni réplica Mongo. Los documentos previos sin estado conservan acceso.
- Validación: contratos/servicios, Mongo aislado con carreras y compatibilidad, Next compilado con cookies propias, UI móvil/escritorio, lint, tipos, build y diff.
- Cierre: commit/push en `int` y verificación del SHA remoto; `main` exclusivamente humano.

## 04 — Navegación responsive y ajustes

- Estado: `validated`.
- Objetivo: navegación inferior móvil y superior escritorio con Ajustes como único destino; mostrar usuario y selector Claro/Oscuro/Sistema siguiendo el patrón de referencia autorizado.
- `target_paths`: `src/components/shared/**`, `src/config/{navigation,theme}.ts`, `src/lib/theme/**`, `src/schemas/theme.ts`, `src/features/settings/**`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/settings/page.tsx`, `test/access-http.ts`, `README.md`, `plan/**`.
- Dependencias: sesión autorizada existente; sin nuevas dependencias ni consultas Mongo.
- Aceptación: un único registro de destinos, estado activo accesible, safe areas y contenido libre de solapamientos; ajustes protegidos con identidad/rol del servidor; tema persistente local, sistema dinámico y arranque anterior a hidratación; enlace admin solo para administradores.
- Validación: pruebas de tema/arranque, lint, tipos, suite, build y navegación/interacción móvil/escritorio con identidad ficticia.
- Cierre: commit/push en `int` con verificación remota.

## 04a — Foto del perfil social en Ajustes

- Estado: `validated`.
- Objetivo: mostrar la foto de Google en el icono de Ajustes y la tarjeta de cuenta, con iniciales si falta o falla.
- `target_paths`: `src/components/shared/{account-avatar,app-navigation,app-shell}.tsx`, `src/app/(dashboard)/layout.tsx`, `src/features/settings/components/settings-screen.tsx`, `README.md`, `plan/**`.
- Aceptación: imagen de sesión transmitida a ambos avatares, dimensiones estables, fallback por error y recuperación ante nueva imagen; sin cambiar permisos ni añadir dependencias.
- Validación: lint, tipos, suite, build y navegador con imagen ficticia y fallo de carga.
- Cierre: commit/push en `int` y verificación remota.

## 05 — UI en inglés

- Estado: `validated`.
- Objetivo: traducir toda la interfaz a inglés y fijarlo como idioma de la plantilla.
- `target_paths`: `src/features/**`, `src/components/shared/app-navigation.tsx`, `src/config/navigation.ts`, `src/app/layout.tsx`, `src/app/(auth)/auth/signin/page.tsx`, `test/access-http.ts`, `AGENTS.md`, `README.md`, `plan/**`.
- Aceptación: textos visibles/accesibles, errores y estados en inglés, `lang="en"`; sin cambios de lógica, rutas ni valores guardados.
- Validación: revisión completa del texto en fuente, lint, tipos, suite, build y comprobación compilada móvil/escritorio.
- Cierre: commit/push en `int` y verificación remota.

## 06 — Home en navegación

- Estado: `validated`.
- Objetivo: añadir Home al registro compartido de navegación móvil/escritorio, con icono local y estado activo solo en la raíz.
- `target_paths`: `src/config/navigation.ts`, `src/components/shared/app-navigation.tsx`, `src/components/ui/home-icon.tsx`, `README.md`, `plan/**`.
- Aceptación: Home enlaza `/`, Settings conserva su foto y ruta; estado activo exclusivo, sin overflow ni nuevas dependencias.
- Validación: lint, tipos, suite, build y navegación real móvil/escritorio.
- Cierre: commit/push en `int` con verificación remota.

## 07 — Plantilla local instalable

- Estado: `validated` (aceptación local); publicación remota bloqueada por acceso y revisión automática, pendiente revisión humana del remoto antes de otro intento.
- Objetivo: sustituir autenticación y persistencia remotas por una base estática local con IndexedDB y PWA, reutilizable mediante copia de archivos.
- `target_paths`: `src/**`, `public/**`, `scripts/**`, `test/**`, `package.json`, `bun.lock`, `next.config.ts`, `.env.example` (retirada), `README.md`, `AGENTS.md`, `plan/**`.
- Dependencias: petición humana explícita que autoriza retirar Google/MongoDB y añadir dependencias necesarias; guías del Next instalado sobre exportación estática y PWA.
- Diseño: conservar Next/React/Tailwind/Zod; añadir `idb` como envoltorio mínimo de IndexedDB y `fake-indexeddb` solo para pruebas. Exportación estática, fuentes del sistema, service worker generado desde los archivos compilados, activación de actualizaciones con consentimiento. Tema en localStorage solo como caché síncrona de arranque; fuente persistente en IndexedDB.
- Aceptación: sin login, roles, API, servidor de aplicación, secretos ni servicios externos; inicio y ajustes públicos; preferencia de tema en IndexedDB con errores visibles; manifest/iconos e instalación progresiva; rutas y recursos disponibles offline tras preparar la caché; actualizaciones sin borrar datos; reglas agénticas impiden reintroducir backend o dependencias remotas sin autorización.
- Validación: lint, tipos, pruebas de persistencia/validación/caché, build estático, instalación reproducible, revisión y navegación móvil/escritorio, recarga offline de ambas rutas y persistencia en navegador. Registrar límites de instalación nativa y cuotas del navegador.
- Cierre: commit/push en `int` y verificación de SHA remoto; `main` reservada al usuario.

- Evidencia final: 14 pruebas/54 aserciones, lint, tipos, Knip, instalación frozen y build aprobados; build adicional sin archivos de entorno. Navegador: vistas 390/1280px, rutas offline sin visita previa a Settings, persistencia tras reinicio, sincronización de tema y actualización consentida sin pérdida de datos. Instalación física no ejecutada. Ver [iteration-log.md](iteration-log.md).

## 08 — Gestionar capacidad de Codex por ventanas

- Estado: `validated` (documentación local); publicación pendiente de la revisión humana del remoto.
- Objetivo: incorporar al flujo agéntico la consulta de las ventanas de 5h/7d y ajustar cada entrega a la capacidad disponible con reservas del 7%/2%.
- `target_paths`: `AGENTS.md`, `plan/{master,workflow,iterations,iteration-log}.md`.
- Dependencias: petición humana explícita; herramienta de límites de Codex y documentación oficial consultadas. La publicación de `07` sigue pendiente de la revisión humana del remoto; esta petición autoriza una nueva entrega documental local, sin reintentar el push.
- Aceptación: ambas ventanas identificadas por duración; restante calculado correctamente; consultas actualizadas durante el trabajo; estimación de implementación, validación, correcciones y cierre; reservas sobre la capacidad total; reducción a un corte completo si no cabe; resto pendiente; tratamiento explícito de información no disponible y consumo compartido.
- Validación: revisión de coherencia, enlaces Markdown locales y `git diff --check`. Sin pruebas de aplicación por tratarse exclusivamente de documentación.
- Cierre: Conventional Commit local en `int`; conservar la publicación pendiente hasta que el usuario confirme la revisión del remoto.

## 09 — Tipar la configuración geográfica de Vercel

- Estado: `validated` (configuración local); despliegue no realizado y publicación Git pendiente de revisión humana del remoto.
- Objetivo: integrar el fragmento humano de configuración Vercel tipado, conservando la región `cdg1` y la denegación de peticiones cuyo país no sea `ES`.
- `target_paths`: `vercel.ts`, `package.json`, `bun.lock`, `README.md`, `plan/{master,workflow,iterations,iteration-log}.md`.
- Dependencias: `vercel.ts` ya existe como archivo del usuario sin seguimiento; se conserva su regla y se añade únicamente el tipado solicitado y su paquete de desarrollo. Documentación oficial Vercel y capacidad de Codex consultadas; entrega acotada estimada dentro de ambas reservas, incluyendo validación/cierre.
- Aceptación: configuración con `VercelConfig` resoluble; sin cambiar aplicación, datos locales ni rutas; documentación diferencia región de cómputo, geolocalización por IP y alcance de la regla frente a uso offline. Sin despliegue ni cambios en Vercel. Publicación Git sigue pendiente de revisión humana del remoto.
- Validación: lint, tipos, pruebas existentes, build estático, instalación frozen, revisión de configuración contra esquema del proveedor si está disponible, enlaces y `git diff --check`. Las pruebas locales no acreditan el bloqueo en la red Vercel.
- Cierre: commit local en `int`, incluyendo la integración del archivo aportado; sin reintentar push hasta indicación humana.
