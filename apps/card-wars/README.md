# Card Wars

Marcador local e instalable para partidas de Card Wars entre dos jugadores. Las partidas se guardan en IndexedDB en este dispositivo; no hay cuentas ni sincronización.

## Desarrollo

Desde la raíz del monorepo:

```bash
bun install --frozen-lockfile
bun run dev --filter=@damaca/card-wars
```

Para comprobar instalación y funcionamiento offline, genera y sirve la exportación estática:

```bash
bun run build --filter=@damaca/card-wars
bun run start --filter=@damaca/card-wars
```

Abre Ajustes y espera a que indique que está lista para usar sin conexión. La app necesita una primera carga online desde localhost o HTTPS para preparar el caché. La exportación se sirve en la raíz del origen.

## Partidas y copias

Cada partida empieza con 25 vidas por jugador. Los cambios se guardan al confirmar la operación; el historial permite revisar movimientos y deshacer el cambio más reciente. Al llegar a cero se puede confirmar al rival como ganador o seguir jugando. El historial conserva partidas terminadas y abandonadas.

La app guarda la hora de inicio como un instante UTC y la muestra con la zona horaria del dispositivo. En Ajustes puedes exportar todas las partidas a un JSON e importar una copia. La importación añade partidas nuevas, omite duplicados y conserva los datos locales si detecta un conflicto.

Los datos viven en el origen, perfil y dispositivo actuales. El navegador puede borrarlos o desalojarlos; exporta copias periódicas si quieres conservarlos. La app no ofrece sincronización ni copia automática.

## Organización y validación

```text
src/app/                 Rutas, metadata y tema visual
src/features/game/       Marcador, cambios de vida y reglas
src/features/history/    Historial de partidas
src/features/settings/   Instalación y copias
src/lib/storage/         IndexedDB y repositorios locales
src/schemas/             Contratos y validación de datos
plan/                    Alcance, iteraciones y evidencias
```

```bash
bun run lint --changed --since=HEAD
bun run type-check --filter=@damaca/card-wars
bun run test --filter=@damaca/card-wars
bun run build --filter=@damaca/card-wars
```

Consulta [AGENTS.md](AGENTS.md), el [plan maestro](plan/master.md), las [iteraciones](plan/iterations.md), el [registro](plan/iteration-log.md) y el [workflow raíz](../../plan/workflow.md) antes de hacer cambios.
