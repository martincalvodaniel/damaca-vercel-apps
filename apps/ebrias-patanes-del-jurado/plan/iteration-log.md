# Registro de entregas

## EPJ-01

Inicio: 92% de 5 h y 97% de 7 d disponibles (09:38 CET).
- Instalación filtrada con lockfile congelado y caché local, Biome, tipos y builds para `int` y `main`: correctos.
- La portada respondió por HTTP en local y el manifiesto de integración devolvió `ebrias-int` en modo standalone. El manifiesto generado para `main` devolvió `ebrias`.
- Sin variables privadas, la portada carga y el endpoint de sesión devuelve 503. Queda pendiente verificar el inicio y cierre de sesión con Google y la escritura en MongoDB tras configurar el proyecto. No se ha comprobado la instalación en un navegador.

## EPJ-02

Inicio: 82% de 5 h y 96% de 7 d disponibles (09:54 CET).
- Biome, tipos y build de integración correctos.
- Comprobadas las dimensiones de ambas fotos y de todos los iconos. El manifiesto del build conserva `ebrias-int` y enlaza el icono adaptable propio.

## EPJ-03

Inicio: 79% de 5 h y 95% de 7 d disponibles (10:01 CET).
- Biome, tipos y build de integración correctos.
- La portada solo referencia la imagen sin marco. La foto con marco sigue guardada en la app.

## EPJ-04

Inicio: 72% de 5 h y 94% de 7 d disponibles (10:17 CET).
- Biome, tipos y build de integración correctos.
- La portada local sirve los textos nuevos, el dibujo con carga inmediata y el favicon SVG EP/DJ.

## EPJ-05

Inicio: 69% de 5 h y 94% de 7 d disponibles (10:26 CET).
- Biome, tipos y build de integración correctos.
- Chrome a 320 y 1440 px verificó el enlace de portada, la ficha y la ocultación de la lista sin sesión. Pendiente comprobar la vista con una cuenta de Google.

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

[Iteraciones](iterations.md) · [Alcance](master.md)
