import "server-only"

import { betterAuth } from "better-auth"
import { createAuthEndpoint } from "better-auth/api"
import { getAccountCookie } from "better-auth/cookies"
import { nextCookies } from "better-auth/next-js"
import { genericOAuth } from "better-auth/plugins"
import type { DBAdapterInstance } from "better-auth/types"
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
  database?: DBAdapterInstance
  cookiePrefix?: string
  modelNames?: Partial<{
    user: string
    account: string
    session: string
    verification: string
  }>
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
    database: configuration.database,
    user: {
      modelName: configuration.modelNames?.user,
      validateUserInfo: ({ user }) => {
        if (!user.emailVerified)
          return {
            error: "unverified_identity",
            errorDescription: "A verified identity is required",
          }
      },
    },
    account: {
      modelName: configuration.modelNames?.account,
      accountLinking: {
        enabled: true,
        trustedProviders: ["damaca-hub"],
      },
      storeStateStrategy: "cookie",
      storeAccountCookie: true,
      encryptOAuthTokens: false,
    },
    session: {
      modelName: configuration.modelNames?.session,
      cookieCache: {
        enabled: true,
        maxAge: 7 * 24 * 60 * 60,
        strategy: "jwt",
        refreshCache: !configuration.database,
      },
    },
    verification: { modelName: configuration.modelNames?.verification },
    disabledPaths: [
      "/get-access-token",
      "/refresh-token",
      "/account-info",
      "/link-social",
      "/unlink-account",
    ],
    advanced: {
      cookiePrefix:
        configuration.cookiePrefix ?? `damaca-${configuration.appId}`,
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
  async function getAccessResult(canRefresh: boolean) {
    const session = await getSession()
    if (!session) return { decision: "signed-out" as const, cookies: [] }
    try {
      const requestHeaders = await headers()
      const account = await auth.api.readHubAccount({ headers: requestHeaders })
      if (
        account?.providerId !== "damaca-hub" ||
        account.userId !== session.user.id ||
        !account.accessToken
      )
        return { decision: "denied" as const, cookies: [] }
      const expiresAt = account.accessTokenExpiresAt
        ? new Date(account.accessTokenExpiresAt).getTime()
        : 0
      if (!canRefresh && expiresAt - Date.now() < 5000)
        return { decision: "refresh-required" as const, cookies: [] }
      // Token rotation must run in a Route Handler so refreshed cookies reach the browser.
      const refreshResponse =
        canRefresh && expiresAt - Date.now() < 30_000
          ? await auth.api.getAccessToken({
              headers: requestHeaders,
              body: { useAccountCookie: true },
              asResponse: true,
            })
          : undefined
      const token = refreshResponse
        ? ((await refreshResponse.json()) as { accessToken?: string })
        : account
      if (!token.accessToken)
        return {
          decision: "denied" as const,
          cookies: refreshResponse?.headers.getSetCookie() ?? [],
        }
      const decision = await checkHubAccess(
        configuration,
        token.accessToken,
        session.user.email
      )
      return {
        decision,
        cookies: refreshResponse?.headers.getSetCookie() ?? [],
      }
    } catch {
      return { decision: "unavailable" as const, cookies: [] }
    }
  }
  const getAccess = cache(async (canRefresh = false) => {
    return (await getAccessResult(canRefresh)).decision
  })
  async function requireAccess() {
    const decision = await getAccess()
    if (decision === "signed-out") redirect("/auth/signin")
    if (decision === "refresh-required") redirect("/auth/refresh")
    if (decision !== "approved") redirect("/auth/access")
  }
  async function accessResponse() {
    const result = await getAccessResult(true)
    const headers = new Headers({ "Cache-Control": "no-store", Vary: "Cookie" })
    for (const cookie of result.cookies) headers.append("Set-Cookie", cookie)
    return Response.json(
      { decision: result.decision },
      {
        status:
          result.decision === "approved"
            ? 200
            : result.decision === "unavailable"
              ? 503
              : result.decision === "signed-out"
                ? 401
                : 403,
        headers,
      }
    )
  }
  return { auth, getSession, getAccess, requireAccess, accessResponse }
}
