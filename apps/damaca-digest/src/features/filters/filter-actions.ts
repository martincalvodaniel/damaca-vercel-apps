"use server"

import { cookies } from "next/headers"
import { RedirectType, redirect } from "next/navigation"
import { getAuthEnv } from "@/config/env"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { filterAccountKey, filterCookieName } from "./filter-cookies"
import {
  emptyFilterHref,
  type FilterPath,
  normalizeRememberedHref,
} from "./remembered-query"

export async function rememberFilters(
  accountKey: string,
  path: FilterPath,
  href: string,
  migrate = false
) {
  if ((path !== "/" && path !== "/topics") || typeof href !== "string") return
  const { user } = await requireAuthorizedSession()
  if (accountKey !== filterAccountKey(user.id))
    throw new Error("Filter account changed")
  const name = filterCookieName(accountKey, path)
  const jar = await cookies()
  const existing = jar.get(name)?.value
  if (migrate && existing !== undefined) {
    redirect(
      normalizeRememberedHref(path, existing) || emptyFilterHref(path),
      RedirectType.replace
    )
  }

  const normalized = normalizeRememberedHref(path, href)
  const value =
    normalized && encodeURIComponent(normalized).length <= 3500
      ? normalized
      : "-"
  if (existing !== value) {
    jar.set(name, value, {
      httpOnly: true,
      secure: getAuthEnv().baseUrl.startsWith("https://"),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
  }
  if (migrate)
    redirect(normalized || emptyFilterHref(path), RedirectType.replace)
}
