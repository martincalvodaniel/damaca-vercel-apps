import { z } from "zod"
import { articleId } from "@/schemas/article"

export const topicLabel = z.string().trim().min(1).max(100)

export const topicChange = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("alias"),
    topicId: articleId,
    label: topicLabel,
  }),
  z.object({
    operation: z.literal("rename"),
    topicId: articleId,
    label: topicLabel,
  }),
  z.object({
    operation: z.literal("merge"),
    topicId: articleId,
    targetId: articleId,
  }),
])
export type TopicChange = z.infer<typeof topicChange>
