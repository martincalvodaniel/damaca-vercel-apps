import { z } from "zod"
import { accessStatus, contentType, readingStatus } from "@/schemas/article"

const filterText = (max: number) => z.string().trim().min(1).max(max).optional()
const date = z.iso.date().optional()

export const libraryQuery = z
  .object({
    q: filterText(200),
    topic: filterText(100),
    author: filterText(150),
    source: filterText(180),
    language: filterText(35),
    type: contentType.optional(),
    access: accessStatus.optional(),
    reading: readingStatus.optional(),
    favorite: z.literal("true").optional(),
    capturedFrom: date,
    capturedTo: date,
    publishedFrom: date,
    publishedTo: date,
    sort: z
      .enum(["capture", "publication", "title", "relevance"])
      .default("capture"),
    page: z
      .string()
      .regex(/^[1-9]\d{0,4}$/)
      .transform(Number)
      .default(1),
  })
  .refine(
    ({ capturedFrom, capturedTo, publishedFrom, publishedTo }) =>
      (!capturedFrom || !capturedTo || capturedFrom <= capturedTo) &&
      (!publishedFrom || !publishedTo || publishedFrom <= publishedTo),
    "Invalid date range."
  )

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
    if (key !== "page" && value !== undefined) params.set(key, String(value))
  }
  if (page > 1) params.set("page", String(page))
  return params.size ? `/?${params.toString()}` : "/"
}
