import "server-only"

import { createHubIdentity } from "@damaca/identity/provider"
import { getAuthEnv, getOidcClients } from "@/config/env"
import { getAuthDatabaseAdapter } from "@/lib/db/auth-adapter"
import { hasApplicationAccess } from "@/lib/db/hub"

let identityPromise: Promise<ReturnType<typeof createHubIdentity>> | undefined

export function getHubAuth() {
  if (!identityPromise) {
    identityPromise = getAuthDatabaseAdapter()
      .then((database) =>
        createHubIdentity({
          ...getAuthEnv(),
          database,
          clients: getOidcClients(),
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
