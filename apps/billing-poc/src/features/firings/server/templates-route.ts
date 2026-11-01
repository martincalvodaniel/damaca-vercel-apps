import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/require-auth"
import { MongoFiringTemplateRepository } from "@/lib/db/repositories/mongo-firing-template-repository"
import { zodError } from "@/lib/utils/validation"
import { commissionIdSchema } from "@/schemas/commission-validator"
import {
  firingTemplateSchema,
  updateFiringTemplateSchema,
} from "@/schemas/firing-template-validator"

const templates = new MongoFiringTemplateRepository()
function failure(error: unknown) {
  if (error instanceof SyntaxError)
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 })
  console.error(`Firing template request failed: ${error}`)
  return NextResponse.json(
    { error: "No se pudo procesar la plantilla" },
    { status: 500 }
  )
}
export async function GET() {
  try {
    const denied = await requireAuth()
    if (denied) return denied
    return NextResponse.json({ templates: await templates.findAll() })
  } catch (error) {
    return failure(error)
  }
}
export async function POST(request: NextRequest) {
  try {
    const denied = await requireAuth()
    if (denied) return denied
    const parsed = firingTemplateSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json(
        { error: zodError(parsed.error) },
        { status: 400 }
      )
    const now = new Date()
    const id = await templates.create({
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    })
    return NextResponse.json({ success: true, id }, { status: 201 })
  } catch (error) {
    return failure(error)
  }
}
export async function PUT(request: NextRequest) {
  try {
    const denied = await requireAuth()
    if (denied) return denied
    const parsed = updateFiringTemplateSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json(
        { error: zodError(parsed.error) },
        { status: 400 }
      )
    const { id, ...fields } = parsed.data
    if (!(await templates.update(id, fields)))
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      )
    return NextResponse.json({ success: true })
  } catch (error) {
    return failure(error)
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const denied = await requireAuth()
    if (denied) return denied
    const parsed = commissionIdSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json(
        { error: zodError(parsed.error) },
        { status: 400 }
      )
    if (!(await templates.delete(parsed.data.id)))
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      )
    return NextResponse.json({ success: true })
  } catch (error) {
    return failure(error)
  }
}
