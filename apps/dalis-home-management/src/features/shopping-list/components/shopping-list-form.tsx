"use client"

import { type FormEvent, useId, useState, useTransition } from "react"
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
  }

  function handleProductCreated(
    product: CatalogProductOption,
    created: boolean
  ) {
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
  }

  return (
    <section className="rounded-[1.75rem] border border-[#e6d8cb] bg-[#f8e7dd]/75 p-5 shadow-[0_18px_50px_rgba(91,57,40,0.08)] sm:p-6 dark:border-[#704735] dark:bg-[#412d24]/80">
      <header className="sticky -top-5 z-10 -mx-5 -mt-5 border-b border-[#e6d8cb] bg-[#f8e7dd] px-5 pt-5 pb-4 sm:-top-6 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 dark:border-[#704735] dark:bg-[#412d24]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a75938] dark:text-[#efb89e]">
          Apuntar producto
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
          ¿Qué hace falta?
        </h2>
      </header>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="text-sm font-semibold">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={productId}>Producto</label>
            <button
              type="button"
              onClick={() => setIsProductDialogOpen(true)}
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
            onValueChange={(productId) => {
              setSelectedProductId(productId)
              const selectedProduct = availableProducts.find(
                (product) => product.id === productId
              )
              if (selectedProduct) {
                setProductSearch(selectedProduct.name)
              }
              setNotice(null)
            }}
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

        <div className="sticky -bottom-5 z-10 -mx-5 -mb-5 flex gap-2 border-t border-[#e6d8cb] bg-[#f8e7dd] px-5 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 dark:border-[#704735] dark:bg-[#412d24]">
          <button
            type="submit"
            disabled={isPending}
            className="order-2 inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#a75938] px-5 text-sm font-semibold text-white transition hover:bg-[#8e472c] focus:outline-none focus:ring-2 focus:ring-[#a75938] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 dark:ring-offset-[#412d24]"
          >
            {isPending ? "Guardando…" : "Añadir"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="order-1 inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#d8c5b8] px-5 text-sm font-semibold transition hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#a75938] disabled:opacity-60 dark:border-white/15 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
        </div>
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
        onDismiss={() => setIsProductDialogOpen(false)}
        onCreated={handleProductCreated}
      />
    </section>
  )
}
