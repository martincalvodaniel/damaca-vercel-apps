"use client"

import { type FormEvent, useId, useState, useTransition } from "react"
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
  const nameId = useId()
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

  function updateIngredient(index: number, ingredient: IngredientDraft) {
    setIngredients((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? ingredient : entry
      )
    )
  }

  function removeIngredient(index: number) {
    setIngredients((current) => {
      if (current.length === 1) {
        return [{ ...blankIngredient, key: crypto.randomUUID() }]
      }

      return current.filter((_, entryIndex) => entryIndex !== index)
    })
  }

  function addIngredient() {
    setIngredients((current) => [
      ...current,
      {
        ...blankIngredient,
        key: crypto.randomUUID(),
      },
    ])
  }

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
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = event.currentTarget
    const formData = new FormData(form)
    const input = {
      name: formData.get("name"),
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
  }

  return (
    <section className="rounded-[1.75rem] border border-[#e4d9b8] bg-[#f3e8c8] p-5 shadow-[0_18px_50px_rgba(86,73,39,0.08)] sm:p-6 dark:border-[#685c38] dark:bg-[#39331f]">
      <header className="sticky -top-5 z-10 -mx-5 -mt-5 border-b border-[#e4d9b8] bg-[#f3e8c8] px-5 pt-5 pb-4 sm:-top-6 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 dark:border-[#685c38] dark:bg-[#39331f]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a6d1f] dark:text-[#dec778]">
          {isEditing ? "Editar plato" : "Nuevo plato"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
          {isEditing ? dish.name : "Guardar una comida"}
        </h2>
      </header>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
            className="mt-2 min-h-12 w-full rounded-xl border border-[#d0c69d] bg-white/85 px-4 font-normal outline-none transition placeholder:text-[#9a9788] focus:border-[#8a7633] focus:ring-2 focus:ring-[#8a7633]/15 dark:border-white/15 dark:bg-[#252316]"
          />
        </label>

        <div className="space-y-2 sm:space-y-3">
          {ingredients.map((ingredient, index) => (
            <IngredientRow
              key={ingredient.key}
              index={index}
              ingredient={ingredient}
              products={availableProducts}
              canRemove={
                ingredients.length > 1 || Boolean(ingredient.inventoryItemId)
              }
              disabled={isPending}
              onChange={(nextIngredient) =>
                updateIngredient(index, nextIngredient)
              }
              onRemove={() => removeIngredient(index)}
              onRequestProductCreation={() => setCreatingProductForIndex(index)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addIngredient}
          disabled={ingredients.length >= 30 || isPending}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-dashed border-[#b4a66e] px-4 text-sm font-semibold text-[#75611f] transition hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#8a7633] disabled:opacity-50 dark:border-[#877a4c] dark:text-[#dccb8d] dark:hover:bg-white/5"
        >
          + Añadir ingrediente
        </button>

        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <div className="sticky -bottom-5 z-10 -mx-5 -mb-5 flex gap-2 border-t border-[#e4d9b8] bg-[#f3e8c8] px-5 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 dark:border-[#685c38] dark:bg-[#39331f]">
          <button
            type="submit"
            disabled={isPending}
            className="order-2 inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#75611f] px-5 text-sm font-semibold text-white transition hover:bg-[#615018] focus:outline-none focus:ring-2 focus:ring-[#75611f] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 dark:ring-offset-[#39331f]"
          >
            {isPending ? "Guardando…" : isEditing ? "Guardar" : "Crear plato"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="order-1 inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#c4b989] px-5 text-sm font-semibold transition hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#75611f] disabled:opacity-60 dark:border-white/15 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
        </div>
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
        onDismiss={() => setCreatingProductForIndex(null)}
        onCreated={handleProductCreated}
      />
    </section>
  )
}
