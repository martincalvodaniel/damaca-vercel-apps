import "server-only"

import type {
  FiscalInput,
  FiscalReview,
} from "@/lib/domain/entities/fiscal-draft"
import type { FiscalDraftRepository } from "@/lib/domain/ports/fiscal-draft-repository"
import { getDatabase } from "../client"
import type { MongoFiscalDraft } from "../types"

async function collection() {
  return (await getDatabase()).collection<MongoFiscalDraft>("fiscalDrafts")
}

function key(owner: string, year: number) {
  return JSON.stringify([owner, year])
}

export class MongoFiscalDraftRepository implements FiscalDraftRepository {
  async load(owner: string, year: number) {
    const record = await (await collection()).findOne({ _id: key(owner, year) })
    return { reviews: record?.reviews ?? {}, inputs: record?.inputs ?? {} }
  }

  async review(owner: string, year: number, id: string, review: FiscalReview) {
    await (await collection()).updateOne(
      { _id: key(owner, year) },
      { $set: { [`reviews.${id}`]: review } },
      { upsert: true }
    )
  }

  async input(owner: string, year: number, id: string, input: FiscalInput) {
    await (await collection()).updateOne(
      { _id: key(owner, year) },
      { $set: { [`inputs.${id}`]: input } },
      { upsert: true }
    )
  }
}
