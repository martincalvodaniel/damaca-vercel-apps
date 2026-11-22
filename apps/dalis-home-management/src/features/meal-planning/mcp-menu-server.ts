import "server-only"

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import {
  buildMenuResult,
  formatMenu,
  resolveMenuQuery,
} from "@/features/meal-planning/menu-query"
import { getWeekStartForDate } from "@/features/meal-planning/week-utils"
import { findDishNamesByIds } from "@/lib/db/dishes"
import { findWeeklyMealPlan } from "@/lib/db/weekly-meal-plans"
import { menuQuerySchema, menuResultSchema } from "@/schemas/mcp-menu"

export function createMenuServer() {
  const server = new McpServer({ name: "dalis-home", version: "1.0.0" })
  server.registerTool(
    "get_menu",
    {
      title: "Get the household menu",
      description:
        "Read planned lunches and dinners. Pass exactly one of period (today, tomorrow, last_week, this_week, next_week), date (YYYY-MM-DD for one day), or weekOf (YYYY-MM-DD for the Monday–Sunday week containing that date). Relative dates use Europe/Madrid. Every response includes today's date in Madrid. For next Wednesday use the next Wednesday strictly after today. For a day and month with no year, infer the year from context or use Madrid's current year. Call today first if you need the reference date.",
      inputSchema: menuQuerySchema,
      outputSchema: menuResultSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (query) => {
      try {
        const range = resolveMenuQuery(query)
        const plan = await findWeeklyMealPlan(
          getWeekStartForDate(range.startDate)
        )
        const slots = (plan?.slots ?? []).filter(({ date }) =>
          range.dates.includes(date)
        )
        const dishNames = await findDishNamesByIds(
          slots.map(({ dishId }) => dishId)
        )
        const result = buildMenuResult(range, slots, dishNames)
        return {
          content: [{ type: "text", text: formatMenu(result) }],
          structuredContent: result,
        }
      } catch {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "No se ha podido consultar el menú. Inténtalo de nuevo.",
            },
          ],
        }
      }
    }
  )
  return server
}
