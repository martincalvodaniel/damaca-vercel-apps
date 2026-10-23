"use client"

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
  function togglePlace(place: string) {
    onSelectedPlacesChange(
      selectedPlaces.includes(place)
        ? selectedPlaces.filter((selectedPlace) => selectedPlace !== place)
        : [...selectedPlaces, place]
    )
  }

  return (
    <nav
      className="mt-4 flex gap-2 overflow-x-auto pb-1"
      aria-label="Filtrar por lugar de compra"
    >
      <button
        type="button"
        onClick={() => onSelectedPlacesChange([])}
        aria-pressed={selectedPlaces.length === 0}
        className={`min-h-9 shrink-0 rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#1d4f40] ${selectedPlaces.length === 0 ? "border-[#1d4f40] bg-[#1d4f40] text-white dark:border-[#8bb9a6] dark:bg-[#8bb9a6] dark:text-[#10221c]" : "border-[#ccd5ca] bg-white/65 text-[#5f7167] hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-[#c4d0c8] dark:hover:bg-white/10"}`}
      >
        *
      </button>
      {places.map((place) => {
        const isSelected = selectedPlaces.includes(place)

        return (
          <button
            key={place}
            type="button"
            onClick={() => togglePlace(place)}
            aria-pressed={isSelected}
            className={`min-h-9 shrink-0 rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#1d4f40] ${isSelected ? "border-[#1d4f40] bg-[#1d4f40] text-white dark:border-[#8bb9a6] dark:bg-[#8bb9a6] dark:text-[#10221c]" : "border-[#ccd5ca] bg-white/65 text-[#5f7167] hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-[#c4d0c8] dark:hover:bg-white/10"}`}
          >
            {place}
          </button>
        )
      })}
    </nav>
  )
}
