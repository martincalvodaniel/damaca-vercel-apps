# Iteraciones

## EPJ-01 — Landing instalable

- Estado: `validated`.
- Rutas: `apps/ebrias-patanes-del-jurado/**`, `bun.lock`.
- Dependencias: catálogo del monorepo, cliente OAuth de Google y acceso al clúster MongoDB del Hub.
- Aceptación: portada adaptable; entrada y salida con Google en la misma portada; persistencia aislada; manifiesto standalone con iconos y nombre por rama.
- Validación: Biome, tipos, build y comprobaciones HTTP de portada y manifiesto. Verificar OAuth real cuando existan credenciales y callback de esta app.

## EPJ-02 — Fotografías del jurado

- Estado: `validated`.
- Rutas: `apps/ebrias-patanes-del-jurado/**`.
- Dependencias: dos fotografías proporcionadas por el usuario.
- Aceptación: las dos fotos se muestran completas en la portada y un recorte de la primera identifica la pestaña y la app instalada.
- Validación: Biome, tipos, build y comprobación de referencias y dimensiones de las imágenes e iconos.

## EPJ-03 — Portada con el dibujo sin marco

- Estado: `validated`.
- Rutas: `src/app/` y `plan/` de la app.
- Dependencias: las dos versiones del dibujo guardadas en EPJ-02.
- Aceptación: la portada muestra solo la versión sin marco. La versión con marco queda disponible para otras pantallas.
- Validación: Biome, tipos, build y revisión de las referencias a las imágenes.

## EPJ-04 — Nubes, textos y favicon

- Estado: `validated`.
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
