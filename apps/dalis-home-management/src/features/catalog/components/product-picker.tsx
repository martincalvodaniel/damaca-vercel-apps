"use client"

import { useEffect, useId, useState } from "react"
import { SelectField } from "@/components/ui/select-field"
import { quantityUnitShortLabels } from "@/config/quantity-units"
import type { CatalogProductOption } from "@/features/catalog/product-option"

interface ProductPickerProps {
  id: string
  products: readonly CatalogProductOption[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  className?: string
  searchable?: boolean
  showPurchasePlaces?: boolean
  initialSearch?: string
  onSearchChange?: (value: string) => void
}

const diacriticPattern = /\p{Diacritic}/gu

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(diacriticPattern, "")
    .toLocaleLowerCase("es")
}

export function ProductPicker({
  id,
  products,
  value,
  onValueChange,
  disabled = false,
  className,
  searchable = false,
  showPurchasePlaces = true,
  initialSearch = "",
  onSearchChange,
}: ProductPickerProps) {
  const resultListId = useId()
  const selectedProduct = products.find((product) => product.id === value)
  const [search, setSearch] = useState(selectedProduct?.name ?? initialSearch)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (selectedProduct) {
      setSearch(selectedProduct.name)
    }
  }, [selectedProduct])

  const normalizedSearch = normalizeSearch(search.trim())
  const visibleProducts = products.filter(
    (product) =>
      normalizedSearch.length === 0 ||
      normalizeSearch(product.name).includes(normalizedSearch)
  )
  const options = [
    { value: "", label: "Selecciona un producto" },
    ...visibleProducts.map((product) => ({
      value: product.id,
      label: `${product.name} · ${quantityUnitShortLabels[product.unit]}${showPurchasePlaces && product.purchasePlaces.length > 0 ? ` · ${product.purchasePlaces.join(", ")}` : ""}`,
    })),
  ]

  if (searchable) {
    return (
      <div className="relative mt-2">
        <input
          id={id}
          type="search"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={resultListId}
          aria-autocomplete="list"
          value={search}
          onFocus={() => setIsOpen(true)}
          onBlur={(event) => {
            const nextTarget = event.relatedTarget
            if (
              !(nextTarget instanceof Node) ||
              !event.currentTarget.parentElement?.contains(nextTarget)
            ) {
              setIsOpen(false)
            }
          }}
          onChange={(event) => {
            const nextSearch = event.target.value
            setSearch(nextSearch)
            onSearchChange?.(nextSearch)
            setIsOpen(true)
            if (value) {
              onValueChange("")
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && visibleProducts[0]) {
              event.preventDefault()
              onValueChange(visibleProducts[0].id)
              setSearch(visibleProducts[0].name)
              setIsOpen(false)
            }
            if (event.key === "Escape") {
              setIsOpen(false)
            }
          }}
          disabled={disabled}
          placeholder="Escribe para buscar producto"
          autoComplete="off"
          className={`min-h-11 w-full rounded-xl border border-[#d8c5b8] bg-white/85 px-3 text-sm font-normal outline-none transition placeholder:text-[#9b887e] focus:border-[#a75938] focus:ring-2 focus:ring-[#a75938]/15 disabled:opacity-60 dark:border-white/15 dark:bg-[#2e211c] ${className ?? ""}`}
        />
        {isOpen ? (
          <div
            id={resultListId}
            className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-[#d8c5b8] bg-[#fffaf6] p-1 shadow-xl dark:border-white/15 dark:bg-[#2e211c]"
          >
            {visibleProducts.length > 0 ? (
              visibleProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    onValueChange(product.id)
                    setSearch(product.name)
                    setIsOpen(false)
                  }}
                  className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-sm font-medium transition hover:bg-[#f3e3d8] focus:bg-[#f3e3d8] focus:outline-none dark:hover:bg-white/10 dark:focus:bg-white/10"
                >
                  <span className="truncate">{product.name}</span>
                  <span className="shrink-0 text-xs text-[#8b7164] dark:text-[#c8afa2]">
                    {quantityUnitShortLabels[product.unit]}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-xs font-medium text-[#8f5140]">
                No hay productos que coincidan.
              </p>
            )}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div>
      <SelectField
        id={id}
        value={value}
        onValueChange={onValueChange}
        options={options}
        disabled={disabled}
        className={className}
      />
    </div>
  )
}
