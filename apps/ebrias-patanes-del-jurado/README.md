# Ebrias Patanes del Jurado

Landing instalable para el grupo de amigos. [Plan](plan/master.md) · [Iteraciones](plan/iterations.md) · [Registro](plan/iteration-log.md).

Desde la raíz: `bun install --frozen-lockfile` y `bun run dev --filter=@damaca/ebrias-patanes-del-jurado`. Abre http://localhost:3020.

Crea un `.env.local` en esta app a partir de `.env.example`. Usa un secreto de sesión propio, un cliente OAuth de Google y una URI del clúster MongoDB del Hub con un usuario limitado a la base de esta app. Autoriza en Google la URL exacta `<BETTER_AUTH_URL>/api/auth/callback/google`. En Vercel, configura las variables en el proyecto de esta app y usa su origen estable como `BETTER_AUTH_URL`.

La base se llama `ebrias-patanes-del-jurado-int` en la rama Vercel `int`, `ebrias-patanes-del-jurado-local` en desarrollo y `ebrias-patanes-del-jurado` en los demás builds. La app se instala desde el navegador como `ebrias-int` en `int` y `ebrias` en las demás ramas. Para probar el nombre de integración localmente, arranca con `VERCEL_GIT_COMMIT_REF=int`. La instalación requiere HTTPS fuera de localhost; la sesión requiere conexión.

La elección de disfraces usa como catálogo inicial los nombres de la sección [Characters & Pets de Harry Potter Fact Files](https://www.harrypotter.com/fact-file/characters-and-pets), más el Sombrero Seleccionador. Los nombres añadidos aparecen en el catálogo sin datos de reservas.

Para conceder el intento final a una cuenta que haya agotado los tres iniciales, ejecuta desde la raíz del repositorio, con las variables de conexión del entorno objetivo:

```sh
bun --conditions=react-server --env-file=/path/to/target.env apps/ebrias-patanes-del-jurado/scripts/grant-costume-attempt.ts participant@example.com
```

Para la base de integración, el entorno del comando debe incluir `VERCEL_GIT_COMMIT_REF=int` y `NODE_ENV=production`. Para la base local, usa `NODE_ENV=development`. El comando solo concede la prórroga y no lee ni imprime el personaje.

Configura `ALLOWED_EMAILS` con los correos de Google de los administradores separados por comas, en cada entorno antes de publicar el cambio. Los administradores pueden entrar directamente y admitir otros correos desde Ajustes. La admisión se guarda en la base de ese entorno y se exige también a las cuentas con sesiones anteriores.

### Letux cleanup

Run the legacy cleanup after switching the app to the new roster. Use the environment file for the intended database and set the app environment explicitly.

```sh
NODE_ENV=development bun --conditions=react-server --env-file=/path/to/local.env apps/ebrias-patanes-del-jurado/scripts/cleanup-letux-members.ts
```

Review the database name and counts, then append `--apply` to remove unlinked legacy Letux entries and move old costume ownership links. The roster starts empty. The old attendance collection can be removed independently. To clear the entire event later, remove the collections with the `261230-` prefix.

### Admission push notifications

Generate a VAPID key pair with the Web Push CLI. Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT` (a contact mailto URL) in the app environment before deploying. Administrators enable alerts on each device from Settings. On iPhone, open Ebrias from its Home Screen icon before enabling alerts.
