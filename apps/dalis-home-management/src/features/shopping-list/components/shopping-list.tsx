"use client"

import { useDeferredValue, useId, useState } from "react"
import { PurchasePlaceFilter } from "@/features/catalog/components/purchase-place-filter"
import type { CatalogProductOption } from "@/features/catalog/product-option"
import {
  getPurchasePlaces,
  matchesSelectedPurchasePlaces,
  resolveSelectedPurchasePlaces,
} from "@/features/catalog/purchase-places"
import { useItemQuantities } from "@/features/shopping-list/hooks/use-item-quantities"
import { usePurchasedItems } from "@/features/shopping-list/hooks/use-purchased-items"
import type { ShoppingListItem } from "@/schemas/shopping-list-item"
import { ClearPurchasedButton } from "./clear-purchased-button"
import { ShoppingListItemRow } from "./shopping-list-item-row"

interface ShoppingListProps {
  items: ShoppingListItem[]
  products: CatalogProductOption[]
  search: string
  onSearchChange: (search: string) => void
}

const diacriticPattern = /\p{Diacritic}/gu

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(diacriticPattern, "")
    .toLocaleLowerCase("es")
}

export function ShoppingList({
  items: serverItems,
  products,
  search,
  onSearchChange,
}: ShoppingListProps) {
  const {
    items: purchasedItemsState,
    states,
    togglePurchased,
  } = usePurchasedItems(serverItems)
  const {
    items,
    states: quantityStates,
    updateQuantity,
  } = useItemQuantities(purchasedItemsState)
  const titleId = useId()
  const searchInputId = useId()
  const [selectedPurchasePlaces, setSelectedPurchasePlaces] = useState<
    string[]
  >([])
  const deferredSearch = useDeferredValue(search)
  const normalizedSearch = normalizeSearchText(deferredSearch.trim())
  const productsById = new Map(products.map((product) => [product.id, product]))
  const listedProductIds = new Set(
    items.map((item) => item.inventoryItemId).filter(Boolean)
  )
  const purchasePlaces = getPurchasePlaces(
    products.filter((product) => listedProductIds.has(product.id))
  )
  const effectivePurchasePlaces = resolveSelectedPurchasePlaces(
    purchasePlaces,
    selectedPurchasePlaces
  )
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      normalizeSearchText(item.name).includes(normalizedSearch)

    if (!matchesSearch) {
      return false
    }

    const product = item.inventoryItemId
      ? productsById.get(item.inventoryItemId)
      : undefined
    return matchesSelectedPurchasePlaces(
      product?.purchasePlaces ?? [],
      effectivePurchasePlaces
    )
  })
  const pendingItems = filteredItems.filter((item) => !item.isPurchased)
  const purchasedItems = filteredItems.filter((item) => item.isPurchased)

  if (items.length === 0) {
    return (
      <section className="grid min-h-72 place-items-center rounded-[1.75rem] border border-dashed border-[#d8c5b8] bg-white/35 p-8 text-center dark:border-white/15 dark:bg-white/[0.025]">
        <div className="max-w-sm">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f5dfd2] text-2xl dark:bg-[#4a3025]">
            <span aria-hidden="true">✓</span>
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
            La lista está vacía
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#697970] dark:text-[#aebbb3]">
            Añade lo primero que necesitéis en vuestra próxima compra.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby={titleId}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="hidden sm:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7a8a81] dark:text-[#9baaa1]">
            Por comprar
          </p>
          <h2
            id={titleId}
            className="mt-1 text-2xl font-semibold tracking-[-0.04em]"
          >
            Nuestra lista
          </h2>
        </div>
        <label className="sm:w-64" htmlFor={searchInputId}>
          <span className="sr-only">Buscar productos en la lista</span>
          <input
            id={searchInputId}
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar producto"
            className="min-h-11 w-full rounded-full border border-[#ccd5ca] bg-white/75 px-4 text-sm outline-none transition placeholder:text-[#8d9a92] focus:border-[#a75938] focus:ring-2 focus:ring-[#a75938]/15 dark:border-white/15 dark:bg-[#182e26]"
          />
        </label>
      </div>

      <PurchasePlaceFilter
        places={purchasePlaces}
        selectedPlaces={effectivePurchasePlaces}
        onSelectedPlacesChange={setSelectedPurchasePlaces}
      />

      {filteredItems.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[#d8c5b8] bg-white/35 px-5 py-10 text-center dark:border-white/15 dark:bg-white/[0.025]">
          <p className="font-semibold">No hay productos que coincidan.</p>
          <p className="mt-1 text-sm text-[#697970] dark:text-[#aebbb3]">
            Prueba con otro nombre o lugar de compra.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {pendingItems.length === 0 ? (
              <div className="rounded-2xl border border-[#dce5d9] bg-[#e9f0e7]/65 px-5 py-8 text-center dark:border-[#345245] dark:bg-[#203b31]">
                <p className="font-semibold">Todo comprado</p>
                <p className="mt-1 text-sm text-[#627268] dark:text-[#b7c5bc]">
                  No queda nada pendiente en la lista.
                </p>
              </div>
            ) : (
              pendingItems.map((item) => (
                <ShoppingListItemRow
                  key={item.id}
                  item={item}
                  onTogglePurchased={togglePurchased}
                  isSavingPurchase={states.get(item.id)?.isSaving ?? false}
                  purchaseError={states.get(item.id)?.error ?? null}
                  onQuantityChange={updateQuantity}
                  isSavingQuantity={
                    quantityStates.get(item.id)?.isSaving ?? false
                  }
                  quantityError={quantityStates.get(item.id)?.error ?? null}
                />
              ))
            )}
          </div>

          {purchasedItems.length > 0 ? (
            <div className="mt-8">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#89958e]">
                  Ya comprado
                </p>
                <ClearPurchasedButton
                  itemIds={purchasedItems.map((item) => item.id)}
                  disabled={
                    Array.from(states.values()).some(
                      (state) => state.isSaving
                    ) ||
                    Array.from(quantityStates.values()).some(
                      (state) => state.isSaving
                    )
                  }
                />
              </div>
              <div className="mt-3 space-y-3 opacity-75">
                {purchasedItems.map((item) => (
                  <ShoppingListItemRow
                    key={item.id}
                    item={item}
                    onTogglePurchased={togglePurchased}
                    isSavingPurchase={states.get(item.id)?.isSaving ?? false}
                    purchaseError={states.get(item.id)?.error ?? null}
                    onQuantityChange={updateQuantity}
                    isSavingQuantity={
                      quantityStates.get(item.id)?.isSaving ?? false
                    }
                    quantityError={quantityStates.get(item.id)?.error ?? null}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
