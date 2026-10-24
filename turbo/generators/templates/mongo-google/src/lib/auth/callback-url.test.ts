import { describe, expect, test as it, test } from "bun:test"
import { getSafeCallbackUrl } from "./callback-url"

describe("getSafeCallbackUrl", () => {
  it("keeps internal paths", () => {
    expect(getSafeCallbackUrl("/dashboard?tab=overview")).toBe(
      "/dashboard?tab=overview"
    )
  })

  it("rejects absolute and protocol-relative URLs", () => {
    expect(getSafeCallbackUrl("https://example.com")).toBe("/")
    expect(getSafeCallbackUrl("//example.com")).toBe("/")
  })

  it("falls back when no callback is provided", () => {
    expect(getSafeCallbackUrl(undefined)).toBe("/")
  })
})
