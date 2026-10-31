# Dalis Home Management — plan maestro

## Estado vigente

Los platos admiten una receta u observaciones opcionales como texto libre de hasta 10.000 caracteres. Se pueden añadir, editar, borrar y consultar desde el recetario y el menú semanal, conservando saltos de línea. Los platos existentes sin notas siguen siendo válidos; no se requiere migración.

## Límites aceptados

Conservar el comportamiento, arquitectura, seguridad, datos y límites de despliegue documentados en [AGENTS.md](../AGENTS.md). El [workflow común](../../../plan/workflow.md) define el proceso de entrega y el contrato documental.

## Dudas abiertas

No hay dudas abiertas para el alcance actual.

## Application icons

Browser and home-screen icons use local SVG sources, a 16/32/48-pixel ICO fallback, installation PNGs and an Apple Touch Icon. Existing PWA manifests also declare an opaque maskable variant. Regenerate with `bun run icons:generate` from the repository root. Shared status and evidence: [AGW-10](../../../plan/iterations.md#agw-10--application-favicons) and [delivery log](../../../plan/iteration-log.md#agw-10-application-favicons).
