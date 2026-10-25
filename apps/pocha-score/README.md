# Pocha Score

Marcador para partidas presenciales de pocha entre 3 y 6 jugadores. Las partidas y preferencias se guardan en IndexedDB en este dispositivo. El acceso requiere Google a través de Damaca Hub y un permiso vigente para esta aplicación; no hay sincronización ni copias automáticas.

## Identidad y desarrollo

Configura `.env.local` usando [el ejemplo de esta app](.env.example) y registra su cliente/callback en Hub siguiendo [la integración compartida](../../packages/identity/README.md). Las credenciales de Google se configuran únicamente en el Hub. Usa secretos independientes por app y entorno.

Desde la raíz del monorepo:

```bash
bun install --frozen-lockfile
bun run dev --filter=@damaca/pocha-score
bun run build --filter=@damaca/pocha-score
bun run --filter=@damaca/pocha-score start
```

La app requiere servidor Next.js; ya no publica `out/`. Se conserva la instalación PWA, con conexión obligatoria para validar sesión y permiso. El worker nuevo retira las cachés antiguas sin borrar IndexedDB. Una copia offline previa necesita reconectar y recargar para recibir este cambio. El servidor de desarrollo no registra el worker.

## Partidas y copias

Se conservan las reglas y funciones descritas en [el plan de producto](plan/master.md). Las partidas registran el inicio UTC y lo muestran con la zona horaria del dispositivo. Las copias JSON exportadas e importadas conservan los datos y sus reglas de conflicto existentes.

Los registros pertenecen al origen, navegador, perfil y dispositivo; se comparten entre las cuentas autorizadas que usan ese navegador. El login no los cifra, separa ni respalda. Cerrar sesión no elimina partidas. Exporta copias periódicas para conservarlas: el navegador puede borrar o desalojar sus datos.

## Validación y entrega

```bash
bun run type-check --filter=@damaca/pocha-score
bun run test --filter=@damaca/pocha-score
bun run build --filter=@damaca/pocha-score
```

Verifica login, falta de permiso, revocación, pérdida de conexión y recuperación; registra por separado Google real, MongoDB, navegador y dispositivo nativo. La configuración Vercel conserva la raíz de app, región `cdg1` y restricción de navegación desde España. La política geográfica no cifra ni elimina los datos ya guardados en un dispositivo.

Consulta [AGENTS.md](AGENTS.md), el [plan maestro](plan/master.md), las [iteraciones](plan/iterations.md), el [registro](plan/iteration-log.md) y el [workflow raíz](../../plan/workflow.md). La entrega de identidad se registra en [AGW-05 raíz](../../plan/iterations.md#agw-05--google-identity-and-hub-access-shared-package).
