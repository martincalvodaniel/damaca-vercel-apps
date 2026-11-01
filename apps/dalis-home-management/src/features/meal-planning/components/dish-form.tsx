"use client"

import {
  type FormEvent,
  useCallback,
  useId,
  useMemo,
  useState,
  useTransition,
} from "react"
import { DialogHeader } from "@/components/ui/dialog-header"
import { ErrorBanner } from "@/components/ui/error-banner"
import { CatalogProductDialog } from "@/features/catalog/components/catalog-product-dialog"
import type { CatalogProductOption } from "@/features/catalog/product-option"
import { getPurchasePlaces } from "@/features/catalog/purchase-places"
import {
  createDishAction,
  updateDishAction,
} from "@/features/meal-planning/actions"
import type { Dish } from "@/schemas/dish"
import { type IngredientDraft, IngredientRow } from "./ingredient-row"

interface DishFormProps {
  dish: Dish | null
  initialName?: string
  products: CatalogProductOption[]
  onCancel: () => void
  onSaved: () => void
}

const blankIngredient: IngredientDraft = {
  key: "new-ingredient",
  quantity: "1",
  inventoryItemId: "",
}

function getInitialIngredients(dish: Dish | null): IngredientDraft[] {
  if (!dish) {
    return [blankIngredient]
  }

  return dish.ingredients.map((ingredient) => ({
    key: ingredient.id,
    quantity: String(ingredient.quantity),
    inventoryItemId: ingredient.inventoryItemId ?? "",
    ...(ingredient.inventoryItemId ? {} : { legacyName: ingredient.name }),
  }))
}

export function DishForm({
  dish,
  initialName,
  products,
  onCancel,
  onSaved,
}: DishFormProps) {
  const formId = useId()
  const nameId = useId()
  const notesId = useId()
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(() =>
    getInitialIngredients(dish)
  )
  const [availableProducts, setAvailableProducts] = useState(products)
  const [creatingProductForIndex, setCreatingProductForIndex] = useState<
    number | null
  >(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEditing = dish !== null

  const ingredientRows = useMemo(
    () =>
      ingredients.map((ingredient, index) => ({
        ingredient,
        onChange: (nextIngredient: IngredientDraft) => {
          setIngredients((current) =>
            current.map((entry, entryIndex) =>
              entryIndex === index ? nextIngredient : entry
            )
          )
        },
        onRemove: () => {
          setIngredients((current) =>
            current.length === 1
              ? [{ ...blankIngredient, key: crypto.randomUUID() }]
              : current.filter((_, entryIndex) => entryIndex !== index)
          )
        },
        onRequestProductCreation: () => setCreatingProductForIndex(index),
      })),
    [ingredients]
  )

  const addIngredient = useCallback(() => {
    setIngredients((current) => [
      ...current,
      {
        ...blankIngredient,
        key: crypto.randomUUID(),
      },
    ])
  }, [])

  const handleProductCreated = useCallback(
    function handleProductCreated(product: CatalogProductOption) {
      setAvailableProducts((current) =>
        current.some((entry) => entry.id === product.id)
          ? current
          : [...current, product].toSorted((left, right) =>
              left.name.localeCompare(right.name, "es", { sensitivity: "base" })
            )
      )
      if (creatingProductForIndex !== null) {
        setIngredients((current) =>
          current.map((ingredient, index) =>
            index === creatingProductForIndex
              ? {
                  ...ingredient,
                  inventoryItemId: product.id,
                  legacyName: undefined,
                  productSearch: undefined,
                }
              : ingredient
          )
        )
      }
      setCreatingProductForIndex(null)
    },
    [creatingProductForIndex]
  )

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError(null)
      const form = event.currentTarget
      const formData = new FormData(form)
      const input = {
        name: formData.get("name"),
        notes: formData.get("notes"),
        ingredients: ingredients.map((ingredient) => ({
          quantity: Number(ingredient.quantity),
          inventoryItemId: ingredient.inventoryItemId,
        })),
      }

      startTransition(async () => {
        try {
          const result = dish
            ? await updateDishAction(dish.id, input)
            : await createDishAction(input)

          if (!result.success) {
            setError(result.message)
            return
          }

          form.reset()
          onSaved()
        } catch {
          setError("No se ha podido guardar el plato. Inténtalo de nuevo.")
        }
      })
    },
    [dish, ingredients, onSaved]
  )

  const dismissProductDialog = useCallback(
    () => setCreatingProductForIndex(null),
    []
  )

  return (
    <section className="flex h-full min-h-0 flex-col bg-surface">
      <DialogHeader
        title={isEditing ? dish.name : "Guardar una comida"}
        onDismiss={onCancel}
        cancelDisabled={isPending}
        confirmLabel={
          isPending ? "Guardando…" : isEditing ? "Guardar" : "Crear plato"
        }
        confirmDisabled={isPending}
        confirmForm={formId}
        pending={isPending}
      />

      <form
        id={formId}
        className="dialog-content space-y-4 p-4 sm:p-6"
        onSubmit={handleSubmit}
      >
        <label className="block text-sm font-semibold" htmlFor={nameId}>
          Nombre del plato
          <input
            id={nameId}
            name="name"
            type="text"
            required
            maxLength={120}
            defaultValue={dish?.name ?? initialName}
            placeholder="Por ejemplo, lentejas"
            className="mt-2 min-h-12 w-full rounded-xl border border-control-border bg-field px-4 font-normal outline-none transition placeholder:text-placeholder focus:border-ring focus:ring-2 focus:ring-ring"
          />
        </label>

        <div className="space-y-2 sm:space-y-3">
          {ingredientRows.map(
            (
              { ingredient, onChange, onRemove, onRequestProductCreation },
              index
            ) => (
              <IngredientRow
                key={ingredient.key}
                index={index}
                ingredient={ingredient}
                products={availableProducts}
                canRemove={
                  ingredients.length > 1 || Boolean(ingredient.inventoryItemId)
                }
                disabled={isPending}
                onChange={onChange}
                onRemove={onRemove}
                onRequestProductCreation={onRequestProductCreation}
              />
            )
          )}
        </div>

        <button
          type="button"
          onClick={addIngredient}
          disabled={ingredients.length >= 30 || isPending}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-dashed border-border px-4 text-sm font-semibold text-primary transition hover:bg-field focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          + Añadir ingrediente
        </button>

        <label className="block text-sm font-semibold" htmlFor={notesId}>
          Receta / observaciones (opcional)
          <textarea
            id={notesId}
            name="notes"
            rows={6}
            maxLength={10_000}
            defaultValue={dish?.notes ?? ""}
            placeholder="Escribe los pasos de la receta o cualquier nota sobre el plato"
            className="mt-2 w-full resize-y rounded-xl border border-control-border bg-field px-4 py-3 font-normal outline-none transition placeholder:text-placeholder focus:border-ring focus:ring-2 focus:ring-ring"
          />
        </label>

        {error ? <ErrorBanner>{error}</ErrorBanner> : null}
      </form>
      <CatalogProductDialog
        key={`catalog-product-${creatingProductForIndex ?? "closed"}`}
        open={creatingProductForIndex !== null}
        initialName={
          creatingProductForIndex === null
            ? undefined
            : ingredients[creatingProductForIndex]?.productSearch?.trim() ||
              ingredients[creatingProductForIndex]?.legacyName
        }
        purchasePlaces={getPurchasePlaces(availableProducts)}
        onDismiss={dismissProductDialog}
        onCreated={handleProductCreated}
      />
    </section>
  )
}
