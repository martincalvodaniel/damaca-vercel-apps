import "server-only"

import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"
import { getAuthEnvironment } from "@/config/auth-env"

function createAuth() {
  const env = getAuthEnvironment()
  const client = new MongoClient(env.mongoUri, {
    serverSelectionTimeoutMS: 5000,
  })

  return betterAuth({
    baseURL: env.baseURL,
    secret: env.secret,
    advanced: { cookiePrefix: "ebrias" },
    database: mongodbAdapter(client.db(env.databaseName), { client }),
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
