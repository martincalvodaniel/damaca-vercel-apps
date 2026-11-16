import { expect, test as it } from "bun:test"
import { chatGptOpenUrl, chatGptWebUrl } from "./chatgpt-link"
import { capturePrompt, resolveSharedLink } from "./shared-link"

it("uses the explicit link from Chrome and preserves its query and fragment", () => {
  const url = "https://example.com/article?chapter=2#results"
  expect(resolveSharedLink({ url, text: "https://example.org" })).toBe(url)
  for (const connector of ["damaca-digest", "damaca-digest-int"]) {
    const prompt = capturePrompt(url, connector)
    expect(prompt).toStartWith(`Use @${connector} to read`)
    expect(prompt).toEndWith(`\n\n${url}`)
  }
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

it("targets the installed mobile app with a web fallback", () => {
  const android = chatGptOpenUrl("Mozilla/5.0 (Linux; Android 15)")
  expect(android).toStartWith("intent://chatgpt.com/#Intent;scheme=https;")
  expect(android).toContain("package=com.openai.chatgpt;")
  expect(android).toEndWith(
    `S.browser_fallback_url=${encodeURIComponent(chatGptWebUrl)};end`
  )
  expect(chatGptOpenUrl("Mozilla/5.0 (iPhone)")).toBe(
    "https://chatgpt.com/#native"
  )
  expect(chatGptOpenUrl("Mozilla/5.0 (Macintosh)")).toBe(chatGptWebUrl)
})
