"use client"

import { useDeferredValue, useId, useState } from "react"
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

  if (items.length === 0) {
    return (
      <section className="grid min-h-72 place-items-center rounded-[1.75rem] border border-dashed border-[#cbd4ca] bg-white/35 p-8 text-center dark:border-white/15 dark:bg-white/[0.025]">
        <div className="max-w-sm">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#dfe9dc] text-2xl dark:bg-[#254338]">
            <span aria-hidden="true">⌂</span>
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
            La casa está por estrenar
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#697970] dark:text-[#aebbb3]">
            Añade el primer producto para empezar a organizar lo que tenéis en
            casa.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby={listTitleId}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="hidden sm:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7a8a81] dark:text-[#9baaa1]">
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
          <input
            id={searchInputId}
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar productos"
            className="min-h-11 w-full rounded-full border border-[#ccd5ca] bg-white/75 px-4 text-sm outline-none transition placeholder:text-[#8d9a92] focus:border-[#1d4f40] focus:ring-2 focus:ring-[#1d4f40]/15 dark:border-white/15 dark:bg-[#182e26]"
          />
        </div>
      </div>

      <PurchasePlaceFilter
        places={purchasePlaces}
        selectedPlaces={effectivePurchasePlaces}
        onSelectedPlacesChange={setSelectedPurchasePlaces}
      />

      {filteredItems.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-[#cbd4ca] bg-white/35 px-5 py-10 text-center dark:border-white/15 dark:bg-white/[0.025]">
          <p className="font-semibold">No hay productos que coincidan.</p>
          <p className="mt-1 text-sm text-[#697970] dark:text-[#aebbb3]">
            Prueba con otro nombre o lugar de compra.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
