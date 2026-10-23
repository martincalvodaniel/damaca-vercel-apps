"use client"

import { ModalDialog } from "@/components/ui/modal-dialog"
import type { CatalogProductOption } from "@/features/catalog/product-option"
import type { Dish } from "@/schemas/dish"
import { DishForm } from "./dish-form"
import { DishList } from "./dish-list"

interface DishManagerProps {
  dishes: Dish[]
  products: CatalogProductOption[]
  search: string
  onSearchChange: (search: string) => void
  editingDish: Dish | null
  isFormOpen: boolean
  onEdit: (dish: Dish) => void
  onClose: () => void
}

export function DishManager({
  dishes,
  products,
  search,
  onSearchChange,
  editingDish,
  isFormOpen,
  onEdit,
  onClose,
}: DishManagerProps) {
  return (
    <div className="py-7 xl:py-10">
      <DishList
        dishes={dishes}
        search={search}
        onSearchChange={onSearchChange}
        onEdit={onEdit}
      />
      <ModalDialog
        open={isFormOpen}
        ariaLabel={editingDish ? `Editar ${editingDish.name}` : "Añadir plato"}
        size="lg"
        onDismiss={onClose}
      >
        {isFormOpen ? (
          <DishForm
            key={editingDish?.id ?? "new-dish"}
            dish={editingDish}
            initialName={search.trim()}
            products={products}
            onCancel={onClose}
            onSaved={onClose}
          />
        ) : null}
      </ModalDialog>
    </div>
  )
}
