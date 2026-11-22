import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"

import { mcpAuthPath, mcpConnectPath, mcpPath } from "@/lib/auth/mcp-paths"

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname === mcpPath ||
    pathname.startsWith(`${mcpAuthPath}/`) ||
    pathname.startsWith(`${mcpConnectPath}/`)
  ) {
    return NextResponse.next()
  }

  if (getSessionCookie(request)) {
    return NextResponse.next()
  }

  const signInUrl = new URL("/auth/signin", request.url)
  signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`)

  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
}
