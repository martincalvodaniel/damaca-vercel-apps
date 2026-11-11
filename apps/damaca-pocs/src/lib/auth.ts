import "server-only"

import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { nextCookies } from "better-auth/next-js"
import { jwt } from "better-auth/plugins"
import { getAuthEnv } from "@/config/env"
import { getMcpUrls } from "./chatgpt-config"
import { createCaptureOAuthProvider } from "./chatgpt-oauth"
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
    disabledPaths: ["/token"],
    plugins: [
      jwt({
        jwt: { issuer: getMcpUrls().issuer },
        disableSettingJwtHeader: true,
      }),
      createCaptureOAuthProvider(),
      nextCookies(),
    ],
  })
}

let auth: ReturnType<typeof createAuth> | undefined

export function getAuth() {
  auth ??= createAuth()
  return auth
}
