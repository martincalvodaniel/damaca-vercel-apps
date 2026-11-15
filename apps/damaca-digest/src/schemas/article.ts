import { z } from "zod"

export const articleId = z.string().regex(/^[a-f\d]{24}$/i)
export const accessStatus = z.enum(["unavailable", "partial", "full"])
export const readingStatus = z.enum(["unread", "reading", "read", "archived"])
export const contentType = z.enum(["article", "news", "blog", "documentation"])
const text = (limit: number) => z.string().trim().min(1).max(limit)
export const webUrl = text(4096).refine((value) => {
  const url = URL.parse(value)
  return (
    !!url &&
    !url.username &&
    !url.password &&
    (url.protocol === "https:" || url.protocol === "http:")
  )
}, "Use an HTTP or HTTPS URL without credentials")

export const captureArticle = z
  .strictObject({
    url: webUrl,
    canonicalUrl: webUrl.optional(),
    title: text(350).optional(),
    authors: z.array(text(150)).max(25).optional(),
    source: text(180).optional(),
    publishedAt: z.iso.datetime({ offset: true }).optional(),
    language: text(35)
      .regex(/^[a-z]{2,8}(?:-[a-z\d]{1,8})*$/i)
      .optional(),
    contentType: contentType.optional(),
    summary: text(12_000).optional(),
    keyTakeaways: z.array(text(1500)).max(20).optional(),
    topics: z.array(text(100)).max(15).optional(),
    relatedLinks: z
      .array(
        z.strictObject({
          url: webUrl,
          title: text(350).optional(),
          origin: z.enum(["source", "ai_suggested"]),
        })
      )
      .max(50)
      .optional(),
    accessStatus,
    accessNotes: text(2000).optional(),
  })
  .superRefine((article, ctx) => {
    if (article.accessStatus === "partial" && !article.accessNotes) {
      ctx.addIssue({
        code: "custom",
        path: ["accessNotes"],
        message: "Describe the access limitation.",
      })
    }
    if (
      article.accessStatus === "unavailable" &&
      (article.summary ||
        article.keyTakeaways?.length ||
        article.relatedLinks?.some((link) => link.origin === "source"))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["accessStatus"],
        message:
          "Unavailable articles cannot include derived content or source references.",
      })
    }
  })

export type ArticleCapture = z.infer<typeof captureArticle>
