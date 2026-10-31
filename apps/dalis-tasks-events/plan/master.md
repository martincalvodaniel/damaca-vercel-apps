# Dalis Tasks & Events — estado vigente

## Objetivo y alcance

Aplicación personal mobile-first para planificación, operable offline con sincronización, autenticación y persistencia conforme a sus contratos actuales. El alcance de ingeniería de la generación 6 quedó cerrado en `int`; la matriz de aceptación y sus límites se mantienen en [release-readiness.md](release-readiness.md).

## Requisitos y decisiones aceptadas

- Mantener las variantes de planes, calendario, offline, Google y aislamiento de cuentas, categorías, asignaciones, orden, repetición, apariciones, zona personal, tema, copias y recuperación ordinaria aceptadas para la versión.
- Padre recurrente eliminado, remoto desconocido y cadenas externas no admitidas siguen pospuestos, con guardias/evidencia preservadas. Copia de serie completa y cumpleaños están fuera; compartir por Gmail excluido.
- Sincronización necesita app abierta y conexión para confirmar. Push a `int` no equivale a promoción ni valida producción.
- Restricciones técnicas, almacenamiento y seguridad en [AGENTS.md](../AGENTS.md), guía de usuario y checklist operativo.

- Los planes pueden no tener fecha; se muestran en «Sin fecha», encima de Atrasadas y plegada por defecto en cada entrada. Conservan categorías y orden manual. Las series requieren fecha de inicio.

- Al arrastrar planes en Mi espacio (incluida Sin fecha) y Calendario, solo se muestran categorías con planes visibles. Las categorías vacías dejan de ofrecerse como destinos de arrastre.

## Estado actual y exclusiones

Tasks vuelve a autenticar directamente con Google y autoriza mediante `ALLOWED_EMAILS`, con configuración independiente por entorno. No consulta permisos ni identidad al Hub. Se conservan las sesiones/usuarios Mongo y los datos locales offline; quienes usaron la integración temporal pueden necesitar iniciar sesión de nuevo con Google. La reversión de AGW-11 y la suspensión del refresco se registran en [AGW-13](../../../plan/iterations.md#agw-13--restore-independent-tasks-authentication-and-suspend-database-refresh). `main` sigue bajo gestión humana.

## Evidencia y trabajo previo

Las diez entregas recientes son `23q`–`23h` en [iteraciones](iterations.md) y [registro](iteration-log.md). Las decisiones y registros anteriores se conservan en el [archivo](archive/2026-10-24/README.md).

## Application icons

Browser and home-screen icons use local SVG sources, a 16/32/48-pixel ICO fallback, installation PNGs and an Apple Touch Icon. Existing PWA manifests also declare an opaque maskable variant. Regenerate with `bun run icons:generate` from the repository root. Shared status and evidence: [AGW-10](../../../plan/iterations.md#agw-10--application-favicons) and [delivery log](../../../plan/iteration-log.md#agw-10-application-favicons).
