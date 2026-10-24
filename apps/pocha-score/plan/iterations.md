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
