import type {
  Commission,
  CommissionFields,
} from "@/lib/domain/entities/commission"
import type { MongoCommission } from "../types"
import { MongoUpdateBuilder, omitNullish, toObjectId } from "./mongo-utils"

export function commissionToDomain(doc: MongoCommission): Commission {
  return {
    ...doc,
    _id: doc._id?.toString(),
    clientId: doc.clientId?.toString(),
    paymentId: doc.paymentId?.toString(),
    paymentGeneration: doc.paymentGeneration
      ? {
          ...doc.paymentGeneration,
          paymentId: doc.paymentGeneration.paymentId.toString(),
        }
      : undefined,
  }
}

export function commissionToMongo(
  data: Omit<Commission, "_id">
): MongoCommission {
  return omitNullish({
    ...data,
    clientId: data.clientId ? toObjectId(data.clientId) : undefined,
    paymentId: data.paymentId ? toObjectId(data.paymentId) : undefined,
    paymentGeneration: data.paymentGeneration
      ? {
          ...data.paymentGeneration,
          paymentId: toObjectId(data.paymentGeneration.paymentId),
        }
      : undefined,
    concepts: data.concepts.map(({ productId, name, amount, quantity }) => ({
      name,
      amount,
      quantity,
      ...(productId ? { productId } : {}),
    })),
  }) as MongoCommission
}

export function buildCommissionUpdate(fields: Partial<CommissionFields>) {
  const builder = new MongoUpdateBuilder().set("updatedAt", new Date())
  if (fields.concepts !== undefined)
    builder.set(
      "concepts",
      fields.concepts.map(({ productId, name, amount, quantity }) => ({
        name,
        amount,
        quantity,
        ...(productId ? { productId } : {}),
      }))
    )
  for (const key of ["title", "vat", "paymentStatus"] as const) {
    if (fields[key] !== undefined) builder.set(key, fields[key])
  }
  for (const key of ["description", "dueDate", "clientId"] as const) {
    if (key in fields)
      builder.setOrUnset(
        key,
        key === "clientId" && fields[key]
          ? toObjectId(fields[key])
          : fields[key] || undefined
      )
  }
  return builder.build()
}
