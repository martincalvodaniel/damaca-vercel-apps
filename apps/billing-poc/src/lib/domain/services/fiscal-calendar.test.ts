import { expect, test as it } from "bun:test"
import {
  fiscalDatesChanged,
  fiscalDue,
  fiscalStatus,
  fiscalSuggestions,
  madridDate,
} from "./fiscal-calendar"

it("indexes fourth quarter and annual models by due year", () => {
  const tasks = fiscalSuggestions(2026)
  expect(tasks).toHaveLength(26)
  expect(new Set(tasks.map((task) => task.id)).size).toBe(tasks.length)
  expect(
    tasks.find((task) => task.id === "official-303-2025-4T")
  ).toMatchObject({
    dueYear: 2026,
    filingDue: "2026-01-30",
    debitDue: "2026-01-27",
  })
  expect(
    tasks.find((task) => task.id === "official-102-2025-Segundo plazo")
  ).toMatchObject({
    paymentDue: "2026-11-05",
  })
  expect(fiscalSuggestions(2027)).toEqual([])
})

it("tracks filing and payment independently from direct debit", () => {
  const [task] = fiscalSuggestions(2026)
  const withPayment = { ...task, paymentDue: "2026-02-01" }
  expect(fiscalStatus(withPayment, "2026-01-20")).toBe("Pendiente")
  expect(fiscalStatus(withPayment, "2026-01-21")).toBe("Vencido")
  const filed = { ...withPayment, filedOn: "2026-01-20" }
  expect(fiscalDue(filed)).toBe("2026-02-01")
  expect(fiscalStatus(filed, "2026-02-02")).toBe("Vencido")
  expect(fiscalStatus({ ...filed, paidOn: "2026-02-01" }, "2026-02-02")).toBe(
    "Completado"
  )
  expect(fiscalDatesChanged(task, withPayment)).toBe(true)
  expect(fiscalDatesChanged(withPayment, filed)).toBe(false)
})

it("uses the Madrid date around UTC midnight", () => {
  expect(madridDate(new Date("2026-07-19T22:30:00Z"))).toBe("2026-07-20")
})
