import "server-only"

import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { nextCookies } from "better-auth/next-js"
import { getAuthEnv } from "@/config/env"
import { getDatabase } from "./database"

function createAuth() {
  const { baseURL, secret, clientId, clientSecret } = getAuthEnv()
  const { client, database } = getDatabase()

  return betterAuth({
    appName: "damaca-pocs",
    baseURL,
    secret,
    database: mongodbAdapter(database, { client }),
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
