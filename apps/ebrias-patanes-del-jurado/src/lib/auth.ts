import "server-only"

import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { getAuthEnvironment } from "@/config/auth-env"
import { getDatabaseConnection } from "@/lib/database"

function createAuth() {
  const env = getAuthEnvironment()
  const { client, db } = getDatabaseConnection()

  return betterAuth({
    baseURL: env.baseURL,
    secret: env.secret,
    advanced: { cookiePrefix: "ebrias" },
    database: mongodbAdapter(db, { client }),
    socialProviders: {
      google: { clientId: env.clientId, clientSecret: env.clientSecret },
    },
    onAPIError: { errorURL: "/" },
  })
}

let auth: ReturnType<typeof createAuth> | undefined

export function getAuth() {
  auth ??= createAuth()
  return auth
}
