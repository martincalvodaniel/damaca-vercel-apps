import "server-only"

import { type Filter, MongoServerError, ObjectId, type Sort } from "mongodb"
import type { z } from "zod"
import { normalizeArticleUrl } from "@/features/articles/normalize-url"
import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"
import {
  articleTopicLabels,
  findTopicReferences,
  registerTopics,
  type TopicMatches,
} from "@/lib/db/topics"
import type {
  ArticleCapture,
  ArticleEdit,
  readingStatus,
} from "@/schemas/article"
import type { LibraryQuery } from "@/schemas/library"

type ArticleDetails = Omit<
  ArticleCapture,
  "url" | "canonicalUrl" | "publishedAt" | "topics" | "fetchDiagnostics"
> & {
  publishedAt?: Date
  suggestedCanonicalUrl?: string
  proposedTopics?: string[]
  topicIds?: ObjectId[]
  sourceDomain: string
}

type ArticleDocument = ArticleDetails & {
  ownerId: string
  url: string
  canonicalUrl: string
  capturedAt: Date
  updatedAt: Date
  provenance: {
    method: "chatgpt"
    processedAt: Date
    fetchDiagnostics?: ArticleCapture["fetchDiagnostics"]
  }
  readingStatus: z.infer<typeof readingStatus>
  favorite: boolean
  personalNotes?: string
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
    fetchDiagnostics,
    ...content
  } = input
  const canonicalUrl = normalizeArticleUrl(url)
  const collection = await articles()
  const now = new Date()
  const provenance = {
    method: "chatgpt" as const,
    processedAt: now,
    ...(fetchDiagnostics && { fetchDiagnostics }),
  }
  const details: ArticleDetails = {
    ...content,
    ...(suggested && normalizeArticleUrl(suggested) !== canonicalUrl
      ? { suggestedCanonicalUrl: suggested }
      : {}),
    ...(publishedAt ? { publishedAt: new Date(publishedAt) } : {}),
    sourceDomain: new URL(url).hostname,
  }
  const identity = { ownerId, canonicalUrl }
  if (topics?.length) {
    const existing = await collection.findOne(identity)
    if (
      existing &&
      accessRank[input.accessStatus] <= accessRank[existing.accessStatus]
    ) {
      return {
        articleId: existing._id.toHexString(),
        status: "already_exists" as const,
        canonicalUrl,
      }
    }
    if (!existing?.editedFields?.includes("topicIds")) {
      details.topicIds = await registerTopics(ownerId, topics)
    }
  }

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

export async function findArticleByUrl(ownerId: string, url: string) {
  const document = await (await articles()).findOne({
    ownerId,
    canonicalUrl: normalizeArticleUrl(url),
  })
  return document ? serialize(document) : null
}

export async function editArticle(
  ownerId: string,
  id: string,
  revision: number,
  input: ArticleEdit
) {
  const collection = await articles()
  const identity = { ownerId, _id: new ObjectId(id), revision }
  const existing = await collection.findOne(identity)
  if (!existing) return false

  const {
    favorite,
    readingStatus,
    personalNotes,
    publishedAt,
    topics,
    ...metadata
  } = input
  const set: Partial<ArticleDocument> = {
    favorite,
    readingStatus,
    updatedAt: new Date(),
  }
  const unset: Partial<Record<keyof ArticleDocument, "">> = {}
  if (personalNotes) set.personalNotes = personalNotes
  else unset.personalNotes = ""

  const values = {
    ...metadata,
    publishedAt:
      publishedAt === existing.publishedAt?.toISOString().slice(0, 10)
        ? existing.publishedAt
        : publishedAt
          ? new Date(`${publishedAt}T00:00:00.000Z`)
          : undefined,
  }
  const edited: (keyof ArticleDetails)[] = []
  for (const field of Object.keys(values) as (keyof typeof values)[]) {
    const value = values[field]
    const normalized =
      value && (!Array.isArray(value) || value.length) ? value : undefined
    if (JSON.stringify(existing[field]) === JSON.stringify(normalized)) continue
    edited.push(field)
    if (normalized === undefined) unset[field] = ""
    else Object.assign(set, { [field]: normalized })
  }
  if (topics) {
    const previousLabels = await articleTopicLabels(
      ownerId,
      existing.topicIds?.map((id) => id.toHexString()) ?? [],
      existing.proposedTopics ?? []
    )
    if (JSON.stringify(topics) !== JSON.stringify(previousLabels)) {
      set.topicIds = await registerTopics(ownerId, topics)
      unset.proposedTopics = ""
      edited.push("topicIds")
    }
  }
  const result = await collection.updateOne(identity, {
    $set: set,
    $unset: unset,
    $inc: { revision: 1 },
    ...(edited.length && { $addToSet: { editedFields: { $each: edited } } }),
  })
  return result.matchedCount === 1
}

export async function updateArticleReading(
  ownerId: string,
  id: string,
  revision: number,
  change: { favorite: boolean } | { readingStatus: "read" | "unread" }
) {
  const result = await (await articles()).updateOne(
    { ownerId, _id: new ObjectId(id), revision },
    { $set: { ...change, updatedAt: new Date() }, $inc: { revision: 1 } }
  )
  return result.matchedCount === 1
}

export async function deleteArticle(
  ownerId: string,
  id: string,
  revision: number
) {
  const result = await (await articles()).deleteOne({
    ownerId,
    _id: new ObjectId(id),
    revision,
  })
  return result.deletedCount === 1
}

const librarySorts = {
  capture: { capturedAt: -1, _id: -1 },
  publication: { publishedAt: -1, _id: -1 },
  title: { title: 1, _id: 1 },
  relevance: { score: { $meta: "textScore" }, _id: -1 },
} as const satisfies Record<LibraryQuery["sort"], Sort>

function exactText(text: string) {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`^${escaped}$`, "i")
}

function dateRange(from?: string, to?: string) {
  const exclusiveEnd = to && new Date(`${to}T00:00:00.000Z`)
  if (exclusiveEnd) exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1)
  return {
    ...(from && { $gte: new Date(`${from}T00:00:00.000Z`) }),
    ...(exclusiveEnd && { $lt: exclusiveEnd }),
  }
}

function topicFilters({
  ids,
  legacyLabels,
}: TopicMatches): Filter<ArticleDocument>[] {
  return [
    { topicIds: { $in: ids } },
    { topicIds: { $exists: false }, proposedTopics: { $in: legacyLabels } },
  ]
}

export type RelatedArticle = { id: string; title: string; source: string }

export async function listRelatedArticles(
  ownerId: string,
  id: string,
  matches: TopicMatches
): Promise<RelatedArticle[]> {
  if (!matches.ids.length && !matches.legacyLabels.length) return []
  const documents = await (await articles())
    .find({
      ownerId,
      _id: { $ne: new ObjectId(id) },
      $or: topicFilters(matches),
    })
    .project<{
      _id: ObjectId
      title?: string
      source?: string
      sourceDomain: string
    }>({ title: 1, source: 1, sourceDomain: 1 })
    .sort(librarySorts.capture)
    .limit(3)
    .toArray()
  return documents.map((article) => ({
    id: article._id.toHexString(),
    title: article.title ?? article.sourceDomain,
    source: article.source ?? article.sourceDomain,
  }))
}

export async function* iterateLibraryArticles(ownerId: string) {
  const cursor = (await articles()).find({ ownerId }).sort(librarySorts.capture)
  try {
    for await (const document of cursor) yield serialize(document)
  } finally {
    await cursor.close()
  }
}

export async function listArticles(ownerId: string, query: LibraryQuery) {
  const filter: Filter<ArticleDocument> = { ownerId }
  if (query.q) filter.$text = { $search: query.q }
  if (query.author) filter.authors = exactText(query.author)
  if (query.source) {
    const source = exactText(query.source)
    filter.$or = [{ source }, { sourceDomain: source }]
  }
  if (query.topic)
    filter.$and = [
      { $or: topicFilters(await findTopicReferences(ownerId, query.topic)) },
    ]
  if (query.language) filter.language = exactText(query.language)
  if (query.type) filter.contentType = query.type
  if (query.access) filter.accessStatus = query.access
  if (query.reading) filter.readingStatus = query.reading
  if (query.favorite) filter.favorite = true
  if (query.capturedFrom || query.capturedTo)
    filter.capturedAt = dateRange(query.capturedFrom, query.capturedTo)
  if (query.publishedFrom || query.publishedTo)
    filter.publishedAt = dateRange(query.publishedFrom, query.publishedTo)

  const sort = query.sort === "relevance" && !query.q ? "capture" : query.sort
  const pageSize = 20
  const documents = await (await articles())
    .find(filter)
    .sort(librarySorts[sort])
    .skip((query.page - 1) * pageSize)
    .limit(pageSize + 1)
    .toArray()
  return {
    items: documents.slice(0, pageSize).map(serialize),
    hasNext: documents.length > pageSize && query.page < 99_999,
  }
}
