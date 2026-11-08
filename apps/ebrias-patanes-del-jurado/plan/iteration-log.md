# Registro de entregas

[Entregas EPJ-01 a EPJ-07 archivadas](archive/2026-11-08/iteration-log.md).

## EPJ-08

- El selector separa el texto escrito de la selección confirmada. Ofrece coincidencias existentes y una opción destacada «(Crear)»; cada tipo de selección tiene un resaltado diferente.
- «Reservar disfraz» permanece visible y deshabilitado hasta seleccionar una opción. Crear añade el personaje y lo reserva en la misma acción del servidor.
- Biome en los tres archivos modificados, `bun run type-check --filter=@damaca/ebrias-patanes-del-jurado` y `git diff --check`: correctos. No se ejecutó build ni comprobación visual.

## EPJ-09

- El selector permanecía oculto al alcanzar cero intentos, y el aviso de castigo se mostraba junto al estado bloqueado, incluso tras la reserva válida que agotaba el cupo. El formulario ahora siempre permanece visible y el aviso solo se muestra tras recibir el resultado `locked` al enviar otro intento.
- Biome, `bun run type-check --filter=@damaca/ebrias-patanes-del-jurado` y `git diff --check`: correctos. No se ejecutó build ni comprobación visual.

## EPJ-10

- El evento pasó a `/eventos/26-12-30-nochevieja-letux`; la ruta de disfraces y la navegación usan la nueva dirección. Se retiró el enlace de vuelta de la página de disfraces.
- Los listados de estancia y comida/día del 31 se agruparon bajo «¿Quién viene?» con `<details>` colapsado inicialmente. «Elegir disfraz» quedó fuera de la sección colapsable.
- Biome, build, `bun run type-check --filter=@damaca/ebrias-patanes-del-jurado` y `git diff --check`: correctos.

## EPJ-11

- Se añadió una limpieza que elimina de la colección de personajes los nombres dinámicos sin elecciones que los referencien. Se ejecuta al cambiar una reserva correcta y si una creación no logra reservarse. El catálogo fijo queda fuera de esta limpieza.
- Biome, `bun run type-check --filter=@damaca/ebrias-patanes-del-jurado` y `git diff --check`: correctos. No se ejecutaron pruebas.

## EPJ-12

- Tras una reserva o cambio, el selector conserva el texto del buscador, limpia la selección anterior y recalcula coincidencias con los personajes dinámicos que siguen en la base de datos.
- Biome, `bun run type-check --filter=@damaca/ebrias-patanes-del-jurado` y `git diff --check`: correctos. No se ejecutaron pruebas.

## EPJ-13

Inicio: 44% de 5 h y 90% de 7 d disponibles (11:08 CET).
- Las dos páginas comparten un castillo nocturno ilustrado, títulos dorados, pergamino y botones de lacre. El selector conserva el Sombrero y distingue selección de catálogo y creación.
- Biome sin avisos en la hoja editada, tipos, build y `git diff --check` correctos. Se revisaron maquetas con los estilos reales en Chrome a 320 y 1440 px, con asistentes desplegados y sugerencias visibles. No se usó una sesión autenticada.
- Entrega local: la hoja editada pertenece a una ruta que ya estaba sin seguimiento junto con cambios previos de navegación y reservas. Publicarla de forma aislada dejaría el estilo sin sus consumidores.

## EPJ-14

Inicio: 39% de 5 h y 89% de 7 d disponibles (11:46 CET).
- Biome, tipos, build y comprobación del diff correctos.
- Callback de Better Auth con Google simulado y MongoDB 8 desechable: solicitud única sin sesión, acceso previo conservado, admisión con vínculo o alta y reintento sin duplicados.
- Las acciones HTTP verificaron el aislamiento del alias personal y el permiso administrativo de asistencia. Los 17 registros iniciales conservaron su categoría y la importación repetida no sobrescribió una edición.
- Chrome a 320 y 1440 px verificó Ajustes y la ficha de Letux sin desbordamiento horizontal. Queda pendiente comprobar el acceso con Google real tras desplegar.
- La viabilidad de Web Push se confirmó. Los avisos del sistema quedan fuera de este corte.

## EPJ-15

Inicio: 31% de 5 h y 88% de 7 d disponibles.
- Los controles de Ajustes bajan de 44 a 36 px. Las dos acciones de cuenta comparten fila y hay 10 px entre el perfil y el alias.
- El selector de miembros mantiene el envío nativo y personaliza el menú en navegadores compatibles. La maqueta en Chrome verificó apertura, elección con teclado y ratón y el valor enviado por el formulario.
- Biome, tipos, build y comprobación del diff correctos. Una maqueta con el CSS real comprobó ambas anchuras (320 y 1440 px), con botones alineados y sin desbordamiento. No se usó una sesión autenticada.

## EPJ-16

Inicio: 25% de 5 h y 87% de 7 d disponibles.
- Google simulado, acciones HTTP y MongoDB desechable verificaron la transferencia, los permisos, la revocación de la sesión anterior, el reintento y el conflicto entre dos solicitudes simultáneas.
- Se conservaron el alias previo, la asistencia y el estado del disfraz con sus intentos y prórroga. Los cambios de alias de administrador y miembro se reflejaron en el directorio y en el evento.
- Biome, tipos y build correctos. Chrome verificó Ajustes y Letux a 320 y 1440 px. Queda pendiente validar Google real en el entorno desplegado.

## EPJ-17

Inicio: 19% de 5 h y 86% de 7 d disponibles.
- Cada bloque visible muestra su total. Los administradores pueden crear bloques del evento y asignarles miembros; el servidor comprueba el rol y los nombres se guardan sin duplicados por mayúsculas o espacios.
- Biome en los archivos editados, tipos, build y comprobación del diff correctos. Una maqueta con el CSS de la ficha se comprobó en Chrome a 320 y 1440 px con un nombre de 60 caracteres, sin desbordamiento.
- Pendiente comprobar la creación y reasignación con una sesión real y MongoDB.

## EPJ-18

- Los relámpagos eligen uno de los cuatro bordes de la escena con un punto aleatorio y se disparan con pausas variables. La duración de cada relámpago se ajustó a 750 ms.
- Biome explícito en los dos archivos: correcto, con cinco advertencias preexistentes de especificidad CSS y callbacks JSX. `bun run lint --changed --since=HEAD` no encontró archivos; `bun run type-check --filter=@damaca/ebrias-patanes-del-jurado` terminó correctamente (resultado desde caché); `git diff --check` correcto.

## EPJ-19

- El audio usa una instancia compartida entre la ficha de Letux y la selección de disfraz. El control persistente permite activarlo o pausarlo en ambas rutas; al navegar con el enlace de la app, el audio continúa y el estado accesible sigue indicando «Pausar música».
- La nota doble quedó nítida; cuando está apagada, una línea roja la tacha. A 320 px el botón mide 48 × 48 px y el documento no tiene desbordamiento horizontal. A 1440 px tampoco se detectó desbordamiento y el botón queda dentro del viewport.
- Biome en los seis archivos afectados, `bun run type-check --filter=@damaca/ebrias-patanes-del-jurado` y `git diff --check`: correctos. El servidor de desarrollo ya ocupaba el puerto 3020; la comprobación visual reutilizó esa instancia.

## EPJ-20

- Se añadió una acción de servidor con comprobación de rol administrador y validación del correo. La persistencia elimina solo el registro cuya clave normalizada coincide y que todavía tiene `pending: true`; miembros y accesos admitidos quedan fuera de esa operación.
- Ajustes muestra «Eliminar solicitud» con estilo de advertencia en cada solicitud pendiente. Se añadió 8 px de margen entre el formulario de admisión y el desplegable de cambio de correo.
- Biome en los cinco archivos afectados, `bun run type-check --filter=@damaca/ebrias-patanes-del-jurado` y `git diff --check`: correctos. La vista real de Ajustes se revisó a 320 y 1440 px sin desbordamiento; el margen medido fue 8 px. No se pulsó eliminar durante la revisión.

[Iteraciones](iterations.md) · [Alcance](master.md)

## EPJ-21

- Se separaron los asistentes del directorio y se retiró la siembra automática. La gestión exige administrador o miembro vinculado.
- La limpieza heredada tiene vista previa. Pendientes la comprobación con sesiones reales, la revisión responsive y la ejecución de la limpieza.

## EPJ-22

- Biome y tipos correctos. Pendiente configurar VAPID, desplegar y comprobar la entrega en un dispositivo real.

## EPJ-23

- Se añadió la acción de borrado con confirmación y transacción MongoDB. Pendiente comprobar el flujo con una cuenta desechable y revisar la pantalla en móvil y escritorio.

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
