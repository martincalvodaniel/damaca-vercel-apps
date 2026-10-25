import { describe, expect, it } from "bun:test"
import { NextRequest } from "next/server"
import { proxy } from "./proxy"

describe("Hub authentication proxy", () => {
  it("allows requests with the Hub session cookie", () => {
    const request = new NextRequest("https://hub.example/dashboard", {
      headers: { cookie: "damaca-hub.session_token=session" },
    })

    const response = proxy(request)

    expect(response.headers.get("x-middleware-next")).toBe("1")
  })

  it("redirects requests without a session cookie to sign-in", () => {
    const request = new NextRequest("https://hub.example/dashboard")

    const response = proxy(request)

    expect(response.headers.get("location")).toBe(
      "https://hub.example/auth/signin?callbackUrl=%2Fdashboard"
    )
  })
})
