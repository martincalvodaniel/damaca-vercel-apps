import { headers } from "next/headers"
import { createFiscalAgendaHandlers } from "@/features/fiscal-agenda/server/handlers"
import { auth } from "@/lib/auth/auth"
import { requireAuth } from "@/lib/auth/require-auth"
import { MongoFiscalTaskRepository } from "@/lib/db/repositories/mongo-fiscal-task-repository"

const handlers = createFiscalAgendaHandlers({
  authorize: requireAuth,
  getOwner: async () => {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user.id ?? null
  },
  repository: new MongoFiscalTaskRepository(),
})

export const { GET, POST, PUT, DELETE } = handlers
