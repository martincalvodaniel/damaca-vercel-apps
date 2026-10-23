interface ProductWithPurchasePlaces {
  purchasePlaces: readonly string[]
}

export function normalizePurchasePlaceKey(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("es")
}

export function normalizePurchasePlaces(values: readonly string[]): string[] {
  const placesByNormalizedName = new Map<string, string>()

  for (const value of values) {
    const place = value.trim().replace(/\s+/g, " ")
    const normalizedPlace = normalizePurchasePlaceKey(place)

    if (place && !placesByNormalizedName.has(normalizedPlace)) {
      placesByNormalizedName.set(normalizedPlace, place)
    }
  }

  return [...placesByNormalizedName.values()]
}

export function getPurchasePlaces(
  products: readonly ProductWithPurchasePlaces[]
): string[] {
  return normalizePurchasePlaces(
    products.flatMap((product) => [...product.purchasePlaces])
  ).toSorted((left, right) =>
    left.localeCompare(right, "es", { sensitivity: "base" })
  )
}

export function resolveSelectedPurchasePlaces(
  availablePlaces: readonly string[],
  selectedPlaces: readonly string[]
): string[] {
  const selectedPlaceKeys = new Set(
    selectedPlaces.map(normalizePurchasePlaceKey)
  )

  return availablePlaces.filter((place) =>
    selectedPlaceKeys.has(normalizePurchasePlaceKey(place))
  )
}

export function matchesSelectedPurchasePlaces(
  productPlaces: readonly string[],
  selectedPlaces: readonly string[]
): boolean {
  if (selectedPlaces.length === 0) {
    return true
  }

  const selectedPlaceKeys = new Set(
    selectedPlaces.map(normalizePurchasePlaceKey)
  )
  return productPlaces.some((place) =>
    selectedPlaceKeys.has(normalizePurchasePlaceKey(place))
  )
}
