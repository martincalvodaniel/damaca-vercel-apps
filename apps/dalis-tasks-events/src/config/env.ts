import "server-only"

import { resolveConsumerOrigin } from "@damaca/identity/origin"
import { parsePersonalIndexConnectionConfiguration } from "@/config/personal-index-provisioning"
import { syncDatabaseTestConfigSchema } from "@/schemas/sync-database-test"

type RequiredEnvName =
  | "BETTER_AUTH_SECRET"
  | "HUB_OIDC_CLIENT_ID"
  | "HUB_OIDC_CLIENT_SECRET"
  | "HUB_URL"
  | "MONGODB_URI"

function getRequiredEnv(name: RequiredEnvName): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} environment variable is required`)
  }

  return value
}

export function getAuthEnv() {
  const vercelEnvironment = process.env.VERCEL_ENV
  const environment = vercelEnvironment === "production" ? "production" : "int"
  return {
    appId: "dalis-tasks-events",
    baseUrl: resolveConsumerOrigin({
      environment,
      explicitUrl: process.env.BETTER_AUTH_URL,
      branchUrl: process.env.VERCEL_BRANCH_URL,
      productionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    }),
    clientId: getRequiredEnv("HUB_OIDC_CLIENT_ID"),
    clientSecret: getRequiredEnv("HUB_OIDC_CLIENT_SECRET"),
    environment,
    hubUrl: getRequiredEnv("HUB_URL"),
    secret: getRequiredEnv("BETTER_AUTH_SECRET"),
  }
}

export function getDatabaseEnv() {
  return {
    databaseName: process.env.MONGODB_DB?.trim() || "dalis-tasks-events",
    isDevelopment: process.env.NODE_ENV === "development",
    uri: getRequiredEnv("MONGODB_URI"),
  }
}

export function getPersonalIndexConnectionConfiguration() {
  return parsePersonalIndexConnectionConfiguration({
    mongodbUri: process.env.MONGODB_URI,
    databaseName: process.env.MONGODB_DB,
  })
}

export function getAuthDatabaseTestConfig() {
  if (process.env.RUN_AUTH_DB_TESTS !== "1") {
    return null
  }

  const databaseEnv = getDatabaseEnv()
  const host = new URL(databaseEnv.uri).hostname
  if (
    !databaseEnv.databaseName.startsWith("dalis-auth-test-") ||
    !["127.0.0.1", "localhost"].includes(host)
  ) {
    throw new Error(
      "Auth database tests require an isolated local test database"
    )
  }

  return { databaseName: databaseEnv.databaseName }
}

export function getSyncDatabaseTestConfig() {
  if (process.env.RUN_SYNC_DB_TESTS !== "1") return null
  const database = getDatabaseEnv()
  return syncDatabaseTestConfigSchema.parse({
    runId: process.env.SYNC_TEST_RUN_ID,
    port: Number(process.env.SYNC_TEST_PORT),
    mongodbUri: database.uri,
    mongodbDatabase: database.databaseName,
  })
}
