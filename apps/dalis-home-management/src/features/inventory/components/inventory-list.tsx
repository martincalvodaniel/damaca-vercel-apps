"use client"

import type * as React from "react"
import { useCallback, useDeferredValue, useId, useState } from "react"
import { SearchInput } from "@/components/ui/search-input"
import { PurchasePlaceFilter } from "@/features/catalog/components/purchase-place-filter"
import {
  getPurchasePlaces,
  matchesSelectedPurchasePlaces,
  resolveSelectedPurchasePlaces,
} from "@/features/catalog/purchase-places"
import { useInventoryQuantities } from "@/features/inventory/hooks/use-inventory-quantities"
import type { InventoryItem } from "@/schemas/inventory-item"
import { InventoryItemCard } from "./inventory-item-card"

interface InventoryListProps {
  items: InventoryItem[]
  search: string
  onSearchChange: (search: string) => void
  onEdit: (item: InventoryItem) => void
}

const diacriticPattern = /\p{Diacritic}/gu

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(diacriticPattern, "")
    .toLocaleLowerCase("es")
}

export function InventoryList({
  items: serverItems,
  search,
  onSearchChange,
  onEdit,
}: InventoryListProps) {
  const { items, states, updateQuantity } = useInventoryQuantities(serverItems)
  const listTitleId = useId()
  const searchInputId = useId()
  const [selectedPurchasePlaces, setSelectedPurchasePlaces] = useState<
    string[]
  >([])
  const deferredSearch = useDeferredValue(search)
  const normalizedSearch = normalizeSearchText(deferredSearch.trim())
  const purchasePlaces = getPurchasePlaces(items)
  const effectivePurchasePlaces = resolveSelectedPurchasePlaces(
    purchasePlaces,
    selectedPurchasePlaces
  )
  const filteredItems = items.filter((item) => {
    const matchesPurchasePlace = matchesSelectedPurchasePlaces(
      item.purchasePlaces,
      effectivePurchasePlaces
    )
    const matchesSearch =
      normalizedSearch.length === 0 ||
      normalizeSearchText(item.name).includes(normalizedSearch)

    return matchesPurchasePlace && matchesSearch
  })

  const clearSearch = useCallback(() => onSearchChange(""), [onSearchChange])

  const changeSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      onSearchChange(event.target.value),
    [onSearchChange]
  )

  if (items.length === 0) {
    return (
      <section className="grid min-h-48 place-items-center rounded-[1.75rem] border border-dashed border-border bg-field p-4 text-center">
        <div className="max-w-sm">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-2xl">
            <span aria-hidden="true">⌂</span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
            La casa está por estrenar
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Añade el primer producto para empezar a organizar lo que tenéis en
            casa.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby={listTitleId}>
      <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
        <div className="hidden sm:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
            En casa
          </p>
          <h2
            id={listTitleId}
            className="mt-1 text-2xl font-semibold tracking-[-0.04em]"
          >
            Nuestros productos
          </h2>
        </div>
        <div className="w-full sm:w-60">
          <label className="sr-only" htmlFor={searchInputId}>
            Buscar productos
          </label>
          <SearchInput
            id={searchInputId}
            onClear={clearSearch}
            value={search}
            onChange={changeSearch}
            placeholder="Buscar productos"
            className="min-h-9 w-full rounded-full border border-control-border bg-field px-4 text-sm outline-none transition placeholder:text-placeholder focus:border-ring focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <PurchasePlaceFilter
        places={purchasePlaces}
        selectedPlaces={effectivePurchasePlaces}
        onSelectedPlacesChange={setSelectedPurchasePlaces}
      />

      {filteredItems.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-border bg-field px-5 py-5 text-center">
          <p className="font-semibold">No hay productos que coincidan.</p>
          <p className="mt-1 text-sm text-muted">
            Prueba con otro nombre o lugar de compra.
          </p>
        </div>
      ) : (
        <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <InventoryItemCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onQuantityChange={updateQuantity}
              isSavingQuantity={states.get(item.id)?.isSaving ?? false}
              quantityError={states.get(item.id)?.error ?? null}
            />
          ))}
        </div>
      )}
    </section>
  )
}
