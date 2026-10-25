import "server-only"

import { createConsumerIdentity } from "@damaca/identity/server"
import { getAuthEnv } from "@/config/env"
import { createAuthDatabaseAdapter } from "@/lib/db/auth-adapter"
import { AUTH_MODEL_NAMES } from "@/lib/db/auth-models"

const authEnv = getAuthEnv()
export const identity = createConsumerIdentity({
  ...authEnv,
  cookiePrefix: "better-auth",
  database: createAuthDatabaseAdapter(),
  modelNames: AUTH_MODEL_NAMES,
})

export const auth = identity.auth
