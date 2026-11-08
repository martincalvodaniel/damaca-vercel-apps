# Iteraciones

## EPJ-01 — Landing instalable

- Estado: `validated`. [Evidencia archivada](archive/2026-11-08/iteration-log.md#epj-01).
- Rutas: `apps/ebrias-patanes-del-jurado/**`, `bun.lock`.
- Dependencias: catálogo del monorepo, cliente OAuth de Google y acceso al clúster MongoDB del Hub.
- Aceptación: portada adaptable; entrada y salida con Google en la misma portada; persistencia aislada; manifiesto standalone con iconos y nombre por rama.
- Validación: Biome, tipos, build y comprobaciones HTTP de portada y manifiesto. Verificar OAuth real cuando existan credenciales y callback de esta app.

## EPJ-02 — Fotografías del jurado

- Estado: `validated`. [Evidencia archivada](archive/2026-11-08/iteration-log.md#epj-02).
- Rutas: `apps/ebrias-patanes-del-jurado/**`.
- Dependencias: dos fotografías proporcionadas por el usuario.
- Aceptación: las dos fotos se muestran completas en la portada y un recorte de la primera identifica la pestaña y la app instalada.
- Validación: Biome, tipos, build y comprobación de referencias y dimensiones de las imágenes e iconos.

## EPJ-03 — Portada con el dibujo sin marco

- Estado: `validated`. [Evidencia archivada](archive/2026-11-08/iteration-log.md#epj-03).
- Rutas: `src/app/` y `plan/` de la app.
- Dependencias: las dos versiones del dibujo guardadas en EPJ-02.
- Aceptación: la portada muestra solo la versión sin marco. La versión con marco queda disponible para otras pantallas.
- Validación: Biome, tipos, build y revisión de las referencias a las imágenes.

## EPJ-04 — Nubes, textos y favicon

- Estado: `validated`. [Evidencia archivada](archive/2026-11-08/iteration-log.md#epj-04).
- Rutas: `src/app/`, `public/icons/` y `plan/`.
- Dependencias: diseño de portada de [AGW-24](../../../plan/iterations.md#agw-24--diseño-compacto-en-móvil).
- Aceptación: más nubes, textos nuevos, carga inmediata del dibujo y favicon EP/DJ.
- Validación: Biome, tipos, build y comprobación de la portada.

## EPJ-05 — Nochevieja en Letux

- Estado: `validated`.
- Rutas: `src/app/`, `src/features/landing/` y `plan/`.
- Dependencias: sesión de Google y lista proporcionada por el usuario.
- Aceptación: ficha temática accesible desde portada, fechas y lugar correctos, estancias separadas de visitas del 31 y Diana pendiente. La lista requiere sesión.
- Validación: Biome, tipos, build y comprobación de la ruta sin sesión.

## EPJ-06 — Elección anónima de disfraz

- Estado: `validated`.
- Rutas: `src/app/eventos/`, `src/features/`, `src/lib/`, `scripts/` y documentación de Ebrias.
- Aceptación: catálogo con búsqueda normalizada y alta manual, reserva exclusiva y privada, tres intentos por cuenta, contador oculto y una prórroga administrativa.
- Validación: Biome, tipos, build, catálogo y comprobaciones del acceso y las reservas.

[Alcance](master.md) · [Evidencia](iteration-log.md)

## EPJ-07 — Admisión y ajustes

- Estado: `validated`.
- Rutas: `src/`, `.env.example`, `README.md` y `plan/` de la app.
- Dependencias: Google OAuth, MongoDB y lista inicial de administradores por entorno.
- Aceptación: sin permiso previo no se crea sesión ni se accede con una anterior. Portada pública con Google como única acción, navegación privada Inicio y Ajustes, identidad visible y admisión reservada a administradores.
- Validación: Biome, tipos, build, casos de acceso y comprobación visual en móvil y escritorio.

## EPJ-08 — Selección explícita de disfraz

- Estado: `validated`.
- Rutas: selector de disfraces, acción de reserva, estilos y plan de la app.
- Aceptación: el texto nuevo aparece como opción explícita «(Crear)»; la selección de creación y las coincidencias del catálogo tienen resaltados distintos; reservar está siempre visible y solo habilitado tras seleccionar; crear añade al catálogo y reserva en la misma acción.
- Validación: Biome en los archivos modificados, comprobación de tipos y `git diff --check`.

## EPJ-09 — Buscador tras agotar intentos

- Estado: `validated`.
- Rutas: selector de disfraces y plan de la app.
- Aceptación: el buscador permanece visible después de la tercera reserva válida; el aviso de límite aparece solo al intentar otra reserva cuando ya no quedan intentos.
- Validación: Biome, comprobación de tipos y `git diff --check`.

## EPJ-10 — Ruta y ficha de evento

- Estado: `validated`.
- Rutas: página de Nochevieja, selección de disfraz, navegación y plan de la app.
- Aceptación: la ruta del evento usa el prefijo `YY-MM-DD`; los listados aparecen juntos en una sección «¿Quién viene?» colapsada inicialmente; «Elegir disfraz» permanece visible fuera de esa sección; la página de disfraces no incluye enlace de vuelta.
- Validación: Biome, tipos, build y `git diff --check`.

## EPJ-11 — Limpieza de personajes dinámicos sin reservas

- Estado: `validated`.
- Rutas: acciones y persistencia de disfraces.
- Aceptación: los personajes creados por usuarios se eliminan del catálogo cuando una reserva cambia a otro personaje y ya nadie los tiene seleccionados; un personaje creado que no llega a reservarse tampoco permanece huérfano; el catálogo fijo no se elimina.
- Validación: Biome, comprobación de tipos y `git diff --check`.

## EPJ-12 — Actualizar búsqueda tras reservar

- Estado: `validated`.
- Rutas: selector y acciones de disfraces.
- Aceptación: tras reservar o cambiar, el texto de búsqueda se conserva, la selección activa se limpia y las sugerencias se vuelven a calcular con la lista actualizada del catálogo.
- Validación: Biome, comprobación de tipos y `git diff --check`.

## EPJ-13 — Invitación y registro de Hogwarts

- Estado: `validated`.
- Rutas: estilos compartidos de las dos páginas de Letux, `public/images/` y plan de la app.
- Dependencias: rutas de EPJ-10 y Sombrero Seleccionador existente.
- Aceptación: ambas páginas evocan Hogwarts mediante un castillo nocturno, dorados, pergamino y lacre; controles legibles en móvil y escritorio.
- Validación: Biome, tipos, build y comprobación visual a 320 y 1440 px.

## EPJ-14 — Solicitudes, miembros y asistencia

- Estado: `validated`.
- Rutas: autenticación, Ajustes, ficha de Letux, persistencia y plan de Ebrias.
- Dependencias: Google OAuth, MongoDB con transacciones y lista inicial de Letux.
- Aceptación: solicitud única por correo verificado, admisión administrativa directa con vínculo opcional a miembro existente o alta, alias personal y asistencia persistente por evento.
- Validación: Biome, tipos, build, pruebas de MongoDB y comprobación responsive.
