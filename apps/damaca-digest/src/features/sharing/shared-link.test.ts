import { expect, test as it } from "bun:test"
import { capturePrompt, resolveSharedLink } from "./shared-link"

it("uses the explicit link from Chrome and preserves its query and fragment", () => {
  const url = "https://example.com/article?chapter=2#results"
  expect(resolveSharedLink({ url, text: "https://example.org" })).toBe(url)
  expect(capturePrompt(url)).toContain(`\n\n${url}`)
})

it("receives plain links and URLs embedded in shared text", () => {
  expect(resolveSharedLink({ text: "https://example.com/read" })).toBe(
    "https://example.com/read"
  )
  expect(
    resolveSharedLink({ text: "Article title\nhttps://example.com/read" })
  ).toBe("https://example.com/read")
  expect(
    resolveSharedLink({ text: "https://example.com/read via Chrome" })
  ).toBe("https://example.com/read")
})

it("rejects ambiguous, credentialed, or unsafe input", () => {
  expect(
    resolveSharedLink({ text: "https://example.com https://example.org" })
  ).toBeNull()
  expect(
    resolveSharedLink({ url: ["https://example.com", "https://example.org"] })
  ).toBeNull()
  expect(
    resolveSharedLink({ url: "https://user:password@example.com" })
  ).toBeNull()
  expect(resolveSharedLink({ url: "javascript:alert(1)" })).toBeNull()
})
