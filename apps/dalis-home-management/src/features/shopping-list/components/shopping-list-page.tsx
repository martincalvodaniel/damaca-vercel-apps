"use client"

import { useState } from "react"
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

  function closeForm() {
    setIsFormOpen(false)
  }

  return (
    <main className="min-h-screen bg-[#f5f4ee] px-4 py-5 text-[#17352b] sm:px-8 sm:py-8 dark:bg-[#10221c] dark:text-[#f4f1e7]">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-3 border-b border-[#d9ded3] pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5 sm:pb-6 dark:border-white/10">
          <div>
            <p className="hidden text-xs font-bold uppercase tracking-[0.2em] text-[#c36d49] sm:block">
              Nuestra próxima compra
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Lista de la compra
            </h1>
            <p className="mt-3 hidden max-w-2xl text-base leading-6 text-[#63736a] sm:block dark:text-[#b4c0b8]">
              Una lista común para que Dani y Pali podamos añadir y marcar lo
              que hace falta.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d6ddd3] bg-white/65 px-3 py-1.5 text-xs font-semibold text-[#53675c] sm:px-4 sm:py-2 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-[#c4d0c8]">
              <span className="size-2 rounded-full bg-[#e8966f]" />
              {pendingCount} {pendingCount === 1 ? "pendiente" : "pendientes"}
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-[#a75938] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#8e472c] focus:outline-none focus:ring-2 focus:ring-[#a75938] focus:ring-offset-2 sm:px-4 sm:py-2 sm:text-sm dark:ring-offset-[#10221c]"
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
