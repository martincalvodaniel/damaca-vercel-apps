import { headers } from "next/headers"
import { createUserPreferencesHandlers } from "@/features/settings/server/handlers"
import { auth } from "@/lib/auth/auth"
import { requireAuth } from "@/lib/auth/require-auth"
import { MongoUserPreferencesRepository } from "@/lib/db/repositories/mongo-user-preferences-repository"

const handlers = createUserPreferencesHandlers({
  authorize: requireAuth,
  getEmail: async () => {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user.email ?? null
  },
  repository: new MongoUserPreferencesRepository(),
})

export const GET = handlers.GET
export const PUT = handlers.PUT
