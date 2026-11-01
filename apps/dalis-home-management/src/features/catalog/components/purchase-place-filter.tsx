"use client"

import type { MouseEvent } from "react"
import { useCallback } from "react"

interface PurchasePlaceFilterProps {
  places: string[]
  selectedPlaces: string[]
  onSelectedPlacesChange: (places: string[]) => void
}

export function PurchasePlaceFilter({
  places,
  selectedPlaces,
  onSelectedPlacesChange,
}: PurchasePlaceFilterProps) {
  const togglePlace = useCallback(
    (place: string) => {
      onSelectedPlacesChange(
        selectedPlaces.includes(place)
          ? selectedPlaces.filter((selectedPlace) => selectedPlace !== place)
          : [...selectedPlaces, place]
      )
    },
    [onSelectedPlacesChange, selectedPlaces]
  )

  const handlePlaceClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      togglePlace(event.currentTarget.dataset.place ?? "")
    },
    [togglePlace]
  )

  const clearPlaces = useCallback(
    () => onSelectedPlacesChange([]),
    [onSelectedPlacesChange]
  )

  return (
    <nav
      className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Filtrar por lugar de compra"
    >
      <button
        type="button"
        onClick={clearPlaces}
        aria-pressed={selectedPlaces.length === 0}
        className={`min-h-8 shrink-0 rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#1d4f40] ${selectedPlaces.length === 0 ? "border-[#1d4f40] bg-[#1d4f40] text-white dark:border-[#8bb9a6] dark:bg-[#8bb9a6] dark:text-[#10221c]" : "border-[#ccd5ca] bg-white/65 text-[#5f7167] hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-[#c4d0c8] dark:hover:bg-white/10"}`}
      >
        *
      </button>
      {places.map((place) => {
        const isSelected = selectedPlaces.includes(place)

        return (
          <button
            key={place}
            type="button"
            data-place={place}
            onClick={handlePlaceClick}
            aria-pressed={isSelected}
            className={`min-h-8 shrink-0 rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#1d4f40] ${isSelected ? "border-[#1d4f40] bg-[#1d4f40] text-white dark:border-[#8bb9a6] dark:bg-[#8bb9a6] dark:text-[#10221c]" : "border-[#ccd5ca] bg-white/65 text-[#5f7167] hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-[#c4d0c8] dark:hover:bg-white/10"}`}
          >
            {place}
          </button>
        )
      })}
    </nav>
  )
}
