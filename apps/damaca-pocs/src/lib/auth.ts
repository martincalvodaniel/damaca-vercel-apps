import "server-only"

import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { nextCookies } from "better-auth/next-js"
import { MongoClient } from "mongodb"
import { getAuthEnv } from "@/config/env"

function createAuth() {
  const { baseURL, secret, clientId, clientSecret, mongoUri, mongoDatabase } =
    getAuthEnv()
  const client = new MongoClient(mongoUri)

  return betterAuth({
    appName: "damaca-pocs",
    baseURL,
    secret,
    database: mongodbAdapter(client.db(mongoDatabase), { client }),
    advanced: { cookiePrefix: "damaca-pocs" },
    socialProviders: { google: { clientId, clientSecret } },
    plugins: [nextCookies()],
  })
}

let auth: ReturnType<typeof createAuth> | undefined

export function getAuth() {
  auth ??= createAuth()
  return auth
}
