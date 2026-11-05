import { z } from "zod"
import { THEME_IDS } from "@/lib/domain/entities/user-preferences"

export const userPreferencesSchema = z
  .object({ theme: z.enum(THEME_IDS) })
  .strict()
