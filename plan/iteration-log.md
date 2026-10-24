# Registro de entregas transversales

Los hechos de publicación se verifican en Git. El estado normativo está en [iterations.md](iterations.md); este registro conserva evidencia, límites e incidentes observados.

<a id="agw-01-centralizar-el-flujo-y-el-contrato-documental"></a>
## AGW-01 — Centralizar el flujo y el contrato documental

- Cambios: contrato de planificación añadido a las instrucciones raíz; responsabilidades y retención documental incorporadas al workflow; cinco workflows locales retirados; instrucciones de planificación redundantes consolidadas; documentos extensos archivados bajo `plan/archive/2026-10-24/` en cada ámbito afectado; las apps conservan sus límites de producto en sus instrucciones.
- Evidencia: el commit `5800b12d0f9b8183fba89cec97e30c5fc05fa254` está en `int` y `origin/int` (comprobación al iniciar esta entrega).
- Validación: los enlaces Markdown locales y anclas resuelven; las cinco apps contienen los tres documentos y no conservan workflow local; `bun run lint` pasa para los 1929 archivos (726 warnings y 2112 infos existentes; los archivos de aplicación con esos diagnósticos no se modificaron); los documentos Markdown editados pasan Biome y `git diff --check` queda limpio. Revisión manual confirma que solo `iterations.md` contiene estados y que el log mantiene las diez evidencias recientes de Dalis Tasks & Events; los archivos anteriores están indexados en sus archivos fechados.
- Límites: solo documentación; no se modifican CI, generadores ni aplicaciones.
