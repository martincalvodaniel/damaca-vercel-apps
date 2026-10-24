# Dalis Tasks & Events — estado vigente

## Objetivo y alcance

Aplicación personal mobile-first para planificación, operable offline con sincronización, autenticación y persistencia conforme a sus contratos actuales. El alcance de ingeniería de la generación 6 quedó cerrado en `int`; la matriz de aceptación y sus límites se mantienen en [release-readiness.md](release-readiness.md).

## Requisitos y decisiones aceptadas

- Mantener las variantes de planes, calendario, offline, Google y aislamiento de cuentas, categorías, asignaciones, orden, repetición, apariciones, zona personal, tema, copias y recuperación ordinaria aceptadas para la versión.
- Padre recurrente eliminado, remoto desconocido y cadenas externas no admitidas siguen pospuestos, con guardias/evidencia preservadas. Copia de serie completa y cumpleaños están fuera; compartir por Gmail excluido.
- Sincronización necesita app abierta y conexión para confirmar. Push a `int` no equivale a promoción ni valida producción.
- Restricciones técnicas, almacenamiento y seguridad en [AGENTS.md](../AGENTS.md), guía de usuario y checklist operativo.

## Estado actual y exclusiones

No hay nuevas entregas de producto autorizadas. La promoción a `main` y smoke del despliegue son acciones separadas; el usuario gestiona `main`. No inferir permiso de despliegue ni de acceso a datos a partir del cierre de ingeniería.

## Evidencia y trabajo previo

Las diez entregas recientes son `23n`–`23e` en [iteraciones](iterations.md) y [registro](iteration-log.md). Las decisiones y registros anteriores se conservan en el [archivo](archive/2026-10-24/README.md).
