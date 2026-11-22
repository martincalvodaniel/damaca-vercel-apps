import "server-only"

import { createHash } from "node:crypto"
import { oauthProvider } from "@better-auth/oauth-provider"
import { type getMcpClients, getMcpUrls } from "@/lib/auth/mcp-config"
import {
  mcpAuthPath,
  mcpConnectPath,
  menuReadScope,
} from "@/lib/auth/mcp-paths"
import { COLLECTION_NAMES } from "@/lib/db/collections"

export function createMenuOAuthProvider(
  clients: ReturnType<typeof getMcpClients>
) {
  const { resource } = getMcpUrls()
  const hashSecret = (value: string) =>
    createHash("sha256").update(value).digest("base64url")
  const scopes = [menuReadScope, "offline_access"]
  return oauthProvider({
    loginPage: `${mcpConnectPath}/sign-in`,
    consentPage: `${mcpConnectPath}/consent`,
    schema: {
      oauthClient: { modelName: COLLECTION_NAMES.mcpOAuthClient },
      oauthClientResource: {
        modelName: COLLECTION_NAMES.mcpOAuthClientResource,
      },
      oauthRefreshToken: { modelName: COLLECTION_NAMES.mcpOAuthRefreshToken },
      oauthAccessToken: { modelName: COLLECTION_NAMES.mcpOAuthAccessToken },
      oauthConsent: { modelName: COLLECTION_NAMES.mcpOAuthConsent },
      oauthClientAssertion: {
        modelName: COLLECTION_NAMES.mcpOAuthClientAssertion,
      },
    },
    scopes,
    enforcePerClientResources: false,
    resources: [{ identifier: resource, allowedScopes: scopes }],
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
          id: "dalis-home-static",
          matches: () => true,
          resolve: async (context, id) => {
            const client = clients.find((entry) => entry.id === id)
            if (!client) return null
            const request = context.request
            const usesFormCredentials =
              request?.method === "POST" &&
              new URL(request.url).pathname === `${mcpAuthPath}/oauth2/token` &&
              !request.headers.has("authorization")
            return {
              clientDiscoveryId: "dalis-home-static",
              clientId: client.id,
              clientSecret: hashSecret(client.secret),
              redirectUris: [client.redirectUri],
              scopes,
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
