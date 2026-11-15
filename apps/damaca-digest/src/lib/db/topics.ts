import "server-only"

import { MongoServerError, ObjectId } from "mongodb"
import {
  changeTopic,
  type TopicEntry,
  topicCatalog,
} from "@/features/topics/catalog"
import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"
import type { TopicChange } from "@/schemas/topic"

type Vocabulary = { _id: string; revision: number; entries: TopicEntry[] }
type TopicReferences = {
  ownerId: string
  topicIds?: ObjectId[]
  proposedTopics?: string[]
}

async function vocabularies() {
  return getCollection<Vocabulary>(COLLECTION_NAMES.topics)
}

async function articleTopics() {
  return getCollection<TopicReferences>(COLLECTION_NAMES.articles)
}

async function legacyTopics(ownerId: string) {
  const labels = await (await articleTopics()).distinct("proposedTopics", {
    ownerId,
    topicIds: { $exists: false },
  })
  return labels
    .filter((label): label is string => typeof label === "string")
    .sort()
}

async function readCatalog(ownerId: string) {
  const [vocabulary, legacyLabels] = await Promise.all([
    (await vocabularies()).findOne({ _id: ownerId }),
    legacyTopics(ownerId),
  ])
  return {
    ...topicCatalog(ownerId, vocabulary?.entries ?? [], legacyLabels),
    legacyLabels,
  }
}

async function updateVocabulary<Result>(
  ownerId: string,
  update: (
    entries: TopicEntry[]
  ) => { entries: TopicEntry[]; result: Result } | null
) {
  const [collection, legacyLabels] = await Promise.all([
    vocabularies(),
    legacyTopics(ownerId),
  ])
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const current = await collection.findOne({ _id: ownerId })
    const entries = topicCatalog(
      ownerId,
      current?.entries ?? [],
      legacyLabels
    ).entries
    const next = update(entries)
    if (!next) return null

    if (!current) {
      try {
        await collection.insertOne({
          _id: ownerId,
          revision: 0,
          entries: next.entries,
        })
        return next.result
      } catch (error) {
        if (!(error instanceof MongoServerError) || error.code !== 11000)
          throw error
      }
    } else {
      if (JSON.stringify(current.entries) === JSON.stringify(next.entries))
        return next.result
      const result = await collection.updateOne(
        { _id: ownerId, revision: current.revision },
        { $set: { entries: next.entries }, $inc: { revision: 1 } }
      )
      if (result.matchedCount) return next.result
    }
  }
  throw new Error("Topic vocabulary changed during update")
}

export async function registerTopics(ownerId: string, labels: string[]) {
  if (!labels.length) return []
  const ids = await updateVocabulary(ownerId, (entries) => {
    const catalog = topicCatalog(ownerId, entries, labels)
    const ids = labels.flatMap((label) => {
      const entry = catalog.find(label)
      return entry ? [entry.id] : []
    })
    return {
      entries: catalog.entries,
      result: [...new Set(ids)].map((id) => new ObjectId(id)),
    }
  })
  return ids ?? []
}

export async function manageTopic(ownerId: string, input: TopicChange) {
  return updateVocabulary(ownerId, (entries) => {
    const updated = changeTopic(ownerId, entries, input)
    return updated ? { entries: updated, result: true } : null
  })
}

function referencedTopics(
  catalog: Awaited<ReturnType<typeof readCatalog>>,
  topicIds: string[],
  legacyLabels: string[]
) {
  const entries = topicIds.length
    ? topicIds.map((id) => catalog.resolve(id))
    : legacyLabels.map((label) => catalog.find(label))
  return [
    ...new Map(
      entries.flatMap((entry) => (entry ? [[entry.id, entry] as const] : []))
    ).values(),
  ]
}

export async function articleTopicLabels(
  ownerId: string,
  topicIds: string[],
  legacyLabels: string[]
) {
  if (!topicIds.length && !legacyLabels.length) return []
  const catalog = await readCatalog(ownerId)
  return referencedTopics(catalog, topicIds, legacyLabels).map(
    ({ label }) => label
  )
}

export type TopicMatches = { ids: ObjectId[]; legacyLabels: string[] }

function matchesForIds(
  catalog: Awaited<ReturnType<typeof readCatalog>>,
  selected: Set<string>
): TopicMatches {
  return {
    ids: catalog.entries.flatMap((entry) => {
      const canonical = catalog.resolve(entry.id)
      return canonical && selected.has(canonical.id)
        ? [new ObjectId(entry.id)]
        : []
    }),
    legacyLabels: catalog.legacyLabels.filter((legacy) => {
      const canonical = catalog.find(legacy)
      return !!canonical && selected.has(canonical.id)
    }),
  }
}

export async function findTopicReferences(ownerId: string, label: string) {
  const catalog = await readCatalog(ownerId)
  const entry = catalog.find(label)
  return matchesForIds(catalog, new Set(entry ? [entry.id] : []))
}

export async function articleTopicContext(
  ownerId: string,
  topicIds: string[],
  legacyLabels: string[]
) {
  if (!topicIds.length && !legacyLabels.length)
    return { labels: [], matches: { ids: [], legacyLabels: [] } }
  const catalog = await readCatalog(ownerId)
  const entries = referencedTopics(catalog, topicIds, legacyLabels)
  return {
    labels: entries.map((entry) => entry.label),
    matches: matchesForIds(catalog, new Set(entries.map((entry) => entry.id))),
  }
}

export async function listTopics(ownerId: string, includeCounts = false) {
  const catalog = await readCatalog(ownerId)
  const active = new Map<
    string,
    { id: string; label: string; aliases: Set<string>; articleCount: number }
  >()
  for (const entry of catalog.entries) {
    if (!entry.mergedInto)
      active.set(entry.id, {
        id: entry.id,
        label: entry.label,
        aliases: new Set(entry.aliases),
        articleCount: 0,
      })
  }
  for (const entry of catalog.entries) {
    if (!entry.mergedInto) continue
    const target = active.get(catalog.resolve(entry.id)?.id ?? "")
    if (target) {
      for (const alias of [entry.label, ...entry.aliases])
        target.aliases.add(alias)
    }
  }
  if (includeCounts) {
    const cursor = (await articleTopics()).find(
      { ownerId },
      { projection: { topicIds: 1, proposedTopics: 1 } }
    )
    for await (const article of cursor) {
      const matches = referencedTopics(
        catalog,
        article.topicIds?.map((id) => id.toHexString()) ?? [],
        article.proposedTopics ?? []
      )
      for (const match of matches) {
        const topic = active.get(match.id)
        if (topic) topic.articleCount += 1
      }
    }
  }
  return [...active.values()]
    .map((topic) => ({ ...topic, aliases: [...topic.aliases] }))
    .sort(
      (a, b) => a.label.localeCompare(b.label, "en") || a.id.localeCompare(b.id)
    )
}
