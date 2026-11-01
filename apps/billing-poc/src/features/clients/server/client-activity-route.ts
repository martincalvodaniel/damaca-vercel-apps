import "server-only"
import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/auth/require-auth"
import { MongoClientRepository } from "@/lib/db/repositories/mongo-client-repository"
import { MongoCommissionRepository } from "@/lib/db/repositories/mongo-commission-repository"
import { MongoPaymentRepository } from "@/lib/db/repositories/mongo-payment-repository"
import { loadClientActivity } from "@/lib/domain/services/client-activity"

const repositories = {
  clients: new MongoClientRepository(),
  payments: new MongoPaymentRepository(),
  commissions: new MongoCommissionRepository(),
  firings: new MongoCommissionRepository("firings"),
}
const clientIdSchema = z.string().regex(/^[a-f\d]{24}$/i)

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await requireAuth()
    if (denied) return denied
    const { id } = await params
    if (!clientIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 })
    }
    const activity = await loadClientActivity(id, repositories)
    if (!activity) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    return NextResponse.json(activity)
  } catch (error) {
    console.error(`Error fetching client activity: ${error}`)
    return NextResponse.json(
      { error: "Failed to fetch client activity" },
      { status: 500 }
    )
  }
}
