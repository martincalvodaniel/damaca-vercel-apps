"use client"

import { QuantityInputStepper } from "@/components/ui/quantity-input-stepper"
import { ProductPicker } from "@/features/catalog/components/product-picker"
import type { CatalogProductOption } from "@/features/catalog/product-option"

export interface IngredientDraft {
  key: string
  quantity: string
  inventoryItemId: string
  legacyName?: string
  productSearch?: string
}

interface IngredientRowProps {
  index: number
  ingredient: IngredientDraft
  products: CatalogProductOption[]
  canRemove: boolean
  disabled: boolean
  onChange: (ingredient: IngredientDraft) => void
  onRemove: () => void
  onRequestProductCreation: () => void
}

export function IngredientRow({
  index,
  ingredient,
  products,
  canRemove,
  disabled,
  onChange,
  onRemove,
  onRequestProductCreation,
}: IngredientRowProps) {
  const selectedProduct = products.find(
    (product) => product.id === ingredient.inventoryItemId
  )

  return (
    <div className="rounded-2xl border border-[#ded9c7] bg-white/65 p-3 sm:p-4 dark:border-white/10 dark:bg-[#182e26]/80">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-bold text-[#7e806d] dark:text-[#adb3a4]">
          {selectedProduct?.name ?? `INGREDIENTE ${index + 1}`}
        </p>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="rounded-full px-2 py-0.5 text-xs font-semibold text-[#92523e] transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-50 sm:px-2.5 sm:py-1 dark:text-[#e9a995] dark:hover:bg-red-950/30"
          >
            Quitar
          </button>
        ) : null}
      </div>

      {selectedProduct ? null : (
        <div className="mt-2 text-xs font-semibold sm:mt-3">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={`inventory-${ingredient.key}`}>Producto</label>
            <button
              type="button"
              onClick={onRequestProductCreation}
              disabled={disabled}
              className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-[#75611f] underline decoration-[#b4a66e] underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[#8a7633] disabled:opacity-60 dark:text-[#dccb8d]"
            >
              + Crear producto nuevo
            </button>
          </div>
          <ProductPicker
            id={`inventory-${ingredient.key}`}
            products={products}
            value={ingredient.inventoryItemId}
            initialSearch={ingredient.productSearch ?? ingredient.legacyName}
            onSearchChange={(productSearch) =>
              onChange({ ...ingredient, productSearch })
            }
            onValueChange={(inventoryItemId) =>
              onChange({
                ...ingredient,
                inventoryItemId,
                legacyName: undefined,
                productSearch: undefined,
              })
            }
            disabled={disabled}
            searchable
            showPurchasePlaces={false}
            className="border-[#d0c69d] bg-white focus:border-[#8a7633] focus:ring-[#8a7633]/20 dark:bg-[#10231c]"
          />
        </div>
      )}
      {ingredient.legacyName && !ingredient.inventoryItemId ? (
        <p className="mt-2 rounded-xl bg-[#fff3cd] px-3 py-2 text-xs leading-5 text-[#6f5a16] dark:bg-[#594917]/45 dark:text-[#f1dc93]">
          “{ingredient.legacyName}” procede de un plato antiguo. Selecciona o
          crea su producto para volver a guardar el plato.
        </p>
      ) : null}

      <QuantityInputStepper
        id={`ingredient-quantity-${ingredient.key}`}
        value={ingredient.quantity}
        unit={selectedProduct?.unit}
        minimum={0.01}
        label={selectedProduct?.name ?? `ingrediente ${index + 1}`}
        disabled={disabled}
        required
        onValueChange={(quantity) => onChange({ ...ingredient, quantity })}
        className="mt-2 sm:mt-3"
      />
    </div>
  )
}
