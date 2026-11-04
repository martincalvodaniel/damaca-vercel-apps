import { expect, test as it } from "bun:test"
import { normalizeTaskSearch } from "./task-search"

it("task search ignores case and composed or decomposed accents", () => {
  for (const query of ["SABANAS", "sábanas", "SA\u0301BANAS"]) {
    expect(
      normalizeTaskSearch("Cambiar sábanas").includes(
        normalizeTaskSearch(query)
      )
    ).toBe(true)
  }
  expect(normalizeTaskSearch("BAÑO")).toBe(normalizeTaskSearch("baño"))
})
