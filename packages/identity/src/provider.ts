import "server-only"

import { createHash } from "node:crypto"
import { oauthProvider } from "@better-auth/oauth-provider"
import { type BetterAuthOptions, betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { jwt } from "better-auth/plugins"
import { appIdSchema } from "./contract"
import { validateServiceUrl } from "./hub-client"

export interface HubOidcClient {
  appId: string
  clientId: string
  clientSecretHash: string
  redirectUri: string
  enabled: boolean
}

export function createHubIdentity(configuration: {
  baseUrl: string
  secret: string
  googleClientId: string
  googleClientSecret: string
  resolveClient: (clientId: string) => Promise<HubOidcClient | null>
  database: BetterAuthOptions["database"]
  isAllowed: (appId: string, email: string) => Promise<boolean>
}) {
  validateServiceUrl(configuration.baseUrl)
  const hashSecret = (value: string) =>
    createHash("sha256").update(value).digest("base64url")
  return betterAuth({
    baseURL: configuration.baseUrl,
    secret: configuration.secret,
    database: configuration.database,
    trustedOrigins: [configuration.baseUrl],
    advanced: { cookiePrefix: "damaca-hub" },
    disabledPaths: ["/token"],
    socialProviders: {
      google: {
        clientId: configuration.googleClientId,
        clientSecret: configuration.googleClientSecret,
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 7 * 24 * 60 * 60,
        strategy: "jwt",
        version: "hub-oidc-v1",
        refreshCache: true,
      },
    },
    account: { storeStateStrategy: "cookie", storeAccountCookie: true },
    user: {
      validateUserInfo: ({ user }) => {
        if (!user.emailVerified)
          return {
            error: "unverified_identity",
            errorDescription: "A verified Google identity is required",
          }
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!user.emailVerified) return false
          },
        },
      },
    },
    plugins: [
      jwt({
        jwks: {
          rotationInterval: 30 * 24 * 60 * 60,
          gracePeriod: 24 * 60 * 60,
        },
        jwt: { issuer: `${configuration.baseUrl}/api/auth` },
      }),
      oauthProvider({
        loginPage: "/auth/signin",
        consentPage: "/auth/consent",
        scopes: ["openid", "email", "profile", "offline_access"],
        grantTypes: ["authorization_code", "refresh_token"],
        codeExpiresIn: 60,
        accessTokenExpiresIn: 300,
        idTokenExpiresIn: 300,
        allowDynamicClientRegistration: false,
        allowUnauthenticatedClientRegistration: false,
        clientPrivileges: () => false,
        storeClientSecret: { hash: hashSecret },
        extensions: [
          {
            clientDiscovery: {
              id: "damaca-configured-clients",
              matches: () => true,
              resolve: async (_context, clientId) => {
                const client = await configuration.resolveClient(clientId)
                if (!client?.enabled) return null
                appIdSchema.parse(client.appId)
                return {
                  clientId: client.clientId,
                  clientSecret: client.clientSecretHash,
                  clientDiscoveryId: "damaca-configured-clients",
                  redirectUris: [client.redirectUri],
                  scopes: ["openid", "email", "profile", "offline_access"],
                  grantTypes: ["authorization_code", "refresh_token"],
                  responseTypes: ["code"],
                  applicationType: "web",
                  tokenEndpointAuthMethod: "client_secret_basic",
                  requirePKCE: true,
                  skipConsent: true,
                  enableEndSession: false,
                }
              },
            },
          },
        ],
        customUserInfoClaims: async ({ user, jwt: token }) => {
          let client: HubOidcClient | null = null
          let allowed = false
          let available = true
          try {
            client =
              typeof token.client_id === "string"
                ? await configuration.resolveClient(token.client_id)
                : null
            allowed = Boolean(
              client?.enabled &&
                user.emailVerified &&
                (await configuration.isAllowed(client.appId, user.email))
            )
          } catch {
            available = false
          }
          return {
            damaca_app_id: client?.appId ?? "unknown",
            damaca_access: allowed,
            damaca_authorization_available: available,
          }
        },
      }),
      nextCookies(),
    ],
  })
}
