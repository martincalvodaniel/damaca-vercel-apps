# Registro de iteraciones

El estado de cada iteración se mantiene únicamente en [iterations.md](iterations.md). Este registro conserva hechos, validación y límites.

## 00 — Preparación de la base reutilizable · 2026-10-23

- Cambios: README ajustado al funcionamiento real; reglas raíz y anidadas para planificación y autenticación; plan reutilizable; ejemplos de pruebas neutrales; paquete identificado como `my-next-template`; Bun como única fuente de instalación; condición `react-server` en bootstrap de índices.
- Limpieza adicional: retirado `package-lock.json`, que describía dependencias antiguas distintas de las actuales. Retirados los cinco SVG sin uso de `create-next-app`, que provocaban errores de accesibilidad en Biome. La búsqueda de referencias confirmó que no los utiliza el código.
- Decisiones: conservar el modelo de autenticación existente, sin adaptador MongoDB. No incorporar funcionalidades de negocio, reglas de navegación del producto anterior, permisos de publicación, reservas de cuota ni automatizaciones de otros proyectos. Los commits requieren autorización de la entrega actual.
- `bun install --frozen-lockfile`: aprobado, sin cambios de dependencias.
- `bun run lint`: aprobado, 28 archivos. La primera pasada detectó los cinco SVG de ejemplo; se corrigió retirando esos recursos sin uso y se repitió el lint.
- `bun run type-check`: aprobado.
- `bun run test`: 9 pruebas aprobadas, 0 fallos, 11 aserciones.
- `bun run build`: aprobado con Next.js 16.4.2/Turbopack; rutas `/`, `/auth/signin` y `/api/auth/[...all]`, más la página de no encontrado y el proxy.
- Módulo de índices ejecutado con `bun --conditions=react-server` y registro vacío: aprobado sin conexión de datos; acredita la resolución de `server-only`, no una provisión MongoDB real.
- Referencias: búsqueda de nombres del dominio anterior en archivos del proyecto, sin coincidencias; enlaces Markdown locales comprobados; `git diff --check` aprobado. La revisión excluye historial Git, dependencias, artefactos generados y archivos privados de entorno.
- Límites: no se ha realizado un login interactivo con Google, una conexión real a MongoDB ni una revisión visual de las pantallas, que no han cambiado. La interfaz inicial sigue teniendo textos mixtos; su idioma se define al personalizar el producto.
- Publicación: commit local solicitado por el usuario tras la validación; sin push ni despliegue solicitados. No se han modificado credenciales ni el repositorio de referencia.
- Siguiente paso: definir el producto de destino en `01` a partir de sus requisitos humanos.


## 00a — Flujo obligatorio en int · 2026-10-23

- Instrucción humana: trabajar siempre en `int`, crear un commit y hacer push tras cada iteración; el usuario revisa y realiza el merge y push de `main`.
- Cambios: alineados README, reglas raíz/anidadas, plan maestro y protocolo de cierre. Incluye iteraciones documentales, preparación segura de `int`, publicación explícita a `origin/int`, verificación del SHA y tratamiento de fallos sin force-push.
- Esta decisión sustituye la política inicial de autorización de commit por entrega de `00`; la entrada anterior se conserva como evidencia histórica.
- Preparación: árbol limpio; `git fetch origin`; creada `int` desde `origin/main` al no existir `int` local/remota. No se ha modificado `main`.
- Validación: enlaces Markdown locales, consistencia de instrucciones vigentes y `git diff --check` aprobados. No se repiten pruebas de aplicación porque no cambia código ni configuración ejecutable.
- Publicación: commit/push a `origin/int` autorizados como cierre de esta entrega; verificar el SHA remoto y comunicar el resultado real al usuario, sin anticipar su hash en este registro.
- Siguiente paso de producto: `01`, pendiente de requisitos; integración a `main` exclusivamente humana.


## 02 — Administración y acceso de usuarios · 2026-10-23

- Instrucción humana: `ALLOWED_EMAILS` concede administración; otros correos acceden como usuarios normales mediante permisos persistidos en MongoDB.
- Implementación: rol calculado en servidor por petición a partir de sesión con correo verificado; administradores desde entorno y permisos normales desde `user_access`. Las cookies y el modelo sin adaptador persistente de Better Auth se conservan. No se guardan roles en cookies.
- `/admin`: layout y lectura autorizados, formulario de alta, listado paginado de 50 entradas y revocación. Acciones autorizadas individualmente, Zod compartido, rechazo de cambios a administradores y errores saneados. Enlace desde inicio solo para administradores.
- Datos: correo normalizado a minúsculas y sin espacios exteriores, alta idempotente y registro de fecha. Índice central `email_unique` para unicidad, búsqueda de membresía y paginación por correo. Sin dependencias nuevas.
- Pruebas unitarias: `bun run test`, 23 aprobadas, 0 fallos, 44 aserciones. Incluyen permisos, revocación, entradas inválidas, normalización, intento de promoción y fallos de persistencia/sesión.
- MongoDB real aislado: `src/lib/db/user-access.integration.ts` aprobado en contenedor temporal propio. Altas concurrentes, normalización, persistencia tras cerrar/reabrir conexión, revocación idempotente, dos páginas sin duplicados e índice único real.
- Next compilado + Mongo aislado: `test/access-http.ts` aprobado con cookies firmadas exclusivamente para la aplicación de prueba. Rutas anónima/admin/usuario/correo no verificado, altas y revocaciones mediante Server Actions reales, rechazo de escalada y denegación con la misma cookie tras revocar. No se ha realizado login interactivo con Google.
- UI real compilada: alta y revocación por navegador aprobadas con correo ficticio. Móvil de 390px sin desbordamiento (scrollWidth 390px) y botones de 44px; escritorio de 1280px con contenido máximo 768px. Capturas fuera de Git: `/private/tmp/template-admin-mobile.png` y `/private/tmp/template-admin-desktop.png`. Viewport restaurado y pestaña propia cerrada.
- Validación estática: `bun run lint` aprobado sin errores ni warnings; quedan cinco avisos informativos de estilo de pruebas preexistentes en archivos no modificados. `bun run type-check` y `git diff --check` aprobados; enlaces Markdown locales comprobados.
- Build: `bun run build --webpack` aprobado. El comando por defecto con Turbopack falla en este entorno al intentar abrir un puerto interno (Operation not permitted), también tras pedir ejecución fuera del sandbox. No se cambia el bundler predeterminado del proyecto para ocultar esta limitación del entorno.
- Limpieza: servidor de Next, gateway de identidad ficticia y contenedor Mongo propios retirados; no se han usado bases ni credenciales del usuario para las pruebas de acceso.
- Publicación: cierre mediante commit/push de esta iteración en `int` y verificación remota al finalizar; `main` sin cambios. El SHA real se comunica en el cierre, sin anticiparlo aquí.
- Próximo paso: revisión humana de `int`; el producto de destino sigue pendiente de definición en `01`.


## 03 — Solicitudes de acceso · 2026-10-23

- Instrucción humana: mostrar una pantalla para solicitar acceso a correos no permitidos y revisar las solicitudes pendientes desde administración.
- Identidad y permisos: Google puede emitir una sesión de identidad verificada sin conceder acceso al producto. `getVerifiedSession()` queda reservado al autoservicio por identidad; layouts, datos y acciones protegidas siguen exigiendo autorización. Los no miembros se redirigen a `/auth/access`, los anónimos/no verificados a iniciar sesión. La solicitud deriva exclusivamente del correo de sesión.
- UI: pantalla con solicitud, estado pendiente/rechazado, comprobación de acceso y cambio de cuenta. Administración añade listado paginado y botones Aceptar/Rechazar. Aprobar concede únicamente acceso normal; rechazar no lo concede y permite un nuevo envío.
- Persistencia: se amplía `user_access` con `status`, UUID de solicitud y fechas. Los documentos anteriores sin estado conservan permiso. Solicitar repetidamente conserva la identidad pendiente; reenviar tras rechazo crea otra. Aceptación/rechazo mediante una escritura condicional por correo, UUID y estado; no hay intervalos entre conceder acceso y resolver la solicitud ni necesidad de transacciones multirregistro. Índice central `status_asc_email_asc` junto al único de correo.
- Concurrencia: un único ganador al aceptar/rechazar simultáneamente; las decisiones antiguas no afectan nuevas solicitudes. Las altas manuales también resuelven pendientes y no se pierden por una inserción simultánea de solicitud.
- Unitarias: `bun run test`, 34 aprobadas, 0 fallos, 73 aserciones. Cobertura de identidad ausente, suplantación de correo, permisos de revisión, validación, decisiones obsoletas y fallos saneados. El test de índices se actualizó para localizar cada especificación por nombre al haber dos índices en la misma colección.
- Mongo real aislado: integración aprobada con permisos anteriores, múltiples envíos, rechazo/reapertura, aprobación, carreras, revocación/nueva solicitud, altas manuales concurrentes y paginación de pendientes. Sin bases del usuario.
- Next compilado + Mongo propio: `test/access-http.ts` aprobado con cookies ficticias firmadas. Solicitud propia pese a un correo falso en el formulario; envíos repetidos; revisión denegada a no administradores; rechazo, reenvío, decisión antigua rechazada, aceptación y acceso con la misma sesión. Se corrigió el selector del harness para reutilizar el formulario de la misma acción en pruebas de revocación cuando la lista inicial estaba vacía; el fallo no se ocultó cambiando el producto.
- UI compilada real: recorrido completo por navegador de solicitud/pendiente/rechazo/reenvío/aprobación/entrada como usuario; cambio de cuenta devuelve a sign-in. Móvil 390px sin overflow y botones de 44px; escritorio 1280px con contenido de 768px. Capturas correctas fuera de Git: `/private/tmp/template-access-request-mobile.png`, `/private/tmp/template-pending-requests-mobile.png` y `/private/tmp/template-pending-requests-desktop.png`. Se descartaron capturas fullPage incorrectas del navegador y se guardaron capturas de viewport contrastadas con dimensiones DOM. Viewport restaurado y pestaña propia cerrada.
- Validación: lint aprobado, cinco informativos preexistentes de estilo de tests en archivos no modificados; tipos, `bun run build --webpack`, enlaces locales y `git diff --check` aprobados. Se conserva el bundler predeterminado; se usa la alternativa validada por la limitación de Turbopack documentada en 02.
- Límites: no se ha realizado un nuevo login Google interactivo ni se envían correos de notificación; las solicitudes se guardan y revisan dentro del sitio. Sin dependencias nuevas ni cambios de duración/persistencia de cookies.
- Limpieza: servidor/gateway y contenedor Mongo de prueba propios retirados. Sin modificar credenciales ni datos del usuario.
- Publicación: commit y push en `int` con verificación remota al cierre; `main` permanece humano. SHA real comunicado al usuario tras publicar.
- Próximo paso: revisión humana de `int`; el producto de destino sigue pendiente de definición en `01`.


## 04 — Navegación responsive y ajustes · 2026-10-23

- Petición humana: adaptar el patrón de navegación inferior móvil/superior escritorio de referencia, inicialmente solo con Ajustes, usuario y tema.
- Implementación: `AppShell` compartido en el layout protegido, único registro de destinos, avatar de iniciales, estado activo `aria-current`, barra inferior con safe area y reserva de contenido; barra superior sticky desde 768px. Sin nuevas pestañas de producto.
- Ajustes: `/settings` protegido, nombre/correo/rol de sesión desde servidor, cambio de cuenta reutilizado y enlace a administración solo para administradores. Se conservan el inicio y administración existentes.
- Tema: Sistema/Claro/Oscuro, esquema compartido Zod, preferencia local con clave neutral `webapp:theme:v1`, bootstrap antes de hidratación y variante CSS dark coherente con la selección. Sistema sigue CSS del dispositivo; almacenamiento bloqueado conserva el cambio en memoria y muestra aviso. Sin persistencia de tema en Mongo ni dependencias nuevas.
- Referencia: se adapta el patrón autorizado de navegación/tema; no se trasladan destinos, branding, claves ni funcionalidades del producto de referencia.
- Unitarias: 37 aprobadas, 0 fallos, 93 aserciones. Tres comprobaciones nuevas cubren valores corruptos, inicialización antes de montar React y almacenamiento bloqueado.
- Validación: lint sin errores ni warnings (los cinco informativos de estilo anteriores no se modifican), tipos, `bun run build --webpack`, enlaces locales y `git diff --check` aprobados. No se cambia el bundler por defecto; alternativa ya documentada para este entorno.
- HTTP Next compilado + Mongo propio: regresión de acceso/solicitudes aprobada; nuevas comprobaciones de `/settings` para admin/usuario/anónimo, identidad correcta, estado activo y enlace admin condicionado al rol.
- UI real: navegación inicio→Ajustes, Claro/Oscuro/Sistema, persistencia oscura tras recargar y sincronización entre dos pestañas de Ajustes aprobadas. Móvil 390px sin overflow, barra inferior de 89px y controles fuera de su área; escritorio 1280px con barra sticky en top 0. Usuario normal sin enlace admin. No se ha modificado la preferencia del sistema operativo para simular otro esquema.
- Evidencia fuera de Git: `/private/tmp/template-settings-mobile-light.png`, `/private/tmp/template-settings-mobile-dark.png`, `/private/tmp/template-settings-desktop.png`. Identidades/cookies y Mongo exclusivamente ficticios/propios; sin login Google interactivo.
- Limpieza: viewport restaurado, dos pestañas propias cerradas, servidor/gateway y contenedor Mongo propios retirados. Pestaña preexistente del usuario conservada.
- Publicación: commit/push en `int` y verificación del SHA remoto al cierre; `main` exclusivamente humano. Sin hashes anticipados.
- Próximo paso: revisión humana de `int`; producto de destino pendiente de definición en `01`.


## 04a — Foto del perfil social en Ajustes · 2026-10-23

- Corrección humana: el icono de Ajustes debe mostrar la foto del login social.
- Cambio: se transmite `session.user.image` desde el layout autorizado hasta navegación/avatar y se utiliza también en la tarjeta de cuenta. `next/image` sin optimización, 32×32, circular, decorativo y sin referrer, siguiendo el patrón de referencia. Iniciales si no hay URL o si falla su carga; una URL nueva puede volver a intentarse.
- Validación: lint, tipos, 37 pruebas/93 aserciones y `bun run build --webpack` aprobados. Sin nuevas pruebas unitarias que reflejen solamente props; comprobación directa en navegador del comportamiento de imagen.
- UI compilada: sesión ficticia con imagen local propia cargada en ambos avatares a 390px; fallo HTTP 404 y ausencia de URL muestran iniciales sin imagen rota. Imagen correcta al volver a una sesión con URL válida; carga confirmada en escritorio a 1280px. No se ha probado un nuevo login Google interactivo ni usado una foto real del usuario.
- Evidencia: `/private/tmp/template-social-avatar-mobile.png`, fuera de Git. Viewport restaurado y pestaña propia cerrada; servidores temporales retirados. No ha sido necesario conectar con MongoDB: sesión admin ficticia, sin cambios de autorización ni persistencia.
- Publicación: commit/push en `int` y verificación remota al cierre; `main` intacta.


## 05 — UI en inglés · 2026-10-23

- Petición humana: traducir toda la interfaz al inglés.
- Alcance: navegación, inicio, cuenta/rol, selector de tema y aviso de almacenamiento, login, solicitud/estados, administración, paginación, estados vacíos, acciones, errores y etiquetas accesibles. `html` declara `lang="en"`. Se actualizan instrucciones y decisión de idioma; la documentación de producto puede seguir en español.
- Sin cambios de rutas, autenticación/autorización, valores de tema/operaciones ni datos persistidos. No se añade un sistema i18n ni dependencias.
- Fuente: revisión completa del texto y búsqueda de términos/cadenas españolas en `src/**` y el harness HTTP; sin restos en UI. Se actualizan las cuatro aserciones del harness que dependían del texto anterior.
- Verificación: lint y tipos aprobados; 37 pruebas, 0 fallos, 93 aserciones. `bun run build --webpack` aprobado con la redacción final, usando la alternativa de compilación ya documentada para el entorno. Enlaces Markdown locales y `git diff --check` aprobados.
- Next compilado + Mongo propios: regresión HTTP completa de roles, ajustes, solicitudes, rechazo/reenvío, aprobación, decisiones obsoletas y revocación aprobada con las cadenas inglesas.
- UI real: Settings y tema en móvil 390px sin overflow; documento `lang=en`; administración en escritorio, estado vacío, solicitud/pending, cambio de cuenta y login con error AccessDenied en inglés. Identidad y datos exclusivamente ficticios; sin login Google interactivo.
- Evidencia fuera de Git: `/private/tmp/template-settings-english-mobile.png` y `/private/tmp/template-admin-english-desktop.png`. Viewport restaurado y pestaña propia cerrada; servidores y contenedor temporal retirados.
- Publicación: commit/push en `int` y verificación remota al cierre; `main` intacta.


## 06 — Home en navegación · 2026-10-23

- Lint, tipos, 37 pruebas/93 aserciones, `bun run build --webpack` y `git diff --check` aprobados. Sin nuevas dependencias ni cambios de permisos/datos.
- Navegador compilado con sesión admin ficticia: Settings→Home a 390px, solo Home activo y sin overflow; Home→Settings a 1280px, solo Settings activo y barra superior sticky. Captura: `/private/tmp/template-home-navigation-mobile.png` fuera de Git.
- Viewport restaurado, pestaña propia cerrada y servidor temporal retirado; sin acceso a Mongo ni login Google real.
- Publicación: commit/push en `int` y verificación remota al cierre; `main` intacta.


## 07 — Gestión de capacidad Codex · 2026-10-23

- Política humana: ventanas 5h/7d, seguimiento directo, estimar la entrega completa, dividir antes de empezar si no cabe y aprovechar trabajo útil autorizado dejando reservas 7%/2%.
- Entrada observada mediante herramienta: 36% restante de 5h y 72% de 7d (duraciones 300/10 080 minutos); esta lectura es evidencia de la sesión, no capacidad fija para futuras iteraciones. La entrega documental cabe holgadamente sobre las reservas sin prometer un coste exacto.
- Cambios: sección específica en workflow y reglas raíz/anidadas. Consultas antes de iterar, en hitos costosos/inciertos y tras publicar; cálculo de restantes, identificación por duración, costes de validación/reparación/publicación, decisiones ante falta de capacidad o lecturas y ausencia de autorizaciones implícitas de créditos/reinicios/automatizaciones.
- Distinción: reservas del usuario frente a límites de producto; horizonte semanal más amplio sin equiparar puntos de ambas ventanas. Documentación oficial consultada para variabilidad y límites compartidos, con enlace en workflow.
- Validación: coherencia de reservas y enlaces locales, formato Markdown y `git diff --check` aprobados. Sin cambios de aplicación que requieran repetir su suite/build.
- Cierre: commit/push en `int`, verificación de SHA remoto y lectura posterior comunicados al usuario; sin commit adicional solo para registrar esa lectura. `main` intacta.


## 08 — Configuración Vercel · 2026-10-23

- Instalación autorizada: `@vercel/config@0.13.0` con versión exacta en `package.json` y `bun.lock`. `bun install --frozen-lockfile` aprobado sin cambios. El primer intento de instalación quedó bloqueado por la caché del sandbox; completado con acceso autorizado.
- Lint aprobado (cinco diagnósticos informativos preexistentes en pruebas ajenas), tipos aprobados incluyendo `vercel.ts`, 37 pruebas/93 aserciones aprobadas y `bun run build --webpack` aprobado. Se mantiene la alternativa Webpack documentada para las restricciones del entorno con Turbopack; no se cambia el script de build.
- README y plan distinguen configuración de despliegue efectivo. Formato raíz/export contrastado con documentación oficial de Vercel; enlaces locales y `git diff --check` aprobados. Sin cambios de UI, acceso a Mongo ni despliegue; el filtro en infraestructura Vercel queda pendiente de comprobación cuando se autorice un despliegue.
- Capacidad al retomar: 17%/69% restante (5h/7d); alcance pequeño y cierre incluidos en la estimación, con reservas 7%/2%.
- Cierre: commit/push en `int` y verificación remota; lectura posterior comunicada al usuario. `main` intacta.
