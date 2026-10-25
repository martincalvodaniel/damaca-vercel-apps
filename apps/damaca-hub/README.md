# Damaca Hub

Directorio de las aplicaciones web de Damaca y centro de gestión de sus permisos. Cualquier identidad Google verificada puede consultar el catálogo y pedir acceso por aplicación. Las cuentas incluidas en `ALLOWED_EMAILS` pueden administrar el catálogo, las solicitudes y los permisos.

## Desarrollo local

Usa Bun 1.4.4 y ejecuta los comandos desde la raíz del monorepo:

```sh
bun install --frozen-lockfile
cp apps/damaca-hub/.env.example apps/damaca-hub/.env.local
bun run dev --filter=@damaca/damaca-hub
```

La app se sirve en `http://localhost:3005`. Configura credenciales Google OAuth, un secreto Better Auth propio y una base MongoDB independiente en `apps/damaca-hub/.env.local`. La misma configuración se necesita durante el build; `.env.example` solo contiene valores de ejemplo.

| Variable                                    | Uso                                               |
| ------------------------------------------- | ------------------------------------------------- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Cliente OAuth web de Google                       |
| `BETTER_AUTH_SECRET`                        | Secreto de sesión exclusivo de Hub                |
| `BETTER_AUTH_URL`                           | URL base de Hub; en local `http://localhost:3005` |
| `ALLOWED_EMAILS`                            | Administradores, separados por comas              |
| `MONGODB_URI`                               | Conexión MongoDB de esta app y este entorno       |
| `MONGODB_DB`                                | Base aislada; por defecto `damaca-hub`            |

Configura en Google el origen `http://localhost:3005` y el callback `http://localhost:3005/api/auth/callback/google`. Cada entorno desplegado necesita sus propios valores OAuth y MongoDB.

## Datos y permisos

- `applications` contiene el catálogo. Las cinco aplicaciones actuales se precargan de forma idempotente, sin reemplazar cambios administrativos. Los enlaces empiezan vacíos porque no se conocen sus dominios.
- `app_access` contiene una única solicitud o permiso por combinación de identificador de aplicación y correo normalizado. Las decisiones guardan el UUID de solicitud, las fechas y el administrador que las realizó.
- Los permisos son independientes por app y sirven para producción y preproducción. Los enlaces de producción se muestran a cualquier identidad autenticada; los de preproducción, solo a administradores o usuarios con permiso vigente.
- Revocar acceso conserva el registro con estado `revoked`; una nueva solicitud obtiene un UUID distinto. Las decisiones administrativas condicionales descartan IDs obsoletos.
- Una app desactivada deja de mostrarse en el catálogo, pero mantiene su catálogo, solicitudes y permisos. La administración requiere una identidad verificada incluida en `ALLOWED_EMAILS`.
- Si MongoDB falla, la interfaz presenta un error recuperable y no concede acceso por defecto.

Las apps aún no están conectadas a Hub: sus controles actuales de inicio de sesión no cambian en esta entrega. El diseño futuro está en [docs/access-integration.md](docs/access-integration.md); no comparte cookies ni secretos de sesión.

## Comprobaciones

```sh
bun run lint --changed --since=<base>
bun run type-check --filter=@damaca/damaca-hub
bun run test --filter=@damaca/damaca-hub
bun run build --filter=@damaca/damaca-hub
```

La suite automatizada no demuestra un login real con Google. La integración Mongo requiere un servidor local y `MONGODB_DB` con formato `damaca_hub_test_<8 caracteres hexadecimales>`; el script se niega a continuar si el nombre no cumple ese formato o la base no está vacía. Se elimina únicamente esa base después de la prueba. Ejecuta `bun run --cwd apps/damaca-hub test:integration` con `MONGODB_URI` en loopback y un nombre desechable. Ejecuta `bun run --cwd apps/damaca-hub db:ensure-indexes` para aplicar índices en otra base configurada; comprueba siempre el destino.

## Plan

El alcance y las iteraciones de producto están en [plan/master.md](plan/master.md) y [plan/iterations.md](plan/iterations.md). El protocolo común se mantiene en [el workflow raíz](../../plan/workflow.md).
