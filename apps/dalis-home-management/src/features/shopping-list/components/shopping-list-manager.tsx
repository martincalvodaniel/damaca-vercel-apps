import { ModalDialog } from "@/components/ui/modal-dialog"
import type { CatalogProductOption } from "@/features/catalog/product-option"
import type { ShoppingListItem } from "@/schemas/shopping-list-item"
import { ShoppingList } from "./shopping-list"
import { ShoppingListForm } from "./shopping-list-form"

interface ShoppingListManagerProps {
  items: ShoppingListItem[]
  products: CatalogProductOption[]
  search: string
  onSearchChange: (search: string) => void
  isFormOpen: boolean
  onClose: () => void
}

export function ShoppingListManager({
  items,
  products,
  search,
  onSearchChange,
  isFormOpen,
  onClose,
}: ShoppingListManagerProps) {
  return (
    <div className="py-7 lg:py-10">
      <ShoppingList
        items={items}
        products={products}
        search={search}
        onSearchChange={onSearchChange}
      />
      <ModalDialog
        open={isFormOpen}
        ariaLabel="Añadir producto"
        onDismiss={onClose}
      >
        {isFormOpen ? (
          <ShoppingListForm
            key="new-item"
            products={products}
            initialProductSearch={search.trim()}
            onCancel={onClose}
            onSaved={onClose}
          />
        ) : null}
      </ModalDialog>
    </div>
  )
}
