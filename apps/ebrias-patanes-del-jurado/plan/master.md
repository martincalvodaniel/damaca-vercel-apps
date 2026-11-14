# Ebrias Patanes del Jurado

Landing para el grupo de amigos que usará la app para organizar reuniones sociales. El primer corte incluye la presentación, inicio y cierre de sesión con Google e instalación como app. La planificación de reuniones queda fuera de este corte.

La portada muestra el dibujo del jurado capturado en modo documento, sin marco. La foto del mismo dibujo con el marco de cielo y nubes queda disponible para otras pantallas. El favicon muestra las siglas EP/DJ. La app instalada usa un recorte de la versión sin marco.

Se reutiliza el clúster MongoDB del Hub con bases propias, separadas para integración y producción. No se reutilizan las sesiones ni las colecciones del Hub.

La primera ficha de evento es Nochevieja en Letux, del 30 de diciembre de 2026 al 1 de enero de 2027. Muestra las fechas, el lugar y la temática, además de la lista de asistentes tras iniciar sesión. Desde la ficha se puede reservar un disfraz de forma anónima respecto al resto de participantes.

La ficha de Letux se lee como una guía con alojamiento, asistentes, coches, programa por días y otros avisos. Los administradores publican las notas de alojamiento, Tapas y Disfraces y los bloques de título y texto ordenables desde la propia ficha. Las cuentas admitidas pueden leer la guía. La colección `261230-event-guide` guarda una revisión para evitar que una edición antigua sobrescriba otra más reciente. Ver [EPJ-37](iterations.md#epj-37--guía-editable-de-nochevieja-en-letux).

Cada evento que necesite persistencia usa nombres de colección MongoDB con formato `YYMMDD-<purpose>`, con la fecha local de inicio del evento. Para Nochevieja en Letux el prefijo es `261230-`. La elección usa `261230-costume-choices` y `261230-costume-characters`. Cada solicitud válida de un personaje distinto al actual consume un intento, incluso si está ocupado. Un cambio fallido conserva el disfraz anterior. El contador es interno y la página solo avisa cuando se agotan los intentos. El administrador puede conceder un cuarto intento una sola vez.

La portada pública ofrece únicamente el acceso con Google. Solo los administradores configurados y los correos admitidos previamente pueden acceder al área privada. Inicio y Ajustes forman la navegación privada. Ajustes muestra la cuenta y permite a los administradores admitir nuevos correos.

Los intentos de acceso de correos verificados sin autorización dejan una solicitud pendiente en Ajustes. Un administrador puede admitirla vinculando el correo a un miembro o creando uno. Cada evento guarda sus asistentes y sus estados en `YYMMDD-attendees`. Un asistente puede ser un invitado o estar vinculado a un miembro del club. Cada bloque visible muestra su número de miembros. Los administradores y las cuentas vinculadas a un miembro del club gestionan los asistentes y bloques desde cada ficha. Cada cuenta autorizada puede editar su alias en Ajustes. El nombre actual se usa como alias inicial.

Los administradores pueden cambiar el correo de un miembro desde una solicitud verificada. El cambio conserva la asistencia, el alias y la reserva de disfraz. El miembro y los administradores pueden editar el mismo alias visible.

[Iteraciones](iterations.md) · [Registro](iteration-log.md) · [Flujo](../../../plan/workflow.md)

`MONGODB_DB` permite elegir la base de autenticación y de datos. Si la variable falta o está vacía, se conserva la selección predeterminada para desarrollo, integración y producción. [AGW-26](../../../plan/iterations.md#agw-26--verificar-la-selección-de-base-mongodb).

## Concurso de tapas de Letux

El 30 de diciembre hay un concurso con tapas individuales o en pareja. El administrador abre la votación, que fija participantes y tapas. Los asistentes puntúan todas las tapas ajenas de 0 a 10 en sabor, presentación, originalidad y calidad de los ingredientes. Un administrador puede facilitar el voto a un asistente desde su móvil. Se conserva una papeleta por persona y ronda, modificable hasta el cierre.

La suma de las cuatro medias determina la clasificación inicial. Los empates por el primer puesto se resuelven en una ronda extra sin los autores finalistas; si persisten, se comparan sabor, calidad, originalidad y presentación, y finalmente se recurre al sorteo presencial. El administrador revisa los resultados antes de publicarlos de manera definitiva. Ver [EPJ-31](iterations.md#epj-31--concurso-de-tapas-en-letux).
