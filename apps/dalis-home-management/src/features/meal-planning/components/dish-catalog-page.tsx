"use client"

import { useCallback, useState } from "react"
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

  const closeForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingDish(null)
  }, [])

  const editDish = useCallback((dish: Dish) => {
    setEditingDish(dish)
    setIsFormOpen(true)
  }, [])

  const openCreateForm = useCallback(() => {
    setEditingDish(null)
    setIsFormOpen(true)
  }, [])

  return (
    <main className="min-h-screen bg-canvas px-4 py-5 text-ink sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5 sm:pb-2">
          <div className="hidden sm:block">
            <p className="hidden text-xs font-bold uppercase tracking-[0.2em] text-accent sm:block">
              Recetario de casa
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Nuestros platos
            </h1>
            <p className="mt-3 hidden max-w-2xl text-base leading-6 text-muted sm:block">
              Platos e ingredientes preparados para reutilizarlos cada semana en
              nuestro menú.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-field px-3 py-1.5 text-xs font-semibold text-muted sm:px-4 sm:py-2 sm:text-sm">
              <span className="size-2 rounded-full bg-section-dishes" />
              {dishes.length} {dishes.length === 1 ? "plato" : "platos"}
            </div>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:px-4 sm:py-2 sm:text-sm ring-offset-canvas"
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
