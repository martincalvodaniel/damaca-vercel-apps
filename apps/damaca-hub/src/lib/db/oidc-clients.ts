import "server-only"

import { createHash, randomBytes } from "node:crypto"
import type { Collection, Document } from "mongodb"
import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"
import { isPublicApplication } from "@/lib/db/hub"
import { oidcRedirectUriSchema } from "@/schemas/oidc"
import type { OidcClientSummary } from "@/types/access"

export interface ManagedOidcClient extends Document {
  appId: string
  environment: "production" | "int"
  clientId: string
  clientSecretHash: string
  redirectUri: string
  enabled: boolean
  revision: number
  createdAt: Date
  updatedAt: Date
}

async function clients(): Promise<Collection<ManagedOidcClient>> {
  return getCollection<ManagedOidcClient>(COLLECTION_NAMES.hubOidcClient)
}

export function hashOidcClientSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("base64url")
}

export async function findOidcClient(clientId: string) {
  const client = await (await clients()).findOne({ clientId })
  if (!client) return null
  const application = await (
    await getCollection<{ id: string; active: boolean }>(
      COLLECTION_NAMES.applications
    )
  ).findOne({ id: client.appId, active: true })
  return application ? client : null
}

export async function listOidcClients(): Promise<OidcClientSummary[]> {
  const documents = await (await clients())
    .find(
      {},
      {
        projection: {
          _id: 0,
          clientId: 1,
          appId: 1,
          environment: 1,
          redirectUri: 1,
          enabled: 1,
          revision: 1,
        },
      }
    )
    .sort({ appId: 1, environment: 1 })
    .toArray()
  return documents.map((entry) => ({
    clientId: entry.clientId,
    appId: entry.appId,
    environment: entry.environment,
    redirectUri: entry.redirectUri,
    enabled: entry.enabled,
    revision: entry.revision,
  }))
}

export async function createOidcClient(input: {
  appId: string
  environment: "production" | "int"
  redirectUri: string
}) {
  if (isPublicApplication(input.appId))
    throw new Error("Public applications cannot have OIDC clients")
  const redirectUri = oidcRedirectUriSchema.parse(input.redirectUri)
  const secret = randomBytes(32).toString("base64url")
  const clientId = `hub_${randomBytes(18).toString("base64url")}`
  const now = new Date()
  await (await clients()).insertOne({
    appId: input.appId,
    environment: input.environment,
    clientId,
    clientSecretHash: hashOidcClientSecret(secret),
    redirectUri,
    enabled: true,
    revision: 1,
    createdAt: now,
    updatedAt: now,
  })
  return { clientId, clientSecret: secret, redirectUri }
}

export async function updateOidcClient(input: {
  appId: string
  environment: "production" | "int"
  clientId: string
  revision: number
  operation: "update" | "enable" | "disable" | "rotate"
  redirectUri?: string
}) {
  if (isPublicApplication(input.appId))
    throw new Error("Public applications cannot have OIDC clients")
  const collection = await clients()
  const current = await collection.findOne({
    appId: input.appId,
    environment: input.environment,
    clientId: input.clientId,
    revision: input.revision,
  })
  if (!current) return null

  const nextSecret =
    input.operation === "rotate" ? randomBytes(32).toString("base64url") : null
  const set: Document = { updatedAt: new Date(), revision: input.revision + 1 }
  if (input.operation === "update")
    set.redirectUri = oidcRedirectUriSchema.parse(input.redirectUri)
  if (input.operation === "enable") set.enabled = true
  if (input.operation === "disable") set.enabled = false
  if (nextSecret) set.clientSecretHash = hashOidcClientSecret(nextSecret)
  const result = await collection.updateOne(
    { _id: current._id, revision: input.revision },
    { $set: set }
  )
  if (result.modifiedCount !== 1) return null
  if (input.operation === "disable" || nextSecret) {
    const accessTokens = await getCollection<Document>(
      COLLECTION_NAMES.oauthAccessToken
    )
    const refreshTokens = await getCollection<Document>(
      COLLECTION_NAMES.oauthRefreshToken
    )
    await Promise.all([
      accessTokens.deleteMany({ clientId: input.clientId }),
      refreshTokens.deleteMany({ clientId: input.clientId }),
    ])
  }
  return { revision: input.revision + 1, clientSecret: nextSecret }
}

export async function importLegacyOidcClient(input: {
  appId: string
  environment: "production" | "int"
  clientId: string
  clientSecret: string
  redirectUri: string
}) {
  if (isPublicApplication(input.appId)) return false
  const redirectUri = oidcRedirectUriSchema.parse(input.redirectUri)
  await (await clients()).updateOne(
    { clientId: input.clientId },
    {
      $setOnInsert: {
        appId: input.appId,
        environment: input.environment,
        clientId: input.clientId,
        clientSecretHash: hashOidcClientSecret(input.clientSecret),
        redirectUri,
        enabled: true,
        revision: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  )
  return true
}
