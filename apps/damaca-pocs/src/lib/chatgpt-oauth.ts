import "server-only"

import { createHash } from "node:crypto"
import { oauthProvider } from "@better-auth/oauth-provider"
import { captureScope, getChatGptClient, getMcpUrls } from "./chatgpt-config"

export function createCaptureOAuthProvider() {
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
          id: "damaca-chatgpt",
          matches: () => true,
          resolve: async (_context, id) => {
            const client = getChatGptClient()
            if (!client || id !== client.id) return null
            return {
              clientDiscoveryId: "damaca-chatgpt",
              clientId: client.id,
              clientSecret: hashSecret(client.secret),
              redirectUris: [client.redirectUri],
              scopes: [captureScope, "offline_access"],
              grantTypes: ["authorization_code", "refresh_token"],
              responseTypes: ["code"],
              applicationType: "web",
              tokenEndpointAuthMethod: "client_secret_basic",
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
