import { describe, expect, test as it } from "bun:test"
import { localeCookie, parseLocale, readLocaleCookie } from "./locale"

describe("interface locale preference", () => {
  it("defaults to Spanish for absent and unsupported values", () => {
    for (const value of [undefined, null, "", "es", "EN", "en-US", "fr"])
      expect(parseLocale(value)).toBe("es")
  })

  it("reads only the language cookie from a browser cookie string", () => {
    expect(readLocaleCookie(`other=en; ${localeCookie}=en; theme=dark`)).toBe(
      "en"
    )
    expect(
      readLocaleCookie(`other-${localeCookie}=en; ${localeCookie}=fr`)
    ).toBe("es")
  })
})
