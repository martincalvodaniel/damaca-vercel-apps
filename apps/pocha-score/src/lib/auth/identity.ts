import "server-only"

import { createConsumerIdentity } from "@damaca/identity/server"
import { getIdentityConfiguration } from "@/config/identity"

let identity: ReturnType<typeof createConsumerIdentity> | undefined

export function getIdentity() {
  identity ??= createConsumerIdentity(getIdentityConfiguration())
  return identity
}
