import "server-only"

import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { getAuthEnv } from "@/config/env"
import { getAuthDatabaseAdapter } from "@/lib/db/auth-adapter"
import { COLLECTION_NAMES } from "@/lib/db/collections"

function createAuth(
  database: Awaited<ReturnType<typeof getAuthDatabaseAdapter>>
) {
  const env = getAuthEnv()
  return betterAuth({
    baseURL: env.baseUrl,
    secret: env.secret,
    trustedOrigins: [env.baseUrl],
    database,
    socialProviders: {
      google: {
        clientId: env.googleClientId,
        clientSecret: env.googleClientSecret,
      },
    },
    user: { modelName: COLLECTION_NAMES.authUsers },
    session: { modelName: COLLECTION_NAMES.authSessions },
    account: {
      modelName: COLLECTION_NAMES.authAccounts,
      accountLinking: { enabled: false },
    },
    verification: { modelName: COLLECTION_NAMES.authVerifications },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!user.emailVerified) return false
          },
        },
      },
    },
    plugins: [nextCookies()],
  })
}

let authPromise: Promise<ReturnType<typeof createAuth>> | undefined

export function getAuth() {
  authPromise ??= getAuthDatabaseAdapter()
    .then(createAuth)
    .catch((error: unknown) => {
      authPromise = undefined
      throw error
    })
  return authPromise
}
