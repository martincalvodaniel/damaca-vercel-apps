"use client"

import type * as React from "react"
import { useCallback, useDeferredValue, useId } from "react"
import { SearchInput } from "@/components/ui/search-input"
import type { Dish } from "@/schemas/dish"
import { DishCard } from "./dish-card"

interface DishListProps {
  dishes: Dish[]
  search: string
  onSearchChange: (search: string) => void
  onEdit: (dish: Dish) => void
  onClone: (dish: Dish) => void
}

const diacriticPattern = /\p{Diacritic}/gu

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(diacriticPattern, "")
    .toLocaleLowerCase("es")
}

export function DishList({
  dishes,
  search,
  onSearchChange,
  onEdit,
  onClone,
}: DishListProps) {
  const titleId = useId()
  const searchInputId = useId()
  const deferredSearch = useDeferredValue(search)
  const normalizedSearch = normalizeSearchText(deferredSearch.trim())
  const filteredDishes = dishes.filter(
    (dish) =>
      normalizedSearch.length === 0 ||
      normalizeSearchText(dish.name).includes(normalizedSearch) ||
      dish.ingredients.some((ingredient) =>
        normalizeSearchText(ingredient.name).includes(normalizedSearch)
      )
  )

  const clearSearch = useCallback(() => onSearchChange(""), [onSearchChange])

  const changeSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      onSearchChange(event.target.value),
    [onSearchChange]
  )

  if (dishes.length === 0) {
    return (
      <section className="grid min-h-48 place-items-center rounded-[1.75rem] border border-dashed border-border bg-field p-4 text-center">
        <div className="max-w-sm">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent-soft text-2xl">
            <span aria-hidden="true">♨</span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
            El recetario está vacío
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Guarda vuestro primer plato para empezar a preparar el menú.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby={titleId}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="hidden sm:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
            Para repetir
          </p>
          <h2
            id={titleId}
            className="mt-1 text-2xl font-semibold tracking-[-0.04em]"
          >
            Platos guardados
          </h2>
        </div>
        <label className="sm:w-64" htmlFor={searchInputId}>
          <span className="sr-only">Buscar platos o ingredientes</span>
          <SearchInput
            id={searchInputId}
            onClear={clearSearch}
            value={search}
            onChange={changeSearch}
            placeholder="Buscar plato o ingrediente"
            className="min-h-9 w-full rounded-full border border-control-border bg-field px-4 text-sm outline-none transition placeholder:text-placeholder focus:border-ring focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      {filteredDishes.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-border bg-field px-5 py-5 text-center">
          <p className="font-semibold">No hay platos que coincidan.</p>
          <p className="mt-1 text-sm text-muted">
            Prueba con otro plato o ingrediente.
          </p>
        </div>
      ) : (
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {filteredDishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onEdit={onEdit}
              onClone={onClone}
            />
          ))}
        </div>
      )}
    </section>
  )
}
