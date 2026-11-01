import type {
  Commission,
  CommissionFields,
} from "@/lib/domain/entities/commission"
import type { Product } from "@/lib/domain/entities/product"

export function buildCommissionPatch(
  previous: Commission,
  next: CommissionFields
): Partial<CommissionFields> {
  const patch: Partial<CommissionFields> = {}
  for (const key of [
    "title",
    "description",
    "clientId",
    "dueDate",
    "paymentStatus",
    "concepts",
    "vat",
  ] as const) {
    const before = previous[key] ?? ""
    const after = next[key] ?? ""
    if (JSON.stringify(before) !== JSON.stringify(after))
      Object.assign(patch, { [key]: after })
  }
  return patch
}

export function buildProductConcept(product: Product) {
  return {
    ...(product._id ? { productId: product._id } : {}),
    name: product.name,
    amount: product.finalPrice,
    quantity: 1,
  }
}
