import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { requireAuth } from "@/lib/auth/require-auth"
import { MongoFiscalDraftRepository } from "@/lib/db/repositories/mongo-fiscal-draft-repository"
import { MongoPaymentRepository } from "@/lib/db/repositories/mongo-payment-repository"
import { madridDate } from "@/lib/domain/services/fiscal-calendar"
import {
  calculateFiscalDraft,
  fiscalDocuments,
  fiscalInputKey,
  fiscalInputs,
} from "@/lib/domain/services/fiscal-draft"
import { draftSelection, draftUpdate } from "@/schemas/fiscal-draft-validator"

const drafts = new MongoFiscalDraftRepository()
const payments = new MongoPaymentRepository()

function respond(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  })
}

function parseSelection(request: Request) {
  const params = new URL(request.url).searchParams
  return draftSelection.safeParse({
    year: params.get("year"),
    quarter: params.get("quarter"),
    model: params.get("model"),
  })
}

async function handle(request: Request, update: boolean) {
  try {
    const denied = await requireAuth()
    if (denied) return denied
    const session = await auth.api.getSession({ headers: await headers() })
    const owner = session?.user.id
    if (!owner) return respond({ error: "Sesión no disponible." }, 401)
    const selection = parseSelection(request)
    if (!selection.success)
      return respond({ error: "Modelo o período incorrecto." }, 400)
    const { year, model, quarter } = selection.data
    const today = madridDate()

    if (!update) {
      const [records, settings] = await Promise.all([
        payments.findAll({}),
        drafts.load(owner, year),
      ])
      return respond(
        calculateFiscalDraft(records, settings, model, year, quarter, today)
      )
    }

    const parsed = draftUpdate.safeParse(await request.json().catch(() => null))
    if (!parsed.success)
      return respond({ error: "Revisa los datos y el motivo." }, 400)
    const input = parsed.data
    if (input.action === "input") {
      if (
        !fiscalInputs(model).includes(input.name) ||
        (input.name === "obligation" && ![0, 1].includes(input.amount)) ||
        (!input.name.startsWith("declared") && input.amount < 0)
      )
        return respond({ error: "Dato fiscal incorrecto." }, 400)
      await drafts.input(owner, year, fiscalInputKey(input.name, quarter), {
        amount: input.amount,
        reason: input.reason,
      })
    } else {
      const { action, id, ...review } = input
      const [records, settings] = await Promise.all([
        payments.findAll({}),
        drafts.load(owner, year),
      ])
      const existing = fiscalDocuments(records, settings, today).documents.find(
        (item) => item.id === id
      )
      if (!existing || existing.fingerprint !== review.fingerprint) {
        return respond(
          { error: "El pago o la factura han cambiado. Recarga el borrador." },
          409
        )
      }
      if (
        review.reference &&
        (!existing.references.includes(review.reference) ||
          review.base === undefined ||
          review.vat === undefined)
      ) {
        return respond(
          { error: "Selecciona una factura e indica sus importes." },
          400
        )
      }
      const next = fiscalDocuments(
        records,
        {
          ...settings,
          reviews: { ...settings.reviews, [id]: review },
        },
        today
      ).documents.find((item) => item.id === id)
      if (
        review.date > today ||
        (next?.issue && review.classification === "ordinary")
      ) {
        return respond(
          {
            error:
              "La factura necesita resolver la incidencia antes de incorporarla.",
          },
          400
        )
      }
      await drafts.review(owner, year, id, review)
    }
    return respond({ ok: true })
  } catch (error) {
    console.error(`Fiscal draft request failed: ${error}`)
    return respond({ error: "No se pudo procesar el borrador." }, 500)
  }
}

export function GET(request: Request) {
  return handle(request, false)
}

export function PUT(request: Request) {
  return handle(request, true)
}
