import "server-only"

import { createHash } from "node:crypto"
import { oauthProvider } from "@better-auth/oauth-provider"
import { type BetterAuthOptions, betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { jwt } from "better-auth/plugins"
import { validateServiceUrl } from "./hub-client"
import { type OidcClient, oidcClientsSchema } from "./registry"

export function createHubIdentity(configuration: {
  baseUrl: string
  secret: string
  googleClientId: string
  googleClientSecret: string
  clients: OidcClient[]
  database: BetterAuthOptions["database"]
  isAllowed: (appId: string, email: string) => Promise<boolean>
}) {
  validateServiceUrl(configuration.baseUrl)
  const clients = oidcClientsSchema.parse(configuration.clients)
  if (clients.some((client) => client.clientSecret === configuration.secret))
    throw new Error("Hub session and client secrets must be independent")
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
              matches: (clientId) =>
                clients.some((client) => client.clientId === clientId),
              resolve: async (_context, clientId) => {
                const client = clients.find(
                  (entry) => entry.clientId === clientId
                )
                if (!client) return null
                return {
                  clientId: client.clientId,
                  clientSecret: hashSecret(client.clientSecret),
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
          const client = clients.find(
            (entry) => entry.clientId === token.client_id
          )
          let allowed = false
          let available = true
          try {
            allowed = Boolean(
              client &&
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
