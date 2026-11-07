import { z } from "zod"

export const MAX_REMINDER_LENGTH = 280
export const reminderTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_REMINDER_LENGTH)
