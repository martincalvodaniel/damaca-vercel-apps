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

  return "http://localhost:3009"
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
  return {
    databaseName: process.env.MONGODB_DB?.trim() || "damaca-digest",
    isDevelopment: process.env.NODE_ENV === "development",
    uri: getRequiredEnv("MONGODB_URI"),
  }
}

export function getChatGptClient() {
  const {
    CHATGPT_CLIENT_ID: id,
    CHATGPT_CLIENT_SECRET: secret,
    CHATGPT_REDIRECT_URI: redirectUri,
  } = process.env

  if (!id && !secret && !redirectUri) return
  if (!id || !secret || !redirectUri) {
    throw new Error("Incomplete ChatGPT client configuration")
  }
  const url = URL.parse(redirectUri)
  if (
    url?.origin !== "https://chatgpt.com" ||
    url.username ||
    url.password ||
    url.hash
  ) {
    throw new Error("Invalid ChatGPT redirect URI")
  }
  return { id, secret, redirectUri }
}

function boundedInteger(
  value: string | undefined,
  fallback: number,
  max: number
) {
  const parsed = Number(value)
  return value && Number.isInteger(parsed) && parsed > 0 && parsed <= max
    ? parsed
    : fallback
}

export function getArticleFetchEnv() {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY?.trim()
  return {
    enabled: {
      direct: process.env.ARTICLE_FETCH_DIRECT_ENABLED === "true",
      jina: process.env.ARTICLE_FETCH_JINA_ENABLED === "true",
      firecrawl:
        process.env.ARTICLE_FETCH_FIRECRAWL_ENABLED === "true" &&
        !!firecrawlKey,
    },
    hosts: new Set(
      (process.env.ARTICLE_FETCH_PROVIDER_HOSTS ?? "")
        .split(",")
        .map((host) => host.trim().toLowerCase())
        .filter(Boolean)
    ),
    totalMs: boundedInteger(
      process.env.ARTICLE_FETCH_TOTAL_TIMEOUT_MS,
      30_000,
      30_000
    ),
    providerMs: {
      direct: boundedInteger(
        process.env.ARTICLE_FETCH_DIRECT_TIMEOUT_MS,
        5_000,
        30_000
      ),
      jina: boundedInteger(
        process.env.ARTICLE_FETCH_JINA_TIMEOUT_MS,
        10_000,
        30_000
      ),
      firecrawl: boundedInteger(
        process.env.ARTICLE_FETCH_FIRECRAWL_TIMEOUT_MS,
        15_000,
        30_000
      ),
    },
    firecrawlDailyLimit: boundedInteger(
      process.env.ARTICLE_FETCH_FIRECRAWL_DAILY_LIMIT,
      10,
      10
    ),
    jinaKey: process.env.JINA_API_KEY?.trim(),
    firecrawlKey,
  }
}
