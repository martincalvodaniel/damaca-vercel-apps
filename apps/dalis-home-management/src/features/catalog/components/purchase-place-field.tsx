"use client"

import { type KeyboardEvent, useId, useState } from "react"
import { normalizePurchasePlaceKey } from "@/features/catalog/purchase-places"

interface PurchasePlaceFieldProps {
  id: string
  defaultValues?: readonly string[]
  purchasePlaces: readonly string[]
}

export function PurchasePlaceField({
  id,
  defaultValues = [],
  purchasePlaces,
}: PurchasePlaceFieldProps) {
  const suggestionListId = useId()
  const [draft, setDraft] = useState("")
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>(() => [
    ...defaultValues,
  ])
  const selectedKeys = new Set(selectedPlaces.map(normalizePurchasePlaceKey))
  const availablePlaces = purchasePlaces.filter(
    (place) => !selectedKeys.has(normalizePurchasePlaceKey(place))
  )

  function addPlace(value: string) {
    const place = value.trim().replace(/\s+/g, " ")
    const normalizedPlace = normalizePurchasePlaceKey(place)

    if (
      !place ||
      selectedPlaces.length >= 20 ||
      selectedKeys.has(normalizedPlace)
    ) {
      return
    }

    setSelectedPlaces((currentPlaces) => [...currentPlaces, place])
    setDraft("")
  }

  function removePlace(place: string) {
    const normalizedPlace = normalizePurchasePlaceKey(place)
    setSelectedPlaces((currentPlaces) =>
      currentPlaces.filter(
        (currentPlace) =>
          normalizePurchasePlaceKey(currentPlace) !== normalizedPlace
      )
    )
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return
    }

    event.preventDefault()
    addPlace(draft)
  }

  return (
    <div className="text-sm font-semibold">
      <label htmlFor={id}>Lugares de compra</label>
      <div className="mt-2 flex gap-2">
        <input
          id={id}
          name="purchasePlaceDraft"
          type="text"
          list={suggestionListId}
          maxLength={80}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Por ejemplo, Mercado"
          autoComplete="off"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#ccd5ca] bg-white px-4 font-normal outline-none transition placeholder:text-[#9aa59e] focus:border-[#1d4f40] focus:ring-2 focus:ring-[#1d4f40]/15 dark:border-white/15 dark:bg-[#10231c] dark:placeholder:text-[#718078]"
        />
        <button
          type="button"
          onClick={() => addPlace(draft)}
          disabled={!draft.trim() || selectedPlaces.length >= 20}
          className="min-h-12 shrink-0 rounded-xl border border-[#9eb0a1] px-3 text-xs font-semibold text-[#365b43] transition hover:bg-[#edf2eb] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/15 dark:text-[#c4d0c8] dark:hover:bg-white/5"
        >
          Añadir
        </button>
      </div>
      <datalist id={suggestionListId}>
        {availablePlaces.map((place) => (
          <option key={place} value={place} />
        ))}
      </datalist>
      {selectedPlaces.map((place) => (
        <input key={place} type="hidden" name="purchasePlaces" value={place} />
      ))}
      {selectedPlaces.length > 0 ? (
        <fieldset className="mt-2 flex flex-wrap gap-1.5">
          <legend className="sr-only">Lugares asignados</legend>
          {selectedPlaces.map((place) => (
            <span
              key={place}
              className="inline-flex items-center gap-1 rounded-full border border-[#cbd5cb] bg-[#edf2eb] py-1 pl-2.5 pr-1 text-xs font-semibold text-[#486055] dark:border-white/10 dark:bg-white/5 dark:text-[#c4d0c8]"
            >
              {place}
              <button
                type="button"
                onClick={() => removePlace(place)}
                aria-label={`Quitar ${place}`}
                className="grid size-5 place-items-center rounded-full text-sm font-bold leading-none text-[#b4493d] transition hover:bg-[#f6d8d3] hover:text-[#8f2f27] focus:outline-none focus:ring-2 focus:ring-[#b4493d] dark:text-[#ff9f92] dark:hover:bg-[#5a302c]"
              >
                ×
              </button>
            </span>
          ))}
        </fieldset>
      ) : null}
      {availablePlaces.length > 0 ? (
        <fieldset className="mt-2 flex flex-wrap gap-1.5">
          <legend className="sr-only">Lugares disponibles</legend>
          {availablePlaces.map((place) => (
            <button
              key={place}
              type="button"
              onClick={() => addPlace(place)}
              className="rounded-full border border-dashed border-[#cbd5cb] px-2.5 py-1 text-xs font-semibold text-[#66786e] transition hover:border-[#829b89] hover:bg-[#edf2eb] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] dark:border-white/15 dark:text-[#aebbb3] dark:hover:bg-white/5"
            >
              + {place}
            </button>
          ))}
        </fieldset>
      ) : null}
    </div>
  )
}
