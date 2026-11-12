import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"
import { isDevelopmentEnvironment } from "@/config/env"

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname.startsWith("/api/")) return NextResponse.next()

  if (!pathname.startsWith("/auth/") && !getSessionCookie(request)) {
    const signInUrl = new URL("/auth/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`)
    return NextResponse.redirect(signInUrl)
  }

  const nonce = Buffer.from(
    crypto.getRandomValues(new Uint8Array(18))
  ).toString("base64")
  const scriptDev = isDevelopmentEnvironment() ? " 'unsafe-eval'" : ""
  const csp = [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'${scriptDev}`,
    "style-src 'self'",
    "img-src 'self' data: https://lh3.googleusercontent.com",
    "connect-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ")
  const headers = new Headers(request.headers)
  headers.set("x-nonce", nonce)
  headers.set("Content-Security-Policy", csp)
  const response = NextResponse.next({ request: { headers } })
  response.headers.set("Content-Security-Policy", csp)
  response.headers.set("Referrer-Policy", "no-referrer")
  return response
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
}
