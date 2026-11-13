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

El servidor local usa Node.js en el puerto 3007. Bun gestiona las dependencias y ejecuta los comandos del monorepo. Las pruebas de integración `src/lib/db/user-access.integration.ts` y `test/access-http.ts` se ejecutan desde la raíz con `bun --no-env-file --conditions=react-server run` y la ruta del script. Usan un MongoDB desechable en loopback y una base nueva `template_access_test_<identificador>` por ejecución. Para la prueba HTTP, configura también el servidor de prueba con el mismo entorno, un origen `http://127.0.0.1:<puerto>` y el administrador ficticio `admin@example.com`.

## Consulta sin conexión

En **Settings**, abre **Vault security**, desbloquea la caja y activa **Enable offline access** en un navegador de confianza. Espera a que aparezcan la última sincronización y el vencimiento. Al volver a abrir la URL sin red, puedes desbloquear con la contraseña maestra para buscar, ver y copiar credenciales de la última copia sincronizada.

El navegador conserva la copia cifrada en IndexedDB. La interfaz sin conexión se prepara en builds de producción. `OFFLINE_VAULT_HOURS` cambia la vigencia de las nuevas copias, con 24 horas por defecto. Las escrituras, passkeys y recuperación requieren conexión. Desactivar el acceso o cerrar sesión borra la copia. Una revocación remota se aplica cuando se comprueba la conexión, o cuando vence el plazo local si el navegador sigue desconectado.

## Preproducción

El [proyecto de Vercel](https://vercel.com/martincalvodaniels-projects/damaca-secrets) está vinculado al monorepo con directorio raíz `apps/damaca-secrets`. Vercel ha verificado el dominio `damaca-secrets-int.vercel.app` para la rama `int`. Preview ya tiene `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` y `MONGODB_DB=damaca-secrets-preview` para esa rama. La [configuración de Vercel](vercel.ts) restringe el tráfico a España.

Para habilitar la primera preproducción, introduce estos valores en las [variables de Vercel](https://vercel.com/martincalvodaniels-projects/damaca-secrets/settings/environment-variables), en Preview para `int`:
1. `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` de un cliente OAuth web dedicado. Registra `https://damaca-secrets-int.vercel.app` como origen y `https://damaca-secrets-int.vercel.app/api/auth/callback/google` como URI de retorno. Añade las cuentas de prueba si la aplicación OAuth está en modo de pruebas.
2. `MONGODB_URI` con un usuario de MongoDB con acceso a `damaca-secrets-preview` y conectividad desde Vercel.
3. `ALLOWED_EMAILS` con los correos de los administradores iniciales, separados por comas.

Después, despliega manualmente el SHA validado de `origin/int` mediante el [flujo de Vercel del monorepo](../../.agents/skills/vercel-deploy-alias/SKILL.md) y comprueba el dominio de Preview. Utiliza credenciales ficticias para verificar Google, la aprobación desde una segunda cuenta, el guardado en la caja y la revocación. En Chrome para Android, registra una passkey compatible con PRF, bloquea y vuelve a abrir la caja. Activa la consulta offline, cierra la app y repite la apertura en modo avión con la contraseña maestra. Anota los resultados en el [registro de validación](plan/iteration-log.md).
