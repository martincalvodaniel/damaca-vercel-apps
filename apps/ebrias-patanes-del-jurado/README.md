# Ebrias Patanes del Jurado

Landing instalable para el grupo de amigos. [Plan](plan/master.md) · [Iteraciones](plan/iterations.md) · [Registro](plan/iteration-log.md).

Desde la raíz: `bun install --frozen-lockfile` y `bun run dev --filter=@damaca/ebrias-patanes-del-jurado`. Abre http://localhost:3020.

Crea un `.env.local` en esta app a partir de `.env.example`. Usa un secreto de sesión propio, un cliente OAuth de Google y una URI del clúster MongoDB del Hub con un usuario limitado a la base de esta app. Autoriza en Google la URL exacta `<BETTER_AUTH_URL>/api/auth/callback/google`. En Vercel, configura las variables en el proyecto de esta app y usa su origen estable como `BETTER_AUTH_URL`.

La base se llama `ebrias-patanes-del-jurado-int` en la rama Vercel `int`, `ebrias-patanes-del-jurado-local` en desarrollo y `ebrias-patanes-del-jurado` en los demás builds. La app se instala desde el navegador como `ebrias-int` en `int` y `ebrias` en las demás ramas. Para probar el nombre de integración localmente, arranca con `VERCEL_GIT_COMMIT_REF=int`. La instalación requiere HTTPS fuera de localhost; la sesión requiere conexión.
