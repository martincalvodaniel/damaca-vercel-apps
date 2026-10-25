import "server-only"

import { validateServiceUrl } from "@damaca/identity/hub-client"
import type { ConsumerConfiguration } from "@damaca/identity/server"

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} environment variable is required`)
  return value
}

export function getIdentityConfiguration(): ConsumerConfiguration {
  const baseUrl = required("BETTER_AUTH_URL")
  const hubUrl = required("DAMACA_HUB_URL")
  validateServiceUrl(baseUrl)
  validateServiceUrl(hubUrl)
  return {
    appId: "pocha-score",
    baseUrl,
    hubUrl,
    secret: required("BETTER_AUTH_SECRET"),
    clientId: required("DAMACA_HUB_CLIENT_ID"),
    clientSecret: required("DAMACA_HUB_CLIENT_SECRET"),
  }
}
