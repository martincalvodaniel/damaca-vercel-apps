import "server-only"

import { type ClientSession, MongoServerError, ObjectId } from "mongodb"
import {
  changeTopic,
  type TopicEntry,
  topicCatalog,
} from "@/features/topics/catalog"
import { withTopicTransaction } from "@/lib/db/client"
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

async function legacyTopics(ownerId: string, session?: ClientSession) {
  const labels = await (await articleTopics()).distinct(
    "proposedTopics",
    {
      ownerId,
      "topicIds.0": { $exists: false },
      proposedTopics: { $exists: true },
    },
    { session }
  )
  return labels
    .filter((label): label is string => typeof label === "string")
    .sort()
}

async function readCatalog(ownerId: string, session?: ClientSession) {
  const vocabulary = await (await vocabularies()).findOne(
    { _id: ownerId },
    { session }
  )
  const legacyLabels = await legacyTopics(ownerId, session)
  return {
    ...topicCatalog(ownerId, vocabulary?.entries ?? [], legacyLabels),
    legacyLabels,
  }
}

async function updateVocabulary<Result>(
  ownerId: string,
  update: (
    entries: TopicEntry[]
  ) => { entries: TopicEntry[]; result: Result } | null,
  session?: ClientSession
) {
  const [collection, legacyLabels] = await Promise.all([
    vocabularies(),
    legacyTopics(ownerId, session),
  ])
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const current = await collection.findOne({ _id: ownerId }, { session })
    const entries = topicCatalog(
      ownerId,
      current?.entries ?? [],
      legacyLabels
    ).entries
    const next = update(entries)
    if (!next) return null

    if (!current) {
      try {
        await collection.insertOne(
          {
            _id: ownerId,
            revision: 0,
            entries: next.entries,
          },
          { session }
        )
        return next.result
      } catch (error) {
        if (
          session ||
          !(error instanceof MongoServerError) ||
          error.code !== 11000
        )
          throw error
      }
    } else {
      if (
        !session &&
        JSON.stringify(current.entries) === JSON.stringify(next.entries)
      )
        return next.result
      const result = await collection.updateOne(
        { _id: ownerId, revision: current.revision },
        { $set: { entries: next.entries }, $inc: { revision: 1 } },
        { session }
      )
      if (result.matchedCount) return next.result
    }
  }
  throw new Error("Topic vocabulary changed during update")
}

export async function registerTopics(
  ownerId: string,
  labels: string[],
  session: ClientSession
) {
  if (!labels.length) return []
  const ids = await updateVocabulary(
    ownerId,
    (entries) => {
      const catalog = topicCatalog(ownerId, entries, labels)
      const ids = labels.flatMap((label) => {
        const entry = catalog.find(label)
        return entry ? [entry.id] : []
      })
      return {
        entries: catalog.entries,
        result: [...new Set(ids)].map((id) => new ObjectId(id)),
      }
    },
    session
  )
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

export async function createTopicLabelResolver(
  ownerId: string,
  session?: ClientSession
) {
  const catalog = await readCatalog(ownerId, session)
  return (topicIds: string[], legacyLabels: string[]) =>
    referencedTopics(catalog, topicIds, legacyLabels).map(({ label }) => label)
}

export async function articleTopicLabels(
  ownerId: string,
  topicIds: string[],
  legacyLabels: string[],
  session?: ClientSession
) {
  if (!topicIds.length && !legacyLabels.length) return []
  const resolve = await createTopicLabelResolver(ownerId, session)
  return resolve(topicIds, legacyLabels)
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

export async function deleteEmptyTopic(ownerId: string, topicId: string) {
  return withTopicTransaction(async (session) => {
    const catalog = await readCatalog(ownerId, session)
    if (catalog.resolve(topicId)?.id !== topicId) return "missing"
    const { ids, legacyLabels } = matchesForIds(catalog, new Set([topicId]))
    const article = await (await articleTopics()).findOne(
      {
        ownerId,
        $or: [
          { topicIds: { $in: ids } },
          {
            "topicIds.0": { $exists: false },
            proposedTopics: { $in: legacyLabels },
          },
        ],
      },
      { session, projection: { _id: 1 } }
    )
    if (article) return "in_use"
    const removed = new Set(ids.map((id) => id.toHexString()))
    const updated = await updateVocabulary(
      ownerId,
      (entries) => ({
        entries: entries.filter(({ id }) => !removed.has(id)),
        result: true,
      }),
      session
    )
    return updated ? "deleted" : "missing"
  })
}
