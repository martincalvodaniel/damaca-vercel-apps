export type ShoppingItem = { id: string; name: string; checked: boolean }

export function moveItem(items: ShoppingItem[], id: string, target: string) {
  const from = items.findIndex((item) => item.id === id)
  const to = items.findIndex((item) => item.id === target)
  if (from < 0 || to < 0 || from === to) return items
  const ordered = items.slice()
  ordered.splice(from, 1)
  ordered.splice(to, 0, items[from])
  return ordered
}
