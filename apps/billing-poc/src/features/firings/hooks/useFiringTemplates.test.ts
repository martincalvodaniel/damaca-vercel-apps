import { expect, test as it } from "bun:test"
import {
  buildFiringTemplateRequest,
  buildFiringTemplatesKey,
  buildFiringTemplatesUrl,
  isFiringTemplatesKey,
} from "./useFiringTemplates"

it("template requests and cache keys are separate from products and payment templates", () => {
  expect(buildFiringTemplatesKey()).toEqual(["/api/firing-templates"])
  expect(buildFiringTemplatesUrl()).toBe("/api/firing-templates")
  expect(isFiringTemplatesKey(buildFiringTemplatesKey())).toBe(true)
  expect(isFiringTemplatesKey(["/api/products"])).toBe(false)
  expect(isFiringTemplatesKey(["/api/payment-templates"])).toBe(false)
  expect(isFiringTemplatesKey(["/api/firing-templates", "a"])).toBe(false)
  expect(
    buildFiringTemplateRequest("PUT", { id: "a", name: "Load", price: 0 })
  ).toEqual({
    url: "/api/firing-templates",
    method: "PUT",
    body: '{"id":"a","name":"Load","price":0}',
  })
})
