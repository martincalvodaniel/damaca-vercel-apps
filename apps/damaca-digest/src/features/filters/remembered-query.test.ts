import { expect, it } from "bun:test"
import { normalizeRememberedHref } from "./remembered-query"

it("keeps valid library filters and restores the first page", () => {
  expect(
    normalizeRememberedHref("/", "/?reading=read&reading=archived&page=4")
  ).toBe("/?reading=read&reading=archived")
  expect(normalizeRememberedHref("/", "/?reading=invalid")).toBe("")
})

it("accepts only filters for the requested screen", () => {
  expect(normalizeRememberedHref("/topics", "/topics?q=A+B")).toBe(
    "/topics?q=A+B"
  )
  expect(normalizeRememberedHref("/topics", "/?q=Library")).toBe("")
  expect(normalizeRememberedHref("/", "//example.com/?q=Other")).toBe("")
  expect(normalizeRememberedHref("/", "/?reset=1")).toBe("")
})
