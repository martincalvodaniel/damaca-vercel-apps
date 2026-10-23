"use client"

import { ModalDialog } from "@/components/ui/modal-dialog"
import { getPurchasePlaces } from "@/features/catalog/purchase-places"
import type { InventoryItem } from "@/schemas/inventory-item"
import { InventoryForm } from "./inventory-form"
import { InventoryList } from "./inventory-list"

interface InventoryManagerProps {
  items: InventoryItem[]
  search: string
  onSearchChange: (search: string) => void
  editingItem: InventoryItem | null
  isFormOpen: boolean
  onEdit: (item: InventoryItem) => void
  onClose: () => void
}

export function InventoryManager({
  items,
  search,
  onSearchChange,
  editingItem,
  isFormOpen,
  onEdit,
  onClose,
}: InventoryManagerProps) {
  const purchasePlaces = getPurchasePlaces(items)

  return (
    <div className="py-7 lg:py-10">
      <InventoryList
        items={items}
        search={search}
        onSearchChange={onSearchChange}
        onEdit={onEdit}
      />
      <ModalDialog
        open={isFormOpen}
        ariaLabel={
          editingItem ? `Editar ${editingItem.name}` : "Añadir producto"
        }
        onDismiss={onClose}
      >
        {isFormOpen ? (
          <InventoryForm
            key={editingItem?.id ?? `new-item-${items.length}`}
            item={editingItem}
            initialName={search.trim()}
            purchasePlaces={purchasePlaces}
            onCancel={onClose}
            onSaved={onClose}
          />
        ) : null}
      </ModalDialog>
    </div>
  )
}
