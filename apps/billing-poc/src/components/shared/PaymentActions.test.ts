import { expect, test as it } from "bun:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import PaymentActions from "./PaymentActions"

const base = { name: "Custom cups", onOpen: () => {}, onGenerate: () => {} }
it("shows the same three payment methods for events and commissions", () => {
  const html = renderToStaticMarkup(createElement(PaymentActions, base))
  for (const method of ["efectivo", "tarjeta", "transferencia bancaria"])
    expect(html).toContain(
      `aria-label="Generar el pago por ${method} para Custom cups"`
    )
  expect(html).not.toContain("Abrir pago de")
})
it("shows the generated-payment badge and disables all generation buttons", () => {
  const html = renderToStaticMarkup(
    createElement(PaymentActions, { ...base, paymentId: "payment-1" })
  )
  expect(html).toContain("€ ✓")
  expect(html).toContain('aria-label="Abrir pago de Custom cups"')
  expect(html.match(/disabled=""/g)).toHaveLength(3)
})
it("restricts a retry to the reserved method and blocks generation without concepts", () => {
  const html = renderToStaticMarkup(
    createElement(PaymentActions, { ...base, reservedMethod: "card" })
  )
  expect(html.match(/disabled=""/g)).toHaveLength(2)
  expect(html).toContain(
    'aria-label="Reintentar el pago por tarjeta para Custom cups"'
  )
  const disabled = renderToStaticMarkup(
    createElement(PaymentActions, { ...base, generationDisabled: true })
  )
  expect(disabled.match(/disabled=""/g)).toHaveLength(3)
})
