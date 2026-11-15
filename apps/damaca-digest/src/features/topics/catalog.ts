import { createHash } from "node:crypto"
import type { TopicChange } from "@/schemas/topic"

export type TopicEntry = {
  id: string
  label: string
  aliases: string[]
  mergedInto?: string
}

export function topicKey(label: string) {
  return label.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase()
}

export function filterTopicLabels<
  T extends Pick<TopicEntry, "label" | "aliases">,
>(topics: T[], query?: string) {
  const term = topicKey(query ?? "")
  if (!term) return topics
  return topics.filter(({ label, aliases }) =>
    [label, ...aliases].some((text) => topicKey(text).includes(term))
  )
}

function topicId(ownerId: string, label: string) {
  return createHash("sha256")
    .update(JSON.stringify([ownerId, topicKey(label)]))
    .digest("hex")
    .slice(0, 24)
}

export function topicCatalog(
  ownerId: string,
  entries: TopicEntry[],
  legacyLabels: string[]
) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]))
  const byLabel = new Map<string, string>()
  for (const entry of entries) {
    for (const label of [entry.label, ...entry.aliases])
      byLabel.set(topicKey(label), entry.id)
  }

  for (const label of legacyLabels) {
    if (!byLabel.has(topicKey(label))) {
      const id = topicId(ownerId, label)
      byId.set(id, { id, label, aliases: [] })
      byLabel.set(topicKey(label), id)
    }
  }

  function resolve(id: string | undefined): TopicEntry | undefined {
    let entry = id ? byId.get(id) : undefined
    while (entry?.mergedInto) entry = byId.get(entry.mergedInto)
    return entry
  }

  return {
    entries: [...byId.values()],
    find: (label: string) => resolve(byLabel.get(topicKey(label))),
    resolve,
  }
}

export function changeTopic(
  ownerId: string,
  entries: TopicEntry[],
  input: TopicChange
) {
  const catalog = topicCatalog(ownerId, entries, [])
  const selected = catalog.resolve(input.topicId)
  if (!selected || selected.id !== input.topicId) return null

  if (input.operation === "merge") {
    const target = catalog.resolve(input.targetId)
    if (!target || target.id !== input.targetId || target.id === selected.id)
      return null

    return entries.map((entry) =>
      entry.id === selected.id ? { ...entry, mergedInto: target.id } : entry
    )
  }

  const conflict = catalog.find(input.label)
  if (conflict && conflict.id !== selected.id) return null
  const label = input.operation === "rename" ? input.label : selected.label
  const aliases = new Map<string, string>()
  for (const candidate of [selected.label, ...selected.aliases, input.label]) {
    if (topicKey(candidate) !== topicKey(label))
      aliases.set(topicKey(candidate), candidate)
  }
  return entries.map((entry) =>
    entry.id === selected.id
      ? { ...entry, label, aliases: [...aliases.values()] }
      : entry
  )
}
