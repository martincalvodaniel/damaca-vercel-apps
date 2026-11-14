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

## EPJ-15 — Controles compactos y selector de miembros en Ajustes

- Estado: `validated`.
- Objetivo y rutas: compactar Ajustes en sus estilos, página y formularios de alias y admisión.
- Dependencias: formulario de alias y control de sesión existentes.
- Aceptación: campos y botones más bajos, acciones de cuenta en la misma fila y separación entre el perfil y el alias, sin desbordamiento. El desplegable de miembros tiene el estilo de Ajustes y conserva las opciones y el envío del formulario.
- Validación: Biome, tipos, build y comprobación a 320 y 1440 px.

## EPJ-16 — Cambio de correo y alias de miembros

- Estado: `validated`.
- Rutas: Ajustes, admisión, miembros, disfraces y planificación de Ebrias.
- Dependencias: solicitudes verificadas y transacciones MongoDB.
- Aceptación: cambio administrativo con revocación del correo anterior y conservación de alias, asistencia y disfraz. Edición administrativa del alias visible.
- Validación: Biome, tipos, build, MongoDB y revisión responsive.

## EPJ-17 — Bloques de asistencia configurables

- Estado: `validated`.
- Objetivo: contar miembros por bloque y permitir que un administrador cree bloques en Letux.
- Rutas: `src/app/eventos/26-12-30-nochevieja-letux/`, `src/features/members/attendance.ts` y `plan/`.
- Dependencias: sesión administrativa y MongoDB de la app.
- Aceptación: encabezados con recuento, bloques nuevos persistentes y seleccionables al asignar asistencia, creación exclusiva de administradores, rechazo de nombres vacíos o repetidos.
- Validación: Biome, tipos, build y revisión responsive.

## EPJ-18 — Variación de los relámpagos de Lumos

- Estado: `validated`.
- Objetivo: variar la dirección de los relámpagos y ajustar su ritmo y duración.
- Rutas: `src/app/eventos/26-12-30-nochevieja-letux/lumos-gate.tsx`, `src/app/eventos/26-12-30-nochevieja-letux/lumos-gate.module.css` y `plan/`.
- Aceptación: los relámpagos pueden entrar desde cualquiera de los cuatro bordes, con posición y pausa variables; la animación dura 750 ms.
- Validación: Biome en los archivos afectados, tipos de la app y `git diff --check`.

## EPJ-19 — Control de música con icono

- Estado: `validated`.
- Objetivo: mantener la música de Letux al navegar entre la ficha y la selección de disfraz, con un control visual de estado.
- Rutas: páginas de evento y disfraces, control/estado de música en `src/app/eventos/26-12-30-nochevieja-letux/` y `plan/`.
- Aceptación: el audio sigue sonando sin reiniciarse al navegar entre ambas páginas; el control persistente ofrece activar/pausar, muestra una nota clara sin tachar al sonar y tachada en rojo al estar detenida; conserva nombre y estado accesibles.
- Validación: Biome en los archivos afectados, tipos de la app y `git diff --check`.

## EPJ-20 — Eliminar solicitudes de acceso

- Estado: `validated`.
- Objetivo: permitir a los administradores descartar solicitudes pendientes y separar visualmente la admisión del control de cambio de correo.
- Rutas: Ajustes, acciones y persistencia de admissions, estilos globales y plan de Ebrias.
- Aceptación: solo administradores pueden borrar registros que sigan pendientes; borrar una solicitud no toca miembros ni accesos ya admitidos. Entre el botón «Admitir» y el desplegable de cambio de correo hay separación visible.
- Validación: Biome en archivos afectados, tipos de la app, `git diff --check` y revisión responsive de Ajustes.

## EPJ-21 — Asistentes por evento

- Estado: `in_progress`.
- Rutas: asistencia, disfraces, Ajustes y limpieza de Letux.
- Aceptación: invitados independientes, gestión por miembros y administradores, y persistencia de evento aislada por prefijo.

## EPJ-22 — Avisos de admisión

- Estado: `in_progress`.
- Aceptación: acciones de admisión en la misma fila y aviso Web Push por solicitud nueva en dispositivos suscritos de administradores.
- Validación: Biome, tipos y entrega real desde Preview a un dispositivo suscrito.

## EPJ-23 — Eliminar miembros

- Estado: `in_progress`.
- Aceptación: la acción administrativa elimina el miembro y sus datos vinculados de asistencia, disfraces y acceso.

## EPJ-24 — Gestión de asistencia por bloque

- Estado: `in_progress`.
- Aceptación: alta desde cada bloque, traslado mediante arrastre o selector y acciones dentro de la lista.

## EPJ-25 — Reparto de coches en Letux

- Estado: `in_progress`.
- Aceptación: sección con «Sin asignar», creación de coches y traslado de asistentes mediante arrastre. Las asignaciones persisten por evento.

## EPJ-26 — Identificadores globales de miembros

- Estado: `in_progress`.
- Aceptación: migrar identificadores heredados de Letux a UUID y conservar las referencias del club y de los eventos.

## EPJ-27 — Recarga sin parpadeo de Lumos

- Estado: in_progress.
- Objetivo: evitar que el gate aparezca al recargar si Lumos ya se ejecutó.
- Rutas: componente `lumos-gate.tsx` y planificación de la app.
- Dependencias: estado de Lumos guardado en el navegador.
- Aceptación: la recarga no muestra el gate tras ejecutar Lumos. En una primera visita o si el almacenamiento falla, el gate sigue disponible.
- Validación: Biome, tipos, pruebas aplicables, build y comprobación de la recarga.

## EPJ-28 — Quitar «Añadir bloque» de «Quién viene»

- Estado: `in_progress`.
- Rutas: `attendance-form.tsx` y plan de la app.
- Aceptación: «Quién viene» conserva los bloques existentes sin ofrecer crear otros. «Coches» sigue ofreciendo «Añadir coche» a quienes pueden gestionarlos.
- Validación: Biome, tipos, build y comprobación de ambas secciones.

## EPJ-29 — Controles de Nochevieja

- Estado: `in_progress`.
- Rutas: ficha de Letux, formulario y estilos.
- Aceptación: enlace de disfraces antes de las secciones, una sola sección abierta y creación de coches desde un modal accesible con el botón «+» en la cabecera desplegada.
- Validación: Biome, tipos, build y revisión de la interfaz.

## EPJ-30 — Contador de reservas y control de personajes

- Estado: `in_progress`.
- Rutas: página de disfraces y dominio de reservas.
- Aceptación: mostrar el número de asistentes con personaje reservado bajo la nota introductoria; ocultar la creación libre por defecto y permitir a admins habilitarla o deshabilitarla. La acción de servidor valida el permiso.
- Validación: Biome, tipos, build y comprobaciones de reservas y permisos.

## EPJ-31 — Concurso de tapas en Letux

- Estado: `validated`.
- Objetivo: registrar tapas, votar con rúbrica y resolver y publicar el concurso.
- Rutas: ficha y subruta de tapas de Letux, `src/features/tapas` y plan de Ebrias.
- Dependencias: sesiones, directorio, asistentes y MongoDB de Ebrias.
- Aceptación: inscripción única por miembro, censo fijo, exclusión de autores, voto asistido, desempate y resultados reservados hasta publicación.
- Validación: Biome incremental, tipos, pruebas de reglas y permisos, build y revisión de móvil y escritorio.
- Evidencia: [registro de Ebrias](iteration-log.md#epj-31--concurso-de-tapas-en-letux).

## EPJ-32 — Estilo de Tapas en Letux

- Estado: `validated`.
- Rutas: estilos compartidos del evento y subruta `tapas`.
- Dependencias: EPJ-31 y estilos de Letux y Disfraces.
- Aceptación: Tapas reutiliza el pergamino, los campos y los botones de lacre del evento en móvil y escritorio.
- Validación: Biome, tipos, build y revisión responsive.
- Evidencia: [registro de Ebrias](iteration-log.md#epj-32--estilo-de-tapas-en-letux).

## EPJ-33 — Separación uniforme en Letux

- Estado: `validated`.
- Rutas: ficha de Letux, Disfraces y estilos del evento.
- Dependencias: EPJ-31.
- Aceptación: los cuatro controles de la ficha tienen la misma separación vertical y Disfraces incluye el enlace de vuelta a la ficha.
- Validación: Biome, tipos, build y medida de los tres huecos en móvil y escritorio.
- Evidencia: [registro de Ebrias](iteration-log.md#epj-33--separación-uniforme-en-letux).

## EPJ-34 — Separación en Disfraces y Tapas

- Estado: `validated`.
- Rutas: páginas de Disfraces y Tapas y estilos de Tapas.
- Dependencias: separación compartida de la ficha de Letux (EPJ-33).
- Aceptación: el enlace, los controles y las tarjetas de cada página tienen el mismo hueco vertical que los controles de la ficha.
- Validación: Biome, tipos, build y medida en Chrome a 320 y 1440 px.

## EPJ-35 — Control de creación junto al buscador

- Estado: `validated`.
- Rutas: página de Disfraces, selector de personajes y estilos de Letux.
- Dependencias: control de creación de EPJ-30.
- Aceptación: el botón de administración comparte fila y altura con la etiqueta del buscador, incluso en móvil.
- Validación: Biome, tipos, build y medida en Chrome.

## EPJ-36 — Aviso flotante en Disfraces

- Estado: `validated`.
- Rutas: control de creación y estilos de Letux.
- Aceptación: la respuesta de la acción aparece en un aviso flotante que se puede cerrar sin mover el buscador.
- Validación: Biome, tipos, build y comprobación responsive.

## EPJ-37 — Guía editable de Nochevieja en Letux

- Estado: `validated`.
- Objetivo: leer el programa de Letux por días y mantener los textos desde la ficha.
- Rutas: ficha de Letux, `src/features/event-guide` y plan de Ebrias.
- Dependencias: roles actuales, MongoDB de la app y secciones de asistencia, coches, Tapas y Disfraces.
- Aceptación: programa con bloques ordenables y notas fijas, edición exclusiva de administradores, persistencia inmediata y protección frente a cambios simultáneos. El acceso y los flujos existentes siguen disponibles.
- Validación: Biome incremental, tipos, pruebas de Ebrias, build y recorrido de la guía y el editor a 320 y 1440 px con MongoDB aislado.

## EPJ-38 — Coches junto a asistentes en Letux

- Estado: `validated`.
- Rutas: ficha de Letux y plan de Ebrias.
- Dependencias: guía de Letux (EPJ-37).
- Aceptación: «Reparto de coches» aparece inmediatamente después de «¿Quién viene?», antes del programa.
- Validación: inspección del orden, Biome, tipos, pruebas de Ebrias y build.

## EPJ-39 — Orden de Tapas y Disfraces en la guía

- Estado: `validated`.
- Rutas: ficha y editor de Letux, modelo de la guía y plan de Ebrias.
- Dependencias: guía de Letux (EPJ-37).
- Aceptación: cada actividad se ordena junto a los bloques de su día, aparece una sola vez y conserva su nota y enlace. Las guías existentes mantienen su orden inicial.
- Validación: Biome, tipos, pruebas de compatibilidad y guardado del orden, build y recorrido en Chrome.

## EPJ-40 — Edición compacta de la guía de Letux

- Estado: `validated`.
- Rutas: editor de Letux, estilos y plan de Ebrias.
- Dependencias: EPJ-37 y EPJ-39.
- Aceptación: cada nota se edita en su actividad. Los bloques usan campos compactos e iconos accesibles a la derecha del encabezado.
- Validación: Biome, tipos, pruebas, build y revisión del editor a 320 y 1440 px.

## EPJ-41 — Títulos editables y alta desde la cabecera

- Estado: `validated`.
- Rutas: editor de Letux, estilos y registro de Ebrias.
- Dependencias: EPJ-40.
- Aceptación: el encabezado muestra el título real y permite editarlo directamente. Los iconos siguen a su derecha y cada sección permite añadir bloques con el icono «+» junto a su título. Los campos de descripción y nota conservan su nombre accesible sin repetirlo visualmente.
- Validación: Biome, tipos, pruebas, build y comprobación del título en Chrome.

## EPJ-42 — Nombres editables para Tapas y Disfraces

- Estado: `validated`.
- Rutas: editor, ficha y modelo de la guía de Letux.
- Dependencias: EPJ-41.
- Aceptación: ambos títulos se editan desde su bloque y aparecen en la guía. Vaciar un título recupera el nombre original.
- Validación: Biome, tipos, pruebas de guardado y build.
