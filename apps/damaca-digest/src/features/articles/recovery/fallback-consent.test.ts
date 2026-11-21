import { expect, test as it } from "bun:test"
import {
  externalFallbackUrl,
  issueFallbackConsent,
  verifyFallbackConsent,
} from "./fallback-consent"

it("binds permission to the normalized URL, owner, environment and expiration", () => {
  const url = externalFallbackUrl(
    "https://notion.com/article?utm_source=test"
  ).href
  const offer = issueFallbackConsent(
    "secret",
    "int",
    "owner",
    url,
    ["jina"],
    1000
  )
  expect(offer.url).toBe("https://notion.com/article")
  expect(
    verifyFallbackConsent(offer.token, "secret", "int", "owner", url, 1001)
      ?.providers
  ).toEqual(["jina"])
  expect(
    verifyFallbackConsent(offer.token, "secret", "main", "owner", url, 1001)
  ).toBeNull()
  expect(
    verifyFallbackConsent(offer.token, "secret", "int", "other", url, 1001)
  ).toBeNull()
  expect(
    verifyFallbackConsent(
      offer.token,
      "secret",
      "int",
      "owner",
      `${url}/other`,
      1001
    )
  ).toBeNull()
  expect(
    verifyFallbackConsent(
      `${offer.token}a`,
      "secret",
      "int",
      "owner",
      url,
      1001
    )
  ).toBeNull()
  expect(
    verifyFallbackConsent(offer.token, "secret", "int", "owner", url, 601000)
  ).toBeNull()
})

it("preserves rules for URLs shared with external providers", () => {
  for (const url of [
    "http://notion.com/article",
    "https://notion.com/article?q=1",
    "https://notion.com/article#section",
    "https://notion.com/private/article",
    "https://user:password@notion.com/article",
    "https://127.0.0.1/article",
  ])
    expect(() => externalFallbackUrl(url)).toThrow("policy")
})
