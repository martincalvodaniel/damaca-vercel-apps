"use client"

import { useDeferredValue, useId } from "react"
import type { Dish } from "@/schemas/dish"
import { DishCard } from "./dish-card"

interface DishListProps {
  dishes: Dish[]
  search: string
  onSearchChange: (search: string) => void
  onEdit: (dish: Dish) => void
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
}: DishListProps) {
  const titleId = useId()
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

  if (dishes.length === 0) {
    return (
      <section className="grid min-h-72 place-items-center rounded-[1.75rem] border border-dashed border-[#d6cfb7] bg-white/35 p-8 text-center dark:border-white/15 dark:bg-white/[0.025]">
        <div className="max-w-sm">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#eee3bd] text-2xl dark:bg-[#4b4329]">
            <span aria-hidden="true">♨</span>
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
            El recetario está vacío
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#697970] dark:text-[#aebbb3]">
            Guarda vuestro primer plato para empezar a preparar el menú.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby={titleId}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="hidden sm:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7a8a81] dark:text-[#9baaa1]">
            Para repetir
          </p>
          <h2
            id={titleId}
            className="mt-1 text-2xl font-semibold tracking-[-0.04em]"
          >
            Platos guardados
          </h2>
        </div>
        <label className="sm:w-64">
          <span className="sr-only">Buscar platos o ingredientes</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar plato o ingrediente"
            className="min-h-11 w-full rounded-full border border-[#ccd5ca] bg-white/75 px-4 text-sm outline-none transition placeholder:text-[#8d9a92] focus:border-[#75611f] focus:ring-2 focus:ring-[#75611f]/15 dark:border-white/15 dark:bg-[#182e26]"
          />
        </label>
      </div>

      {filteredDishes.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-[#cbd4ca] bg-white/35 px-5 py-10 text-center dark:border-white/15 dark:bg-white/[0.025]">
          <p className="font-semibold">No hay platos que coincidan.</p>
          <p className="mt-1 text-sm text-[#697970] dark:text-[#aebbb3]">
            Prueba con otro plato o ingrediente.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} onEdit={onEdit} />
          ))}
        </div>
      )}
    </section>
  )
}
