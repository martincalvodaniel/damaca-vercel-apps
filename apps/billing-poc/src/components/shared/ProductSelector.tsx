"use client"
import { useState } from "react"
import { useProducts } from "@/features/products/hooks/useProducts"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useStableCallback } from "@/hooks/useStableCallback"
import type { Product } from "@/lib/domain/entities/product"
import { formatCurrency } from "@/lib/utils/formatters"
import ClientQueryInput from "./ClientQueryInput"
import { filterProductSuggestions } from "./product-selector-utils"

export default function ProductSelector({
  onSelect,
  label = "Añadir producto",
}: {
  onSelect: (product: Product) => void
  label?: string
}) {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebouncedValue(query, 300)
  const { products, isLoading, error } = useProducts({ search: debouncedQuery })
  const suggestions = filterProductSuggestions(products, query)
  const pending = isLoading || query.trim() !== debouncedQuery.trim()
  function select(product: Product) {
    onSelect(product)
    setQuery("")
  }
  function keyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return
    event.preventDefault()
    if (!pending && !error && query.trim() && suggestions[0])
      select(suggestions[0])
  }
  function dropdown({
    closeDropdown,
  }: {
    closeDropdown: () => void
    trimmedValue: string
  }) {
    return (
      <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
        {error ? (
          <div
            role="alert"
            className="px-4 py-3 text-sm text-red-700 dark:text-red-400"
          >
            Products could not be loaded. You can still add free concepts.
          </div>
        ) : pending ? (
          <div
            role="status"
            className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400"
          >
            Loading…
          </div>
        ) : suggestions.length ? (
          <ul className="max-h-60 overflow-y-auto py-1">
            {suggestions.map((product) => (
              <ProductSuggestion
                key={product._id}
                product={product}
                onSelect={select}
                closeDropdown={closeDropdown}
              />
            ))}
          </ul>
        ) : (
          <div className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
            No products found
          </div>
        )}
      </div>
    )
  }
  return (
    <ClientQueryInput
      value={query}
      onChange={setQuery}
      onKeyDown={keyDown}
      label={label}
      placeholder="Buscar productos por nombre..."
      ariaLabel="Buscar productos por nombre"
      clearAriaLabel="Borrar búsqueda de productos"
      renderDropdown={dropdown}
    />
  )
}
function ProductSuggestion({
  product,
  onSelect,
  closeDropdown,
}: {
  product: Product
  onSelect: (product: Product) => void
  closeDropdown: () => void
}) {
  const choose = useStableCallback(() => {
    onSelect(product)
    closeDropdown()
  })
  const mouseDown = useStableCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault()
  )
  return (
    <li>
      <button
        type="button"
        onClick={choose}
        onMouseDown={mouseDown}
        className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:hover:bg-zinc-700"
      >
        <span className="min-w-0 truncate text-zinc-900 dark:text-zinc-100">
          {product.name}
        </span>
        <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
          {formatCurrency(product.finalPrice)}
        </span>
      </button>
    </li>
  )
}
