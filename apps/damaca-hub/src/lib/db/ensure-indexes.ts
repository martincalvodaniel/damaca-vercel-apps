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
    collection: "applications",
    keys: { id: 1 },
    options: { name: "application_id_unique", unique: true },
  },
  {
    collection: "app_access",
    keys: { appId: 1, email: 1 },
    options: { name: "app_id_asc_email_asc_unique", unique: true },
  },
  {
    collection: "app_access",
    keys: { appId: 1, status: 1, email: 1 },
    options: { name: "app_id_asc_status_asc_email_asc" },
  },
  {
    collection: "app_access",
    keys: { email: 1, appId: 1 },
    options: { name: "email_asc_app_id_asc" },
  },
  {
    collection: "user",
    keys: { email: 1 },
    options: { name: "auth_user_email_unique", unique: true },
  },
  {
    collection: "session",
    keys: { token: 1 },
    options: { name: "auth_session_token_unique", unique: true },
  },
  {
    collection: "session",
    keys: { userId: 1 },
    options: { name: "auth_session_user" },
  },
  {
    collection: "session",
    keys: { expiresAt: 1 },
    options: { name: "auth_session_expiry", expireAfterSeconds: 0 },
  },
  {
    collection: "account",
    keys: { providerId: 1, accountId: 1 },
    options: { name: "auth_account_provider_subject_unique", unique: true },
  },
  {
    collection: "account",
    keys: { userId: 1 },
    options: { name: "auth_account_user" },
  },
  {
    collection: "verification",
    keys: { identifier: 1 },
    options: { name: "auth_verification_identifier" },
  },
  {
    collection: "verification",
    keys: { expiresAt: 1 },
    options: { name: "auth_verification_expiry", expireAfterSeconds: 0 },
  },
  {
    collection: "jwks",
    keys: { createdAt: -1 },
    options: { name: "auth_jwks_created_desc" },
  },
  {
    collection: "oauthClient",
    keys: { clientId: 1 },
    options: { name: "oauth_client_id_unique", unique: true },
  },
  {
    collection: "oauthAccessToken",
    keys: { token: 1 },
    options: { name: "oauthAccessToken_token_unique", unique: true },
  },
  {
    collection: "oauthAccessToken",
    keys: { clientId: 1 },
    options: { name: "oauthAccessToken_clientId" },
  },
  {
    collection: "oauthAccessToken",
    keys: { sessionId: 1 },
    options: { name: "oauthAccessToken_sessionId" },
  },
  {
    collection: "oauthAccessToken",
    keys: { userId: 1 },
    options: { name: "oauthAccessToken_userId" },
  },
  {
    collection: "oauthAccessToken",
    keys: { authorizationCodeId: 1 },
    options: { name: "oauthAccessToken_authorizationCodeId" },
  },
  {
    collection: "oauthAccessToken",
    keys: { expiresAt: 1 },
    options: { name: "oauthAccessToken_expiry", expireAfterSeconds: 0 },
  },
  {
    collection: "oauthRefreshToken",
    keys: { token: 1 },
    options: { name: "oauthRefreshToken_token_unique", unique: true },
  },
  {
    collection: "oauthRefreshToken",
    keys: { clientId: 1 },
    options: { name: "oauthRefreshToken_clientId" },
  },
  {
    collection: "oauthRefreshToken",
    keys: { sessionId: 1 },
    options: { name: "oauthRefreshToken_sessionId" },
  },
  {
    collection: "oauthRefreshToken",
    keys: { userId: 1 },
    options: { name: "oauthRefreshToken_userId" },
  },
  {
    collection: "oauthRefreshToken",
    keys: { authorizationCodeId: 1 },
    options: { name: "oauthRefreshToken_authorizationCodeId" },
  },
  {
    collection: "oauthRefreshToken",
    keys: { expiresAt: 1 },
    options: { name: "oauthRefreshToken_expiry", expireAfterSeconds: 0 },
  },
  {
    collection: "oauthAccessToken",
    keys: { refreshId: 1 },
    options: { name: "oauth_access_refresh" },
  },
  {
    collection: "oauthConsent",
    keys: { clientId: 1, userId: 1 },
    options: { name: "oauth_consent_client_user" },
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
