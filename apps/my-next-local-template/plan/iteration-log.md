# Registro de iteraciones

## 00 — Preparación de la base reutilizable · 2026-10-23

- Estado: `validated`; entrega local.
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

- Estado: `validated`; cambio exclusivamente documental.
- Instrucción humana: trabajar siempre en `int`, crear un commit y hacer push tras cada iteración; el usuario revisa y realiza el merge y push de `main`.
- Cambios: alineados README, reglas raíz/anidadas, plan maestro y protocolo de cierre. Incluye iteraciones documentales, preparación segura de `int`, publicación explícita a `origin/int`, verificación del SHA y tratamiento de fallos sin force-push.
- Esta decisión sustituye la política inicial de autorización de commit por entrega de `00`; la entrada anterior se conserva como evidencia histórica.
- Preparación: árbol limpio; `git fetch origin`; creada `int` desde `origin/main` al no existir `int` local/remota. No se ha modificado `main`.
- Validación: enlaces Markdown locales, consistencia de instrucciones vigentes y `git diff --check` aprobados. No se repiten pruebas de aplicación porque no cambia código ni configuración ejecutable.
- Publicación: commit/push a `origin/int` autorizados como cierre de esta entrega; verificar el SHA remoto y comunicar el resultado real al usuario, sin anticipar su hash en este registro.
- Siguiente paso de producto: `01`, pendiente de requisitos; integración a `main` exclusivamente humana.

## 02 — Administración y acceso de usuarios · 2026-10-23

- Estado: `validated`.
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

- Estado: `validated`.
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

- Estado: `validated`.
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

- Estado: `validated`.
- Corrección humana: el icono de Ajustes debe mostrar la foto del login social.
- Cambio: se transmite `session.user.image` desde el layout autorizado hasta navegación/avatar y se utiliza también en la tarjeta de cuenta. `next/image` sin optimización, 32×32, circular, decorativo y sin referrer, siguiendo el patrón de referencia. Iniciales si no hay URL o si falla su carga; una URL nueva puede volver a intentarse.
- Validación: lint, tipos, 37 pruebas/93 aserciones y `bun run build --webpack` aprobados. Sin nuevas pruebas unitarias que reflejen solamente props; comprobación directa en navegador del comportamiento de imagen.
- UI compilada: sesión ficticia con imagen local propia cargada en ambos avatares a 390px; fallo HTTP 404 y ausencia de URL muestran iniciales sin imagen rota. Imagen correcta al volver a una sesión con URL válida; carga confirmada en escritorio a 1280px. No se ha probado un nuevo login Google interactivo ni usado una foto real del usuario.
- Evidencia: `/private/tmp/template-social-avatar-mobile.png`, fuera de Git. Viewport restaurado y pestaña propia cerrada; servidores temporales retirados. No ha sido necesario conectar con MongoDB: sesión admin ficticia, sin cambios de autorización ni persistencia.
- Publicación: commit/push en `int` y verificación remota al cierre; `main` intacta.

## 05 — UI en inglés · 2026-10-23

- Estado: `validated`.
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

- Estado: `validated`. Home (`/`) añadido al registro único con icono local; Settings conserva su avatar. Estado activo raíz específico y exclusivo.
- Lint, tipos, 37 pruebas/93 aserciones, `bun run build --webpack` y `git diff --check` aprobados. Sin nuevas dependencias ni cambios de permisos/datos.
- Navegador compilado con sesión admin ficticia: Settings→Home a 390px, solo Home activo y sin overflow; Home→Settings a 1280px, solo Settings activo y barra superior sticky. Captura: `/private/tmp/template-home-navigation-mobile.png` fuera de Git.
- Viewport restaurado, pestaña propia cerrada y servidor temporal retirado; sin acceso a Mongo ni login Google real.
- Publicación: commit/push en `int` y verificación remota al cierre; `main` intacta.


## 07 — Plantilla local instalable · 2026-10-23

- Estado: `validated` para aceptación local. La petición humana sustituye expresamente Google/Better Auth, permisos/solicitudes/administración y MongoDB por una base local con IndexedDB e instalación móvil/escritorio. El historial anterior queda como evidencia y no impone requisitos actuales.
- Retirados Better Auth, MongoDB, `server-only`, SWR, proxy, rutas API/auth/admin, configuración de credenciales, scripts/pruebas remotas y componentes de identidad sin uso. No se ha leído ni modificado el contenido del `.env.local` preexistente; no se necesita ni debe copiarse al reutilizar la plantilla.
- Añadidos `idb@8.0.4` y `fake-indexeddb@6.2.6` (solo desarrollo). Se conserva Next/React/TypeScript/Tailwind/Zod/Bun/Biome/Knip; un único lockfile. `bun install --frozen-lockfile` aprobado. Bun instalado temporalmente fuera del repositorio porque no estaba disponible en el PATH de la sesión; no se incorpora otro gestor ni lockfile al proyecto.
- IndexedDB: conexión compartida y apertura perezosa, esquema inicial `preferences`, validación Zod de entrada/lectura, transacciones confirmadas antes de éxito, recuperación de apertura fallida y cierre ante cambios de versión. El tema es el único dato inicial; localStorage solo mantiene una caché síncrona mínima y señal entre pestañas. Provider global restaura desde IndexedDB también en Home. Fallos visibles en Settings sin fallback volátil que anuncie éxito.
- PWA: exportación estática con rutas Home/Settings públicas, manifest estático, iconos locales 192/512/maskable/Apple y favicon propio. Fuentes del sistema, metadatos y viewport/safe areas. Sin descargas de fuentes ni recursos externos. Marca/namespaces centralizados en `src/config/app.ts`.
- Cada build genera `out/sw.js` con hash del contenido y el código del worker, y precachea los 47 archivos de la salida (rutas, payloads y chunks incluidos). Fallar la preparación elimina la caché parcial. Las rutas y recursos se sirven offline; las rutas desconocidas conservan 404. El worker solo intercepta GET del propio origen y limita la búsqueda/limpieza de cachés al prefijo de la aplicación. Conserva la caché previa para pestañas anteriores.
- Actualización sin activación forzada al instalar: se ofrece Update and reload; su aceptación activa el nuevo worker y recarga solo la pestaña que acepta. No se borra IndexedDB. Se comprueba al regresar a la pestaña si hay actualización. El botón Install app solo aparece al recibir la capacidad del navegador; instrucciones alternativas para iOS/desktop y estado instalado.
- `bun run start` es ahora un preview de `out/`, con puerto opcional (`--port 3107`), validación del puerto y rutas limitadas al directorio estático; no es un backend del producto. Hosting raíz HTTPS y headers/revalidación se documentan como configuración propia del host, sin provisión ni despliegue.
- Reorientados README, reglas raíz y de persistencia, plan maestro y workflow: las futuras iteraciones conservan IndexedDB/exportación estática/offline; no reintroducen cuentas, backend, sincronización o dependencias remotas sin autorización humana. Copiar sin `.git`, cachés, dependencias ni entornos; personalizar identidad/namespaces y remoto antes de publicar. Definir respaldo/importación antes de datos de producto irremplazables.
- Guías consultadas: Next instalado `01-app/02-guides/static-exports.md`, `progressive-web-apps.md` y guía React de Vercel. Referencias primarias de idb y MDN enlazadas en README.
- Validación final: `bun run lint`, `bun run type-check`, `bun run test` (14 pruebas, 0 fallos, 54 aserciones), `bun run knip`, `bun install --frozen-lockfile`, enlaces Markdown locales y `git diff --check` aprobados. Las pruebas cubren reapertura, entradas y registros inválidos, almacenamiento no disponible, cambio de versión, caché/404 offline, aislamiento de peticiones/cachés, fallo de preparación, activación explícita y generación determinista del worker.
- Build: el primer favicon generado fue corregido a RGBA tras el error del decodificador ICO. Turbopack no puede abrir el puerto auxiliar de CSS en este entorno (también con el intento de ejecución ampliada). El comando final usa el modo soportado Webpack: `bun run build` aprobado con todas las rutas estáticas y generación del worker. Segunda compilación aprobada desde `/private/tmp/local-template-no-env-yut4fu0o`, copia sin archivos de entorno, con `bun --no-env-file run build`; acredita que no requiere las credenciales antiguas. No se modifica el servidor de desarrollo del usuario.
- Navegador real automatizado, perfil temporal propio de Chrome: Home a 390×844, sin overflow; caché preparada y Settings abierto por primera vez ya offline; cambio de tema, recarga, navegación Home↔Settings y estado activo; tema restaurado desde IndexedDB tras vaciar la caché de arranque; propagación entre pestañas; cierre/reapertura completa del navegador sin conexión con tema y rutas conservados. Vistas a 1280×900 inspeccionadas visualmente; cero errores de página y cero peticiones externas observadas.
- Segundo perfil temporal: nuevo worker esperando, botón de actualización, recarga consentida, tema preservado y recarga offline con el nuevo worker. Fallo de IndexedDB inducido solo en la página de prueba: aviso visible, selector reintentable y ausencia de cambio falsamente guardado. Worker de prueba restaurado al terminar. Capturas fuera de Git: `/private/tmp/local-template-home-mobile.png`, `/private/tmp/local-template-settings-mobile.png`, `/private/tmp/local-template-settings-desktop.png`.
- Límites: Chrome automatizado acredita interacción, viewport y elegibilidad del botón de instalar; no se ha instalado físicamente en iOS/Android/desktop ni validado Safari. No hay despliegue HTTPS. La primera visita necesita red al host estático y la persistencia depende del origen/perfil y las políticas del navegador; instalar no es backup. No hay dominio ni datos irremplazables añadidos.
- Publicación: trabajo exclusivamente en `int`; el remoto configurado devuelve `Repository not found` al intentar fetch/consulta. Se conserva la entrega local validada en un Conventional Commit. El intento de `git push origin int` fue rechazado antes de ejecutarse por la revisión automática: considera no verificado el destino tras el error remoto y señala riesgo de enviar contenido privado a un repositorio no confirmado. El usuario responde que revisará el remoto antes de publicar; se suspende cualquier nuevo intento de push hasta su indicación. No se intenta sortear el rechazo. Pendiente su revisión, restablecer el acceso y publicar con `git push origin int` y comprobar que `git ls-remote origin refs/heads/int` coincide con el SHA local cuando se restablezca el acceso al repositorio. No se cambia el remoto ni se toca `main`.
- Próximo paso: esperar la revisión humana del remoto y resolver su acceso para cerrar la publicación; después copiar la base a un repositorio propio y definir el producto en `01`. No iniciar otra iteración sin cerrar o comunicar este paso pendiente.

- Cierre operativo: perfiles temporales de Chrome cerrados y eliminados; worker de prueba restaurado; preview propio detenido. Publicación reservada a una nueva indicación del usuario después de revisar el remoto.


## 08 — Capacidad de Codex por ventanas · 2026-10-23

- Estado: `validated` para la entrega documental local. Petición humana: gestionar las ventanas de 5h/7d, dimensionar cada iteración para cerrarla sin rate limit y aprovechar la capacidad manteniendo reservas del 7%/2%.
- Nueva sección específica en `workflow.md`, enlazada desde `AGENTS.md` y resumida en el plan maestro. Las reservas se aplican a la capacidad total de cada ventana, tras estimar análisis, implementación, validación, reparaciones y cierre; deben cumplirse ambas. Si no cabe, se entrega un corte menor completo y se deja el resto pendiente.
- Consultas al inicio, antes de cada iteración, en fases significativas, ante imprevistos y al cierre. Se identifican ventanas por duración, se calcula restante a partir de `usedPercent` y se consideran reinicios, datos desconocidos y actividad compartida. Se consulta la herramienta real al preparar y cerrar esta entrega, sin persistir instantáneas ni identificadores de cuenta en la plantilla.
- Se distingue el horizonte más amplio de 7d de una proporción de cuota no deducible por duración. La estimación es conservadora; no se garantizan costes ni ausencia absoluta de límites. No se inventa trabajo para gastar capacidad ni se omiten pruebas para aumentar alcance. No hay autorización nueva de créditos, reinicios o trabajo programado.
- Referencia oficial consultada y enlazada: [Pricing](https://learn.chatgpt.com/docs/pricing?codex-pricing-plans=individual), para la variabilidad del consumo. Las reservas son una política del usuario, no una regla de OpenAI.
- Validación: revisión de consistencia entre reglas y flujo, enlaces locales/encabezado de destino y `git diff --check` aprobados. Sin cambios de código/configuración/dependencias; no se repiten lint, tipos, pruebas de aplicación ni build por falta de impacto funcional.
- Cierre: Conventional Commit documental local en `int`. La nueva petición autoriza esta entrega, pero no revoca la decisión anterior de revisar el remoto antes de publicar. No se ejecuta fetch/push ni se modifica el remoto; `07` y esta entrega siguen pendientes de publicación y verificación de SHA remoto tras indicación humana. `main` intacta.
- Próximo paso: esperar la revisión del remoto; aplicar esta política al dimensionar las siguientes iteraciones autorizadas.


## 09 — Configuración geográfica tipada de Vercel · 2026-10-23

- Estado: `validated` para configuración local. Se integra el fragmento TypeScript enviado por el usuario. Al iniciar existía `vercel.ts` sin seguimiento con la misma región y regla, pero sin tipado; se conserva íntegramente su comportamiento y se añaden el import de tipo y la anotación `VercelConfig` solicitados.
- Dependencia añadida y fijada con Bun: `@vercel/config@0.13.0` solo en desarrollo. No se importa en la aplicación ni en el navegador. `bun.lock` actualizado; no se modifica Next, IndexedDB, service worker, UI ni variables de entorno.
- Se mantienen `regions: ["cdg1"]` y la regla global `missing` sobre `x-vercel-ip-country=ES` con `mitigate.action=deny`. README y plan maestro documentan que `cdg1` es París para funciones, mientras esta base exporta estáticos sin funciones; la regla usa país por IP y deniega también la ausencia de coincidencia. No es identidad ni garantía de ubicación física.
- Alcance PWA explícito: solo se filtran peticiones que llegan a Vercel; una copia cacheada puede funcionar fuera de España sin consultar al host. No se borran datos ni se añade un servicio remoto a la aplicación. Otros proveedores y previews locales no aplican esa regla.
- Fuentes primarias verificadas: [configuración TypeScript](https://vercel.com/docs/project-configuration/vercel-ts), [WAF declarativo](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules), [header de país](https://vercel.com/docs/headers/request-headers) y [regiones](https://vercel.com/docs/regions).
- Validación: `bun run lint`, `bun run type-check`, `bun run test` (14 pruebas/54 aserciones), `bun run build` (todas las rutas estáticas y 47 archivos en el worker), `bun run knip`, `bun install --frozen-lockfile`, enlaces locales y `git diff --check` aprobados. Comprobados también `validateStaticFields(config)` y `normalizeRoutes(config.routes)` mediante las utilidades instaladas del proveedor; no se confunden con validación de tráfico desplegado.
- Lint detectó desalineación de tablas Markdown en el maestro editado y en la sección de cuotas de `08`; se aplica formato a ambos archivos sin cambiar la política de capacidad. No se añaden pruebas que simplemente dupliquen constantes. Sin cambios de interfaz o de persistencia que justifiquen repetir QA visual/offline.
- Límites: no se vincula, aprovisiona ni despliega Vercel; no se comprueba todavía tráfico real desde España y desde otros países ni la cabecera de país en su red. Antes de declarar el filtro activo, comprobar esos casos y la entrega de rutas, recursos, manifest y worker en un despliegue autorizado.
- Capacidad: consultadas ambas ventanas al iniciar y al cerrar, con entrega acotada dentro de las reservas 7%/2%, sin guardar instantáneas ni identificadores de cuenta. Cierre en commit local de `int`, incluyendo el archivo aportado por el usuario; no se ejecuta push ni fetch mientras siga pendiente su revisión del remoto. `main` intacta.
- Próximo paso: revisión humana del remoto para publicar las entregas pendientes; validación de la regla en Vercel únicamente cuando se autorice un despliegue.
