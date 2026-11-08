import catalog from "./characters.json"

const aliases: Record<string, string> = {
  "Lord Voldemort / Tom Ryddle":
    "Lord Voldemort|Voldemort|Tom Riddle|Tom Marvolo Riddle|Tom Sorvolo Ryddle",
  "Myrtle la Llorona": "Moaning Myrtle|Myrtle Warren",
  "Nick Casi Decapitado": "Nearly Headless Nick|Nicholas de Mimsy-Porpington",
  "Alastor «Ojoloco» Moody":
    "Alastor Moody|Mad-Eye Moody|Alastor 'Mad-Eye' Moody",
  "Señora Norris": "Mrs Norris",
  "El Barón Sanguinario": "The Bloody Baron",
  "El Fraile Gordo": "The Fat Friar",
  "La Dama Gris (Helena Ravenclaw)": "The Grey Lady|Helena Ravenclaw",
  "Bruja del carrito": "Trolley Witch",
  "Garrick Ollivander": "Ollivander",
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

const translatedNames: Record<string, string> = {
  "Alastor 'Mad-Eye' Moody": "Alastor «Ojoloco» Moody",
  "Lord Voldemort / Tom Riddle": "Lord Voldemort / Tom Ryddle",
  "Moaning Myrtle": "Myrtle la Llorona",
  "Mrs Norris": "Señora Norris",
  "Nearly Headless Nick": "Nick Casi Decapitado",
  "The Bloody Baron": "El Barón Sanguinario",
  "The Fat Friar": "El Fraile Gordo",
  "The Grey Lady": "La Dama Gris (Helena Ravenclaw)",
  "Trolley Witch": "Bruja del carrito",
}

export const characterCatalog = [...catalog, "Sorting Hat"]
  .map((name) => translatedNames[name] ?? name)
  .sort((left, right) => left.localeCompare(right))

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
