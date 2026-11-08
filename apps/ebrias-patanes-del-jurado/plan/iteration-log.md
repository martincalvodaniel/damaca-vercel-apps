# Registro de entregas

[Entregas EPJ-01 a EPJ-05 archivadas](archive/2026-11-08/iteration-log.md).

## EPJ-06

- Biome, tipos y build de integración correctos.
- MongoDB 8 desechable verificó exclusividad concurrente, conservación del disfraz si falla el cambio, liberación al cambiar, bloqueo, prórroga única y alta en catálogo. Se comprobaron los alias y la búsqueda normalizada.
- La ficha local pide sesión antes de mostrar el buscador. El estado enviado al navegador contiene el bloqueo, sin el contador.

## EPJ-07

Inicio: 53% de 5 h y 91% de 7 d disponibles (10:43 CET).
- Better Auth creaba cuentas y sesiones de Google sin comprobar admisión. El callback ahora aplica el permiso y las rutas y acciones privadas vuelven a comprobarlo para las sesiones anteriores.
- Biome, tipos y build correctos. Una réplica MongoDB 8 desechable y el callback real de Better Auth con respuestas simuladas de Google verificaron el rechazo sin alta ni sesión, el acceso de administrador y el primer acceso tras autorizar.
- Las comprobaciones HTTP rechazaron sesiones antiguas sin permiso y una cuenta sin correo verificado. La acción rechazó altas de usuarios sin privilegios, normalizó el correo e hizo idempotente la admisión repetida.
- Chrome a 320 y 1440 px comprobó la portada pública, la portada privada y Ajustes, sin desbordamiento horizontal. Queda pendiente la comprobación con Google real en el entorno desplegado.

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

[Iteraciones](iterations.md) · [Alcance](master.md)
