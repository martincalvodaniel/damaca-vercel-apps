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

[Alcance](master.md) · [Evidencia](iteration-log.md)
