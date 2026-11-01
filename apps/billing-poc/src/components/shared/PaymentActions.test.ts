import { expect, test as it } from "bun:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import PaymentActions from "./PaymentActions"

const base = { name: "Custom cups", onOpen: () => {}, onGenerate: () => {} }
it("shows the same three payment methods for events and commissions", () => {
  const html = renderToStaticMarkup(createElement(PaymentActions, base))
  for (const method of ["cash", "card", "bank transfer"])
    expect(html).toContain(
      `aria-label="Generate ${method} payment for Custom cups"`
    )
  expect(html).not.toContain("Open payment for")
})
it("shows the generated-payment badge and disables all generation buttons", () => {
  const html = renderToStaticMarkup(
    createElement(PaymentActions, { ...base, paymentId: "payment-1" })
  )
  expect(html).toContain("€ ✓")
  expect(html).toContain('aria-label="Open payment for Custom cups"')
  expect(html.match(/disabled=""/g)).toHaveLength(3)
})
it("restricts a retry to the reserved method and blocks generation without concepts", () => {
  const html = renderToStaticMarkup(
    createElement(PaymentActions, { ...base, reservedMethod: "card" })
  )
  expect(html.match(/disabled=""/g)).toHaveLength(2)
  expect(html).toContain('aria-label="Retry card payment for Custom cups"')
  const disabled = renderToStaticMarkup(
    createElement(PaymentActions, { ...base, generationDisabled: true })
  )
  expect(disabled.match(/disabled=""/g)).toHaveLength(3)
})
