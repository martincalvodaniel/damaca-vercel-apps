"use client"

import { ModalDialog } from "@/components/ui/modal-dialog"
import type { CatalogProductOption } from "@/features/catalog/product-option"
import type { Dish } from "@/schemas/dish"
import { DishForm, type DishFormMode } from "./dish-form"
import { DishList } from "./dish-list"

interface DishManagerProps {
  dishes: Dish[]
  products: CatalogProductOption[]
  search: string
  onSearchChange: (search: string) => void
  formMode: DishFormMode | null
  onEdit: (dish: Dish) => void
  onClone: (dish: Dish) => void
  onClose: () => void
}

export function DishManager({
  dishes,
  products,
  search,
  onSearchChange,
  formMode,
  onEdit,
  onClone,
  onClose,
}: DishManagerProps) {
  return (
    <div className="pt-2 pb-4">
      <DishList
        dishes={dishes}
        search={search}
        onSearchChange={onSearchChange}
        onEdit={onEdit}
        onClone={onClone}
      />
      <ModalDialog
        open={formMode !== null}
        ariaLabel={
          formMode?.kind === "edit"
            ? `Editar ${formMode.dish.name}`
            : "Añadir plato"
        }
        onDismiss={onClose}
      >
        {formMode ? (
          <DishForm
            key={
              formMode.kind === "create"
                ? "create"
                : `${formMode.kind}-${formMode.dish.id}`
            }
            mode={formMode}
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
