"use client"

import { useCallback, useState } from "react"
import type { CatalogProductOption } from "@/features/catalog/product-option"
import type { ShoppingListItem } from "@/schemas/shopping-list-item"
import { ClearShoppingListButton } from "./clear-shopping-list-button"
import { ShoppingListManager } from "./shopping-list-manager"

interface ShoppingListPageProps {
  items: ShoppingListItem[]
  products: CatalogProductOption[]
}

export function ShoppingListPage({ items, products }: ShoppingListPageProps) {
  const [search, setSearch] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const pendingCount = items.filter((item) => !item.isPurchased).length

  const closeForm = useCallback(() => {
    setIsFormOpen(false)
  }, [])

  const openCreateForm = useCallback(() => setIsFormOpen(true), [])

  return (
    <main className="min-h-screen bg-canvas px-4 py-5 text-ink sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5 sm:pb-2">
          <div className="hidden sm:block">
            <p className="hidden text-xs font-bold uppercase tracking-[0.2em] text-accent sm:block">
              Nuestra próxima compra
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Lista de la compra
            </h1>
            <p className="mt-3 hidden max-w-2xl text-base leading-6 text-muted sm:block">
              Una lista común para que Dani y Pali podamos añadir y marcar lo
              que hace falta.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-field px-3 py-1.5 text-xs font-semibold text-muted sm:px-4 sm:py-2 sm:text-sm">
              <span className="size-2 rounded-full bg-section-shopping" />
              {pendingCount} {pendingCount === 1 ? "pendiente" : "pendientes"}
            </div>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:px-4 sm:py-2 sm:text-sm ring-offset-canvas"
            >
              + Añadir
            </button>
            <ClearShoppingListButton itemCount={items.length} />
          </div>
        </header>

        <ShoppingListManager
          items={items}
          products={products}
          search={search}
          onSearchChange={setSearch}
          isFormOpen={isFormOpen}
          onClose={closeForm}
        />
      </div>
    </main>
  )
}
