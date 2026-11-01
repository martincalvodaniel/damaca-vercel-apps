"use client"

import { useCallback } from "react"

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

  const changeProductSearch = useCallback(
    (productSearch: string) => onChange({ ...ingredient, productSearch }),
    [onChange, ingredient]
  )

  const selectProduct = useCallback(
    (inventoryItemId: string) =>
      onChange({
        ...ingredient,
        inventoryItemId,
        legacyName: undefined,
        productSearch: undefined,
      }),
    [onChange, ingredient]
  )

  const changeQuantity = useCallback(
    (quantity: string) => onChange({ ...ingredient, quantity }),
    [onChange, ingredient]
  )

  return (
    <div className="rounded-2xl border border-border bg-field p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-bold text-muted">
          {selectedProduct?.name ?? `INGREDIENTE ${index + 1}`}
        </p>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="rounded-full px-2 py-0.5 text-xs font-semibold text-primary transition hover:bg-danger-soft focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 sm:px-2.5 sm:py-1"
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
              className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-primary underline decoration-accent underline-offset-4 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            >
              + Crear producto nuevo
            </button>
          </div>
          <ProductPicker
            id={`inventory-${ingredient.key}`}
            products={products}
            value={ingredient.inventoryItemId}
            initialSearch={ingredient.productSearch ?? ingredient.legacyName}
            onSearchChange={changeProductSearch}
            onValueChange={selectProduct}
            disabled={disabled}
            searchable
            showPurchasePlaces={false}
          />
        </div>
      )}
      {ingredient.legacyName && !ingredient.inventoryItemId ? (
        <p className="mt-2 rounded-xl bg-warning-soft px-3 py-2 text-xs leading-5 text-warning">
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
        onValueChange={changeQuantity}
        className="mt-2 sm:mt-3"
      />
    </div>
  )
}
