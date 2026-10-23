"use server"

import { revalidatePath } from "next/cache"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { findInventoryItemById } from "@/lib/db/inventory-items"
import {
  addInventoryItemToShoppingList,
  clearShoppingListItems,
  deleteShoppingListItem,
  PurchasedShoppingListSettlementError,
  restockAndDeletePurchasedShoppingListItems,
  setShoppingListItemPurchased,
  setShoppingListItemQuantity,
} from "@/lib/db/shopping-list-items"
import { inventoryItemIdSchema } from "@/schemas/inventory-item"
import {
  purchasedShoppingListItemIdsSchema,
  shoppingListItemIdSchema,
  shoppingListItemInputSchema,
  shoppingListItemPurchasedSchema,
  shoppingListItemQuantitySchema,
} from "@/schemas/shopping-list-item"

const SHOPPING_LIST_PATH = "/shopping-list"
const INVENTORY_PATH = "/inventory"

type ShoppingListActionResult =
  | { success: true }
  | { success: false; message: string }

const invalidInputResult: ShoppingListActionResult = {
  success: false,
  message: "Revisa los datos del producto e inténtalo de nuevo.",
}

function revalidateShoppingList() {
  revalidatePath("/")
  revalidatePath(SHOPPING_LIST_PATH)
}

export async function createShoppingListItemAction(
  input: unknown
): Promise<ShoppingListActionResult> {
  await requireAuthorizedSession()
  const result = shoppingListItemInputSchema.safeParse(input)

  if (!result.success) {
    return invalidInputResult
  }

  const item = await findInventoryItemById(result.data.inventoryItemId)
  if (!item) {
    return {
      success: false,
      message: "No se ha encontrado el producto del catálogo.",
    }
  }

  await addInventoryItemToShoppingList(item, result.data.quantity)
  revalidateShoppingList()
  return { success: true }
}

export async function addInventoryItemToShoppingListAction(
  id: unknown
): Promise<ShoppingListActionResult> {
  await requireAuthorizedSession()
  const result = inventoryItemIdSchema.safeParse(id)

  if (!result.success) {
    return invalidInputResult
  }

  const item = await findInventoryItemById(result.data)
  if (!item) {
    return {
      success: false,
      message: "No se ha encontrado el producto del inventario.",
    }
  }

  await addInventoryItemToShoppingList(item)
  revalidateShoppingList()

  return { success: true }
}

export async function setShoppingListItemPurchasedAction(
  id: unknown,
  isPurchased: unknown
): Promise<ShoppingListActionResult> {
  await requireAuthorizedSession()
  const idResult = shoppingListItemIdSchema.safeParse(id)
  const purchasedResult = shoppingListItemPurchasedSchema.safeParse(isPurchased)

  if (!idResult.success || !purchasedResult.success) {
    return invalidInputResult
  }

  const updated = await setShoppingListItemPurchased(
    idResult.data,
    purchasedResult.data
  )
  if (!updated) {
    return { success: false, message: "No se ha encontrado el producto." }
  }

  revalidateShoppingList()
  return { success: true }
}

export async function setShoppingListItemQuantityAction(
  id: unknown,
  quantity: unknown
): Promise<ShoppingListActionResult> {
  await requireAuthorizedSession()
  const idResult = shoppingListItemIdSchema.safeParse(id)
  const quantityResult = shoppingListItemQuantitySchema.safeParse(quantity)

  if (!idResult.success || !quantityResult.success) {
    return invalidInputResult
  }

  const updated = await setShoppingListItemQuantity(
    idResult.data,
    quantityResult.data
  )
  if (!updated) {
    return { success: false, message: "No se ha encontrado el producto." }
  }

  revalidateShoppingList()
  return { success: true }
}

export async function restockAndClearPurchasedShoppingListItemsAction(
  ids: unknown
): Promise<ShoppingListActionResult> {
  await requireAuthorizedSession()
  const result = purchasedShoppingListItemIdsSchema.safeParse(ids)

  if (!result.success) {
    return invalidInputResult
  }

  try {
    await restockAndDeletePurchasedShoppingListItems(result.data)
  } catch (error) {
    if (error instanceof PurchasedShoppingListSettlementError) {
      return {
        success: false,
        message:
          "No se ha podido actualizar todo el inventario. No se ha eliminado ningún producto.",
      }
    }

    throw error
  }

  revalidateShoppingList()
  revalidatePath(INVENTORY_PATH)
  return { success: true }
}

export async function clearShoppingListAction(): Promise<ShoppingListActionResult> {
  await requireAuthorizedSession()
  await clearShoppingListItems()
  revalidateShoppingList()
  return { success: true }
}

export async function deleteShoppingListItemAction(
  id: unknown
): Promise<ShoppingListActionResult> {
  await requireAuthorizedSession()
  const result = shoppingListItemIdSchema.safeParse(id)

  if (!result.success) {
    return invalidInputResult
  }

  const deleted = await deleteShoppingListItem(result.data)
  if (!deleted) {
    return {
      success: false,
      message: "No se ha encontrado el producto.",
    }
  }

  revalidateShoppingList()
  return { success: true }
}
