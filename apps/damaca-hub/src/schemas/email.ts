import { z } from "zod"

export const accessEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email().max(254))
