import "server-only"

import type { UserPreferences } from "@/lib/domain/entities/user-preferences"
import type { UserPreferencesRepository } from "@/lib/domain/ports/user-preferences-repository"
import { userPreferencesSchema } from "@/schemas/user-preferences-validator"
import { getDatabase } from "../client"
import type { MongoUserPreferences } from "../types"

export class MongoUserPreferencesRepository
  implements UserPreferencesRepository
{
  async findByUserKey(userKey: string): Promise<UserPreferences | null> {
    const db = await getDatabase()
    const doc = await db
      .collection<MongoUserPreferences>("userPreferences")
      .findOne({ _id: userKey })
    if (!doc) return null
    const parsed = userPreferencesSchema.safeParse({ theme: doc.theme })
    return parsed.success ? parsed.data : null
  }

  async save(userKey: string, preferences: UserPreferences): Promise<void> {
    const db = await getDatabase()
    // MongoDB's built-in unique _id index isolates users and makes upserts atomic.
    await db
      .collection<MongoUserPreferences>("userPreferences")
      .updateOne(
        { _id: userKey },
        { $set: { theme: preferences.theme } },
        { upsert: true }
      )
  }
}
