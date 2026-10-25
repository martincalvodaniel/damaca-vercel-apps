import { validateServiceUrl } from "./hub-client"

export interface ConsumerOriginConfiguration {
  environment: "production" | "int"
  explicitUrl?: string
  branchUrl?: string
  productionUrl?: string
}

export function resolveConsumerOrigin(
  configuration: ConsumerOriginConfiguration
): string {
  const candidate = configuration.explicitUrl?.trim()
    ? configuration.explicitUrl.trim()
    : configuration.environment === "production"
      ? configuration.productionUrl
      : configuration.branchUrl
  if (!candidate)
    throw new Error(
      `No stable ${configuration.environment} application URL is configured`
    )
  const normalized = /^https?:\/\//u.test(candidate)
    ? candidate
    : `https://${candidate}`
  const url = validateServiceUrl(normalized)
  if (url.pathname !== "/" || url.search || url.hash)
    throw new Error("Application origin must not include a path or query")
  return url.origin
}
