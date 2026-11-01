"use client"

import { useCallback, useId, useState } from "react"
import SuggestionInput from "@/components/shared/SuggestionInput"
import ClearButton from "@/components/ui/ClearButton"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import { ModalFormActions } from "@/components/ui/ModalFormActions"
import NumberStepperInput from "@/components/ui/NumberStepperInput"
import RequiredAsterisk from "@/components/ui/RequiredAsterisk"
import type { Product, ProductFormData } from "@/lib/domain/entities/product"

interface ProductFormProps {
  product?: Product
  availableTags: string[]
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
}

function toFormData(product?: Product): ProductFormData {
  return {
    name: product?.name ?? "",
    tag: product?.tag ?? "",
    finalPrice: product ? String(product.finalPrice) : "",
    stock: product?.stock != null ? String(product.stock) : null,
  }
}

export default function ProductForm({
  product,
  availableTags,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const id = useId()
  const [formData, setFormData] = useState<ProductFormData>(() =>
    toFormData(product)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = useCallback(
    (field: keyof ProductFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setError(null)
    },
    []
  )

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange("name", e.target.value)
    },
    [handleChange]
  )

  const handleFinalPriceChange = useCallback(
    (value: string) => handleChange("finalPrice", value),
    [handleChange]
  )

  const handleTagChange = useCallback(
    (value: string) => handleChange("tag", value),
    [handleChange]
  )

  const handleStockChange = useCallback(
    (value: string) => handleChange("stock", value),
    [handleChange]
  )

  const handleClearStock = useCallback(() => {
    handleStockChange("")
  }, [handleStockChange])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setError(null)

    const name = formData.name.trim()
    const tag = formData.tag.trim()
    const finalPrice = Number.parseFloat(formData.finalPrice)
    const stockInput = (formData.stock ?? "").trim()
    const stock =
      stockInput.length > 0 ? Number.parseFloat(stockInput) : undefined

    if (!name) {
      setError("El nombre es obligatorio")
      return
    }
    if (Number.isNaN(finalPrice) || finalPrice < 0) {
      setError("El precio final debe ser igual o superior a 0")
      return
    }
    if (
      stock !== undefined &&
      (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock))
    ) {
      setError("El stock debe ser un número entero igual o superior a 0")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        tag,
        finalPrice: formData.finalPrice,
        stock: stockInput.length > 0 ? stockInput : null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Se ha producido un error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form id={`${id}-form`} onSubmit={handleSubmit} className="space-y-4">
      {error ? <ErrorBanner bordered>{error}</ErrorBanner> : null}

      <div>
        <label
          htmlFor={`${id}-product-name`}
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Name
          <RequiredAsterisk />
        </label>
        <input
          type="text"
          id={`${id}-product-name`}
          name="name"
          value={formData.name}
          onChange={handleNameChange}
          placeholder="Ej.: Suscripción prémium"
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:ring-offset-zinc-900"
          required
          aria-required="true"
          disabled={isSubmitting}
        />
      </div>

      <SuggestionInput
        label="Etiqueta (opcional)"
        ariaLabel="Etiqueta (opcional)"
        name="tag"
        value={formData.tag}
        options={availableTags}
        onChange={handleTagChange}
        onSelect={handleTagChange}
        disabled={isSubmitting}
        maxLength={100}
        placeholder="Empieza a escribir para ver sugerencias..."
        leading={
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
            #
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={`${id}-product-finalPrice`}
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            Final price (€)
            <RequiredAsterisk />
          </label>
          <NumberStepperInput
            id={`${id}-product-finalPrice`}
            name="finalPrice"
            value={formData.finalPrice}
            onValueChange={handleFinalPriceChange}
            ariaLabel="Precio final"
            step={5}
            inputMode="decimal"
            min={0}
            emptyStepBase={0}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`${id}-product-stock`}
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            Current stock
            <span className="ml-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">
              optional
            </span>
          </label>
          <NumberStepperInput
            id={`${id}-product-stock`}
            name="stock"
            value={formData.stock ?? ""}
            onValueChange={handleStockChange}
            ariaLabel="Stock actual"
            step={1}
            min={0}
            inputMode="numeric"
            emptyStepBase={0}
            disabled={isSubmitting}
            endAdornment={
              formData.stock != null && formData.stock !== "" ? (
                <ClearButton
                  onClick={handleClearStock}
                  ariaLabel="Borrar stock actual"
                  disabled={isSubmitting}
                  className="top-1 right-1"
                />
              ) : null
            }
          />
        </div>
      </div>

      <ModalFormActions
        formId={`${id}-form`}
        label={product ? "Actualizar producto" : "Crear producto"}
        isPending={isSubmitting}
        onCancel={onCancel}
      />
    </form>
  )
}
