# Card Wars

Marcador local para partidas presenciales de Card Wars entre dos jugadores. Las partidas y preferencias se guardan en IndexedDB en este dispositivo. Funciona sin cuenta y puede usarse offline; no hay sincronización ni copias automáticas.

## Desarrollo

Desde la raíz del monorepo:

```bash
bun install --frozen-lockfile
bun run dev --filter=@damaca/card-wars
bun run build --filter=@damaca/card-wars
bun run --filter=@damaca/card-wars start
```

La app exporta el sitio estático a `out/`. El comando `start` sirve esa exportación para la vista previa. En producción, el worker precarga el shell para navegación offline; el servidor de desarrollo no registra el worker.

## Partidas y copias

Se conservan las reglas y funciones descritas en [el plan de producto](plan/master.md). Las partidas registran el inicio UTC y lo muestran con la zona horaria del dispositivo. Las copias JSON exportadas e importadas conservan los datos y sus reglas de conflicto existentes.

Los registros pertenecen al origen, navegador, perfil y dispositivo. Exporta copias periódicas para conservarlas: el navegador puede borrar o desalojar sus datos.

## Validación y entrega

```bash
bun run type-check --filter=@damaca/card-wars
bun run test --filter=@damaca/card-wars
bun run build --filter=@damaca/card-wars
```

Verifica persistencia local y navegación offline en la vista previa. Registra por separado la inspección visual, instalación nativa y cualquier limitación del navegador.

Consulta [AGENTS.md](AGENTS.md), el [plan maestro](plan/master.md), las [iteraciones](plan/iterations.md), el [registro](plan/iteration-log.md) y el [workflow raíz](../../plan/workflow.md). La retirada del login y el retorno al modo offline se registran en [AGW-08 raíz](../../plan/iterations.md#agw-08--public-games-and-hub-managed-oidc-clients).
