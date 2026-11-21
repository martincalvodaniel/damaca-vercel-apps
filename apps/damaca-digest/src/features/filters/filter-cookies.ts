import "server-only"

import { createHash } from "node:crypto"
import { cookies } from "next/headers"
import { type FilterPath, normalizeRememberedHref } from "./remembered-query"

export function filterAccountKey(ownerId: string) {
  return createHash("sha256").update(ownerId).digest("hex")
}

export function filterCookieName(accountKey: string, path: FilterPath) {
  return `digest-filters-v1-${path === "/" ? "library" : "topics"}-${accountKey}`
}

export async function readRememberedFilters(
  accountKey: string,
  path: FilterPath
) {
  const value = (await cookies()).get(filterCookieName(accountKey, path))?.value
  if (value === undefined) return undefined
  return normalizeRememberedHref(path, value)
}
