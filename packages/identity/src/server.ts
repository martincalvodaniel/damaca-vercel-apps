import "server-only"

import { betterAuth } from "better-auth"
import { createAuthEndpoint } from "better-auth/api"
import { getAccountCookie } from "better-auth/cookies"
import { nextCookies } from "better-auth/next-js"
import { genericOAuth } from "better-auth/plugins"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import {
  checkHubAccess,
  type HubConfiguration,
  validateServiceUrl,
} from "./hub-client"

export interface ConsumerConfiguration extends HubConfiguration {
  baseUrl: string
  secret: string
}

export function createConsumerIdentity(configuration: ConsumerConfiguration) {
  validateServiceUrl(configuration.baseUrl)
  validateServiceUrl(configuration.hubUrl)
  if (
    configuration.secret.length < 32 ||
    configuration.clientSecret.length < 32 ||
    configuration.secret === configuration.clientSecret
  )
    throw new Error(
      "Independent session and Hub secrets of at least 32 characters are required"
    )
  const auth = betterAuth({
    baseURL: configuration.baseUrl,
    secret: configuration.secret,
    trustedOrigins: [configuration.baseUrl],
    disabledPaths: [
      "/get-access-token",
      "/refresh-token",
      "/account-info",
      "/link-social",
      "/unlink-account",
    ],
    advanced: { cookiePrefix: `damaca-${configuration.appId}` },
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
      encryptOAuthTokens: false,
    },
    user: {
      validateUserInfo: ({ user }) => {
        if (!user.emailVerified)
          return {
            error: "unverified_identity",
            errorDescription: "A verified identity is required",
          }
      },
    },
    plugins: [
      {
        id: "damaca-server-account",
        endpoints: {
          readHubAccount: createAuthEndpoint(
            "/damaca/read-account",
            {
              method: "GET",
              metadata: { SERVER_ONLY: true },
            },
            async (context) => getAccountCookie(context)
          ),
        },
      },
      genericOAuth({
        config: [
          {
            providerId: "damaca-hub",
            clientId: configuration.clientId,
            clientSecret: configuration.clientSecret,
            discoveryUrl: new URL(
              "/api/auth/.well-known/openid-configuration",
              configuration.hubUrl
            ).href,
            scopes: ["openid", "email", "profile", "offline_access"],
            pkce: true,
            requireIdTokenVerification: true,
            tokenEndpointAuth: { method: "client_secret_basic" },
            disableProviderLogout: true,
          },
        ],
      }),
      nextCookies(),
    ],
  })
  const getSession = cache(async () => {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user.emailVerified && session.user.email ? session : null
  })
  const getAccess = cache(async (canRefresh = false) => {
    const session = await getSession()
    if (!session) return "signed-out" as const
    try {
      const requestHeaders = await headers()
      const account = await auth.api.readHubAccount({ headers: requestHeaders })
      if (
        account?.providerId !== "damaca-hub" ||
        account.userId !== session.user.id ||
        !account.accessToken
      )
        return "denied" as const
      const expiresAt = account.accessTokenExpiresAt
        ? new Date(account.accessTokenExpiresAt).getTime()
        : 0
      if (!canRefresh && expiresAt - Date.now() < 5000)
        return "refresh-required" as const
      // Token rotation must run in a Route Handler so refreshed cookies reach the browser.
      const token = canRefresh
        ? await auth.api.getAccessToken({
            headers: requestHeaders,
            body: { useAccountCookie: true },
          })
        : account
      if (!token.accessToken) return "denied" as const
      return checkHubAccess(
        configuration,
        token.accessToken,
        session.user.email
      )
    } catch {
      return "unavailable" as const
    }
  })
  async function requireAccess() {
    const decision = await getAccess()
    if (decision === "signed-out") redirect("/auth/signin")
    if (decision === "refresh-required") redirect("/auth/refresh")
    if (decision !== "approved") redirect("/auth/access")
  }
  async function accessResponse() {
    const decision = await getAccess(true)
    return Response.json(
      { decision },
      {
        status:
          decision === "approved"
            ? 200
            : decision === "unavailable"
              ? 503
              : decision === "signed-out"
                ? 401
                : 403,
        headers: { "Cache-Control": "no-store", Vary: "Cookie" },
      }
    )
  }
  return { auth, getSession, getAccess, requireAccess, accessResponse }
}
