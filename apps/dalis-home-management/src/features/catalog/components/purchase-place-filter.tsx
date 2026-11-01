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
        className={`min-h-8 shrink-0 rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-ring ${selectedPlaces.length === 0 ? "border-border bg-primary text-on-primary" : "border-border bg-field text-muted hover:bg-field"}`}
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
            className={`min-h-8 shrink-0 rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-ring ${isSelected ? "border-border bg-primary text-on-primary" : "border-border bg-field text-muted hover:bg-field"}`}
          >
            {place}
          </button>
        )
      })}
    </nav>
  )
}
