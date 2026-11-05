import { NextResponse } from "next/server"
import type { UserPreferencesRepository } from "@/lib/domain/ports/user-preferences-repository"
import {
  readUserPreferences,
  saveUserPreferences,
} from "@/lib/domain/services/user-preferences"
import { userPreferencesSchema } from "@/schemas/user-preferences-validator"

interface Dependencies {
  authorize: () => Promise<NextResponse | null>
  getEmail: () => Promise<string | null>
  repository: UserPreferencesRepository
}

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" }

function respond(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS })
}

export function createUserPreferencesHandlers({
  authorize,
  getEmail,
  repository,
}: Dependencies) {
  return {
    async GET() {
      try {
        const denied = await authorize()
        if (denied) return denied
        const email = await getEmail()
        if (!email) return respond({ error: "Unauthorized" }, 401)
        return respond(await readUserPreferences(repository, email))
      } catch (error) {
        console.error(`Error reading user preferences: ${error}`)
        return respond({ error: "No se pudo cargar la configuración" }, 500)
      }
    },
    async PUT(request: Request) {
      try {
        const denied = await authorize()
        if (denied) return denied
        const email = await getEmail()
        if (!email) return respond({ error: "Unauthorized" }, 401)
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return respond({ error: "Invalid JSON" }, 400)
        }
        const parsed = userPreferencesSchema.safeParse(body)
        if (!parsed.success) {
          return respond({ error: "Invalid user preferences" }, 400)
        }
        return respond(
          await saveUserPreferences(repository, email, parsed.data)
        )
      } catch (error) {
        console.error(`Error saving user preferences: ${error}`)
        return respond({ error: "No se pudo guardar la configuración" }, 500)
      }
    },
  }
}
