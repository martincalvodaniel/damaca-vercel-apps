const whitespacePattern = /\s+/g

export function normalizeProductName(name: string): string {
  return name.trim().replace(whitespacePattern, " ").toLocaleLowerCase("es")
}
