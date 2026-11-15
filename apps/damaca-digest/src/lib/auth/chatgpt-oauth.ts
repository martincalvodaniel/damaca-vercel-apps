import "server-only"

import { createHash } from "node:crypto"
import { oauthProvider } from "@better-auth/oauth-provider"
import { getChatGptClient } from "@/config/env"
import { authPath, captureScope, getMcpUrls } from "@/lib/auth/mcp-config"

export function createDigestOAuthProvider() {
  const { resource } = getMcpUrls()
  const hashSecret = (value: string) =>
    createHash("sha256").update(value).digest("base64url")
  return oauthProvider({
    loginPage: "/connect/sign-in",
    consentPage: "/connect/consent",
    scopes: [captureScope, "offline_access"],
    // The resolver admits one client and this provider has one resource.
    enforcePerClientResources: false,
    resources: getChatGptClient()
      ? [
          {
            identifier: resource,
            allowedScopes: [captureScope, "offline_access"],
          },
        ]
      : [],
    grantTypes: ["authorization_code", "refresh_token"],
    accessTokenExpiresIn: 300,
    codeExpiresIn: 60,
    allowDynamicClientRegistration: false,
    allowUnauthenticatedClientRegistration: false,
    clientPrivileges: () => false,
    storeClientSecret: { hash: hashSecret },
    extensions: [
      {
        clientDiscovery: {
          id: "damaca-digest-chatgpt",
          matches: () => true,
          resolve: async (context, id) => {
            const client = getChatGptClient()
            if (!client || id !== client.id) return null
            const request = context.request
            const usesFormCredentials =
              request?.method === "POST" &&
              new URL(request.url).pathname === `${authPath}/oauth2/token` &&
              !request.headers.has("authorization")
            return {
              clientDiscoveryId: "damaca-digest-chatgpt",
              clientId: client.id,
              clientSecret: hashSecret(client.secret),
              redirectUris: [client.redirectUri],
              scopes: [captureScope, "offline_access"],
              grantTypes: ["authorization_code", "refresh_token"],
              responseTypes: ["code"],
              applicationType: "web",
              tokenEndpointAuthMethod: usesFormCredentials
                ? "client_secret_post"
                : "client_secret_basic",
              requirePKCE: true,
              skipConsent: false,
              enableEndSession: false,
            }
          },
        },
      },
    ],
  })
}
