import "server-only"

type RequiredEnvName =
  | "BETTER_AUTH_SECRET"
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET"
  | "MONGODB_URI"

function getRequiredEnv(name: RequiredEnvName): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} environment variable is required`)
  }

  return value
}
function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url
}

function withHttps(host: string): string {
  return `https://${host}`
}

export function getAuthBaseUrl(): string {
  const explicit = process.env.BETTER_AUTH_URL?.trim()
  if (explicit) {
    return stripTrailingSlash(explicit)
  }

  const branchUrl = process.env.VERCEL_BRANCH_URL?.trim()
  if (branchUrl) {
    return stripTrailingSlash(withHttps(branchUrl))
  }

  const deploymentUrl = process.env.VERCEL_URL?.trim()
  if (deploymentUrl) {
    return stripTrailingSlash(withHttps(deploymentUrl))
  }

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (productionUrl) {
    return stripTrailingSlash(withHttps(productionUrl))
  }

  return "http://localhost:3005"
}

export function getAuthEnv() {
  return {
    allowedEmails: process.env.ALLOWED_EMAILS ?? "",
    baseUrl: getAuthBaseUrl(),
    googleClientId: getRequiredEnv("GOOGLE_CLIENT_ID"),
    googleClientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    secret: getRequiredEnv("BETTER_AUTH_SECRET"),
  }
}

export function getDatabaseEnv() {
  const indexMode = process.env.MONGODB_INDEX_MODE?.trim() || "ensure"
  if (indexMode !== "ensure" && indexMode !== "source-manifest") {
    throw new Error("MONGODB_INDEX_MODE must be ensure or source-manifest")
  }

  return {
    databaseName: process.env.MONGODB_DB?.trim() || "damaca-hub",
    indexMode,
    isDevelopment: process.env.NODE_ENV === "development",
    uri: getRequiredEnv("MONGODB_URI"),
  }
}

export function getDatabaseRefreshEnv() {
  const sourceUri = process.env.DATABASE_REFRESH_SOURCE_URI?.trim() ?? ""
  const targetUri = process.env.DATABASE_REFRESH_TARGET_URI?.trim() ?? ""
  const cronSecret = process.env.CRON_SECRET?.trim() ?? ""

  return {
    enabled: process.env.DATABASE_REFRESH_ENABLED?.trim() === "true",
    configured: Boolean(sourceUri && targetUri && cronSecret),
    sourceUri,
    targetUri,
    targetDatabase:
      process.env.DATABASE_REFRESH_TARGET_DB?.trim() || "damaca-hub-int",
    cronSecret,
  }
}

export function isProductionDeployment(): boolean {
  return process.env.VERCEL_ENV === "production"
}
