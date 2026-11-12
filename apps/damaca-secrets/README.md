# Damaca Secrets

Aplicación privada para gestionar credenciales personales. Usa Google mediante Better Auth, MongoDB y el panel de aprobación del monorepo. Consulta el [plan de producto](plan/master.md), las [iteraciones](plan/iterations.md) y el [registro de validación](plan/iteration-log.md).

## Desarrollo

Desde la raíz, instala dependencias con `bun install --frozen-lockfile`. Copia [el ejemplo de entorno](.env.example) a un archivo `.env.local` dentro de la app y configura las credenciales localmente.
- **Google**. Configura un cliente OAuth web con origen `http://localhost:3007` y retorno `http://localhost:3007/api/auth/callback/google`.
- **Better Auth**. Usa un secreto exclusivo de la app y establece `BETTER_AUTH_URL` en el origen usado por el navegador.
- **MongoDB**. Configura `MONGODB_URI` y una base `MONGODB_DB` exclusiva del entorno. Better Auth guarda identidades, sesiones, cuentas y verificaciones en colecciones propias. La aplicación guarda solicitudes y permisos en `user_access`.
- **Administración**. Indica en `ALLOWED_EMAILS` los correos de Google autorizados como administradores. El resto puede solicitar acceso. Los administradores revisan solicitudes, conceden y revocan permisos desde Settings.

```bash
bun run dev --filter=@damaca/damaca-secrets
bun run type-check --filter=@damaca/damaca-secrets
bun run test --filter=@damaca/damaca-secrets
bun run build --filter=@damaca/damaca-secrets
```

El servidor local usa el puerto 3007. Las pruebas de integración `src/lib/db/user-access.integration.ts` y `test/access-http.ts` se ejecutan desde la raíz con `bun --no-env-file --conditions=react-server run` y la ruta del script. Usan un MongoDB desechable en loopback y una base nueva `template_access_test_<identificador>` por ejecución. Para la prueba HTTP, configura también el servidor de prueba con el mismo entorno, un origen `http://127.0.0.1:<puerto>` y el administrador ficticio `admin@example.com`.

## Preproducción

Usa un proyecto Vercel con directorio raíz `apps/damaca-secrets` y despliegue manual de `int`. La [configuración de Vercel](vercel.ts) restringe el tráfico a España. El origen HTTPS estable debe coincidir con `BETTER_AUTH_URL` y con el retorno `/api/auth/callback/google` del cliente OAuth exclusivo de preproducción. Configura un MongoDB aislado, un secreto de Better Auth y los correos de prueba en el entorno Preview.
