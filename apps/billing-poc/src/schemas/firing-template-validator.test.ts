import { expect, test as it } from "bun:test"
import { buildFiringTemplateConcept } from "@/lib/domain/entities/firing-template"
import {
  firingTemplateSchema,
  updateFiringTemplateSchema,
} from "./firing-template-validator"

it("templates require a trimmed name and a finite nonnegative price", () => {
  expect(firingTemplateSchema.parse({ name: " Load ", price: 0 })).toEqual({
    name: "Load",
    price: 0,
  })
  for (const price of [-1, Number.NaN, Number.POSITIVE_INFINITY, "10", null])
    expect(
      firingTemplateSchema.safeParse({ name: "Load", price }).success
    ).toBe(false)
  expect(firingTemplateSchema.safeParse({ name: " ", price: 10 }).success).toBe(
    false
  )
  expect(
    updateFiringTemplateSchema.safeParse({ id: "bad", name: "Load", price: 10 })
      .success
  ).toBe(false)
  expect(
    updateFiringTemplateSchema.safeParse({
      id: "a".repeat(24),
      name: "Load",
      price: 10,
    }).success
  ).toBe(true)
})
it("concepts snapshot template values and do not carry a product or template reference", () => {
  const template = { name: "Small load", price: 12.5 }
  const concept = buildFiringTemplateConcept(template)
  template.price = 30
  template.name = "Renamed"
  expect(concept).toEqual({ name: "Small load", amount: 12.5, quantity: 1 })
})
