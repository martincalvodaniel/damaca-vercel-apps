# Dalis Tasks & Events — estado vigente

## Objetivo y alcance

Aplicación personal mobile-first para planificación, operable offline con sincronización, autenticación y persistencia conforme a sus contratos actuales. El alcance de ingeniería de la generación 6 quedó cerrado en `int`; la matriz de aceptación y sus límites se mantienen en [release-readiness.md](release-readiness.md).

## Requisitos y decisiones aceptadas

- Mantener las variantes de planes, calendario, offline, Google y aislamiento de cuentas, categorías, asignaciones, orden, repetición, apariciones, zona personal, tema, copias y recuperación ordinaria aceptadas para la versión.
- Padre recurrente eliminado, remoto desconocido y cadenas externas no admitidas siguen pospuestos, con guardias/evidencia preservadas. Copia de serie completa y cumpleaños están fuera; compartir por Gmail excluido.
- Sincronización necesita app abierta y conexión para confirmar. Push a `int` no equivale a promoción ni valida producción.
- Restricciones técnicas, almacenamiento y seguridad en [AGENTS.md](../AGENTS.md), guía de usuario y checklist operativo.

## Estado actual y exclusiones

La autenticación de Dalis Tasks delega Google y el permiso de aplicación en Damaca Hub; la interfaz presenta un acceso transparente con Google y no expone el proveedor interno. Las sesiones y los IDs locales de Mongo siguen siendo propios de Tasks para preservar la identidad de sincronización. La integración transversal [AGW-11](../../../plan/iterations.md#agw-11--dalis-tasks-uses-hub-identity) está en curso. Producción requiere un cliente OIDC de Hub y sus credenciales aisladas; la promoción a `main` y smoke del despliegue son acciones separadas y `main` sigue bajo gestión humana.

## Evidencia y trabajo previo

Las diez entregas recientes son `23n`–`23e` en [iteraciones](iterations.md) y [registro](iteration-log.md). Las decisiones y registros anteriores se conservan en el [archivo](archive/2026-10-24/README.md).

## Application icons

Browser and home-screen icons use local SVG sources, a 16/32/48-pixel ICO fallback, installation PNGs and an Apple Touch Icon. Existing PWA manifests also declare an opaque maskable variant. Regenerate with `bun run icons:generate` from the repository root. Shared status and evidence: [AGW-10](../../../plan/iterations.md#agw-10--application-favicons) and [delivery log](../../../plan/iteration-log.md#agw-10-application-favicons).
