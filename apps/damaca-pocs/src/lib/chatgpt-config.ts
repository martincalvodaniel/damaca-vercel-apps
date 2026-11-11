import "server-only"

import { getAuthEnv } from "@/config/env"

export const captureScope = "captures:write"
export const authPath = "/api/auth"
export const mcpPath = "/api/integrations/mcp"

export function getMcpUrls() {
  const base = new URL(getAuthEnv().baseURL).origin
  return {
    issuer: `${base}${authPath}`,
    resource: `${base}${mcpPath}`,
    metadata: `${base}/.well-known/oauth-protected-resource${mcpPath}`,
  }
}

export function getChatGptClient() {
  const {
    CHATGPT_CLIENT_ID: id,
    CHATGPT_CLIENT_SECRET: secret,
    CHATGPT_REDIRECT_URI: redirectUri,
  } = process.env

  if (!id || !secret || !redirectUri) return
  const url = URL.parse(redirectUri)
  if (url?.origin !== "https://chatgpt.com" || url.username || url.password) {
    throw new Error("Invalid ChatGPT redirect URI")
  }
  return { id, secret, redirectUri }
}
