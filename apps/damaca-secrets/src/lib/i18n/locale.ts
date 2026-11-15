export const localeCookie = "damaca-secrets-locale"
export const defaultLocale = "es"

export type Locale = "es" | "en"

export function parseLocale(value: unknown): Locale {
  return value === "en" ? "en" : defaultLocale
}

export function readLocaleCookie(cookies: string): Locale {
  const prefix = `${localeCookie}=`
  const value = cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix))
  return parseLocale(value?.slice(prefix.length))
}
