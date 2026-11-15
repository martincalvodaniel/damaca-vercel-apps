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

import { getAccessRole } from "@/lib/auth/access"
import { createDigestOAuthProvider } from "@/lib/auth/chatgpt-oauth"
import { getMcpUrls } from "@/lib/auth/mcp-config"
import { createAuthAdapter } from "@/lib/db/auth-adapter"

const authEnv = getAuthEnv()

export const auth = betterAuth({
  appName: "damaca-digest",
  database: createAuthAdapter(),
  disabledPaths: ["/token"],
  baseURL: authEnv.baseUrl,
  secret: authEnv.secret,
  trustedOrigins: [authEnv.baseUrl],
  socialProviders: {
    google: {
      clientId: authEnv.googleClientId,
      clientSecret: authEnv.googleClientSecret,
    },
  },
  hooks: {
    before: createAuthMiddleware(async (context) => {
      if (
        context.path !== "/oauth2/authorize" &&
        context.path !== "/oauth2/consent" &&
        context.path !== "/oauth2/continue"
      )
        return
      const session = await getSessionFromCtx(context)
      if (
        session &&
        (!session.user.emailVerified ||
          !(await getAccessRole(session.user.email)))
      ) {
        throw new APIError("FORBIDDEN", {
          message: "Digest access is required.",
        })
      }
    }),
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
  plugins: [
    jwt({
      jwt: { issuer: getMcpUrls().issuer },
      disableSettingJwtHeader: true,
    }),
    createDigestOAuthProvider(),
    nextCookies(),
  ],
})
