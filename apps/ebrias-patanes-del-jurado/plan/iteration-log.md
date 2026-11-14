# Registro de entregas

[Entregas EPJ-01 a EPJ-07 archivadas](archive/2026-11-08/iteration-log.md).

[Entregas EPJ-08 a EPJ-23 archivadas](archive/2026-11-14/iteration-log.md).

## EPJ-24

- Se integró la gestión en «¿Quién viene?». Pendiente comprobar la interacción y la vista en móvil y escritorio.

## EPJ-25

- El reparto reutiliza los bloques y el arrastre de asistencia. Los coches y las asignaciones se guardan en colecciones propias del evento. Pendiente la revisión visual y del arrastre en navegador.

## EPJ-26

- Se preparó una migración con vista previa y transacción por miembro. Pendiente aplicar en las bases de destino.

## EPJ-27

- [Criterios](iterations.md#epj-27--recarga-sin-parpadeo-de-lumos). El HTML inicial incluye el contenido del evento y omite el gate hasta resolver el estado local.
- Biome sobre el componente, comprobación de tipos y build de la app correctos. Turbo no encontró tareas de test para la app. Se comprobó el HTML inicial con `renderToString`.
- Pendiente comprobar la recarga en navegador móvil y de escritorio. La consulta al remoto falló al resolver GitHub.

## EPJ-28

- [Criterios](iterations.md#epj-28--quitar-añadir-bloque-de-quién-viene). El formulario de creación solo se monta en «Coches» para usuarios con permiso de gestión.
- Biome sobre el componente, tipos y build correctos. Pendiente comprobar ambas secciones en navegador móvil y de escritorio.

## EPJ-29

- [Criterios](iterations.md#epj-29--controles-de-nochevieja). Enlace de disfraces sobre el acordeón nativo y modal de creación de coches en la cabecera desplegada.
- Biome sobre los tres archivos, tipos, build y comprobación del diff correctos. Pendiente revisión en navegador móvil y de escritorio.

- Cambios posteriores: se restauró el margen nativo de las listas de asistentes y la sangría se aplicó a las tarjetas de bloque. Biome y `git diff --check` correctos.
- Entrega: commit local pendiente de push, despliegue Preview de `int` y movimiento del alias. `git ls-remote origin refs/heads/int` falló porque el entorno no resuelve `github.com`; Vercel CLI tampoco pudo conectar.

## EPJ-30

- [Criterios](iterations.md#epj-30--contador-de-reservas-y-control-de-personajes). El contador usa reservas actuales; la creación libre queda desactivada por defecto y solo el admin puede cambiarla. El servidor vuelve a validar la opción al recibir una reserva.
- Biome, tipos y build de la app correctos. Revisión visual pendiente.

## EPJ-31 — Concurso de tapas en Letux

- Inicio en `int` sin cambios locales ni commits sin publicar. Capacidad inicial disponible: 45% en 5 h y 16% en 7 días.
- Aceptación: [EPJ-31](iterations.md#epj-31--concurso-de-tapas-en-letux).
- Implementadas inscripción, rúbrica, voto asistido, resolución con desempate o sorteo y publicación definitiva. Al abrir se congela el censo; las escrituras usan una revisión del documento MongoDB para comprobar concurrencia.
- Biome en los archivos editados, tipos, cinco pruebas de reglas y `git diff --check`: correctos. El build pasó tras adaptar una importación previa a los exports de `web-push` 4.0.0. El entorno del build no resolvió el DNS de MongoDB para inicializar índices de Better Auth.
- Chrome autenticado con sesiones ficticias y MongoDB 8 desechable: inscripción, exclusiones, voto directo y asistido en ambas rondas, cierre parcial, privacidad hasta publicar, orden por categoría y ausencia de desplazamiento horizontal a 320 y 1440 px. No se usó Google real ni la base de datos del club.

## EPJ-32 — Estilo de Tapas en Letux

- Inicio en `int` limpio y sincronizado. Capacidad disponible: 39% en 5 h y 15% en 7 días.
- Tapas reutiliza las tarjetas de pergamino, la tipografía de formularios y los botones de lacre de Letux y Disfraces.
- Chrome autenticado con MongoDB desechable: igualdad de estilos calculados en las tarjetas y los botones principales de Tapas y Disfraces, y recorrido completo a 320 y 1440 px sin desplazamiento horizontal.
- Build correcto, con el aviso de DNS de la base configurada al inicializar índices de Better Auth.

## EPJ-33 — Separación uniforme en Letux

- La ficha usa un único espacio entre sus cuatro controles. Disfraces recupera el enlace a la ficha con el mismo estilo y posición que Tapas.
- Maqueta en Chrome con los estilos reales: tres huecos iguales de 4,8 px a 320 y 1440 px, con el listado abierto y cerrado.
- Biome incremental, tipos, build y comprobación del diff correctos. El build mostró el aviso de DNS de MongoDB al inicializar índices.
