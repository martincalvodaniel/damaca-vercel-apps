import catalog from "./characters.json"

const aliases: Record<string, string> = {
  "Lord Voldemort / Tom Riddle":
    "Lord Voldemort|Voldemort|Tom Riddle|Tom Marvolo Riddle|Tom Sorvolo Ryddle",
  "Moaning Myrtle": "Myrtle Warren|Myrtle la Llorona",
  "Nearly Headless Nick": "Nick Casi Decapitado|Nicholas de Mimsy-Porpington",
  "Alastor 'Mad-Eye' Moody": "Alastor Moody|Ojoloco Moody|Mad-Eye Moody",
  "Garrick Ollivander": "Ollivander",
  "Sorting Hat": "Sombrero Seleccionador",
  "Rubeus Hagrid": "Hagrid",
  "Harry Potter": "Harry",
  "Hermione Granger": "Hermione",
  "Ron Weasley": "Ron|Ronald Weasley",
}

export function normalizeCharacter(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "")
}

export const characterCatalog = [...catalog, "Sorting Hat"].sort(
  (left, right) => left.localeCompare(right)
)

const namesByKey = new Map(
  characterCatalog.flatMap((name) =>
    [name, ...(aliases[name]?.split("|") ?? [])].map(
      (term) => [normalizeCharacter(term), name] as const
    )
  )
)

export function canonicalCharacter(name: string) {
  return namesByKey.get(normalizeCharacter(name)) ?? name
}

export function matchesCharacter(name: string, query: string) {
  const key = normalizeCharacter(query)
  return [name, ...(aliases[name]?.split("|") ?? [])].some((term) =>
    normalizeCharacter(term).includes(key)
  )
}
