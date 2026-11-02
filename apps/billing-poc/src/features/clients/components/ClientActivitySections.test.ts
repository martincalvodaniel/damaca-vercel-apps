import { expect, test as it } from "bun:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import type { ClientActivity } from "@/lib/domain/services/client-activity"
import ClientActivitySections from "./ClientActivitySections"
import ClientTableRow from "./ClientTableRow"

const activity: ClientActivity = {
  client: {
    _id: "a",
    name: "Client A",
    clientType: "company",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  payments: [],
  commissions: [],
  firings: [],
}
const noop = () => {}

it("all three sections start collapsed and display exact empty counts", () => {
  const html = renderToStaticMarkup(
    createElement(ClientActivitySections, { activity })
  )
  expect(html.match(/<details/g)).toHaveLength(3)
  expect(html).not.toMatch(/<details[^>]*\sopen/)
  for (const label of ["Pagos (0)", "Encargos (0)", "Cocciones (0)"])
    expect(html).toContain(label)
  expect(html).toContain("No hay pagos de este cliente.")
})

it("counts include paid work and links keep commission/firing resources separate", () => {
  const item = {
    _id: "work",
    title: "Work title",
    clientId: "a",
    prepaidAmount: 0,
    paymentId: "payment",
    concepts: [],
    vat: 21,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const data = {
    ...activity,
    commissions: [item, { ...item, _id: "unpaid", paymentId: undefined }],
    firings: [item],
  }
  const html = renderToStaticMarkup(
    createElement(ClientActivitySections, {
      activity: data,
    })
  )
  expect(html).toContain("Encargos (2)")
  expect(html).toContain("Cocciones (1)")
  expect(html).toContain("/commissions?commissionId=work")
  expect(html).toContain("/firings?commissionId=work")
})

it("client name is a keyboard-accessible detail link while contact copy buttons remain available", () => {
  const html = renderToStaticMarkup(
    createElement(
      "table",
      null,
      createElement(
        "tbody",
        null,
        createElement(ClientTableRow, {
          client: {
            ...activity.client,
            phone: "123",
            email: "client@example.com",
            instagram: "@client",
          },
          index: 0,
          onOpen: noop,
          onDelete: noop,
          onEdit: noop,
        })
      )
    )
  )
  expect(html).toContain('href="/clients/a"')
  expect(html).toContain("Copiar teléfono 123")
  expect(html).toContain("Copiar correo electrónico client@example.com")
  expect(html).toContain("Copiar Instagram @client")
  expect(html.indexOf('aria-label="Editar cliente Client A"')).toBeLessThan(
    html.indexOf('aria-label="Eliminar cliente Client A"')
  )
})
