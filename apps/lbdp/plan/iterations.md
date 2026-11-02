# Iteraciones LBDP

## LBDP-01 — Esqueleto público

- Estado: `validated`.
- Objetivo: escaparate público navegable con identidad de La Bottega, contenido independiente de decisiones comerciales y enlaces claros a la web vigente.
- Rutas: `apps/lbdp/**`, incorporación del workspace en `bun.lock`, referencia en `plan/master.md` y entrada CI de tipos para lbdp. Ningún archivo de otras apps.
- Dependencias: catálogo Bun y configuración Biome raíz; fotografías públicas del negocio y dossier existente. Port 3006 libre según manifiestos.
- Aceptación: portada, listados/fichas y secciones informativas responsive; menú móvil accesible; enlaces funcionales; fotos locales; sin falsa disponibilidad ni operaciones simuladas. Sin dependencias/API/datos de otras apps, secretos, escritura remota o publicación de producción. Los tres documentos y AGENTS específicos presentes.
- Validación: Biome explícito/incremental, tipos y build filtrados; rutas/404/assets y navegación real a 390 y 1440 px; enlaces documentales, diff y aislamiento de otras apps. Sin tests unitarios que reflejen contenido estático; revisión funcional de navegador.
- Capacidad inicial (02/11/2026): 41% de 5h y 45% de 7d; corte secuencial estimado dentro de reservas de 7%/2%, con consulta antes de validar y al cierre.
