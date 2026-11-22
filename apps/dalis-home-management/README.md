# Dali Home Management

Dali is a private home-management application for Dani and Pali. It connects
the household inventory, shopping list, reusable dishes, and weekly meal plan
in one responsive interface.

## Current features

- Google sign-in restricted by an email allowlist.
- Household inventory with locations, quantities, search, and filters.
- Shared shopping list with inventory restocking.
- Reusable dish catalog with inventory-linked ingredients.
- Weekly lunch and dinner calendar with week navigation and copying.
- Shopping-list generation that aggregates recipe ingredients and subtracts
  current inventory.

## Stack

- Next.js 16 App Router and React 19
- TypeScript
- Better Auth with Google OAuth
- MongoDB native driver
- Zod validation
- Tailwind CSS and Biome
- Bun for scripts and tests

## Local setup

Requirements:

- Bun
- A MongoDB database
- Google OAuth credentials

Install dependencies:

```bash
bun install
```

Create an untracked `.env.local` file with the following values:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=dalis-home-management
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ALLOWED_EMAILS=dani@example.com,pali@example.com
```

`MONGODB_DB` and `BETTER_AUTH_URL` are optional locally. The database defaults
to `dalis-home-management`, and the auth URL defaults to
`http://localhost:3000`. Vercel deployment URLs are detected automatically.

Configure this local Google OAuth redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

Bootstrap the database indexes and start the application:

```bash
bun run db:ensure-indexes
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database indexes

MongoDB indexes are registered centrally in
`src/lib/db/ensure-indexes.ts`. The application ensures them once when the
database connection starts; `bun run db:ensure-indexes` is also available for
explicit deployment or maintenance setup.

Every feature that introduces a collection, query, sort, lookup, or uniqueness
constraint must evaluate its index requirements in the same change and add the
required specification to `ensure-indexes.ts`. Index behavior is covered by
`src/lib/db/ensure-indexes.test.ts`.

### Product catalog migration

After deploying the catalog-backed shopping-list and dish forms, migrate legacy
free-text references explicitly:

```bash
bun run db:migrate-product-catalog
```

The command is idempotent. It links exact normalized name-and-unit matches and
creates missing products with zero stock in the `other` location. It does not
change inventory quantities. Duplicate shopping-list lines are merged safely;
when their states differ, only the pending demand is preserved. Ambiguous
catalog matches and concurrent changes are reported with exit code `2` for
manual review.

## Architecture

```text
src/
├── app/                  # Routing, layouts, and route handlers only
├── components/           # Shared UI components
├── config/               # Typed environment and shared configuration
├── features/             # Domain components, actions, and client behavior
├── lib/auth/             # Server authentication
├── lib/db/               # MongoDB singleton, repositories, and indexes
└── schemas/              # Shared Zod schemas and runtime-agnostic types
```

Protected pages enforce the session in the dashboard layout. Server Actions
authenticate independently, validate external input with shared Zod schemas,
and keep MongoDB access behind server-only repository modules.

## Quality checks

Run the complete local validation set before committing:

```bash
bun run knip
bun run lint
bun run type-check
bun run test
bun run build
```

Useful development commands:

```bash
bun run test:watch
bun run lint:fix
bun run format
```

## Agent workflow

Follow the [root agent workflow](../../plan/workflow.md) and [app instructions](AGENTS.md). Product plans and delivery evidence live in this app's `plan/` directory.

## Conectar el menú a ChatGPT u otro agente

El servidor privado está en `/api/integrations/mcp`. Su herramienta `get_menu`
consulta la comida y la cena del menú compartido, con fechas de Europe/Madrid.
Puedes preguntar «¿Qué hay mañana?», «¿Cuál fue el menú de la semana pasada?»,
«¿Qué hay el miércoles que viene?» o «¿Qué hay el 15 de marzo?».

1. En el entorno HTTPS de `int`, establece `BETTER_AUTH_URL` al origen estable de la
   rama. Añade `<origen>/api/mcp-auth/callback/google` a los callbacks autorizados
   del cliente Google usado por Dalis Home. Conserva el callback de la web.
2. Configura `MCP_OAUTH_CLIENTS` en ese entorno como un array JSON de objetos
   `{"id":"dalis-home-int","secret":"<secreto-aleatorio-de-al-menos-32-caracteres>","redirectUri":"<URL-HTTPS-del-cliente>"}`.
   Usa el callback que indique ChatGPT o el cliente MCP. Para añadir otro cliente,
   asigna un ID y secreto propios y registra su callback exacto. Las credenciales
   se gestionan por entorno.
3. Registra el servidor como conector privado con OAuth en el cliente MCP.
   Usa el ID y secreto configurados, el permiso `menu:read` y `offline_access`
   si el cliente solicita renovación. Inicia sesión con una cuenta de
   `ALLOWED_EMAILS` y consiente el acceso al menú.

`MCP_OAUTH_CLIENTS` es opcional. El acceso MCP se habilita al configurarlo.
El inicio de sesión de conexión y sus datos OAuth son independientes de la
sesión web. El usuario debe poder abrir las páginas de conexión desde una red
que cumpla el filtro geográfico de Dalis Home.

La prueba aislada usa un contenedor desechable `mongo:8`, credenciales ficticias
y un cliente SDK. Desde la raíz, ejecuta
`bash apps/dalis-home-management/test/run-menu-mcp-http.sh`. La prueba con
Google y ChatGPT reales requiere configurar el entorno HTTPS con sus callbacks.
