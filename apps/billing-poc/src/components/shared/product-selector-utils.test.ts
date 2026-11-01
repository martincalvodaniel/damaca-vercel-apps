import { expect, test as it } from "bun:test"
import type { Product } from "@/lib/domain/entities/product"
import { filterProductSuggestions } from "./product-selector-utils"

const products: Product[] = [
  {
    _id: "a",
    name: "Cerámica azul",
    finalPrice: 25,
    stock: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "b",
    name: "Plate",
    finalPrice: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "c",
    name: "Cerámica azul",
    finalPrice: 45,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
it("filters immediately with case/accent-insensitive text and preserves duplicate-name identities", () => {
  expect(
    filterProductSuggestions(products, " CERAMICA ").map(
      (product) => product._id
    )
  ).toEqual(["a", "c"])
  expect(
    filterProductSuggestions(products, "plat").map((product) => product._id)
  ).toEqual(["b"])
  expect(filterProductSuggestions(products, "missing")).toEqual([])
  expect(filterProductSuggestions(products, "")).toEqual(products)
  expect(products[0]?.stock).toBe(2)
})
