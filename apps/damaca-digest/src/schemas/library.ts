import { z } from "zod"
import { accessStatus, contentType, readingStatus } from "@/schemas/article"

const filterText = (max: number) => z.string().trim().min(1).max(max).optional()
const date = z.iso
  .date()
  .optional()
  .describe("Inclusive UTC date in YYYY-MM-DD format.")

const libraryFilters = {
  q: filterText(200).describe(
    "Keywords matched against title, authors, summary, source and takeaways."
  ),
  topic: filterText(100).describe("Topic label or alias from the library."),
  author: filterText(150),
  source: filterText(180),
  language: filterText(35),
  type: contentType.optional(),
  access: accessStatus.optional(),
  reading: readingStatus.optional(),
  capturedFrom: date,
  capturedTo: date,
  publishedFrom: date,
  publishedTo: date,
  sort: z
    .enum(["capture", "publication", "title", "relevance"])
    .default("capture"),
}

function validRanges({
  capturedFrom,
  capturedTo,
  publishedFrom,
  publishedTo,
}: {
  capturedFrom?: string
  capturedTo?: string
  publishedFrom?: string
  publishedTo?: string
}) {
  return (
    (!capturedFrom || !capturedTo || capturedFrom <= capturedTo) &&
    (!publishedFrom || !publishedTo || publishedFrom <= publishedTo)
  )
}

const multiple = <T extends z.ZodType<string>>(item: T) =>
  z.preprocess(
    (value) => (typeof value === "string" ? [value] : value),
    z
      .array(item)

      .transform((values) => [...new Set(values)])
      .optional()
  )

export const libraryQuery = z
  .object({
    ...libraryFilters,
    language: multiple(z.string().trim().min(1).max(35)),
    access: multiple(accessStatus),
    type: multiple(contentType),
    reading: multiple(readingStatus),
    favorite: z.literal("true").optional(),
    page: z
      .string()
      .regex(/^[1-9]\d{0,4}$/)
      .transform(Number)
      .default(1),
  })
  .refine(validRanges, "Invalid date range.")

export const mcpLibraryQuery = z
  .strictObject({
    ...libraryFilters,
    favorite: z.literal(true).optional(),
    page: z.number().int().min(1).max(99_999).default(1),
  })
  .refine(validRanges, "Invalid date range.")

export const mcpReadingDigestQuery = z
  .strictObject({
    capturedFrom: z.iso.date(),
    capturedTo: z.iso.date(),
    page: z.number().int().min(1).max(99_999).default(1),
  })
  .refine(validRanges, "Invalid date range.")

export type McpLibraryQuery = z.output<typeof mcpLibraryQuery>
export type LibraryQuery = z.output<typeof libraryQuery>

export function parseLibraryQuery(
  input: Record<string, string | string[] | undefined>
) {
  return libraryQuery.safeParse(
    Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== "")
    )
  )
}

export function libraryPageHref(query: LibraryQuery, page: number) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (
      key === "page" ||
      value === undefined ||
      (key === "sort" && value === "capture")
    )
      continue
    for (const item of Array.isArray(value) ? value : [value])
      params.append(key, String(item))
  }
  if (page > 1) params.set("page", String(page))
  return params.size ? `/?${params.toString()}` : "/?reset=1"
}
