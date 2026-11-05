"use client"

import useSWR, { useSWRConfig } from "swr"
import useSWRMutation from "swr/mutation"
import { FetchError, fetcher } from "@/lib/client/swr-fetcher"
import type { UserPreferences } from "@/lib/domain/entities/user-preferences"

const ENDPOINT = "/api/user-preferences"
export type UserPreferencesKey = readonly [typeof ENDPOINT, string]

export function buildUserPreferencesKey(userKey: string): UserPreferencesKey {
  return [ENDPOINT, userKey]
}

export function buildUserPreferencesUrl(): string {
  return ENDPOINT
}

export function isUserPreferencesKey(key: unknown): key is UserPreferencesKey {
  return (
    Array.isArray(key) &&
    key.length === 2 &&
    key[0] === ENDPOINT &&
    typeof key[1] === "string" &&
    key[1].length > 0
  )
}

export function buildUpdateUserPreferencesRequest(
  preferences: UserPreferences
): RequestInit {
  return {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme: preferences.theme }),
  }
}

export function useUserPreferences(
  userKey: string,
  initialPreferences: UserPreferences
) {
  return useSWR<UserPreferences>(
    buildUserPreferencesKey(userKey),
    () => fetcher<UserPreferences>(buildUserPreferencesUrl()),
    {
      fallbackData: initialPreferences,
      // The authenticated layout has already read this user's latest preferences.
      revalidateOnMount: false,
      keepPreviousData: false,
    }
  )
}

export function useUpdateUserPreferences(userKey: string) {
  const { mutate } = useSWRConfig()
  return useSWRMutation(
    buildUserPreferencesKey(userKey),
    async (_key, { arg }: { arg: UserPreferences }) => {
      const response = await fetch(
        buildUserPreferencesUrl(),
        buildUpdateUserPreferencesRequest(arg)
      )
      if (!response.ok) {
        throw new FetchError(
          "No se pudo guardar el tema. Inténtalo de nuevo.",
          response.status,
          null
        )
      }
      return (await response.json()) as UserPreferences
    },
    {
      populateCache: true,
      revalidate: false,
      onSuccess: () => {
        // Revalidate only the current user's resource without clearing its value.
        void mutate((key) => isUserPreferencesKey(key) && key[1] === userKey)
      },
    }
  )
}
