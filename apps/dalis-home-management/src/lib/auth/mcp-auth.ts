import "server-only"

import { betterAuth } from "better-auth"
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api"
import { nextCookies } from "better-auth/next-js"
import { jwt } from "better-auth/plugins"
import { getAuthEnv } from "@/config/env"
import { isEmailAllowed, parseAllowedEmails } from "@/lib/auth/allowed-emails"
import { getMcpClients, getMcpUrls } from "@/lib/auth/mcp-config"
import { createMenuOAuthProvider } from "@/lib/auth/mcp-oauth"
import { mcpAuthPath } from "@/lib/auth/mcp-paths"
import { COLLECTION_NAMES } from "@/lib/db/collections"
import { createMcpAuthAdapter } from "@/lib/db/mcp-auth-adapter"

export function hasMcpAccess(user: { email: string; emailVerified: boolean }) {
  return (
    user.emailVerified &&
    isEmailAllowed(user.email, parseAllowedEmails(getAuthEnv().allowedEmails))
  )
}

async function createMcpAuth(clients: ReturnType<typeof getMcpClients>) {
  const env = getAuthEnv()
  const { issuer, origin } = getMcpUrls()
  return betterAuth({
    appName: "dalis-home-mcp",
    database: await createMcpAuthAdapter(),
    disabledPaths: ["/token"],
    baseURL: origin,
    basePath: mcpAuthPath,
    secret: env.secret,
    trustedOrigins: [origin],
    advanced: { cookiePrefix: "dalis-home-mcp" },
    user: { modelName: COLLECTION_NAMES.mcpUser },
    session: { modelName: COLLECTION_NAMES.mcpSession },
    account: { modelName: COLLECTION_NAMES.mcpAccount },
    verification: { modelName: COLLECTION_NAMES.mcpVerification },
    socialProviders: {
      google: {
        clientId: env.googleClientId,
        clientSecret: env.googleClientSecret,
      },
    },
    hooks: {
      before: createAuthMiddleware(async (context) => {
        if (
          ![
            "/oauth2/authorize",
            "/oauth2/consent",
            "/oauth2/continue",
          ].includes(context.path)
        )
          return
        const session = await getSessionFromCtx(context)
        if (session && !hasMcpAccess(session.user)) {
          throw new APIError("FORBIDDEN", {
            message: "Dalis Home access is required.",
          })
        }
      }),
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => (hasMcpAccess(user) ? undefined : false),
        },
      },
    },
    plugins: [
      jwt({
        jwt: { issuer },
        disableSettingJwtHeader: true,
        schema: { jwks: { modelName: COLLECTION_NAMES.mcpJwks } },
      }),
      createMenuOAuthProvider(clients),
      nextCookies(),
    ],
  })
}

let authPromise: ReturnType<typeof createMcpAuth> | undefined

export async function getMcpAuth() {
  const clients = getMcpClients()
  if (clients.length === 0) throw new Error("MCP OAuth is not configured")
  authPromise ??= createMcpAuth(clients).catch((error: unknown) => {
    authPromise = undefined
    throw error
  })
  return authPromise
}
