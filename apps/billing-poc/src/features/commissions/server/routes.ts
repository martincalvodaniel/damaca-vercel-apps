import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/require-auth"
import { getClientById } from "@/lib/db/cache"
import { MongoCommissionRepository } from "@/lib/db/repositories/mongo-commission-repository"
import { MongoPaymentRepository } from "@/lib/db/repositories/mongo-payment-repository"
import {
  CommissionError,
  deleteCommission,
  generateCommissionPayment,
  updateCommission,
} from "@/lib/domain/services/commission-service"
import { zodError } from "@/lib/utils/validation"
import {
  commissionIdSchema,
  createCommissionSchema,
  generateCommissionPaymentSchema,
  updateCommissionSchema,
} from "@/schemas/commission-validator"

type Params = { params: Promise<{ id: string }> }
export function createCommissionRoutes(resource: "commissions" | "firings") {
  const commissions = new MongoCommissionRepository(resource)
  const payments = new MongoPaymentRepository()
  const deps = {
    commissions,
    payments,
    paymentTag:
      resource === "firings" ? ("Cocción" as const) : ("Encargo" as const),
  }
  function failure(error: unknown) {
    if (error instanceof CommissionError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    if (error instanceof SyntaxError)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    console.error(`Commission request failed: ${error}`)
    return NextResponse.json(
      { error: "Commission request failed" },
      { status: 500 }
    )
  }
  async function validateClient(clientId?: string) {
    if (clientId && !(await getClientById(clientId)))
      throw new CommissionError("Client not found", 404)
  }
  function validateId(id: string) {
    const result = commissionIdSchema.safeParse({ id })
    if (!result.success) throw new CommissionError(zodError(result.error), 400)
  }

  async function list() {
    try {
      const denied = await requireAuth()
      if (denied) return denied
      return NextResponse.json({ commissions: await commissions.findAll() })
    } catch (error) {
      return failure(error)
    }
  }
  async function create(request: NextRequest) {
    try {
      const denied = await requireAuth()
      if (denied) return denied
      const parsed = createCommissionSchema.safeParse(await request.json())
      if (!parsed.success)
        return NextResponse.json(
          { error: zodError(parsed.error) },
          { status: 400 }
        )
      await validateClient(parsed.data.clientId)
      const now = new Date()
      const id = await commissions.create({
        ...parsed.data,
        createdAt: now,
        updatedAt: now,
      })
      return NextResponse.json({ success: true, id }, { status: 201 })
    } catch (error) {
      return failure(error)
    }
  }
  async function update(request: NextRequest) {
    try {
      const denied = await requireAuth()
      if (denied) return denied
      const parsed = updateCommissionSchema.safeParse(await request.json())
      if (!parsed.success)
        return NextResponse.json(
          { error: zodError(parsed.error) },
          { status: 400 }
        )
      const { id, ...fields } = parsed.data
      await validateClient(fields.clientId)
      return NextResponse.json(await updateCommission(id, fields, deps))
    } catch (error) {
      return failure(error)
    }
  }
  async function remove(request: NextRequest) {
    try {
      const denied = await requireAuth()
      if (denied) return denied
      const parsed = commissionIdSchema.safeParse(await request.json())
      if (!parsed.success)
        return NextResponse.json(
          { error: zodError(parsed.error) },
          { status: 400 }
        )
      return NextResponse.json(await deleteCommission(parsed.data.id, deps))
    } catch (error) {
      return failure(error)
    }
  }
  async function getCommission(_request: NextRequest, { params }: Params) {
    try {
      const denied = await requireAuth()
      if (denied) return denied
      const { id } = await params
      validateId(id)
      const commission = await commissions.findById(id)
      if (!commission) throw new CommissionError("Commission not found", 404)
      return NextResponse.json({ commission })
    } catch (error) {
      return failure(error)
    }
  }
  async function generatePayment(request: NextRequest, { params }: Params) {
    try {
      const denied = await requireAuth()
      if (denied) return denied
      const { id } = await params
      validateId(id)
      const parsed = generateCommissionPaymentSchema.safeParse(
        await request.json()
      )
      if (!parsed.success)
        return NextResponse.json(
          { error: zodError(parsed.error) },
          { status: 400 }
        )
      const result = await generateCommissionPayment(
        id,
        parsed.data.paymentMethod,
        deps
      )
      return NextResponse.json(
        { success: true, ...result },
        { status: result.alreadyExists ? 200 : 201 }
      )
    } catch (error) {
      return failure(error)
    }
  }
  async function getByPayment(
    _request: NextRequest,
    { params }: { params: Promise<{ paymentId: string }> }
  ) {
    try {
      const denied = await requireAuth()
      if (denied) return denied
      const { paymentId } = await params
      validateId(paymentId)
      const commission = await commissions.findByPaymentId(paymentId)
      return NextResponse.json({
        commission: commission
          ? { id: commission._id, title: commission.title }
          : null,
      })
    } catch (error) {
      return failure(error)
    }
  }

  return {
    GET: list,
    POST: create,
    PUT: update,
    DELETE: remove,
    getCommission,
    generatePayment,
    getByPayment,
  }
}
export const {
  GET,
  POST,
  PUT,
  DELETE,
  getCommission,
  generatePayment,
  getByPayment,
} = createCommissionRoutes("commissions")
