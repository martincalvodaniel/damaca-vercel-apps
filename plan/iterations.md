# Iteraciones transversales

Este archivo es la única fuente de estado de cada iteración transversal. `validated` indica que se cumplieron los criterios documentados; publicación y SHA se verifican en Git y se evidencian en el registro.

## AGW-01 — Centralizar el flujo y el contrato documental

- Estado: `validated`.
- Objetivo: centralizar el protocolo en la raíz, separar funciones de los tres documentos, reducir duplicación local y exigir el sistema a toda app actual y futura.
- Rutas: instrucciones raíz y de apps, `plan/**`, README y enlaces afectados.
- Dependencias: autorización del usuario en esta conversación.
- Aceptación: funciones documentales no duplicadas; workflows locales retirados; archivo histórico conservado donde había volumen; nueva app obligada a incluir estructura antes de trabajo no trivial; sin CI ni generador.
- Validación prevista: enlaces, coherencia, conservación del archivo, `git diff --check`.
- Evidencia: [iteration-log.md#AGW-01](iteration-log.md#agw-01-centralizar-el-flujo-y-el-contrato-documental).

## AGW-02 — Generación de apps con Turborepo

- Estado: `validated`.
- Objetivo: generar apps Next.js independientes en modo `mongo-google` o `local-pwa`, conservando las capacidades y límites de sus bases actuales.
- Rutas: `turbo/generators/**`, manifiesto raíz, lockfile Bun, `README.md`, CI y planificación raíz.
- Dependencias: AGW-01 y autorización explícita en esta conversación.
- Aceptación: comando interactivo y por argumentos; validaciones impiden colisiones antes de escribir; ambos scaffolds tienen identidad, puerto, instrucciones y planes propios; conservan auth/Mongo o PWA/IndexedDB respectivamente; no hay secretos ni configuración Vercel local.
- Validación: generación interactiva y aislada con argumentos; errores para slug/nombre/puerto/directorio inválidos; lint, tipos y pruebas de cada app; build de producción de ambos modos; recarga offline de la PWA; enlaces y `git diff --check`.
- Siguiente corte: AGW-03 retira los workspaces de plantilla tras validar sus sustitutos y actualiza inventario y lockfile.
- Evidencia: [iteration-log.md#AGW-02](iteration-log.md#agw-02-generación-de-apps-con-turborepo).

## AGW-03 — Retirar workspaces de plantilla

- Estado: `pending`.
- Objetivo: retirar `apps/my-next-template` y `apps/my-next-local-template` una vez que sus bases externas generen apps verificables.
- Rutas: los dos workspaces de plantilla, `README.md`, `plan/master.md`, `package.json` y `bun.lock`.
- Dependencias: AGW-02 validada.
- Aceptación: `apps/*` ya no contiene esos workspaces; README, inventario raíz y lockfile reflejan solo apps activas; ambos modos siguen generándose; ninguna dependencia de las apps activas queda rota.
- Validación: instalación Bun reproducible; pruebas del generador; lint, type-check y pruebas de todas las apps activas; enlaces y `git diff --check`.
