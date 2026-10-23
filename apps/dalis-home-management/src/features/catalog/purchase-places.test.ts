import { describe, expect, test } from "bun:test"
import {
  getPurchasePlaces,
  matchesSelectedPurchasePlaces,
  normalizePurchasePlaces,
  resolveSelectedPurchasePlaces,
} from "./purchase-places"

describe("purchase places", () => {
  test("returns normalized, unique, alphabetized places", () => {
    expect(
      getPurchasePlaces([
        { purchasePlaces: ["  Mercado   central ", "Supermercado"] },
        { purchasePlaces: ["mercado central"] },
      ])
    ).toEqual(["Mercado central", "Supermercado"])
  })

  test("normalizes an editable list while keeping insertion order", () => {
    expect(
      normalizePurchasePlaces([" Mercado ", "Supermercado", "mercado", ""])
    ).toEqual(["Mercado", "Supermercado"])
  })

  test("keeps valid selections using normalized place names", () => {
    expect(
      resolveSelectedPurchasePlaces(
        ["Mercado central", "Supermercado"],
        [" mercado  central ", "Lugar eliminado"]
      )
    ).toEqual(["Mercado central"])
  })

  test("matches any selected purchase place and treats no selection as all", () => {
    expect(
      matchesSelectedPurchasePlaces(
        ["Mercado", "Frutería"],
        ["Supermercado", "frutería"]
      )
    ).toBe(true)
    expect(
      matchesSelectedPurchasePlaces(["Mercado"], ["Supermercado", "Frutería"])
    ).toBe(false)
    expect(matchesSelectedPurchasePlaces([], [])).toBe(true)
  })
})
