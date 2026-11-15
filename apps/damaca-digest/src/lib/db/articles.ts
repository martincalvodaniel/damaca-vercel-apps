import "server-only"

import { MongoServerError, ObjectId } from "mongodb"
import type { z } from "zod"
import { normalizeArticleUrl } from "@/features/articles/normalize-url"
import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"
import type { ArticleCapture, readingStatus } from "@/schemas/article"

type ArticleDetails = Omit<
  ArticleCapture,
  "url" | "canonicalUrl" | "publishedAt" | "topics"
> & {
  publishedAt?: Date
  suggestedCanonicalUrl?: string
  proposedTopics?: string[]
  sourceDomain: string
}

type ArticleDocument = ArticleDetails & {
  ownerId: string
  url: string
  canonicalUrl: string
  capturedAt: Date
  updatedAt: Date
  provenance: { method: "chatgpt"; processedAt: Date }
  readingStatus: z.infer<typeof readingStatus>
  favorite: boolean
  personalNotes?: string
  topicIds?: ObjectId[]
  editedFields?: (keyof ArticleDetails)[]
  revision: number
}

export type Article = Omit<ArticleDocument, "ownerId" | "topicIds"> & {
  id: string
  topicIds: string[]
}

function serialize({
  _id,
  ownerId: _,
  topicIds,
  ...article
}: ArticleDocument & { _id: ObjectId }): Article {
  return {
    ...article,
    id: _id.toHexString(),
    topicIds: (topicIds ?? []).map((id) => id.toHexString()),
  }
}

const accessRank = { unavailable: 0, partial: 1, full: 2 }

async function articles() {
  return getCollection<ArticleDocument>(COLLECTION_NAMES.articles)
}

export async function saveArticle(ownerId: string, input: ArticleCapture) {
  const {
    url,
    canonicalUrl: suggested,
    publishedAt,
    topics,
    ...content
  } = input
  const canonicalUrl = normalizeArticleUrl(url)
  const collection = await articles()
  const now = new Date()
  const provenance = { method: "chatgpt" as const, processedAt: now }
  const details: ArticleDetails = {
    ...content,
    ...(suggested && normalizeArticleUrl(suggested) !== canonicalUrl
      ? { suggestedCanonicalUrl: suggested }
      : {}),
    ...(publishedAt ? { publishedAt: new Date(publishedAt) } : {}),
    ...(topics?.length ? { proposedTopics: topics } : {}),
    sourceDomain: new URL(url).hostname,
  }
  const identity = { ownerId, canonicalUrl }

  try {
    const result = await collection.insertOne({
      ...identity,
      ...details,
      url,
      capturedAt: now,
      updatedAt: now,
      provenance,
      readingStatus: "unread",
      favorite: false,
      revision: 0,
    })
    return {
      articleId: result.insertedId.toHexString(),
      status: "created" as const,
      canonicalUrl,
    }
  } catch (error) {
    if (!(error instanceof MongoServerError) || error.code !== 11000)
      throw error
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await collection.findOne(identity)
    if (!existing) throw new Error("Article changed during capture")
    const articleId = existing._id.toHexString()
    if (accessRank[input.accessStatus] <= accessRank[existing.accessStatus]) {
      return { articleId, status: "already_exists" as const, canonicalUrl }
    }

    const enrichment = Object.fromEntries(
      Object.entries(details).filter(
        ([key]) => !existing.editedFields?.some((field) => field === key)
      )
    )
    const clearAccessNote =
      input.accessStatus === "full" &&
      !input.accessNotes &&
      !existing.editedFields?.includes("accessNotes")
    const result = await collection.updateOne(
      { ...identity, _id: existing._id, revision: existing.revision },
      {
        $set: { ...enrichment, updatedAt: now, provenance },
        ...(clearAccessNote && { $unset: { accessNotes: "" } }),
        $inc: { revision: 1 },
      }
    )
    if (result.modifiedCount)
      return { articleId, status: "updated" as const, canonicalUrl }
  }
  throw new Error("Article changed during capture")
}

export async function findArticle(ownerId: string, id: string) {
  const document = await (await articles()).findOne({
    ownerId,
    _id: new ObjectId(id),
  })
  return document ? serialize(document) : null
}

export async function listRecentArticles(ownerId: string) {
  const documents = await (await articles())
    .find({ ownerId })
    .sort({ capturedAt: -1, _id: -1 })
    .limit(30)
    .toArray()
  return documents.map(serialize)
}
