import { describe, expect, test as it } from "bun:test"
import type { Commission } from "../entities/commission"
import type { Payment } from "../entities/payment"
import type { CommissionRepository } from "../ports/commission-repository"
import type { PaymentRepository } from "../ports/payment-repository"
import {
  deleteCommission,
  generateCommissionPayment,
  updateCommission,
} from "./commission-service"

function fixture(overrides: Partial<Commission> = {}) {
  let commission: Commission | null = {
    _id: "commission-1",
    title: "Custom cups",
    prepaidAmount: 35.5,
    concepts: [
      { name: "Cup", amount: 60.5, quantity: 2, productId: "product-1" },
    ],
    vat: 21,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
  const records = new Map<string, Payment>()
  let failCreate = false
  let failLink = false
  let inserts = 0
  let updates = 0
  const commissions: CommissionRepository = {
    findAll: async () => (commission ? [structuredClone(commission)] : []),
    findById: async () => (commission ? structuredClone(commission) : null),
    findByPaymentId: async (id) =>
      commission?.paymentId === id ? structuredClone(commission) : null,
    create: async () => "commission-1",
    update: async (_id, fields) => {
      if (!commission || commission.paymentGeneration) return false
      commission = { ...commission, ...fields }
      return true
    },
    delete: async () => {
      if (!commission || commission.paymentGeneration) return false
      commission = null
      return true
    },
    reservePayment: async (_id, date, method) => {
      if (!commission) return null
      if (
        !commission.paymentGeneration &&
        !commission.paymentId &&
        commission.concepts.length
      ) {
        commission.paymentGeneration = {
          paymentId: "payment-1",
          date,
          paymentMethod: method,
        }
      }
      return structuredClone(commission)
    },
    completePayment: async (_id, generation) => {
      if (failLink) throw new Error("Link unavailable")
      if (!commission) return false
      commission.paymentId = generation.paymentId
      delete commission.paymentGeneration
      return true
    },
    unlinkPayment: async (id) => {
      if (commission?.paymentId === id) delete commission.paymentId
    },
  }
  const payments: PaymentRepository = {
    findAll: async () => [...records.values()],
    findAllWithGeneratedInvoices: async () => [],
    findById: async (id) => records.get(id) ?? null,
    create: async (data, id = "unused") => {
      if (failCreate) throw new Error("Insert unavailable")
      if (records.has(id)) throw new Error("Duplicate key")
      records.set(id, { ...data, _id: id, hidden: true })
      inserts++
      return id
    },
    update: async (id, data) => {
      const old = records.get(id)
      if (!old) return false
      updates++
      records.set(id, { ...old, ...data })
      return true
    },
    delete: async (id) => records.delete(id),
    findDistinctTags: async () => [],
    appendInvoice: async () => true,
    removeLinkInvoice: async () => true,
    removeGeneratedInvoices: async () => 0,
  }
  return {
    commissions,
    payments,
    records,
    get inserts() {
      return inserts
    },
    get updates() {
      return updates
    },
    set failCreate(value: boolean) {
      failCreate = value
    },
    set failLink(value: boolean) {
      failLink = value
    },
  }
}

describe("commission payment generation", () => {
  it("generates full income without a client, preserves the informational prepaid amount, and copies product concepts without stock writes", async () => {
    const deps = fixture()
    const result = await generateCommissionPayment("commission-1", "card", deps)
    const payment = deps.records.get(result.paymentId)
    expect(payment).toMatchObject({
      type: "income",
      tag: "Encargo",
      paymentMethod: "card",
      vat: 21,
      total: 121,
      netAmount: 100,
      vatAmount: 21,
    })
    expect(payment?.clientId).toBeUndefined()
    expect(payment?.concepts[0]?.productId).toBe("product-1")
    expect(payment?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(
      (await deps.commissions.findById("commission-1"))?.prepaidAmount
    ).toBe(35.5)
    expect(
      (await deps.commissions.findById("commission-1"))?.paymentGeneration
    ).toBeUndefined()
  })
  it("rejects commissions without concepts", async () => {
    const deps = fixture({ concepts: [] })
    await expect(
      generateCommissionPayment("commission-1", "cash", deps)
    ).rejects.toThrow("At least one concept")
    expect(deps.inserts).toBe(0)
  })
  it("concurrent generation and later retries create a single payment", async () => {
    const deps = fixture()
    const results = await Promise.all(
      Array.from({ length: 12 }, () =>
        generateCommissionPayment("commission-1", "cash", deps)
      )
    )
    expect(new Set(results.map((result) => result.paymentId)).size).toBe(1)
    expect(deps.inserts).toBe(1)
    expect(
      await generateCommissionPayment("commission-1", "card", deps)
    ).toEqual({ paymentId: "payment-1", alreadyExists: true })
    expect(deps.records.get("payment-1")?.paymentMethod).toBe("cash")
  })
  it("retries failed creation using the first reserved method and blocks edits/deletion while pending", async () => {
    const deps = fixture()
    deps.failCreate = true
    await expect(
      generateCommissionPayment("commission-1", "bank_transfer", deps)
    ).rejects.toThrow("Insert unavailable")
    await expect(
      updateCommission("commission-1", { title: "Changed" }, deps)
    ).rejects.toThrow("pending payment")
    await expect(deleteCommission("commission-1", deps)).rejects.toThrow(
      "pending payment"
    )
    deps.failCreate = false
    await generateCommissionPayment("commission-1", "cash", deps)
    expect(deps.records.get("payment-1")?.paymentMethod).toBe("bank_transfer")
    expect(deps.inserts).toBe(1)
  })
  it("recovers from failure after insertion without creating an orphan or another payment", async () => {
    const deps = fixture()
    deps.failLink = true
    await expect(
      generateCommissionPayment("commission-1", "cash", deps)
    ).rejects.toThrow("Link unavailable")
    expect(deps.inserts).toBe(1)
    expect(
      (await deps.commissions.findById("commission-1"))?.paymentGeneration
        ?.paymentId
    ).toBe("payment-1")
    deps.failLink = false
    expect(
      (await generateCommissionPayment("commission-1", "card", deps))
        .alreadyExists
    ).toBe(true)
    expect(deps.inserts).toBe(1)
    expect((await deps.commissions.findByPaymentId("payment-1"))?._id).toBe(
      "commission-1"
    )
  })
})

describe("commission payment lifecycle", () => {
  it("synchronizes concepts/client/VAT while preserving date, method, discount and surcharge", async () => {
    const deps = fixture({ clientId: "client-1" })
    await generateCommissionPayment("commission-1", "card", deps)
    const original = deps.records.get("payment-1") as Payment
    deps.records.set("payment-1", {
      ...original,
      date: "2026-01-02",
      discount: 10,
      surcharge: -15,
    })
    const result = await updateCommission(
      "commission-1",
      {
        concepts: [{ name: "New work", amount: 242, quantity: 1 }],
        clientId: undefined,
        vat: 21,
      },
      deps
    )
    expect(result.paymentSync).toBe("updated")
    expect(deps.records.get("payment-1")).toMatchObject({
      date: "2026-01-02",
      paymentMethod: "card",
      clientId: "",
      vat: 21,
      discount: 10,
      surcharge: -15,
      total: 203.24,
      netAmount: 191.74,
    })
  })
  it("prepaid-only changes do not update or reduce the payment", async () => {
    const deps = fixture()
    await generateCommissionPayment("commission-1", "cash", deps)
    expect(
      (await updateCommission("commission-1", { prepaidAmount: 40.75 }, deps))
        .paymentSync
    ).toBe("unchanged")
    expect(deps.updates).toBe(0)
    expect(deps.records.get("payment-1")?.total).toBe(121)
    expect(
      (await deps.commissions.findById("commission-1"))?.prepaidAmount
    ).toBe(40.75)
  })
  it.each([false, true])(
    "preserves generated invoices including legacy metadata (legacy: %s)",
    async (legacy) => {
      const deps = fixture()
      await generateCommissionPayment("commission-1", "cash", deps)
      const payment = deps.records.get("payment-1") as Payment
      const invoice = {
        type: "Invoice" as const,
        id: "F26_001",
        generatedAt: new Date(),
      }
      deps.records.set("payment-1", {
        ...payment,
        ...(legacy ? { invoice } : { invoices: [invoice] }),
      })
      expect(
        (await updateCommission("commission-1", { vat: 0 }, deps)).paymentSync
      ).toBe("invoiced")
      expect(deps.records.get("payment-1")?.vat).toBe(21)
      expect((await deps.commissions.findById("commission-1"))?.vat).toBe(0)
      expect(deps.updates).toBe(0)
    }
  )
  it("external invoice links do not block synchronization", async () => {
    const deps = fixture()
    await generateCommissionPayment("commission-1", "cash", deps)
    const payment = deps.records.get("payment-1") as Payment
    deps.records.set("payment-1", {
      ...payment,
      invoices: [
        {
          type: "Invoice",
          link: "https://example.com/invoice.pdf",
          generatedAt: new Date(),
        },
      ],
    })
    expect(
      (await updateCommission("commission-1", { vat: 0 }, deps)).paymentSync
    ).toBe("updated")
  })
  it("cannot remove the last concept once linked", async () => {
    const deps = fixture()
    await generateCommissionPayment("commission-1", "cash", deps)
    await expect(
      updateCommission("commission-1", { concepts: [] }, deps)
    ).rejects.toThrow("at least one concept")
  })
  it("payment deletion unlinks and allows regeneration; commission deletion preserves the payment", async () => {
    const deps = fixture()
    await generateCommissionPayment("commission-1", "cash", deps)
    await deps.payments.delete("payment-1")
    await deps.commissions.unlinkPayment("payment-1")
    expect(
      (await deps.commissions.findById("commission-1"))?.paymentId
    ).toBeUndefined()
    await generateCommissionPayment("commission-1", "card", deps)
    await deleteCommission("commission-1", deps)
    expect(deps.records.size).toBe(1)
    expect(await deps.commissions.findByPaymentId("payment-1")).toBeNull()
  })
})
