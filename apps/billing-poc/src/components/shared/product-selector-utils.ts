import type { Product } from "@/lib/domain/entities/product"
import { stripDiacritics } from "@/lib/utils/text-search"

export function filterProductSuggestions(
  products: readonly Product[],
  query: string
): Product[] {
  const normalized = stripDiacritics(query.trim().toLowerCase())
  return products.filter((product) =>
    stripDiacritics(product.name.toLowerCase()).includes(normalized)
  )
}
