# Ebrias Patanes del Jurado

Landing para el grupo de amigos que usará la app para organizar reuniones sociales. El primer corte incluye la presentación, inicio y cierre de sesión con Google e instalación como app. La planificación de reuniones queda fuera de este corte.

La portada muestra el dibujo del jurado capturado en modo documento, sin marco. La foto del mismo dibujo con el marco de cielo y nubes queda disponible para otras pantallas. El favicon muestra las siglas EP/DJ. La app instalada usa un recorte de la versión sin marco.

Se reutiliza el clúster MongoDB del Hub con bases propias, separadas para integración y producción. No se reutilizan las sesiones ni las colecciones del Hub.

La primera ficha de evento es Nochevieja en Letux, del 30 de diciembre de 2026 al 1 de enero de 2027. Muestra las fechas, el lugar y la temática, además de la lista de asistentes tras iniciar sesión. Desde la ficha se puede reservar un disfraz de forma anónima respecto al resto de participantes.

Cada evento que necesite persistencia usa nombres de colección MongoDB con formato `YYMMDD-<purpose>`, con la fecha local de inicio del evento. Para Nochevieja en Letux el prefijo es `261230-`. La elección usa `261230-costume-choices` y `261230-costume-characters`. Cada solicitud válida de un personaje distinto al actual consume un intento, incluso si está ocupado. Un cambio fallido conserva el disfraz anterior. El contador es interno y la página solo avisa cuando se agotan los intentos. El administrador puede conceder un cuarto intento una sola vez.

La portada pública ofrece únicamente el acceso con Google. Solo los administradores configurados y los correos admitidos previamente pueden acceder al área privada. Inicio y Ajustes forman la navegación privada. Ajustes muestra la cuenta y permite a los administradores admitir nuevos correos.

Los intentos de acceso de correos verificados sin autorización dejan una solicitud pendiente en Ajustes. Un administrador puede admitirla vinculando el correo a un miembro o creando uno. La lista inicial de Letux se importa con sus categorías de asistencia. Los miembros se reutilizan por evento y el administrador gestiona la asistencia desde cada ficha. Cada cuenta autorizada puede editar su alias en Ajustes. El nombre actual se usa como alias inicial.

[Iteraciones](iterations.md) · [Registro](iteration-log.md) · [Flujo](../../../plan/workflow.md)
