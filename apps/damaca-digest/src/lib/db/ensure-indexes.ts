import "server-only"

import type {
  Collection,
  CreateIndexesOptions,
  IndexSpecification,
} from "mongodb"

export interface IndexDatabase {
  collection(name: string): Pick<Collection, "createIndex">
}

export interface IndexSpec {
  collection: string
  keys: IndexSpecification
  options: CreateIndexesOptions & { name: string }
}

export const INDEX_SPECS: readonly IndexSpec[] = [
  {
    collection: "articles",
    keys: { ownerId: 1, canonicalUrl: 1 },
    options: { name: "owner_canonical_url_unique", unique: true },
  },
  {
    collection: "articles",
    keys: { ownerId: 1, capturedAt: -1, _id: -1 },
    options: { name: "owner_capture_id_desc" },
  },
  {
    collection: "articles",
    keys: { ownerId: 1, publishedAt: -1, _id: -1 },
    options: { name: "owner_publication_id_desc" },
  },
  {
    collection: "articles",
    keys: {
      ownerId: 1,
      title: "text",
      summary: "text",
      keyTakeaways: "text",
      authors: "text",
      source: "text",
    },
    options: {
      name: "owner_article_search",
      default_language: "none",
      language_override: "textIndexLanguage",
      weights: { title: 8, authors: 4, summary: 3, source: 2, keyTakeaways: 1 },
    },
  },
  {
    collection: "capture_limits",
    keys: { expiresAt: 1 },
    options: { name: "capture_limit_ttl", expireAfterSeconds: 0 },
  },
  {
    collection: "user_access",
    keys: { status: 1, email: 1 },
    options: { name: "status_asc_email_asc" },
  },
  {
    collection: "user_access",
    keys: { email: 1 },
    options: { name: "email_unique", unique: true },
  },
]

export function validateIndexSpecs(specs: readonly IndexSpec[]): void {
  const namesByCollection = new Map<string, Set<string>>()

  for (const spec of specs) {
    const collection = spec.collection.trim()
    const name = spec.options.name.trim()

    if (!collection || !name) {
      throw new Error("MongoDB indexes require a collection and a stable name")
    }

    const collectionNames = namesByCollection.get(collection) ?? new Set()
    if (collectionNames.has(name)) {
      throw new Error(`Duplicate MongoDB index name: ${collection}.${name}`)
    }

    collectionNames.add(name)
    namesByCollection.set(collection, collectionNames)
  }
}

export async function ensureIndexes(
  database: IndexDatabase,
  specs: readonly IndexSpec[] = INDEX_SPECS
): Promise<void> {
  validateIndexSpecs(specs)

  for (const spec of specs) {
    await database
      .collection(spec.collection)
      .createIndex(spec.keys, spec.options)
  }
}
