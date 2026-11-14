# Registro de entregas

[Entregas EPJ-01 a EPJ-07 archivadas](archive/2026-11-08/iteration-log.md).

[Entregas EPJ-08 a EPJ-52 archivadas](archive/2026-11-14/iteration-log.md).

## EPJ-53 — Controles compactos de confirmación

- Capacidad inicial de 66% en 5 h y 4% en 7 días. Los controles pasan a 28 px sin relleno ni margen y se reduce el hueco de cabecera.
- Biome, tipos y build correctos.

## EPJ-54 — Recuperar el acceso tras un fallo inicial de MongoDB

- Capacidad inicial de 96% en 5 h y 99% en 7 días.
- La autenticación espera a que MongoDB conecte y comparte la inicialización entre peticiones. Un fallo descarta el intento y registra el tipo de error.
- Prueba local temporal contra la ruta de sesión, con un proxy TCP y MongoDB 8. Antes del cambio, la primera petición devolvió HTTP 500 y fallaron las 12 lecturas posteriores. Con el cambio, la primera devolvió HTTP 503 y las 12 lecturas concurrentes recuperaron la sesión en el mismo proceso.
- Biome sobre los tres archivos TypeScript, tipos, 12 pruebas de Ebrias, build y `git diff --check` correctos. Pendiente probar OAuth con una cuenta autorizada en un despliegue de integración.

## EPJ-55 — Lista de la compra de Letux

- Capacidad inicial de 89% en 5 h y 98% en 7 días. Lista compartida con orden persistente, marcas independientes, edición y borrado confirmado.
- Biome, tipos, diez pruebas de compra y Tapas y build correctos. La comprobación en Chrome quedó pendiente porque la sesión ficticia redirigía a la portada antes de abrir la ficha.

## EPJ-56 — Ajustes de compra, inscripciones y avisos

- Capacidad inicial disponible de 74% en 5 h y 96% en 7 días.
- La compra comparte la sangría móvil. Tapas muestra el total, separa el formulario personal y abre la confirmación desde la papelera. El formulario de alta del administrador se mueve a Administración.
- Los avisos se cierran a los cinco segundos y reinician el plazo al recibir otro mensaje. Biome, tipos, diez pruebas y build correctos. Pendiente comprobar el recorrido con una sesión autenticada.

## EPJ-57 — Relleno aleatorio de papeletas

- Capacidad inicial disponible de 68% en 5 h y 95% en 7 días.
- El administrador puede rellenar el borrador en ambas rondas desde su papeleta o una asistida. Se conserva el flujo de revisión y envío.
- Biome, tipos, nueve pruebas de Tapas y build correctos. El botón nuevo queda pendiente de comprobar en un navegador autenticado.

## EPJ-58 — Selector de notas y revelación del podio

- Capacidad inicial disponible de 61% en 5 h y 94% en 7 días.
- La rúbrica usa un selector de 0 a 10. Los atajos quedan en la papeleta propia del administrador. Los puestos se revelan de tercero a primero por puntuación distinta y el primer paso correspondiente inicia el desempate si hace falta.
- Biome, tipos, diez pruebas de Tapas y build correctos. Pendiente revisar el selector y el podio en un navegador autenticado.

## EPJ-59 — Podio sincronizado y medallas

- Capacidad inicial de 52% en 5 h y 93% en 7 días. Medallas por puntuación final, diamante para la ganadora y recuentos de finalistas tras publicar.
- Las pantallas visibles consultan el progreso cada dos segundos mediante una ruta autenticada que devuelve solo una versión.
- Biome, tipos, once pruebas de Tapas y build correctos. Pendiente la comprobación con dos sesiones autenticadas.

## EPJ-60 — Cuenta atrás del podio

- Capacidad inicial de 44% en 5 h y 91% en 7 días. Dos segundos de preparación y tres de cuenta atrás. La fecha límite se aplica en servidor sin depender de que el administrador mantenga la página abierta.
- Biome, tipos, doce pruebas de Tapas y build correctos. Pendiente la revisión visual con dos sesiones autenticadas.

## EPJ-61 — Anuncio del premio en la cuenta atrás

- Capacidad inicial de 34% en 5 h y 90% en 7 días. El anuncio ocupa la capa de cuenta atrás durante tres segundos y la plata aparece encima del bronce.
- Biome, tipos, doce pruebas y build correctos. Se comprobó la ventana de publicación y el bloqueo de avances. Pendiente la revisión visual con dos sesiones autenticadas.

## EPJ-62 — Formato del anuncio de Tapas

- Capacidad inicial de 27% en 5 h y 89% en 7 días. El anuncio pone los autores entre paréntesis tras el nombre. Biome, tipos y build correctos.
