"use client"

import { useState } from "react"
import type { CatalogProductOption } from "@/features/catalog/product-option"
import type { Dish } from "@/schemas/dish"
import { DishManager } from "./dish-manager"

interface DishCatalogPageProps {
  dishes: Dish[]
  products: CatalogProductOption[]
}

export function DishCatalogPage({ dishes, products }: DishCatalogPageProps) {
  const [search, setSearch] = useState("")
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  function closeForm() {
    setIsFormOpen(false)
    setEditingDish(null)
  }

  function editDish(dish: Dish) {
    setEditingDish(dish)
    setIsFormOpen(true)
  }

  return (
    <main className="min-h-screen bg-[#f5f4ee] px-4 py-5 text-[#17352b] sm:px-8 sm:py-8 dark:bg-[#10221c] dark:text-[#f4f1e7]">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-3 border-b border-[#d9ded3] pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5 sm:pb-6 dark:border-white/10">
          <div>
            <p className="hidden text-xs font-bold uppercase tracking-[0.2em] text-[#c36d49] sm:block">
              Recetario de casa
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Nuestros platos
            </h1>
            <p className="mt-3 hidden max-w-2xl text-base leading-6 text-[#63736a] sm:block dark:text-[#b4c0b8]">
              Platos e ingredientes preparados para reutilizarlos cada semana en
              nuestro menú.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d6ddd3] bg-white/65 px-3 py-1.5 text-xs font-semibold text-[#53675c] sm:px-4 sm:py-2 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-[#c4d0c8]">
              <span className="size-2 rounded-full bg-[#d3a448]" />
              {dishes.length} {dishes.length === 1 ? "plato" : "platos"}
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingDish(null)
                setIsFormOpen(true)
              }}
              className="inline-flex items-center justify-center rounded-full bg-[#75611f] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#615018] focus:outline-none focus:ring-2 focus:ring-[#75611f] focus:ring-offset-2 sm:px-4 sm:py-2 sm:text-sm dark:ring-offset-[#10221c]"
            >
              + Añadir
            </button>
          </div>
        </header>

        <DishManager
          dishes={dishes}
          products={products}
          search={search}
          onSearchChange={setSearch}
          editingDish={editingDish}
          isFormOpen={isFormOpen}
          onEdit={editDish}
          onClose={closeForm}
        />
      </div>
    </main>
  )
}
