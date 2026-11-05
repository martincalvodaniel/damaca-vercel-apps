import {
  DEFAULT_USER_PREFERENCES,
  type UserPreferences,
} from "../entities/user-preferences"
import type { UserPreferencesRepository } from "../ports/user-preferences-repository"

// Email is stable across the stateless OAuth sessions used by this application.
export function getUserPreferenceKey(email: string): string {
  const key = email.trim().toLowerCase()
  if (!key) throw new Error("An authenticated email is required")
  return key
}

export async function readUserPreferences(
  repository: UserPreferencesRepository,
  email: string
): Promise<UserPreferences> {
  return (
    (await repository.findByUserKey(getUserPreferenceKey(email))) ?? {
      ...DEFAULT_USER_PREFERENCES,
    }
  )
}

export async function saveUserPreferences(
  repository: UserPreferencesRepository,
  email: string,
  preferences: UserPreferences
): Promise<UserPreferences> {
  await repository.save(getUserPreferenceKey(email), preferences)
  return preferences
}
