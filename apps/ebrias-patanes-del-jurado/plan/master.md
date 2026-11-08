# Ebrias Patanes del Jurado

Landing para el grupo de amigos que usará la app para organizar reuniones sociales. El primer corte incluye la presentación, inicio y cierre de sesión con Google e instalación como app. La planificación de reuniones queda fuera de este corte.

La portada muestra el dibujo del jurado capturado en modo documento, sin marco. La foto del mismo dibujo con el marco de cielo y nubes queda disponible para otras pantallas. El favicon muestra las siglas EP/DJ. La app instalada usa un recorte de la versión sin marco.

Se reutiliza el clúster MongoDB del Hub con bases propias, separadas para integración y producción. No se reutilizan las sesiones ni las colecciones del Hub.

La primera ficha de evento es Nochevieja en Letux, del 30 de diciembre de 2026 al 1 de enero de 2027. Muestra las fechas, el lugar y la temática, además de la lista de asistentes tras iniciar sesión. La ficha es de consulta.

Cada evento que necesite persistencia usa nombres de colección MongoDB con formato `YYMMDD-<purpose>`, con la fecha local de inicio del evento. Para Nochevieja en Letux el prefijo es `261230-`. La ficha actual no necesita colecciones de evento.

[Iteraciones](iterations.md) · [Registro](iteration-log.md) · [Flujo](../../../plan/workflow.md)
