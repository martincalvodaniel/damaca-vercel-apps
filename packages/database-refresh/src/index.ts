import "server-only"

import {
  type ClientSession,
  type CollectionInfo,
  type CreateIndexesOptions,
  type Db,
  type Document,
  type IndexDescription,
  MongoClient,
} from "mongodb"

export const REFRESH_METADATA_COLLECTION = "__database_refresh"

export interface DatabaseRefreshConfig {
  sourceUri: string
  sourceDatabase: string
  targetUri: string
  targetDatabase: string
  collections: Readonly<Record<string, "copy" | "preserve">>
  batchSize?: number
}

interface RefreshMetadata extends Document {
  _id: string
  manifest?: IndexManifest
  runId?: string
  backups?: Array<{
    collection: string
    backup: string
    originalExists: boolean
  }>
}

interface RefreshLock extends RefreshMetadata {
  _id: "lock"
  runId: string
  previousManifest: IndexManifest | null
  backups: Array<{
    collection: string
    backup: string
    originalExists: boolean
  }>
}

export interface IndexManifest {
  version: 1
  sourceDatabase: string
  createdAt: string
  collections: Record<string, IndexDescription[]>
}

export function normalizeIndex(index: IndexDescription): Document {
  const {
    ns: _namespace,
    v: _version,
    background: _background,
    ...portable
  } = index as IndexDescription & Document
  return portable
}

export function sameIndexes(
  left: readonly IndexDescription[],
  right: readonly IndexDescription[]
): boolean {
  const normalize = (indexes: readonly IndexDescription[]) =>
    indexes.map((index) => JSON.stringify(normalizeIndex(index))).sort()
  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))
}

function portableIndexOptions(index: IndexDescription): CreateIndexesOptions {
  const normalized = normalizeIndex(index)
  const { key: _key, name: _name, ...options } = normalized
  return options as CreateIndexesOptions
}

function collectionOptions(info: CollectionInfo): Document | undefined {
  const options = info.options ?? {}
  const supported = [
    "collation",
    "validator",
    "validationLevel",
    "validationAction",
  ]
  const unsupported = Object.keys(options).filter(
    (key) => !supported.includes(key)
  )
  if (unsupported.length > 0) {
    throw new Error(
      `Unsupported collection options on ${info.name}: ${unsupported.join(", ")}`
    )
  }
  return Object.keys(options).length > 0 ? options : undefined
}

async function listIndexes(
  database: Db,
  name: string
): Promise<IndexDescription[]> {
  return database.collection(name).listIndexes().toArray()
}

async function createStagingCollection(
  target: Db,
  sourceInfo: CollectionInfo,
  sourceIndexes: IndexDescription[],
  stagingName: string,
  sourceDatabase: string,
  copyFrom: Db,
  session: ClientSession,
  batchSize: number
): Promise<void> {
  await target.createCollection(stagingName, collectionOptions(sourceInfo))
  const sourceCollection = copyFrom.collection(sourceInfo.name)
  const stagingCollection = target.collection(stagingName)
  const cursor = sourceCollection.find({}, { session }).batchSize(batchSize)

  while (await cursor.hasNext()) {
    const documents: Document[] = []
    while (documents.length < batchSize && (await cursor.hasNext())) {
      const document = await cursor.next()
      if (document) documents.push(document)
    }
    if (documents.length > 0)
      await stagingCollection.insertMany(documents, { ordered: true })
  }

  for (const index of sourceIndexes) {
    if (index.name === "_id_") continue
    await stagingCollection.createIndex(index.key, {
      ...portableIndexOptions(index),
      name: index.name,
    })
  }

  const stagingIndexes = await listIndexes(target, stagingName)
  if (!sameIndexes(sourceIndexes, stagingIndexes)) {
    throw new Error(
      `Staged indexes differ from source for ${sourceDatabase}.${sourceInfo.name}`
    )
  }
}

function validateConfig(config: DatabaseRefreshConfig): void {
  if (!config.sourceUri.trim() || !config.targetUri.trim())
    throw new Error("Source and target MongoDB URIs are required")
  if (!config.sourceDatabase.trim() || !config.targetDatabase.trim())
    throw new Error("Source and target database names are required")
  if (config.sourceDatabase === config.targetDatabase)
    throw new Error("Source and target databases must be different")
  if (Object.keys(config.collections).length === 0)
    throw new Error("At least one collection policy is required")
  if (Object.keys(config.collections).includes(REFRESH_METADATA_COLLECTION))
    throw new Error("Refresh metadata cannot be part of the collection policy")
  if (
    Object.keys(config.collections).some((name) =>
      name.startsWith("__refresh_")
    )
  ) {
    throw new Error("Reserved refresh collection names cannot be copied")
  }
}

async function setLock(target: Db, lock: RefreshLock): Promise<void> {
  await target
    .collection<RefreshMetadata>(REFRESH_METADATA_COLLECTION)
    .replaceOne({ _id: "lock" }, lock, { upsert: true })
}

async function clearLock(target: Db): Promise<void> {
  await target
    .collection<RefreshMetadata>(REFRESH_METADATA_COLLECTION)
    .deleteOne({ _id: "lock" })
}

async function readManifest(target: Db): Promise<IndexManifest | null> {
  const record = await target
    .collection<RefreshMetadata>(REFRESH_METADATA_COLLECTION)
    .findOne({ _id: "index-manifest" })
  return (record?.manifest as IndexManifest | undefined) ?? null
}

export async function hasActiveRefresh(database: Db): Promise<boolean> {
  const state = await database
    .collection<RefreshMetadata>(REFRESH_METADATA_COLLECTION)
    .findOne({ _id: "lock" }, { projection: { _id: 1 } })
  return state !== null
}

export async function validateDatabaseIndexes(
  database: Db,
  manifest: IndexManifest
): Promise<void> {
  const expectedNames = Object.keys(manifest.collections).sort()
  const actual = await database
    .listCollections({}, { nameOnly: true })
    .toArray()
  const actualNames = actual
    .map((collection) => collection.name)
    .filter(
      (name) =>
        name !== REFRESH_METADATA_COLLECTION &&
        !name.startsWith("__refresh_stage_") &&
        !name.startsWith("__refresh_backup_")
    )
    .sort()

  if (JSON.stringify(expectedNames) !== JSON.stringify(actualNames)) {
    throw new Error("Integration database collections differ from its manifest")
  }

  for (const name of expectedNames) {
    const actualIndexes = await listIndexes(database, name)
    if (!sameIndexes(manifest.collections[name], actualIndexes)) {
      throw new Error(`Integration indexes differ from source for ${name}`)
    }
  }
}

export async function requireDatabaseRefreshManifest(
  database: Db
): Promise<void> {
  if (await hasActiveRefresh(database))
    throw new Error("Integration database refresh is in progress")
  const manifest = await readManifest(database)
  if (!manifest) throw new Error("Integration index manifest is missing")
  await validateDatabaseIndexes(database, manifest)
}

export async function refreshDatabase(
  config: DatabaseRefreshConfig
): Promise<{ runId: string; copiedCollections: number }> {
  validateConfig(config)
  const sourceClient = new MongoClient(config.sourceUri, {
    appName: "damaca-database-refresh-source",
    readPreference: "primary",
  })
  const targetClient = new MongoClient(config.targetUri, {
    appName: "damaca-database-refresh-target",
    retryWrites: true,
  })
  const runId = crypto.randomUUID()
  const batchSize = config.batchSize ?? 250
  const source = sourceClient.db(config.sourceDatabase)
  const target = targetClient.db(config.targetDatabase)
  const metadata = target.collection<RefreshMetadata>(
    REFRESH_METADATA_COLLECTION
  )
  let lock: RefreshLock | undefined
  let lockAcquired = false
  let swapStarted = false

  try {
    await Promise.all([sourceClient.connect(), targetClient.connect()])
    const previousManifestRecord = await metadata.findOne({
      _id: "index-manifest",
    })
    lock = {
      _id: "lock",
      runId,
      backups: [],
      previousManifest:
        (previousManifestRecord?.manifest as IndexManifest | undefined) ?? null,
    }
    await metadata.insertOne(lock)
    lockAcquired = true

    const staleTemporaryCollections = await target
      .listCollections(
        { name: /^__refresh_(?:stage|backup)_/ },
        { nameOnly: true }
      )
      .toArray()
    for (const collection of staleTemporaryCollections)
      await target.dropCollection(collection.name)

    const sourceInfos = await source
      .listCollections({}, { nameOnly: false })
      .toArray()
    const sourceNames = sourceInfos.map((collection) => collection.name).sort()
    const configuredNames = Object.keys(config.collections).sort()
    const undeclaredSourceNames = sourceNames.filter(
      (name) => !configuredNames.includes(name)
    )
    if (undeclaredSourceNames.length > 0) {
      throw new Error(
        `Source contains undeclared collections: ${undeclaredSourceNames.join(", ")}`
      )
    }
    if (sourceInfos.some((info) => info.type !== "collection"))
      throw new Error("Database views are not supported by the refresh engine")

    const targetInfos = await target
      .listCollections({}, { nameOnly: false })
      .toArray()
    const targetNames = targetInfos
      .map((collection) => collection.name)
      .filter((name) => name !== REFRESH_METADATA_COLLECTION)
      .sort()
    const targetUnexpected = targetNames.filter(
      (name) => !configuredNames.includes(name)
    )
    if (targetUnexpected.length > 0) {
      throw new Error(
        `Target contains undeclared collections: ${targetUnexpected.join(", ")}`
      )
    }

    const sourceSession = sourceClient.startSession({
      snapshot: true,
      causalConsistency: false,
    })
    const targetSession = targetClient.startSession({
      snapshot: true,
      causalConsistency: false,
    })
    const manifest: IndexManifest = {
      version: 1,
      sourceDatabase: config.sourceDatabase,
      createdAt: new Date().toISOString(),
      collections: {},
    }
    const staged: Array<{
      collection: string
      staging: string | null
      backup: string
      originalExists: boolean
    }> = []
    let stagingSequence = 0

    try {
      for (const info of sourceInfos) {
        const index = stagingSequence
        stagingSequence += 1
        const sourceIndexes = await source
          .collection(info.name)
          .listIndexes()
          .toArray()
        manifest.collections[info.name] = sourceIndexes.map((entry) => entry)
        const targetHasCollection = targetNames.includes(info.name)
        const copyFrom =
          config.collections[info.name] === "copy" ? source : target
        const session = copyFrom === source ? sourceSession : targetSession
        const targetInfo = targetHasCollection
          ? await target
              .listCollections({ name: info.name }, { nameOnly: false })
              .toArray()
              .then((items) => items[0])
          : undefined
        const collectionInfo =
          config.collections[info.name] === "preserve" && targetInfo
            ? { ...info, options: targetInfo.options }
            : info
        const staging = `__refresh_stage_${runId.slice(0, 8)}_${index}`
        const backup = `__refresh_backup_${runId.slice(0, 8)}_${index}`
        await createStagingCollection(
          target,
          collectionInfo,
          sourceIndexes,
          staging,
          config.sourceDatabase,
          copyFrom,
          session,
          batchSize
        )
        staged.push({
          collection: info.name,
          staging,
          backup,
          originalExists: targetHasCollection,
        })
      }

      for (const name of configuredNames) {
        if (sourceNames.includes(name)) continue
        const index = stagingSequence
        stagingSequence += 1
        const targetInfo = targetInfos.find((info) => info.name === name)
        if (!targetInfo) continue
        const mode = config.collections[name]
        const backup = `__refresh_backup_${runId.slice(0, 8)}_${index}`
        if (mode === "copy") {
          staged.push({
            collection: name,
            staging: null,
            backup,
            originalExists: true,
          })
          continue
        }

        const sourceIndexes = await target
          .collection(name)
          .listIndexes()
          .toArray()
        manifest.collections[name] = sourceIndexes.map((entry) => entry)
        const staging = `__refresh_stage_${runId.slice(0, 8)}_${index}`
        await createStagingCollection(
          target,
          targetInfo,
          sourceIndexes,
          staging,
          config.targetDatabase,
          target,
          targetSession,
          batchSize
        )
        staged.push({
          collection: name,
          staging,
          backup,
          originalExists: true,
        })
      }
    } finally {
      await Promise.all([
        sourceSession.endSession(),
        targetSession.endSession(),
      ])
    }

    const currentSourceNames = (
      await source.listCollections({}, { nameOnly: true }).toArray()
    )
      .map((collection) => collection.name)
      .sort()
    if (JSON.stringify(sourceNames) !== JSON.stringify(currentSourceNames)) {
      throw new Error("Source collections changed during the refresh")
    }
    for (const name of sourceNames) {
      const indexes = manifest.collections[name]
      const currentIndexes = await source
        .collection(name)
        .listIndexes()
        .toArray()
      if (!sameIndexes(indexes, currentIndexes)) {
        throw new Error(`Source indexes changed during the refresh: ${name}`)
      }
    }

    for (const entry of staged) {
      const nextLock: RefreshLock = {
        ...lock,
        backups: [
          ...lock.backups,
          {
            collection: entry.collection,
            backup: entry.backup,
            originalExists: entry.originalExists,
          },
        ],
      }
      await setLock(target, nextLock)
      swapStarted = true
      if (entry.originalExists) {
        await target.renameCollection(entry.collection, entry.backup)
      }
      if (entry.staging)
        await target.renameCollection(entry.staging, entry.collection)
      lock.backups = nextLock.backups
    }

    await validateDatabaseIndexes(target, manifest)
    await metadata.replaceOne(
      { _id: "index-manifest" },
      { _id: "index-manifest", manifest },
      { upsert: true }
    )
    await clearLock(target)
    await Promise.allSettled(
      staged.map((entry) =>
        entry.originalExists ? target.dropCollection(entry.backup) : undefined
      )
    )
    return {
      runId,
      copiedCollections: staged.filter(
        (entry) =>
          entry.staging && config.collections[entry.collection] === "copy"
      ).length,
    }
  } catch (error) {
    if (lockAcquired && !swapStarted && lock) {
      const stagingCollections = await target
        .listCollections({ name: /^__refresh_stage_/ }, { nameOnly: true })
        .toArray()
      await Promise.all(
        stagingCollections.map((entry) => target.dropCollection(entry.name))
      )
      await clearLock(target)
    }
    throw error
  } finally {
    await Promise.allSettled([sourceClient.close(), targetClient.close()])
  }
}

export async function restoreDatabaseRefresh(input: {
  targetUri: string
  targetDatabase: string
}): Promise<void> {
  const client = new MongoClient(input.targetUri, {
    appName: "damaca-database-refresh-recovery",
  })
  try {
    await client.connect()
    await restorePreviousRefresh(client.db(input.targetDatabase))
  } finally {
    await client.close()
  }
}

export async function restorePreviousRefresh(target: Db): Promise<void> {
  const lock = (await target
    .collection<RefreshMetadata>(REFRESH_METADATA_COLLECTION)
    .findOne({ _id: "lock" })) as RefreshLock | null
  if (!lock) throw new Error("There is no interrupted refresh to restore")

  for (const entry of [...lock.backups].reverse()) {
    const backupExists =
      (
        await target
          .listCollections({ name: entry.backup }, { nameOnly: true })
          .toArray()
      ).length > 0
    if (backupExists) {
      const currentExists =
        (
          await target
            .listCollections({ name: entry.collection }, { nameOnly: true })
            .toArray()
        ).length > 0
      if (currentExists) await target.dropCollection(entry.collection)
      await target.renameCollection(entry.backup, entry.collection)
    } else if (!entry.originalExists) {
      const currentExists =
        (
          await target
            .listCollections({ name: entry.collection }, { nameOnly: true })
            .toArray()
        ).length > 0
      if (currentExists) await target.dropCollection(entry.collection)
    }
  }
  const stagingCollections = await target
    .listCollections({ name: /^__refresh_stage_/ }, { nameOnly: true })
    .toArray()
  for (const staging of stagingCollections)
    await target.dropCollection(staging.name)
  if (lock.previousManifest) {
    await target
      .collection<RefreshMetadata>(REFRESH_METADATA_COLLECTION)
      .replaceOne(
        { _id: "index-manifest" },
        { _id: "index-manifest", manifest: lock.previousManifest },
        { upsert: true }
      )
  } else {
    await target
      .collection<RefreshMetadata>(REFRESH_METADATA_COLLECTION)
      .deleteOne({ _id: "index-manifest" })
  }
  await clearLock(target)
}
