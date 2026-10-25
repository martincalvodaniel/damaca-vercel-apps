import "server-only"

import { createHubIdentity } from "@damaca/identity/provider"
import { getAuthEnv } from "@/config/env"
import { getAuthDatabaseAdapter } from "@/lib/db/auth-adapter"
import { hasApplicationAccess } from "@/lib/db/hub"
import { findOidcClient } from "@/lib/db/oidc-clients"

let identityPromise: Promise<ReturnType<typeof createHubIdentity>> | undefined

export function getHubAuth() {
  if (!identityPromise) {
    identityPromise = getAuthDatabaseAdapter()
      .then((database) =>
        createHubIdentity({
          ...getAuthEnv(),
          database,
          resolveClient: async (clientId) => {
            const client = await findOidcClient(clientId)
            if (!client) return null
            return {
              appId: client.appId,
              clientId: client.clientId,
              clientSecretHash: client.clientSecretHash,
              redirectUri: client.redirectUri,
              enabled: client.enabled,
            }
          },
          isAllowed: hasApplicationAccess,
        })
      )
      .catch((error: unknown) => {
        identityPromise = undefined
        throw error
      })
  }
  return identityPromise
}
