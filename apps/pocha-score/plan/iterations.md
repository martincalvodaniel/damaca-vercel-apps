# Iteraciones de producto

Este archivo es la fuente única del estado de las iteraciones. Sigue el [workflow raíz](../../../plan/workflow.md).

## 01 — Definir producto

- Estado: `validated`.
- Objetivo: acordar usuarios, alcance, reglas y límites locales.
- Rutas: `plan/master.md`, `plan/iterations.md`, `plan/iteration-log.md`.
- Dependencias: petición y decisiones de la persona propietaria.
- Aceptación: alcance y decisiones vigentes quedan registrados en `master.md`.
- Validación: revisar consistencia y enlaces locales.
- Evidencia: [registro](iteration-log.md#01--definir-producto).

## 02 — Motor y persistencia

- Estado: `validated`.
- Objetivo: implementar dominio puro, esquemas, migración, repositorios y copias JSON.
- Rutas: `src/schemas/**`, `src/features/game/lib/**`, `src/lib/storage/**`.
- Dependencias: 01.
- Aceptación: reglas y secuencias calculadas correctamente; entradas/importaciones validadas; migración preserva preferencias; revisiones detectan conflictos; importación transaccional no sobrescribe.
- Validación: pruebas de dominio, almacenamiento, migración, copias y fallos.
- Evidencia: [registro](iteration-log.md#02--motor-y-persistencia).

## 03 — Experiencia de partida

- Estado: `validated`.
- Objetivo: sustituir el contenido inicial con configuración, marcador, clasificación, historial y ajustes en español.
- Rutas: `src/app/**`, `src/features/**`, `src/components/**`, `src/config/**`.
- Dependencias: 02.
- Aceptación: crear, reanudar, puntuar, editar y cerrar partidas; resolución de empates; autoguardado y errores recuperables; textos y accesibilidad en español.
- Validación: tipos, lint, pruebas de reglas y almacenamiento, e interacción responsive en navegador móvil y escritorio.
- Evidencia: [registro](iteration-log.md#03--experiencia-de-partida).

## 04 — Validar PWA y cerrar

- Estado: `in_progress`.
- Objetivo: corregir incidencias y verificar la experiencia estática y offline.
- Rutas: app y `plan/iteration-log.md`.
- Dependencias: 02 y 03.
- Aceptación: build estático operativo, persistencia y navegación tras recarga offline, actualización del worker conserva datos; diffs y restricciones revisados.
- Validación: checks del repositorio filtrados a `@damaca/pocha-score`, pruebas del navegador disponibles y `git diff --check`; registrar límites de QA.
- Evidencia parcial: [registro](iteration-log.md#04--validar-pwa-y-cerrar).

## 05 — Densidad móvil y valores iniciales

- Estado: `validated`.
- Objetivo: iniciar pedidas y conseguidas en cero y reducir de forma global los espacios de la interfaz.
- Rutas: `src/features/game/lib/**`, `src/features/home/components/**`, `src/features/settings/components/**`, `src/components/shared/**` y documentos de planificación.
- Dependencias: 03.
- Aceptación: rondas nuevas contienen ceros editables en ambos campos; márgenes, rellenos y separaciones son menores en todas las vistas; la interfaz conserva legibilidad, accesibilidad, operación táctil y ausencia de desbordamiento móvil.
- Validación: pruebas de reglas, tipos, tests, Biome, build estático, navegador móvil/escritorio y `git diff --check`.
- Evidencia: [registro](iteration-log.md#05--densidad-móvil-y-valores-iniciales).

## 06 — Hora de inicio y copias

- Estado: `validated`.
- Objetivo: guardar el inicio como instante UTC y exponerlo en listas e importación/exportación.
- Rutas: `src/schemas/game.ts`, `src/lib/storage/**`, `src/features/home/components/**` y documentos de planificación.
- Dependencias: 02 y 03.
- Aceptación: partidas nuevas tienen `startedAt` UTC; listas activas e historial lo muestran con la zona local; JSON exportado incluye el instante; importaciones conservan el inicio original; registros y copias anteriores sin `startedAt` usan su `createdAt` existente como valor de compatibilidad.
- Validación: pruebas de formato/compatibilidad e importación, tipos, Biome, build estático, revisión del formato local y `git diff --check`.
- Evidencia: [registro](iteration-log.md#06--hora-de-inicio-y-copias).

## Integración transversal de identidad

La entrega de login obligatorio y autorización Hub se sigue exclusivamente en [AGW-05 raíz](../../../plan/iterations.md#agw-05--google-identity-and-hub-access-shared-package).
