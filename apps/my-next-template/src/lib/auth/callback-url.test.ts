import { describe, expect, test } from "bun:test"
import { getSafeCallbackUrl } from "./callback-url"

describe("getSafeCallbackUrl", () => {
  test("keeps internal paths", () => {
    expect(getSafeCallbackUrl("/dashboard?tab=overview")).toBe(
      "/dashboard?tab=overview"
    )
  })

  test("rejects absolute and protocol-relative URLs", () => {
    expect(getSafeCallbackUrl("https://example.com")).toBe("/")
    expect(getSafeCallbackUrl("//example.com")).toBe("/")
  })

  test("falls back when no callback is provided", () => {
    expect(getSafeCallbackUrl(undefined)).toBe("/")
  })
})
