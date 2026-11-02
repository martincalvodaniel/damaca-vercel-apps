import { z } from "zod"

export const householdDateSchema = z
  .string()
  .regex(/^(19|20|21)\d{2}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`)
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    )
  }, "Invalid civil date")
const id = z.uuid()
const taskFields = {
  name: z.string().trim().min(1).max(120),
  intervalDays: z.number().int().positive().max(36500),
}

export const householdTaskCommandSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("create"),
      taskId: id,
      ...taskFields,
      initialDate: householdDateSchema.optional(),
    })
    .strict(),
  z.object({ kind: z.literal("update"), taskId: id, ...taskFields }).strict(),
  z.object({ kind: z.literal("archive"), taskId: id }).strict(),
  z.object({ kind: z.literal("restore"), taskId: id }).strict(),
  z
    .object({
      kind: z.literal("schedule"),
      taskId: id,
      occurrenceId: id,
      date: householdDateSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("move"),
      taskId: id,
      occurrenceId: id,
      expectedDate: householdDateSchema,
      date: householdDateSchema,
    })
    .strict(),
  z
    .object({ kind: z.literal("cancel"), taskId: id, occurrenceId: id })
    .strict(),
  z
    .object({
      kind: z.literal("complete"),
      taskId: id,
      occurrenceId: id,
      completedDate: householdDateSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("record"),
      taskId: id,
      occurrenceId: id,
      completedDate: householdDateSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("edit-execution"),
      taskId: id,
      occurrenceId: id,
      expectedCompletedDate: householdDateSchema,
      completedDate: householdDateSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("delete-execution"),
      taskId: id,
      occurrenceId: id,
      expectedCompletedDate: householdDateSchema,
    })
    .strict(),
])

export type HouseholdTaskCommand = z.infer<typeof householdTaskCommandSchema>

export function parseHouseholdTaskCommand(input: unknown, today: string) {
  return householdTaskCommandSchema
    .superRefine((command, context) => {
      const executionDate =
        "completedDate" in command
          ? command.completedDate
          : "initialDate" in command
            ? command.initialDate
            : undefined
      if (executionDate && executionDate > today) {
        context.addIssue({
          code: "custom",
          message: "Executions cannot be in the future",
        })
      }
    })
    .safeParse(input)
}
