"use client"

import type * as React from "react"
import {
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useId,
  useState,
} from "react"
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

  const addPlace = useCallback(
    (value: string) => {
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
    },
    [selectedPlaces, selectedKeys]
  )

  const removePlace = useCallback((place: string) => {
    const normalizedPlace = normalizePurchasePlaceKey(place)
    setSelectedPlaces((currentPlaces) =>
      currentPlaces.filter(
        (currentPlace) =>
          normalizePurchasePlaceKey(currentPlace) !== normalizedPlace
      )
    )
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") {
        return
      }

      event.preventDefault()
      addPlace(draft)
    },
    [addPlace, draft]
  )

  const handleRemovePlace = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      removePlace(event.currentTarget.dataset.place ?? "")
    },
    [removePlace]
  )

  const handleAddPlace = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      addPlace(event.currentTarget.dataset.place ?? "")
    },
    [addPlace]
  )

  const changeDraft = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setDraft(event.target.value),
    []
  )

  const addDraft = useCallback(() => addPlace(draft), [addPlace, draft])

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
          onChange={changeDraft}
          onKeyDown={handleKeyDown}
          placeholder="Por ejemplo, Mercado"
          autoComplete="off"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-control-border bg-field px-4 font-normal outline-none transition placeholder:text-placeholder focus:border-ring focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={addDraft}
          disabled={!draft.trim() || selectedPlaces.length >= 20}
          className="min-h-12 shrink-0 rounded-xl border border-border px-3 text-xs font-semibold text-ink transition hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-45"
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
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface py-1 pl-2.5 pr-1 text-xs font-semibold text-muted"
            >
              {place}
              <button
                type="button"
                data-place={place}
                onClick={handleRemovePlace}
                aria-label={`Quitar ${place}`}
                className="grid size-5 place-items-center rounded-full text-sm font-bold leading-none text-danger transition hover:bg-danger-soft hover:text-danger focus:outline-none focus:ring-2 focus:ring-ring"
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
              data-place={place}
              onClick={handleAddPlace}
              className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-semibold text-muted transition hover:border-border hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-ring"
            >
              + {place}
            </button>
          ))}
        </fieldset>
      ) : null}
    </div>
  )
}
