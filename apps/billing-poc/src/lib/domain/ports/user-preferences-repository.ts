import type { UserPreferences } from "../entities/user-preferences"

export interface UserPreferencesRepository {
  findByUserKey(userKey: string): Promise<UserPreferences | null>
  save(userKey: string, preferences: UserPreferences): Promise<void>
}
