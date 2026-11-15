export type ShoppingItem = {
  id: string
  name: string
  checked: boolean
  parentId?: string
}

export type Placement = "before" | "after" | "inside"
export type DropTarget = { id: string; placement: Placement }

export function childrenOf(items: ShoppingItem[], id: string) {
  return items.filter((item) => item.parentId === id)
}

export function moveItem(
  items: ShoppingItem[],
  id: string,
  target: DropTarget
) {
  const item = items.find((entry) => entry.id === id)
  const destination = items.find((entry) => entry.id === target.id)
  if (!item || !destination || id === target.id) return null

  const parentId =
    target.placement === "inside" ? destination.id : destination.parentId
  if (target.placement === "inside" && destination.parentId) return null
  if (parentId && (parentId === id || childrenOf(items, id).length)) return null

  const moved = { ...item }
  if (parentId) moved.parentId = parentId
  else delete moved.parentId

  const ordered = items.filter((entry) => entry.id !== id)
  const anchor =
    target.placement === "inside"
      ? (childrenOf(ordered, destination.id).at(-1) ?? destination)
      : destination
  const index = ordered.indexOf(anchor)
  ordered.splice(index + (target.placement === "before" ? 0 : 1), 0, moved)
  return ordered
}

export function removalGroup(items: ShoppingItem[], item: ShoppingItem) {
  return [item, ...childrenOf(items, item.id)]
}

export function removalSnapshot(items: ShoppingItem[]) {
  return JSON.stringify(items.map(({ id, name }) => [id, name]))
}
