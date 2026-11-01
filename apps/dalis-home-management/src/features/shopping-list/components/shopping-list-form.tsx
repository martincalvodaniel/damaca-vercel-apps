"use client"

import {
  type FormEvent,
  useCallback,
  useId,
  useState,
  useTransition,
} from "react"
import { DialogHeader } from "@/components/ui/dialog-header"
import { ErrorBanner } from "@/components/ui/error-banner"
import { QuantityInputStepper } from "@/components/ui/quantity-input-stepper"
import { CatalogProductDialog } from "@/features/catalog/components/catalog-product-dialog"
import { ProductPicker } from "@/features/catalog/components/product-picker"
import type { CatalogProductOption } from "@/features/catalog/product-option"
import { getPurchasePlaces } from "@/features/catalog/purchase-places"
import { createShoppingListItemAction } from "@/features/shopping-list/actions"

interface ShoppingListFormProps {
  products: CatalogProductOption[]
  initialProductSearch?: string
  onCancel: () => void
  onSaved: () => void
}

export function ShoppingListForm({
  products,
  initialProductSearch,
  onCancel,
  onSaved,
}: ShoppingListFormProps) {
  const formId = useId()
  const productId = useId()
  const quantityId = useId()
  const [availableProducts, setAvailableProducts] = useState(products)
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [productSearch, setProductSearch] = useState(initialProductSearch ?? "")
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const selectedProduct = availableProducts.find(
    (product) => product.id === selectedProductId
  )

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError(null)
      const form = event.currentTarget
      const input = {
        inventoryItemId: selectedProductId,
        quantity: Number(quantity),
      }

      startTransition(async () => {
        try {
          const result = await createShoppingListItemAction(input)

          if (!result.success) {
            setError(result.message)
            return
          }

          form.reset()
          setSelectedProductId("")
          setQuantity("1")
          onSaved()
        } catch {
          setError("No se ha podido guardar el producto. Inténtalo de nuevo.")
        }
      })
    },
    [selectedProductId, quantity, onSaved]
  )

  const handleProductCreated = useCallback(
    (product: CatalogProductOption, created: boolean) => {
      setAvailableProducts((current) =>
        current.some((entry) => entry.id === product.id)
          ? current
          : [...current, product].toSorted((left, right) =>
              left.name.localeCompare(right.name, "es", { sensitivity: "base" })
            )
      )
      setSelectedProductId(product.id)
      setNotice(
        created
          ? "Producto creado y seleccionado."
          : "El producto ya existía y ha quedado seleccionado."
      )
      setIsProductDialogOpen(false)
    },
    []
  )

  const openProductDialog = useCallback(() => setIsProductDialogOpen(true), [])

  const selectProduct = useCallback(
    (productId: string) => {
      setSelectedProductId(productId)
      const selectedProduct = availableProducts.find(
        (product) => product.id === productId
      )
      if (selectedProduct) {
        setProductSearch(selectedProduct.name)
      }
      setNotice(null)
    },
    [availableProducts]
  )

  const closeProductDialog = useCallback(
    () => setIsProductDialogOpen(false),
    []
  )

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#f8e7dd] dark:bg-[#412d24]">
      <DialogHeader
        title="¿Qué hace falta?"
        onDismiss={onCancel}
        cancelDisabled={isPending}
        confirmLabel={isPending ? "Guardando…" : "Añadir"}
        confirmDisabled={isPending}
        confirmForm={formId}
        pending={isPending}
      />

      <form
        id={formId}
        className="dialog-content space-y-4 p-4 sm:p-6"
        onSubmit={handleSubmit}
      >
        <div className="text-sm font-semibold">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={productId}>Producto</label>
            <button
              type="button"
              onClick={openProductDialog}
              disabled={isPending}
              className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-[#8e4d31] underline decoration-[#c98d72] underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[#a75938] disabled:opacity-60 dark:text-[#efb89e]"
            >
              + Crear producto nuevo
            </button>
          </div>
          <ProductPicker
            id={productId}
            products={availableProducts}
            value={selectedProductId}
            initialSearch={productSearch}
            onSearchChange={setProductSearch}
            onValueChange={selectProduct}
            disabled={isPending}
            searchable
            showPurchasePlaces={false}
            className="border-[#d8c5b8] bg-white/85 focus:border-[#a75938] focus:ring-[#a75938]/20 dark:bg-[#2e211c]"
          />
        </div>

        <div className="text-sm font-semibold">
          <label htmlFor={quantityId}>Cantidad a comprar</label>
          <QuantityInputStepper
            id={quantityId}
            value={quantity}
            unit={selectedProduct?.unit}
            minimum={0.01}
            label={selectedProduct?.name ?? "producto"}
            disabled={isPending}
            required
            onValueChange={setQuantity}
            className="mt-2"
            buttonClassName="border-[#d8c5b8] bg-white/85 text-[#8e4d31] hover:bg-white dark:border-white/15 dark:bg-[#2e211c] dark:text-[#efb89e] dark:hover:bg-white/10"
            fieldClassName="border-[#d8c5b8] bg-white/85 text-[#8e4d31] focus-within:border-[#a75938] focus-within:ring-[#a75938]/15 dark:border-white/15 dark:bg-[#2e211c] dark:text-[#efb89e]"
          />
        </div>

        {notice ? (
          <p className="text-xs font-semibold text-[#477052]" role="status">
            {notice}
          </p>
        ) : null}

        {error ? <ErrorBanner>{error}</ErrorBanner> : null}
      </form>
      <CatalogProductDialog
        key={
          isProductDialogOpen
            ? "catalog-product-open"
            : "catalog-product-closed"
        }
        open={isProductDialogOpen}
        initialName={productSearch.trim() || undefined}
        purchasePlaces={getPurchasePlaces(availableProducts)}
        onDismiss={closeProductDialog}
        onCreated={handleProductCreated}
      />
    </section>
  )
}
