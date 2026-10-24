# Plan maestro

## Estado vigente

Plantilla técnica reusable sin producto de negocio definido. Incluye Google OAuth verificado, administración por `ALLOWED_EMAILS`, concesiones y solicitudes persistidas en MongoDB y UI en inglés. No hay adaptador de persistencia de sesión. El inventario actual está en [README](../README.md); las fronteras técnicas en [AGENTS.md](../AGENTS.md).

## Decisiones aceptadas

- No inferir producto, roadmap, infraestructura ni permisos por el historial Git o apps vecinas.
- Mantener Next.js 16, React 19, TypeScript, Better Auth, driver Mongo nativo, Zod, SWR, Tailwind y Bun; cambios de stack requieren autorización según `AGENTS.md`.
- La definición del producto derivado sigue pendiente: nombre, problema, MVP, éxito, exclusiones, modelo de dominio y despliegue. Idioma actual inglés; acceso técnico base Google/Mongo.
- `vercel.ts` declara configuración para ES/París; no acredita despliegue efectivo.

## Próxima decisión

La iteración `01` define un producto real a partir de una petición humana. No iniciar funcionalidad de ejemplo ni aprovisionar servicios sin alcance. Entregas históricas accesibles en [archivo](archive/2026-10-24/README.md).
