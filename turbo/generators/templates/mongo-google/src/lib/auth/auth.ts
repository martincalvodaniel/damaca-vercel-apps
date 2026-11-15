import "server-only"

import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { getAuthEnv } from "@/config/env"

async function createAuth() {
  const authEnv = getAuthEnv()
  // If authentication persists to MongoDB, acquire the connected database here.
  const auth = betterAuth({
    baseURL: authEnv.baseUrl,
    secret: authEnv.secret,
    trustedOrigins: [authEnv.baseUrl],
    socialProviders: {
      google: {
        clientId: authEnv.googleClientId,
        clientSecret: authEnv.googleClientSecret,
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 7 * 24 * 60 * 60,
        strategy: "jwt",
        refreshCache: true,
      },
    },
    account: {
      storeStateStrategy: "cookie",
      storeAccountCookie: true,
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            // Verified identity may request access; application authorization is separate.
            if (!user.emailVerified) {
              return false
            }
          },
        },
      },
    },
    plugins: [nextCookies()],
  })
  await auth.$context
  return auth
}

let authPromise: ReturnType<typeof createAuth> | undefined

export function getAuth() {
  authPromise ??= createAuth().catch((error: unknown) => {
    authPromise = undefined
    console.error(
      "Authentication initialization failed",
      error instanceof Error ? error.name : "Unknown error"
    )
    throw error
  })
  return authPromise
}
