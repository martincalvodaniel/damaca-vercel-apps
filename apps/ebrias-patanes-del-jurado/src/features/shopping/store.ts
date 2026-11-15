import "server-only"

import { getDatabaseConnection } from "@/lib/database"
import type { ShoppingItem } from "./list"

function lists() {
  return getDatabaseConnection().db.collection<{
    _id: string
    revision: number
    items: ShoppingItem[]
  }>("261230-shopping-list")
}

export async function readShoppingList() {
  return (await lists().findOne({ _id: "list" })) ?? { revision: 0, items: [] }
}

export async function updateShoppingList(
  revision: number,
  items: ShoppingItem[]
) {
  if (!revision) {
    const result = await lists().updateOne(
      { _id: "list" },
      { $setOnInsert: { revision: 1, items } },
      { upsert: true }
    )
    return result.upsertedCount === 1
  }
  const result = await lists().updateOne(
    { _id: "list", revision },
    { $set: { items }, $inc: { revision: 1 } }
  )
  return result.matchedCount === 1
}
