"use client"

import { useCallback, useState } from "react"
import type { InventoryItem } from "@/schemas/inventory-item"
import { InventoryManager } from "./inventory-manager"

interface InventoryPageProps {
  items: InventoryItem[]
}

export function InventoryPage({ items }: InventoryPageProps) {
  const [search, setSearch] = useState("")
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const closeForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingItem(null)
  }, [])

  const editItem = useCallback((item: InventoryItem) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }, [])

  const openCreateForm = useCallback(() => {
    setEditingItem(null)
    setIsFormOpen(true)
  }, [])

  return (
    <main className="min-h-screen overflow-x-clip bg-canvas px-4 py-5 text-ink sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5 sm:pb-2">
          <div className="hidden sm:block">
            <p className="hidden text-xs font-bold uppercase tracking-[0.2em] text-accent sm:block">
              Nuestro hogar
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Inventario
            </h1>
            <p className="mt-3 hidden max-w-2xl text-base leading-6 text-muted sm:block">
              Todo lo que tenemos en casa, visible de un vistazo para Dani y
              Pali.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-field px-3 py-1.5 text-xs font-semibold text-muted sm:px-4 sm:py-2 sm:text-sm">
              <span className="size-2 rounded-full bg-section-inventory" />
              {items.length} {items.length === 1 ? "producto" : "productos"}
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

        <InventoryManager
          items={items}
          search={search}
          onSearchChange={setSearch}
          editingItem={editingItem}
          isFormOpen={isFormOpen}
          onEdit={editItem}
          onClose={closeForm}
        />
      </div>
    </main>
  )
}
