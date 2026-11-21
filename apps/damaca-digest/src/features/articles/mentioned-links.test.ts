import { expect, test as it } from "bun:test"
import { normalizeSourceLinks } from "./mentioned-links"

it("keeps editorial destinations in order and fills missing titles", () => {
  const source = (url: string, title?: string) => ({
    url,
    title,
    origin: "source" as const,
  })
  expect(
    normalizeSourceLinks(
      [
        source("https://example.com/article?utm=share#section"),
        source("https://example.com/other?q=one&utm_source=test#details"),
        source("https://example.com/other?q=two"),
        source("https://example.com/other?q=one#details", "Details"),
        source("javascript:alert(1)"),
        { url: "https://example.com/ai", origin: "ai_suggested" },
      ],
      "https://example.com/article"
    )
  ).toEqual([
    source("https://example.com/other?q=one#details", "Details"),
    source("https://example.com/other?q=two"),
  ])
})
