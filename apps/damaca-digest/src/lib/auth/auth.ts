import "server-only"

import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { getAuthEnv } from "@/config/env"

const authEnv = getAuthEnv()

export const auth = betterAuth({
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
