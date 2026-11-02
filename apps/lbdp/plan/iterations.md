# Iteraciones LBDP

## LBDP-01 — Esqueleto público

- Estado: `validated`.
- Objetivo: escaparate público navegable con identidad de La Bottega, contenido independiente de decisiones comerciales y enlaces claros a la web vigente.
- Rutas: `apps/lbdp/**`, incorporación del workspace en `bun.lock`, referencia en `plan/master.md` y entrada CI de tipos para lbdp. Ningún archivo de otras apps.
- Dependencias: catálogo Bun y configuración Biome raíz; fotografías públicas del negocio y dossier existente. Port 3006 libre según manifiestos.
- Aceptación: portada, listados/fichas y secciones informativas responsive; menú móvil accesible; enlaces funcionales; fotos locales; sin falsa disponibilidad ni operaciones simuladas. Sin dependencias/API/datos de otras apps, secretos, escritura remota o publicación de producción. Los tres documentos y AGENTS específicos presentes.
- Validación: Biome explícito/incremental, tipos y build filtrados; rutas/404/assets y navegación real a 390 y 1440 px; enlaces documentales, diff y aislamiento de otras apps. Sin tests unitarios que reflejen contenido estático; revisión funcional de navegador.
- Capacidad inicial (02/11/2026): 41% de 5h y 45% de 7d; corte secuencial estimado dentro de reservas de 7%/2%, con consulta antes de validar y al cierre.

## LBDP-02 — Proyecto Vercel y Preview de int

- Estado: `blocked`.
- Objetivo: crear/vincular un proyecto Vercel independiente con raíz `apps/lbdp` y desplegar un Preview del commit `int`, sin producción ni dominio personalizado.
- Rutas: configuración de despliegue y documentación/plan de `apps/lbdp/**`; vinculación local ignorada. No modificar otras apps ni sus proyectos.
- Dependencias: sesión Vercel autenticada en el equipo existente, acceso Git y cuota disponible; build local LBDP-01 validado. Autorización explícita del usuario para nuevo proyecto y Preview.
- Aceptación: proyecto/raíz/comandos correctos, rama de producción main sin promover; Preview int READY y URL comprobada, conservando protección de despliegue y noindex. Si hay bloqueo externo, registrar evidencia y punto exacto pendiente, sin reintentos periódicos.
- Validación: inspección de proyecto y deployment, SHA/rama/entorno, HTTP alojado de portada/ficha/robots usando acceso protegido; lint y coherencia documental; commit/push int y verificación remota si cambia el repositorio.
- Capacidad inicial (02/11/2026): 23% de 5h y 43% de 7d restantes; corte acotado con reserva mínima 7%/2%.

- Bloqueo observado: creación del Preview rechazada por Vercel con HTTP 402, código `api-deployments-free-per-day`, mensaje «more than 100, try again in 1 day». Proyecto/Git configurados; falta crear el deployment y validar URL/HTTP. No se realizan reintentos ni cambios de plan.

## LBDP-03 — Reparar el lanzador de instalación de Vercel

- Estado: `blocked`.
- Objetivo/rutas: aislar el fallo de bootstrap Bun y corregir solo comandos del proyecto lbdp y su documentación. Sin cambios de producto ni otras apps.
- Evidencia: build remoto 996618a falla antes de iniciar Bun; el mismo install filtrado pasa en copia limpia local (29 paquetes), descartando lockfile inconsistente en esa reproducción.
- Aceptación/validación: probar lanzador alternativo fijado a Bun 1.4.4, inspeccionar proyecto; un Preview explícito de int confirma instalación/build/HTTP. Registrar limitaciones sin atribuir causa interna no probada. Sin producción, cambios de plan ni reintentos periódicos.
- Capacidad: 12% de 5h y 41% de 7d al comienzo; margen acotado con reserva 7%/2%.

- Bloqueo LBDP-03: comandos cambiados a npx manteniendo Bun 1.4.4; Preview de validación rechazado con HTTP 402 por cuota. Mitigación local comprobada, resultado alojado pendiente; no declarar resuelto el error de build.

## LBDP-04 — Desactivar deployments automáticos de Git

- Estado: `validated`.
- Objetivo: impedir que pushes a cualquier rama creen deployments automáticos para el proyecto LBDP, conservando deployments manuales por CLI.
- Rutas: `apps/lbdp/vercel.ts` y planificación/evidencia de LBDP.
- Dependencias: configuración `VercelConfig` existente y compatibilidad documentada de `git.deploymentEnabled`.
- Aceptación: `git.deploymentEnabled` es `false`; build e instalación conservan la configuración actual; no se pausa el tráfico ni se despliega producción.
- Validación: Biome del archivo, validación de configuración/tipos disponible, `git diff --check`, publicación y SHA remoto conforme al flujo raíz. La configuración se publica en int; no se inicia un deployment manual en esta iteración ni se acredita el comportamiento de otras ramas con configuraciones anteriores.
