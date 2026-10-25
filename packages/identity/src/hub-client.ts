import { type AccessDecision, hubUserInfoSchema } from "./contract"

export interface HubConfiguration {
  appId: string
  hubUrl: string
  clientId: string
  clientSecret: string
}

export function validateServiceUrl(value: string): URL {
  const url = new URL(value)
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  if (
    (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  ) {
    throw new Error(
      "Service URL must be an HTTPS origin or loopback HTTP origin"
    )
  }
  return url
}

export async function checkHubAccess(
  configuration: HubConfiguration,
  accessToken: string,
  email: string
): Promise<AccessDecision> {
  try {
    const response = await fetch(
      new URL(
        "/api/auth/oauth2/userinfo",
        validateServiceUrl(configuration.hubUrl)
      ),
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(5000),
      }
    )
    if (response.status === 401 || response.status === 403) return "denied"
    if (!response.ok) return "unavailable"
    const decision = hubUserInfoSchema.parse(await response.json())
    if (
      decision.damaca_app_id !== configuration.appId ||
      decision.email.toLowerCase() !== email.toLowerCase()
    )
      return "denied"
    if (!decision.damaca_authorization_available) return "unavailable"
    return decision.damaca_access ? "approved" : "denied"
  } catch {
    return "unavailable"
  }
}
