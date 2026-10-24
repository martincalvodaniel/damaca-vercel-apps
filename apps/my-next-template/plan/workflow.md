# Flujo local de My Next Template

El protocolo de ramas, planificación, capacidad, validación, commit y publicación está centralizado en el [flujo del monorepo](../../../plan/workflow.md).

## Restricciones del producto

- Mantener las fronteras server/client, Better Auth, acceso a MongoDB mediante singleton y validación compartida descritas en [AGENTS.md](../AGENTS.md) y las instrucciones anidadas.
- Aislar los recursos de pruebas integradas y no ejecutarlas contra cuentas, bases de datos o aplicaciones de usuario.
- Registrar evidencia de interacción, QA visual, OAuth real y despliegues por separado; una prueba unitaria no acredita esos recorridos.
