# Registro de entregas de Digest archivadas

## 01 — Incorporar el workspace

- [Aceptación](../../iterations.md#01--incorporar-el-workspace). Inicio en `int` con árbol limpio. Capacidad inicial del 14% en 5h y 59% en 7d.
- La CLI de Turbo devolvió EPERM. Se generó el workspace mediante la misma función del generador. Bun actualizó el lockfile usando su caché local.
- Biome sin hallazgos en la app y el inventario. Pasaron TypeScript, 37 pruebas de Digest y 6 del generador. Se ajustó la firma del mock del starter al driver MongoDB del catálogo.
- Builds Webpack con valores ficticios para Google y MongoDB. Se comprobaron por HTTP el manifiesto, los metadatos HTML y las dimensiones de los iconos para `main` e `int`. Una restauración desde caché llegó a servir el nombre de `main` para `int`; el build limpio de `int` sirvió el nombre correcto.
- Quedan pendientes OAuth real, MongoDB, ChatGPT y la instalación en Android. Los cortes 02 a 05 recogen las verificaciones y funcionalidades restantes.

## 03 — Entregar captura y ficha en local

- [Aceptación](../../iterations.md#03--entregar-captura-y-ficha-en-local). Inicio en `int`, árbol limpio y base `4953da4`. Capacidad inicial del 100% en 5h y 58% en 7d.
- OAuth con PKCE y consentimiento, cliente estático, sesiones persistidas, comprobación de identidad y grant vigente, escritura MCP con límite por propietario y ficha web privada. Los topics capturados quedan como propuestas hasta el corte 04.
- Pasaron Biome, tipos y 41 pruebas de Digest. La prueba HTTP arrancó Next compilado con MongoDB 8 desechable. Verificó descubrimiento, JWT, intercambio OAuth con credenciales Basic y en formulario, captura completa/parcial/no disponible, revocación con token vigente, aislamiento de dos propietarios y seis escrituras concurrentes a la misma URL. Pasó también la prueba HTTP de roles y solicitudes de acceso. Se añadió el runner a CI.
- El entorno de Digest carece de configuración Vercel y credenciales locales. El corte 02 queda bloqueado hasta disponer de un entorno HTTPS autorizado y de acceso a ChatGPT con escritura. Las pruebas locales usaron identidades y credenciales de prueba. Quedan por verificar Google y ChatGPT reales y el comportamiento geográfico en Vercel.
- Better Auth ya crea su índice único de correo. La prueba con MongoDB detectó un conflicto al registrar un segundo índice equivalente y se retiró ese registro redundante.

## 03a — Corregir la carga de MongoDB en desarrollo

- [Aceptación](../../iterations.md#03a--corregir-la-carga-de-mongodb-en-desarrollo). Inicio en `int`, base `3639e81`, con una edición local ajena en `.env.example`. Capacidad inicial del 87% en 5h y 56% en 7d.
- En el servidor local, `/` redirigía con 307 y `/auth/signin` devolvía 500 al resolver `mongodb-339f4168658c3edd`. Con los mismos módulos instalados y salidas nuevas, Next 16.4.6 reprodujo el 500 bajo Bun y Turbopack. Node y Turbopack devolvieron 200, al igual que Bun y Webpack.
- Digest arranca Next con Node en desarrollo. El comando corregido se verificó en una copia aislada con credenciales ficticias y un puerto alternativo. `/` devolvió 307 y la página de acceso devolvió 200 con el botón de Google. Pasaron Biome, TypeScript y 41 pruebas. La prueba cubrió la carga de la pantalla de acceso.

## 03b — Recuperar autenticación tras un fallo de MongoDB

- [Aceptación](../../iterations.md#03b--recuperar-autenticación-tras-un-fallo-de-mongodb). Inicio en `int`, base `00225a0`, con un cambio local ajeno en `.env.example`. Capacidad inicial del 82% en 5h y 55% en 7d.
- Se reprodujo el fallo en Next local con una cookie firmada de prueba. Antes del cambio, la consulta devolvió 500 con MongoDB detenida y siguió devolviendo 500 al arrancarla, con `MongoTopologyClosedError`.
- Better Auth espera al cliente conectado, comparte una inicialización y descarta los intentos fallidos. Después del cambio, el fallo inicial produjo HTTP 503 y las tres consultas siguientes devolvieron 200 en el mismo proceso tras arrancar MongoDB. La prueba usó MongoDB 8 desechable.
- Pasaron Biome, TypeScript, 41 pruebas, el build y las integraciones HTTP locales de OAuth/MCP y control de acceso. El servidor y la configuración local del usuario quedaron fuera de la prueba.

## 03c — Aclarar fallos de inicio de sesión en local

- [Aceptación](../../iterations.md#03c--aclarar-fallos-de-inicio-de-sesión-en-local). Inicio en `int`, base `2a3d834`, árbol limpio. Capacidad inicial del 73% en 5h y 54% en 7d.
- El filtro escrito en la terminal integrada era `@damaca/dacama-digest`. El workspace registrado es `@damaca/damaca-digest`.
- El driver confirmó `ECONNREFUSED` en el MongoDB configurado en loopback, antes de iniciar OAuth. Se creó y arrancó una instancia MongoDB 8 local, dedicada, con volumen persistente y puerto 27017 limitado a loopback. El ping pasó y el Next ya en marcha devolvió HTTP 200 con una URL de autorización de Google. No se navegó a esa URL.
- La pantalla de acceso distingue el 503 del fallo general y la guía documenta cómo arrancar MongoDB. Pasaron Biome, tipos, 41 pruebas y el build Webpack con valores de prueba.

## 02 — Validar la viabilidad externa

- El usuario confirmó en producción el guardado de una fuente pública desde ChatGPT. Las capturas muestran las fichas de Proton (`full`), Heraldo de Aragón (`partial`) y El Mundo (`unavailable`). El caso parcial expone el límite de acceso. El caso inaccesible conserva la fuente y la nota sin resumen.

## 03d — Deduplicar URLs con el parámetro utm

- El usuario mostró un duplicado de Proton al recapturar la URL con `?utm=fake`. La regla anterior eliminaba claves `utm_*` y conservaba la clave exacta `utm`. Una prueba con esa misma URL reprodujo el fallo antes del cambio.
- Se añadió `utm` como parámetro de tracking. La prueba HTTP de OAuth/MCP confirma que la recaptura devuelve `already_exists` y el mismo ID. Pasaron Biome, tipos, 42 pruebas, build y pruebas HTTP contra MongoDB desechable. La corrección se aplica a nuevas capturas y no modifica documentos existentes.

## 04 — Encontrar artículos en la biblioteca

- Inicio en `int`, base `bc133ee`, con capacidad del 26% en 5h y 47% en 7d.
- Búsqueda MongoDB ponderada y limitada por propietario, filtros en la URL, orden y páginas de 20 con desempate por ID. El filtro de topics usa las propuestas históricas hasta integrar IDs estables.
- Pasaron Biome, tipos, 42 pruebas, build y la prueba HTTP con dos páginas, filtros combinados, relevancia y datos aislados por propietario. Chrome verificó la biblioteca con filtros abiertos y sin desbordamiento horizontal a 320 y 1280 px.

## 04a — Editar y organizar artículos

- La ficha permite editar metadatos, resumen, puntos clave, notas, estado de lectura y favorito, y borrar con confirmación. Las mutaciones usan el propietario y una revisión optimista. Una recaptura conserva los campos corregidos y los datos personales.
- Pasaron Biome, 42 pruebas, build con tipos e integración HTTP de las Server Actions. La prueba rechazó edición y borrado desde otra cuenta y borrado sin confirmación, y verificó la conservación de cambios en una recaptura. La revisión de la biblioteca a dos anchos está en el corte 04.
- El siguiente corte es 04b, vocabulario de topics, alias, fusión y `list_topics`. Se difiere para respetar la reserva de capacidad de la ventana de cinco horas.

## 04b — Consolidar topics

- Inicio en `int`, base `eeebcf4`, tras renovar la ventana de 5 h. El despliegue Production `adc0093` de los cortes 04 y 04a quedó READY y verificado en el dominio estable.
- Topics con IDs estables por propietario, nombres, alias y fusiones. Las etiquetas históricas se resuelven sin una migración previa. La fusión conserva las referencias y cuenta cada artículo una vez. La edición de fichas admite temas manuales y una recaptura conserva esos cambios.
- Pasaron Biome, TypeScript, 45 pruebas, build e integración HTTP. Se verificaron descubrimiento de topics vía MCP, exclusión de otra cuenta, edición, alias, fusión, recuento y filtro por alias con artículos nuevos e históricos.
- Chrome comprobó los controles de temas y edición a 320 y 1280 px. Un backup de MongoDB de prueba se restauró en otra base y conservó el artículo, el vocabulario, sus referencias y el índice textual.

## 05 — Validar preproducción

- [CI del commit `0a8cb16`](https://github.com/martincalvodaniel/damaca-vercel-apps/actions/runs/43770107401) terminó correctamente, incluido `digest-capture`. La revisión a dos anchos y la restauración con MongoDB desechable constan en 04b.
- Verificado [Preview estable de int](https://damaca-digest-git-int-martincalvodaniels-projects.vercel.app) en READY, con origen `int@0a8cb16`. Los metadatos anunciaron el emisor y recurso del mismo host, scope `articles:write` y PKCE S256. MCP devolvió 401 sin token OAuth en una solicitud autenticada en Vercel mediante `vercel curl`.
- Una petición pública de descubrimiento recibió 302 a `vercel.com/sso-api`. La protección sigue activa. El cliente real de ChatGPT aún necesita una vía de acceso a Preview para completar la prueba OAuth.

## 06 — Refinar biblioteca y lectura

- Inicio en `int`, base `ffa9b0d`, con 70% en 5 h y 38% en 7 d. Se dejó Preview fuera del alcance por indicación del usuario.
- Biblioteca con resúmenes visibles, procedencia, niveles de acceso y filtros activos que se pueden quitar individualmente. Ficha con jerarquía de lectura, topics enlazados, llamadas a la acción claras y bloques para resumen, notas y referencias. Navegación y superficies coherentes en biblioteca, ficha, edición y topics.
- Pasaron Biome, tipos, 45 pruebas, build e integración HTTP de OAuth/MCP y acceso. Chrome revisó las cuatro pantallas y los controles desplegados a 320 y 1280 px, sin desbordamiento horizontal. Se inspeccionaron capturas de la biblioteca en claro y de la ficha en oscuro.

## 07 — Abrir Digest desde Compartir en Android

- Inicio en `int`, base `fd455de`, con 61% en 5 h y 36% en 7 d.
- Chrome documenta destinos Compartir para PWAs instaladas. OpenAI documenta seleccionar el conector con `@` en el compositor. No se encontró un enlace o intent documentado que preseleccione un MCP privado y envíe el mensaje. Digest registra `/share`, valida un enlace, prepara el prompt y lo copia antes de abrir ChatGPT. La pantalla es una vista de preparación sin persistencia.
- Pasaron Biome, tipos, 48 pruebas, build e integración HTTP. Los manifiestos servidos de `main` e `int` anuncian el destino. En Chrome a 320 px se verificaron preparación, apertura de ChatGPT (interceptada en la prueba) y modo de copia manual si falla el portapapeles. No hubo un dispositivo Android disponible.

## 08 — Encontrar relacionados y exportar fichas

- Artículos relacionados del mismo propietario, por coincidencia con topics activos, fusionados e históricos. Las fichas descargan una copia Markdown o JSON con las notas mediante un endpoint privado.
- Pasaron Biome, tipos, 49 pruebas, build e integración HTTP. Se verificaron relacionados tras fusionar topics, descarga de notas por su propietario, rechazo de otra cuenta y escapado de contenido en Markdown. Chrome confirmó la ficha a 320 y 1280 px.

## 09 — Consultar la biblioteca desde MCP

- `get_article` por ID o URL y `search_articles` con filtros y paginación comparten el repositorio de biblioteca. Las fichas devueltas excluyen notas personales. El permiso `articles:read` se pide por separado y el consentimiento muestra los permisos solicitados.
- Pasaron Biome, tipos, 49 pruebas, build y la integración HTTP. Con dos cuentas, se verificaron permisos de lectura y escritura separados, desafío para permisos insuficientes, búsqueda paginada y rechazo del ID de otra cuenta. El conector real necesitará actualizar sus herramientas y conceder el nuevo permiso tras el despliegue.

## 10 — Exportar la biblioteca

- La descarga privada de Ajustes transmite Markdown o JSON con los artículos y notas del propietario. Resuelve topics fusionados usando el vocabulario del propietario.
- Biome, tipos, 49 pruebas, build e integración HTTP con MongoDB pasaron. La integración verificó 23 artículos, el aislamiento entre dos cuentas, la respuesta privada y ambos formatos.
- La descarga cierra el cursor de MongoDB también si falla la generación del archivo. Biome, tipos y la integración HTTP de ambos formatos pasaron tras el ajuste.

## 11 — Consultar lecturas relacionadas desde ChatGPT

- `find_related_articles` reutiliza la consulta de la ficha y exige `articles:read`. La integración HTTP verificó resultados tras fusionar topics, el aislamiento entre propietarios y el rechazo de un token de solo escritura.

## 12 — Organizar una lectura desde su ficha

- La ficha permite añadir o quitar favoritos y marcar una lectura como leída o pendiente. La acción actualiza solo el campo elegido.
- Biome, tipos, build e integración HTTP pasaron. Se verificó que una cuenta distinta y un formulario con una revisión anterior no pueden aplicar el cambio. Chrome confirmó el diseño a 320 y 1280 px.

## 13 — Mostrar temas y enlaces originales en la biblioteca

- Cada tarjeta enlaza al original, muestra hasta dos temas que activan su filtro y añade la fecha de captura cuando se conoce la de publicación. El vocabulario de la página se resuelve una vez.
- Pasaron Biome, tipos, build e integración HTTP con topics fusionados. Chrome confirmó biblioteca, ficha, edición y topics sin desbordamiento a 320 y 1280 px.

## 14 — Consultar capturas de un periodo desde ChatGPT

- `get_reading_digest` agrupa capturas por fecha UTC con paginación y el permiso `articles:read`. Distingue fecha de captura de publicación y estado de lectura.
- La integración HTTP verificó dos páginas, el permiso y el aislamiento entre cuentas con MongoDB desechable. El build y la compilación de tipos pasaron.
