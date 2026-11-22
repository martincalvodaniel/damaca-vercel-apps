import "server-only"

import type { Collection, Document } from "mongodb"
import { getDatabase } from "@/lib/db/client"

// Register collection names here alongside the feature that introduces them.
export const COLLECTION_NAMES = {
  mcpUser: "mcp_user",
  mcpSession: "mcp_session",
  mcpAccount: "mcp_account",
  mcpVerification: "mcp_verification",
  mcpJwks: "mcp_jwks",
  mcpOAuthClient: "mcp_oauth_client",
  mcpOAuthClientResource: "mcp_oauth_client_resource",
  mcpOAuthRefreshToken: "mcp_oauth_refresh_token",
  mcpOAuthAccessToken: "mcp_oauth_access_token",
  mcpOAuthConsent: "mcp_oauth_consent",
  mcpOAuthClientAssertion: "mcp_oauth_client_assertion",
  dishes: "dishes",
  householdTasks: "household_tasks",
  householdTaskOccurrences: "household_task_occurrences",
  inventoryItems: "inventory_items",
  shoppingListItems: "shopping_list_items",
  weeklyMealPlans: "weekly_meal_plans",
} as const satisfies Record<string, string>

export type CollectionName =
  (typeof COLLECTION_NAMES)[keyof typeof COLLECTION_NAMES]

export async function getCollection<Schema extends Document>(
  name: CollectionName
): Promise<Collection<Schema>> {
  const database = await getDatabase()
  return database.collection<Schema>(name)
}
