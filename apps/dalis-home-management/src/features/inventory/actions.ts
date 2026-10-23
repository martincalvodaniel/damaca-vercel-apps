"use server"

import { revalidatePath } from "next/cache"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { isInventoryItemUsedInDishes } from "@/lib/db/dishes"
import {
  createInventoryItem,
  DuplicateInventoryItemError,
  deleteInventoryItem,
  findInventoryItemByNameAndUnit,
  markInventoryItemOutOfStock,
  setInventoryItemQuantity,
  updateInventoryItem,
} from "@/lib/db/inventory-items"
import { isInventoryItemUsedInShoppingList } from "@/lib/db/shopping-list-items"
import {
  inventoryItemIdSchema,
  inventoryItemInputSchema,
  inventoryItemQuantitySchema,
} from "@/schemas/inventory-item"

const INVENTORY_PATH = "/inventory"
const MEALS_PATH = "/meals"
const MEAL_PLAN_PATH = "/meal-plan"
const SHOPPING_LIST_PATH = "/shopping-list"

type InventoryActionResult =
  | { success: true }
  | { success: false; message: string }

const invalidInputResult: InventoryActionResult = {
  success: false,
  message: "Revisa los datos del producto e inténtalo de nuevo.",
}

export async function createInventoryItemAction(
  input: unknown
): Promise<InventoryActionResult> {
  await requireAuthorizedSession()
  const result = inventoryItemInputSchema.safeParse(input)

  if (!result.success) {
    return invalidInputResult
  }
  if (
    await findInventoryItemByNameAndUnit(result.data.name, result.data.unit)
  ) {
    return {
      success: false,
      message: "Ya existe un producto con ese nombre y unidad.",
    }
  }

  try {
    await createInventoryItem(result.data)
  } catch (error) {
    if (error instanceof DuplicateInventoryItemError) {
      return {
        success: false,
        message: "Ya existe un producto con ese nombre y unidad.",
      }
    }
    throw error
  }
  revalidatePath(INVENTORY_PATH)

  return { success: true }
}

export async function updateInventoryItemAction(
  id: unknown,
  input: unknown
): Promise<InventoryActionResult> {
  await requireAuthorizedSession()
  const idResult = inventoryItemIdSchema.safeParse(id)
  const inputResult = inventoryItemInputSchema.safeParse(input)

  if (!idResult.success || !inputResult.success) {
    return invalidInputResult
  }

  const duplicate = await findInventoryItemByNameAndUnit(
    inputResult.data.name,
    inputResult.data.unit
  )
  if (duplicate && duplicate.id !== idResult.data) {
    return {
      success: false,
      message: "Ya existe otro producto con ese nombre y unidad.",
    }
  }

  let updated: boolean
  try {
    updated = await updateInventoryItem(idResult.data, inputResult.data)
  } catch (error) {
    if (error instanceof DuplicateInventoryItemError) {
      return {
        success: false,
        message: "Ya existe otro producto con ese nombre y unidad.",
      }
    }
    throw error
  }
  if (!updated) {
    return { success: false, message: "No se ha encontrado el producto." }
  }

  revalidatePath(INVENTORY_PATH)
  revalidatePath(MEALS_PATH)
  revalidatePath(MEAL_PLAN_PATH)
  revalidatePath(SHOPPING_LIST_PATH)
  return { success: true }
}

export async function markInventoryItemOutOfStockAction(
  id: unknown
): Promise<InventoryActionResult> {
  await requireAuthorizedSession()
  const result = inventoryItemIdSchema.safeParse(id)

  if (!result.success) {
    return invalidInputResult
  }

  const updated = await markInventoryItemOutOfStock(result.data)
  if (!updated) {
    return { success: false, message: "No se ha encontrado el producto." }
  }

  revalidatePath(INVENTORY_PATH)
  return { success: true }
}

export async function setInventoryItemQuantityAction(
  id: unknown,
  quantity: unknown
): Promise<InventoryActionResult> {
  await requireAuthorizedSession()
  const idResult = inventoryItemIdSchema.safeParse(id)
  const quantityResult = inventoryItemQuantitySchema.safeParse(quantity)

  if (!idResult.success || !quantityResult.success) {
    return invalidInputResult
  }

  const updated = await setInventoryItemQuantity(
    idResult.data,
    quantityResult.data
  )
  if (!updated) {
    return { success: false, message: "No se ha encontrado el producto." }
  }

  revalidatePath(INVENTORY_PATH)
  revalidatePath(MEAL_PLAN_PATH)
  return { success: true }
}

export async function deleteInventoryItemAction(
  id: unknown
): Promise<InventoryActionResult> {
  await requireAuthorizedSession()
  const result = inventoryItemIdSchema.safeParse(id)

  if (!result.success) {
    return invalidInputResult
  }

  const [usedInDishes, usedInShoppingList] = await Promise.all([
    isInventoryItemUsedInDishes(result.data),
    isInventoryItemUsedInShoppingList(result.data),
  ])
  if (usedInDishes) {
    return {
      success: false,
      message:
        "Desvincula este producto de los platos del recetario antes de eliminarlo.",
    }
  }
  if (usedInShoppingList) {
    return {
      success: false,
      message: "Elimina primero este producto de la lista de la compra.",
    }
  }

  const deleted = await deleteInventoryItem(result.data)
  if (!deleted) {
    return { success: false, message: "No se ha encontrado el producto." }
  }

  revalidatePath(INVENTORY_PATH)
  return { success: true }
}
